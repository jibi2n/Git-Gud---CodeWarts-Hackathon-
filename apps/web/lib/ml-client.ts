// Server-only typed client for the FastAPI ML service.
// When ML_SERVICE_URL is unset, callers should use demo-fixtures instead
// (the API routes do this dispatch).

const BASE = process.env.ML_SERVICE_URL ?? process.env.BACKEND_URL;
const KEY = process.env.ML_SERVICE_API_KEY;

const ML_SERVICE_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export const useDemoMode = false;

export async function callML<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`ML Service Error [${endpoint}]:`, errorBody);
    throw new Error(`ML_SERVICE_FAILED: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
