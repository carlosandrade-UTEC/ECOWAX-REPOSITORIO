import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ConsumoMensual, ToneladasFruta } from '../../types';
import { formatoNumero } from '../../engine/formato';

interface ConsumoVsVolumenChartProps {
  consumoMensual: ConsumoMensual[];
  toneladasFruta: ToneladasFruta[];
}

export function ConsumoVsVolumenChart({ consumoMensual, toneladasFruta }: ConsumoVsVolumenChartProps) {
  // Filtrar carnauba INS-001
  const consumoCarnauba = consumoMensual.filter((c) => c.sku_id === 'INS-001');

  if (consumoCarnauba.length === 0 || toneladasFruta.length === 0) {
    return null;
  }

  // Base 100: Primer periodo (2024-08)
  const baseConsumo = consumoCarnauba[0]?.cantidad || 1;
  const baseFruta = toneladasFruta[0]?.toneladas || 1;

  const dataChart = consumoCarnauba.map((c) => {
    const fruta = toneladasFruta.find((f) => f.periodo === c.periodo);
    const tonVal = fruta?.toneladas || 0;

    return {
      periodo: c.periodo,
      indexConsumo: Number(((c.cantidad / baseConsumo) * 100).toFixed(1)),
      indexFruta: Number(((tonVal / baseFruta) * 100).toFixed(1)),
      consumoKg: c.cantidad,
      toneladas: tonVal,
    };
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>Insight 1: Consumo de Carnauba vs. Toneladas de Fruta (Base 100)</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-green-50 text-[#15803D] font-mono border border-green-200 font-bold">
            Base 100 = Ago 2024
          </span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Comparativa de ritmo de crecimiento entre insumo crítico y producción tratada
        </p>
      </div>

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataChart} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[60, 'auto']} />
            <Tooltip
              formatter={(value: any, name: any) => [
                `${value} pts`,
                name === 'indexConsumo' ? 'Índice Consumo Carnauba' : 'Índice Toneladas Fruta',
              ]}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="indexConsumo"
              name="Índice Carnauba (INS-001)"
              stroke="#e11d48"
              strokeWidth={2.5}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="indexFruta"
              name="Índice Toneladas Fruta"
              stroke="#4f46e5"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Texto explicativo obligatorio */}
      <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-sans">
        <strong className="font-bold text-slate-900">¿Por qué importa este hallazgo?</strong> El consumo de carnauba crece más rápido que el volumen de fruta procesada. Esto indica dos posibles causas operativas: o la eficiencia de aplicación de cera en planta disminuyó, o la composición de variedades de fruta cambió hacia cultivos de mayor dosis por tonelada. En ambos escenarios, <strong className="font-semibold text-slate-900">el pronóstico de compras no puede continuar realizándose sobre consumo histórico absoluto</strong>, sino vinculándose al rendimiento técnico por fruta.
      </div>
    </div>
  );
}
