import { DataProvider } from './dataProvider';
import { SEED_DATA_RAW, expandir } from '../data/seed';
import { RULES_VERSION } from '../engine/version';
import { generarUUID } from '../engine/id';
import { evaluarPuntoReorden } from '../engine/inventario';
import { getSystemDate } from '../engine/clock';
import {
  Sku,
  Proveedor,
  Zona,
  Campania,
  Usuario,
  Politica,
  PoliticaVersion,
  SugerenciaParametro,
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
} from '../types';

function delay(ms: number = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STORAGE_KEY = 'ECOWAX_MOCK_STATE_V1';

class MockDataProvider implements DataProvider {
  private skus: Sku[];
  private proveedores: Proveedor[];
  private zonas: Zona[];
  private campanias: Campania[];
  private usuarios: Usuario[];
  private politica: Politica[];
  private politicaVersiones: PoliticaVersion[];
  private sugerencias: SugerenciaParametro[];
  private umbrales: UmbralKPI[];
  private reorden: ReordenCalculado[];
  private proyecciones: ProyeccionInventario[];
  private alertas: Alerta[];
  private recomendaciones: Recomendacion[];
  private decisiones: Decision[];
  private consumoMensual: ConsumoMensual[];
  private toneladasFruta: ToneladasFruta[];
  private kpis: RegistroKPI[];
  private pronosticos: Pronostico[];
  private revisiones: RevisionMensual[];
  private accionesRevision: AccionRevision[];
  private cargas: CargaDatos[];
  private calidad: IssueCalidad[];
  private auditoria: RegistroAuditoria[];
  private permisos: PermisosMapa;

  constructor() {
    // Intentar recuperar estado previo guardado en localStorage para persistencia tras F5
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.skus = parsed.skus;
        this.proveedores = parsed.proveedores;
        this.zonas = parsed.zonas;
        this.campanias = parsed.campanias;
        this.usuarios = parsed.usuarios;
        this.politica = parsed.politica;
        this.politicaVersiones = parsed.politicaVersiones;
        this.sugerencias = parsed.sugerencias;
        this.umbrales = parsed.umbrales;
        this.reorden = parsed.reorden;
        this.proyecciones = parsed.proyecciones;
        this.alertas = parsed.alertas;
        this.recomendaciones = parsed.recomendaciones;
        this.decisiones = parsed.decisiones;
        this.consumoMensual = parsed.consumoMensual;
        this.toneladasFruta = parsed.toneladasFruta;
        this.kpis = parsed.kpis;
        this.pronosticos = parsed.pronosticos;
        this.revisiones = parsed.revisiones;
        this.accionesRevision = parsed.accionesRevision;
        this.cargas = parsed.cargas;
        this.calidad = parsed.calidad;
        this.auditoria = parsed.auditoria;
        this.permisos = parsed.permisos;
        return;
      } catch (e) {
        console.warn('Falló la recuperación del storage local; inicializando con semillas de fábrica.');
      }
    }

    // Inicialización por defecto desde semillas
    this.skus = expandir<Sku>(SEED_DATA_RAW.skus);
    this.proveedores = expandir<Proveedor>(SEED_DATA_RAW.proveedores);
    this.zonas = expandir<Zona>(SEED_DATA_RAW.zonas);
    this.campanias = expandir<Campania>(SEED_DATA_RAW.campanias);
    this.usuarios = expandir<Usuario>(SEED_DATA_RAW.usuarios);
    this.politica = expandir<Politica>(SEED_DATA_RAW.politica);

    this.politicaVersiones = this.politica.map((p) => ({
      ...p,
      version_id: `VER-${p.sku_id}-v1`,
      version_num: 1,
      estado_version: 'VIGENTE' as const,
      vigente_desde: '2026-01-01',
      creado_por: 'USR-001',
      motivo_cambio: 'Configuración inicial de parámetros de abastecimiento',
    }));

    this.sugerencias = [
      {
        sugerencia_id: 'SUG-00101',
        sku_id: 'INS-004',
        campo: 'cobertura_objetivo_dias',
        valor_anterior: 45,
        valor_sugerido: 60,
        motivo: 'Incremento de volatilidad en entregas de proveedor Brasil',
        solicitante_id: 'USR-002',
        fecha_solicitud: '2026-08-04',
        estado: 'PENDIENTE_APROBACION',
      },
    ];

    this.umbrales = expandir<UmbralKPI>(SEED_DATA_RAW.umbrales);
    this.reorden = expandir<ReordenCalculado>(SEED_DATA_RAW.reorden);
    this.proyecciones = expandir<ProyeccionInventario>(SEED_DATA_RAW.proyeccion_inventario);
    this.alertas = SEED_DATA_RAW.alertas as Alerta[];
    this.recomendaciones = [...(SEED_DATA_RAW.recomendaciones as Recomendacion[])];
    this.decisiones = [...SEED_DATA_RAW.decisiones] as Decision[];
    this.consumoMensual = expandir<ConsumoMensual>(SEED_DATA_RAW.consumo_mensual);
    this.toneladasFruta = expandir<ToneladasFruta>(SEED_DATA_RAW.toneladas_fruta);
    this.kpis = expandir<RegistroKPI>(SEED_DATA_RAW.kpi);
    this.pronosticos = expandir<Pronostico>(SEED_DATA_RAW.pronostico);
    this.revisiones = expandir<RevisionMensual>(SEED_DATA_RAW.revision);
    this.accionesRevision = [...(SEED_DATA_RAW.acciones_revision as AccionRevision[])];
    this.cargas = [...(SEED_DATA_RAW.cargas as CargaDatos[])];
    this.calidad = [...(SEED_DATA_RAW.calidad as IssueCalidad[])];
    this.auditoria = [...(SEED_DATA_RAW.auditoria as RegistroAuditoria[])];
    this.permisos = SEED_DATA_RAW.permisos as unknown as PermisosMapa;

    this.persistLocal();
  }

  private persistLocal(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const payload = {
          skus: this.skus,
          proveedores: this.proveedores,
          zonas: this.zonas,
          campanias: this.campanias,
          usuarios: this.usuarios,
          politica: this.politica,
          politicaVersiones: this.politicaVersiones,
          sugerencias: this.sugerencias,
          umbrales: this.umbrales,
          reorden: this.reorden,
          proyecciones: this.proyecciones,
          alertas: this.alertas,
          recomendaciones: this.recomendaciones,
          decisiones: this.decisiones,
          consumoMensual: this.consumoMensual,
          toneladasFruta: this.toneladasFruta,
          kpis: this.kpis,
          pronosticos: this.pronosticos,
          revisiones: this.revisiones,
          accionesRevision: this.accionesRevision,
          cargas: this.cargas,
          calidad: this.calidad,
          auditoria: this.auditoria,
          permisos: this.permisos,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('No se pudo guardar en localStorage:', e);
      }
    }
  }

  async getSkus(): Promise<Sku[]> {
    await delay();
    return [...this.skus];
  }

  async getProveedores(): Promise<Proveedor[]> {
    await delay();
    return [...this.proveedores];
  }

  async getZonas(): Promise<Zona[]> {
    await delay();
    return [...this.zonas];
  }

  async getCampanias(): Promise<Campania[]> {
    await delay();
    return [...this.campanias];
  }

  async getUsuarios(): Promise<Usuario[]> {
    await delay();
    return [...this.usuarios];
  }

  async getPolitica(): Promise<Politica[]> {
    await delay();
    return [...this.politica];
  }

  async getUmbrales(): Promise<UmbralKPI[]> {
    await delay();
    return [...this.umbrales];
  }

  async getReorden(): Promise<ReordenCalculado[]> {
    await delay();
    return [...this.reorden];
  }

  async getProyeccionesInventario(skuId?: string): Promise<ProyeccionInventario[]> {
    await delay();
    if (!skuId) return [...this.proyecciones];
    return this.proyecciones.filter((p) => p.sku_id === skuId);
  }

  async getAlertas(): Promise<Alerta[]> {
    await delay();
    return [...this.alertas];
  }

  async getRecomendaciones(): Promise<Recomendacion[]> {
    await delay();
    return [...this.recomendaciones];
  }

  async getDecisiones(): Promise<Decision[]> {
    await delay();
    return [...this.decisiones];
  }

  async getConsumoMensual(skuId?: string): Promise<ConsumoMensual[]> {
    await delay();
    if (!skuId) return [...this.consumoMensual];
    return this.consumoMensual.filter((c) => c.sku_id === skuId);
  }

  async getToneladasFruta(): Promise<ToneladasFruta[]> {
    await delay();
    return [...this.toneladasFruta];
  }

  async getKpis(): Promise<RegistroKPI[]> {
    await delay();
    return [...this.kpis];
  }

  async getPronosticos(skuId?: string): Promise<Pronostico[]> {
    await delay();
    if (!skuId) return [...this.pronosticos];
    return this.pronosticos.filter((p) => p.sku_id === skuId);
  }

  async getRevisiones(): Promise<RevisionMensual[]> {
    await delay();
    return [...this.revisiones];
  }

  async getAccionesRevision(): Promise<AccionRevision[]> {
    await delay();
    return [...this.accionesRevision];
  }

  async getCargas(): Promise<CargaDatos[]> {
    await delay();
    return [...this.cargas];
  }

  async getCalidad(): Promise<IssueCalidad[]> {
    await delay();
    return [...this.calidad];
  }

  async getAuditoria(): Promise<RegistroAuditoria[]> {
    await delay();
    return [...this.auditoria];
  }

  async getPermisos(): Promise<PermisosMapa> {
    await delay();
    return { ...this.permisos };
  }

  async submitDecision(data: Omit<Decision, 'decision_id'>): Promise<Decision> {
    await delay();
    const newId = `DEC-${data.periodo.replace('-', '')}-${generarUUID().substring(0, 6)}`;
    const newDecision: Decision = {
      ...data,
      decision_id: newId,
    };
    this.decisiones.unshift(newDecision);

    const reco = this.recomendaciones.find(
      (r) => r.sku_id === data.sku_id && r.periodo === data.periodo
    );
    if (reco) {
      reco.estado = data.accion;
    }

    this.persistLocal();
    return newDecision;
  }

  async updateRecomendacionEstado(
    recoId: string,
    estado: Recomendacion['estado']
  ): Promise<void> {
    await delay();
    const reco = this.recomendaciones.find((r) => r.reco_id === recoId);
    if (reco) {
      reco.estado = estado;
      this.persistLocal();
    }
  }

  async closeRevision(reviewId: string): Promise<{ success: boolean; pendingDecisions?: string[] }> {
    await delay();
    const review = this.revisiones.find((r) => r.review_id === reviewId);
    const periodo = review ? review.periodo : '2026-08';

    const pendingRecos = this.recomendaciones.filter(
      (r) => r.periodo === periodo && r.estado === 'PENDIENTE'
    );

    if (pendingRecos.length > 0) {
      const pendingList = pendingRecos.map(
        (r) => `SKU ${r.sku_id}: Recomendación de ${r.cantidad_recomendada} ${r.unidad} (${r.reco_id})`
      );
      return {
        success: false,
        pendingDecisions: pendingList,
      };
    }

    if (review) {
      review.estado = 'CERRADA';
      review.decisiones_pendientes = 0;
      this.persistLocal();
    }
    return { success: true };
  }

  async addAccionRevision(accionData: Omit<AccionRevision, 'accion_id'>): Promise<AccionRevision> {
    await delay();
    const newAccion: AccionRevision = {
      ...accionData,
      accion_id: `ACC-${generarUUID().substring(0, 6)}`,
    };
    this.accionesRevision.unshift(newAccion);
    this.persistLocal();
    return newAccion;
  }

  async updateAccionRevision(
    accionId: string,
    updates: Partial<AccionRevision>
  ): Promise<void> {
    await delay();
    const acc = this.accionesRevision.find((a) => a.accion_id === accionId);
    if (acc) {
      Object.assign(acc, updates);
      this.persistLocal();
    }
  }

  /**
   * Procesa y confirma la carga de datos persistiendo efectivamente las filas válidas
   * en el almacenamiento del sistema y recalculando ROP e inventarios.
   */
  async saveCarga(
    carga: CargaDatos,
    issues: IssueCalidad[],
    filasValidasRows?: any[]
  ): Promise<CargaDatos> {
    await delay();
    this.cargas.unshift(carga);
    if (issues && issues.length > 0) {
      this.calidad.unshift(...issues);
    }

    // Efectiva alimentación del sistema con filas válidas
    if (Array.isArray(filasValidasRows) && filasValidasRows.length > 0) {
      filasValidasRows.forEach((row) => {
        const skuId = String(row.sku_id ?? row.SKU ?? '').trim();
        const cant = Number(row.cantidad ?? row.CANTIDAD ?? row.inventario_disponible);
        const periodo = String(row.periodo ?? row.PERIODO ?? '2026-08').trim();
        const zonaId = String(row.zona_id ?? row.ZONA_ID ?? 'ZONA-1').trim();

        if (skuId && !isNaN(cant) && cant > 0) {
          // 1. Insertar / Actualizar en consumoMensual
          const idxCons = this.consumoMensual.findIndex(
            (c) => c.sku_id === skuId && c.periodo === periodo && c.zona_id === zonaId
          );
          if (idxCons !== -1) {
            this.consumoMensual[idxCons].cantidad = cant;
          } else {
            this.consumoMensual.push({
              sku_id: skuId,
              periodo: periodo,
              zona_id: zonaId,
              cantidad: cant,
            });
          }

          // 2. Recalcular ROP y Cobertura para el SKU impactado
          const reordenItem = this.reorden.find((r) => r.sku_id === skuId);
          if (reordenItem) {
            const skuMaster = this.skus.find((s) => s.sku_id === skuId);
            const pol = this.politica.find((p) => p.sku_id === skuId);
            const nivelServ = pol ? pol.nivel_servicio : 0.98;
            const lt = pol ? pol.lead_time_plan_dias : 30;

            const rec = evaluarPuntoReorden(
              cant, // disponible
              reordenItem.inventario_comprometido,
              reordenItem.inventario_transito,
              cant / 30, // consumo prom
              reordenItem.desv_std_consumo_diario,
              lt,
              nivelServ,
              [cant, cant * 0.9, cant * 1.1],
              skuId,
              skuMaster ? skuMaster.clase_abc : 'A'
            );

            Object.assign(reordenItem, rec);
          }
        }
      });
    }

    // Auditoría inmutable de carga
    this.auditoria.unshift({
      log_id: `AUD-${generarUUID().substring(0, 8)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      usuario_id: carga.usuario_id || 'USR-002',
      entidad: 'fact_cargas',
      entidad_id: carga.upload_id,
      campo: 'estado',
      valor_anterior: '',
      valor_nuevo: carga.estado,
      motivo: `Carga de datos confirmada (${carga.archivo}) en ${carga.tabla_destino} con ${carga.filas_ok} filas efectivamente procesadas (Idempotencia: ${carga.upload_id})`,
      version_regla: RULES_VERSION,
    });

    this.persistLocal();
    return carga;
  }

  async updateSku(updatedSku: Sku): Promise<Sku> {
    await delay();
    const index = this.skus.findIndex((s) => s.sku_id === updatedSku.sku_id);
    if (index !== -1) {
      const oldSku = this.skus[index];
      this.skus[index] = { ...updatedSku };

      // Si cambia la Clase ABC, recalcular ROP, SS y nivel de servicio de forma automática
      if (oldSku.clase_abc !== updatedSku.clase_abc) {
        const reordenItem = this.reorden.find((r) => r.sku_id === updatedSku.sku_id);
        if (reordenItem) {
          reordenItem.clase_abc = updatedSku.clase_abc;
          const nivelServ = updatedSku.clase_abc === 'A' ? 0.98 : updatedSku.clase_abc === 'B' ? 0.95 : 0.90;

          const rec = evaluarPuntoReorden(
            reordenItem.inventario_disponible,
            reordenItem.inventario_comprometido,
            reordenItem.inventario_transito,
            reordenItem.consumo_prom_diario,
            reordenItem.desv_std_consumo_diario,
            reordenItem.lead_time_dias,
            nivelServ,
            [reordenItem.consumo_prom_diario * 30, reordenItem.consumo_prom_diario * 30],
            updatedSku.sku_id,
            updatedSku.clase_abc
          );

          Object.assign(reordenItem, rec);
        }

        this.auditoria.unshift({
          log_id: `AUD-${generarUUID().substring(0, 8)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          usuario_id: 'USR-001',
          entidad: 'dim_sku',
          entidad_id: updatedSku.sku_id,
          campo: 'clase_abc',
          valor_anterior: oldSku.clase_abc,
          valor_nuevo: updatedSku.clase_abc,
          motivo: `Reclasificación ABC en Maestro SKU con recálculo automático de SS (${reordenItem?.stock_seguridad}) y ROP (${reordenItem?.punto_reorden})`,
          version_regla: RULES_VERSION,
        });
      }
      this.persistLocal();
    }
    return updatedSku;
  }

  async updateProveedor(updatedProv: Proveedor): Promise<Proveedor> {
    await delay();
    const index = this.proveedores.findIndex(
      (p) => p.proveedor_id === updatedProv.proveedor_id
    );
    if (index !== -1) {
      this.proveedores[index] = { ...updatedProv };
      this.persistLocal();
    }
    return updatedProv;
  }

  async getPoliticaVersiones(): Promise<PoliticaVersion[]> {
    await delay();
    return [...this.politicaVersiones];
  }

  async updatePolitica(
    skuId: string,
    updates: Partial<Politica>,
    motivo: string,
    usuarioId: string
  ): Promise<PoliticaVersion> {
    await delay();
    const today = getSystemDate();

    this.politicaVersiones.forEach((pv) => {
      if (pv.sku_id === skuId && pv.estado_version === 'VIGENTE') {
        pv.estado_version = 'HISTORICA';
        pv.vigente_hasta = today;
      }
    });

    const existingSkuVersions = this.politicaVersiones.filter(
      (pv) => pv.sku_id === skuId
    );
    const nextVersionNum = existingSkuVersions.length + 1;

    const currentPol = this.politica.find((p) => p.sku_id === skuId) || {
      sku_id: skuId,
      clase_abc: 'A' as const,
      nivel_servicio: 0.98,
      z_score: 2.05,
      lead_time_plan_dias: 30,
      lead_time_p90_dias: 45,
      cobertura_objetivo_dias: 60,
    };

    const newPolData: Politica = {
      ...currentPol,
      ...updates,
    };

    const polIndex = this.politica.findIndex((p) => p.sku_id === skuId);
    if (polIndex !== -1) {
      this.politica[polIndex] = newPolData;
    } else {
      this.politica.push(newPolData);
    }

    const newVersion: PoliticaVersion = {
      ...newPolData,
      version_id: `VER-${skuId}-v${nextVersionNum}`,
      version_num: nextVersionNum,
      estado_version: 'VIGENTE',
      vigente_desde: today,
      motivo_cambio: motivo,
      creado_por: usuarioId,
    };

    this.politicaVersiones.unshift(newVersion);

    this.auditoria.unshift({
      log_id: `AUD-${generarUUID().substring(0, 8)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      usuario_id: usuarioId,
      entidad: 'param_politica_inventario',
      entidad_id: `POL-${skuId}`,
      campo: Object.keys(updates).join(', '),
      valor_anterior: JSON.stringify(currentPol),
      valor_nuevo: JSON.stringify(updates),
      motivo: motivo,
      version_regla: RULES_VERSION,
    });

    this.persistLocal();
    return newVersion;
  }

  async proposePolitica(
    skuId: string,
    campo: string,
    valorAnterior: number,
    valorSugerido: number,
    motivo: string,
    usuarioId: string
  ): Promise<SugerenciaParametro> {
    await delay();
    const sug: SugerenciaParametro = {
      sugerencia_id: `SUG-${generarUUID().substring(0, 6)}`,
      sku_id: skuId,
      campo,
      valor_anterior: valorAnterior,
      valor_sugerido: valorSugerido,
      motivo,
      solicitante_id: usuarioId,
      fecha_solicitud: getSystemDate(),
      estado: 'PENDIENTE_APROBACION',
    };
    this.sugerencias.unshift(sug);
    this.persistLocal();
    return sug;
  }

  async getSugerencias(): Promise<SugerenciaParametro[]> {
    await delay();
    return [...this.sugerencias];
  }

  async responderSugerencia(
    sugerenciaId: string,
    aprobada: boolean,
    usuarioId: string
  ): Promise<void> {
    await delay();
    const sug = this.sugerencias.find((s) => s.sugerencia_id === sugerenciaId);
    if (!sug) return;

    if (aprobada) {
      sug.estado = 'APROBADA';
      await this.updatePolitica(
        sug.sku_id,
        { [sug.campo]: sug.valor_sugerido },
        `Aprobación de sugerencia ${sug.sugerencia_id}: ${sug.motivo}`,
        usuarioId
      );
    } else {
      sug.estado = 'RECHAZADA';
      this.persistLocal();
    }
  }

  async createUsuario(
    usuarioData: Omit<Usuario, 'usuario_id'> & { usuario_id?: string }
  ): Promise<Usuario> {
    await delay();
    const newId =
      usuarioData.usuario_id ||
      `USR-${String(this.usuarios.length + 1).padStart(3, '0')}`;
    const newUsuario: Usuario = {
      usuario_id: newId,
      nombre: usuarioData.nombre,
      rol: usuarioData.rol,
      area: usuarioData.area,
      estado: usuarioData.estado || 'ACTIVO',
    };
    this.usuarios.push(newUsuario);

    this.auditoria.unshift({
      log_id: `AUD-${generarUUID().substring(0, 8)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      usuario_id: 'USR-009',
      entidad: 'app_usuarios',
      entidad_id: newId,
      campo: 'alta_usuario',
      valor_anterior: '',
      valor_nuevo: `${newUsuario.nombre} (${newUsuario.rol})`,
      motivo: 'Alta de usuario administrador/operativo',
      version_regla: RULES_VERSION,
    });

    this.persistLocal();
    return newUsuario;
  }

  async toggleUsuarioEstado(
    usuarioId: string,
    nuevoEstado: 'ACTIVO' | 'INACTIVO'
  ): Promise<void> {
    await delay();
    const usr = this.usuarios.find((u) => u.usuario_id === usuarioId);
    if (usr) {
      const prev = usr.estado || 'ACTIVO';
      usr.estado = nuevoEstado;

      this.auditoria.unshift({
        log_id: `AUD-${generarUUID().substring(0, 8)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        usuario_id: 'USR-009',
        entidad: 'app_usuarios',
        entidad_id: usuarioId,
        campo: 'estado',
        valor_anterior: prev,
        valor_nuevo: nuevoEstado,
        motivo: `Cambio de estado del usuario a ${nuevoEstado} (baja lógica)`,
        version_regla: RULES_VERSION,
      });

      this.persistLocal();
    }
  }

  async updateUsuarioRol(
    usuarioId: string,
    nuevoRol: Usuario['rol']
  ): Promise<void> {
    await delay();
    const usr = this.usuarios.find((u) => u.usuario_id === usuarioId);
    if (usr) {
      const prev = usr.rol;
      usr.rol = nuevoRol;

      this.auditoria.unshift({
        log_id: `AUD-${generarUUID().substring(0, 8)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        usuario_id: 'USR-009',
        entidad: 'app_usuarios',
        entidad_id: usuarioId,
        campo: 'rol',
        valor_anterior: prev,
        valor_nuevo: nuevoRol,
        motivo: 'Reasignación de rol de usuario',
        version_regla: RULES_VERSION,
      });

      this.persistLocal();
    }
  }
}

export const mockProvider = new MockDataProvider();
