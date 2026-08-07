import { describe, it, expect } from 'vitest';
import {
  coberturaDias,
  coberturaConConsumoCero,
  obtenerLeadTimeConFallback,
  recalcularTransitoAtrasado,
  detectarYFiltrarAtipicos,
  evaluarCriticidadAlerta,
  calcularFillRate,
  validarDecisionCompra,
  LineaOrdenCompra,
} from '../index';

describe('Pruebas para Casos Borde Críticos del Motor de Negocio (Tarea 5)', () => {
  it('1. Inventario en 0: cobertura debe ser 0, criticidad CRÍTICA y sin NaN/Infinity', () => {
    const demanda = [100, 150, 200];
    const cob = coberturaDias(demanda, 0);

    expect(cob).toBe(0);
    expect(isNaN(cob)).toBe(false);
    expect(isFinite(cob)).toBe(true);

    const criticidad = evaluarCriticidadAlerta(cob, 30);
    expect(criticidad).toBe('CRITICA');
  });

  it('2. Consumo 0 en el periodo: cobertura debe devolver "SIN_DATO" o null (nunca Infinity ni 999)', () => {
    const demandaCero = [0, 0, 0];
    const cobRes = coberturaConConsumoCero(demandaCero, 500);

    expect(cobRes === 'SIN_DATO' || cobRes === null).toBe(true);
    expect(cobRes).not.toBe(Infinity);
    expect(cobRes).not.toBe(999);
  });

  it('3. Lead time nulo o undefined: usa el maestro de proveedor como fallback con advertencia', () => {
    const resNull = obtenerLeadTimeConFallback(null, 47);
    expect(resNull.leadTime).toBe(47);
    expect(resNull.advertencia).toBeDefined();
    expect(resNull.advertencia).toContain('47 días');

    const resUndefined = obtenerLeadTimeConFallback(undefined, 38);
    expect(resUndefined.leadTime).toBe(38);
    expect(resUndefined.advertencia).toBeDefined();
  });

  it('4. Orden parcial recibida: Fill rate se calcula con cantidad real recibida (600 / 1000 = 60%)', () => {
    const ordenes: LineaOrdenCompra[] = [
      {
        cantidad_solicitada: 1000,
        cantidad_recibida: 600,
        a_tiempo: true,
        completo: false,
        es_urgente: false,
        recibida: true,
      },
    ];

    const fillRate = calcularFillRate(ordenes);
    expect(fillRate).toBe(0.6); // 60%, no 100%
  });

  it('5. Recomendación rechazada sin motivo: debe lanzar un error de validación explícito', () => {
    expect(() =>
      validarDecisionCompra({
        reco_id: 'REC-2026-08-001',
        accion: 'RECHAZADA',
        cantidad_final: 0,
        motivo_desviacion: '', // Vacío: debe fallar
        usuario_id: 'USR-001',
      })
    ).toThrow('El campo motivo_desviacion es obligatorio');
  });

  it('6. Inventario en tránsito atrasado: recalcula fecha de quiebre ignorando el tránsito y eleva criticidad 1 nivel', () => {
    const disponible = 300;
    const comprometido = 0;
    const transitoValido = 0; // Se excluye el tránsito por estar atrasado
    const demanda = [300, 300, 300];

    const res = recalcularTransitoAtrasado(
      disponible,
      comprometido,
      transitoValido,
      demanda,
      'MEDIA'
    );

    expect(res.posicionSinTransitoAtrasado).toBe(300);
    expect(res.coberturaRecalculadaDias).toBe(30);
    expect(res.criticidadElevada).toBe('ALTA'); // SUBE de MEDIA a ALTA
  });

  it('7. Consumo atípico mayor a 3 desviaciones estándar: debe detectarse y excluirse del cálculo de promedio', () => {
    // Serie histórica de 12 meses (11 meses normales ~100 kg, 1 mes atípico de 1000 kg)
    const consumos = [100, 102, 98, 101, 99, 100, 102, 98, 101, 100, 99, 1000];
    const res = detectarYFiltrarAtipicos(consumos, 3);

    expect(res.atipicos.length).toBe(1);
    expect(res.atipicos[0].valor).toBe(1000);
    expect(res.consumosValidos.length).toBe(11);
    expect(res.promedioFiltrado).toBe(100); // Promedio limpio excluyendo el atípico
  });

  it('8. Cobertura con demanda estacional cero en un mes futuro: no divide por cero, salta el mes y continua', () => {
    const demandaEstacional = [50, 0, 100]; // Mes 2 tiene demanda 0
    const stock = 100;

    // Mes 1 consume 50 (queda 50). Mes 2 consume 0 (queda 50). Mes 3 consume 50 de 100 -> 0.5 mes.
    // Total dias: 30 (mes 1) + 30 (mes 2) + 15 (mes 3) = 75 días.
    const cob = coberturaDias(demandaEstacional, stock);

    expect(cob).toBe(75);
    expect(isNaN(cob)).toBe(false);
    expect(isFinite(cob)).toBe(true);
  });
});
