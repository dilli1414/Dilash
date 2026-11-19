import "dotenv/config";
import express from "express";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { Modality } from "@google/genai";
import type { GoogleGenAI, LiveServerMessage } from "@google/genai";
import {
  buildBordeauxSystemInstruction,
  createGenAIClient,
  getGreetingPrompt,
  handleServerlessVoiceTurn,
  normalizeLang,
  type ServerlessVoiceRequest,
} from "./api/_bordeaux.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendJson(ws: WebSocket, payload: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: "12mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, assistant: "Bordeaux", mode: "live" });
  });

  app.post("/api/voice", async (req, res) => {
    try {
      const result = await handleServerlessVoiceTurn(
        (req.body ?? {}) as ServerlessVoiceRequest
      );
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to process voice request.";
      res.status(500).json({ error: message });
    }
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("connection", (clientWs, req) => {
    const requestUrl = new URL(req.url ?? "/live", "http://localhost");
    const lang = normalizeLang(requestUrl.searchParams.get("lang"));
    const shouldGreet = requestUrl.searchParams.get("greet") !== "0";

    let ai: GoogleGenAI;
    try {
      ai = createGenAIClient();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize Gemini client.";
      sendJson(clientWs, { type: "error", message });
      clientWs.close();
      return;
    }

    let isClosed = false;

    const sessionPromise = ai.live
      .connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Charon",
              },
            },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: buildBordeauxSystemInstruction(lang),
        },
        callbacks: {
          onopen: () => {
            sendJson(clientWs, { type: "ready", lang });
          },
          onmessage: (message: LiveServerMessage) => {
            if (isClosed) return;
            const content = message.serverContent;

            if (content?.inputTranscription?.text) {
              sendJson(clientWs, {
                type: "inputTranscript",
                text: content.inputTranscription.text,
              });
            }

            if (content?.outputTranscription?.text) {
              sendJson(clientWs, {
                type: "outputTranscript",
                text: content.outputTranscription.text,
              });
            }

            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendJson(clientWs, {
                  type: "audio",
                  data: part.inlineData.data,
                });
              }
            }

            if (content?.interrupted) {
              sendJson(clientWs, { type: "interrupted" });
            }

            if (content?.turnComplete) {
              sendJson(clientWs, { type: "turnComplete" });
            }
          },
          onerror: (err: unknown) => {
            const errorMessage =
              err instanceof Error
                ? err.message
                : typeof err === "object" && err !== null && "message" in err
                  ? String((err as { message: unknown }).message)
                  : "Live voice connection error.";
            sendJson(clientWs, { type: "error", message: errorMessage });
          },
          onclose: () => {
            if (!isClosed) {
              sendJson(clientWs, { type: "closed" });
              clientWs.close();
            }
          },
        },
      })
      .then((session) => {
        if (isClosed) {
          session.close();
          return null;
        }
        if (shouldGreet) {
          session.sendRealtimeInput({
            text: getGreetingPrompt(lang),
          });
        }
        return session;
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to connect to live voice session.";
        sendJson(clientWs, { type: "error", message });
        clientWs.close();
        return null;
      });

    clientWs.on("message", (rawData) => {
      let parsed: { type?: string; data?: string; text?: string };
      try {
        parsed = JSON.parse(rawData.toString()) as {
          type?: string;
          data?: string;
          text?: string;
        };
      } catch {
        return;
      }

      void sessionPromise.then((session) => {
        if (!session || isClosed) return;
        if (parsed.type === "audio" && typeof parsed.data === "string") {
          session.sendRealtimeInput({
            audio: {
              data: parsed.data,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        } else if (
          parsed.type === "text" &&
          typeof parsed.text === "string" &&
          parsed.text.trim()
        ) {
          session.sendRealtimeInput({
            text: parsed.text.trim(),
          });
        }
      });
    });

    clientWs.on("close", () => {
      isClosed = true;
      void sessionPromise.then((session) => {
        try {
          session?.close();
        } catch {
          // Session already closed
        }
      });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Bordeaux voice assistant running on http://0.0.0.0:${port}`);
  });
}

void startServer();
