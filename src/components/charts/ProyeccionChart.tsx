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
  ReferenceArea,
} from 'recharts';
import { ProyeccionInventario, ReordenCalculado, Sku } from '../../types';
import { formatoNumero, formatoFechaISOAFormatoPeruano } from '../../engine/formato';

interface ProyeccionChartProps {
  proyecciones: ProyeccionInventario[];
  reordenInfo?: ReordenCalculado;
  sku?: Sku;
}

export function ProyeccionChart({ proyecciones, reordenInfo, sku }: ProyeccionChartProps) {
  if (!proyecciones || proyecciones.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        Seleccione un SKU para visualizar la proyección de inventario a 12 meses.
      </div>
    );
  }

  const dataChart = proyecciones.map((p) => ({
    periodo: p.periodo,
    inventario: p.inventario_proyectado,
    stockSeguridad: p.stock_seguridad,
    demanda: p.demanda_esperada,
  }));

  const stockSeguridad = reordenInfo?.stock_seguridad || proyecciones[0]?.stock_seguridad || 0;
  const puntoReorden = reordenInfo?.punto_reorden || 0;

  // Frase generada dinámicamente
  const fechaQuiebre = reordenInfo?.fecha_estimada_quiebre
    ? formatoFechaISOAFormatoPeruano(reordenInfo.fecha_estimada_quiebre)
    : '12/09/2026';
  
  const leadTimeP90 = reordenInfo?.lead_time_dias || 55;
  const skuNombre = sku?.nombre || 'insumo seleccionado';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Proyección de Inventario a 12 Meses — {sku?.nombre || sku?.sku_id}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Simulación mes a mes considerando demanda estimada y stock de seguridad
          </p>
        </div>
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-[#15803D] border border-green-200 font-bold">
            Stock Seg.: {formatoNumero(stockSeguridad, 1)} {sku?.unidad || 'kg'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            ROP: {formatoNumero(puntoReorden, 1)} {sku?.unidad || 'kg'}
          </span>
        </div>
      </div>

      <div className="h-72 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dataChart} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${formatoNumero(Number(value), 1)} ${sku?.unidad || 'kg'}`,
                name === 'inventario' ? 'Inventario Proyectado' : 'Stock de Seguridad',
              ]}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {/* Sombras de picos de campaña: Mango (2026-11 a 2027-03), Palta (2027-03 a 2027-08) */}
            <ReferenceArea
              x1="2026-11"
              x2="2027-03"
              {...({ fill: '#fef3c7', fillOpacity: 0.4 } as any)}
              label={{ value: 'Campaña Mango (Pico Ene)', fill: '#92400e', fontSize: 10, position: 'top' }}
            />
            <ReferenceArea
              x1="2027-03"
              x2="2027-07"
              {...({ fill: '#dcfce7', fillOpacity: 0.3 } as any)}
              label={{ value: 'Campaña Palta (Pico May)', fill: '#166534', fontSize: 10, position: 'top' }}
            />

            {/* Línea de Stock de Seguridad */}
            <ReferenceLine
              y={stockSeguridad}
              stroke="#e11d48"
              strokeDasharray="4 4"
              label={{ value: 'Stock de Seguridad', fill: '#e11d48', fontSize: 10, position: 'right' }}
            />

            {/* Línea de Punto de Reorden */}
            {puntoReorden > 0 && (
              <ReferenceLine
                y={puntoReorden}
                stroke="#d97706"
                strokeDasharray="3 3"
                label={{ value: 'ROP', fill: '#d97706', fontSize: 10, position: 'right' }}
              />
            )}

            <ReferenceLine y={0} stroke="#94a3b8" />

            <Line
              type="monotone"
              dataKey="inventario"
              name="Inventario Proyectado"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#4f46e5' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Frase explicativa generada por el motor */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed font-sans flex items-start space-x-2">
        <span className="font-bold text-amber-800 shrink-0">DIAGNÓSTICO DEL MOTOR:</span>
        <p>
          Con la posición actual de inventario, el insumo <strong className="font-semibold">{skuNombre}</strong> entra en quiebre proyectado el <strong className="font-semibold">{fechaQuiebre}</strong>, antes de cubrir la demanda pico de la campaña agroexportadora. Considerando un lead time P90 de <strong className="font-semibold">{leadTimeP90} días</strong> desde Brasil, la orden de compra ya debió ser emitida o requiere aceleración urgente con el proveedor principal.
        </p>
      </div>
    </div>
  );
}
