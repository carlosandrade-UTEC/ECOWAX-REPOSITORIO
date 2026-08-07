import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Unauthorized403 } from './Unauthorized403';
import { CriticidadBadge, AbcBadge } from '../components/ui/Badge';
import { ProyeccionChart } from '../components/charts/ProyeccionChart';
import { formatoFechaISOAFormatoPeruano, formatoNumero } from '../engine/formato';
import {
  ArrowLeft,
  AlertTriangle,
  CheckSquare,
  ShieldAlert,
  Clock,
  Package,
  Calendar,
  User,
  Sliders,
  FileText,
} from 'lucide-react';

export function DetalleAlertaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alertas, recomendaciones, proyecciones, skus, getPermiso } = useAppStore();
  const permiso = getPermiso('alertas');

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  const alerta = alertas.find((a) => a.alerta_id === id);

  if (!alerta) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Alerta No Encontrada</h3>
        <p className="text-xs text-slate-500">No se encontró ninguna alerta con el ID: {id}</p>
        <button
          onClick={() => navigate('/alertas')}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const skuInfo = skus.find((s) => s.sku_id === alerta.sku_id);
  const proyeccionSku = proyecciones.filter((p) => p.sku_id === alerta.sku_id);
  const recomendacionAsociada = recomendaciones.find(
    (r) => r.alerta_id === alerta.alerta_id || (r.sku_id === alerta.sku_id && r.periodo === '2026-08')
  );

  const hoyStr = '2026-08-07';
  const esEstadoInicial = alerta.estado === 'NUEVA' || (alerta.estado as string) === 'EN_REVISION';
  const esVencida = esEstadoInicial && alerta.fecha_limite_emision < hoyStr;

  let diasRetraso = 0;
  if (esVencida) {
    const fechaLim = new Date(alerta.fecha_limite_emision);
    const hoy = new Date(hoyStr);
    const diffTime = hoy.getTime() - fechaLim.getTime();
    diasRetraso = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // 16 campos explícitos de la alerta
  const camposFicha = [
    { label: 'ID de Alerta', value: alerta.alerta_id, mono: true, highlight: true },
    { label: 'Fecha Creación', value: formatoFechaISOAFormatoPeruano(alerta.fecha_creacion), mono: true },
    { label: 'SKU Insumo', value: `${alerta.sku_id} ${skuInfo ? `(${skuInfo.nombre})` : ''}`, mono: true },
    { label: 'Clase ABC', component: <AbcBadge clase={alerta.clase_abc} /> },
    { label: 'Tipo de Alerta', value: alerta.tipo_alerta, mono: true },
    { label: 'Criticidad', component: <CriticidadBadge criticidad={alerta.criticidad} /> },
    { label: 'Inventario Actual', value: `${formatoNumero(alerta.inventario_actual, 1)} ${alerta.unidad}`, mono: true },
    { label: 'Punto Reorden (ROP)', value: `${formatoNumero(alerta.punto_reorden, 1)} ${alerta.unidad}`, mono: true },
    { label: 'Cobertura Actual', value: `${alerta.cobertura_actual_dias} días`, mono: true },
    { label: 'Cobertura Proyectada', value: `${alerta.cobertura_proyectada_dias} días`, mono: true },
    { label: 'Lead Time (días)', value: `${alerta.lead_time_dias} días`, mono: true },
    { label: 'Fecha Límite Emisión', value: formatoFechaISOAFormatoPeruano(alerta.fecha_limite_emision), mono: true, warning: esVencida },
    { label: 'Cantidad Sugerida', value: `${formatoNumero(alerta.cantidad_sugerida, 0)} ${alerta.unidad}`, mono: true, bold: true },
    { label: 'Responsable', value: alerta.responsable, mono: true },
    {
      label: 'Estado Alerta',
      value: esVencida ? `VENCIDA (${diasRetraso} d. retraso)` : alerta.estado,
      mono: true,
      warning: esVencida,
    },
    { label: 'Versión de Regla', value: alerta.version_regla, mono: true },
  ];

  return (
    <div className="space-y-6">
      {/* Botón Volver y Título */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/alertas')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">
                Ficha Técnica de Alerta {alerta.alerta_id}
              </h2>
              <CriticidadBadge criticidad={alerta.criticidad} />
              {esVencida && (
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                  VENCIDA ({diasRetraso} días)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Diagnóstico automatizado de la regla {alerta.version_regla} para el SKU {alerta.sku_id}
            </p>
          </div>
        </div>

        {recomendacionAsociada && (
          <button
            onClick={() => navigate(`/recomendaciones/${recomendacionAsociada.reco_id}`)}
            className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <span>Ver Recomendación de Compra</span>
            <CheckSquare className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Motivo Completo */}
      <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl text-xs space-y-1">
        <div className="flex items-center space-x-2 text-amber-900 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Motivo Completo de la Alerta:</span>
        </div>
        <p className="text-amber-950 font-sans leading-relaxed text-[12px]">{alerta.motivo}</p>
      </div>

      {/* Ficha de 16 Campos en Dos Columnas */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#15803D]" />
          <span>Atributos de la Excepción (16 Campos Ficha)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {camposFicha.map((campo, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                campo.warning
                  ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                  : campo.highlight
                  ? 'bg-green-50/50 border-green-200 text-green-950'
                  : 'bg-slate-50 border-slate-100 text-slate-800'
              }`}
            >
              <span className="font-semibold text-slate-500 text-[11px]">{campo.label}:</span>
              {campo.component ? (
                campo.component
              ) : (
                <span
                  className={`font-mono text-xs ${
                    campo.bold || campo.highlight ? 'font-extrabold text-slate-900' : 'font-medium'
                  }`}
                >
                  {campo.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Inventario Proyectado del SKU */}
      {proyeccionSku.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Proyección de Inventario — SKU {alerta.sku_id}</h3>
            <p className="text-xs text-slate-500">
              Evolución mensual proyectada versus el Stock de Seguridad ({formatoNumero(proyeccionSku[0]?.stock_seguridad || 0, 0)} {alerta.unidad})
            </p>
          </div>

          <ProyeccionChart
            proyecciones={proyeccionSku}
            reordenInfo={{
              sku_id: alerta.sku_id,
              clase_abc: alerta.clase_abc,
              consumo_prom_diario: 33.13,
              desv_std_consumo_diario: 5.2,
              lead_time_dias: alerta.lead_time_dias,
              stock_seguridad: proyeccionSku[0]?.stock_seguridad || 107,
              punto_reorden: alerta.punto_reorden,
              inventario_disponible: alerta.inventario_actual,
              inventario_comprometido: 0,
              inventario_transito: 0,
              posicion_inventario: alerta.inventario_actual,
              cobertura_actual_dias: alerta.cobertura_actual_dias,
              fecha_estimada_quiebre: alerta.fecha_limite_emision,
            }}
            sku={skuInfo}
          />
        </div>
      )}
    </div>
  );
}
