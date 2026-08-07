import { describe, it, expect } from 'vitest';
import { sheetsProvider } from '../../data/sheetsProvider';

describe('Pruebas de sheetsProvider (src/data/sheetsProvider.ts) - Tarea 2', () => {
  it('Debe tener todos los métodos de la interfaz DataProvider implementados', () => {
    const metodosObligatorios = [
      'getSkus',
      'getProveedores',
      'getZonas',
      'getCampanias',
      'getUsuarios',
      'getPolitica',
      'getUmbrales',
      'getReorden',
      'getProyeccionesInventario',
      'getAlertas',
      'getRecomendaciones',
      'getDecisiones',
      'getConsumoMensual',
      'getToneladasFruta',
      'getKpis',
      'getPronosticos',
      'getRevisiones',
      'getAccionesRevision',
      'getCargas',
      'getCalidad',
      'getAuditoria',
      'getPermisos',
      'submitDecision',
      'updateRecomendacionEstado',
      'closeRevision',
      'addAccionRevision',
      'updateAccionRevision',
      'saveCarga',
      'updateSku',
      'updateProveedor',
      'getPoliticaVersiones',
      'updatePolitica',
      'proposePolitica',
      'getSugerencias',
      'responderSugerencia',
      'createUsuario',
      'toggleUsuarioEstado',
      'updateUsuarioRol',
    ];

    metodosObligatorios.forEach((metodo) => {
      expect((sheetsProvider as any)[metodo]).toBeDefined();
      expect(typeof (sheetsProvider as any)[metodo]).toBe('function');
    });
  });

  it('Debe responder de forma segura y consistente sin crash de la app', async () => {
    // Al ejecutar los métodos, sheetsProvider resuelve promesas usando fallback resiliente si el endpoint no responde JSON
    const skus = await sheetsProvider.getSkus();
    expect(Array.isArray(skus)).toBe(true);
    expect(skus.length).toBeGreaterThan(0);
  });
});
