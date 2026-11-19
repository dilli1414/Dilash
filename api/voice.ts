import {
  handleServerlessVoiceTurn,
  type ServerlessVoiceRequest,
} from "./_bordeaux.js";

interface SimpleReq {
  method?: string;
  body?: unknown;
}

interface SimpleRes {
  status: (code: number) => SimpleRes;
  json: (body: unknown) => void;
}

export default async function handler(req: SimpleReq, res: SimpleRes): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body =
      typeof req.body === "string"
        ? (JSON.parse(req.body) as ServerlessVoiceRequest)
        : ((req.body ?? {}) as ServerlessVoiceRequest);

    const result = await handleServerlessVoiceTurn(body);
    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process voice request.";
    res.status(500).json({ error: message });
  }
}
