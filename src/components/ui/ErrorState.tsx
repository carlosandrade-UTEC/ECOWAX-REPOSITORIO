import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  errorMessage?: string;
  actionText?: string;
  onRetry?: () => void;
}

/**
 * Estado de error cuando falla la API o la conexión con el servidor.
 * Requisito: Mensaje "No se pudo conectar con el servidor. Intenta de nuevo." con botón de reintentar.
 */
export function ErrorState({
  title = 'Error de conexión con el servidor',
  errorMessage = 'No se pudo conectar con el servidor. Intenta de nuevo.',
  actionText = 'Reintentar',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl max-w-xl mx-auto my-8 text-rose-900 shadow-sm text-center">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-extrabold text-rose-950">{title}</h3>
      <p className="text-xs text-rose-800 mt-1.5 leading-relaxed font-medium">
        {errorMessage || 'No se pudo conectar con el servidor. Intenta de nuevo.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl hover:bg-rose-800 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
