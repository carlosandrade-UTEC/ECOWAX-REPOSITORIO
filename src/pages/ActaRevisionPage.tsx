import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProvider } from '../services/mockProvider';
import { RevisionMensual, Decision, AccionRevision, Sku } from '../types';
import { formatoFechaISOAFormatoPeruano } from '../engine/formato';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export function ActaRevisionPage() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = React.useState<RevisionMensual | null>(null);
  const [decisiones, setDecisiones] = React.useState<Decision[]>([]);
  const [acciones, setAcciones] = React.useState<AccionRevision[]>([]);
  const [skus, setSkus] = React.useState<Sku[]>([]);

  React.useEffect(() => {
    Promise.all([
      mockProvider.getRevisiones(),
      mockProvider.getDecisiones(),
      mockProvider.getAccionesRevision(),
      mockProvider.getSkus(),
    ]).then(([revs, decs, accs, skuList]) => {
      const found = revs.find((r) => r.review_id === id) || revs[revs.length - 1];
      setReview(found);
      setSkus(skuList);

      const p = found ? found.periodo : '2026-08';
      setDecisiones(decs.filter((d) => d.periodo === p));
      setAcciones(accs.filter((a) => a.review_id === found?.review_id || a.review_id === 'REV-2026-08'));
    });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const periodoStr = review ? review.periodo : '2026-08';

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

      {/* DOCUMENTO OFICIAL ACTA DE REVISIÓN */}
      <div className="border border-slate-300 p-8 rounded-lg space-y-6 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Encabezado del Acta */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              SISTEMA DE GOBIERNO Y CONTROL DE ABASTECIMIENTO (S&OP)
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Acta Oficial de Revisión Mensual — {periodoStr}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Comité de Gobierno de Compras, Inventarios y Operaciones
            </p>
          </div>

          <div className="text-right font-mono text-xs space-y-1">
            <span className="inline-block px-2.5 py-1 bg-slate-100 font-bold border border-slate-300 rounded text-slate-800">
              CÓDIGO: {review?.review_id || id || 'REV-2026-08'}
            </span>
            <div className="text-slate-500 text-[11px]">
              Fecha: {review?.fecha ? formatoFechaISOAFormatoPeruano(review.fecha) : '05/08/2026'}
            </div>
          </div>
        </div>

        {/* Participantes y Presidencia */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-md grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">
              Presidida Por:
            </span>
            <span className="font-extrabold text-slate-900">
              {review?.presidida_por || 'USR-003 (Marta Chávez - Gerente Operaciones)'}
            </span>
          </div>

          <div>
            <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] mb-1">
              Asistentes / Participantes:
            </span>
            <div className="font-medium text-slate-800 leading-snug">
              Rosa Quispe (Jefe Compras), Diego Ferrer (Planeamiento), Jorge Palma (Finanzas), Carlos Andrade (Gerencia General).
            </div>
          </div>
        </div>

        {/* Sección 1: Decisiones de Abastecimiento Aprobadas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 print:text-black" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Decisiones de Abastecimiento Aprobadas en el Comité
            </h2>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                <th className="py-2 px-2">SKU / Descripción</th>
                <th className="py-2 px-2 text-right">Sugerido</th>
                <th className="py-2 px-2 text-right">Final Acordado</th>
                <th className="py-2 px-2">Acción</th>
                <th className="py-2 px-2">Responsable</th>
                <th className="py-2 px-2">Comentario / Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {decisiones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500 font-sans italic">
                    Sin decisiones registradas para esta sesión.
                  </td>
                </tr>
              ) : (
                decisiones.map((d) => {
                  const skuObj = skus.find((s) => s.sku_id === d.sku_id);
                  return (
                    <tr key={d.decision_id} className="align-top">
                      <td className="py-2.5 px-2">
                        <span className="font-bold block text-slate-900">{d.sku_id}</span>
                        <span className="font-sans text-[10px] text-slate-600 block">
                          {skuObj?.nombre || 'Insumo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {d.cantidad_recomendada.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-blue-900 print:text-black">
                        {d.cantidad_final.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 font-bold font-sans">
                        {d.accion}
                      </td>
                      <td className="py-2.5 px-2 font-sans font-semibold">
                        {d.usuario_id}
                      </td>
                      <td className="py-2.5 px-2 font-sans text-slate-700 text-[10px] leading-tight">
                        {d.comentario || d.motivo_desviacion}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sección 2: Acuerdos y Compromisos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 print:text-black" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Acuerdos y Compromisos de Ejecución Derivados
            </h2>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                <th className="py-2 px-2">Código</th>
                <th className="py-2 px-2">Descripción del Acuerdo</th>
                <th className="py-2 px-2">Responsable</th>
                <th className="py-2 px-2">Fecha Objetivo</th>
                <th className="py-2 px-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {acciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500 font-sans italic">
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
              <span className="font-bold text-slate-800">Estado Acta:</span> CONFORME Y REGISTRADA
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
