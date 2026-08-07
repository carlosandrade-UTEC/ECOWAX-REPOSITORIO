import { describe, it, expect } from 'vitest';
import {
  calcularPosicionInventario,
  coberturaDias,
  calcularStockSeguridad,
  calcularPuntoReorden,
  calcularClasificacionABC,
  calcularFillRate,
  calcularOTIF,
  calcularPctUrgentes,
  calcularFechaQuiebre,
  evaluarCriticidadAlerta,
  ordenarAlertasPorCriticidad,
  RULES_VERSION,
} from '../index';
import { LineaOrdenCompra } from '../kpi';
import { ItemConsumoValor } from '../abc';
import { Alerta } from '../../types';

describe('Pruebas del Motor de Reglas (src/engine/) - Tarea 1', () => {
  it('0. Debe verificar la versión oficial de reglas de negocio', () => {
    expect(RULES_VERSION).toBe('RB-2026.08');
  });

  it('1. Cálculo de Posición de Inventario = disponible - comprometido + en tránsito', () => {
    // Caso estándar: 1000 disp, 200 comp, 300 en tránsito = 1100
    expect(calcularPosicionInventario(1000, 200, 300)).toBe(1100);

    // Sin compromiso ni tránsito
    expect(calcularPosicionInventario(500, 0, 0)).toBe(500);

    // Mayor comprometido que disponible
    expect(calcularPosicionInventario(100, 300, 0)).toBe(-200);
  });

  it('2. Cálculo de Cobertura en días contra Demanda Estacional mes a mes (nunca promedio)', () => {
    // Demanda futura estacional: Mes 1 = 300 kg, Mes 2 = 600 kg, Mes 3 = 900 kg
    const demandaEstacional = [300, 600, 900];

    // Caso A: Stock = 300 kg cubre exactamente 1 mes = 30 días
    expect(coberturaDias(demandaEstacional, 300)).toBe(30);

    // Caso B: Stock = 600 kg cubre Mes 1 (300) + la mitad del Mes 2 (300/600 * 30 = 15 días) => 45 días
    expect(coberturaDias(demandaEstacional, 600)).toBe(45);

    // Caso C: Stock = 0 o negativo => 0 días
    expect(coberturaDias(demandaEstacional, 0)).toBe(0);
    expect(coberturaDias(demandaEstacional, -50)).toBe(0);
  });

  it('3. Cálculo de Stock de Seguridad = z * sigma * sqrt(lead_time)', () => {
    // z = 1.65 (95% servicio), sigma = 10 kg/día, leadTime = 25 días => 1.65 * 10 * 5 = 82.5
    expect(calcularStockSeguridad(1.65, 10, 25)).toBe(82.5);

    // z = 2.05 (98% servicio), sigma = 5, leadTime = 16 => 2.05 * 5 * 4 = 41.0
    expect(calcularStockSeguridad(2.05, 5, 16)).toBe(41.0);
  });

  it('4. Cálculo de Punto de Reorden (ROP = consumo_forward + stock_seguridad)', () => {
    // consumoPromedioDiario = 20, leadTime = 30 días, stockSeguridad = 150
    // ROP = (20 * 30) + 150 = 750
    expect(calcularPuntoReorden(20, 30, 150)).toBe(750);
  });

  it('5. Clasificación ABC por valor acumulado de consumo (Pareto 80/15/5)', () => {
    const items: ItemConsumoValor[] = [
      { sku_id: 'INS-001', consumo12Meses: 1000, precioReferenciaUsd: 10 }, // $10,000 (80.0%) -> A
      { sku_id: 'INS-002', consumo12Meses: 150, precioReferenciaUsd: 10 },  // $1,500 (acumulado 92.0%) -> B
      { sku_id: 'INS-003', consumo12Meses: 100, precioReferenciaUsd: 10 },  // $1,000 (acumulado 100.0%) -> C
    ];

    const resultado = calcularClasificacionABC(items);
    expect(resultado.get('INS-001')).toBe('A');
    expect(resultado.get('INS-002')).toBe('B');
    expect(resultado.get('INS-003')).toBe('C');
  });

  it('6. Cálculo de Fill Rate = Suma Recibida / Suma Solicitada sobre OCs recibidas', () => {
    const lineas: LineaOrdenCompra[] = [
      { cantidad_solicitada: 1000, cantidad_recibida: 1000, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
      { cantidad_solicitada: 1000, cantidad_recibida: 500, a_tiempo: true, completo: false, es_urgente: false, recibida: true },
      { cantidad_solicitada: 500, cantidad_recibida: 0, a_tiempo: false, completo: false, es_urgente: true, recibida: false }, // No recibida aun
    ];

    // Suma solicitada recibidas = 2000, suma recibida = 1500 => Fill Rate = 0.75 (75%)
    expect(calcularFillRate(lineas)).toBe(0.75);
  });

  it('7. Cálculo de OTIF = A tiempo Y completo (un día de retraso invalida la línea)', () => {
    const lineas: LineaOrdenCompra[] = [
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: false, completo: true, es_urgente: false, recibida: true }, // Retraso invalida OTIF
      { cantidad_solicitada: 100, cantidad_recibida: 80, a_tiempo: true, completo: false, es_urgente: false, recibida: true },  // Incompleto invalida OTIF
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
    ];

    // 2 líneas cumplieron a tiempo Y completo de 4 totales = 50%
    expect(calcularOTIF(lineas)).toBe(0.5);
  });

  it('8. Cálculo de Porcentaje de Compras Urgentes', () => {
    const lineas: LineaOrdenCompra[] = [
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: true, completo: true, es_urgente: true, recibida: true },
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
      { cantidad_solicitada: 100, cantidad_recibida: 100, a_tiempo: true, completo: true, es_urgente: false, recibida: true },
    ];

    // 1 de 4 urgentes = 25% (0.25)
    expect(calcularPctUrgentes(lineas)).toBe(0.25);
  });

  it('9. Fecha Estimada de Quiebre de Stock', () => {
    // Cobertura de 10 días a partir de 2026-08-06 => 2026-08-16
    expect(calcularFechaQuiebre(10, '2026-08-06')).toBe('2026-08-16');
    expect(calcularFechaQuiebre(0, '2026-08-06')).toBe('2026-08-06');
  });

  it('10. Nivel de Criticidad de Alerta y Ordenamiento por Severidad (CRITICA > ALTA > MEDIA > BAJA)', () => {
    expect(evaluarCriticidadAlerta(25, 45)).toBe('CRITICA');
    expect(evaluarCriticidadAlerta(50, 45)).toBe('ALTA');
    expect(evaluarCriticidadAlerta(80, 45)).toBe('MEDIA');
    expect(evaluarCriticidadAlerta(120, 45)).toBe('BAJA');

    const alertasPrueba: Partial<Alerta>[] = [
      { alerta_id: 'A1', criticidad: 'BAJA', fecha_limite_emision: '2026-08-20' },
      { alerta_id: 'A2', criticidad: 'CRITICA', fecha_limite_emision: '2026-08-30' },
      { alerta_id: 'A3', criticidad: 'ALTA', fecha_limite_emision: '2026-08-25' },
      { alerta_id: 'A4', criticidad: 'CRITICA', fecha_limite_emision: '2026-08-15' },
    ];

    const ordenadas = ordenarAlertasPorCriticidad(alertasPrueba as Alerta[]);
    expect(ordenadas.map((a) => a.alerta_id)).toEqual(['A4', 'A2', 'A3', 'A1']);
  });
});
