import { DataProvider } from '../services/dataProvider';
import { mockProvider } from '../services/mockProvider';
import {
  Sku,
  Proveedor,
  Zona,
  Campania,
  Usuario,
  Politica,
  UmbralKPI,
  ReordenCalculado,
  ProyeccionInventario,
  Alerta,
  Recomendacion,
  Decision,
  ConsumoMensual,
  ToneladasFruta,
  RegistroKPI,
  Pronostico,
  RevisionMensual,
  AccionRevision,
  CargaDatos,
  IssueCalidad,
  RegistroAuditoria,
  PermisosMapa,
  PoliticaVersion,
  SugerenciaParametro,
} from '../types';

const DEFAULT_API_URL =
  'https://script.google.com/macros/s/AKfycbwBoKjhSJ-7NwN0PFO8HYWIwff52Hw3HktRf-rJZRY8oflRjd0ZvkMAeu-rZpf2SCNCuA/exec';
const DEFAULT_API_TOKEN = 'ecowax_dsi_demo_20260807_mgrandi_k9x2q7n4p1r8s5t3v6w0y';

function getApiUrl(): string {
  return (import.meta.env && import.meta.env.VITE_API_URL) || DEFAULT_API_URL;
}

function getApiToken(): string {
  return (import.meta.env && import.meta.env.VITE_API_TOKEN) || DEFAULT_API_TOKEN;
}

/**
 * Petición HTTP unificada al servicio Google Apps Script
 */
async function requestApi<T>(
  action: string,
  options: {
    method?: 'GET' | 'POST';
    body?: Record<string, any>;
    params?: Record<string, string>;
    useFallbackOnFail?: boolean;
  } = {}
): Promise<T> {
  const method = options.method || 'GET';
  const apiUrl = getApiUrl();
  const apiToken = getApiToken();

  const url = new URL(apiUrl);
  url.searchParams.set('action', action);
  url.searchParams.set('token', apiToken);

  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  try {
    const fetchOptions: RequestInit = {
      method,
      redirect: 'follow',
    };

    if (method === 'POST') {
      fetchOptions.headers = {
        'Content-Type': 'text/plain;charset=utf-8',
      };
      fetchOptions.body = JSON.stringify({
        action,
        token: apiToken,
        ...(options.body || {}),
      });
    }

    const res = await fetch(url.toString(), fetchOptions);

    if (!res.ok) {
      throw new Error(`Servidor HTTP devolvió estatus ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();

    if (!text || text.trim().startsWith('<') || text.includes('<!doctype') || text.includes('<!DOCTYPE')) {
      throw new Error(
        `Error al conectar con la API de Google Sheets (Respuesta HTML no válida o requiere inicio de sesión en Google). Verifique VITE_API_URL y VITE_API_TOKEN.`
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Respuesta de Google Sheets no es un JSON estructurado válido.`);
    }

    if (parsed && typeof parsed === 'object' && parsed.status === 'error') {
      throw new Error(parsed.message || 'Error retornado por la API de Google Sheets.');
    }

    const data = parsed?.data !== undefined ? parsed.data : parsed;
    return data as T;
  } catch (err: any) {
    console.warn(`[SheetsProvider] Falló la acción "${action}":`, err.message);

    if (options.useFallbackOnFail) {
      console.info(`[SheetsProvider] Fallback seguro a datos de respaldo para "${action}".`);
      const mockFn = (mockProvider as any)[action];
      if (typeof mockFn === 'function') {
        const args = options.params ? Object.values(options.params) : [];
        return await mockFn.apply(mockProvider, args);
      }
    }

    throw new Error(
      `No se pudo sincronizar con Google Sheets (${action}): ${err.message}`
    );
  }
}

