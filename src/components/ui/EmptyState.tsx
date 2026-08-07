import { Info } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  lastEvaluationTime?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No hay información disponible',
  message = 'No se encontraron registros activos bajo los filtros seleccionados.',
  lastEvaluationTime = '06/08/2026 06:00',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500">
        <Info className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-600 mt-1">{message}</p>
      {lastEvaluationTime && (
        <p className="text-[11px] text-slate-400 mt-2 font-mono">
          Última evaluación del motor: <span className="font-semibold text-slate-600">{lastEvaluationTime}</span>
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-1.5 bg-[#15803D] text-white text-xs font-medium rounded-lg hover:bg-[#14532D] transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
