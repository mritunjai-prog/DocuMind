/**
 * REST API base URL (no trailing slash). Production sets `VITE_API_BASE_URL`
 * in the hosting provider; local dev defaults to the FastAPI app on port 8001.
 */
const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    "",
);

export const API_BASE_URL =
    fromEnv ||
    (import.meta.env.DEV ? "http://localhost:8001/api/v1" : "");
