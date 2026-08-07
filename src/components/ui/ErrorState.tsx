import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  errorMessage: string;
  actionText?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Fallo en la carga de datos de abastecimiento',
  errorMessage,
  actionText = 'Reintentar consulta',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl max-w-xl mx-auto my-6 text-rose-900">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-rose-950">{title}</h3>
          <p className="text-xs text-rose-800 mt-1 leading-relaxed">
            Detalle del fallo: <span className="font-mono bg-rose-100 px-1 py-0.5 rounded text-[11px]">{errorMessage}</span>
          </p>
          <p className="text-xs text-rose-700 mt-2">
            Acción recomendada: Verifique su conexión de red local y presione reintentar para volver a sincronizar con el proveedor de datos de ECOWAX.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-700 text-white text-xs font-semibold rounded-lg hover:bg-rose-800 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{actionText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
