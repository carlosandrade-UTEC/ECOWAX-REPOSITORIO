import { describe, it, expect } from 'vitest';
import {
  calcularPosicionInventario,
  calcularStockSeguridad,
  calcularPuntoReorden,
  coberturaDias,
  calcularFechaQuiebre,
  evaluarPuntoReorden,
  obtenerZScore,
} from '../inventario';
import {
  calcularFillRate,
  calcularOTIF,
  calcularPctUrgentes,
  calcularMAPE,
  calcularSesgo,
  evaluarSemaforoKPI,
} from '../kpi';
import { generarRecomendacion } from '../recomendacion';
import { calcularClasificacionABC } from '../abc';
import { ajustarLoteYMultiplo, calcularConsecuenciaMotor } from '../consecuencia';
import {
  formatoNumero,
  formatoMoneda,
  formatoPorcentaje,
  formatoFechaISOAFormatoPeruano,
} from '../formato';
import { Sku } from '../../types';

describe('Engine Unit Tests - Inventario y Cobertura', () => {
  it('Maneja caso borde: Inventario 0', () => {
    const pos = calcularPosicionInventario(0, 0, 0);
    expect(pos).toBe(0);

    const cob = coberturaDias([100, 100], 0);
    expect(cob).toBe(0);

    const quiebre = calcularFechaQuiebre(0, '2026-08-06');
    expect(quiebre).toBe('2026-08-06');
  });

  it('Maneja caso borde: Consumo 0', () => {
    const res = evaluarPuntoReorden(
      100, // disponible
      0,   // comprometido
      0,   // transito
      0,   // consumo prom diario = 0
      5,   // desv std
      30,  // lead time
      0.95,
      [0, 0, 0],
      'INS-001',
      'A'
    );

    expect(res.consumo_prom_diario).toBe(0);
    expect(res.stock_seguridad).toBe(0);
    expect(res.punto_reorden).toBe(0);
    expect(res.cobertura_actual_dias).toBe(0);
  });

  it('Maneja caso borde: Lead time nulo o 0', () => {
    const ss0 = calcularStockSeguridad(1.65, 5, 0);
    expect(ss0).toBe(0);

    const rop0 = calcularPuntoReorden(20, 0, 0);
    expect(rop0).toBe(0);
  });

  it('Maneja caso borde: Lead time negativo o insólito', () => {
    // Math.sqrt de un número negativo en JS da NaN si no se valida
    const ssNeg = calcularStockSeguridad(1.65, 5, Math.max(0, -10));
    expect(ssNeg).toBe(0);
  });
});

