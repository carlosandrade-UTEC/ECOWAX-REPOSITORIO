import { Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Estado vacío cuando una tabla o consulta no devuelve registros.
 * Requisito: Ícono y mensaje descriptivo, nunca una tabla en blanco.
 */
export function EmptyState({
  title = 'No hay información disponible',
  message = 'No se encontraron registros activos para esta vista o bajo los filtros seleccionados.',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md mx-auto my-8 space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
        <Database className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center px-4 py-2 bg-[#15803D] text-white text-xs font-bold rounded-xl hover:bg-[#14532D] transition-colors cursor-pointer shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
