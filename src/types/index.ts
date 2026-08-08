export type ClaseABC = 'A' | 'B' | 'C';
export type Criticidad = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
export type PermisoNivel = 'NINGUNO' | 'LECTURA' | 'PROPUESTA' | 'ESCRITURA';

export type RolUsuario = 
  | 'ADMIN'
  | 'JEFE_COMPRAS'
  | 'ANALISTA_COMPRAS'
  | 'GERENTE_OPERACIONES'
  | 'PLANEAMIENTO'
  | 'COMERCIAL'
  | 'FINANZAS'
  | 'GERENTE_GENERAL'
  | 'DATA_ANALYST'
  | 'LECTOR';

export interface Sku {
  sku_id: string;
  nombre: string;
  categoria: string;
  unidad: string;
  clase_abc: ClaseABC;
  criticidad: Criticidad;
  proveedor_default: string;
  lote_minimo: number;
  multiplo_compra: number;
  precio_referencia_usd: number;
}

export interface Proveedor {
  proveedor_id: string;
  nombre: string;
  pais: string;
  incoterm: string;
  moneda: string;
  lead_time_promedio_dias: number;
  lead_time_desv_dias: number;
  estado_homologacion: 'Homologado' | 'En homologacion';
  otif_historico: number | null;
}

export interface Zona {
  zona_id: string;
  nombre: string;
  departamentos: string;
  almacen_referencia: string;
  meta_otif: number;
}

export interface Campania {
  campania_id: string;
  cultivo: string;
  zona_principal: string;
  mes_inicio: number; // 1-12
  mes_fin: number;    // 1-12
  mes_pico: number;   // 1-12
  ventana: string;
}

