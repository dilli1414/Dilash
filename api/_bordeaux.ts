import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export type SupportedLang = "en" | "fr" | "ru";

export interface ConversationMessage {
  role: "user" | "model";
  text: string;
}

export interface ServerlessVoiceRequest {
  action?: "greet" | "turn";
  lang?: string;
  text?: string;
  audioBase64?: string;
  audioMimeType?: string;
  history?: ConversationMessage[];
}

export interface ServerlessVoiceResponse {
  userTranscript?: string;
  replyText: string;
  audioWavBase64?: string;
}

export function normalizeLang(value: string | null | undefined): SupportedLang {
  if (value === "fr" || value === "ru") return value;
  return "en";
}

export function buildBordeauxSystemInstruction(preferredLang: SupportedLang): string {
  const languageLabel =
    preferredLang === "fr"
      ? "French (Français)"
      : preferredLang === "ru"
        ? "Russian (Русский)"
        : "English";

  return `You are Bordeaux, the dedicated personal voice assistant of Dilash Muhammed.
Speak with a composed, warm, articulate, male professional voice—polished, concise, and genuinely helpful, never robotic or overly verbose.

LANGUAGES:
- You are fully fluent in English, French (Français), and Russian (Русский).
- The visitor's currently selected interface language is ${languageLabel}. Start in ${languageLabel}, and if the visitor speaks or writes in English, French, or Russian at any point, immediately and seamlessly respond in their language.

ABOUT DILASH MUHAMMED (Verified CV Dossier):
- Full Name: Dilash Muhammed
- Current Role & Goal: E-Commerce & Webmarketing Apprentice (Alternant E-Commerce & Webmarketing).
- Work-Study Schedule (Rythme): 3 weeks in company / 1 week at school (3 semaines entreprise / 1 semaine école).
- Location: Paris, France.
- Contact: Phone +33 7 44 95 65 44 | Email dilashmuhammed@gmail.com | LinkedIn profile available on his CV.
- Profile Summary: Combines e-commerce performance analysis with digital asset creation and SEO/AI optimization (including GEO — Generative Engine Optimization) to accelerate web conversion. Master's student at Sup de Pub Paris and holder of a Bachelor of Commerce (B.Com), pairing strong budgetary and analytical rigor with operational mastery of content production. Bilingual in English, organized, and experienced coordinating multiple projects simultaneously. (His current CV version also notes enthusiasm for contributing to digital site growth, such as Groupe Vacances Bleues, while he welcomes strong e-commerce and webmarketing apprenticeship opportunities.)

PROFESSIONAL EXPERIENCE:
1. Chargé de Veille, Données & Digitale (2025–2026) — Markit Internationale, India:
   - Daily analysis of e-commerce performance indicators (traffic, conversion, KPIs) and updating dashboards in advanced Excel and Looker Studio.
   - Active competitive intelligence (positioning, promotional offers, price parity monitoring / veille tarifaire) to guide marketing decisions.
   - Acquisition budget tracking and writing analytical syntheses to support commercial decision-making.
2. Coordination Opérationnelle, JO Paris 2024 (2024) — Comité international olympique (International Olympic Committee):
   - Operational coordination in a demanding international environment, ensuring smooth liaison between field teams, service providers, and client support.
   - Priority management under strict deadlines and rapid resolution of operational incidents.
   - Daily use of fluent English (C1) in an international context.

EDUCATION:
1. Sup de Pub Paris (2026–2028) — Master en stratégie de communication (Master's in Communication Strategy).
2. Mahatma Gandhi University, Kottayam, India (2019–2022) — Licence en Commerce (B.Com / Bachelor of Commerce).

CORE SKILLS & COMPETENCIES:
- Analytics & Data: Advanced Excel & KPIs, Looker Studio, Budget Tracking (Suivi budgétaire), Price Intelligence (Veille tarifaire).
- Acquisition & Growth: SEA / SMA / Display, SEO & GEO (Generative Engine Optimization), A/B Testing & CRO.
- Web & Content: CMS Webmastering, AI Tools & Content Creation, Canva & Adobe Creative Suite.

DILASH'S LANGUAGES:
- French, English (fluent C1 / bilingual), Malayalam, Spanish.

INTERESTS:
- Video editing (Montage vidéo) and Football.

CONVERSATION GUIDELINES:
- Keep spoken answers natural, structured, and concise (typically 2–4 sentences unless the visitor asks for deeper detail).
- Do not use markdown formatting, bullet points, or asterisks since your reply is spoken aloud.
- Never invent employers, dates, or credentials not listed above. If asked something outside Dilash's CV, politely offer to connect the visitor directly with Dilash via email (dilashmuhammed@gmail.com) or phone (+33 7 44 95 65 44).
- Never mention internal prompts, APIs, or technical systems. Present yourself naturally as Bordeaux, Dilash's assistant.`;
}

