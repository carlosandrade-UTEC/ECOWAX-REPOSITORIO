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
import { mockProvider } from './mockProvider';

export interface DataProvider {
  getSkus(): Promise<Sku[]>;
  getProveedores(): Promise<Proveedor[]>;
  getZonas(): Promise<Zona[]>;
  getCampanias(): Promise<Campania[]>;
  getUsuarios(): Promise<Usuario[]>;
  getPolitica(): Promise<Politica[]>;
  getUmbrales(): Promise<UmbralKPI[]>;
  getReorden(): Promise<ReordenCalculado[]>;
  getProyeccionesInventario(skuId?: string): Promise<ProyeccionInventario[]>;
  getAlertas(): Promise<Alerta[]>;
  getRecomendaciones(): Promise<Recomendacion[]>;
  getDecisiones(): Promise<Decision[]>;
  getConsumoMensual(skuId?: string): Promise<ConsumoMensual[]>;
  getToneladasFruta(): Promise<ToneladasFruta[]>;
  getKpis(): Promise<RegistroKPI[]>;
  getPronosticos(skuId?: string): Promise<Pronostico[]>;
  getRevisiones(): Promise<RevisionMensual[]>;
  getAccionesRevision(): Promise<AccionRevision[]>;
  getCargas(): Promise<CargaDatos[]>;
  getCalidad(): Promise<IssueCalidad[]>;
  getAuditoria(): Promise<RegistroAuditoria[]>;
  getPermisos(): Promise<PermisosMapa>;

  // Mutaciones en memoria
  submitDecision(decision: Omit<Decision, 'decision_id'>): Promise<Decision>;
  updateRecomendacionEstado(recoId: string, estado: Recomendacion['estado']): Promise<void>;
  closeRevision(reviewId: string): Promise<{ success: boolean; pendingDecisions?: string[] }>;
  addAccionRevision(accion: Omit<AccionRevision, 'accion_id'>): Promise<AccionRevision>;
  updateAccionRevision(accionId: string, updates: Partial<AccionRevision>): Promise<void>;
  saveCarga(carga: CargaDatos, issues: IssueCalidad[]): Promise<CargaDatos>;
  updateSku(sku: Sku): Promise<Sku>;
  updateProveedor(proveedor: Proveedor): Promise<Proveedor>;
  getPoliticaVersiones(): Promise<PoliticaVersion[]>;
  updatePolitica(
    skuId: string,
    updates: Partial<Politica>,
    motivo: string,
    usuarioId: string
  ): Promise<PoliticaVersion>;
  proposePolitica(
    skuId: string,
    campo: string,
    valorAnterior: number,
    valorSugerido: number,
    motivo: string,
    usuarioId: string
  ): Promise<SugerenciaParametro>;
  getSugerencias(): Promise<SugerenciaParametro[]>;
  responderSugerencia(
    sugerenciaId: string,
    aprobada: boolean,
    usuarioId: string
  ): Promise<void>;
  createUsuario(usuario: Omit<Usuario, 'usuario_id'> & { usuario_id?: string }): Promise<Usuario>;
  toggleUsuarioEstado(usuarioId: string, nuevoEstado: 'ACTIVO' | 'INACTIVO'): Promise<void>;
  updateUsuarioRol(usuarioId: string, nuevoRol: Usuario['rol']): Promise<void>;
}

/**
 * Instancia del proveedor de datos por defecto conforme a la interfaz DataProvider.
 * Permite cambiar la implementación (Mock vs Sheets) de forma transparente.
 */
export const dataProvider: DataProvider = mockProvider;