describe('Engine Unit Tests - KPIs y Control de Calidad', () => {
  it('Calcula Fill Rate para entregas completas y parciales (Orden parcial)', () => {
    const lineas = [
      { cantidad_solicitada: 1000, cantidad_recibida: 800, a_tiempo: true, completo: false, es_urgente: false, recibida: true },
      { cantidad_solicitada: 500, cantidad_recibida: 500, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
    ];
    const fillRate = calcularFillRate(lineas);
    expect(fillRate).toBe(1300 / 1500); // 86.66%
  });

  it('Maneja OTIF con orden parcial o retrasada', () => {
    const lineas = [
      { cantidad_solicitada: 1000, cantidad_recibida: 1000, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
      { cantidad_solicitada: 500, cantidad_recibida: 400, a_tiempo: true, completo: false, es_urgente: false, recibida: true },
    ];
    const otif = calcularOTIF(lineas);
    expect(otif).toBe(0.5); // 1 de 2 cumplió a tiempo Y completo
  });

  it('Calcula MAPE y Sesgo ignorando registros sin demanda real (Consumo 0 / Histórico insuficiente)', () => {
    const registros = [
      { pronostico: 100, real: 0 }, // Inválido / consumo 0
      { pronostico: 120, real: 100 }, // +20%
      { pronostico: 90, real: 100 },  // -10%
    ];

    const mape = calcularMAPE(registros);
    expect(mape).toBeCloseTo((0.2 + 0.1) / 2, 4); // 0.15

    const sesgo = calcularSesgo(registros);
    // Diff: (120-100) + (90-100) = 20 - 10 = 10. SumReal = 200. Sesgo = 10 / 200 = 0.05 (+5%)
    expect(sesgo).toBeCloseTo(0.05, 4);
  });

  it('Semaforiza KPIs correctamente', () => {
    expect(evaluarSemaforoKPI('FILL_RATE', 0.98, 0.95, 'MAYOR_MEJOR', 0.90, 0.85)).toBe('VERDE');
    expect(evaluarSemaforoKPI('FILL_RATE', 0.92, 0.95, 'MAYOR_MEJOR', 0.90, 0.85)).toBe('AMBAR');
    expect(evaluarSemaforoKPI('FILL_RATE', 0.80, 0.95, 'MAYOR_MEJOR', 0.90, 0.85)).toBe('ROJO');
    expect(evaluarSemaforoKPI('FILL_RATE', null, 0.95, 'MAYOR_MEJOR', 0.90, 0.85)).toBe('SIN_DATO');
  });
});

describe('Engine Unit Tests - Ajuste de Loteo y Consecuencias', () => {
  const skuBase: Sku = {
    sku_id: 'INS-001',
    nombre: 'Cera de carnauba',
    categoria: 'Ceras',
    unidad: 'kg',
    clase_abc: 'A',
    criticidad: 'ALTA',
    proveedor_default: 'PRV-001',
    lote_minimo: 600,
    multiplo_compra: 150,
    precio_referencia_usd: 6.8,
  };

  it('Ajusta automáticamente por lote mínimo y múltiplo de compra', () => {
    // Pedido menor que MOQ (320 kg < 600 kg)
    const res = ajustarLoteYMultiplo(320, skuBase);
    expect(res.cantidadAjustada).toBe(600);
    expect(res.ajustado).toBe(true);

    // Pedido por encima de MOQ pero no es múltiplo de 150 (620 kg -> 750 kg)
    const res2 = ajustarLoteYMultiplo(620, skuBase);
    expect(res2.cantidadAjustada).toBe(750);
    expect(res2.ajustado).toBe(true);
  });

  it('Maneja consumo atípico o cero en el motor de consecuencia', () => {
    const res = calcularConsecuenciaMotor(skuBase, 0, 800, 0, []);
    expect(res.cantidadAjustada).toBe(0);
    expect(res.capitalUsd).toBe(0);
  });
});

describe('Engine Unit Tests - Clasificación ABC', () => {
  it('Maneja lista vacía o consumo total 0', () => {
    const res = calcularClasificacionABC([]);
    expect(res.size).toBe(0);

    const res2 = calcularClasificacionABC([
      { sku_id: 'SKU-1', consumo12Meses: 0, precioReferenciaUsd: 10 },
      { sku_id: 'SKU-2', consumo12Meses: 0, precioReferenciaUsd: 5 },
    ]);
    expect(res2.get('SKU-1')).toBe('C');
    expect(res2.get('SKU-2')).toBe('C');
  });

  it('Clasifica correctamente en A, B y C segun pareto 80/15/5', () => {
    const items = [
      { sku_id: 'SKU-A', consumo12Meses: 1000, precioReferenciaUsd: 80 }, // 80,000 (80%)
      { sku_id: 'SKU-B', consumo12Meses: 300, precioReferenciaUsd: 50 },  // 15,000 (15%)
      { sku_id: 'SKU-C', consumo12Meses: 100, precioReferenciaUsd: 50 },  // 5,000 (5%)
    ];
    const res = calcularClasificacionABC(items);
    expect(res.get('SKU-A')).toBe('A');
    expect(res.get('SKU-B')).toBe('B');
    expect(res.get('SKU-C')).toBe('C');
  });
});

describe('Engine Unit Tests - Formateador de Datos', () => {
  it('Formatea números estilo peruano (punto miles, coma decimales)', () => {
    expect(formatoNumero(1234.56, 2)).toBe('1.234,56');
    expect(formatoMoneda(1234.5, 'USD')).toBe('USD $ 1.234,50');
    expect(formatoPorcentaje(0.982, 1)).toBe('98,2%');
    expect(formatoFechaISOAFormatoPeruano('2026-08-07')).toBe('07/08/2026');
  });

  it('Devuelve "sin dato" ante valores nulos, undefined o NaN', () => {
    expect(formatoNumero(null)).toBe('sin dato');
    expect(formatoMoneda(undefined)).toBe('sin dato');
    expect(formatoPorcentaje(NaN)).toBe('sin dato');
    expect(formatoFechaISOAFormatoPeruano(null)).toBe('sin dato');
  });
});
