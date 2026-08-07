import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProvider } from '../services/mockProvider';
import { CargaDatos, IssueCalidad } from '../types';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export function ResultadoCargaPage() {
  const { id } = useParams<{ id: string }>();
  const [carga, setCarga] = React.useState<CargaDatos | null>(null);
  const [issues, setIssues] = React.useState<IssueCalidad[]>([]);

  React.useEffect(() => {
    Promise.all([mockProvider.getCargas(), mockProvider.getCalidad()]).then(
      ([cargasList, qualityList]) => {
        const found = cargasList.find((c) => c.upload_id === id) || cargasList[0];
        setCarga(found);

        const uploadIdToMatch = found ? found.upload_id : id;
        const matchingIssues = qualityList.filter(
          (i) => i.upload_id === uploadIdToMatch || i.upload_id === 'UPL-0001'
        );
        setIssues(matchingIssues);
      }
    );
  }, [id]);

  return (
    <div className="space-y-6">
      {/* Visual Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/carga-datos"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Carga de Datos</span>
        </Link>
      </div>

      {/* Tarjeta de Resumen de Carga */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-[#15803D]" />
              <h1 className="text-xl font-extrabold text-slate-900">
                Reporte de Validación de Carga {carga?.upload_id || id}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro histórico de calidad de datos y evaluación de reglas de negocio
            </p>
          </div>

          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
              carga?.estado === 'OK'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : carga?.estado === 'PARCIAL'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            ESTADO: {carga?.estado || 'PARCIAL'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
              Tabla Destino
            </span>
            <span className="font-bold text-blue-900 block mt-0.5">{carga?.tabla_destino}</span>
          </div>

          <div>
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
              Archivo Original
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">{carga?.archivo}</span>
          </div>

          <div>
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
              Fecha y Hora
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">{carga?.fecha}</span>
          </div>

          <div>
            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">
              Usuario Carga
            </span>
            <span className="font-bold text-slate-800 block mt-0.5">{carga?.usuario_id}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Filas Totales</span>
            <span className="text-lg font-extrabold text-slate-900 font-mono mt-0.5 block">
              {carga?.filas_totales}
            </span>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-emerald-700 uppercase font-bold block">Filas Aceptadas</span>
            <span className="text-lg font-extrabold text-emerald-800 font-mono mt-0.5 block">
              {carga?.filas_ok}
            </span>
          </div>

          <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-200">
            <span className="text-[10px] text-rose-700 uppercase font-bold block">Filas Rechazadas</span>
            <span className="text-lg font-extrabold text-rose-800 font-mono mt-0.5 block">
              {carga?.filas_rechazadas}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Observaciones y Violaciones de Reglas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Inconsistencias Detectadas ({issues.length} Observaciones)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">ID Issue</th>
                <th className="px-3.5 py-2.5">Fila</th>
                <th className="px-3.5 py-2.5">Campo</th>
                <th className="px-3.5 py-2.5">Valor Erróneo</th>
                <th className="px-3.5 py-2.5">Regla Violada</th>
                <th className="px-3.5 py-2.5">Severidad</th>
                <th className="px-3.5 py-2.5">Acción Aplicada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 font-sans">
                    No se detectaron errores de calidad en esta carga.
                  </td>
                </tr>
              ) : (
                issues.map((i) => (
                  <tr key={i.issue_id} className="hover:bg-slate-50/80">
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">{i.issue_id}</td>
                    <td className="px-3.5 py-2.5 font-bold">{i.fila === 0 ? 'General' : `Fila ${i.fila}`}</td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-800">{i.campo}</td>
                    <td className="px-3.5 py-2.5 text-rose-700 font-bold">{i.valor}</td>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-slate-800">{i.regla}</td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          i.severidad === 'BLOQUEANTE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {i.severidad}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-600">{i.accion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
