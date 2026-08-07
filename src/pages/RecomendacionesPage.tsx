import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Recomendacion } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import { formatoFechaISOAFormatoPeruano, formatoNumero } from '../engine/formato';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import {
  CheckSquare,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sliders,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export function RecomendacionesPage() {
  const navigate = useNavigate();
  const { recomendaciones, skus, proveedores, getPermiso, loading, error, loadInitialData } = useAppStore();
  const permiso = getPermiso('recomendaciones');

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={loadInitialData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#15803D]" />
            <span>Recomendaciones Explicables de Compra (S&OP)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Propuestas automatizadas generadas por el motor de reorden para evaluación y defensa ante el comité.
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          Versión Regla: <strong>RB-2026.08</strong>
        </span>
      </div>

      {recomendaciones.length === 0 ? (
        <EmptyState
          title="No hay recomendaciones registradas"
          message="El motor no ha generado propuestas de compra pendientes de evaluación para el periodo activo."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recomendaciones.map((rec) => {
          const skuInfo = skus.find((s) => s.sku_id === rec.sku_id);
          const provRec = proveedores.find((p) => p.proveedor_id === rec.proveedor_recomendado);
          const capitalUsd = skuInfo ? Math.round(rec.cantidad_recomendada * skuInfo.precio_referencia_usd) : 0;

          return (
            <div
              key={rec.reco_id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="font-mono font-extrabold text-xs text-slate-900">{rec.reco_id}</span>
                    <span className="text-xs text-slate-400 ml-2 font-semibold">[{rec.periodo}]</span>
                  </div>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border font-mono ${
                      rec.estado === 'PENDIENTE'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : rec.estado === 'APROBADA'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rec.estado === 'MODIFICADA'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {rec.estado}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Insumo / SKU:</span>
                    <span className="font-extrabold text-slate-900">{rec.sku_id}</span>
                    <p className="text-[10px] text-slate-500 font-sans truncate">{skuInfo?.nombre}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Cantidad Sugerida:</span>
                    <span className="font-black text-indigo-700 text-sm">
                      {formatoNumero(rec.cantidad_recomendada, 0)} {rec.unidad}
                    </span>
                    {capitalUsd > 0 && (
                      <p className="text-[10px] text-emerald-700 font-bold font-mono">
                        ~ USD ${formatoNumero(capitalUsd, 0)}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Proveedor Recomendado:</span>
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{provRec?.nombre || rec.proveedor_recomendado}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-sans block">Fecha Límite:</span>
                    <span className="font-bold text-slate-900">
                      {formatoFechaISOAFormatoPeruano(rec.fecha_limite_emision)}
                    </span>
                  </div>
                </div>

                {/* Resumen de Riesgos */}
                <div className="space-y-1 text-xs">
                  <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-lg text-rose-900 text-[11px]">
                    <strong className="text-rose-950 font-bold block mb-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Riesgo de NO comprar:
                    </strong>
                    {rec.riesgo_no_comprar}
                  </div>
                </div>
              </div>

              {/* Botón Principal para ir a la Pantalla de Defensa / Detalles con Simulador */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  Confianza: <strong className="text-slate-700">{rec.nivel_confianza}</strong>
                </span>

                <button
                  onClick={() => navigate(`/recomendaciones/${rec.reco_id}`)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5 text-xs"
                >
                  <span>Defender Recomendación & Simulador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
