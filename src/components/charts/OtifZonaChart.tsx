import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { RegistroKPI, Zona } from '../../types';
import { formatoPorcentaje } from '../../engine/formato';

interface OtifZonaChartProps {
  kpis: RegistroKPI[];
  zonas: Zona[];
}

export function OtifZonaChart({ kpis, zonas }: OtifZonaChartProps) {
  // Filtrar kpi == 'otif'
  const kpisOtif = kpis.filter((k) => k.kpi === 'otif');

  // Agrupar por periodo
  const periodos = Array.from(new Set(kpisOtif.map((k) => k.periodo))).sort();

  const dataChart = periodos.map((periodo) => {
    const row: any = { periodo };
    kpisOtif
      .filter((k) => k.periodo === periodo)
      .forEach((k) => {
        row[k.dimension] = Number((k.valor * 100).toFixed(1));
      });
    return row;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Cumplimiento OTIF por Zona Geográfica (Últimos 12 Meses)
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Desempeño de entregas a tiempo y completas (On-Time In-Full) en almacenes regionales
        </p>
      </div>

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataChart} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="periodo" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 100]} unit="%" />
            <Tooltip
              formatter={(value: any) => [`${value}%`, 'OTIF']}
              labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <ReferenceLine
              y={90}
              stroke="#d97706"
              strokeDasharray="3 3"
              label={{ value: 'Meta Norte (90%)', fill: '#d97706', fontSize: 10, position: 'left' }}
            />
            <ReferenceLine
              y={92}
              stroke="#16a34a"
              strokeDasharray="3 3"
              label={{ value: 'Meta Centro/Sur (92%)', fill: '#16a34a', fontSize: 10, position: 'right' }}
            />
            <Bar dataKey="ZN-NOR" name="Norte (Piura/Trujillo)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ZN-CEN" name="Centro (Lima/Huaral)" fill="#0d9488" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ZN-SUR" name="Sur (Ica/Arequipa)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
