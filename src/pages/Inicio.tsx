import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { KpiCard } from '../components/ui/KpiCard';
import { CriticidadBadge, AbcBadge } from '../components/ui/Badge';
import { LoadingSkeleton, LoadingKpiGrid } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatoFechaISOAFormatoPeruano, formatoNumero } from '../engine/formato';
import { ordenarAlertasPorCriticidad } from '../engine';
import {
  AlertTriangle,
  Clock,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

export function Inicio() {
  const navigate = useNavigate();
  const { alertas, recomendaciones, reorden, loading, error, loadInitialData } = useAppStore();

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingKpiGrid />
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={loadInitialData} />;
  }

  // Filtrar alertas activas (NUEVA o EN_PROCESO) y ordenar por criticidad
  const alertasActivas = ordenarAlertasPorCriticidad(
    alertas.filter((a) => a.estado === 'NUEVA' || a.estado === 'EN_PROCESO')
  );

  // Recomendaciones pendientes
  const recosPendientes = recomendaciones.filter((r) => r.estado === 'PENDIENTE');

  // Próximas órdenes a emitir (de las recomendaciones pendientes)
  const proximasOrdenes = [...recosPendientes].sort((a, b) =>
    a.fecha_limite_emision.localeCompare(b.fecha_limite_emision)
  );

  // Calcular días restantes hasta fecha límite desde 06/08/2026
  const hoyBase = new Date('2026-08-06');
  const getDiasRestantes = (fechaLim: string) => {
    const f = new Date(fechaLim);
    const diffTime = f.getTime() - hoyBase.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
            <span>Diagnóstico Ejecutivo en 10 Segundos</span>
            <span>•</span>
            <span className="text-slate-400">Actualizado: 06/08/2026</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
            Resumen Ejecutivo de Abastecimiento PosCosecha
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Campaña activa: <strong className="text-emerald-400">Cítricos (Sur) / Palta (Centro)</strong>. Próximo inicio de ventana de compra para la campaña de <strong className="text-amber-300">Mango (Norte)</strong>. lead time promedio Brasil: 47 a 57 días.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href="/presentacion.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Ver Presentación ECOWAX</span>
            <ChevronRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Ver Dashboard Completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Tarjetas de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          kpiKey="fill_rate_clase_a"
          nombre="Fill Rate Insumos Clase A"
          valorActual={0.856}
          meta={0.95}
          unidad="ratio"
          estado="ROJO"
          variacion={-0.041}
          subtexto="Órdenes de Carnauba y Resina recibidas incompletas"
        />
        <KpiCard
          kpiKey="cobertura_pico_dias"
          nombre="Cobertura Promedio Clase A"
          valorActual={39.2}
          meta={75}
          unidad="dias"
          estado="ROJO"
          variacion={-0.1}
          subtexto="Nivel crítico para Carnauba (37 días de inventario)"
        />
        <KpiCard
          kpiKey="pct_compras_urgentes"
          nombre="% Compras Urgentes"
          valorActual={0.444}
          meta={0.10}
          unidad="ratio"
          estado="ROJO"
          variacion={0.194}
          subtexto="4 de 9 órdenes emitidas en modalidad de urgencia"
        />
        <KpiCard
          kpiKey="sku_bajo_rop"
          nombre="SKU Clase A Bajo ROP"
          valorActual={1}
          meta={0}
          unidad="conteo"
          estado="ROJO"
          subtexto="INS-001 Carnauba T1 por debajo del Punto de Reorden"
        />
      </div>

      {/* Paneles Informativos de Excepción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Alertas Activas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Alertas Activas ({alertasActivas.length})
                </h3>
              </div>
              <button
                onClick={() => navigate('/alertas')}
                className="text-xs text-[#15803D] hover:text-[#14532D] font-medium flex items-center cursor-pointer"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {alertasActivas.slice(0, 3).map((alerta) => (
                <div
                  key={alerta.alerta_id}
                  onClick={() => navigate('/alertas')}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{alerta.sku_id}</span>
                    <CriticidadBadge criticidad={alerta.criticidad} />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{alerta.motivo}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Límite: {formatoFechaISOAFormatoPeruano(alerta.fecha_limite_emision)}</span>
                    <span className="text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.5 rounded">
                      Cob: {alerta.cobertura_actual_dias} días
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Decisiones Pendientes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#15803D]" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Decisiones Pendientes ({recosPendientes.length})
                </h3>
              </div>
              <button
                onClick={() => navigate('/recomendaciones')}
                className="text-xs text-[#15803D] hover:text-[#14532D] font-medium flex items-center cursor-pointer"
              >
                <span>Aprobar/Modificar</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {recosPendientes.map((rec) => {
                const diasRestantes = getDiasRestantes(rec.fecha_limite_emision);
                return (
                  <div
                    key={rec.reco_id}
                    onClick={() => navigate('/recomendaciones')}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {rec.sku_id} ({rec.cantidad_recomendada} {rec.unidad})
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          diasRestantes <= 20
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {diasRestantes} días restantes
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{rec.riesgo_no_comprar}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Prov: {rec.proveedor_recomendado}</span>
                      <span className="text-blue-700 font-semibold">Confianza: {rec.nivel_confianza}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 3: Próximas Órdenes a Emitir */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Próximas Órdenes a Emitir
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Orden por Límite</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {proximasOrdenes.map((ord) => (
                <div
                  key={ord.reco_id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{ord.sku_id}</span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {formatoNumero(ord.cantidad_recomendada, 0)} {ord.unidad}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Proveedor: {ord.proveedor_recomendado}</span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {formatoFechaISOAFormatoPeruano(ord.fecha_limite_emision)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic truncate">
                    {ord.supuestos}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
