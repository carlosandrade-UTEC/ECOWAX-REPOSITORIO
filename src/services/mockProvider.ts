import { DataProvider } from './dataProvider';
import { SEED_DATA_RAW, expandir } from '../data/seed';
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

function delay(ms: number = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    this.skus = expandir<Sku>(SEED_DATA_RAW.skus);
    this.proveedores = expandir<Proveedor>(SEED_DATA_RAW.proveedores);
    this.zonas = expandir<Zona>(SEED_DATA_RAW.zonas);
    this.campanias = expandir<Campania>(SEED_DATA_RAW.campanias);
    this.usuarios = expandir<Usuario>(SEED_DATA_RAW.usuarios);
    this.politica = expandir<Politica>(SEED_DATA_RAW.politica);
    
    // Inicializar versiones de política de inventario
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
    const newId = `DEC-${data.periodo.replace('-', '')}-${this.decisiones.length + 1}`;
    const newDecision: Decision = {
      ...data,
      decision_id: newId,
    };
    this.decisiones.unshift(newDecision);

    // Update recommendation state if matches sku and period
    const reco = this.recomendaciones.find(
      (r) => r.sku_id === data.sku_id && r.periodo === data.periodo
    );
    if (reco) {
      reco.estado = data.accion;
    }

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
    }
  }

  async closeRevision(reviewId: string): Promise<{ success: boolean; pendingDecisions?: string[] }> {
    await delay();
    const review = this.revisiones.find((r) => r.review_id === reviewId);
    const periodo = review ? review.periodo : '2026-08';

    // Verificar si hay recomendaciones pendientes en ese periodo
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
    }
    return { success: true };
  }

  async addAccionRevision(accionData: Omit<AccionRevision, 'accion_id'>): Promise<AccionRevision> {
    await delay();
    const newAccion: AccionRevision = {
      ...accionData,
      accion_id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
    };
    this.accionesRevision.unshift(newAccion);
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
    }
  }

  async saveCarga(carga: CargaDatos, issues: IssueCalidad[]): Promise<CargaDatos> {
    await delay();
    this.cargas.unshift(carga);
    if (issues && issues.length > 0) {
      this.calidad.unshift(...issues);
    }
    return carga;
  }

  async updateSku(updatedSku: Sku): Promise<Sku> {
    await delay();
    const index = this.skus.findIndex((s) => s.sku_id === updatedSku.sku_id);
    if (index !== -1) {
      const oldSku = this.skus[index];
      this.skus[index] = { ...updatedSku };

      // Registrar auditoria si cambia clase_abc
      if (oldSku.clase_abc !== updatedSku.clase_abc) {
        this.auditoria.unshift({
          log_id: `AUD-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          usuario_id: 'USR-001',
          entidad: 'dim_sku',
          entidad_id: updatedSku.sku_id,
          campo: 'clase_abc',
          valor_anterior: oldSku.clase_abc,
          valor_nuevo: updatedSku.clase_abc,
          motivo: 'Reclasificación ABC en Maestro SKU',
          version_regla: 'RB-2026.08',
        });
      }
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
    const today = new Date().toISOString().split('T')[0];

    // Marcar versiones anteriores como HISTORICA
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

    // Actualizar objeto en politica
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

    // Registro de auditoria obligado
    this.auditoria.unshift({
      log_id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      usuario_id: usuarioId,
      entidad: 'param_politica_inventario',
      entidad_id: `POL-${skuId}`,
      campo: Object.keys(updates).join(', '),
      valor_anterior: JSON.stringify(currentPol),
      valor_nuevo: JSON.stringify(updates),
      motivo: motivo,
      version_regla: 'RB-2026.08',
    });

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
      sugerencia_id: `SUG-${Date.now().toString().slice(-5)}`,
      sku_id: skuId,
      campo,
      valor_anterior: valorAnterior,
      valor_sugerido: valorSugerido,
      motivo,
      solicitante_id: usuarioId,
      fecha_solicitud: new Date().toISOString().split('T')[0],
      estado: 'PENDIENTE_APROBACION',
    };
    this.sugerencias.unshift(sug);
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

    // Registrar auditoría
    this.auditoria.unshift({
      log_id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      usuario_id: 'USR-009', // ADMIN
      entidad: 'app_usuarios',
      entidad_id: newId,
      campo: 'alta_usuario',
      valor_anterior: '',
      valor_nuevo: `${newUsuario.nombre} (${newUsuario.rol})`,
      motivo: 'Alta de usuario administrador/operativo',
      version_regla: 'RB-2026.08',
    });

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
        log_id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        usuario_id: 'USR-009',
        entidad: 'app_usuarios',
        entidad_id: usuarioId,
        campo: 'estado',
        valor_anterior: prev,
        valor_nuevo: nuevoEstado,
        motivo: `Cambio de estado del usuario a ${nuevoEstado} (baja lógica)`,
        version_regla: 'RB-2026.08',
      });
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
        log_id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        usuario_id: 'USR-009',
        entidad: 'app_usuarios',
        entidad_id: usuarioId,
        campo: 'rol',
        valor_anterior: prev,
        valor_nuevo: nuevoRol,
        motivo: 'Reasignación de rol de usuario',
        version_regla: 'RB-2026.08',
      });
    }
  }
}

export const mockProvider = new MockDataProvider();
