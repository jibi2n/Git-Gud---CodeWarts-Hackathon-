// Server-only typed client for the FastAPI ML service.
// When ML_SERVICE_URL is unset, callers should use demo-fixtures instead
// (the API routes do this dispatch).

const BASE = process.env.ML_SERVICE_URL;
const KEY = process.env.ML_SERVICE_API_KEY;

export const useDemoMode = !BASE;

export async function callML<TRes>(path: string, body: unknown): Promise<TRes> {
  if (!BASE) {
    throw new Error("ML_SERVICE_URL is not set; use demo fixtures instead.");
  }
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(KEY ? { "x-api-key": KEY } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) {
    throw new Error(`ml ${path} ${r.status}`);
  }
  return (await r.json()) as TRes;
}
