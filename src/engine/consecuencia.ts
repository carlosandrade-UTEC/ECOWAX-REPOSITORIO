import { Sku, Campania } from '../types';
import { formatoNumero } from './formato';
import { getSystemDate } from './clock';

export interface ConsecuenciaResultado {
  coberturaDias: number;
  fechaQuiebreIso: string;
  mesQuiebreTexto: string;
  enVentanaCampania: boolean;
  nombreCampania?: string;
  capitalUsd: number;
  advertenciaTexto: string;
  ajustadoLote: boolean;
  cantidadAjustada: number;
  mensajeAjuste?: string;
  requiereSupuestoConsumo?: boolean;
}

const MESES_NOMBRES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function ajustarLoteYMultiplo(
  cantidadDeseada: number,
  sku: Sku
): { cantidadAjustada: number; ajustado: boolean; mensaje?: string } {
  if (cantidadDeseada <= 0) {
    return { cantidadAjustada: 0, ajustado: false };
  }

  let cantidad = cantidadDeseada;
  let ajustado = false;
  let detalles: string[] = [];

  // Lote mínimo
  if (sku.lote_minimo > 0 && cantidad < sku.lote_minimo) {
    cantidad = sku.lote_minimo;
    ajustado = true;
    detalles.push(`lote mínimo de ${formatoNumero(sku.lote_minimo, 0)} ${sku.unidad}`);
  }

  // Múltiplo de compra
  if (sku.multiplo_compra > 0 && cantidad % sku.multiplo_compra !== 0) {
    const resto = cantidad % sku.multiplo_compra;
    if (resto > 0) {
      cantidad = cantidad + (sku.multiplo_compra - resto);
      ajustado = true;
      detalles.push(`múltiplo de compra de ${formatoNumero(sku.multiplo_compra, 0)} ${sku.unidad}`);
    }
  }

  const mensaje = ajustado
    ? `Ajustado automáticamente por restricciones del proveedor a ${detalles.join(' y ')} (${formatoNumero(cantidad, 0)} ${sku.unidad}).`
    : undefined;

  return {
    cantidadAjustada: cantidad,
    ajustado,
    mensaje,
  };
}

export function calcularConsecuenciaMotor(
  sku: Sku,
  cantidad: number,
  inventarioActual: number,
  consumoDiario: number,
  campanias: Campania[] = [],
  supuestoConsumoDiario?: number
): ConsecuenciaResultado {
  const { cantidadAjustada, ajustado, mensaje } = ajustarLoteYMultiplo(cantidad, sku);
  
  const totalStock = inventarioActual + cantidadAjustada;
  let cDiario = consumoDiario;
  let requiereSupuesto = false;

  if (cDiario <= 0) {
    if (supuestoConsumoDiario && supuestoConsumoDiario > 0) {
      cDiario = supuestoConsumoDiario;
    } else {
      cDiario = 1; // Mínimo seguro para evitar división por cero, marcando supuesto
      requiereSupuesto = true;
    }
  }

  const coberturaDias = Math.round(totalStock / cDiario);

  const fechaBaseIso = getSystemDate();
  const fechaBase = new Date(fechaBaseIso);
  const fechaQuiebre = new Date(fechaBase);
  fechaQuiebre.setDate(fechaQuiebre.getDate() + coberturaDias);

  const mesIndex = fechaQuiebre.getMonth(); // 0-11
  const anio = fechaQuiebre.getFullYear();
  const mesNumero = mesIndex + 1; // 1-12
  const mesQuiebreTexto = `${MESES_NOMBRES[mesIndex]} de ${anio}`;

  // Verificar si cae en ventana de campaña
  let enVentana = false;
  let campaniaNombre = '';

  for (const camp of campanias) {
    if (camp.mes_inicio <= camp.mes_fin) {
      if (mesNumero >= camp.mes_inicio && mesNumero <= camp.mes_fin) {
        enVentana = true;
        campaniaNombre = camp.cultivo;
        break;
      }
    } else {
      if (mesNumero >= camp.mes_inicio || mesNumero <= camp.mes_fin) {
        enVentana = true;
        campaniaNombre = camp.cultivo;
        break;
      }
    }
  }

  const capitalUsd = Math.round(cantidadAjustada * sku.precio_referencia_usd);

  let advertenciaTexto = `Con ${formatoNumero(cantidadAjustada, 0)} ${sku.unidad} la cobertura queda en ${coberturaDias} días y el quiebre proyectado se desplaza a ${mesQuiebreTexto}`;
  if (enVentana && campaniaNombre) {
    advertenciaTexto += `, dentro de la ventana de campaña de ${campaniaNombre.toLowerCase()}.`;
  } else {
    advertenciaTexto += `.`;
  }

  if (requiereSupuesto) {
    advertenciaTexto += ` [Aviso: Consumo diario del SKU era 0; se requiere definir un supuesto explícito de consumo S&OP].`;
  }

  return {
    coberturaDias,
    fechaQuiebreIso: fechaQuiebre.toISOString().split('T')[0],
    mesQuiebreTexto,
    enVentanaCampania: enVentana,
    nombreCampania: campaniaNombre,
    capitalUsd,
    advertenciaTexto,
    ajustadoLote: ajustado,
    cantidadAjustada,
    mensajeAjuste: mensaje,
    requiereSupuestoConsumo: requiereSupuesto,
  };
}
