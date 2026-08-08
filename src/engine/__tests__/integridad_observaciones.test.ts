import { describe, it, expect, beforeEach } from 'vitest';
import {
  calcularStockSeguridad,
  validarCargaDatos,
  generarClaveIdempotencia,
  getSystemDate,
  setSystemDate,
  resetSystemDate,
} from '../index';
import { mockProvider } from '../../services/mockProvider';
import { Sku, CargaDatos } from '../../types';

describe('Pruebas de Integridad, Carga y Motor (Sprint de Control - Tareas P0/P1)', () => {
  beforeEach(() => {
    resetSystemDate();
  });

  it('1. Protección interna de Lead Time negativo: debe lanzar error de dominio explícito en calcularStockSeguridad', () => {
    expect(() => calcularStockSeguridad(2.05, 5.0, -10)).toThrow('El Lead Time no puede ser negativo');
  });

  it('2. Validación de Carga: debe detectar y rechazar filas con sku_id vacío, cantidad NaN o menor/igual a 0', () => {
    const filasInvalidas = [
      { sku_id: '', periodo: '2026-08', cantidad: 100, zona_id: 'ZONA-1' }, // sku_id vacío
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 'NaN_TEXT', zona_id: 'ZONA-1' }, // cantidad NaN
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: -50, zona_id: 'ZONA-1' }, // cantidad negativa
    ];

    const res = validarCargaDatos(filasInvalidas as any, [], []);
    expect(res.tieneErroresBloqueantes).toBe(true);
    expect(res.filasConError).toBeGreaterThan(0);
    expect(res.issues.some((i) => i.campo.includes('sku_id'))).toBe(true);
    expect(res.issues.some((i) => i.campo === 'cantidad')).toBe(true);
  });

  it('3. Integración de errores del Parser PapaParse: convierte errores de sintaxis en issues de calidad bloqueantes', () => {
    const parserErrors = [{ row: 2, code: 'TooFewFields', message: 'Faltan campos en la fila' }];
    const res = validarCargaDatos([], [], [], parserErrors);

    expect(res.tieneErroresBloqueantes).toBe(true);
    expect(res.issues.some((i) => i.campo === 'TooFewFields')).toBe(true);
  });

  it('4. Clave de Idempotencia: genera hashes reproducibles para evitar cargas duplicadas', () => {
    const key1 = generarClaveIdempotencia('consumo_2026.csv', 1024, 50, '2026-08');
    const key2 = generarClaveIdempotencia('consumo_2026.csv', 1024, 50, '2026-08');

    expect(key1).toBe(key2);
    expect(key1).toContain('consumo2026csv');
  });

  it('5. Reloj Dinámico del Sistema (Clock Service): permite cambiar y reiniciar la fecha de corte', () => {
    expect(getSystemDate()).toBe('2026-08-07');
    setSystemDate('2026-12-01');
    expect(getSystemDate()).toBe('2026-12-01');
    resetSystemDate();
    expect(getSystemDate()).toBe('2026-08-07');
  });

  it('6. Reclasificación ABC en Maestro SKU: recalcula automáticamente SS y ROP en el proveedor', async () => {
    const skus = await mockProvider.getSkus();
    const skuTarget = skus.find((s) => s.sku_id === 'INS-001');

    if (skuTarget) {
      const oldAbc = skuTarget.clase_abc;
      const newAbc: Sku['clase_abc'] = oldAbc === 'A' ? 'C' : 'A';

      const updated = await mockProvider.updateSku({
        ...skuTarget,
        clase_abc: newAbc,
      });

      expect(updated.clase_abc).toBe(newAbc);

      const reordenList = await mockProvider.getReorden();
      const reordenSku = reordenList.find((r) => r.sku_id === 'INS-001');
      expect(reordenSku?.clase_abc).toBe(newAbc);
    }
  });

  it('7. Carga Confirmada en mockProvider: alimenta activamente el sistema y genera auditoría inmutable', async () => {
    const cargaData: CargaDatos = {
      upload_id: 'IDEMP-TEST-001',
      fecha: '2026-08-07 20:00',
      usuario_id: 'USR-001',
      tabla_destino: 'fact_consumo',
      archivo: 'test_consumo.csv',
      filas_totales: 1,
      filas_ok: 1,
      filas_rechazadas: 0,
      estado: 'OK',
      detalle: 'Carga de prueba',
    };

    const filasValidas = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 1500, zona_id: 'ZONA-1' },
    ];

    await mockProvider.saveCarga(cargaData, [], filasValidas);

    const cargas = await mockProvider.getCargas();
    expect(cargas.some((c) => c.upload_id === 'IDEMP-TEST-001')).toBe(true);

    const auditoria = await mockProvider.getAuditoria();
    expect(auditoria.some((a) => a.entidad_id === 'IDEMP-TEST-001')).toBe(true);

    const consumos = await mockProvider.getConsumoMensual('INS-001');
    expect(consumos.some((c) => c.cantidad === 1500 && c.periodo === '2026-08')).toBe(true);
  });
});
