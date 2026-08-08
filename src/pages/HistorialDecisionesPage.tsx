import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Unauthorized403 } from './Unauthorized403';
import { formatoNumero } from '../engine/formato';
import {
  History,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Zap,
  Filter,
  User,
  RefreshCw,
  FileText,
} from 'lucide-react';

export function HistorialDecisionesPage() {
  const { decisiones, skus, usuarios, getPermiso } = useAppStore();
  const permiso = getPermiso('decisiones');

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  // CÁLCULO DE INDICADORES KPI SUPERIORES
  const totalDecisiones = decisiones.length;

  // 1. % aprobadas sin cambios
  const aprobadasSinCambios = decisiones.filter(
    (d) => d.accion === 'APROBADA' || (d.accion as string) === 'APROBADO' || d.desviacion_pct === 0
  ).length;
  const pctAprobadasSinCambios = totalDecisiones > 0 ? (aprobadasSinCambios / totalDecisiones) * 100 : 0;

  // 2. Desviación promedio % (de decisiones con desviación)
  const decisionesConDesviacion = decisiones.filter((d) => d.desviacion_pct !== 0);
  const sumaDesviaciones = decisionesConDesviacion.reduce(
    (acc, curr) => acc + Math.abs(curr.desviacion_pct),
    0
  );
  const desvPromedioPct =
    decisionesConDesviacion.length > 0
      ? (sumaDesviaciones / decisionesConDesviacion.length) * 100
      : 0;

  // 3. % decisiones que terminaron en compra urgente posterior
  const comprasUrgentesPost = decisiones.filter(
    (d) => d.resultado_posterior === 'COMPRA_URGENTE_POSTERIOR'
  ).length;
  const pctComprasUrgentesPost = totalDecisiones > 0 ? (comprasUrgentesPost / totalDecisiones) * 100 : 0;

  // Filtros locales
  const [skuFilter, setSkuFilter] = React.useState<string>('TODOS');
  const [accionFilter, setAccionFilter] = React.useState<string>('TODOS');

  const decisionesFiltradas = decisiones.filter((d) => {
    if (skuFilter !== 'TODOS' && d.sku_id !== skuFilter) return false;
    if (accionFilter !== 'TODOS' && d.accion !== accionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-[#15803D]" />
            <span>Historial y Feedback Loop de Decisiones S&OP</span>
          </h2>
          <p className="text-xs text-slate-500">
            Registro auditable de decisiones humanas frente a recomendaciones del motor y calibración continua de parámetros
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          Total Auditado: <strong>{totalDecisiones} registros</strong>
        </span>
      </div>

      {/* Banner Explicativo Feedback Loop */}
      <div className="bg-[#14532D] text-white p-4 rounded-xl shadow-xs space-y-1.5 border border-green-800 text-xs">
        <div className="flex items-center space-x-2 font-extrabold text-green-200">
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span>Feedback Loop de Inteligencia de Negocio</span>
        </div>
        <p className="text-green-100 font-sans leading-relaxed text-[11px]">
          Esta pantalla registra el contraste entre lo sugerido por los algoritmos de reorden y lo ejecutado finalmente por la Jefatura. Las variaciones sistemáticas alimentan la recalibración de parámetros (stock de seguridad, lead time P90 y coeficiente Z) en las revisiones mensuales S&OP.
        </p>
      </div>

      {/* 3 INDICADORES KPI SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              % Aprobadas Sin Cambios
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900">
              {pctAprobadasSinCambios.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">({aprobadasSinCambios}/{totalDecisiones})</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Tasa de adherencia directa a las propuestas del motor.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Desviación Promedio %
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-amber-700">
              {desvPromedioPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">variación vol.</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Ajuste porcentual medio aplicado en decisiones modificadas.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              % Compras Urgentes Post.
            </span>
            <Zap className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-rose-700">
              {pctComprasUrgentesPost.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">({comprasUrgentesPost}/{totalDecisiones})</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Decisiones de recorte que forzaron compras de emergencia posteriores.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2 text-slate-500 font-semibold">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filtrar Historial:</span>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mr-1.5 font-medium">SKU:</label>
          <select
            value={skuFilter}
            onChange={(e) => setSkuFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos los SKUs</option>
            {skus.map((s) => (
              <option key={s.sku_id} value={s.sku_id}>
                {s.sku_id} - {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mr-1.5 font-medium">Acción:</label>
          <select
            value={accionFilter}
            onChange={(e) => setAccionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="TODOS">Todas las acciones</option>
            <option value="APROBADA">APROBADA</option>
            <option value="MODIFICADA">MODIFICADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 font-mono text-[11px]">
          Mostrando <strong className="text-slate-900">{decisionesFiltradas.length}</strong> decisiones
        </div>
      </div>

      {/* VISTA MÓVIL EN TARJETAS PARA CELULARES (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {decisionesFiltradas.map((dec) => {
          const skuInfo = skus.find((s) => s.sku_id === dec.sku_id);
          const usuarioInfo = usuarios.find((u) => u.usuario_id === dec.usuario_id) || {
            nombre: dec.usuario_id,
            rol: 'JEFATURA_LOGISTICA',
          };
          const desvPctNum = dec.desviacion_pct * 100;

          return (
            <div key={dec.decision_id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono block">Periodo {dec.periodo}</span>
                  <div className="font-extrabold text-sm text-slate-900 font-mono">{dec.sku_id}</div>
                  <p className="text-[11px] text-slate-500 font-sans truncate">{skuInfo?.nombre}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    dec.accion === 'APROBADA' || (dec.accion as string) === 'APROBADO'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : dec.accion === 'MODIFICADA'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {dec.accion}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Cant. Recomendada:</span>
                  <span className="font-bold text-slate-700">{formatoNumero(dec.cantidad_recomendada, 0)} {skuInfo?.unidad || 'kg'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Cant. Final:</span>
                  <span className="font-black text-emerald-700">{formatoNumero(dec.cantidad_final, 0)} {skuInfo?.unidad || 'kg'}</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Desviación:</span>
                  <span className={`font-mono font-bold ${desvPctNum === 0 ? 'text-slate-400' : desvPctNum < 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                    {desvPctNum === 0 ? '0.0%' : desvPctNum > 0 ? `+${desvPctNum.toFixed(1)}%` : `${desvPctNum.toFixed(1)}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Usuario / Rol:</span>
                  <span className="font-bold text-slate-800">{usuarioInfo.nombre}</span>
                </div>
              </div>

              {(dec.motivo_desviacion || dec.comentario) && (
                <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-700 italic font-sans">
                  "{dec.motivo_desviacion || dec.comentario}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TABLA PRINCIPAL DE DECISIONES PARA PANTALLAS MEDIANAS/GRANDES (>= 640px) */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3.5 px-4">Periodo</th>
                <th className="py-3.5 px-3">SKU / Nombre</th>
                <th className="py-3.5 px-3">Acción</th>
                <th className="py-3.5 px-3 text-right">Cant. Rec.</th>
                <th className="py-3.5 px-3 text-right">Cant. Final</th>
                <th className="py-3.5 px-3 text-center">Desviación %</th>
                <th className="py-3.5 px-4">Motivo / Comentario</th>
                <th className="py-3.5 px-3">Usuario</th>
                <th className="py-3.5 px-4 text-center">Resultado Posterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {decisionesFiltradas.map((dec) => {
                const skuInfo = skus.find((s) => s.sku_id === dec.sku_id);
                const usuarioInfo = usuarios.find((u) => u.usuario_id === dec.usuario_id) || {
                  nombre: dec.usuario_id,
                  rol: 'JEFATURA_LOGISTICA',
                };

                const desvPctNum = dec.desviacion_pct * 100;

                return (
                  <tr key={dec.decision_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {dec.periodo}
                      <span className="block text-[10px] text-slate-400 font-normal">{dec.decision_id}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900 font-mono">{dec.sku_id}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {skuInfo?.nombre || 'Insumo'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          dec.accion === 'APROBADA' || (dec.accion as string) === 'APROBADO'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : dec.accion === 'MODIFICADA'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {dec.accion}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">
                      {formatoNumero(dec.cantidad_recomendada, 0)} {skuInfo?.unidad || 'kg'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-[#15803D]">
                      {formatoNumero(dec.cantidad_final, 0)} {skuInfo?.unidad || 'kg'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      <span
                        className={`${
                          desvPctNum === 0
                            ? 'text-slate-400'
                            : desvPctNum < 0
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {desvPctNum > 0 ? `+${desvPctNum.toFixed(1)}%` : `${desvPctNum.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 text-[11px] font-mono">
                        {dec.motivo_desviacion}
                      </div>
                      <p className="text-[10px] text-slate-500 italic line-clamp-2 mt-0.5">
                        "{dec.comentario}"
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900 text-[11px] flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{usuarioInfo.nombre}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono block">
                        {usuarioInfo.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded border font-mono ${
                          dec.resultado_posterior === 'SIN_QUIEBRE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : dec.resultado_posterior === 'QUIEBRE_PARCIAL'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : dec.resultado_posterior === 'COMPRA_URGENTE_POSTERIOR'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {dec.resultado_posterior}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
