import { ReordenCalculado, Criticidad } from '../types';
import { RULES_VERSION } from './version';

export function obtenerZScore(nivelServicio: number): number {
  if (nivelServicio >= 0.98) return 2.05;
  if (nivelServicio >= 0.95) return 1.65;
  return 1.28; // Default for 0.90
}

export function calcularPosicionInventario(
  disponibilidad: number,
  comprometido: number,
  enTransito: number
): number {
  return disponibilidad - comprometido + enTransito;
}

export function calcularStockSeguridad(
  zScore: number,
  sigmaConsumoDiario: number,
  leadTimeDias: number
): number {
  const ss = zScore * sigmaConsumoDiario * Math.sqrt(leadTimeDias);
  return Number(ss.toFixed(1));
}

export function calcularPuntoReorden(
  consumoPromedioDiario: number,
  leadTimeDias: number,
  stockSeguridad: number
): number {
  const rop = consumoPromedioDiario * leadTimeDias + stockSeguridad;
  return Number(rop.toFixed(1));
}

/**
 * REGLA 1 & 8: COBERTURA MES A MES
 * Recorre la demanda esperada mes a mes.
 * - Si inventario es 0 -> retorna 0.
 * - Si demanda de un mes es 0 -> salta ese mes (suma 30 días sin descontar) y continua con el siguiente.
 * - Previene división por cero y NaN.
 */
export function coberturaDias(demandaMensualFutura: number[], cantidad: number): number {
  if (cantidad <= 0) return 0;
  if (!demandaMensualFutura || demandaMensualFutura.length === 0) return 0;

  let restante = cantidad;
  let dias = 0;

  for (const demandaMes of demandaMensualFutura) {
    if (demandaMes <= 0) {
      dias += 30; // Salta el mes de demanda cero y continua con el siguiente
      continue;
    }
    if (restante >= demandaMes) {
      restante -= demandaMes;
      dias += 30;
    } else {
      return Math.round(dias + 30 * (restante / demandaMes));
    }
  }

  // Si sobrepasa todos los meses proporcionados
  const ultimoConsumo = demandaMensualFutura[demandaMensualFutura.length - 1];
  if (ultimoConsumo > 0 && restante > 0) {
    dias += Math.round(30 * (restante / ultimoConsumo));
  }
  return dias;
}

/**
 * REGLA 2: Consumo 0 en el periodo.
 * Si el consumo/demanda del periodo es 0, la cobertura debe devolver "SIN_DATO" o null.
 * Nunca debe devolver Infinity ni 999.
 */
export function coberturaConConsumoCero(
  demandaMensualFutura: number[],
  cantidad: number
): number | 'SIN_DATO' | null {
  if (!demandaMensualFutura || demandaMensualFutura.length === 0) return 'SIN_DATO';
  const sumaDemanda = demandaMensualFutura.reduce((a, b) => a + b, 0);
  if (sumaDemanda === 0) {
    return 'SIN_DATO';
  }
  return coberturaDias(demandaMensualFutura, cantidad);
}

/**
 * REGLA 3: Lead time nulo o undefined.
 * Usa el lead time del maestro de proveedor como fallback y registra una advertencia.
 */
export function obtenerLeadTimeConFallback(
  leadTimeSku?: number | null,
  leadTimeProveedorMaster?: number | null
): { leadTime: number; advertencia?: string } {
  if (
    leadTimeSku !== undefined &&
    leadTimeSku !== null &&
    !isNaN(Number(leadTimeSku)) &&
    Number(leadTimeSku) > 0
  ) {
    return { leadTime: Number(leadTimeSku) };
  }

  const fallback = Number(leadTimeProveedorMaster) || 30;
  return {
    leadTime: fallback,
    advertencia: `Lead time de SKU nulo/inválido. Se utilizó el valor por defecto del maestro de proveedor (${fallback} días).`,
  };
}

/**
 * REGLA 6: Inventario en tránsito atrasado.
 * La fecha de quiebre se recalcula sin contar el tránsito atrasado y la criticidad sube un nivel.
 */
export function recalcularTransitoAtrasado(
  disponible: number,
  comprometido: number,
  transitoValido: number,
  demandaMensualFutura: number[],
  criticidadBase: Criticidad
): {
  posicionSinTransitoAtrasado: number;
  coberturaRecalculadaDias: number;
  fechaQuiebreRecalculada: string;
  criticidadElevada: Criticidad;
} {
  const posicion = disponible - comprometido + transitoValido;
  const cob = coberturaDias(demandaMensualFutura, posicion);
  const fechaQuiebre = calcularFechaQuiebre(cob);

  let criticidadElevada: Criticidad = 'CRITICA';
  if (criticidadBase === 'BAJA') criticidadElevada = 'MEDIA';
  else if (criticidadBase === 'MEDIA') criticidadElevada = 'ALTA';
  else if (criticidadBase === 'ALTA') criticidadElevada = 'CRITICA';
  else if (criticidadBase === 'CRITICA') criticidadElevada = 'CRITICA';

  return {
    posicionSinTransitoAtrasado: posicion,
    coberturaRecalculadaDias: cob,
    fechaQuiebreRecalculada: fechaQuiebre,
    criticidadElevada,
  };
}

