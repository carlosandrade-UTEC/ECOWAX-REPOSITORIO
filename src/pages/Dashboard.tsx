import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { KpiCard } from '../components/ui/KpiCard';
import { CriticidadBadge, AbcBadge, SemaforoBadge } from '../components/ui/Badge';
import { FilterBar } from '../components/ui/FilterBar';
import { LoadingSkeleton, LoadingKpiGrid } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { ConsumoVsVolumenChart } from '../components/charts/ConsumoVsVolumenChart';
import { OtifZonaChart } from '../components/charts/OtifZonaChart';
import { formatoFechaISOAFormatoPeruano, formatoNumero, formatoPorcentaje } from '../engine/formato';
import { ordenarAlertasPorCriticidad } from '../engine';
import { dataProvider } from '../services/dataProvider';
import { ConsumoMensual, ToneladasFruta, Pronostico } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  History,
  Info,
  ChevronRight,
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const {
    skus,
    alertas,
    recomendaciones,
    decisiones,
    kpis,
    zonas,
    filters,
    loading,
    error,
    loadInitialData,
  } = useAppStore();

  const [selectedSkuId, setSelectedSkuId] = React.useState<string>('INS-001');
  const [consumoHistorico, setConsumoHistorico] = React.useState<ConsumoMensual[]>([]);
  const [toneladasFruta, setToneladasFruta] = React.useState<ToneladasFruta[]>([]);
  const [pronosticos, setPronosticos] = React.useState<Pronostico[]>([]);

  React.useEffect(() => {
    Promise.all([
      dataProvider.getConsumoMensual(),
      dataProvider.getToneladasFruta(),
      dataProvider.getPronosticos(),
    ]).then(([consumo, fruta, pron]) => {
      setConsumoHistorico(consumo);
      setToneladasFruta(fruta);
      setPronosticos(pron);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingKpiGrid />
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={loadInitialData} />;
  }

  // Filtrar SKUs según clase ABC y proveedor en filtro global
  let skusFiltrados = skus;
  if (filters.claseAbc && filters.claseAbc !== 'TODOS') {
    skusFiltrados = skusFiltrados.filter((s) => s.clase_abc === filters.claseAbc);
  }
  if (filters.proveedorId) {
    skusFiltrados = skusFiltrados.filter((s) => s.proveedor_default === filters.proveedorId);
  }

  // BLOQUE 3: Alertas activas ordenadas por criticidad y fecha límite (NUNCA alfabéticamente)
  const alertasOrdenadas = ordenarAlertasPorCriticidad(alertas);

  // Calcular gráfico de consumo histórico + pronóstico con banda de confianza
  const consumoSku = consumoHistorico.filter((c) => c.sku_id === selectedSkuId);
  const pronosticosSku = pronosticos.filter((p) => p.sku_id === selectedSkuId);

  // Unir para el gráfico de proyección
  const dataProyeccionMap = new Map<string, any>();

  consumoSku.forEach((c) => {
    dataProyeccionMap.set(c.periodo, {
      periodo: c.periodo,
      historico: c.cantidad,
      pronostico: null,
      bandaInferior: null,
      bandaSuperior: null,
    });
  });

  pronosticosSku.forEach((p) => {
    const existing = dataProyeccionMap.get(p.periodo) || { periodo: p.periodo };
    dataProyeccionMap.set(p.periodo, {
      ...existing,
      pronostico: p.valor_esperado,
      bandaInferior: p.limite_inferior,
      bandaSuperior: p.limite_superior,
      bandaRango: [p.limite_inferior, p.limite_superior],
    });
  });

  const dataProyeccionChart = Array.from(dataProyeccionMap.values()).sort((a, b) =>
    a.periodo.localeCompare(b.periodo)
  );

  const selectedSku = skus.find((s) => s.sku_id === selectedSkuId);

  const hoyBase = new Date('2026-08-06');
  const getDiasRestantes = (fechaLim: string) => {
    const f = new Date(fechaLim);
    const diffTime = f.getTime() - hoyBase.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <FilterBar />

      {/* BLOQUE 1: ESTADO — Fila de KPI con semáforo */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Activity className="w-4 h-4 text-[#15803D]" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Estado — Indicadores Clave de Operación
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            kpiKey="fill_rate_clase_a"
            nombre="Fill Rate Insumos Clase A"
            valorActual={0.856}
            meta={0.95}
            unidad="ratio"
            estado="ROJO"
            variacion={-0.041}
            subtexto="Líneas entregadas completas por proveedores"
          />
          <KpiCard
            kpiKey="cobertura_pico_dias"
            nombre="Cobertura en Campaña Pico"
            valorActual={39.2}
            meta={75}
            unidad="dias"
            estado="ROJO"
            variacion={-0.1}
            subtexto="Días de inventario disponible en planta"
          />
          <KpiCard
            kpiKey="pct_compras_urgentes"
            nombre="% Compras Urgentes"
            valorActual={0.444}
            meta={0.10}
            unidad="ratio"
            estado="ROJO"
            variacion={0.194}
            subtexto="OCs fuera del horizonte de planificación"
          />
          <KpiCard
            kpiKey="mape_pronostico"
            nombre="MAPE del Pronóstico"
            valorActual={0.186}
            meta={0.15}
            unidad="ratio"
            estado="AMBAR"
            variacion={0.02}
            subtexto="Error medio porcentual absoluto de demanda"
          />
        </div>
      </section>

      {/* BLOQUE 2: PROYECCIÓN — Gráfico Consumo Histórico (24m) + Pronóstico 6m con Banda de Confianza */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#15803D]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Proyección de Demanda e Histórico de Consumo (24 Meses)
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <label className="text-slate-600 font-medium">Seleccionar Insumo:</label>
            <select
              value={selectedSkuId}
              onChange={(e) => setSelectedSkuId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-green-600/20"
            >
              {skusFiltrados.map((s) => (
                <option key={s.sku_id} value={s.sku_id}>
                  {s.sku_id} — {s.nombre} ({s.clase_abc})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-3">
            <span>Insumo: <strong className="text-slate-900">{selectedSku?.nombre}</strong> ({selectedSku?.categoria})</span>
            <span className="font-mono bg-green-50 text-[#15803D] border border-green-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
              Consumo prom. 12m: {formatoNumero(33.13, 1)} kg/día
            </span>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataProyeccionChart} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="periodo" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    value ? `${formatoNumero(Number(value), 1)} ${selectedSku?.unidad || 'kg'}` : '-',
                    name === 'historico'
                      ? 'Consumo Real Histórico'
                      : name === 'pronostico'
                      ? 'Pronóstico Base'
                      : name,
                  ]}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                {/* Banda de Confianza */}
                <Area
                  type="monotone"
                  dataKey="bandaRango"
                  name="Banda de Confianza 95%"
                  fill="#c7d2fe"
                  stroke="none"
                  fillOpacity={0.4}
                />

                {/* Línea Histórica */}
                <Line
                  type="monotone"
                  dataKey="historico"
                  name="Consumo Real (Histórico 24m)"
                  stroke="#1e1b4b"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#1e1b4b' }}
                />

                {/* Línea Pronóstico */}
                <Line
                  type="monotone"
                  dataKey="pronostico"
                  name="Pronóstico (6 Meses Futuros)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#4f46e5' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* BLOQUE 3: EXCEPCIÓN — Tabla compacta de Alertas Activas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Excepción — Tabla de Alertas Activas de Abastecimiento
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Orden: Criticidad descendente → Fecha Límite ascendente
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100 tracking-widest">
                <tr>
                  <th className="px-4 py-3">Código SKU</th>
                  <th className="px-4 py-3">Clase</th>
                  <th className="px-4 py-3">Criticidad</th>
                  <th className="px-4 py-3">Cobertura Actual</th>
                  <th className="px-4 py-3">Lead Time P90</th>
                  <th className="px-4 py-3">Fecha Límite Emisión</th>
                  <th className="px-4 py-3">Días Restantes</th>
                  <th className="px-4 py-3">Cantidad Sugerida</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {alertasOrdenadas.map((a) => {
                  const diasRest = getDiasRestantes(a.fecha_limite_emision);
                  return (
                    <tr key={a.alerta_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{a.sku_id}</td>
                      <td className="px-4 py-3"><AbcBadge clase={a.clase_abc} /></td>
                      <td className="px-4 py-3"><CriticidadBadge criticidad={a.criticidad} /></td>
                      <td className="px-4 py-3 font-semibold text-rose-700">{a.cobertura_actual_dias} días</td>
                      <td className="px-4 py-3">{a.lead_time_dias} días</td>
                      <td className="px-4 py-3 font-bold">{formatoFechaISOAFormatoPeruano(a.fecha_limite_emision)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          diasRest <= 20 ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {diasRest} días
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {formatoNumero(a.cantidad_sugerida, 0)} {a.unidad}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate('/recomendaciones')}
                          className="px-3 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white font-sans text-[11px] font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          Ver Decisión
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BLOQUE 4: RECOMENDACIÓN — Tarjetas resumidas de recomendaciones */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-[#15803D]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Recomendación — Propuestas de Compra Explicables del Mes
            </h2>
          </div>
          <button
            onClick={() => navigate('/recomendaciones')}
            className="text-xs text-[#15803D] hover:text-[#14532D] font-bold flex items-center cursor-pointer"
          >
            <span>Ir al Módulo de Recomendaciones</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recomendaciones.map((r) => (
            <div
              key={r.reco_id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-900">{r.reco_id} ({r.sku_id})</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    r.estado === 'PENDIENTE' 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {r.estado}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Cantidad Recomendada:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatoNumero(r.cantidad_recomendada, 0)} {r.unidad}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Proveedor Sugerido:</span>
                    <span className="font-semibold text-slate-800 font-mono">{r.proveedor_recomendado}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Fecha Límite Emisión:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatoFechaISOAFormatoPeruano(r.fecha_limite_emision)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Cobertura Post-Compra:</span>
                    <span className="font-semibold text-emerald-700 font-mono">{r.cobertura_despues_dias} días</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-tight">
                  <strong className="text-slate-900">Riesgo si no compra:</strong> {r.riesgo_no_comprar}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Versión Reglas: <strong className="font-mono text-slate-700">{r.regla_version}</strong></span>
                <button
                  onClick={() => navigate('/recomendaciones')}
                  className="text-[#15803D] font-bold hover:underline"
                >
                  Registrar Decisión humana →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOQUE 5: DECISIÓN — Historial de decisiones tomadas */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <History className="w-4 h-4 text-[#15803D]" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            5. Decisión — Historial de Decisiones Humana Registradas
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100 tracking-widest">
                <tr>
                  <th className="px-4 py-3">Cód Decisión</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Recomendado</th>
                  <th className="px-4 py-3">Aprobado Final</th>
                  <th className="px-4 py-3">Desviación %</th>
                  <th className="px-4 py-3">Motivo & Comentario</th>
                  <th className="px-4 py-3">Resultado Posterior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {decisiones.map((d) => (
                  <tr key={d.decision_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{d.decision_id}</td>
                    <td className="px-4 py-3">{d.periodo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.sku_id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                        d.accion === 'APROBADA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.accion === 'MODIFICADA'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {d.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatoNumero(d.cantidad_recomendada, 0)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatoNumero(d.cantidad_final, 0)}</td>
                    <td className="px-4 py-3 font-bold">
                      {formatoPorcentaje(d.desviacion_pct, 1)}
                    </td>
                    <td className="px-4 py-3 font-sans max-w-xs truncate text-[11px] text-slate-600">
                      <strong>[{d.motivo_desviacion}]</strong> {d.comentario}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {d.resultado_posterior}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BLOQUE ADICIONAL: Gráficos complementarios de OTIF por zona e Insight 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <OtifZonaChart kpis={kpis} zonas={zonas} />
        <ConsumoVsVolumenChart consumoMensual={consumoHistorico} toneladasFruta={toneladasFruta} />
      </div>
    </div>
  );
}
