import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Unauthorized403 } from './Unauthorized403';
import { Modal } from '../components/ui/Modal';
import { formatoFechaISOAFormatoPeruano, formatoNumero } from '../engine/formato';
import { calcularConsecuenciaMotor } from '../engine/consecuencia';
import {
  ArrowLeft,
  CheckSquare,
  ShieldCheck,
  Building2,
  AlertTriangle,
  TrendingDown,
  Info,
  Sliders,
  CheckCircle2,
  XCircle,
  Edit3,
  DollarSign,
  Calendar,
  Lock,
} from 'lucide-react';
import { Recomendacion } from '../types';

export function DetalleRecomendacionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    recomendaciones,
    skus,
    proveedores,
    campanias,
    submitDecision,
    currentUser,
    getPermiso,
  } = useAppStore();

  const permiso = getPermiso('recomendaciones');

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  // Buscar recomendación por ID o por default
  let reco = recomendaciones.find((r) => r.reco_id === id);
  if (!reco && recomendaciones.length > 0) {
    reco = recomendaciones[0];
  }

  if (!reco) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <CheckSquare className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Recomendación No Encontrada</h3>
        <button
          onClick={() => navigate('/recomendaciones')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const skuInfo = skus.find((s) => s.sku_id === reco.sku_id) || {
    sku_id: reco.sku_id,
    nombre: 'Insumo de Carnauba / Resina',
    categoria: 'Cera',
    unidad: reco.unidad,
    clase_abc: 'A' as const,
    criticidad: 'ALTA' as const,
    proveedor_default: reco.proveedor_recomendado,
    lote_minimo: 600,
    multiplo_compra: 150,
    precio_referencia_usd: 6.8,
  };

  const provRec = proveedores.find((p) => p.proveedor_id === reco.proveedor_recomendado) || {
    proveedor_id: reco.proveedor_recomendado,
    nombre: 'Carnauba do Nordeste Ltda',
    pais: 'Brasil',
    incoterm: 'FOB Santos',
    moneda: 'USD',
    lead_time_promedio_dias: 47,
    lead_time_desv_dias: 9,
    estado_homologacion: 'Homologado' as const,
    otif_historico: 0.86,
  };

  const provAlt = proveedores.find((p) => p.proveedor_id === reco.proveedor_alterno);

  // Días restantes para fecha límite emisión (2026-08-07 fecha base)
  const fechaLim = new Date(reco.fecha_limite_emision);
  const hoy = new Date('2026-08-07');
  const diffMs = fechaLim.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Capital inmovilizado
  const capitalUsd = Math.round(reco.cantidad_recomendada * skuInfo.precio_referencia_usd);

  // ESTADO DEL SIMULADOR
  const [simCantidad, setSimCantidad] = React.useState<number>(reco.cantidad_recomendada);
  const [simFechaEmision, setSimFechaEmision] = React.useState<string>(reco.fecha_limite_emision);

  // Recálculo del simulador en vivo con el motor
  const simulacion = React.useMemo(() => {
    return calcularConsecuenciaMotor(
      skuInfo,
      simCantidad,
      1270, // inventario actual aprox
      33.13, // consumo promedio diario
      campanias
    );
  }, [skuInfo, simCantidad, campanias]);

  // ESTADO DEL MODAL DE REGISTRAR DECISIÓN
  const [modalOpen, setModalOpen] = React.useState(false);
  const [accion, setAccion] = React.useState<'APROBADA' | 'MODIFICADA' | 'RECHAZADA'>('APROBADA');
  const [cantidadFinalInput, setCantidadFinalInput] = React.useState<number>(reco.cantidad_recomendada);
  const [comentarioInput, setComentarioInput] = React.useState('');
  const [motivoDesviacion, setMotivoDesviacion] = React.useState('CAPITAL_TRABAJO');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Consecuencia en vivo dentro del modal
  const consecuenciaModal = React.useMemo(() => {
    const cantVal = accion === 'RECHAZADA' ? 0 : cantidadFinalInput;
    return calcularConsecuenciaMotor(
      skuInfo,
      cantVal,
      1270,
      33.13,
      campanias
    );
  }, [skuInfo, accion, cantidadFinalInput, campanias]);

  const handleOpenModal = () => {
    setAccion('APROBADA');
    setCantidadFinalInput(reco.cantidad_recomendada);
    setComentarioInput('Aprobado por el comité en base a la evaluación técnica.');
    setMotivoDesviacion('CAPITAL_TRABAJO');
    setModalOpen(true);
  };

  const handleConfirmDecision = async () => {
    if (!currentUser) return;

    // Validación de comentario
    if (comentarioInput.trim().length < 10) {
      alert('El comentario es obligatorio y debe contener al menos 10 caracteres.');
      return;
    }

    if (accion === 'MODIFICADA' && (!cantidadFinalInput || cantidadFinalInput <= 0)) {
      alert('Para modificar la recomendación, la cantidad final debe ser mayor a 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cantFinalReal = accion === 'RECHAZADA' ? 0 : consecuenciaModal.cantidadAjustada;
      const desvPct =
        reco.cantidad_recomendada > 0
          ? (cantFinalReal - reco.cantidad_recomendada) / reco.cantidad_recomendada
          : 0;

      await submitDecision({
        periodo: reco.periodo,
        sku_id: reco.sku_id,
        usuario_id: currentUser.usuario_id,
        accion,
        cantidad_recomendada: reco.cantidad_recomendada,
        cantidad_final: cantFinalReal,
        desviacion_pct: accion === 'RECHAZADA' ? -1.0 : desvPct,
        comentario: comentarioInput,
        motivo_desviacion: accion === 'APROBADA' ? 'NINGUNA' : motivoDesviacion,
        resultado_posterior: 'PENDIENTE',
      });

      setSuccessMsg(`Decisión ${accion} guardada y auditada con éxito.`);
      setModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la decisión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tienePermisoEscritura = permiso === 'ESCRITURA' || permiso === 'PROPUESTA';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Volver & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/recomendaciones')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Defensa de Recomendación de Compra — {reco.reco_id}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {reco.sku_id}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ficha explicativa para sustentar la orden de compra ante el Comité S&OP
            </p>
          </div>
        </div>

        {tienePermisoEscritura && (
          <button
            onClick={handleOpenModal}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Registrar Decisión del Comité</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center space-x-2 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* BLOQUE PRINCIPAL 1: CANTIDAD Y FECHA LÍMITE (TARJETAS HERO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute top-3 right-3 opacity-10">
            <CheckSquare className="w-32 h-32 text-white" />
          </div>
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
            Cantidad Recomendada
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black font-mono tracking-tight">
              {formatoNumero(reco.cantidad_recomendada, 0)}
            </span>
            <span className="text-lg font-bold text-indigo-200">{reco.unidad}</span>
          </div>
          <p className="text-xs text-slate-300 font-sans pt-1">
            Monto de inversión proyectado: <strong className="text-emerald-300 font-mono">USD ${formatoNumero(capitalUsd, 0)}</strong>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Fecha Límite de Emisión de la Orden
            </span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {formatoFechaISOAFormatoPeruano(reco.fecha_limite_emision)}
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full font-mono ${
                  diasRestantes <= 10
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {diasRestantes > 0 ? `${diasRestantes} días restantes` : 'Límite vencido'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Emitir después de esta fecha compromete el inicio de la campaña exportadora.
          </p>
        </div>
      </div>

      {/* BLOQUE PRINCIPAL 2: PROVEEDORES Y COBERTURA (DOS COLUMNAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proveedores */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Proveedor Recomendado & Alterno</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900">{provRec.nombre}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                {provRec.estado_homologacion}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Lead Time Prom.:</span>
                <span className="font-bold text-slate-800">{provRec.lead_time_promedio_dias} días</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Lead Time P90:</span>
                <span className="font-bold text-slate-800">{provRec.lead_time_promedio_dias + provRec.lead_time_desv_dias} días</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">OTIF Histórico:</span>
                <span className="font-bold text-indigo-700">
                  {provRec.otif_historico ? `${Math.round(provRec.otif_historico * 100)}%` : 'N/D'}
                </span>
              </div>
            </div>
          </div>

          {provAlt ? (
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Proveedor Alterno</span>
              <p className="font-bold text-slate-800">{provAlt.nombre}</p>
            </div>
          ) : (
            <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400">
              No se dispone de un proveedor alterno homologado para este insumo específico.
            </div>
          )}
        </div>

        {/* Cobertura Comparativa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-indigo-600" />
            <span>Impacto en Cobertura (Antes vs. Después)</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-500">Cobertura Actual (Antes):</span>
                <span className="text-rose-700 font-mono">{reco.cobertura_antes_dias} días</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (reco.cobertura_antes_dias / 250) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Cobertura con la Orden (Después):</span>
                <span className="text-emerald-700 font-mono">{reco.cobertura_despues_dias} días</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (reco.cobertura_despues_dias / 250) * 100)}%` }}
                ></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              Garantiza cobertura total durante el pico de campaña exportadora de Mango (Nov-Mar).
            </p>
          </div>
        </div>
      </div>

      {/* BLOQUE PRINCIPAL 3: SUPUESTOS & RIESGOS (MATRIZ EXPLICABLE) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Supuestos del Cálculo y Evaluación Cuantitativa de Riesgo</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Supuestos */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-extrabold text-slate-900 block text-[11px] uppercase tracking-wider">
              Supuestos Utilizados
            </span>
            <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
              {reco.supuestos}
            </p>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200">
              Versión de Regla: <strong>{reco.regla_version}</strong>
            </div>
          </div>

          {/* Riesgo No Comprar */}
          <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-200 space-y-2">
            <span className="font-extrabold text-rose-950 block text-[11px] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Riesgo de NO Comprar
            </span>
            <p className="text-rose-900 font-sans text-[11px] leading-relaxed">
              {reco.riesgo_no_comprar}
            </p>
            <div className="pt-2 text-[11px] font-bold text-rose-800 border-t border-rose-200/60 font-mono">
              Quiebre aseg. durante pico de planta
            </div>
          </div>

          {/* Riesgo Sobreinventario */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
            <span className="font-extrabold text-amber-950 block text-[11px] uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              Riesgo de Sobreinventario
            </span>
            <p className="text-amber-900 font-sans text-[11px] leading-relaxed">
              {reco.riesgo_sobreinventario}
            </p>
            <div className="pt-2 text-[11px] font-bold text-amber-900 border-t border-amber-200/60 font-mono">
              Capital inmovilizado: USD ${formatoNumero(capitalUsd, 0)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-100">
          <span>Nivel de Confianza: <strong className="text-slate-900">{reco.nivel_confianza}</strong></span>
          <span>Modelo: <strong>{reco.modelo_version}</strong></span>
        </div>
      </div>

      {/* BLOQUE PRINCIPAL 4: SIMULADOR DE ESCENARIOS (RECÁLCULO EN VIVO CON MOTOR) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Simulador Interactivo de Sensibilidad (S&OP Live Engine)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Modifique la cantidad o fecha para recalcular la cobertura, quiebre y capital inmovilizado en vivo (sin guardar).
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 text-indigo-300 px-3 py-1 rounded-full border border-slate-700">
            Lote Mínimo: {skuInfo.lote_minimo} {skuInfo.unidad} | Múltiplo: {skuInfo.multiplo_compra} {skuInfo.unidad}
          </span>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Cantidad Acomodada ({skuInfo.unidad}):
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={0}
                max={15000}
                step={50}
                value={simCantidad}
                onChange={(e) => setSimCantidad(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <input
                type="number"
                value={simCantidad}
                onChange={(e) => setSimCantidad(Number(e.target.value))}
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-sm font-extrabold text-indigo-300 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {simulacion.ajustadoLote && (
              <div className="p-2.5 bg-amber-950/70 border border-amber-800/80 rounded-lg text-amber-200 text-[11px] font-medium flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{simulacion.mensajeAjuste}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Fecha de Emisión Simulada:
            </label>
            <input
              type="date"
              value={simFechaEmision}
              onChange={(e) => setSimFechaEmision(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Resultados del simulador en vivo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase">Cobertura Resultante:</span>
            <span className="text-xl font-black text-emerald-400">{simulacion.coberturaDias} días</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase">Mes de Quiebre Proyectado:</span>
            <span className="text-sm font-bold text-white block capitalize">{simulacion.mesQuiebreTexto}</span>
            {simulacion.enVentanaCampania && (
              <span className="text-[10px] text-rose-400 font-sans">
                Caería dentro de campaña ({simulacion.nombreCampania})
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase">Capital Inmovilizado:</span>
            <span className="text-xl font-black text-amber-300">USD ${formatoNumero(simulacion.capitalUsd, 0)}</span>
          </div>
        </div>
      </div>

      {/* MODAL PARA REGISTRAR LA DECISIÓN HUMANA CON CONSECUENCIA CALCULADA */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Registrar Decisión del Comité — ${reco.reco_id}`}
      >
        <div className="space-y-5 text-xs text-slate-800">
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
            <span className="font-extrabold text-slate-900 block">{skuInfo.sku_id} — {skuInfo.nombre}</span>
            <span className="text-slate-500 text-[11px] font-mono">
              Cantidad Recomendada Original: {formatoNumero(reco.cantidad_recomendada, 0)} {reco.unidad} | USD ${formatoNumero(capitalUsd, 0)}
            </span>
          </div>

          {/* Selector de Acción */}
          <div>
            <label className="block font-extrabold text-slate-900 mb-1.5">Acción del Comité S&OP:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAccion('APROBADA');
                  setCantidadFinalInput(reco.cantidad_recomendada);
                }}
                className={`py-2.5 px-3 rounded-xl border text-center font-extrabold text-xs transition-all ${
                  accion === 'APROBADA'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Aprobar Sin Cambios
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccion('MODIFICADA');
                }}
                className={`py-2.5 px-3 rounded-xl border text-center font-extrabold text-xs transition-all ${
                  accion === 'MODIFICADA'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Modificar Cantidad
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccion('RECHAZADA');
                  setCantidadFinalInput(0);
                }}
                className={`py-2.5 px-3 rounded-xl border text-center font-extrabold text-xs transition-all ${
                  accion === 'RECHAZADA'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-100 hover:bg-slate-100'
                }`}
              >
                Rechazar Orden
              </button>
            </div>
          </div>

          {/* Cantidad Final Obligatoria si MODIFICADA */}
          {accion === 'MODIFICADA' && (
            <div className="space-y-1">
              <label className="block font-bold text-slate-800">
                Cantidad Final Aprobada ({reco.unidad}) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                value={cantidadFinalInput}
                onChange={(e) => setCantidadFinalInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {consecuenciaModal.ajustadoLote && (
                <p className="text-[11px] text-amber-700 font-semibold pt-0.5">
                  ⚠️ {consecuenciaModal.mensajeAjuste}
                </p>
              )}
            </div>
          )}

          {/* Motivo de Desviación Obligatorio si MODIFICADA o RECHAZADA */}
          {(accion === 'MODIFICADA' || accion === 'RECHAZADA') && (
            <div className="space-y-1">
              <label className="block font-bold text-slate-800">
                Motivo de Desviación <span className="text-rose-600">*</span>
              </label>
              <select
                value={motivoDesviacion}
                onChange={(e) => setMotivoDesviacion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="CAPITAL_TRABAJO">CAPITAL_TRABAJO (Restricción de presupuesto o caja)</option>
                <option value="ACUERDO_PROVEEDOR">ACUERDO_PROVEEDOR (Descuento por lote o renegociación)</option>
                <option value="SOBRESTOCK_DETECTADO">SOBRESTOCK_DETECTADO (Insumo encontrado en almacén secundario)</option>
                <option value="CAMBIO_PROYECCION">CAMBIO_PROYECCION (Modificación de programa comercial)</option>
                <option value="RIESGO_LOGISTICO">RIESGO_LOGISTICO (Congestión en puerto de origen)</option>
                <option value="OTRO">OTRO (Especificar en comentario)</option>
              </select>
            </div>
          )}

          {/* Comentario Obligatorio (min 10 chars) */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-800">
              Comentario Sustentatorio (Mínimo 10 caracteres) <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={comentarioInput}
              onChange={(e) => setComentarioInput(e.target.value)}
              placeholder="Detalle la fundamentación discutida en el comité S&OP..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Mínimo 10 caracteres</span>
              <span className={comentarioInput.trim().length < 10 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {comentarioInput.trim().length} / 10
              </span>
            </div>
          </div>

          {/* ADVERTENCIA DE CONSECUENCIA CALCULADA POR EL MOTOR */}
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-1">
            <div className="flex items-center space-x-2 font-extrabold text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Consecuencia Calculada por el Motor:</span>
            </div>
            <p className="text-[11px] font-sans leading-relaxed">
              "{consecuenciaModal.advertenciaTexto}"
            </p>
            <p className="text-[10px] text-amber-800 italic pt-1">
              El sistema aceptará la decisión de todos modos y dejará constancia en el historial de auditoría.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmDecision}
              className="px-5 py-2 bg-[#15803D] hover:bg-[#14532D] text-white font-extrabold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar Decisión'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
