interface SimpleReq {
  method?: string;
}

interface SimpleRes {
  status: (code: number) => SimpleRes;
  json: (body: unknown) => void;
}

export default function handler(_req: SimpleReq, res: SimpleRes): void {
  res.status(200).json({
    ok: true,
    assistant: "Bordeaux",
    mode: "serverless",
  });
}
