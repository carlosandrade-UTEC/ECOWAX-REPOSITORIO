import { Sku, Proveedor, IssueCalidad } from '../types';
import { generarUUID } from './id';

export interface FilaCarga {
  sku_id?: string;
  SKU?: string;
  periodo?: string;
  PERIODO?: string;
  cantidad?: number | string;
  CANTIDAD?: number | string;
  cantidad_solicitada?: number | string;
  inventario_disponible?: number | string;
  zona_id?: string;
  ZONA_ID?: string;
  zona?: string;
  lead_time?: number | string;
  lead_time_dias?: number | string;
  LEAD_TIME?: number | string;
  fecha_orden?: string;
  fecha_emision?: string;
  fecha_po?: string;
  fecha_recepcion?: string;
  fecha_recepcion_real?: string;
  unidad?: string;
  UNIDAD?: string;
  proveedor_id?: string;
  PROVEEDOR_ID?: string;
  proveedor?: string;
  estado?: string;
  ESTADO?: string;
  [key: string]: any;
}

export interface ResultadoValidacionCarga {
  filasTotales: number;
  filasValidas: number;
  filasConError: number;
  tieneErroresBloqueantes: boolean;
  issues: IssueCalidad[];
}

/**
 * Valida cada fila de un archivo cargado (CSV, XLSX o JSON) aplicando las 10 Reglas de Negocio obligatorias,
 * capturando errores estructurales del parser y calculando verdaderas desviaciones estadísticas 3-sigma por SKU.
 */
