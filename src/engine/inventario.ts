import { ReordenCalculado } from '../types';
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
 * COBERTURA - Recorre la demanda esperada mes a mes
 */
export function coberturaDias(demandaMensualFutura: number[], cantidad: number): number {
  if (cantidad <= 0) return 0;
  if (!demandaMensualFutura || demandaMensualFutura.length === 0) return 0;

  let restante = cantidad;
  let dias = 0;

  for (const demandaMes of demandaMensualFutura) {
    if (demandaMes <= 0) {
      dias += 30;
      continue;
    }
    if (restante >= demandaMes) {
      restante -= demandaMes;
      dias += 30;
    } else {
      return Math.round(dias + 30 * (restante / demandaMes));
    }
  }

  // Si sobrepasa todos los meses proporcionados, retornar días acumulados más estimación por el último mes
  const ultimoConsumo = demandaMensualFutura[demandaMensualFutura.length - 1];
  if (ultimoConsumo > 0 && restante > 0) {
    dias += Math.round(30 * (restante / ultimoConsumo));
  }
  return dias;
}

/**
 * Calcula la fecha estimada de quiebre sumando coberturaDias a la fecha base (por defecto 2026-08-06)
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
