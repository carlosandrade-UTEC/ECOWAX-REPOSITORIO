/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_TOKEN?: string;
  readonly VITE_GOOGLE_SHEETS_ID?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
