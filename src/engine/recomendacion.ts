import { Recomendacion, Criticidad } from '../types';
import { RULES_VERSION, MODEL_VERSION } from './version';

export interface ParametrosRecomendacion {
  alertaId: string;
  skuId: string;
  periodo: string;
  cantidadSugerida: number;
  unidad: string;
  fechaLimiteEmision: string;
  proveedorRecomendado: string;
  proveedorAlterno?: string;
  coberturaAntesDias: number;
  coberturaDespuesDias: number;
  supuestos: string;
  riesgoNoComprar: string;
  riesgoSobreinventario: string;
  criticidad: Criticidad;
}

export function generarRecomendacion(params: ParametrosRecomendacion): Recomendacion {
  const recoId = `REC-${params.periodo}-${params.skuId.replace('INS-', '')}`;

  let nivelConfianza: 'ALTA' | 'MEDIA' | 'BAJA' = 'ALTA';
  if (params.criticidad === 'BAJA' || params.criticidad === 'MEDIA') {
    nivelConfianza = 'MEDIA';
  }

  return {
    reco_id: recoId,
    alerta_id: params.alertaId,
    periodo: params.periodo,
    sku_id: params.skuId,
    cantidad_recomendada: params.cantidadSugerida,
    unidad: params.unidad,
    fecha_limite_emision: params.fechaLimiteEmision,
    proveedor_recomendado: params.proveedorRecomendado,
    proveedor_alterno: params.proveedorAlterno || '',
    cobertura_antes_dias: params.coberturaAntesDias,
    cobertura_despues_dias: params.coberturaDespuesDias,
    supuestos: params.supuestos,
    riesgo_no_comprar: params.riesgoNoComprar,
    riesgo_sobreinventario: params.riesgoSobreinventario,
    nivel_confianza: nivelConfianza,
    regla_version: RULES_VERSION,
    modelo_version: MODEL_VERSION,
    estado: 'PENDIENTE',
  };
}

export interface DecisionCompraInput {
  reco_id: string;
  accion: 'APROBADA' | 'MODIFICADA' | 'RECHAZADA';
  cantidad_final: number;
  motivo_desviacion?: string;
  usuario_id: string;
}

/**
 * REGLA 5: Validación de decisiones sobre recomendaciones.
 * Lanza un error de validación cuando se rechaza o modifica una recomendación sin motivo_desviacion.
 */
export function validarDecisionCompra(decision: Partial<DecisionCompraInput>): boolean {
  if (!decision.accion) {
    throw new Error('Debe especificar una acción para la decisión (APROBADA, MODIFICADA o RECHAZADA).');
  }

  if (decision.accion === 'RECHAZADA' || decision.accion === 'MODIFICADA') {
    if (!decision.motivo_desviacion || decision.motivo_desviacion.trim() === '') {
      throw new Error('El campo motivo_desviacion es obligatorio cuando la recomendación es RECHAZADA o MODIFICADA.');
    }
  }

  return true;
}
