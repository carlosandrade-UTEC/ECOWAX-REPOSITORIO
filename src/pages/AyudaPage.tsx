import React, { useState } from 'react';
import {
  HelpCircle,
  Calculator,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function AyudaPage() {
  const [activeTab, setActiveTab] = useState<'formulas' | 'ejemplo' | 'pronostico'>('formulas');

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#15803D] border border-green-200 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Manual Operativo SOX / ISO 9001
            </span>
            <span className="text-xs text-slate-400">| Versión de Reglas Vigente: RB-2026.08</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-[#15803D]" />
            Ayuda Metodológica & Reglas de Negocio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Guía explicativa de las matemáticas del motor de abastecimiento, fórmulas de seguridad, loteo y análisis de pronósticos.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'formulas'
                ? 'bg-[#15803D] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fórmulas Matrimoniales
          </button>
          <button
            onClick={() => setActiveTab('ejemplo')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ejemplo'
                ? 'bg-[#15803D] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Caso Numérico (Carnauba)
          </button>
          <button
            onClick={() => setActiveTab('pronostico')}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pronostico'
                ? 'bg-[#15803D] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cómo Leer el Pronóstico
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: FÓRMULAS MATEMÁTICAS Y DE NEGOCIO */}
      {activeTab === 'formulas' && (
        <div className="space-y-6">
          <div className="bg-[#14532D] text-white p-6 rounded-2xl shadow-sm space-y-2 border border-green-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-300" />
              Ecuaciones de Abastecimiento Optimizado
            </h2>
            <p className="text-xs text-green-200">
              Todas las decisiones del sistema ECOPROA están gobernadas por reglas matemáticas determinísticas aprobadas por la Gerencia de Operaciones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock de Seguridad */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  1. Colchón de Riesgo
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Fórmula 5.1</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Stock de Seguridad (SS)</h3>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl">
                SS = Z × √ ( L × σ_d² + d² × σ_L² )
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li><strong>Z:</strong> Factor de nivel de servicio (ej: Z=2.05 para 98% de cobertura sin quiebre).</li>
                <li><strong>L:</strong> Lead time promedio del proveedor (en días).</li>
                <li><strong>σ_d:</strong> Desviación estándar del consumo diario.</li>
                <li><strong>d:</strong> Consumo promedio diario de la materia prima.</li>
                <li><strong>σ_L:</strong> Variabilidad/desviación en los días de entrega del proveedor.</li>
              </ul>
            </div>

            {/* Punto de Reorden */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  2. Umbral de Disparo
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Fórmula 5.2</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Punto de Reorden (ROP)</h3>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl">
                ROP = ( d × L ) + SS
              </div>
              <p className="text-xs text-slate-600">
                Es el nivel crítico de posición de inventario al cual se debe emitir una orden de compra obligatoriamente para prevenir el desabastecimiento antes de que llegue el pedido.
              </p>
            </div>

            {/* Posición de Inventario */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  3. Balance Real
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Fórmula 5.3</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Posición de Inventario (PI)</h3>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl">
                PI = Dispo + Transito - Comprometido
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li><strong>Dispo:</strong> Stock físico en almacén libre de cuarentena.</li>
                <li><strong>Transito:</strong> Órdenes de compra ya emitidas en camino.</li>
                <li><strong>Comprometido:</strong> Reservas firmes para órdenes de producción inmediatas.</li>
              </ul>
            </div>

            {/* Cantidad Sugerida de Compra */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  4. Lote Económico Ajustado
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Fórmula 5.4</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Cantidad Sugerida de Compra (Q)</h3>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl">
                Q_bruto = máx( 0, ROP + DemandaTarget - PI )
              </div>
              <p className="text-xs text-slate-600">
                Posteriormente, <strong>Q_bruto</strong> se ajusta hacia arriba cumpliendo el <strong>Lote Mínimo (MOQ)</strong> y redondeando al <strong>Múltiplo de Compra</strong> del proveedor.
              </p>
            </div>

            {/* Cobertura en Días */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  5. Autonomía
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Fórmula 5.5</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Cobertura en Días</h3>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl">
                Cobertura = Dispo / ConsumoPromedioDiario
              </div>
              <p className="text-xs text-slate-600">
                Indica cuántos días de producción continua puede sostener la planta exclusivamente con el inventario físico actual sin recibir nuevos embarques.
              </p>
            </div>

            {/* Precisiones de Pronóstico */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  6. Exactitud de Demanda
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">Fórmula 5.6</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">MAPE y Sesgo (Bias)</h3>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl">
                MAPE = Σ | Real - Pronóstico | / Σ Real
              </div>
              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl mt-2">
                Sesgo = Σ ( Pronóstico - Real ) / Σ Real
              </div>
              <p className="text-xs text-slate-600">
                Miden el error absoluto del modelo (MAPE) y la tendencia direccional hacia sobreestimar o subestimar la demanda (Sesgo).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: EJEMPLO NUMÉRICO CON CARNAUBA INS-001 */}
      {activeTab === 'ejemplo' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-emerald-200 border border-emerald-700">
                Caso Práctico Real
              </span>
              <span className="text-xs text-emerald-300">Regla Vigente: RB-2026.08</span>
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <Package className="w-6 h-6 text-emerald-300" />
              Ejemplo Numérico: Cera de Carnauba T1 (INS-001)
            </h2>
            <p className="text-xs text-emerald-200">
              Desglose paso a paso del cálculo de abastecimiento para el insumo crítico importado desde Brasil (PRV-001).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            {/* Parámetros de Entrada */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> Paso 1: Parámetros del SKU y Proveedor
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Consumo Diario (d)</span>
                  <span className="font-bold text-slate-900 text-sm">25.0 kg / día</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Desv. Estándar Consumo (σ_d)</span>
                  <span className="font-bold text-slate-900 text-sm">5.2 kg / día</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lead Time Prom. (L)</span>
                  <span className="font-bold text-slate-900 text-sm">38 días</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Desv. Lead Time (σ_L)</span>
                  <span className="font-bold text-slate-900 text-sm">9.0 días</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nivel de Servicio Objetivo</span>
                  <span className="font-bold text-emerald-700 text-sm">98.0% (Z = 2.05)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lote Mínimo (MOQ)</span>
                  <span className="font-bold text-slate-900 text-sm">600 kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Múltiplo de Compra</span>
                  <span className="font-bold text-slate-900 text-sm">150 kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Inventario Físico (Dispo)</span>
                  <span className="font-bold text-indigo-700 text-sm">800 kg</span>
                </div>
              </div>
            </div>

            {/* Cálculo de SS y ROP */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Paso 2: Cálculo de Stock de Seguridad (SS) y ROP
              </h3>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl space-y-2 font-mono text-xs">
                <p className="text-slate-400">// Variabilidad total de consumo y tiempo de viaje:</p>
                <p className="text-emerald-400">
                  Varianza_Consumo = 38 × (5.2)² = 38 × 27.04 = 1,027.52
                </p>
                <p className="text-emerald-400">
                  Varianza_Tiempo  = (25.0)² × (9.0)² = 625 × 81 = 50,625.00
                </p>
                <p className="text-amber-300">
                  Varianza_Total   = 1,027.52 + 50,625.00 = 51,652.52
                </p>
                <p className="text-indigo-300">
                  Desviación_Std   = √ 51,652.52 = 227.27 kg
                </p>
                <p className="text-emerald-400 font-bold border-t border-slate-800 pt-2 text-sm">
                  SS = 2.05 × 227.27 = 465.90 kg → Redondeado a 466 kg
                </p>
                <p className="text-emerald-400 font-bold text-sm">
                  ROP = (25.0 × 38) + 466 = 950 + 466 = 1,416 kg
                </p>
              </div>
            </div>

            {/* Evaluación de Posición y Sugerencia */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Paso 3: Determinación de la Orden
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <p>
                  1. <strong>Posición de Inventario (PI):</strong> 800 kg (Disponible) + 400 kg (En tránsito) - 100 kg (Comprometido) = <strong>1,100 kg</strong>.
                </p>
                <p>
                  2. <strong>Condición de Reorden:</strong> Como PI (1,100 kg) &lt; ROP (1,416 kg), <strong>SÍ SE REQUIERE COMPRAR</strong>.
                </p>
                <p>
                  3. <strong>Diferencial Bruto:</strong> ROP - PI = 1,416 - 1,100 = <strong>316 kg</strong>.
                </p>
                <p>
                  4. <strong>Ajuste de Loteo:</strong> Como 316 kg es menor que el Lote Mínimo (600 kg), el pedido se eleva a <strong>600 kg</strong> (que además es múltiplo exacto de 150 kg).
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                    Resultado Final Sugerido
                  </span>
                  <span className="text-lg font-extrabold text-emerald-950">
                    Emitir Orden por 600 kg de Cera de Carnauba T1
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs">
                  Recomendación Generada
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: CÓMO LEER EL PRONÓSTICO */}
      {activeTab === 'pronostico' && (
        <div className="space-y-6">
          <div className="bg-purple-900 text-white p-6 rounded-2xl shadow-sm space-y-2">
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-purple-300" />
              Cómo Leer el Pronóstico: MAPE vs. Sesgo (Bias)
            </h2>
            <p className="text-xs text-purple-200">
              Criterios de interpretación de la exactitud de demanda para evitar quiebres sostenidos o sobreinventario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Explicación de MAPE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Calculator className="w-4 h-4" /> MAPE (Error Medio Absoluto Porcentual)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El <strong>MAPE</strong> mide la <strong>magnitud promedio del error</strong> sin importar si el pronóstico se equivocó por arriba o por abajo. Un MAPE del 12% significa que en promedio los pedidos difieren un 12% de la proyección.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-1">Escala de Interpretación:</span>
                <ul className="space-y-1 text-slate-600">
                  <li>🟢 <strong>&lt; 10%:</strong> Pronóstico Excelente (Alta confianza).</li>
                  <li>🟡 <strong>10% - 20%:</strong> Pronóstico Aceptable para materias primas.</li>
                  <li>🔴 <strong>&gt; 20%:</strong> Alta volatilidad (Requiere aumentar Stock de Seguridad).</li>
                </ul>
              </div>
            </div>

            {/* Explicación de Sesgo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                <TrendingUp className="w-4 h-4" /> Sesgo / Bias (Direccionalidad del Error)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El <strong>Sesgo</strong> indica si el modelo se equivoca de forma <strong>sistemática</strong> hacia un lado. Si el sesgo es positivo (+8%), el modelo tiende a <strong>sobreestimar</strong> la demanda; si es negativo (-8%), tiende a <strong>subestimar</strong>.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-1">Escala de Interpretación:</span>
                <ul className="space-y-1 text-slate-600">
                  <li>🟢 <strong>-5% a +5%:</strong> Sin sesgo relevante (Error balanceado).</li>
                  <li>🔴 <strong>Sesgo Negativo (&lt; -5%):</strong> Peligro de quiebre de stock por subestimación.</li>
                  <li>🔴 <strong>Sesgo Positivo (&gt; +5%):</strong> Peligro de sobreinventario y sobrecostos de almacenamiento.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Por qué un sesgo persistente es peor que un MAPE alto */}
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-3 text-amber-950">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ¿Por qué un Sesgo Persistente es Peor que un Error Mayor pero Simétrico?
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              En la cadena de suministro, un error aleatorio pero <strong>simétrico</strong> (MAPE del 20% con Sesgo del 0%) se puede absorber y amortiguar fácilmente mediante la fórmula del <strong>Stock de Seguridad (SS)</strong>, ya que las desviaciones positivas y negativas se cancelan estadísticamente en el tiempo.
            </p>
            <p className="text-xs leading-relaxed text-amber-900">
              Sin embargo, un <strong>sesgo persistente</strong> (por ejemplo, subestimar la demanda un 8% mes a mes) destruye sistemáticamente el stock de seguridad. En pocos ciclos, el almacén quedará completamente desabastecido o inundado de inventario obsoleto, obligando a realizar compras de emergencia con fletes aéreos costosos o deteniendo líneas de producción.
            </p>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 flex items-center justify-between">
              <span>Regla de Oro en ECOPROA:</span>
              <span>Si |Sesgo| &gt; 5%, recalibrar el modelo de pronóstico de forma prioritaria.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AyudaPage;
