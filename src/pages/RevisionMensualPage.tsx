import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { dataProvider } from '../services/dataProvider';
import {
  RevisionMensual,
  AccionRevision,
  Recomendacion,
  Decision,
  RegistroKPI,
  Alerta,
} from '../types';
import { Unauthorized403 } from './Unauthorized403';
import { formatoFechaISOAFormatoPeruano } from '../engine/formato';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  FileText,
  Lock,
  Plus,
  ArrowRight,
  XCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

export function RevisionMensualPage() {
  const navigate = useNavigate();
  const { getPermiso, currentUser } = useAppStore();
  const permiso = getPermiso('revision_mensual');

  const [periodo, setPeriodo] = React.useState<string>('2026-08');
  const [revisiones, setRevisiones] = React.useState<RevisionMensual[]>([]);
  const [acciones, setAcciones] = React.useState<AccionRevision[]>([]);
  const [recomendaciones, setRecomendaciones] = React.useState<Recomendacion[]>([]);
  const [decisiones, setDecisiones] = React.useState<Decision[]>([]);
  const [kpis, setKpis] = React.useState<RegistroKPI[]>([]);
  const [alertas, setAlertas] = React.useState<Alerta[]>([]);

  // Modales
  const [showPendingModal, setShowPendingModal] = React.useState<boolean>(false);
  const [pendingList, setPendingList] = React.useState<string[]>([]);
  const [showAddAccionModal, setShowAddAccionModal] = React.useState<boolean>(false);
  
  // Form para nuevo compromiso
  const [nuevaDescripcion, setNuevaDescripcion] = React.useState('');
  const [nuevoResponsable, setNuevoResponsable] = React.useState('USR-001');
  const [nuevaFecha, setNuevaFecha] = React.useState('2026-09-15');

  const cargarDatos = React.useCallback(async () => {
    const [revs, accs, recs, decs, kpiList, alrList] = await Promise.all([
      dataProvider.getRevisiones(),
      dataProvider.getAccionesRevision(),
      dataProvider.getRecomendaciones(),
      dataProvider.getDecisiones(),
      dataProvider.getKpis(),
      dataProvider.getAlertas(),
    ]);
    setRevisiones(revs);
    setAcciones(accs);
    setRecomendaciones(recs);
    setDecisiones(decs);
    setKpis(kpiList);
    setAlertas(alrList);
  }, []);

  React.useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  const reviewActual = revisiones.find((r) => r.periodo === periodo) || {
    review_id: `REV-${periodo}`,
    periodo,
    fecha: `${periodo}-05`,
    presidida_por: 'USR-003 (Marta Chávez - Gerente Operaciones)',
    kpis_fuera_meta: 'fill_rate;compras_urgentes',
    decisiones_tomadas: decisiones.filter((d) => d.periodo === periodo).length,
    decisiones_pendientes: recomendaciones.filter(
      (r) => r.periodo === periodo && r.estado === 'PENDIENTE'
    ).length,
    estado: 'ABIERTA' as const,
  };

  const recosMes = recomendaciones.filter((r) => r.periodo === periodo);
  const decisionesMes = decisiones.filter((d) => d.periodo === periodo);
  const recosPendientes = recosMes.filter((r) => r.estado === 'PENDIENTE');

  // KPIs fuera de meta en el periodo
  const kpisFueraMeta = kpis.filter((k) => {
    if (k.periodo !== periodo) return false;
    if (k.unidad === 'ratio') {
      if (k.kpi === 'pct_compras_urgentes') return k.valor > k.meta;
      return k.valor < k.meta;
    }
    if (k.unidad === 'dias') return k.valor < k.meta;
    return false;
  });

  // Compromisos abiertos
  const compromisosAbiertos = acciones.filter((a) => a.estado !== 'CERRADA');

  const handleCerrarRevision = async () => {
    const res = await dataProvider.closeRevision(reviewActual.review_id);
    if (!res.success && res.pendingDecisions) {
      setPendingList(res.pendingDecisions);
      setShowPendingModal(true);
    } else {
      await cargarDatos();
      alert('¡Revisión mensual cerrada con éxito! Ya se puede descargar o imprimir el Acta de Revisión.');
    }
  };

  const handleCrearCompromiso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDescripcion.trim()) return;
    await dataProvider.addAccionRevision({
      review_id: reviewActual.review_id,
      descripcion: nuevaDescripcion,
      responsable: nuevoResponsable,
      fecha_objetivo: nuevaFecha,
      estado: 'PENDIENTE',
    });
    setNuevaDescripcion('');
    setShowAddAccionModal(false);
    await cargarDatos();
  };

  const handleToggleEstadoAccion = async (accionId: string, estadoActual: AccionRevision['estado']) => {
    const nuevoEstado = estadoActual === 'CERRADA' ? 'EN_CURSO' : 'CERRADA';
    await dataProvider.updateAccionRevision(accionId, { estado: nuevoEstado });
    await cargarDatos();
  };

  return (
    <div className="space-y-6">
      {/* Header con Selector de Periodo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#15803D]" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Supply Review Digital — Revisión Mensual
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comité de Gobierno de Abastecimiento S&OP. Evaluación de KPIs, decisiones de compra y compromisos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-600 px-2">Periodo:</span>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-white text-xs font-bold font-mono border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026-08">2026-08 (Actual)</option>
              <option value="2026-07">2026-07</option>
              <option value="2026-06">2026-06</option>
              <option value="2026-05">2026-05</option>
            </select>
          </div>

          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${
              reviewActual.estado === 'ABIERTA'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {reviewActual.estado === 'ABIERTA' ? '🔴 ABIERTA' : '🟢 CERRADA'}
          </span>
        </div>
      </div>

      {/* Tarjetas de Resumen Ejecutivo de la Revisión */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Recomendaciones del Mes
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {recosMes.length}
            </span>
            <span className="text-xs text-slate-500">
              {recosPendientes.length} pendientes
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            KPIs Fuera de Meta
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-2xl font-extrabold font-mono ${
                kpisFueraMeta.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {kpisFueraMeta.length}
            </span>
            <span className="text-xs text-slate-500">en el periodo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Decisiones Registradas
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {decisionesMes.length}
            </span>
            <span className="text-xs text-slate-500">tomadas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Compromisos Abiertos
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold font-mono text-amber-600">
              {compromisosAbiertos.length}
            </span>
            <span className="text-xs text-slate-500">pendientes</span>
          </div>
        </div>
      </div>

      {/* Alerta de Decisiones Pendientes */}
      {recosPendientes.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Hay {recosPendientes.length} decisiones de compra pendientes para cerrar la revisión de {periodo}
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                La regla de gobernanza exige que todas las recomendaciones de abastecimiento sean resueltas (aprobadas, modificadas o rechazadas) antes de cerrar la sesión.
              </p>
            </div>
          </div>
          <Link
            to="/recomendaciones"
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-bold transition-colors shrink-0"
          >
            Resolver Pendientes
          </Link>
        </div>
      )}

      {/* Grid Principal: Recomendaciones y Decisiones / KPIs fuera de meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recomendaciones y Decisiones del Mes (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                <span>Recomendaciones y Estado de Decisión ({periodo})</span>
              </h3>
              <Link
                to="/recomendaciones"
                className="text-xs font-bold text-[#15803D] hover:underline flex items-center gap-1"
              >
                <span>Ir al módulo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">SKU</th>
                    <th className="px-3.5 py-2.5">Cant. Sugerida</th>
                    <th className="px-3.5 py-2.5">Fecha Límite</th>
                    <th className="px-3.5 py-2.5">Estado</th>
                    <th className="px-3.5 py-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {recosMes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                        No hay recomendaciones registradas para el periodo {periodo}.
                      </td>
                    </tr>
                  ) : (
                    recosMes.map((r) => {
                      const dec = decisionesMes.find((d) => d.sku_id === r.sku_id);
                      return (
                        <tr key={r.reco_id} className="hover:bg-slate-50/80">
                          <td className="px-3.5 py-2.5 font-bold text-slate-900">
                            {r.sku_id}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-blue-700">
                            {r.cantidad_recomendada.toLocaleString()} {r.unidad}
                          </td>
                          <td className="px-3.5 py-2.5">{r.fecha_limite_emision}</td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                r.estado === 'APROBADA'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.estado === 'MODIFICADA'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.estado === 'RECHAZADA'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-900 animate-pulse'
                              }`}
                            >
                              {r.estado}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-sans">
                            {r.estado === 'PENDIENTE' ? (
                              <Link
                                to={`/recomendaciones/${r.reco_id}`}
                                className="px-2.5 py-1 bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-[11px] rounded transition-colors"
                              >
                                Decidir
                              </Link>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {dec ? `Por ${dec.usuario_id}` : 'Resuelto'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Decisiones Tomadas con Responsable */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Decisiones Tomadas en la Revisión de {periodo}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">ID Decisión</th>
                    <th className="px-3.5 py-2.5">SKU</th>
                    <th className="px-3.5 py-2.5">Sugerido</th>
                    <th className="px-3.5 py-2.5">Final Acordado</th>
                    <th className="px-3.5 py-2.5">Responsable</th>
                    <th className="px-3.5 py-2.5">Comentario / Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {decisionesMes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                        Aún no se han tomado decisiones para el periodo {periodo}.
                      </td>
                    </tr>
                  ) : (
                    decisionesMes.map((d) => (
                      <tr key={d.decision_id} className="hover:bg-slate-50/80">
                        <td className="px-3.5 py-2.5 font-bold text-slate-900">{d.decision_id}</td>
                        <td className="px-3.5 py-2.5 font-extrabold">{d.sku_id}</td>
                        <td className="px-3.5 py-2.5">{d.cantidad_recomendada.toLocaleString()}</td>
                        <td className="px-3.5 py-2.5 font-extrabold text-blue-700">
                          {d.cantidad_final.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 font-sans font-bold text-slate-700">
                          {d.usuario_id}
                        </td>
                        <td className="px-3.5 py-2.5 font-sans text-slate-600 text-[11px]">
                          {d.comentario || d.motivo_desviacion}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Lateral: KPIs Fuera de Meta y Acciones de Cierre */}
        <div className="space-y-6">
          {/* KPIs Fuera de Meta */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>KPIs Fuera de Meta ({periodo})</span>
            </h3>

            {kpisFueraMeta.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                ✅ Todos los KPIs se encuentran dentro de las metas para este periodo.
              </p>
            ) : (
              <div className="space-y-2.5">
                {kpisFueraMeta.map((k) => (
                  <div
                    key={`${k.kpi}-${k.dimension}`}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-rose-900">
                      <span>{k.kpi.toUpperCase()}</span>
                      <span className="font-mono">{k.dimension}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-rose-800 font-mono">
                      <span>Valor real: {k.valor}</span>
                      <span>Meta: {k.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cierre de Revisión y Acta */}
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold">Cierre de Sesión y Acta Oficial</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Al finalizar el comité, se consolida el Acta de la Revisión. El botón exige resolver todas las decisiones pendientes.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleCerrarRevision}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Cerrar Revisión ({periodo})</span>
              </button>

              <Link
                to={`/revision/${reviewActual.review_id}/acta`}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Ver / Imprimir Acta de Revisión</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compromisos de Revisiones Anteriores */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#15803D]" />
              <span>Compromisos Abiertos y Seguimiento de Acuerdos</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acuerdos generados en comités anteriores con fecha objetivo y estado de ejecución
            </p>
          </div>

          <button
            onClick={() => setShowAddAccionModal(true)}
            className="px-3 py-1.5 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Compromiso</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Código</th>
                <th className="px-3.5 py-2.5">Origen</th>
                <th className="px-3.5 py-2.5">Descripción del Acuerdo</th>
                <th className="px-3.5 py-2.5">Responsable</th>
                <th className="px-3.5 py-2.5">Fecha Objetivo</th>
                <th className="px-3.5 py-2.5">Estado</th>
                <th className="px-3.5 py-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {acciones.map((acc) => (
                <tr key={acc.accion_id} className="hover:bg-slate-50/80">
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">{acc.accion_id}</td>
                  <td className="px-3.5 py-2.5 text-slate-500">{acc.review_id}</td>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-800 max-w-md">
                    {acc.descripcion}
                  </td>
                  <td className="px-3.5 py-2.5 font-sans font-bold text-slate-700">
                    {acc.responsable}
                  </td>
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">
                    {acc.fecha_objetivo}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        acc.estado === 'CERRADA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : acc.estado === 'EN_CURSO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {acc.estado}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-sans">
                    <button
                      onClick={() => handleToggleEstadoAccion(acc.accion_id, acc.estado)}
                      className="text-xs text-[#15803D] hover:text-[#14532D] font-bold hover:underline cursor-pointer"
                    >
                      {acc.estado === 'CERRADA' ? 'Reabrir' : 'Marcar CERRADA'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Muestra decisiones pendientes que bloquean el cierre */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <XCircle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No se puede cerrar la revisión
                </h3>
                <p className="text-xs text-slate-500">
                  Existen decisiones de abastecimiento pendientes para el periodo {periodo}.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2">
              <span className="font-bold text-rose-900 block uppercase text-[10px] tracking-wider">
                Recomendaciones sin resolver:
              </span>
              <ul className="list-disc list-inside space-y-1 text-rose-800 font-mono">
                {pendingList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPendingModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Entendido
              </button>
              <Link
                to="/recomendaciones"
                onClick={() => setShowPendingModal(false)}
                className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Ir a Decisiones
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Agregar nuevo compromiso */}
      {showAddAccionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCrearCompromiso}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Registrar Nuevo Compromiso del Comité
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción del Acuerdo / Acción de Mejora
                </label>
                <textarea
                  required
                  rows={3}
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="Ej: Gestionar con proveedor PRV-001 la reducción de lead time en 5 días..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Responsable
                  </label>
                  <select
                    value={nuevoResponsable}
                    onChange={(e) => setNuevoResponsable(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="USR-001">USR-001 (Rosa Quispe - Compras)</option>
                    <option value="USR-002">USR-002 (Luis Berrocal - Analista)</option>
                    <option value="USR-003">USR-003 (Marta Chávez - Operaciones)</option>
                    <option value="USR-004">USR-004 (Diego Ferrer - Planeamiento)</option>
                    <option value="USR-006">USR-006 (Jorge Palma - Finanzas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha Objetivo
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddAccionModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Guardar Compromiso
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