export function validarCargaDatos(
  rows: FilaCarga[],
  skus: Sku[] = [],
  proveedores: Proveedor[] = [],
  parserErrors: any[] = []
): ResultadoValidacionCarga {
  const issues: IssueCalidad[] = [];
  const validSkuIds = new Set(skus.map((s) => s.sku_id));
  const skuMap = new Map<string, Sku>(skus.map((s) => [s.sku_id, s]));
  const validProveedorIds = new Set(proveedores.map((p) => p.proveedor_id));

  const combinacionesSet = new Set<string>();
  const filasConErrorSet = new Set<number>();

  // 0. Captura e integración de errores estructurales entregados por el parser (PapaParse/XLSX)
  if (Array.isArray(parserErrors) && parserErrors.length > 0) {
    parserErrors.forEach((pErr, i) => {
      const filaNum = (pErr.row !== undefined ? pErr.row : i) + 1;
      issues.push({
        issue_id: `DQ-STRUCT-${filaNum}-${generarUUID().substring(0, 8)}`,
        upload_id: 'TEMP',
        fila: filaNum,
        campo: pErr.code || 'estructura_archivo',
        valor: String(pErr.message || 'Error de parseo'),
        regla: 'El archivo contiene errores de sintaxis o delimitadores estructurales no válidos.',
        severidad: 'BLOQUEANTE',
        accion: 'Fila rechazada',
        estado: 'ABIERTO',
      });
      filasConErrorSet.add(filaNum);
    });
  }

  // Pre-cálculo de media y desviación estándar de consumos para la regla 3-Sigma real
  const consumosPorSku = new Map<string, number[]>();
  rows.forEach((r) => {
    const rawSku = String(r.sku_id ?? r.SKU ?? '').trim();
    const rawCant = r.cantidad ?? r.CANTIDAD ?? r.cantidad_solicitada;
    const cantNum = Number(rawCant);
    if (rawSku && !isNaN(cantNum) && cantNum > 0) {
      if (!consumosPorSku.has(rawSku)) consumosPorSku.set(rawSku, []);
      consumosPorSku.get(rawSku)!.push(cantNum);
    }
  });

  const statsSigmaMap = new Map<string, { media: number; desvStd: number }>();
  consumosPorSku.forEach((lista, skuKey) => {
    if (lista.length >= 3) {
      const media = lista.reduce((a, b) => a + b, 0) / lista.length;
      const varianza = lista.reduce((sum, x) => sum + Math.pow(x - media, 2), 0) / lista.length;
      const desvStd = Math.sqrt(varianza);
      statsSigmaMap.set(skuKey, { media, desvStd });
    }
  });

  rows.forEach((row, idx) => {
    const filaNum = idx + 1;

    // Normalización de campos
    const rawSkuId = row.sku_id ?? row.SKU;
    const skuId = rawSkuId ? String(rawSkuId).trim() : '';

    const rawPeriodo = row.periodo ?? row.PERIODO;
    const periodo = rawPeriodo ? String(rawPeriodo).trim() : '';

    const rawCantidad = row.cantidad ?? row.CANTIDAD ?? row.cantidad_solicitada ?? row.inventario_disponible;
    const rawZonaId = row.zona_id ?? row.ZONA_ID ?? row.zona;
    const zonaId = rawZonaId ? String(rawZonaId).trim() : '';

    const rawLeadTime = row.lead_time ?? row.lead_time_dias ?? row.LEAD_TIME;
    const rawFechaOrden = row.fecha_orden ?? row.fecha_emision ?? row.fecha_po;
    const rawFechaRecepcion = row.fecha_recepcion ?? row.fecha_recepcion_real;
    const rawUnidad = row.unidad ?? row.UNIDAD;
    const rawProveedorId = row.proveedor_id ?? row.PROVEEDOR_ID ?? row.proveedor;
    const rawEstado = row.estado ?? row.ESTADO;

    // REGLA 10: Campos obligatorios no pueden estar vacíos (sku_id, periodo, cantidad, zona_id) [ERROR]
    const camposFaltantes: string[] = [];
    if (!skuId) camposFaltantes.push('sku_id');
    if (!periodo) camposFaltantes.push('periodo');
    if (rawCantidad === undefined || rawCantidad === null || String(rawCantidad).trim() === '') {
      camposFaltantes.push('cantidad');
    }
    if (!zonaId) camposFaltantes.push('zona_id');

    if (camposFaltantes.length > 0) {
      issues.push({
        issue_id: `DQ-R10-${filaNum}-${generarUUID().substring(0, 8)}`,
        upload_id: 'TEMP',
        fila: filaNum,
        campo: camposFaltantes.join(', '),
        valor: 'VACÍO',
        regla: `Los campos obligatorios (${camposFaltantes.join(', ')}) no pueden estar vacíos.`,
        severidad: 'BLOQUEANTE',
        accion: 'Fila rechazada',
        estado: 'ABIERTO',
      });
      filasConErrorSet.add(filaNum);
    }

    // REGLA 1: SKU debe existir en dim_sku [ERROR]
    if (!skuId) {
      // Ya marcado en R10
    } else if (!validSkuIds.has(skuId)) {
      issues.push({
        issue_id: `DQ-R1-${filaNum}-${generarUUID().substring(0, 8)}`,
        upload_id: 'TEMP',
        fila: filaNum,
        campo: 'sku_id',
        valor: skuId,
        regla: `El SKU (${skuId}) no existe en el maestro dim_sku.`,
        severidad: 'BLOQUEANTE',
        accion: 'Fila rechazada',
        estado: 'ABIERTO',
      });
      filasConErrorSet.add(filaNum);
    }

    // REGLA 2: Cantidad debe ser mayor a 0 y numérica válida [ERROR]
    if (rawCantidad !== undefined && rawCantidad !== null && String(rawCantidad).trim() !== '') {
      const numCant = Number(rawCantidad);
      if (isNaN(numCant) || numCant <= 0) {
        issues.push({
          issue_id: `DQ-R2-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'cantidad',
          valor: String(rawCantidad),
          regla: 'La cantidad debe ser un número válido estrictamente mayor a 0.',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      } else if (skuId && statsSigmaMap.has(skuId)) {
        // Detección real 3-Sigma por SKU
        const { media, desvStd } = statsSigmaMap.get(skuId)!;
        if (desvStd > 0 && Math.abs(numCant - media) > 3 * desvStd) {
          issues.push({
            issue_id: `DQ-R2-3SIGMA-${filaNum}-${generarUUID().substring(0, 8)}`,
            upload_id: 'TEMP',
            fila: filaNum,
            campo: 'cantidad',
            valor: `${numCant} (Media: ${media.toFixed(1)}, Sigma: ${desvStd.toFixed(1)})`,
            regla: `Observación: Cantidad excede 3 desviaciones estándar (> 3σ) respecto a la media histórica del SKU (${skuId}).`,
            severidad: 'ADVERTENCIA',
            accion: 'Marcar para revisión S&OP',
            estado: 'ABIERTO',
          });
        }
      }
    }

    // REGLA 3: Lead time no puede ser negativo [ERROR]
    if (rawLeadTime !== undefined && rawLeadTime !== null && String(rawLeadTime).trim() !== '') {
      const numLt = Number(rawLeadTime);
      if (isNaN(numLt) || numLt < 0) {
        issues.push({
          issue_id: `DQ-R3-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'lead_time',
          valor: String(rawLeadTime),
          regla: 'El lead time no puede ser un número negativo.',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      }
    }

    // REGLA 4: Fecha de recepción no puede ser anterior a fecha de orden [ERROR]
    if (rawFechaOrden && rawFechaRecepcion) {
      const dateOrden = new Date(String(rawFechaOrden));
      const dateRecep = new Date(String(rawFechaRecepcion));
      if (!isNaN(dateOrden.getTime()) && !isNaN(dateRecep.getTime())) {
        if (dateRecep < dateOrden) {
          issues.push({
            issue_id: `DQ-R4-${filaNum}-${generarUUID().substring(0, 8)}`,
            upload_id: 'TEMP',
            fila: filaNum,
            campo: 'fecha_recepcion',
            valor: `${rawFechaRecepcion} (Orden: ${rawFechaOrden})`,
            regla: 'La fecha de recepción no puede ser anterior a la fecha de emisión o de orden.',
            severidad: 'BLOQUEANTE',
            accion: 'Fila rechazada',
            estado: 'ABIERTO',
          });
          filasConErrorSet.add(filaNum);
        }
      }
    }

    // REGLA 5: Unidades deben coincidir con las del maestro dim_sku [ERROR]
    if (skuId && validSkuIds.has(skuId) && rawUnidad) {
      const skuMaster = skuMap.get(skuId);
      const unidadStr = String(rawUnidad).trim().toLowerCase();
      if (skuMaster && skuMaster.unidad.trim().toLowerCase() !== unidadStr) {
        issues.push({
          issue_id: `DQ-R5-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'unidad',
          valor: String(rawUnidad),
          regla: `La unidad (${rawUnidad}) no coincide con la configurada en el maestro dim_sku (${skuMaster.unidad}).`,
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      }
    }

    // REGLA 6: No duplicados por combinación periodo+sku_id+zona_id [ERROR]
    if (periodo && skuId && zonaId) {
      const comboKey = `${periodo}_${skuId}_${zonaId}`;
      if (combinacionesSet.has(comboKey)) {
        issues.push({
          issue_id: `DQ-R6-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'combinación_periodo_sku_zona',
          valor: comboKey,
          regla: `Registro duplicado detectado para la clave (periodo=${periodo}, sku_id=${skuId}, zona_id=${zonaId}).`,
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      } else {
        combinacionesSet.add(comboKey);
      }
    }

    // REGLA 7: Proveedor debe existir en dim_proveedor [ERROR]
    if (rawProveedorId !== undefined && rawProveedorId !== null && String(rawProveedorId).trim() !== '') {
      const provStr = String(rawProveedorId).trim();
      if (!validProveedorIds.has(provStr)) {
        issues.push({
          issue_id: `DQ-R7-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'proveedor_id',
          valor: provStr,
          regla: `El proveedor (${provStr}) debe existir en el catálogo maestro dim_proveedor.`,
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      }
    }

    // REGLA 8: Periodo en formato YYYY-MM [ERROR]
    if (periodo) {
      const periodoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!periodoRegex.test(periodo)) {
        issues.push({
          issue_id: `DQ-R8-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'periodo',
          valor: periodo,
          regla: 'El periodo debe tener el formato YYYY-MM válido (ej. 2026-08).',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      }
    }

    // REGLA 9: Estado solo acepta valores del catálogo: ACTIVO, INACTIVO, PENDIENTE [ERROR]
    if (rawEstado !== undefined && rawEstado !== null && String(rawEstado).trim() !== '') {
      const estStr = String(rawEstado).trim().toUpperCase();
      const estadosValidos = new Set(['ACTIVO', 'INACTIVO', 'PENDIENTE']);
      if (!estadosValidos.has(estStr)) {
        issues.push({
          issue_id: `DQ-R9-${filaNum}-${generarUUID().substring(0, 8)}`,
          upload_id: 'TEMP',
          fila: filaNum,
          campo: 'estado',
          valor: String(rawEstado),
          regla: 'El estado solo acepta valores permitidos del catálogo: ACTIVO, INACTIVO, PENDIENTE.',
          severidad: 'BLOQUEANTE',
          accion: 'Fila rechazada',
          estado: 'ABIERTO',
        });
        filasConErrorSet.add(filaNum);
      }
    }
  });

  const filasTotales = rows.length;
  const filasConError = filasConErrorSet.size;
  const filasValidas = Math.max(0, filasTotales - filasConError);
  const tieneErroresBloqueantes = issues.some((i) => i.severidad === 'BLOQUEANTE');

  return {
    filasTotales,
    filasValidas,
    filasConError,
    tieneErroresBloqueantes,
    issues,
  };
}