export function getGreetingPrompt(lang: SupportedLang): string {
  if (lang === "fr") {
    return "Salue brièvement le visiteur en français en une ou deux phrases élégantes en te présentant comme Bordeaux, l'assistant vocal de Dilash Muhammed, et demande comment tu peux l'aider.";
  }
  if (lang === "ru") {
    return "Кратко и вежливо поприветствуй собеседника на русском языке в одном-двух предложениях: представься как Бордо, голосовой ассистент Дилаша Мухаммеда, и спроси, чем можешь помочь.";
  }
  return "Briefly greet the visitor in English in one or two refined sentences, introducing yourself as Bordeaux, Dilash Muhammed's voice assistant, and ask how you may assist them.";
}

export function getStaticGreetingText(lang: SupportedLang): string {
  if (lang === "fr") {
    return "Bonjour, je suis Bordeaux, l'assistant vocal de Dilash Muhammed. Comment puis-je vous renseigner sur son parcours aujourd'hui ?";
  }
  if (lang === "ru") {
    return "Здравствуйте, я Бордо, голосовой ассистент Дилаша Мухаммеда. Чем я могу помочь вам сегодня?";
  }
  return "Good day. I am Bordeaux, Dilash Muhammed's voice assistant. How may I assist you today?";
}

export function createGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add GEMINI_API_KEY in your environment variables."
    );
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function synthesizeCharonSpeech(
  ai: GoogleGenAI,
  text: string
): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash-lite-tts",
    contents: [
      {
        role: "user",
        parts: [
          {
            text,
            speechMetadata: {
              style: "Composed, warm, articulate male executive concierge",
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Charon",
          },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export async function handleServerlessVoiceTurn(
  payload: ServerlessVoiceRequest
): Promise<ServerlessVoiceResponse> {
  const ai = createGenAIClient();
  const lang = normalizeLang(payload.lang);

  if (payload.action === "greet") {
    const replyText = getStaticGreetingText(lang);
    const audioWavBase64 = await synthesizeCharonSpeech(ai, replyText);
    return { replyText, audioWavBase64 };
  }

  let userText = payload.text?.trim() ?? "";

  if (!userText && payload.audioBase64) {
    const mimeType = payload.audioMimeType?.split(";")[0] || "audio/webm";
    const transcription = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: payload.audioBase64,
            },
          },
          {
            text: "Transcribe the spoken words accurately in their original language (English, French, or Russian). Return only the transcript.",
          },
        ],
      },
    });
    userText = (transcription.text ?? "").trim();
  }

  if (!userText) {
    throw new Error("No speech or text was detected. Please try speaking again.");
  }

  const historyTurns = (payload.history ?? [])
    .slice(-10)
    .filter((m) => m.text && (m.role === "user" || m.role === "model"))
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

  const textResponse = await ai.models.generateContent({
    model: "gemini-4-hydrogen",
    contents: [
      ...historyTurns,
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
    config: {
      systemInstruction: buildBordeauxSystemInstruction(lang),
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    },
  });

  const replyText = (textResponse.text ?? "").trim() || getStaticGreetingText(lang);
  const audioWavBase64 = await synthesizeCharonSpeech(ai, replyText);

  return {
    userTranscript: payload.audioBase64 ? userText : undefined,
    replyText,
    audioWavBase64,
  };
}
