// Server-only typed client for the FastAPI ML service.
// When ML_SERVICE_URL is unset, callers should use demo-fixtures instead
// (the API routes do this dispatch).

const BASE = process.env.ML_SERVICE_URL ?? process.env.BACKEND_URL;
const KEY = process.env.ML_SERVICE_API_KEY;

const ML_SERVICE_URL = BASE ?? "http://127.0.0.1:8000";

export const useDemoMode = !BASE;

export async function callML<T>(endpoint: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.ML_FETCH_TIMEOUT_MS ?? "240000");
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(KEY ? { "x-api-key": KEY } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(`ML_FETCH_FAILED: ${String(err)}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`ML Service Error [${endpoint}]:`, errorBody);
    throw new Error(`ML_SERVICE_FAILED: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
