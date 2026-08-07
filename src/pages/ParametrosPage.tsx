import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { mockProvider } from '../services/mockProvider';
import { PoliticaVersion, SugerenciaParametro, Sku } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import {
  Sliders,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Save,
  Lock,
} from 'lucide-react';

export function ParametrosPage() {
  const { getPermiso, currentUser, skus } = useAppStore();
  const permisoParametros = getPermiso('parametros');

  const [tabActive, setTabActive] = React.useState<'vigentes' | 'historico' | 'sugerencias'>('vigentes');
  const [politicas, setPoliticas] = React.useState<PoliticaVersion[]>([]);
  const [sugerencias, setSugerencias] = React.useState<SugerenciaParametro[]>([]);
  const [skuSeleccionado, setSkuSeleccionado] = React.useState<string>('INS-001');

  // Formulario de Edición o Sugerencia
  const [nuevoNivelServicio, setNuevoNivelServicio] = React.useState<number>(0.98);
  const [nuevaCoberturaObjetivo, setNuevaCoberturaObjetivo] = React.useState<number>(45);
  const [motivoInput, setMotivoInput] = React.useState<string>('');

  const cargarPoliticasYSugerencias = React.useCallback(async () => {
    const [pList, sList] = await Promise.all([
      mockProvider.getPoliticaVersiones(),
      mockProvider.getSugerencias(),
    ]);
    setPoliticas(pList);
    setSugerencias(sList);
  }, []);

  React.useEffect(() => {
    cargarPoliticasYSugerencias();
  }, [cargarPoliticasYSugerencias]);

  // Actualizar valores del formulario cuando cambia el SKU seleccionado
  React.useEffect(() => {
    const vigente = politicas.find((p) => p.sku_id === skuSeleccionado && p.estado_version === 'VIGENTE');
    if (vigente) {
      setNuevoNivelServicio(vigente.nivel_servicio_objetivo ?? vigente.nivel_servicio);
      setNuevaCoberturaObjetivo(vigente.cobertura_objetivo_dias);
    }
  }, [skuSeleccionado, politicas]);

  if (permisoParametros === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  const tieneEscritura = permisoParametros === 'ESCRITURA';
  const politicasVigentes = politicas.filter((p) => p.estado_version === 'VIGENTE');
  const politicaActual = politicas.find(
    (p) => p.sku_id === skuSeleccionado && p.estado_version === 'VIGENTE'
  );

  // Enviar Nueva Versión Directa (Solo ESCRITURA)
  const handleGuardarNuevaVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoInput.trim()) {
      alert('Debes ingresar un motivo obligatorio para el cambio de versión de parámetros.');
      return;
    }

    if (!politicaActual) return;

    await mockProvider.updatePolitica(
      politicaActual.sku_id,
      {
        nivel_servicio: nuevoNivelServicio,
        nivel_servicio_objetivo: nuevoNivelServicio,
        cobertura_objetivo_dias: nuevaCoberturaObjetivo,
      },
      motivoInput,
      currentUser?.usuario_id || 'USR-003'
    );

    setMotivoInput('');
    await cargarPoliticasYSugerencias();
    alert(`¡Nueva versión de política de reorden activada correctamente para ${skuSeleccionado}!`);
  };

  // Enviar Sugerencia de Cambio (Rol PROPUESTA)
  const handleEnviarSugerencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivoInput.trim()) {
      alert('Debes ingresar el motivo de la sugerencia.');
      return;
    }

    if (!politicaActual) return;

    await mockProvider.proposePolitica(
      skuSeleccionado,
      'nivel_servicio_objetivo',
      politicaActual.nivel_servicio_objetivo,
      nuevoNivelServicio,
      motivoInput,
      currentUser?.usuario_id || 'USR-002'
    );

    setMotivoInput('');
    await cargarPoliticasYSugerencias();
    alert('Sugerencia de cambio enviada exitosamente para revisión de la Gerencia de Operaciones.');
  };

  // Aprobar / Rechazar Sugerencia
  const handleResponderSugerencia = async (
    sugerenciaId: string,
    aprobada: boolean
  ) => {
    await mockProvider.responderSugerencia(
      sugerenciaId,
      aprobada,
      currentUser?.usuario_id || 'USR-003'
    );
    await cargarPoliticasYSugerencias();
    alert(`Sugerencia ${sugerenciaId} procesada.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#15803D]" />
            <span>Configuración de Parámetros de Abastecimiento & Control de Versiones</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Niveles de servicio objetivo, días de cobertura meta y gobernanza de cambios con trazabilidad.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs font-mono">
          <span className="text-slate-500">Permiso asignado:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              tieneEscritura ? 'bg-emerald-100 text-emerald-900' : 'bg-green-100 text-green-900'
            }`}
          >
            {tieneEscritura ? 'ESCRITURA (Aprobación)' : 'PROPUESTA (Sugerencias)'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTabActive('vigentes')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            tabActive === 'vigentes'
              ? 'border-[#15803D] text-[#15803D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parámetros Vigentes</span>
        </button>

        <button
          onClick={() => setTabActive('historico')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            tabActive === 'historico'
              ? 'border-[#15803D] text-[#15803D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Versiones ({politicas.length})</span>
        </button>

        <button
          onClick={() => setTabActive('sugerencias')}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-colors cursor-pointer flex items-center gap-2 relative ${
            tabActive === 'sugerencias'
              ? 'border-[#15803D] text-[#15803D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sugerencias Pendientes</span>
          {sugerencias.filter((s) => s.estado === 'PENDIENTE_APROBACION').length > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-600 text-white font-mono font-bold text-[10px] rounded-full">
              {sugerencias.filter((s) => s.estado === 'PENDIENTE_APROBACION').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PARÁMETROS VIGENTES Y EDICIÓN / PROPUESTA */}
      {tabActive === 'vigentes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Modificación o Propuesta */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {tieneEscritura ? (
                  <Save className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Send className="w-4 h-4 text-[#15803D]" />
                )}
                <span>
                  {tieneEscritura ? 'Crear Nueva Versión Vigente' : 'Enviar Sugerencia de Cambio'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {tieneEscritura
                  ? 'Crea una versión nueva con vigente_desde hoy y pasa la anterior a HISTORICA.'
                  : 'Somete una propuesta de modificación para evaluación y aprobación del aprobador.'}
              </p>
            </div>

            <form onSubmit={tieneEscritura ? handleGuardarNuevaVersion : handleEnviarSugerencia} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Seleccionar SKU Target</label>
                <select
                  value={skuSeleccionado}
                  onChange={(e) => setSkuSeleccionado(e.target.value)}
                  className="w-full border border-slate-300 font-bold font-mono rounded p-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                >
                  {skus.map((s) => (
                    <option key={s.sku_id} value={s.sku_id}>
                      {s.sku_id} — {s.nombre} (Clase {s.clase_abc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nivel de Servicio Objetivo (% fill rate)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.80"
                  max="0.99"
                  required
                  value={nuevoNivelServicio}
                  onChange={(e) => setNuevoNivelServicio(parseFloat(e.target.value) || 0.95)}
                  className="w-full border border-slate-300 font-bold font-mono rounded p-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  Ej: 0.98 representa 98.0% de nivel de servicio
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cobertura Objetivo (Días de Inventario)
                </label>
                <input
                  type="number"
                  required
                  min="15"
                  max="120"
                  value={nuevaCoberturaObjetivo}
                  onChange={(e) => setNuevaCoberturaObjetivo(parseInt(e.target.value, 10) || 30)}
                  className="w-full border border-slate-300 font-bold font-mono rounded p-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {tieneEscritura ? 'Motivo del Cambio (Obligatorio)' : 'Motivo de la Sugerencia (Obligatorio)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoInput}
                  onChange={(e) => setMotivoInput(e.target.value)}
                  placeholder="Justificación técnica o de negocio para el ajuste de política..."
                  className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-green-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  tieneEscritura
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#15803D] hover:bg-[#14532D] text-white'
                }`}
              >
                {tieneEscritura ? <Save className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>
                  {tieneEscritura ? 'Guardar Nueva Versión Vigente' : 'Enviar Sugerencia a Revisión'}
                </span>
              </button>
            </form>
          </div>

          {/* Tabla de Políticas Actualmente Vigentes */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Políticas de Reorden Activas (VIGENTE)</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">{politicasVigentes.length} reglas vigentes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Versión</th>
                    <th className="px-3.5 py-2.5">SKU</th>
                    <th className="px-3.5 py-2.5 font-mono">Nivel Serv.</th>
                    <th className="px-3.5 py-2.5 font-mono">Cob. Obj.</th>
                    <th className="px-3.5 py-2.5">Vigente Desde</th>
                    <th className="px-3.5 py-2.5">Motivo del Cambio</th>
                    <th className="px-3.5 py-2.5">Aprobado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {politicasVigentes.map((p) => (
                    <tr
                      key={p.version_id}
                      onClick={() => setSkuSeleccionado(p.sku_id)}
                      className={`hover:bg-slate-50/80 cursor-pointer ${
                        p.sku_id === skuSeleccionado ? 'bg-blue-50/60 font-bold' : ''
                      }`}
                    >
                      <td className="px-3.5 py-2.5 font-bold text-blue-900">{p.version_id}</td>
                      <td className="px-3.5 py-2.5 font-extrabold text-slate-900">{p.sku_id}</td>
                      <td className="px-3.5 py-2.5 font-bold text-emerald-700">
                        {((p.nivel_servicio_objetivo ?? p.nivel_servicio) * 100).toFixed(1)}%
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">
                        {p.cobertura_objetivo_dias} días
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-600">{p.vigente_desde}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-700 text-[10px] max-w-xs">
                        {p.motivo_cambio}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans font-bold text-slate-800">
                        {p.creado_por}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE VERSIONES */}
      {tabActive === 'historico' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Trazabilidad Completa de Versiones de Políticas de Parámetros</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">ID Versión</th>
                  <th className="px-3.5 py-2.5">SKU</th>
                  <th className="px-3.5 py-2.5 font-mono">Ver. #</th>
                  <th className="px-3.5 py-2.5 font-mono">Nivel Serv.</th>
                  <th className="px-3.5 py-2.5 font-mono">Cob. Meta</th>
                  <th className="px-3.5 py-2.5">Vigente Desde</th>
                  <th className="px-3.5 py-2.5">Vigente Hasta</th>
                  <th className="px-3.5 py-2.5">Estado</th>
                  <th className="px-3.5 py-2.5">Motivo del Cambio</th>
                  <th className="px-3.5 py-2.5">Registrado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {politicas.map((p) => (
                  <tr key={p.version_id} className="hover:bg-slate-50/80">
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">{p.version_id}</td>
                    <td className="px-3.5 py-2.5 font-extrabold">{p.sku_id}</td>
                    <td className="px-3.5 py-2.5 font-bold">v{p.version_num}</td>
                    <td className="px-3.5 py-2.5">{((p.nivel_servicio_objetivo ?? p.nivel_servicio) * 100).toFixed(1)}%</td>
                    <td className="px-3.5 py-2.5">{p.cobertura_objetivo_dias}d</td>
                    <td className="px-3.5 py-2.5 font-sans">{p.vigente_desde}</td>
                    <td className="px-3.5 py-2.5 font-sans">{p.vigente_hasta || '—'}</td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.estado_version === 'VIGENTE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.estado_version}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-700 text-[10px] max-w-xs">
                      {p.motivo_cambio}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans font-bold text-slate-700">
                      {p.creado_por}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUGERENCIAS PENDIENTES DE APROBACIÓN */}
      {tabActive === 'sugerencias' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Sugerencias de Modificación de Parámetros Enviadas</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{sugerencias.length} sugerencias</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2.5">ID Sugerencia</th>
                  <th className="px-3.5 py-2.5">SKU Target</th>
                  <th className="px-3.5 py-2.5 font-mono">Nivel Serv. Sugerido</th>
                  <th className="px-3.5 py-2.5 font-mono">Cob. Sugerida</th>
                  <th className="px-3.5 py-2.5">Solicitado Por</th>
                  <th className="px-3.5 py-2.5">Motivo / Justificación</th>
                  <th className="px-3.5 py-2.5">Estado</th>
                  <th className="px-3.5 py-2.5 text-right">Acciones de Aprobación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {sugerencias.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 font-sans">
                      No hay sugerencias de modificación de parámetros registradas.
                    </td>
                  </tr>
                ) : (
                  sugerencias.map((s) => (
                    <tr key={s.sugerencia_id} className="hover:bg-slate-50/80">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{s.sugerencia_id}</td>
                      <td className="px-3.5 py-2.5 font-extrabold text-blue-900">{s.sku_id}</td>
                      <td className="px-3.5 py-2.5 font-bold text-blue-700">
                        {(s.nivel_servicio_sugerido * 100).toFixed(1)}%
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">
                        {s.cobertura_sugerida_dias} días
                      </td>
                      <td className="px-3.5 py-2.5 font-sans font-bold text-slate-700">
                        {s.solicitado_por}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-700 text-[10px] max-w-xs">
                        {s.motivo_sugerencia}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            s.estado === 'APROBADA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.estado === 'RECHAZADA'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900 animate-pulse'
                          }`}
                        >
                          {s.estado}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-sans">
                        {s.estado === 'PENDIENTE_APROBACION' && tieneEscritura ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleResponderSugerencia(s.sugerencia_id, true)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer transition-colors"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleResponderSugerencia(s.sugerencia_id, false)}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded cursor-pointer transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            {s.resuelto_por ? `Por ${s.resuelto_por}` : 'En revisión'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
