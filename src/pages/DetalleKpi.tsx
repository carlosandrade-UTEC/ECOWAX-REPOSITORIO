import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatoPorcentaje, formatoNumero, formatoEntero } from '../engine/formato';
import { ArrowLeft, User, RefreshCw, HelpCircle, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export function DetalleKpi() {
  const { kpiKey } = useParams<{ kpiKey: string }>();
  const navigate = useNavigate();
  const { umbrales, kpis } = useAppStore();

  const umbral = umbrales.find((u) => u.kpi === kpiKey) || umbrales[0];

  // Explicación en lenguaje de negocio
  const formulasNegocio: Record<string, { formula: string; descripcion: string; frecuencia: string }> = {
    fill_rate_clase_a: {
      formula: 'Σ Cantidad Real Recibida (Kg) / Σ Cantidad Solicitada en Órdenes de Compra Recibidas',
      descripcion: 'Mide la capacidad de los proveedores (Brasil/Perú) de entregar la totalidad de los insumos críticos Clase A pedidos en la OC sin incurrir en entregas parciales. Un valor < 95% arriesga parar la línea de formulación de ceras.',
      frecuencia: 'Evaluación Mensual',
    },
    cobertura_pico_dias: {
      formula: 'Días de demanda futura cubiertos por la Posición de Inventario (Disponible - Comprometido + En Tránsito)',
      descripcion: 'Mide cuántos días de consumo futuro continuo cubre el inventario actual recorriendo la curva estacional mes a mes hasta el pico de campaña.',
      frecuencia: 'Evaluación Diaria / Módulo Semanal',
    },
    pct_compras_urgentes: {
      formula: 'Número de Órdenes de Compra Urgentes / Número Total de Órdenes de Compra del Periodo',
      descripcion: 'Indica la proporción de compras disparadas en modalidad de emergencia por falta de previsión en el ROP o retrasos logísticos en origen.',
      frecuencia: 'Evaluación Mensual',
    },
    mape_pronostico: {
      formula: 'Promedio de | Consumo Real - Pronóstico | / Consumo Real',
      descripcion: 'Error porcentual medio absoluto del modelo estadístico sobre los 10 insumos en los últimos 12 meses.',
      frecuencia: 'Evaluación Mensual / Backtest',
    },
  };

  const infoNegocio = formulasNegocio[umbral?.kpi] || {
    formula: 'Valor Real Registrado vs. Valor de Meta Establecido en Política de Inventarios',
    descripcion: 'Indicador clave de rendimiento asignado al área de abastecimiento y compras de ECOWAX.',
    frecuencia: 'Mensual',
  };

  // Filtrar kpis para la serie histórica
  const kpisSerie = kpis.filter((k) => k.kpi === umbral?.kpi || (umbral?.kpi.startsWith('fill_rate') && k.kpi === 'fill_rate'));

  const dataChart = kpisSerie.map((k) => ({
    periodo: k.periodo,
    valor: k.unidad === 'ratio' ? Number((k.valor * 100).toFixed(1)) : k.valor,
    meta: k.unidad === 'ratio' ? Number((k.meta * 100).toFixed(1)) : k.meta,
    alertaAmarilla: k.unidad === 'ratio' ? Number((umbral.alerta_amarilla * 100).toFixed(1)) : umbral.alerta_amarilla,
    alertaRoja: k.unidad === 'ratio' ? Number((umbral.alerta_roja * 100).toFixed(1)) : umbral.alerta_roja,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{umbral?.nombre || kpiKey}</h2>
          <p className="text-xs text-slate-500">Detalle técnico y evolución histórica del indicador</p>
        </div>
      </div>

      {/* Tarjeta de Ficha Técnica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <User className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Responsable del KPI:</span>
          </div>
          <p className="text-sm font-bold text-slate-900 font-mono">{umbral?.dueno || 'Jefatura de Compras'}</p>
          <p className="text-[11px] text-slate-500">Encargado de coordinar planes de acción en desviaciones.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Frecuencia de Evaluación:</span>
          </div>
          <p className="text-sm font-bold text-slate-900">{infoNegocio.frecuencia}</p>
          <p className="text-[11px] text-slate-500">Revisado en el comité mensual de operaciones.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Umbral de Meta Aprobado:</span>
          </div>
          <p className="text-sm font-bold text-slate-900 font-mono">
            {umbral?.unidad === 'ratio' ? formatoPorcentaje(umbral.meta, 0) : `${umbral?.meta} ${umbral?.unidad}`}
          </p>
          <p className="text-[11px] text-slate-500">Dirección: <strong className="text-slate-800">{umbral?.direccion}</strong></p>
        </div>
      </div>

      {/* Gráfico de Evolución Histórica */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Serie Histórica (Últimos 12 Meses)
          </h3>
          <p className="text-[11px] text-slate-500">
            Comparativa contra la meta establecida y bandas de tolerancia amarilla/roja
          </p>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dataChart} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="periodo" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val}${umbral?.unidad === 'ratio' ? '%' : ''}`, 'Valor']}
                labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Bandas de Alerta */}
              {umbral && (
                <ReferenceLine
                  y={umbral.unidad === 'ratio' ? umbral.meta * 100 : umbral.meta}
                  stroke="#16a34a"
                  strokeWidth={2}
                  label={{ value: 'Meta Operativa', fill: '#16a34a', fontSize: 10, position: 'right' }}
                />
              )}
              {umbral && (
                <ReferenceLine
                  y={umbral.unidad === 'ratio' ? umbral.alerta_amarilla * 100 : umbral.alerta_amarilla}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  label={{ value: 'Alerta Amarilla', fill: '#d97706', fontSize: 10, position: 'right' }}
                />
              )}
              {umbral && (
                <ReferenceLine
                  y={umbral.unidad === 'ratio' ? umbral.alerta_roja * 100 : umbral.alerta_roja}
                  stroke="#e11d48"
                  strokeDasharray="2 2"
                  label={{ value: 'Alerta Roja', fill: '#e11d48', fontSize: 10, position: 'right' }}
                />
              )}

              <Line
                type="monotone"
                dataKey="valor"
                name="Valor Real Registrado"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563eb' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explicación de la Fórmula en Lenguaje de Negocio */}
      <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Fórmula del Negocio y Definición</span>
        </div>
        <div className="p-3 bg-slate-800 rounded-lg font-mono text-xs text-emerald-300 border border-slate-700">
          {infoNegocio.formula}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {infoNegocio.descripcion}
        </p>
      </div>
    </div>
  );
}
