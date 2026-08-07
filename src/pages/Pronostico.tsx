import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { mockProvider } from '../services/mockProvider';
import { Pronostico, ConsumoMensual } from '../types';
import { formatoNumero, formatoPorcentaje } from '../engine/formato';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, Cpu, Calendar, CheckCircle2 } from 'lucide-react';

export function PronosticoPage() {
  const { skus, loading, error, loadInitialData } = useAppStore();
  const [selectedSkuId, setSelectedSkuId] = React.useState<string>('INS-001');
  const [pronosticos, setPronosticos] = React.useState<Pronostico[]>([]);
  const [historico, setHistorico] = React.useState<ConsumoMensual[]>([]);

  React.useEffect(() => {
    Promise.all([
      mockProvider.getPronosticos(selectedSkuId),
      mockProvider.getConsumoMensual(selectedSkuId),
    ]).then(([pron, hist]) => {
      setPronosticos(pron);
      setHistorico(hist);
    });
  }, [selectedSkuId]);

  if (loading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={loadInitialData} />;
  }

  const selectedSku = skus.find((s) => s.sku_id === selectedSkuId);

  // Escenarios
  const dataEscenarios = pronosticos.map((p) => ({
    periodo: p.periodo,
    base: p.valor_esperado,
    optimista: Number((p.valor_esperado * 1.15).toFixed(1)),
    conservador: Number((p.valor_esperado * 0.88).toFixed(1)),
    inferior: p.limite_inferior,
    superior: p.limite_superior,
  }));

  const mapeMedio = pronosticos.length > 0 ? pronosticos[0].mape_backtest : 0.186;
  const sesgoMedio = pronosticos.length > 0 ? pronosticos[0].sesgo_backtest : -0.017;

  return (
    <div className="space-y-6">
      {/* AVISO PERMANENTE Y VISIBLE (OBLIGATORIO) */}
      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl shadow-xs text-amber-950 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
            ADVERTENCIA TÉCNICA DEL MOTOR DE PRONÓSTICOS
          </h3>
          <p className="text-xs font-semibold leading-relaxed">
            Línea base estacional. No es un modelo entrenado. Se requieren 24 meses de histórico por SKU para activar Holt-Winters.
          </p>
          <p className="text-[11px] text-amber-800">
            Los valores mostrados corresponden a la proyección estacional ajustada por coeficiente histórico de fruta. No debe emplearse como algoritmo de machine learning autónomo.
          </p>
        </div>
      </div>

      {/* Encabezado e info del modelo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#15803D]" />
            <span>Simulación de Escenarios de Demanda Futura</span>
          </h2>
          <p className="text-xs text-slate-500">
            Escenarios Base, Optimista (+15%) y Conservador (-12%) para la planificación de compras
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Versión Modelo: <strong className="text-slate-900">DETERMINISTICO-v1</strong></span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Última ejecución: <strong className="text-slate-900">05/08/2026 23:00</strong></span>
          </div>
        </div>
      </div>

      {/* Selector de Insumo y Metricas de Backtest */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Seleccionar SKU:</label>
              <select
                value={selectedSkuId}
                onChange={(e) => setSelectedSkuId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {skus.map((s) => (
                  <option key={s.sku_id} value={s.sku_id}>
                    {s.sku_id} — {s.nombre}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {selectedSku?.categoria} | {selectedSku?.unidad}
            </span>
          </div>

          {/* Gráfico de Escenarios */}
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataEscenarios} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="periodo" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${formatoNumero(Number(val), 1)} ${selectedSku?.unidad || 'kg'}`, '']}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                <Line
                  type="monotone"
                  dataKey="optimista"
                  name="Escenario Optimista (+15%)"
                  stroke="#16a34a"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="base"
                  name="Escenario Base"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  dataKey="conservador"
                  name="Escenario Conservador (-12%)"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Métrica de Error Backtest */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Precisión Histórica de Backtest
            </h3>

            <div className="mt-4 space-y-4 font-mono">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-sans block">MAPE (Error Medio Porcentual):</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatoPorcentaje(mapeMedio, 1)}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Meta: ≤ 15.0%</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Alerta
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-sans block">Sesgo (Bias Acumulado):</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatoPorcentaje(sesgoMedio, 1)}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                  <span>Banda Aceptable: -5% a +5%</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Aceptable
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-tight">
            <strong>Comparativa Línea Base:</strong> El modelo estacional actual presenta un desvío promedio de 18.6% principalmente en la transición de la ventana de palta a cítricos.
          </div>
        </div>
      </div>
    </div>
  );
}
