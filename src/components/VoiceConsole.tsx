import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, Square } from "lucide-react";
import type { LocalizedContent } from "../data/profile";
import type { TranscriptEntry, VoiceConnectionStatus } from "../hooks/useLiveVoice";
import { AcousticCanvas } from "./AcousticCanvas";

interface VoiceConsoleProps {
  copy: LocalizedContent["console"];
  startLabel: string;
  status: VoiceConnectionStatus;
  isSpeaking: boolean;
  isMuted: boolean;
  micAvailable: boolean;
  error: string | null;
  durationSeconds: number;
  transcript: TranscriptEntry[];
  inputAnalyserRef: React.RefObject<AnalyserNode | null>;
  outputAnalyserRef: React.RefObject<AnalyserNode | null>;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onSendText: (text: string) => void;
  onClearError: () => void;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function VoiceConsole({
  copy,
  startLabel,
  status,
  isSpeaking,
  isMuted,
  micAvailable,
  error,
  durationSeconds,
  transcript,
  inputAnalyserRef,
  outputAnalyserRef,
  onStart,
  onStop,
  onToggleMute,
  onSendText,
  onClearError,
}: VoiceConsoleProps) {
  const [draft, setDraft] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [transcript]);

  const statusText =
    status === "connecting"
      ? copy.connecting
      : status === "connected"
        ? isSpeaking
          ? copy.speaking
          : isMuted || !micAvailable
            ? copy.muted
            : copy.listening
        : copy.ready;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSendText(draft.trim());
    setDraft("");
  };

  return (
    <div className="bg-[#F6F6F7] border border-zinc-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full min-h-[500px]">
      {/* Console Header Metadata */}
      <div className="flex items-baseline justify-between gap-4 pb-5 border-b border-zinc-200/80">
        <div>
          <p className="text-sm font-medium text-zinc-900">{statusText}</p>
          <p className="text-xs text-zinc-500 mt-1">{copy.voiceNote}</p>
        </div>
        <span className="text-xs font-medium text-zinc-500 tabular-nums shrink-0">
          {formatDuration(durationSeconds)}
        </span>
      </div>

      {/* Acoustic Instrument */}
      <div className="py-4 flex flex-col items-center">
        <AcousticCanvas
          status={status}
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          inputAnalyserRef={inputAnalyserRef}
          outputAnalyserRef={outputAnalyserRef}
        />

        {/* Session Controls */}
        <div className="mt-2 flex items-center justify-center gap-3">
          {status === "idle" ? (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
              <span>{startLabel}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleMute}
                disabled={status === "connecting" || !micAvailable}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-zinc-200 text-zinc-800 text-sm font-medium hover:bg-zinc-50 disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isMuted || !micAvailable ? (
                  <MicOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Mic className="w-4 h-4" aria-hidden="true" />
                )}
                <span>{isMuted || !micAvailable ? copy.unmute : copy.mute}</span>
              </button>

              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>{copy.end}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-lg bg-white border border-zinc-300 flex items-start justify-between gap-3 text-xs text-zinc-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onClearError}
            className="text-zinc-500 hover:text-zinc-900 font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editorial Live Transcript */}
      <div className="border-t border-zinc-200/80 pt-4 flex flex-col gap-4">
        <div
          aria-live="polite"
          className="h-36 overflow-y-auto pr-1 space-y-3.5 text-sm"
        >
          {transcript.length === 0 ? (
            <p className="text-zinc-500 leading-relaxed text-[13px]">
              {copy.emptyTranscript}
            </p>
          ) : (
            transcript.map((entry) => (
              <div key={entry.id} className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span
                    className={
                      entry.speaker === "bordeaux"
                        ? "font-medium text-zinc-800"
                        : "font-medium text-zinc-500"
                    }
                  >
                    {entry.speaker === "bordeaux" ? copy.assistantLabel : copy.visitorLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{entry.time}</span>
                </div>
                <p
                  className={
                    entry.speaker === "bordeaux"
                      ? "text-zinc-900 leading-relaxed"
                      : "text-zinc-600 leading-relaxed"
                  }
                >
                  {entry.text}
                </p>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Text-to-Voice Prompt Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 pt-3 border-t border-zinc-200/80"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.placeholder}
            className="flex-1 min-w-0 bg-white border border-zinc-200 rounded-lg px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label={copy.send}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-35 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{copy.send}</span>
            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
