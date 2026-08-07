import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatoPorcentaje, formatoEntero, formatoNumero } from '../../engine/formato';

interface KpiCardProps {
  kpiKey: string;
  nombre: string;
  valorActual: number | null;
  meta: number;
  unidad: string; // 'ratio' | 'dias' | 'conteo'
  estado: 'VERDE' | 'AMBAR' | 'ROJO' | 'SIN_DATO';
  variacion?: number; // p.ej +0.02
  descripcionMeta?: string;
  subtexto?: string;
}

export function KpiCard({
  kpiKey,
  nombre,
  valorActual,
  meta,
  unidad,
  estado,
  variacion,
  descripcionMeta,
  subtexto,
}: KpiCardProps) {
  const navigate = useNavigate();

  const formatearValor = (val: number | null) => {
    if (val === null || val === undefined) return 'sin dato';
    if (unidad === 'ratio') return formatoPorcentaje(val, 1);
    if (unidad === 'dias') return `${formatoNumero(val, 1)} días`;
    return formatoEntero(val);
  };

  const formatearMeta = (m: number) => {
    if (unidad === 'ratio') return formatoPorcentaje(m, 0);
    if (unidad === 'dias') return `${m} días`;
    return `${m}`;
  };

  let borderClass = 'border-slate-200 hover:border-slate-300';
  let badgeColor = 'bg-slate-100 text-slate-700';

  if (estado === 'VERDE') {
    borderClass = 'border-emerald-200 hover:border-emerald-300 bg-white';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (estado === 'AMBAR') {
    borderClass = 'border-amber-200 hover:border-amber-300 bg-white';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (estado === 'ROJO') {
    borderClass = 'border-rose-200 hover:border-rose-300 bg-white';
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
  }

  return (
    <div
      onClick={() => navigate(`/kpi/${kpiKey}`)}
      className={`p-5 rounded-2xl border ${borderClass} border-l-4 border-l-[#15803D] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between bg-white`}
    >
      <div>
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {nombre}
          </span>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#15803D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-3xl font-bold text-slate-900 tracking-tight font-sans">
            {formatearValor(valorActual)}
          </div>
          {variacion !== undefined && (
            <div className="flex items-center text-xs font-bold text-slate-600">
              {variacion > 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              ) : variacion < 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 mr-1" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400 mr-1" />
              )}
              <span className={variacion > 0 ? 'text-emerald-600' : variacion < 0 ? 'text-rose-600' : 'text-slate-500'}>
                {variacion > 0 ? `+${(variacion * 100).toFixed(1)}%` : `${(variacion * 100).toFixed(1)}%`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="text-slate-500 font-medium">
          Meta: <span className="font-bold text-slate-700">{descripcionMeta || formatearMeta(meta)}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
          {estado === 'VERDE' ? 'Aceptable' : estado === 'AMBAR' ? 'Alerta' : estado === 'ROJO' ? 'Crítico' : 'Sin Dato'}
        </span>
      </div>
      {subtexto && (
        <p className="mt-1.5 text-[11px] text-slate-500 italic truncate font-medium">{subtexto}</p>
      )}
    </div>
  );
}
