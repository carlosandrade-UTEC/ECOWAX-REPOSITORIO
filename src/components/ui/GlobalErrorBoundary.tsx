import React, { ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

/**
 * Captura errores no controlados en la jerarquía de componentes React utilizando Sentry.ErrorBoundary.
 * Requisito: Mostrar "Ocurrió un error inesperado. El equipo ha sido notificado." sin mostrar stack trace al usuario.
 */
export function GlobalErrorBoundary({ children }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xs mx-auto">
              <AlertOctagon className="w-8 h-8 text-rose-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-white">
                Ocurrió un error inesperado.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                El equipo ha sido notificado.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
