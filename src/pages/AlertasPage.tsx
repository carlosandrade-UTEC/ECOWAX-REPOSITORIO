import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { CriticidadBadge, AbcBadge } from '../components/ui/Badge';
import { Unauthorized403 } from './Unauthorized403';
import { formatoFechaISOAFormatoPeruano, formatoNumero } from '../engine/formato';
import { ordenarAlertasPorCriticidad } from '../engine';
import {
  AlertTriangle,
  ArrowRight,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileCheck2,
  Send,
  Lock,
} from 'lucide-react';
import { ClaseABC, Criticidad, Alerta } from '../types';

export function AlertasPage() {
  const navigate = useNavigate();
  const { alertas, getPermiso } = useAppStore();
  const permiso = getPermiso('alertas');

  // Filtros locales
  const [criticidadFilter, setCriticidadFilter] = React.useState<string>('TODOS');
  const [claseAbcFilter, setClaseAbcFilter] = React.useState<string>('TODOS');
  const [estadoFilter, setEstadoFilter] = React.useState<string>('TODOS');
  const [zonaFilter, setZonaFilter] = React.useState<string>('TODOS');

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  const hoyStr = '2026-08-07';

  // Helper para verificar vencimiento y calcular días de retraso
  const evaluarEstadoAlerta = (alerta: Alerta) => {
    const esEstadoInicial = alerta.estado === 'NUEVA' || (alerta.estado as string) === 'EN_REVISION';
    const esVencida = esEstadoInicial && alerta.fecha_limite_emision < hoyStr;

    if (esVencida) {
      const fechaLim = new Date(alerta.fecha_limite_emision);
      const hoy = new Date(hoyStr);
      const diffTime = hoy.getTime() - fechaLim.getTime();
      const diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        estadoEfectivo: 'VENCIDA',
        diasRetraso: Math.max(1, diasRetraso),
      };
    }

    return {
      estadoEfectivo: alerta.estado,
      diasRetraso: 0,
    };
  };

  // Filtrado
  const alertasFiltradas = alertas.filter((alerta) => {
    const { estadoEfectivo } = evaluarEstadoAlerta(alerta);

    if (criticidadFilter !== 'TODOS' && alerta.criticidad !== criticidadFilter) return false;
    if (claseAbcFilter !== 'TODOS' && alerta.clase_abc !== claseAbcFilter) return false;
    if (estadoFilter !== 'TODOS' && estadoEfectivo !== estadoFilter) return false;
    // Si hubiera filtro de zona en la alerta, si no, ok
    return true;
  });

  // Ordenamiento por defecto: criticidad descendente (CRITICA=1, ALTA=2, MEDIA=3, BAJA=4) y luego fecha limite ascendente
  const alertasOrdenadas = ordenarAlertasPorCriticidad(alertasFiltradas);

  // Badge de Estado de Alerta
  const renderEstadoBadge = (estado: string, diasRetraso: number) => {
    switch (estado) {
      case 'VENCIDA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>VENCIDA ({diasRetraso} {diasRetraso === 1 ? 'día' : 'días'} de retraso)</span>
          </span>
        );
      case 'NUEVA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-[#15803D] border border-green-200">
            <AlertCircle className="w-3.5 h-3.5 text-[#15803D]" />
            <span>NUEVA</span>
          </span>
        );
      case 'EN_REVISION':
      case 'EN_PROCESO':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>EN REVISIÓN</span>
          </span>
        );
      case 'APROBADA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>APROBADA</span>
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>RECHAZADA</span>
          </span>
        );
      case 'ORDEN_EMITIDA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-[#15803D] border border-green-200">
            <Send className="w-3.5 h-3.5 text-[#15803D]" />
            <span>ORDEN EMITIDA</span>
          </span>
        );
      case 'CERRADA':
      case 'RESUELTA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
            <span>CERRADA</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span>{estado}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Alertas de Reposición y Abastecimiento</span>
          </h2>
          <p className="text-xs text-slate-500">
            Excepciones de cobertura, riesgos de campaña y violaciones de punto de reorden en tiempo real
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          Evaluado al: <strong>07/08/2026</strong>
        </span>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2 text-slate-500 font-semibold">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filtros:</span>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mr-1.5 font-medium">Criticidad:</label>
          <select
            value={criticidadFilter}
            onChange={(e) => setCriticidadFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="TODOS">Todas las criticidades</option>
            <option value="CRITICA">CRÍTICA</option>
            <option value="ALTA">ALTA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="BAJA">BAJA</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mr-1.5 font-medium">Clase ABC:</label>
          <select
            value={claseAbcFilter}
            onChange={(e) => setClaseAbcFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="TODOS">Todas las clases</option>
            <option value="A">Clase A</option>
            <option value="B">Clase B</option>
            <option value="C">Clase C</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mr-1.5 font-medium">Estado:</label>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="NUEVA">NUEVA</option>
            <option value="EN_REVISION">EN REVISIÓN</option>
            <option value="VENCIDA">VENCIDA</option>
            <option value="APROBADA">APROBADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
            <option value="ORDEN_EMITIDA">ORDEN EMITIDA</option>
            <option value="CERRADA">CERRADA</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 font-mono text-[11px]">
          Mostrando <strong className="text-slate-900">{alertasOrdenadas.length}</strong> de {alertas.length} alertas
        </div>
      </div>

      {/* Tabla Principal de Alertas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-4">SKU / Insumo</th>
                <th className="py-3 px-3">Clase</th>
                <th className="py-3 px-3">Criticidad</th>
                <th className="py-3 px-3">Estado</th>
                <th className="py-3 px-3 text-right">Inv. Actual</th>
                <th className="py-3 px-3 text-right">Punto Reorden</th>
                <th className="py-3 px-3 text-center">Cob. Actual</th>
                <th className="py-3 px-3 text-center">Cob. Proy.</th>
                <th className="py-3 px-3 text-center">Lead Time</th>
                <th className="py-3 px-3">Fecha Límite</th>
                <th className="py-3 px-3 text-right">Cant. Sugerida</th>
                <th className="py-3 px-3">Responsable</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {alertasOrdenadas.map((alerta) => {
                const { estadoEfectivo, diasRetraso } = evaluarEstadoAlerta(alerta);
                const isVencida = estadoEfectivo === 'VENCIDA';

                return (
                  <tr
                    key={alerta.alerta_id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isVencida ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{alerta.sku_id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{alerta.alerta_id}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <AbcBadge clase={alerta.clase_abc} />
                    </td>
                    <td className="py-3.5 px-3">
                      <CriticidadBadge criticidad={alerta.criticidad} />
                    </td>
                    <td className="py-3.5 px-3">
                      {renderEstadoBadge(estadoEfectivo, diasRetraso)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatoNumero(alerta.inventario_actual, 0)} {alerta.unidad}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-amber-800">
                      {formatoNumero(alerta.punto_reorden, 0)} {alerta.unidad}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-700">
                      {alerta.cobertura_actual_dias} d
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                      {alerta.cobertura_proyectada_dias} d
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                      {alerta.lead_time_dias} d
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={`font-bold ${
                          isVencida ? 'text-rose-700 font-extrabold' : 'text-slate-900'
                        }`}
                      >
                        {formatoFechaISOAFormatoPeruano(alerta.fecha_limite_emision)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#15803D]">
                      {formatoNumero(alerta.cantidad_sugerida, 0)} {alerta.unidad}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">
                      {alerta.responsable}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => navigate(`/alertas/${alerta.alerta_id}`)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded-lg transition-colors flex items-center space-x-1 mx-auto shadow-2xs"
                      >
                        <span>Detalle</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
