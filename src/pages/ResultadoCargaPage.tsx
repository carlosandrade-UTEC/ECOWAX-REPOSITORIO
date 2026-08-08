import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { dataProvider } from '../services/dataProvider';
import { CargaDatos, IssueCalidad } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileSpreadsheet, ShieldAlert } from 'lucide-react';

export function ResultadoCargaPage() {
  const { id } = useParams<{ id: string }>();
  const { getPermiso } = useAppStore();
  const permiso = getPermiso('carga_datos');

  const [carga, setCarga] = React.useState<CargaDatos | null>(null);
  const [issues, setIssues] = React.useState<IssueCalidad[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    Promise.all([dataProvider.getCargas(), dataProvider.getCalidad()]).then(
      ([cargasList, qualityList]) => {
        const found = cargasList.find((c) => c.upload_id === id);
        if (!found) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCarga(found);
        const matchingIssues = qualityList.filter((i) => i.upload_id === found.upload_id);
        setIssues(matchingIssues);
        setLoading(false);
      }
    );
  }, [id]);

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500">
        Cargando reporte de validación de carga...
      </div>
    );
  }

  if (notFound || !carga) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-rose-200 rounded-xl text-center space-y-4 shadow-md">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">404 — Reporte de Carga No Encontrado</h2>
        <p className="text-xs text-slate-500">
          No se encontró ningún registro de carga con el identificador "<span className="font-mono font-bold text-slate-800">{id}</span>".
        </p>
        <Link to="/carga-datos" className="inline-block px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-900">
          Volver a Carga de Datos
        </Link>
      </div>
    );
  }

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
                Reporte de Validación de Carga {carga.upload_id}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro histórico de calidad de datos y evaluación de reglas de negocio
            </p>
          </div>

          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
              carga.estado === 'OK'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : carga.estado === 'PARCIAL'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            Estado Carga: {carga.estado}
          </span>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tabla Destino
            </span>
            <span className="text-sm font-bold font-mono text-blue-900 mt-0.5 block">
              {carga.tabla_destino}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Fecha y Hora Carga
            </span>
            <span className="text-sm font-bold font-mono text-slate-800 mt-0.5 block">
              {carga.fecha}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Filas Aceptadas (OK)
            </span>
            <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">
              {carga.filas_ok} / {carga.filas_totales}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Filas Rechazadas
            </span>
            <span className="text-sm font-bold font-mono text-rose-700 mt-0.5 block">
              {carga.filas_rechazadas}
            </span>
          </div>
        </div>

        {/* Detalle o Mensaje */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
          <span className="font-bold text-slate-900">Resumen de Proceso: </span>
          {carga.detalle}
        </div>
      </div>

      {/* Tabla de Observaciones e Issues de Calidad */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Issues de Calidad Registrados ({issues.length})</span>
        </h2>

        {issues.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-emerald-50/50 border border-emerald-200 rounded-lg flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <span className="font-bold text-emerald-900">Carga Limpia Sin Errores Registrados</span>
            <span>Todas las filas procesadas cumplieron al 100% las 10 reglas de calidad.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">ID Issue</th>
                  <th className="px-3.5 py-2.5">Fila</th>
                  <th className="px-3.5 py-2.5">Campo</th>
                  <th className="px-3.5 py-2.5">Valor Encontrado</th>
                  <th className="px-3.5 py-2.5">Regla Violada</th>
                  <th className="px-3.5 py-2.5">Severidad</th>
                  <th className="px-3.5 py-2.5">Acción Aplicada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {issues.map((iss) => (
                  <tr key={iss.issue_id} className="hover:bg-slate-50/80">
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">{iss.issue_id}</td>
                    <td className="px-3.5 py-2.5 font-bold text-slate-700">Fila {iss.fila}</td>
                    <td className="px-3.5 py-2.5 font-bold text-blue-900">{iss.campo}</td>
                    <td className="px-3.5 py-2.5 text-rose-700 font-bold">{iss.valor}</td>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-slate-800">
                      {iss.regla}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          iss.severidad === 'BLOQUEANTE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {iss.severidad}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-600">{iss.accion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
