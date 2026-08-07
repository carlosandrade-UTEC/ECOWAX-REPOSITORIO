import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Proveedor, Sku } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import { ShieldAlert, Truck, CheckCircle2, Clock, Globe, AlertTriangle } from 'lucide-react';

export function MaestroProveedoresPage() {
  const { getPermiso, proveedores, skus } = useAppStore();
  const permiso = getPermiso('maestros');

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  // Identificar insumos Clase A
  const skusClaseA = skus.filter((s) => s.clase_abc === 'A');

  // Evaluar cuáles tienen un SOLO proveedor homologado
  const riesgosOrigenUnico = skusClaseA.map((sku) => {
    // Proveedor por defecto
    const provDef = proveedores.find((p) => p.proveedor_id === sku.proveedor_default);
    // Proveedores homologados asociados
    const homologados = proveedores.filter(
      (p) =>
        p.estado_homologacion === 'Homologado' &&
        (p.proveedor_id === sku.proveedor_default || p.nombre.toLowerCase().includes(sku.categoria.toLowerCase()))
    );

    const esUnico = homologados.length <= 1;

    return {
      sku,
      proveedorPrincipal: provDef || homologados[0],
      totalHomologados: Math.max(1, homologados.length),
      esRiesgo: esUnico,
    };
  });

  const insumosEnRiesgo = riesgosOrigenUnico.filter((r) => r.esRiesgo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#15803D]" />
            <span>Maestro de Proveedores & Homologación</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de proveedores internacionales y locales, lead times reales y nivel OTIF histórico.
          </p>
        </div>
      </div>

      {/* PANEL DESTACADO: Riesgo de Origen Único en Insumos Clase A */}
      <div className="bg-rose-50/80 border-2 border-rose-300 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
          <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
          <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-tight">
            PANEL DESTACADO: Insumos Clase A con Un Solo Proveedor Homologado (Riesgo de Origen Único)
          </h3>
        </div>

        <p className="text-xs text-rose-900 leading-relaxed">
          Los insumos críticos de mayor impacto en la producción que dependen de un único proveedor activo
          representan una vulnerabilidad alta ante paros portuarios, quiebres de stock o retrasos de embarque.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {insumosEnRiesgo.map(({ sku, proveedorPrincipal }) => (
            <div
              key={sku.sku_id}
              className="p-3.5 bg-white border border-rose-200 rounded-lg shadow-2xs space-y-2 text-xs"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono font-extrabold text-slate-900">{sku.sku_id}</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded text-[10px]">
                  Riesgo Crítico
                </span>
              </div>

              <div className="font-bold text-slate-800">{sku.nombre}</div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Único Proveedor:</span>
                  <span className="font-bold text-slate-900">
                    {proveedorPrincipal ? proveedorPrincipal.nombre : sku.proveedor_default}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Lead Time Promedio / P90:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {proveedorPrincipal ? `${proveedorPrincipal.lead_time_promedio_dias}d / ${proveedorPrincipal.lead_time_promedio_dias + proveedorPrincipal.lead_time_desv_dias}d` : '38d / 55d'}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 p-2 rounded text-[10px] text-amber-900 border border-amber-200 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Recomendación: Avanzar homologación de PRV-006 como fuente alterna.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla Maestro de Proveedores con Semáforo de Homologación */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Listado Completo de Proveedores Registrados
          </h3>
          <span className="text-xs font-mono text-slate-500">{proveedores.length} proveedores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Código</th>
                <th className="px-3.5 py-2.5">Nombre Proveedor</th>
                <th className="px-3.5 py-2.5">País</th>
                <th className="px-3.5 py-2.5">Incoterm</th>
                <th className="px-3.5 py-2.5">Moneda</th>
                <th className="px-3.5 py-2.5 font-mono">Lead Time Prom.</th>
                <th className="px-3.5 py-2.5 font-mono">P90 Estimado</th>
                <th className="px-3.5 py-2.5">Homologación (Semáforo)</th>
                <th className="px-3.5 py-2.5 font-mono text-right">OTIF Histórico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {proveedores.map((p) => {
                const leadTimeP90 = p.lead_time_promedio_dias + p.lead_time_desv_dias * 1.28;
                return (
                  <tr key={p.proveedor_id} className="hover:bg-slate-50/80">
                    <td className="px-3.5 py-2.5 font-bold text-slate-900">{p.proveedor_id}</td>
                    <td className="px-3.5 py-2.5 font-sans font-bold text-slate-800">{p.nombre}</td>
                    <td className="px-3.5 py-2.5 font-sans flex items-center gap-1 text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.pais}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">{p.incoterm}</td>
                    <td className="px-3.5 py-2.5 text-slate-700 font-bold">{p.moneda}</td>
                    <td className="px-3.5 py-2.5 font-bold">{p.lead_time_promedio_dias} días</td>
                    <td className="px-3.5 py-2.5 font-bold text-blue-800">
                      {Math.round(leadTimeP90)} días
                    </td>
                    <td className="px-3.5 py-2.5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          p.estado_homologacion === 'Homologado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.estado_homologacion === 'Homologado' ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                        />
                        <span>{p.estado_homologacion}</span>
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold">
                      {p.otif_historico !== null
                        ? `${(p.otif_historico * 100).toFixed(0)}%`
                        : 'En evaluación'}
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
