import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageCode } from "../data/profile";
import {
  INPUT_SAMPLE_RATE,
  OUTPUT_SAMPLE_RATE,
  computeAnalyserLevel,
  float32ToPcm16Base64,
  pcm16Base64ToFloat32,
  resampleFloat32,
} from "../utils/audio";

export type VoiceConnectionStatus = "idle" | "connecting" | "connected";
type TransportMode = "live" | "serverless";

export interface TranscriptEntry {
  id: string;
  speaker: "visitor" | "bordeaux";
  text: string;
  time: string;
}

interface UseLiveVoiceResult {
  status: VoiceConnectionStatus;
  isSpeaking: boolean;
  isMuted: boolean;
  micAvailable: boolean;
  error: string | null;
  durationSeconds: number;
  transcript: TranscriptEntry[];
  inputAnalyserRef: React.RefObject<AnalyserNode | null>;
  outputAnalyserRef: React.RefObject<AnalyserNode | null>;
  startSession: (options?: { initialPrompt?: string }) => Promise<void>;
  stopSession: () => void;
  toggleMute: () => void;
  sendTextPrompt: (text: string) => Promise<void>;
  clearError: () => void;
}

function formatClockTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read recorded audio."));
    reader.readAsDataURL(blob);
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function useLiveVoice(language: LanguageCode): UseLiveVoiceResult {
  const [status, setStatus] = useState<VoiceConnectionStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [micAvailable, setMicAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const modeRef = useRef<TransportMode>("live");
  const sessionTokenRef = useRef(0);

  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const speechActiveRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const serverlessBusyRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const isMutedRef = useRef(false);
  const isConnectedRef = useRef(false);
  const turnFinalizedRef = useRef(true);
  const pendingPromptRef = useRef<string | null>(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const clearScheduledPlayback = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source already stopped
      }
    }
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const appendTranscriptChunk = useCallback(
    (speaker: "visitor" | "bordeaux", chunk: string, forceNewEntry = false) => {
      if (!chunk || (!chunk.trim() && forceNewEntry)) return;

      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (!forceNewEntry && last && last.speaker === speaker && !turnFinalizedRef.current) {
          return [...prev.slice(0, -1), { ...last, text: `${last.text}${chunk}` }];
        }

        const initialText = chunk.trimStart();
        if (!initialText) return prev;

        turnFinalizedRef.current = false;
        return [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            speaker,
            text: initialText,
            time: formatClockTime(),
          },
        ];
      });
    },
    []
  );

  const scheduleAudioChunk = useCallback((base64Pcm: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const samples = pcm16Base64ToFloat32(base64Pcm);
    if (samples.length === 0) return;

    const buffer = ctx.createBuffer(1, samples.length, OUTPUT_SAMPLE_RATE);
    buffer.getChannelData(0).set(samples);

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    if (outputAnalyserRef.current) {
      source.connect(outputAnalyserRef.current);
    } else {
      source.connect(ctx.destination);
    }

    const now = ctx.currentTime;
    const startTime = Math.max(now + 0.015, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    activeSourcesRef.current.add(source);
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0) {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      }
    };
  }, []);

  const playWavBase64 = useCallback(async (base64Wav: string, token: number) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx || token !== sessionTokenRef.current) return;

    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => undefined);
    }

    const arrayBuffer = base64ToArrayBuffer(base64Wav);
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    if (token !== sessionTokenRef.current) return;

    clearScheduledPlayback();
    const source = ctx.createBufferSource();
    source.buffer = decoded;
    if (outputAnalyserRef.current) {
      source.connect(outputAnalyserRef.current);
    } else {
      source.connect(ctx.destination);
    }

    activeSourcesRef.current.add(source);
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    await new Promise<void>((resolve) => {
      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0) {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        }
        resolve();
      };
      source.start(0);
    });
  }, [clearScheduledPlayback]);

  const callServerlessVoice = useCallback(
    async (
      payload: {
        action?: "greet" | "turn";
        text?: string;
        audioBase64?: string;
        audioMimeType?: string;
      },
      token: number
    ) => {
      if (token !== sessionTokenRef.current) return;
      serverlessBusyRef.current = true;

      try {
        const history = transcriptRef.current.slice(-10).map((entry) => ({
          role: entry.speaker === "bordeaux" ? "model" : "user",
          text: entry.text,
        }));

        const response = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            lang: language,
            history,
          }),
        });

        const data = (await response.json()) as {
          userTranscript?: string;
          replyText?: string;
          audioWavBase64?: string;
          error?: string;
        };

        if (token !== sessionTokenRef.current) return;

        if (!response.ok) {
          throw new Error(data.error || "Unable to reach Bordeaux right now.");
        }

        if (data.userTranscript) {
          appendTranscriptChunk("visitor", data.userTranscript, true);
          turnFinalizedRef.current = true;
        }

        if (data.replyText) {
          appendTranscriptChunk("bordeaux", data.replyText, true);
          turnFinalizedRef.current = true;
        }

        if (data.audioWavBase64) {
          await playWavBase64(data.audioWavBase64, token);
        }
      } catch (err) {
        if (token === sessionTokenRef.current) {
          setError(
            err instanceof Error ? err.message : "Unable to reach Bordeaux right now."
          );
        }
      } finally {
        if (token === sessionTokenRef.current) {
          serverlessBusyRef.current = false;
        }
      }
    },
    [appendTranscriptChunk, language, playWavBase64]
  );

  const cleanupResources = useCallback(() => {
    sessionTokenRef.current += 1;
    isConnectedRef.current = false;
    pendingPromptRef.current = null;
    serverlessBusyRef.current = false;
    speechActiveRef.current = false;
    silenceStartRef.current = null;
    clearScheduledPlayback();

    if (vadIntervalRef.current !== null) {
      window.clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Recorder already stopped
      }
      mediaRecorderRef.current = null;
    }
    recordedChunksRef.current = [];

    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      try {
        processorRef.current.disconnect();
      } catch {
        // Already disconnected
      }
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop();
      }
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      void inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      void outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  }, [clearScheduledPlayback]);

  const stopSession = useCallback(() => {
    cleanupResources();
    setStatus("idle");
    setIsMuted(false);
    isMutedRef.current = false;
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setDurationSeconds(0);
  }, [cleanupResources]);

  const startServerlessVadLoop = useCallback(
    (micStream: MediaStream, token: number) => {
      if (typeof MediaRecorder === "undefined") return;

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];
      const mimeType =
        preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";

      const beginUtteranceCapture = () => {
        if (
          token !== sessionTokenRef.current ||
          mediaRecorderRef.current?.state === "recording"
        ) {
          return;
        }
        recordedChunksRef.current = [];
        const recorder = mimeType
          ? new MediaRecorder(micStream, { mimeType })
          : new MediaRecorder(micStream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) {
            recordedChunksRef.current.push(ev.data);
          }
        };

        recorder.onstop = () => {
          const chunks = recordedChunksRef.current;
          recordedChunksRef.current = [];
          if (token !== sessionTokenRef.current || chunks.length === 0) return;

          const audioBlob = new Blob(chunks, {
            type: recorder.mimeType || mimeType || "audio/webm",
          });
          if (audioBlob.size < 1800) return;

          void blobToBase64(audioBlob).then((audioBase64) => {
            void callServerlessVoice(
              {
                action: "turn",
                audioBase64,
                audioMimeType: audioBlob.type || "audio/webm",
              },
              token
            );
          });
        };

        recorder.start(250);
      };

      const finishUtteranceCapture = () => {
        speechActiveRef.current = false;
        silenceStartRef.current = null;
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      };

      vadIntervalRef.current = window.setInterval(() => {
        if (token !== sessionTokenRef.current) return;
        if (isMutedRef.current || isSpeakingRef.current || serverlessBusyRef.current) {
          if (speechActiveRef.current) {
            speechActiveRef.current = false;
            silenceStartRef.current = null;
            if (mediaRecorderRef.current?.state === "recording") {
              recordedChunksRef.current = [];
              mediaRecorderRef.current.stop();
            }
          }
          return;
        }

        const level = computeAnalyserLevel(inputAnalyserRef.current);
        const now = Date.now();

        if (level > 0.14) {
          if (!speechActiveRef.current) {
            speechActiveRef.current = true;
            beginUtteranceCapture();
          }
          silenceStartRef.current = null;
        } else if (speechActiveRef.current) {
          if (silenceStartRef.current === null) {
            silenceStartRef.current = now;
          } else if (now - silenceStartRef.current > 1100) {
            finishUtteranceCapture();
          }
        }
      }, 120);
    },
    [callServerlessVoice]
  );

  const startSession = useCallback(
    async (options?: { initialPrompt?: string }) => {
      cleanupResources();
      const token = sessionTokenRef.current;
      setError(null);
      setStatus("connecting");
      setDurationSeconds(0);
      setIsMuted(false);
      isMutedRef.current = false;
      turnFinalizedRef.current = true;

      const initialPrompt = options?.initialPrompt?.trim() || null;
      pendingPromptRef.current = initialPrompt;

      // Detect whether server supports live WebSocket (/live) or Vercel serverless (/api/voice)
      let detectedMode: TransportMode = "live";
      try {
        const healthRes = await fetch("/api/health");
        if (healthRes.ok) {
          const healthData = (await healthRes.json()) as { mode?: string };
          if (healthData.mode === "serverless") {
            detectedMode = "serverless";
          }
        }
      } catch {
        // Default to live WebSocket attempt
      }
      if (token !== sessionTokenRef.current) return;
      modeRef.current = detectedMode;

      // Initialize 24kHz output AudioContext within user gesture (with device-rate fallback)
      let outputCtx: AudioContext;
      try {
        outputCtx = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE });
      } catch {
        outputCtx = new AudioContext();
      }
      const outputAnalyser = outputCtx.createAnalyser();
      outputAnalyser.fftSize = 256;
      outputAnalyser.smoothingTimeConstant = 0.78;
      outputAnalyser.connect(outputCtx.destination);
      outputAudioCtxRef.current = outputCtx;
      outputAnalyserRef.current = outputAnalyser;
      if (outputCtx.state === "suspended") {
        await outputCtx.resume().catch(() => undefined);
      }

      // Request microphone access (fallback gracefully to listen + text mode if unavailable)
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setMicAvailable(true);
      } catch {
        setMicAvailable(false);
        if (!initialPrompt) {
          setError(
            "Microphone access was declined. You can still type a question below to hear Bordeaux respond."
          );
        }
      }

      if (token !== sessionTokenRef.current) {
        micStream?.getTracks().forEach((t) => t.stop());
        return;
      }

      if (micStream) {
        mediaStreamRef.current = micStream;
        let inputCtx: AudioContext;
        try {
          inputCtx = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
        } catch {
          inputCtx = new AudioContext();
        }
        if (inputCtx.state === "suspended") {
          await inputCtx.resume().catch(() => undefined);
        }
        inputAudioCtxRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(micStream);
        const inputAnalyser = inputCtx.createAnalyser();
        inputAnalyser.fftSize = 256;
        inputAnalyser.smoothingTimeConstant = 0.75;
        inputAnalyserRef.current = inputAnalyser;

        if (detectedMode === "live") {
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          const silentGain = inputCtx.createGain();
          silentGain.gain.value = 0;

          source.connect(inputAnalyser);
          inputAnalyser.connect(processor);
          processor.connect(silentGain);
          silentGain.connect(inputCtx.destination);

          processor.onaudioprocess = (event) => {
            if (!isConnectedRef.current || isMutedRef.current) return;
            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) return;

            const rawSamples = event.inputBuffer.getChannelData(0);
            const resampled = resampleFloat32(
              rawSamples,
              inputCtx.sampleRate,
              INPUT_SAMPLE_RATE
            );
            const base64 = float32ToPcm16Base64(resampled);
            ws.send(JSON.stringify({ type: "audio", data: base64 }));
          };
        } else {
          source.connect(inputAnalyser);
        }
      }

      // Serverless Voice Mode (Vercel)
      if (detectedMode === "serverless") {
        isConnectedRef.current = true;
        setStatus("connected");

        if (micStream) {
          startServerlessVadLoop(micStream, token);
        }

        if (initialPrompt) {
          appendTranscriptChunk("visitor", initialPrompt, true);
          turnFinalizedRef.current = true;
          await callServerlessVoice({ action: "turn", text: initialPrompt }, token);
        } else {
          await callServerlessVoice({ action: "greet" }, token);
        }
        return;
      }

      // Real-Time WebSocket Live Mode (Node.js / Cloud Run / AI Studio)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const greetFlag = initialPrompt ? "0" : "1";
      const wsUrl = `${protocol}//${window.location.host}/live?lang=${encodeURIComponent(
        language
      )}&greet=${greetFlag}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        let msg: { type?: string; data?: string; text?: string; message?: string };
        try {
          msg = JSON.parse(String(event.data)) as {
            type?: string;
            data?: string;
            text?: string;
            message?: string;
          };
        } catch {
          return;
        }

        if (msg.type === "ready") {
          isConnectedRef.current = true;
          setStatus("connected");
          if (pendingPromptRef.current) {
            const promptToSend = pendingPromptRef.current;
            pendingPromptRef.current = null;
            appendTranscriptChunk("visitor", promptToSend, true);
            turnFinalizedRef.current = true;
            ws.send(JSON.stringify({ type: "text", text: promptToSend }));
          }
        } else if (msg.type === "audio" && typeof msg.data === "string") {
          scheduleAudioChunk(msg.data);
        } else if (msg.type === "inputTranscript" && typeof msg.text === "string") {
          appendTranscriptChunk("visitor", msg.text);
        } else if (msg.type === "outputTranscript" && typeof msg.text === "string") {
          appendTranscriptChunk("bordeaux", msg.text);
        } else if (msg.type === "interrupted") {
          clearScheduledPlayback();
          turnFinalizedRef.current = true;
        } else if (msg.type === "turnComplete") {
          turnFinalizedRef.current = true;
        } else if (msg.type === "error") {
          setError(msg.message ?? "Unable to reach Bordeaux right now.");
          cleanupResources();
          setStatus("idle");
        } else if (msg.type === "closed") {
          cleanupResources();
          setStatus("idle");
        }
      };

      ws.onerror = () => {
        setError("Voice connection interrupted. Please try starting the conversation again.");
        cleanupResources();
        setStatus("idle");
      };

      ws.onclose = () => {
        if (isConnectedRef.current) {
          cleanupResources();
          setStatus("idle");
        }
      };
    },
    [
      appendTranscriptChunk,
      callServerlessVoice,
      cleanupResources,
      clearScheduledPlayback,
      language,
      scheduleAudioChunk,
      startServerlessVadLoop,
    ]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      return next;
    });
  }, []);

  const sendTextPrompt = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (status === "connected") {
        if (modeRef.current === "serverless") {
          clearScheduledPlayback();
          appendTranscriptChunk("visitor", trimmed, true);
          turnFinalizedRef.current = true;
          await callServerlessVoice(
            { action: "turn", text: trimmed },
            sessionTokenRef.current
          );
          return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearScheduledPlayback();
          appendTranscriptChunk("visitor", trimmed, true);
          turnFinalizedRef.current = true;
          wsRef.current.send(JSON.stringify({ type: "text", text: trimmed }));
          return;
        }
      }

      await startSession({ initialPrompt: trimmed });
    },
    [
      appendTranscriptChunk,
      callServerlessVoice,
      clearScheduledPlayback,
      startSession,
      status,
    ]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (status !== "connected") return;
    const interval = window.setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  return {
    status,
    isSpeaking,
    isMuted,
    micAvailable,
    error,
    durationSeconds,
    transcript,
    inputAnalyserRef,
    outputAnalyserRef,
    startSession,
    stopSession,
    toggleMute,
    sendTextPrompt,
    clearError,
  };
}