export const sheetsProvider: DataProvider = {
  getSkus: () => requestApi<Sku[]>('getSkus', { useFallbackOnFail: true }),
  getProveedores: () => requestApi<Proveedor[]>('getProveedores', { useFallbackOnFail: true }),
  getZonas: () => requestApi<Zona[]>('getZonas', { useFallbackOnFail: true }),
  getCampanias: () => requestApi<Campania[]>('getCampanias', { useFallbackOnFail: true }),
  getUsuarios: () => requestApi<Usuario[]>('getUsuarios', { useFallbackOnFail: true }),
  getPolitica: () => requestApi<Politica[]>('getPolitica', { useFallbackOnFail: true }),
  getUmbrales: () => requestApi<UmbralKPI[]>('getUmbrales', { useFallbackOnFail: true }),
  getReorden: () => requestApi<ReordenCalculado[]>('getReorden', { useFallbackOnFail: true }),
  getProyeccionesInventario: (skuId?: string) =>
    requestApi<ProyeccionInventario[]>('getProyeccionesInventario', {
      params: skuId ? { skuId } : undefined,
      useFallbackOnFail: true,
    }),
  getAlertas: () => requestApi<Alerta[]>('getAlertas', { useFallbackOnFail: true }),
  getRecomendaciones: () => requestApi<Recomendacion[]>('getRecomendaciones', { useFallbackOnFail: true }),
  getDecisiones: () => requestApi<Decision[]>('getDecisiones', { useFallbackOnFail: true }),
  getConsumoMensual: (skuId?: string) =>
    requestApi<ConsumoMensual[]>('getConsumoMensual', {
      params: skuId ? { skuId } : undefined,
      useFallbackOnFail: true,
    }),
  getToneladasFruta: () => requestApi<ToneladasFruta[]>('getToneladasFruta', { useFallbackOnFail: true }),
  getKpis: () => requestApi<RegistroKPI[]>('getKpis', { useFallbackOnFail: true }),
  getPronosticos: (skuId?: string) =>
    requestApi<Pronostico[]>('getPronosticos', {
      params: skuId ? { skuId } : undefined,
      useFallbackOnFail: true,
    }),
  getRevisiones: () => requestApi<RevisionMensual[]>('getRevisiones', { useFallbackOnFail: true }),
  getAccionesRevision: () => requestApi<AccionRevision[]>('getAccionesRevision', { useFallbackOnFail: true }),
  getCargas: () => requestApi<CargaDatos[]>('getCargas', { useFallbackOnFail: true }),
  getCalidad: () => requestApi<IssueCalidad[]>('getCalidad', { useFallbackOnFail: true }),
  getAuditoria: () => requestApi<RegistroAuditoria[]>('getAuditoria', { useFallbackOnFail: true }),
  getPermisos: () => requestApi<PermisosMapa>('getPermisos', { useFallbackOnFail: true }),

  // Mutaciones
  submitDecision: (decision: Omit<Decision, 'decision_id'>) =>
    requestApi<Decision>('submitDecision', { method: 'POST', body: decision, useFallbackOnFail: true }),
  updateRecomendacionEstado: (recoId: string, estado: Recomendacion['estado']) =>
    requestApi<void>('updateRecomendacionEstado', { method: 'POST', body: { recoId, estado }, useFallbackOnFail: true }),
  closeRevision: (reviewId: string) =>
    requestApi<{ success: boolean; pendingDecisions?: string[] }>('closeRevision', {
      method: 'POST',
      body: { reviewId },
      useFallbackOnFail: true,
    }),
  addAccionRevision: (accion: Omit<AccionRevision, 'accion_id'>) =>
    requestApi<AccionRevision>('addAccionRevision', { method: 'POST', body: accion, useFallbackOnFail: true }),
  updateAccionRevision: (accionId: string, updates: Partial<AccionRevision>) =>
    requestApi<void>('updateAccionRevision', { method: 'POST', body: { accionId, updates }, useFallbackOnFail: true }),
  saveCarga: (carga: CargaDatos, issues: IssueCalidad[]) =>
    requestApi<CargaDatos>('saveCarga', { method: 'POST', body: { carga, issues }, useFallbackOnFail: true }),
  updateSku: (sku: Sku) =>
    requestApi<Sku>('updateSku', { method: 'POST', body: sku, useFallbackOnFail: true }),
  updateProveedor: (proveedor: Proveedor) =>
    requestApi<Proveedor>('updateProveedor', { method: 'POST', body: proveedor, useFallbackOnFail: true }),
  getPoliticaVersiones: () => requestApi<PoliticaVersion[]>('getPoliticaVersiones', { useFallbackOnFail: true }),
  updatePolitica: (skuId: string, updates: Partial<Politica>, motivo: string, usuarioId: string) =>
    requestApi<PoliticaVersion>('updatePolitica', {
      method: 'POST',
      body: { skuId, updates, motivo, usuarioId },
      useFallbackOnFail: true,
    }),
  proposePolitica: (
    skuId: string,
    campo: string,
    valorAnterior: number,
    valorSugerido: number,
    motivo: string,
    usuarioId: string
  ) =>
    requestApi<SugerenciaParametro>('proposePolitica', {
      method: 'POST',
      body: { skuId, campo, valorAnterior, valorSugerido, motivo, usuarioId },
      useFallbackOnFail: true,
    }),
  getSugerencias: () => requestApi<SugerenciaParametro[]>('getSugerencias', { useFallbackOnFail: true }),
  responderSugerencia: (sugerenciaId: string, aprobada: boolean, usuarioId: string) =>
    requestApi<void>('responderSugerencia', {
      method: 'POST',
      body: { sugerenciaId, aprobada, usuarioId },
      useFallbackOnFail: true,
    }),
  createUsuario: (usuario: Omit<Usuario, 'usuario_id'> & { usuario_id?: string }) =>
    requestApi<Usuario>('createUsuario', { method: 'POST', body: usuario, useFallbackOnFail: true }),
  toggleUsuarioEstado: (usuarioId: string, nuevoEstado: 'ACTIVO' | 'INACTIVO') =>
    requestApi<void>('toggleUsuarioEstado', {
      method: 'POST',
      body: { usuarioId, nuevoEstado },
      useFallbackOnFail: true,
    }),
  updateUsuarioRol: (usuarioId: string, nuevoRol: Usuario['rol']) =>
    requestApi<void>('updateUsuarioRol', {
      method: 'POST',
      body: { usuarioId, nuevoRol },
      useFallbackOnFail: true,
    }),
};