/**
 * REGLA 7: Consumo atípico mayor a 2.5 - 3 desviaciones estándar.
 * Se marca como atípico y se excluye del cálculo de promedio para pronósticos.
 */
export function detectarYFiltrarAtipicos(
  consumosHistoricos: number[],
  umbralSigma: number = 2.5
): {
  consumosValidos: number[];
  atipicos: { valor: number; indice: number }[];
  promedioFiltrado: number;
} {
  if (!consumosHistoricos || consumosHistoricos.length === 0) {
    return { consumosValidos: [], atipicos: [], promedioFiltrado: 0 };
  }

  const n = consumosHistoricos.length;
  const suma = consumosHistoricos.reduce((a, b) => a + b, 0);
  const promedio = suma / n;

  const varianza = consumosHistoricos.reduce((sum, x) => sum + Math.pow(x - promedio, 2), 0) / n;
  const desvStd = Math.sqrt(varianza);

  const atipicos: { valor: number; indice: number }[] = [];
  const consumosValidos: number[] = [];

  consumosHistoricos.forEach((val, idx) => {
    if (desvStd > 0 && Math.abs(val - promedio) > umbralSigma * desvStd) {
      atipicos.push({ valor: val, indice: idx });
    } else {
      consumosValidos.push(val);
    }
  });

  const promFiltrado =
    consumosValidos.length > 0
      ? consumosValidos.reduce((a, b) => a + b, 0) / consumosValidos.length
      : promedio;

  return {
    consumosValidos,
    atipicos,
    promedioFiltrado: Number(promFiltrado.toFixed(2)),
  };
}

/**
 * Suma días de cobertura a fecha base
 */
export function calcularFechaQuiebre(diasCobertura: number, fechaBaseIso: string = '2026-08-06'): string {
  if (diasCobertura <= 0) return fechaBaseIso;
  const fecha = new Date(fechaBaseIso);
  fecha.setDate(fecha.getDate() + diasCobertura);
  return fecha.toISOString().split('T')[0];
}

export function evaluarPuntoReorden(
  disponible: number,
  comprometido: number,
  enTransito: number,
  consumoPromDiario: number,
  desvStdConsumoDiario: number,
  leadTimeDias: number,
  nivelServicio: number,
  demandaMensualFutura: number[],
  skuId: string,
  claseAbc: 'A' | 'B' | 'C'
): ReordenCalculado {
  const posicion = calcularPosicionInventario(disponible, comprometido, enTransito);

  if (consumoPromDiario <= 0) {
    return {
      sku_id: skuId,
      clase_abc: claseAbc,
      consumo_prom_diario: 0,
      desv_std_consumo_diario: desvStdConsumoDiario,
      lead_time_dias: leadTimeDias,
      stock_seguridad: 0,
      punto_reorden: 0,
      inventario_disponible: disponible,
      inventario_comprometido: comprometido,
      inventario_transito: enTransito,
      posicion_inventario: posicion,
      cobertura_actual_dias: 0,
      fecha_estimada_quiebre: '2026-08-06',
      version_regla: RULES_VERSION,
    };
  }

  const z = obtenerZScore(nivelServicio);
  const ss = calcularStockSeguridad(z, desvStdConsumoDiario, leadTimeDias);
  const rop = calcularPuntoReorden(consumoPromDiario, leadTimeDias, ss);
  const cob = coberturaDias(demandaMensualFutura, posicion);
  const fechaQuiebre = calcularFechaQuiebre(cob, '2026-08-06');

  return {
    sku_id: skuId,
    clase_abc: claseAbc,
    consumo_prom_diario: consumoPromDiario,
    desv_std_consumo_diario: desvStdConsumoDiario,
    lead_time_dias: leadTimeDias,
    stock_seguridad: ss,
    punto_reorden: rop,
    inventario_disponible: disponible,
    inventario_comprometido: comprometido,
    inventario_transito: enTransito,
    posicion_inventario: posicion,
    cobertura_actual_dias: cob,
    fecha_estimada_quiebre: fechaQuiebre,
    version_regla: RULES_VERSION,
  };
}
