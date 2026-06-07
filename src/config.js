const API_BASE_URL_ENV = import.meta.env.VITE_API_BASE_URL;

// Strict check for production
if (import.meta.env.PROD && !API_BASE_URL_ENV) {
  throw new Error("VITE_API_BASE_URL is not set in production environment");
}

export const API_BASE_URL = API_BASE_URL_ENV || 'http://localhost:5000';

// Party Room service — in production this points to the same backend on Render
// which hosts both the REST API and the WebSocket /party/ws/ routes.
const PARTY_API_URL_ENV = import.meta.env.VITE_PARTY_URL;
export const PARTY_API_URL = PARTY_API_URL_ENV || API_BASE_URL;

// WebSocket URL — derived from PARTY_API_URL, converting http(s) to ws(s)
function deriveWsUrl(httpUrl) {
  try {
    const url = new URL(httpUrl);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
  } catch {
    // Fallback: derive from current page
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
}

export const PARTY_WS_URL = deriveWsUrl(PARTY_API_URL);

// Legacy exports — kept for any remaining references
export const WS_HOST = new URL(PARTY_API_URL).host;
export const WS_URL = PARTY_WS_URL;
