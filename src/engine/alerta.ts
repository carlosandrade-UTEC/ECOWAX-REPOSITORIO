import { Criticidad } from '../types';

/**
 * Evalúa el nivel de criticidad de una alerta basándose en la cobertura actual y el lead time P90.
 * Reglas determinísticas:
 * - CRITICA: Cobertura de inventario <= Lead Time (o cobertura <= 30 días)
 * - ALTA: Cobertura <= Lead Time + 15 días (o cobertura <= 60 días)
 * - MEDIA: Cobertura <= 90 días
 * - BAJA: Cobertura > 90 días
 */
export function evaluarCriticidadAlerta(
  coberturaDias: number,
  leadTimeDias: number,
  esRiesgoCampania: boolean = false
): Criticidad {
  if (coberturaDias <= leadTimeDias || coberturaDias <= 30 || (esRiesgoCampania && coberturaDias <= 40)) {
    return 'CRITICA';
  }
  if (coberturaDias <= leadTimeDias + 15 || coberturaDias <= 60) {
    return 'ALTA';
  }
  if (coberturaDias <= 90) {
    return 'MEDIA';
  }
  return 'BAJA';
}

/**
 * Valor numérico para ordenamiento descendente por severidad.
 * CRITICA (1) > ALTA (2) > MEDIA (3) > BAJA (4)
 */
export function obtenerOrdenCriticidad(criticidad: Criticidad): number {
  switch (criticidad) {
    case 'CRITICA':
      return 1;
    case 'ALTA':
      return 2;
    case 'MEDIA':
      return 3;
    case 'BAJA':
      return 4;
    default:
      return 5;
  }
}

/**
 * Ordena un arreglo de alertas u objetos con criticidad:
 * Primero por criticidad descendente (CRÍTICA -> ALTA -> MEDIA -> BAJA),
 * luego por fecha límite de emisión ascendente.
 */
export function ordenarAlertasPorCriticidad<
  T extends { criticidad: Criticidad; fecha_limite_emision?: string }
>(alertas: T[]): T[] {
  return [...alertas].sort((a, b) => {
    const ordenA = obtenerOrdenCriticidad(a.criticidad);
    const ordenB = obtenerOrdenCriticidad(b.criticidad);

    if (ordenA !== ordenB) {
      return ordenA - ordenB;
    }

    if (a.fecha_limite_emision && b.fecha_limite_emision) {
      return a.fecha_limite_emision.localeCompare(b.fecha_limite_emision);
    }

    return 0;
  });
}