export interface Usuario {
  usuario_id: string;
  nombre: string;
  rol: RolUsuario;
  area: string;
  email?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface Politica {
  sku_id: string;
  clase_abc: ClaseABC;
  nivel_servicio: number;
  nivel_servicio_objetivo?: number;
  z_score: number;
  lead_time_plan_dias: number;
  lead_time_p90_dias: number;
  cobertura_objetivo_dias: number;
}

export interface PoliticaVersion extends Politica {
  version_id: string;
  version_num: number;
  estado_version: 'VIGENTE' | 'HISTORICA';
  vigente_desde: string;
  vigente_hasta?: string;
  motivo_cambio?: string;
  creado_por: string;
}

export interface SugerenciaParametro {
  sugerencia_id: string;
  sku_id: string;
  campo: string;
  valor_anterior: number;
  valor_sugerido: number;
  motivo: string;
  solicitante_id: string;
  fecha_solicitud: string;
  estado: 'PENDIENTE_APROBACION' | 'APROBADA' | 'RECHAZADA';
}

export interface UmbralKPI {
  kpi: string;
  nombre: string;
  meta: number;
  direccion: 'MAYOR_MEJOR' | 'MENOR_MEJOR' | 'BANDA';
  alerta_amarilla: number;
  alerta_roja: number;
  unidad: string;
  dueno: string;
}

export interface ReordenCalculado {
  sku_id: string;
  clase_abc: ClaseABC;
  consumo_prom_diario: number;
  desv_std_consumo_diario: number;
  lead_time_dias: number;
  stock_seguridad: number;
  punto_reorden: number;
  inventario_disponible: number;
  inventario_comprometido: number;
  inventario_transito: number;
  posicion_inventario: number;
  cobertura_actual_dias: number;
  fecha_estimada_quiebre: string;
  version_regla?: string;
}

export interface ProyeccionInventario {
  sku_id: string;
  periodo: string; // YYYY-MM
  demanda_esperada: number;
  inventario_proyectado: number;
  stock_seguridad: number;
}

export interface Alerta {
  alerta_id: string;
  fecha_creacion: string;
  sku_id: string;
  clase_abc: ClaseABC;
  tipo_alerta: string;
  criticidad: Criticidad;
  inventario_actual: number;
  punto_reorden: number;
  cobertura_actual_dias: number;
  cobertura_proyectada_dias: number;
  lead_time_dias: number;
  fecha_limite_emision: string;
  cantidad_sugerida: number;
  unidad: string;
  motivo: string;
  responsable: string;
  estado: 'NUEVA' | 'EN_PROCESO' | 'RESUELTA' | 'IGNORADA';
  fecha_resolucion: string;
  version_regla: string;
}

export interface Recomendacion {
  reco_id: string;
  alerta_id: string;
  periodo: string;
  sku_id: string;
  cantidad_recomendada: number;
  unidad: string;
  fecha_limite_emision: string;
  proveedor_recomendado: string;
  proveedor_alterno: string;
  cobertura_antes_dias: number;
  cobertura_despues_dias: number;
  supuestos: string;
  riesgo_no_comprar: string;
  riesgo_sobreinventario: string;
  nivel_confianza: 'ALTA' | 'MEDIA' | 'BAJA';
  regla_version: string;
  modelo_version: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'MODIFICADA' | 'RECHAZADA';
}

export interface Decision {
  decision_id: string;
  periodo: string;
  sku_id: string;
  usuario_id: string;
  accion: 'APROBADA' | 'MODIFICADA' | 'RECHAZADA';
  cantidad_recomendada: number;
  cantidad_final: number;
  desviacion_pct: number;
  comentario: string;
  motivo_desviacion: string;
  resultado_posterior: string;
}

export interface ConsumoMensual {
  sku_id: string;
  periodo: string;
  cantidad: number;
  zona_id?: string;
}

export interface ToneladasFruta {
  periodo: string;
  toneladas: number;
}

export interface RegistroKPI {
  periodo: string;
  kpi: string;
  dimension: string;
  valor: number;
  meta: number;
  unidad: string;
}

export interface Pronostico {
  sku_id: string;
  periodo: string;
  valor_esperado: number;
  limite_inferior: number;
  limite_superior: number;
  mape_backtest: number;
  sesgo_backtest: number;
}

export interface RevisionMensual {
  review_id: string;
  periodo: string;
  fecha: string;
  presidida_por: string;
  kpis_fuera_meta: string;
  decisiones_tomadas: number;
  decisiones_pendientes: number;
  estado: 'ABIERTA' | 'CERRADA';
}

export interface AccionRevision {
  accion_id: string;
  review_id: string;
  descripcion: string;
  responsable: string;
  fecha_objetivo: string;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'CERRADA';
}

export interface CargaDatos {
  upload_id: string;
  fecha: string;
  usuario_id: string;
  tabla_destino: string;
  archivo: string;
  filas_totales: number;
  filas_ok: number;
  filas_rechazadas: number;
  estado: 'OK' | 'PARCIAL' | 'ERROR';
  detalle: string;
}

export interface IssueCalidad {
  issue_id: string;
  upload_id: string;
  fila: number;
  campo: string;
  valor: string;
  regla: string;
  severidad: 'BLOQUEANTE' | 'ADVERTENCIA';
  accion: string;
  estado: 'ABIERTO' | 'RESUELTO';
}

export interface RegistroAuditoria {
  log_id: string;
  timestamp: string;
  usuario_id: string;
  entidad: string;
  entidad_id: string;
  campo: string;
  valor_anterior: string;
  valor_nuevo: string;
  motivo: string;
  version_regla: string;
}

export type ModuloApp = 
  | 'inicio'
  | 'dashboard'
  | 'inventario'
  | 'pronostico'
  | 'alertas'
  | 'recomendaciones'
  | 'decisiones'
  | 'revision_mensual'
  | 'carga_datos'
  | 'maestros'
  | 'parametros'
  | 'auditoria'
  | 'usuarios';

export type PermisosMapa = Record<RolUsuario, Record<ModuloApp, PermisoNivel>>;

export interface GlobalFilterState {
  zonaId?: string;
  campaniaId?: string;
  claseAbc?: ClaseABC | 'TODOS';
  proveedorId?: string;
}
