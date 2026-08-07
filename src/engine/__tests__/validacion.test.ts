import { describe, it, expect } from 'vitest';
import { validarCargaDatos, FilaCarga } from '../validacion';
import { Sku, Proveedor } from '../../types';

describe('Pruebas del Motor de Validación de Carga de Datos (src/engine/validacion.ts) - Tarea 3', () => {
  const skusPrueba: Partial<Sku>[] = [
    { sku_id: 'INS-001', nombre: 'Carnauba T1', unidad: 'kg' },
    { sku_id: 'INS-002', nombre: 'Cera Polietileno', unidad: 'kg' },
  ];

  const proveedoresPrueba: Partial<Proveedor>[] = [
    { proveedor_id: 'PRV-001', nombre: 'Chemical Suppliers Co.' },
  ];

  it('1. Debe rechazar SKU que no existe en dim_sku (Regla 1)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-999', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR' },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'sku_id' && i.valor === 'INS-999')).toBe(true);
  });

  it('2. Debe rechazar Cantidad menor o igual a 0 o no numérica (Regla 2)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: -50, zona_id: 'ZN-NOR' },
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 0, zona_id: 'ZN-SUR' },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    const issuesCant = resultado.issues.filter((i) => i.campo === 'cantidad');
    expect(issuesCant.length).toBe(2);
  });

  it('3. Debe rechazar Lead time negativo (Regla 3)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR', lead_time: -15 },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'lead_time' && i.valor === '-15')).toBe(true);
  });

  it('4. Debe rechazar Fecha de recepción anterior a fecha de orden (Regla 4)', () => {
    const filas: FilaCarga[] = [
      {
        sku_id: 'INS-001',
        periodo: '2026-08',
        cantidad: 100,
        zona_id: 'ZN-NOR',
        fecha_orden: '2026-08-10',
        fecha_recepcion: '2026-08-05', // Invalida: recepcion antes de la orden
      },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'fecha_recepcion')).toBe(true);
  });

  it('5. Debe rechazar Unidades que no coinciden con el maestro dim_sku (Regla 5)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR', unidad: 'L' }, // INS-001 usa kg
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'unidad' && i.valor === 'L')).toBe(true);
  });

  it('6. Debe rechazar Registros duplicados por periodo + sku_id + zona_id (Regla 6)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR' },
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 200, zona_id: 'ZN-NOR' }, // Duplicado
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'combinación_periodo_sku_zona')).toBe(true);
  });

  it('7. Debe rechazar Proveedor no existente en dim_proveedor (Regla 7)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR', proveedor_id: 'PRV-999' },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'proveedor_id' && i.valor === 'PRV-999')).toBe(true);
  });

  it('8. Debe rechazar Periodo con formato distinto a YYYY-MM (Regla 8)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '08-2026', cantidad: 100, zona_id: 'ZN-NOR' },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'periodo' && i.valor === '08-2026')).toBe(true);
  });

  it('9. Debe rechazar Estado con valor fuera de catálogo (Regla 9)', () => {
    const filas: FilaCarga[] = [
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR', estado: 'ELIMINADO' },
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo === 'estado' && i.valor === 'ELIMINADO')).toBe(true);
  });

  it('10. Debe rechazar filas con Campos Obligatorios Vacíos (Regla 10)', () => {
    const filas: FilaCarga[] = [
      { sku_id: '', periodo: '2026-08', cantidad: 100, zona_id: 'ZN-NOR' }, // sku_id vacío
      { sku_id: 'INS-001', periodo: '2026-08', cantidad: 100, zona_id: '' }, // zona_id vacío
    ];

    const resultado = validarCargaDatos(
      filas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(true);
    expect(resultado.issues.some((i) => i.campo.includes('sku_id'))).toBe(true);
    expect(resultado.issues.some((i) => i.campo.includes('zona_id'))).toBe(true);
  });

  it('11. Debe aceptar una carga completamente válida sin errores bloqueantes', () => {
    const filasValidas: FilaCarga[] = [
      {
        sku_id: 'INS-001',
        periodo: '2026-08',
        cantidad: 500,
        zona_id: 'ZN-NOR',
        unidad: 'kg',
        lead_time: 30,
        proveedor_id: 'PRV-001',
        estado: 'ACTIVO',
      },
      {
        sku_id: 'INS-002',
        periodo: '2026-08',
        cantidad: 250,
        zona_id: 'ZN-SUR',
        unidad: 'kg',
        lead_time: 15,
        proveedor_id: 'PRV-001',
        estado: 'PENDIENTE',
      },
    ];

    const resultado = validarCargaDatos(
      filasValidas,
      skusPrueba as Sku[],
      proveedoresPrueba as Proveedor[]
    );

    expect(resultado.tieneErroresBloqueantes).toBe(false);
    expect(resultado.filasTotales).toBe(2);
    expect(resultado.filasValidas).toBe(2);
    expect(resultado.filasConError).toBe(0);
    expect(resultado.issues.length).toBe(0);
  });
});
