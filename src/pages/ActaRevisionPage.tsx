import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { dataProvider } from '../services/dataProvider';
import { RevisionMensual, Decision, AccionRevision, Sku } from '../types';
import { formatoFechaISOAFormatoPeruano } from '../engine/formato';
import { Unauthorized403 } from './Unauthorized403';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export function ActaRevisionPage() {
  const { id } = useParams<{ id: string }>();
  const { getPermiso } = useAppStore();
  const permiso = getPermiso('revision_mensual');

  const [review, setReview] = React.useState<RevisionMensual | null>(null);
  const [decisiones, setDecisiones] = React.useState<Decision[]>([]);
  const [acciones, setAcciones] = React.useState<AccionRevision[]>([]);
  const [skus, setSkus] = React.useState<Sku[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      dataProvider.getRevisiones(),
      dataProvider.getDecisiones(),
      dataProvider.getAccionesRevision(),
      dataProvider.getSkus(),
    ]).then(([revs, decs, accs, skuList]) => {
      const found = revs.find((r) => r.review_id === id);
      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setReview(found);
      setSkus(skuList);

      const p = found.periodo;
      setDecisiones(decs.filter((d) => d.periodo === p));
      setAcciones(accs.filter((a) => a.review_id === found.review_id));
      setLoading(false);
    });
  }, [id]);

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500">
        Cargando Acta de Revisión S&OP...
      </div>
    );
  }

  if (notFound || !review) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-rose-200 rounded-xl text-center space-y-4 shadow-md">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">404 — Revisión Mensual No Encontrada</h2>
        <p className="text-xs text-slate-500">
          No se encontró ningún acta de revisión para el identificador "<span className="font-mono font-bold text-slate-800">{id}</span>".
        </p>
        <Link to="/revision-mensual" className="inline-block px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs hover:bg-slate-900">
          Volver a Revisión Mensual
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const esOficial = review.estado === 'CERRADA';

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 bg-white min-h-screen text-slate-900 font-sans">
      {/* Visual top bar (Hidden on Print) */}
      <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to="/revision-mensual"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Revisión Mensual</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Descargar / Imprimir Acta (PDF)</span>
        </button>
      </div>

      {/* MARCA DE AGUA BORRADOR PARA REVISIONES ABIERTAS */}
      {!esOficial && (
        <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between gap-3 text-amber-900 shadow-xs print:bg-white print:border-amber-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold text-xs tracking-wider uppercase block">
                BORRADOR DE TRABAJO — REVISIÓN ABIERTA (NO OFICIAL)
              </span>
              <p className="text-[11px] text-amber-800">
                Esta acta pertenece a un comité en curso. Los acuerdos y cantidades aún no son finales hasta el cierre formal.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-extrabold text-[10px] rounded uppercase font-mono border border-amber-300">
            BORRADOR
          </span>
        </div>
      )}

      {/* DOCUMENTO OFICIAL ACTA DE REVISIÓN */}
      <div className="border border-slate-300 p-8 rounded-lg space-y-6 shadow-sm print:border-none print:shadow-none print:p-0 relative overflow-hidden">
        {!esOficial && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] pointer-events-none opacity-10 select-none">
            <span className="text-8xl font-black font-mono text-amber-900 border-8 border-amber-900 p-6 rounded-3xl uppercase">
              BORRADOR
            </span>
          </div>
        )}

        {/* Encabezado Corporativo */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <span className="text-xs font-extrabold font-mono text-emerald-800 uppercase tracking-widest block">
              ECOWAX PERÚ S.A.
            </span>
            <h1 className="text-xl font-black text-slate-900 mt-1 uppercase">
              Acta de Revisión Mensual S&OP — {review.periodo}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Comité Ejecutivo de Abastecimiento de Insumos Críticos Importados
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="font-bold text-slate-900 block">ID: {review.review_id}</span>
            <span className="text-slate-500 text-[11px]">
              Fecha: {formatoFechaISOAFormatoPeruano(review.fecha)}
            </span>
          </div>
        </div>

        {/* Datos de la Sesión */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 font-bold block">Presidida Por:</span>
            <span className="font-bold text-slate-900">{review.presidida_por}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Estado de la Sesión:</span>
            <span
              className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] mt-0.5 ${
                esOficial
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {esOficial ? 'CERRADA Y CONFORME' : 'ABIERTA / BORRADOR'}
            </span>
          </div>
        </div>

        {/* Decisiones Aprobadas en el Comité */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>1. Acuerdos y Decisiones de Compra Aprobadas</span>
            <span className="font-mono text-slate-500 font-normal">
              {decisiones.length} decisiones registradas
            </span>
          </h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 font-mono font-bold text-slate-700 text-[10px] uppercase">
                <th className="py-2 px-2">ID Decisión</th>
                <th className="py-2 px-2">SKU</th>
                <th className="py-2 px-2">Acción</th>
                <th className="py-2 px-2 font-mono text-right">Cant. Recom.</th>
                <th className="py-2 px-2 font-mono text-right">Cant. Final</th>
                <th className="py-2 px-2 font-mono text-right">Desviación</th>
                <th className="py-2 px-2">Justificación / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {decisiones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400 font-sans italic">
                    No hay decisiones registradas en esta revisión.
                  </td>
                </tr>
              ) : (
                decisiones.map((d) => {
                  const skuMatch = skus.find((s) => s.sku_id === d.sku_id);
                  return (
                    <tr key={d.decision_id} className="align-top">
                      <td className="py-2.5 px-2 font-bold text-slate-900">{d.decision_id}</td>
                      <td className="py-2.5 px-2">
                        <span className="font-bold block text-slate-800">{d.sku_id}</span>
                        <span className="text-[10px] text-slate-500 font-sans block">
                          {skuMatch?.nombre || ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                            d.accion === 'APROBADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.accion === 'MODIFICADA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.accion}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">{d.cantidad_recomendada}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900">
                        {d.cantidad_final}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-700">
                        {d.desviacion_pct > 0 ? `+${d.desviacion_pct}%` : `${d.desviacion_pct}%`}
                      </td>
                      <td className="py-2.5 px-2 font-sans text-slate-700 max-w-xs">
                        {d.motivo_desviacion || d.comentario || 'Aprobado según recomendación del motor'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Compromisos Abiertos */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>2. Compromisos Abiertos y Tareas Asignadas</span>
            <span className="font-mono text-slate-500 font-normal">
              {acciones.length} tareas
            </span>
          </h2>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 font-mono font-bold text-slate-700 text-[10px] uppercase">
                <th className="py-2 px-2">Código</th>
                <th className="py-2 px-2">Descripción de la Tarea</th>
                <th className="py-2 px-2">Responsable</th>
                <th className="py-2 px-2">Fecha Límite</th>
                <th className="py-2 px-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {acciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 font-sans italic">
                    Sin compromisos adicionales pendientes para esta acta.
                  </td>
                </tr>
              ) : (
                acciones.map((acc) => (
                  <tr key={acc.accion_id} className="align-top">
                    <td className="py-2.5 px-2 font-bold text-slate-900">{acc.accion_id}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-800 max-w-xs">{acc.descripcion}</td>
                    <td className="py-2.5 px-2 font-sans font-bold text-slate-700">{acc.responsable}</td>
                    <td className="py-2.5 px-2 font-bold text-slate-900">{acc.fecha_objetivo}</td>
                    <td className="py-2.5 px-2 font-bold font-sans text-[10px] uppercase">{acc.estado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Página con Versión de Reglas y Firmas */}
        <div className="pt-8 space-y-8 border-t border-slate-300">
          <div className="flex justify-between items-end text-[11px] font-mono text-slate-600">
            <div>
              <span className="font-bold text-slate-800">Motor de Reglas Reorden:</span> RB-2026.08 (Vigente)
            </div>
            <div>
              <span className="font-bold text-slate-800">Estado Acta:</span>{' '}
              <span className={esOficial ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {esOficial ? 'ACTA OFICIAL CONFORME Y REGISTRADA' : 'BORRADOR DE TRABAJO (REVISIÓN ABIERTA)'}
              </span>
            </div>
          </div>

          {/* Firmas en Imprimible */}
          <div className="grid grid-cols-3 gap-8 text-center pt-8 font-sans">
            <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-600">
              <span className="font-bold block text-slate-900 text-xs">Marta Chávez</span>
              Gerente de Operaciones
            </div>
            <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-600">
              <span className="font-bold block text-slate-900 text-xs">Rosa Quispe</span>
              Jefe de Compras
            </div>
            <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-600">
              <span className="font-bold block text-slate-900 text-xs">Jorge Palma</span>
              Finanzas & Control
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
