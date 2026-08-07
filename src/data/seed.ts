export interface TabularData {
  cols: string[];
  rows: any[][];
}

export function expandir<T = any>(tabla: TabularData): T[] {
  if (!tabla || !tabla.cols || !tabla.rows) return [];
  return tabla.rows.map((row) => {
    const obj: any = {};
    tabla.cols.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}

export const SEED_DATA_RAW = {
  "skus": {
    "cols": ["sku_id", "nombre", "categoria", "unidad", "clase_abc", "criticidad", "proveedor_default", "lote_minimo", "multiplo_compra", "precio_referencia_usd"],
    "rows": [
      ["INS-001", "Cera de carnauba T1 (E-903)", "Cera", "kg", "A", "Alta", "PRV-001", 600, 150, 6.8],
      ["INS-002", "Resina de colofonia / fumarica (E-445)", "Resina", "kg", "A", "Alta", "PRV-002", 400, 100, 4.2],
      ["INS-003", "Tensioactivo no ionico grado alimentario", "Tensioactivo", "kg", "A", "Alta", "PRV-004", 300, 100, 3.6],
      ["INS-004", "Cera polietilenica (E-914)", "Cera", "kg", "B", "Media", "PRV-004", 250, 50, 3.1],
      ["INS-005", "Polidimetilsiloxano / silicona (E-900)", "Aditivo", "kg", "B", "Media", "PRV-007", 50, 25, 9.4],
      ["INS-006", "Hidroxido de potasio grado tecnico", "Alcali", "kg", "B", "Media", "PRV-003", 150, 50, 1.55],
      ["INS-007", "Acido oleico vegetal", "Acido graso", "kg", "C", "Baja", "PRV-003", 100, 50, 2.05],
      ["INS-008", "Conservante alimentario (sorbato)", "Aditivo", "kg", "C", "Baja", "PRV-003", 25, 25, 5.3],
      ["INS-009", "Antiespumante siliconado", "Aditivo", "kg", "C", "Baja", "PRV-007", 25, 25, 7.1],
      ["INS-010", "Cilindro plastico 200 L", "Envase", "und", "C", "Baja", "PRV-005", 30, 30, 42.0]
    ]
  },
  "proveedores": {
    "cols": ["proveedor_id", "nombre", "pais", "incoterm", "moneda", "lead_time_promedio_dias", "lead_time_desv_dias", "estado_homologacion", "otif_historico"],
    "rows": [
      ["PRV-001", "Carnauba do Nordeste Ltda", "Brasil", "FOB Santos", "USD", 47, 9, "Homologado", 0.86],
      ["PRV-002", "Resinas Fumaricas do Sul S.A.", "Brasil", "FOB Santos", "USD", 42, 8, "Homologado", 0.88],
      ["PRV-003", "Quimica Andina S.A.C.", "Peru", "EXW Callao", "PEN", 12, 4, "Homologado", 0.94],
      ["PRV-004", "Global Chemical Trading do Brasil", "Brasil", "CIF Callao", "USD", 38, 11, "Homologado", 0.81],
      ["PRV-005", "Envases Pacifico E.I.R.L.", "Peru", "EXW Lima", "PEN", 8, 3, "Homologado", 0.96],
      ["PRV-006", "Ceras do Ceara Industria Ltda", "Brasil", "FOB Fortaleza", "USD", 52, 12, "En homologacion", null],
      ["PRV-007", "Silicones Andinos S.A.", "Peru", "EXW Callao", "PEN", 15, 5, "Homologado", 0.91]
    ]
  },
  "zonas": {
    "cols": ["zona_id", "nombre", "departamentos", "almacen_referencia", "meta_otif"],
    "rows": [
      ["ZN-NOR", "Norte", "Piura, Lambayeque, La Libertad", "ALM-PIURA", 0.9],
      ["ZN-CEN", "Centro", "Lima, Huaral, Barranca", "ALM-LIMA", 0.92],
      ["ZN-SUR", "Sur", "Ica, Chincha, Arequipa", "ALM-LIMA", 0.92]
    ]
  },
  "campanias": {
    "cols": ["campania_id", "cultivo", "zona_principal", "mes_inicio", "mes_fin", "mes_pico", "ventana"],
    "rows": [
      ["CAM-MAN", "Mango", "ZN-NOR", 11, 3, 1, "Nov-Mar"],
      ["CAM-PAL", "Palta", "ZN-CEN", 3, 8, 5, "Mar-Ago"],
      ["CAM-CIT", "Citricos", "ZN-SUR", 5, 9, 7, "May-Sep"]
    ]
  },
  "usuarios": {
    "cols": ["usuario_id", "nombre", "rol", "area", "email"],
    "rows": [
      ["USR-001", "Rosa Quispe", "JEFE_COMPRAS", "Compras", "rosa.quispe@ecowax.com"],
      ["USR-002", "Luis Berrocal", "ANALISTA_COMPRAS", "Compras", "luis.berrocal@ecowax.com"],
      ["USR-003", "Marta Chavez", "GERENTE_OPERACIONES", "Operaciones", "marta.chavez@ecowax.com"],
      ["USR-004", "Diego Ferrer", "PLANEAMIENTO", "Operaciones", "diego.ferrer@ecowax.com"],
      ["USR-005", "Ana Ruiz", "COMERCIAL", "Comercial", "ana.ruiz@ecowax.com"],
      ["USR-006", "Jorge Palma", "FINANZAS", "Finanzas", "jorge.palma@ecowax.com"],
      ["USR-007", "Carlos Andrade", "GERENTE_GENERAL", "Gerencia", "carlos.andrade@utec.edu.pe"],
      ["USR-008", "Stacy Ramos", "DATA_ANALYST", "Datos", "stacy.ramos@ecowax.com"],
      ["USR-009", "Christian Lopez", "ADMIN", "TI", "christian.lopez@ecowax.com"],
      ["USR-010", "Cindy Salazar", "LECTOR", "Comercial", "cindy.salazar@ecowax.com"]
    ]
  },
  "politica": {
    "cols": ["sku_id", "clase_abc", "nivel_servicio", "z_score", "lead_time_plan_dias", "lead_time_p90_dias", "cobertura_objetivo_dias"],
    "rows": [
      ["INS-001", "A", 0.98, 2.05, 38, 55, 75],
      ["INS-002", "A", 0.98, 2.05, 32, 57, 75],
      ["INS-003", "A", 0.98, 2.05, 32, 52, 75],
      ["INS-004", "B", 0.95, 1.65, 29, 44, 45],
      ["INS-005", "B", 0.95, 1.65, 15, 25, 45],
      ["INS-006", "B", 0.95, 1.65, 14, 19, 45],
      ["INS-007", "C", 0.9, 1.28, 14, 18, 30],
      ["INS-008", "C", 0.9, 1.28, 13, 17, 30],
      ["INS-009", "C", 0.9, 1.28, 18, 26, 30],
      ["INS-010", "C", 0.9, 1.28, 10, 14, 30]
    ]
  },
  "umbrales": {
    "cols": ["kpi", "nombre", "meta", "direccion", "alerta_amarilla", "alerta_roja", "unidad", "dueno"],
    "rows": [
      ["fill_rate_clase_a", "Fill rate de insumos Clase A", 0.95, "MAYOR_MEJOR", 0.9, 0.85, "ratio", "USR-001"],
      ["cobertura_pico_dias", "Cobertura en campania pico", 75, "MAYOR_MEJOR", 60, 45, "dias", "USR-001"],
      ["pct_compras_urgentes", "% de compras urgentes", 0.1, "MENOR_MEJOR", 0.15, 0.2, "ratio", "USR-001"],
      ["mape_pronostico", "MAPE del pronostico", 0.15, "MENOR_MEJOR", 0.2, 0.25, "ratio", "USR-008"],
      ["sesgo_pronostico", "Sesgo del pronostico", 0.0, "BANDA", 0.05, 0.1, "ratio", "USR-008"],
      ["otif_norte", "OTIF zona Norte", 0.9, "MAYOR_MEJOR", 0.87, 0.83, "ratio", "USR-003"],
      ["otif_centro_sur", "OTIF zonas Centro y Sur", 0.92, "MAYOR_MEJOR", 0.89, 0.85, "ratio", "USR-003"],
      ["sku_bajo_rop", "SKU Clase A bajo punto de reorden", 0, "MENOR_MEJOR", 1, 2, "conteo", "USR-001"],
      ["ciclos_revision", "Ciclos de revision mensual documentados", 12, "MAYOR_MEJOR", 10, 8, "conteo/anio", "USR-003"]
    ]
  },
  "reorden": {
    "cols": ["sku_id", "clase_abc", "consumo_prom_diario", "desv_std_consumo_diario", "lead_time_dias", "stock_seguridad", "punto_reorden", "inventario_disponible", "inventario_comprometido", "inventario_transito", "posicion_inventario", "cobertura_actual_dias", "fecha_estimada_quiebre"],
    "rows": [
      ["INS-001", "A", 33.13, 8.49, 38, 107.3, 1366.3, 1380.6, 110.4, 0.0, 1270.2, 37, "2026-09-12"],
      ["INS-002", "A", 20.62, 5.56, 32, 64.5, 724.2, 1220.1, 97.6, 0.0, 1122.5, 59, "2026-10-04"],
      ["INS-003", "A", 13.9, 3.65, 32, 42.3, 487.1, 750.0, 60.0, 403.9, 1093.9, 50, "2026-11-06"],
      ["INS-004", "B", 11.02, 2.91, 29, 25.8, 345.3, 597.8, 47.8, 0.0, 550.0, 52, "2026-09-27"],
      ["INS-005", "B", 2.02, 0.52, 15, 3.3, 33.6, 98.6, 7.9, 32.9, 123.6, 45, "2026-10-11"],
      ["INS-006", "B", 7.0, 1.79, 14, 11.1, 109.0, 413.5, 33.1, 103.4, 483.8, 56, "2026-10-22"],
      ["INS-007", "C", 4.99, 1.27, 14, 6.1, 75.9, 394.7, 31.6, 0.0, 363.1, 88, "2026-11-02"],
      ["INS-008", "C", 0.95, 0.24, 13, 1.1, 13.4, 61.3, 4.9, 26.3, 82.7, 64, "2026-11-17"],
      ["INS-009", "C", 0.7, 0.19, 18, 1.0, 13.7, 47.9, 3.8, 0.0, 44.1, 70, "2026-10-15"],
      ["INS-010", "C", 0.5, 0.12, 10, 0.5, 5.5, 38.1, 3.0, 0.0, 35.1, 81, "2026-10-26"]
    ]
  },
  "proyeccion_inventario": {
    "cols": ["sku_id", "periodo", "demanda_esperada", "inventario_proyectado", "stock_seguridad"],
    "rows": [
      ["INS-001", "2026-08", 1105.7, 164.5, 107.3],
      ["INS-001", "2026-09", 749.8, -585.3, 107.3],
      ["INS-001", "2026-10", 651.8, -1237.1, 107.3],
      ["INS-001", "2026-11", 808.4, -2045.6, 107.3],
      ["INS-001", "2026-12", 1060.9, -3106.4, 107.3],
      ["INS-001", "2027-01", 1446.5, -4552.9, 107.3],
      ["INS-001", "2027-02", 1274.3, -5827.2, 107.3],
      ["INS-001", "2027-03", 1048.9, -6876.1, 107.3],
      ["INS-001", "2027-04", 1085.7, -7961.8, 107.3],
      ["INS-001", "2027-05", 1422.3, -9384.1, 107.3],
      ["INS-001", "2027-06", 1450.6, -10834.8, 107.3],
      ["INS-001", "2027-07", 1439.3, -12274.1, 107.3],
      ["INS-002", "2026-08", 644.2, 478.3, 64.5],
      ["INS-002", "2026-09", 493.0, -14.7, 64.5],
      ["INS-002", "2026-10", 414.2, -428.9, 64.5],
      ["INS-002", "2026-11", 446.7, -875.6, 64.5],
      ["INS-002", "2026-12", 718.7, -1594.3, 64.5],
      ["INS-002", "2027-01", 963.5, -2557.8, 64.5],
      ["INS-002", "2027-02", 723.1, -3280.9, 64.5],
      ["INS-002", "2027-03", 648.3, -3929.1, 64.5],
      ["INS-002", "2027-04", 679.1, -4608.2, 64.5],
      ["INS-002", "2027-05", 917.6, -5525.8, 64.5],
      ["INS-002", "2027-06", 894.9, -6420.7, 64.5],
      ["INS-002", "2027-07", 884.5, -7305.2, 64.5],
      ["INS-003", "2026-08", 465.8, 628.1, 42.3],
      ["INS-003", "2026-09", 330.8, 297.2, 42.3],
      ["INS-003", "2026-10", 270.4, 26.9, 42.3],
      ["INS-003", "2026-11", 325.8, -298.9, 42.3],
      ["INS-003", "2026-12", 452.6, -751.5, 42.3],
      ["INS-003", "2027-01", 638.5, -1390.0, 42.3],
      ["INS-003", "2027-02", 506.1, -1896.2, 42.3],
      ["INS-003", "2027-03", 459.2, -2355.4, 42.3],
      ["INS-003", "2027-04", 434.0, -2789.4, 42.3],
      ["INS-003", "2027-05", 557.6, -3347.0, 42.3],
      ["INS-003", "2027-06", 592.0, -3939.0, 42.3],
      ["INS-003", "2027-07", 648.1, -4587.2, 42.3],
      ["INS-004", "2026-08", 365.1, 184.9, 25.8],
      ["INS-004", "2026-09", 249.3, -64.4, 25.8],
      ["INS-004", "2026-10", 223.7, -288.1, 25.8],
      ["INS-004", "2026-11", 266.9, -555.0, 25.8],
      ["INS-004", "2026-12", 371.8, -926.8, 25.8],
      ["INS-004", "2027-01", 529.9, -1456.7, 25.8],
      ["INS-004", "2027-02", 402.4, -1859.1, 25.8],
      ["INS-004", "2027-03", 327.2, -2186.3, 25.8],
      ["INS-004", "2027-04", 357.8, -2544.1, 25.8],
      ["INS-004", "2027-05", 476.1, -3020.2, 25.8],
      ["INS-004", "2027-06", 467.9, -3488.2, 25.8],
      ["INS-004", "2027-07", 465.8, -3954.0, 25.8]
    ]
  },
  "alertas": [
    {
      "alerta_id": "ALR-2026-001",
      "fecha_creacion": "2026-08-06",
      "sku_id": "INS-001",
      "clase_abc": "A",
      "tipo_alerta": "RIESGO_COBERTURA_CAMPANIA",
      "criticidad": "CRITICA",
      "inventario_actual": 1270.2,
      "punto_reorden": 1366.3,
      "cobertura_actual_dias": 37,
      "cobertura_proyectada_dias": 37,
      "lead_time_dias": 55,
      "fecha_limite_emision": "2026-08-28",
      "cantidad_sugerida": 7050,
      "unidad": "kg",
      "motivo": "Inventario proyectado al pico de campania Mango (2027-01) queda en -4552.9 kg, por debajo del stock de seguridad (107.3 kg). Con lead time P90 de 55 dias la orden debe emitirse antes del inicio de ventana.",
      "responsable": "USR-001",
      "estado": "NUEVA",
      "fecha_resolucion": "",
      "version_regla": "RB-2026.08"
    },
    {
      "alerta_id": "ALR-2026-002",
      "fecha_creacion": "2026-08-06",
      "sku_id": "INS-002",
      "clase_abc": "A",
      "tipo_alerta": "RIESGO_COBERTURA_CAMPANIA",
      "criticidad": "ALTA",
      "inventario_actual": 1122.5,
      "punto_reorden": 724.2,
      "cobertura_actual_dias": 59,
      "cobertura_proyectada_dias": 59,
      "lead_time_dias": 57,
      "fecha_limite_emision": "2026-08-26",
      "cantidad_sugerida": 4000,
      "unidad": "kg",
      "motivo": "Inventario proyectado al pico de campania Mango (2027-01) queda en -2557.8 kg, por debajo del stock de seguridad (64.5 kg). Con lead time P90 de 57 dias la orden debe emitirse antes del inicio de ventana.",
      "responsable": "USR-001",
      "estado": "NUEVA",
      "fecha_resolucion": "",
      "version_regla": "RB-2026.08"
    },
    {
      "alerta_id": "ALR-2026-003",
      "fecha_creacion": "2026-08-06",
      "sku_id": "INS-003",
      "clase_abc": "A",
      "tipo_alerta": "RIESGO_COBERTURA_CAMPANIA",
      "criticidad": "ALTA",
      "inventario_actual": 690.0,
      "punto_reorden": 487.1,
      "cobertura_actual_dias": 50,
      "cobertura_proyectada_dias": 92,
      "lead_time_dias": 52,
      "fecha_limite_emision": "2026-08-31",
      "cantidad_sugerida": 2400,
      "unidad": "kg",
      "motivo": "Inventario proyectado al pico de campania Mango (2027-01) queda en -1390.0 kg, por debajo del stock de seguridad (42.3 kg). Con lead time P90 de 52 dias la orden debe emitirse antes del inicio de ventana.",
      "responsable": "USR-001",
      "estado": "NUEVA",
      "fecha_resolucion": "",
      "version_regla": "RB-2026.08"
    },
    {
      "alerta_id": "ALR-2026-004",
      "fecha_creacion": "2026-08-06",
      "sku_id": "INS-004",
      "clase_abc": "B",
      "tipo_alerta": "RIESGO_COBERTURA_CAMPANIA",
      "criticidad": "ALTA",
      "inventario_actual": 550.0,
      "punto_reorden": 345.3,
      "cobertura_actual_dias": 52,
      "cobertura_proyectada_dias": 52,
      "lead_time_dias": 44,
      "fecha_limite_emision": "2026-09-08",
      "cantidad_sugerida": 2250,
      "unidad": "kg",
      "motivo": "Inventario proyectado al pico de campania Mango (2027-01) queda en -1456.7 kg, por debajo del stock de seguridad (25.8 kg). Con lead time P90 de 44 dias la orden debe emitirse antes del inicio de ventana.",
      "responsable": "USR-001",
      "estado": "NUEVA",
      "fecha_resolucion": "",
      "version_regla": "RB-2026.08"
    }
  ],
  "recomendaciones": [
    {
      "reco_id": "REC-2026-001",
      "alerta_id": "ALR-2026-001",
      "periodo": "2026-08",
      "sku_id": "INS-001",
      "cantidad_recomendada": 7050,
      "unidad": "kg",
      "fecha_limite_emision": "2026-08-28",
      "proveedor_recomendado": "PRV-001",
      "proveedor_alterno": "PRV-006",
      "cobertura_antes_dias": 37,
      "cobertura_despues_dias": 245,
      "supuestos": "Consumo diario 33.13 kg/dia (ult. 12 meses); lead time P90 55 d; nivel de servicio 98%",
      "riesgo_no_comprar": "Quiebre proyectado en 2026-09, dentro de la ventana de campania",
      "riesgo_sobreinventario": "Inmoviliza aprox. USD 47,940 de capital de trabajo",
      "nivel_confianza": "ALTA",
      "regla_version": "RB-2026.08",
      "modelo_version": "DETERMINISTICO-v1",
      "estado": "PENDIENTE"
    },
    {
      "reco_id": "REC-2026-002",
      "alerta_id": "ALR-2026-002",
      "periodo": "2026-08",
      "sku_id": "INS-002",
      "cantidad_recomendada": 4000,
      "unidad": "kg",
      "fecha_limite_emision": "2026-08-26",
      "proveedor_recomendado": "PRV-002",
      "proveedor_alterno": "",
      "cobertura_antes_dias": 59,
      "cobertura_despues_dias": 243,
      "supuestos": "Consumo diario 20.62 kg/dia (ult. 12 meses); lead time P90 57 d; nivel de servicio 98%",
      "riesgo_no_comprar": "Quiebre proyectado en 2026-09, dentro de la ventana de campania",
      "riesgo_sobreinventario": "Inmoviliza aprox. USD 16,800 de capital de trabajo",
      "nivel_confianza": "ALTA",
      "regla_version": "RB-2026.08",
      "modelo_version": "DETERMINISTICO-v1",
      "estado": "PENDIENTE"
    },
    {
      "reco_id": "REC-2026-003",
      "alerta_id": "ALR-2026-003",
      "periodo": "2026-08",
      "sku_id": "INS-003",
      "cantidad_recomendada": 2400,
      "unidad": "kg",
      "fecha_limite_emision": "2026-08-31",
      "proveedor_recomendado": "PRV-004",
      "proveedor_alterno": "",
      "cobertura_antes_dias": 92,
      "cobertura_despues_dias": 243,
      "supuestos": "Consumo diario 13.9 kg/dia (ult. 12 meses); lead time P90 52 d; nivel de servicio 98%",
      "riesgo_no_comprar": "Quiebre proyectado en 2026-11, dentro de la ventana de campania",
      "riesgo_sobreinventario": "Inmoviliza aprox. USD 8,640 de capital de trabajo",
      "nivel_confianza": "ALTA",
      "regla_version": "RB-2026.08",
      "modelo_version": "DETERMINISTICO-v1",
      "estado": "PENDIENTE"
    },
    {
      "reco_id": "REC-2026-004",
      "alerta_id": "ALR-2026-004",
      "periodo": "2026-08",
      "sku_id": "INS-004",
      "cantidad_recomendada": 2250,
      "unidad": "kg",
      "fecha_limite_emision": "2026-09-08",
      "proveedor_recomendado": "PRV-004",
      "proveedor_alterno": "",
      "cobertura_antes_dias": 52,
      "cobertura_despues_dias": 245,
      "supuestos": "Consumo diario 11.02 kg/dia (ult. 12 meses); lead time P90 44 d; nivel de servicio 95%",
      "riesgo_no_comprar": "Quiebre proyectado en 2026-09, dentro de la ventana de campania",
      "riesgo_sobreinventario": "Inmoviliza aprox. USD 6,975 de capital de trabajo",
      "nivel_confianza": "MEDIA",
      "regla_version": "RB-2026.08",
      "modelo_version": "DETERMINISTICO-v1",
      "estado": "PENDIENTE"
    }
  ],
  "decisiones": [
    {"decision_id":"DEC-202605-1","periodo":"2026-05","sku_id":"INS-001","usuario_id":"USR-001","accion":"RECHAZADA","cantidad_recomendada":10500,"cantidad_final":0,"desviacion_pct":-1.0,"comentario":"Ajuste por acuerdo de precio con proveedor","motivo_desviacion":"CAPITAL_TRABAJO","resultado_posterior":"SIN_QUIEBRE"},
    {"decision_id":"DEC-202605-2","periodo":"2026-05","sku_id":"INS-002","usuario_id":"USR-001","accion":"MODIFICADA","cantidad_recomendada":7000,"cantidad_final":4000,"desviacion_pct":-0.429,"comentario":"Se anticipa por riesgo de paro portuario","motivo_desviacion":"CAPITAL_TRABAJO","resultado_posterior":"SIN_QUIEBRE"},
    {"decision_id":"DEC-202605-3","periodo":"2026-05","sku_id":"INS-003","usuario_id":"USR-001","accion":"APROBADA","cantidad_recomendada":4000,"cantidad_final":4000,"desviacion_pct":0.0,"comentario":"Restriccion de caja del mes","motivo_desviacion":"NINGUNA","resultado_posterior":"QUIEBRE_PARCIAL"},
    {"decision_id":"DEC-202606-1","periodo":"2026-06","sku_id":"INS-001","usuario_id":"USR-001","accion":"APROBADA","cantidad_recomendada":8500,"cantidad_final":8500,"desviacion_pct":0.0,"comentario":"Se reduce por sobrestock detectado en planta","motivo_desviacion":"NINGUNA","resultado_posterior":"SIN_QUIEBRE"},
    {"decision_id":"DEC-202606-2","periodo":"2026-06","sku_id":"INS-002","usuario_id":"USR-001","accion":"APROBADA","cantidad_recomendada":7000,"cantidad_final":7000,"desviacion_pct":0.0,"comentario":"Se reduce por sobrestock detectado en planta","motivo_desviacion":"NINGUNA","resultado_posterior":"SIN_QUIEBRE"},
    {"decision_id":"DEC-202606-3","periodo":"2026-06","sku_id":"INS-003","usuario_id":"USR-001","accion":"MODIFICADA","cantidad_recomendada":4500,"cantidad_final":3500,"desviacion_pct":-0.222,"comentario":"Se reduce por sobrestock detectado en planta","motivo_desviacion":"CAPITAL_TRABAJO","resultado_posterior":"COMPRA_URGENTE_POSTERIOR"},
    {"decision_id":"DEC-202607-1","periodo":"2026-07","sku_id":"INS-001","usuario_id":"USR-001","accion":"APROBADA","cantidad_recomendada":10000,"cantidad_final":10000,"desviacion_pct":0.0,"comentario":"Ajuste por acuerdo de precio con proveedor","motivo_desviacion":"NINGUNA","resultado_posterior":"SIN_QUIEBRE"},
    {"decision_id":"DEC-202607-2","periodo":"2026-07","sku_id":"INS-002","usuario_id":"USR-001","accion":"APROBADA","cantidad_recomendada":7000,"cantidad_final":7000,"desviacion_pct":0.0,"comentario":"Se aprueba sin cambios","motivo_desviacion":"NINGUNA","resultado_posterior":"SIN_QUIEBRE"},
    {"decision_id":"DEC-202607-3","periodo":"2026-07","sku_id":"INS-003","usuario_id":"USR-001","accion":"MODIFICADA","cantidad_recomendada":3500,"cantidad_final":2500,"desviacion_pct":-0.286,"comentario":"Ajuste por acuerdo de precio con proveedor","motivo_desviacion":"CAPITAL_TRABAJO","resultado_posterior":"QUIEBRE_PARCIAL"}
  ],
  "consumo_mensual": {
    "cols": ["sku_id", "periodo", "cantidad"],
    "rows": [
      ["INS-001","2024-08",779],["INS-001","2024-09",590],["INS-001","2024-10",497],["INS-001","2024-11",619],["INS-001","2024-12",870],["INS-001","2025-01",1085],["INS-001","2025-02",932],["INS-001","2025-03",814],["INS-001","2025-04",823],["INS-001","2025-05",1104],["INS-001","2025-06",1178],["INS-001","2025-07",1084],["INS-001","2025-08",987],["INS-001","2025-09",670],["INS-001","2025-10",582],["INS-001","2025-11",722],["INS-001","2025-12",947],["INS-001","2026-01",1292],["INS-001","2026-02",1138],["INS-001","2026-03",936],["INS-001","2026-04",969],["INS-001","2026-05",1270],["INS-001","2026-06",1295],["INS-001","2026-07",1285],
      ["INS-002","2024-08",550],["INS-002","2024-09",354],["INS-002","2024-10",302],["INS-002","2024-11",370],["INS-002","2024-12",533],["INS-002","2025-01",732],["INS-002","2025-02",626],["INS-002","2025-03",500],["INS-002","2025-04",514],["INS-002","2025-05",667],["INS-002","2025-06",745],["INS-002","2025-07",708],["INS-002","2025-08",575],["INS-002","2025-09",440],["INS-002","2025-10",370],["INS-002","2025-11",399],["INS-002","2025-12",642],["INS-002","2026-01",860],["INS-002","2026-02",646],["INS-002","2026-03",579],["INS-002","2026-04",606],["INS-002","2026-05",819],["INS-002","2026-06",799],["INS-002","2026-07",790],
      ["INS-003","2024-08",380],["INS-003","2024-09",271],["INS-003","2024-10",230],["INS-003","2024-11",236],["INS-003","2024-12",356],["INS-003","2025-01",498],["INS-003","2025-02",447],["INS-003","2025-03",344],["INS-003","2025-04",338],["INS-003","2025-05",460],["INS-003","2025-06",478],["INS-003","2025-07",502],["INS-003","2025-08",416],["INS-003","2025-09",295],["INS-003","2025-10",241],["INS-003","2025-11",291],["INS-003","2025-12",404],["INS-003","2026-01",570],["INS-003","2026-02",452],["INS-003","2026-03",410],["INS-003","2026-04",388],["INS-003","2026-05",498],["INS-003","2026-06",529],["INS-003","2026-07",579],
      ["INS-004","2024-08",267],["INS-004","2024-09",202],["INS-004","2024-10",164],["INS-004","2024-11",206],["INS-004","2024-12",284],["INS-004","2025-01",378],["INS-004","2025-02",334],["INS-004","2025-03",282],["INS-004","2025-04",280],["INS-004","2025-05",353],["INS-004","2025-06",377],["INS-004","2025-07",388],["INS-004","2025-08",326],["INS-004","2025-09",223],["INS-004","2025-10",200],["INS-004","2025-11",238],["INS-004","2025-12",332],["INS-004","2026-01",473],["INS-004","2026-02",359],["INS-004","2026-03",292],["INS-004","2026-04",320],["INS-004","2026-05",425],["INS-004","2026-06",418],["INS-004","2026-07",416],
      ["INS-005","2024-08",54],["INS-005","2024-09",40],["INS-005","2024-10",30],["INS-005","2024-11",38],["INS-005","2024-12",56],["INS-005","2025-01",69],["INS-005","2025-02",63],["INS-005","2025-03",48],["INS-005","2025-04",50],["INS-005","2025-05",70],["INS-005","2025-06",68],["INS-005","2025-07",67],["INS-005","2025-08",59],["INS-005","2025-09",44],["INS-005","2025-10",37],["INS-005","2025-11",40],["INS-005","2025-12",57],["INS-005","2026-01",81],["INS-005","2026-02",67],["INS-005","2026-03",59],["INS-005","2026-04",58],["INS-005","2026-05",81],["INS-005","2026-06",76],["INS-005","2026-07",78],
      ["INS-006","2024-08",178],["INS-006","2024-09",121],["INS-006","2024-10",108],["INS-006","2024-11",134],["INS-006","2024-12",194],["INS-006","2025-01",259],["INS-006","2025-02",215],["INS-006","2025-03",163],["INS-006","2025-04",173],["INS-006","2025-05",224],["INS-006","2025-06",239],["INS-006","2025-07",255],["INS-006","2025-08",218],["INS-006","2025-09",143],["INS-006","2025-10",126],["INS-006","2025-11",140],["INS-006","2025-12",212],["INS-006","2026-01",262],["INS-006","2026-02",234],["INS-006","2026-03",186],["INS-006","2026-04",217],["INS-006","2026-05",265],["INS-006","2026-06",274],["INS-006","2026-07",276],
      ["INS-007","2024-08",113],["INS-007","2024-09",91],["INS-007","2024-10",76],["INS-007","2024-11",90],["INS-007","2024-12",125],["INS-007","2025-01",170],["INS-007","2025-02",143],["INS-007","2025-03",116],["INS-007","2025-04",125],["INS-007","2025-05",164],["INS-007","2025-06",180],["INS-007","2025-07",158],["INS-007","2025-08",140],["INS-007","2025-09",102],["INS-007","2025-10",89],["INS-007","2025-11",107],["INS-007","2025-12",156],["INS-007","2026-01",196],["INS-007","2026-02",168],["INS-007","2026-03",142],["INS-007","2026-04",146],["INS-007","2026-05",186],["INS-007","2026-06",186],["INS-007","2026-07",202],
      ["INS-008","2024-08",23],["INS-008","2024-09",17],["INS-008","2024-10",15],["INS-008","2024-11",16],["INS-008","2024-12",24],["INS-008","2025-01",34],["INS-008","2025-02",30],["INS-008","2025-03",23],["INS-008","2025-04",25],["INS-008","2025-05",31],["INS-008","2025-06",33],["INS-008","2025-07",33],["INS-008","2025-08",28],["INS-008","2025-09",20],["INS-008","2025-10",17],["INS-008","2025-11",20],["INS-008","2025-12",27],["INS-008","2026-01",37],["INS-008","2026-02",34],["INS-008","2026-03",26],["INS-008","2026-04",28],["INS-008","2026-05",36],["INS-008","2026-06",35],["INS-008","2026-07",38],
      ["INS-009","2024-08",18],["INS-009","2024-09",12],["INS-009","2024-10",11],["INS-009","2024-11",12],["INS-009","2024-12",19],["INS-009","2025-01",25],["INS-009","2025-02",21],["INS-009","2025-03",17],["INS-009","2025-04",19],["INS-009","2025-05",23],["INS-009","2025-06",23],["INS-009","2025-07",25],["INS-009","2025-08",20],["INS-009","2025-09",15],["INS-009","2025-10",12],["INS-009","2025-11",14],["INS-009","2025-12",20],["INS-009","2026-01",29],["INS-009","2026-02",22],["INS-009","2026-03",19],["INS-009","2026-04",20],["INS-009","2026-05",28],["INS-009","2026-06",28],["INS-009","2026-07",27],
      ["INS-010","2024-08",12],["INS-010","2024-09",9],["INS-010","2024-10",8],["INS-010","2024-11",10],["INS-010","2024-12",13],["INS-010","2025-01",18],["INS-010","2025-02",15],["INS-010","2025-03",13],["INS-010","2025-04",14],["INS-010","2025-05",16],["INS-010","2025-06",18],["INS-010","2025-07",18],["INS-010","2025-08",14],["INS-010","2025-09",11],["INS-010","2025-10",9],["INS-010","2025-11",11],["INS-010","2025-12",14],["INS-010","2026-01",19],["INS-010","2026-02",16],["INS-010","2026-03",15],["INS-010","2026-04",15],["INS-010","2026-05",20],["INS-010","2026-06",19],["INS-010","2026-07",19]
    ]
  },
  "toneladas_fruta": {
    "cols": ["periodo", "toneladas"],
    "rows": [
      ["2024-08", 3222],["2024-09", 2347],["2024-10", 2135],["2024-11", 2366],["2024-12", 3262],["2025-01", 4749],["2025-02", 3997],["2025-03", 3136],["2025-04", 3222],["2025-05", 4330],["2025-06", 4364],["2025-07", 4534],["2025-08", 3528],["2025-09", 2778],["2025-10", 2150],["2025-11", 2670],["2025-12", 3674],["2026-01", 5023],["2026-02", 4285],["2026-03", 3456],["2026-04", 3449],["2026-05", 4815],["2026-06", 4526],["2026-07", 4860]
    ]
  },
  "kpi": {
    "cols": ["periodo", "kpi", "dimension", "valor", "meta", "unidad"],
    "rows": [
      ["2025-08","otif","ZN-NOR",1.0,0.9,"ratio"],["2025-08","otif","ZN-CEN",1.0,0.92,"ratio"],["2025-08","otif","ZN-SUR",0.714,0.92,"ratio"],["2025-08","fill_rate","INSUMOS_CLASE_A",1.0,0.95,"ratio"],["2025-08","pct_compras_urgentes","TOTAL",0.25,0.1,"ratio"],["2025-08","cobertura_dias_clase_a","PROMEDIO",41.3,75,"dias"],
      ["2025-09","otif","ZN-NOR",0.667,0.9,"ratio"],["2025-09","otif","ZN-CEN",1.0,0.92,"ratio"],["2025-09","otif","ZN-SUR",0.846,0.92,"ratio"],["2025-09","fill_rate","INSUMOS_CLASE_A",1.0,0.95,"ratio"],["2025-09","pct_compras_urgentes","TOTAL",0.333,0.1,"ratio"],["2025-09","cobertura_dias_clase_a","PROMEDIO",27.6,75,"dias"],
      ["2025-10","otif","ZN-NOR",0.833,0.9,"ratio"],["2025-10","otif","ZN-CEN",1.0,0.92,"ratio"],["2025-10","otif","ZN-SUR",1.0,0.92,"ratio"],["2025-10","fill_rate","INSUMOS_CLASE_A",1.0,0.95,"ratio"],["2025-10","pct_compras_urgentes","TOTAL",0.5,0.1,"ratio"],["2025-10","cobertura_dias_clase_a","PROMEDIO",167.4,75,"dias"],
      ["2025-11","otif","ZN-NOR",1.0,0.9,"ratio"],["2025-11","otif","ZN-CEN",1.0,0.92,"ratio"],["2025-11","otif","ZN-SUR",0.667,0.92,"ratio"],["2025-11","fill_rate","INSUMOS_CLASE_A",0.875,0.95,"ratio"],["2025-11","pct_compras_urgentes","TOTAL",0.0,0.1,"ratio"],["2025-11","cobertura_dias_clase_a","PROMEDIO",192.9,75,"dias"],
      ["2025-12","otif","ZN-NOR",0.917,0.9,"ratio"],["2025-12","otif","ZN-CEN",1.0,0.92,"ratio"],["2025-12","otif","ZN-SUR",0.667,0.92,"ratio"],["2025-12","fill_rate","INSUMOS_CLASE_A",0.984,0.95,"ratio"],["2025-12","pct_compras_urgentes","TOTAL",0.333,0.1,"ratio"],["2025-12","cobertura_dias_clase_a","PROMEDIO",98.3,75,"dias"],
      ["2026-01","otif","ZN-NOR",0.87,0.9,"ratio"],["2026-01","otif","ZN-CEN",1.0,0.92,"ratio"],["2026-01","otif","ZN-SUR",1.0,0.92,"ratio"],["2026-01","fill_rate","INSUMOS_CLASE_A",0.951,0.95,"ratio"],["2026-01","pct_compras_urgentes","TOTAL",0.0,0.1,"ratio"],["2026-01","cobertura_dias_clase_a","PROMEDIO",81.5,75,"dias"],
      ["2026-02","otif","ZN-NOR",0.882,0.9,"ratio"],["2026-02","otif","ZN-CEN",1.0,0.92,"ratio"],["2026-02","otif","ZN-SUR",1.0,0.92,"ratio"],["2026-02","fill_rate","INSUMOS_CLASE_A",0.812,0.95,"ratio"],["2026-02","pct_compras_urgentes","TOTAL",0.333,0.1,"ratio"],["2026-02","cobertura_dias_clase_a","PROMEDIO",73.0,75,"dias"],
      ["2026-03","otif","ZN-NOR",0.7,0.9,"ratio"],["2026-03","otif","ZN-CEN",0.8,0.92,"ratio"],["2026-03","otif","ZN-SUR",1.0,0.92,"ratio"],["2026-03","fill_rate","INSUMOS_CLASE_A",0.976,0.95,"ratio"],["2026-03","pct_compras_urgentes","TOTAL",0.0,0.1,"ratio"],["2026-03","cobertura_dias_clase_a","PROMEDIO",79.7,75,"dias"],
      ["2026-04","otif","ZN-NOR",1.0,0.9,"ratio"],["2026-04","otif","ZN-CEN",1.0,0.92,"ratio"],["2026-04","otif","ZN-SUR",0.727,0.92,"ratio"],["2026-04","fill_rate","INSUMOS_CLASE_A",0.987,0.95,"ratio"],["2026-04","pct_compras_urgentes","TOTAL",0.0,0.1,"ratio"],["2026-04","cobertura_dias_clase_a","PROMEDIO",75.9,75,"dias"],
      ["2026-05","otif","ZN-NOR",1.0,0.9,"ratio"],["2026-05","otif","ZN-CEN",0.889,0.92,"ratio"],["2026-05","otif","ZN-SUR",0.944,0.92,"ratio"],["2026-05","fill_rate","INSUMOS_CLASE_A",0.867,0.95,"ratio"],["2026-05","pct_compras_urgentes","TOTAL",0.25,0.1,"ratio"],["2026-05","cobertura_dias_clase_a","PROMEDIO",43.7,75,"dias"],
      ["2026-06","otif","ZN-NOR",1.0,0.9,"ratio"],["2026-06","otif","ZN-CEN",0.923,0.92,"ratio"],["2026-06","otif","ZN-SUR",0.882,0.92,"ratio"],["2026-06","fill_rate","INSUMOS_CLASE_A",0.897,0.95,"ratio"],["2026-06","pct_compras_urgentes","TOTAL",0.143,0.1,"ratio"],["2026-06","cobertura_dias_clase_a","PROMEDIO",36.6,75,"dias"],
      ["2026-07","otif","ZN-NOR",1.0,0.9,"ratio"],["2026-07","otif","ZN-CEN",0.917,0.92,"ratio"],["2026-07","otif","ZN-SUR",0.818,0.92,"ratio"],["2026-07","fill_rate","INSUMOS_CLASE_A",0.856,0.95,"ratio"],["2026-07","pct_compras_urgentes","TOTAL",0.444,0.1,"ratio"],["2026-07","cobertura_dias_clase_a","PROMEDIO",39.2,75,"dias"]
    ]
  },
  "pronostico": {
    "cols": ["sku_id", "periodo", "valor_esperado", "limite_inferior", "limite_superior", "mape_backtest", "sesgo_backtest"],
    "rows": [
      ["INS-001","2026-08",1105.7,906.7,1304.7,0.186,-0.017],["INS-001","2026-09",749.8,614.8,884.8,0.164,0.034],["INS-001","2026-10",651.8,534.5,769.1,0.218,-0.044],["INS-001","2026-11",808.4,662.9,953.9,0.176,-0.058],["INS-001","2026-12",1060.9,869.9,1251.9,0.179,-0.028],["INS-001","2027-01",1446.5,1186.1,1706.9,0.21,-0.07],
      ["INS-002","2026-08",644.2,528.2,760.2,0.204,-0.037],["INS-002","2026-09",493.0,404.3,581.7,0.229,-0.011],["INS-002","2026-10",414.2,339.6,488.8,0.239,-0.047],["INS-002","2026-11",446.7,366.3,527.1,0.191,-0.055],["INS-002","2026-12",718.7,589.3,848.1,0.214,0.004],["INS-002","2027-01",963.5,790.1,1136.9,0.224,0.012],
      ["INS-003","2026-08",465.8,382.0,549.6,0.196,0.038],["INS-003","2026-09",330.8,271.3,390.3,0.189,-0.073],["INS-003","2026-10",270.4,221.7,319.1,0.211,-0.026],["INS-003","2026-11",325.8,267.2,384.4,0.191,-0.023],["INS-003","2026-12",452.6,371.1,534.1,0.205,-0.034],["INS-003","2027-01",638.5,523.6,753.4,0.205,-0.064],
      ["INS-004","2026-08",365.1,299.4,430.8,0.176,-0.041],["INS-004","2026-09",249.3,204.4,294.2,0.181,-0.071],["INS-004","2026-10",223.7,183.4,264.0,0.172,-0.003],["INS-004","2026-11",266.9,218.9,314.9,0.185,-0.017],["INS-004","2026-12",371.8,304.9,438.7,0.224,0.007],["INS-004","2027-01",529.9,434.5,625.3,0.226,0.04]
    ]
  },
  "revision": {
    "cols": ["review_id", "periodo", "fecha", "presidida_por", "kpis_fuera_meta", "decisiones_tomadas", "decisiones_pendientes", "estado"],
    "rows": [
      ["REV-2026-03","2026-03","2026-03-05","USR-003","compras_urgentes",3,1,"CERRADA"],
      ["REV-2026-04","2026-04","2026-04-05","USR-003","cobertura_pico",3,0,"CERRADA"],
      ["REV-2026-05","2026-05","2026-05-05","USR-003","compras_urgentes",3,1,"CERRADA"],
      ["REV-2026-06","2026-06","2026-06-05","USR-003","fill_rate;compras_urgentes",3,1,"CERRADA"],
      ["REV-2026-07","2026-07","2026-07-05","USR-003","compras_urgentes",3,0,"CERRADA"],
      ["REV-2026-08","2026-08","2026-08-05","USR-003","ninguno",3,1,"ABIERTA"]
    ]
  },
  "acciones_revision": [
    {"accion_id":"ACC-001","review_id":"REV-2026-06","descripcion":"Cerrar homologacion tecnica de PRV-006 para carnauba","responsable":"USR-003","fecha_objetivo":"2026-09-30","estado":"EN_CURSO"},
    {"accion_id":"ACC-002","review_id":"REV-2026-06","descripcion":"Cargar 24 meses de OC historicas al modulo de datos","responsable":"USR-002","fecha_objetivo":"2026-08-31","estado":"EN_CURSO"},
    {"accion_id":"ACC-003","review_id":"REV-2026-07","descripcion":"Definir nivel de servicio diferenciado por clase ABC y aprobarlo en comite","responsable":"USR-001","fecha_objetivo":"2026-08-20","estado":"PENDIENTE"},
    {"accion_id":"ACC-004","review_id":"REV-2026-07","descripcion":"Validar con Finanzas el techo de capital de trabajo para stock de seguridad","responsable":"USR-006","fecha_objetivo":"2026-09-15","estado":"PENDIENTE"},
    {"accion_id":"ACC-005","review_id":"REV-2026-05","descripcion":"Corregir registro de fecha de recepcion en 14 OC del ERP","responsable":"USR-002","fecha_objetivo":"2026-06-30","estado":"CERRADA"}
  ],
  "cargas": [
    {"upload_id":"UPL-0001","fecha":"2026-07-02 08:31","usuario_id":"USR-002","tabla_destino":"fact_consumo","archivo":"consumo_2026_06.csv","filas_totales":48,"filas_ok":46,"filas_rechazadas":2,"estado":"PARCIAL","detalle":"2 filas con SKU inexistente"},
    {"upload_id":"UPL-0002","fecha":"2026-07-02 08:44","usuario_id":"USR-002","tabla_destino":"fact_ordenes_compra","archivo":"oc_2026_06.xlsx","filas_totales":9,"filas_ok":9,"filas_rechazadas":0,"estado":"OK","detalle":""},
    {"upload_id":"UPL-0003","fecha":"2026-08-01 17:10","usuario_id":"USR-008","tabla_destino":"fact_inventario","archivo":"inv_2026_07.csv","filas_totales":13,"filas_ok":12,"filas_rechazadas":1,"estado":"PARCIAL","detalle":"1 fila con unidad incompatible (L vs kg)"}
  ],
  "calidad": [
    {"issue_id":"DQ-001","upload_id":"UPL-0001","fila":17,"campo":"sku_id","valor":"INS-011","regla":"SKU debe existir en dim_sku","severidad":"BLOQUEANTE","accion":"Fila rechazada","estado":"ABIERTO"},
    {"issue_id":"DQ-002","upload_id":"UPL-0001","fila":33,"campo":"sku_id","valor":"INS-0O3","regla":"SKU debe existir en dim_sku","severidad":"BLOQUEANTE","accion":"Fila rechazada","estado":"ABIERTO"},
    {"issue_id":"DQ-003","upload_id":"UPL-0003","fila":6,"campo":"unidad","valor":"L","regla":"Unidad debe coincidir con dim_sku","severidad":"BLOQUEANTE","accion":"Fila rechazada","estado":"RESUELTO"},
    {"issue_id":"DQ-004","upload_id":"UPL-0002","fila":4,"campo":"cantidad","valor":"31200","regla":"Consumo dentro de 3 sigma del historico","severidad":"ADVERTENCIA","accion":"Marcado atipico, requiere confirmacion","estado":"ABIERTO"}
  ],
  "auditoria": [
    {"log_id":"AUD-00001","timestamp":"2026-08-01 09:12:03","usuario_id":"USR-009","entidad":"param_politica_inventario","entidad_id":"POL-INS-001","campo":"nivel_servicio","valor_anterior":"0.95","valor_nuevo":"0.98","motivo":"Acuerdo comite revision mensual 2026-07","version_regla":"RB-2026.08"},
    {"log_id":"AUD-00002","timestamp":"2026-08-03 16:40:55","usuario_id":"USR-002","entidad":"fact_ordenes_compra","entidad_id":"OC-0141","campo":"fecha_recepcion_real","valor_anterior":"","valor_nuevo":"2026-08-02","motivo":"Recepcion registrada tarde en almacen","version_regla":"RB-2026.08"},
    {"log_id":"AUD-00003","timestamp":"2026-08-05 11:05:20","usuario_id":"USR-001","entidad":"app_decisiones","entidad_id":"DEC-202607-1","campo":"cantidad_final","valor_anterior":"9500","valor_nuevo":"7000","motivo":"Restriccion de caja aprobada por Finanzas","version_regla":"RB-2026.08"}
  ],
  "permisos": {
    "ADMIN":{"inicio":"ESCRITURA","dashboard":"ESCRITURA","inventario":"ESCRITURA","pronostico":"ESCRITURA","alertas":"ESCRITURA","recomendaciones":"ESCRITURA","decisiones":"ESCRITURA","revision_mensual":"ESCRITURA","carga_datos":"ESCRITURA","maestros":"ESCRITURA","parametros":"ESCRITURA","auditoria":"ESCRITURA","usuarios":"ESCRITURA"},
    "JEFE_COMPRAS":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"ESCRITURA","recomendaciones":"ESCRITURA","decisiones":"ESCRITURA","revision_mensual":"ESCRITURA","carga_datos":"ESCRITURA","maestros":"LECTURA","parametros":"PROPUESTA","auditoria":"LECTURA","usuarios":"NINGUNO"},
    "ANALISTA_COMPRAS":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"ESCRITURA","recomendaciones":"LECTURA","decisiones":"NINGUNO","revision_mensual":"LECTURA","carga_datos":"ESCRITURA","maestros":"LECTURA","parametros":"NINGUNO","auditoria":"NINGUNO","usuarios":"NINGUNO"},
    "GERENTE_OPERACIONES":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"LECTURA","recomendaciones":"ESCRITURA","decisiones":"ESCRITURA","revision_mensual":"ESCRITURA","carga_datos":"NINGUNO","maestros":"LECTURA","parametros":"ESCRITURA","auditoria":"LECTURA","usuarios":"NINGUNO"},
    "PLANEAMIENTO":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"LECTURA","recomendaciones":"LECTURA","decisiones":"NINGUNO","revision_mensual":"LECTURA","carga_datos":"ESCRITURA","maestros":"LECTURA","parametros":"PROPUESTA","auditoria":"NINGUNO","usuarios":"NINGUNO"},
    "COMERCIAL":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"NINGUNO","pronostico":"LECTURA","alertas":"NINGUNO","recomendaciones":"NINGUNO","decisiones":"NINGUNO","revision_mensual":"LECTURA","carga_datos":"ESCRITURA","maestros":"NINGUNO","parametros":"NINGUNO","auditoria":"NINGUNO","usuarios":"NINGUNO"},
    "FINANZAS":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"LECTURA","recomendaciones":"LECTURA","decisiones":"LECTURA","revision_mensual":"ESCRITURA","carga_datos":"NINGUNO","maestros":"NINGUNO","parametros":"NINGUNO","auditoria":"LECTURA","usuarios":"NINGUNO"},
    "GERENTE_GENERAL":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"LECTURA","recomendaciones":"LECTURA","decisiones":"LECTURA","revision_mensual":"LECTURA","carga_datos":"NINGUNO","maestros":"LECTURA","parametros":"NINGUNO","auditoria":"LECTURA","usuarios":"NINGUNO"},
    "DATA_ANALYST":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"ESCRITURA","alertas":"LECTURA","recomendaciones":"LECTURA","decisiones":"NINGUNO","revision_mensual":"LECTURA","carga_datos":"ESCRITURA","maestros":"ESCRITURA","parametros":"PROPUESTA","auditoria":"LECTURA","usuarios":"NINGUNO"},
    "LECTOR":{"inicio":"LECTURA","dashboard":"LECTURA","inventario":"LECTURA","pronostico":"LECTURA","alertas":"NINGUNO","recomendaciones":"NINGUNO","decisiones":"NINGUNO","revision_mensual":"NINGUNO","carga_datos":"NINGUNO","maestros":"NINGUNO","parametros":"NINGUNO","auditoria":"NINGUNO","usuarios":"NINGUNO"}
  }
};
