import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';
import './index.css';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

// Inicializar Sentry únicamente si VITE_SENTRY_DSN está definido y es diferente de "none"
if (sentryDsn && sentryDsn !== 'none' && sentryDsn.trim() !== '') {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    // Sanitización estricta: NO enviar datos personales ni contenido de tablas
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
        delete event.user.id;
      }
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        delete event.request.headers;
      }
      if (event.extra) {
        // Eliminar posibles volcados de tablas o payloads
        Object.keys(event.extra).forEach((key) => {
          if (
            key.includes('tabla') ||
            key.includes('data') ||
            key.includes('rows') ||
            key.includes('skus')
          ) {
            delete event.extra[key];
          }
        });
      }
      return event;
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>
);
