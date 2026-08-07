# ECOPROA E.I.R.L. - Sistema de Recomendación de Abastecimiento (SRA)

Sistema web de nivel empresarial para la planificación, cálculo de reorden, gestión de alertas y auditoría inmutable de insumos químicos para productos agroindustriales (ceras, aditivos y recubrimientos).

---

## 🛠️ Conmutación de Proveedores de Datos (`VITE_DATA_SOURCE`)

El sistema implementa el **Patrón Repositorio / DataProvider** (`src/services/dataProvider.ts`). Esto permite cambiar de forma transparente entre datos en memoria simulados (**MockProvider**) y una base de datos conectada a **Google Sheets** u otros servicios en la nube.

### Configuración en `.env` o `.env.local`

Para definir la fuente de datos de la aplicación, configure la variable de entorno `VITE_DATA_SOURCE`:

#### Opción 1: Modo Mock / Prototipo (Por Defecto)
```env
VITE_DATA_SOURCE=mock
```
En este modo, el sistema utiliza `MockDataProvider`, que precarga semillas reales con SKUs, proveedores, consumo histórico, alertas y matriz de permisos.

#### Opción 2: Modo Conectado a Google Sheets
```env
VITE_DATA_SOURCE=sheets
VITE_GOOGLE_SHEETS_ID=1abc..._tu_spreadsheet_id_aqui
VITE_GOOGLE_API_KEY=AIzaSy..._tu_google_api_key
```

En este modo, la aplicación consume directamente las pestañas/tablas creadas en la hoja de cálculo corporativa Google Sheets (`skus`, `proveedores`, `politica_inventario`, `consumo_mensual`, `auditoria`, etc.).

---

## 🚀 Comandos Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo Vite en el puerto `3000`.
- **`npm run build`**: Compila la aplicación en producción dentro de la carpeta `dist/`.
- **`npm run test`**: Ejecuta la suite de pruebas unitarias con **Vitest** comprobando el motor de inventarios, KPIs y casos borde.
- **`npm run lint`**: Ejecuta la verificación estricta de tipos de TypeScript (`tsc --noEmit`).

---

## 🔐 Módulos y Gobierno SOX

1. **Auditoría (`/auditoria`)**: Bitácora inalterable de solo lectura para todos los roles. Registra timestamp, usuario, entidad, valor anterior, valor nuevo, motivo y versión de regla.
2. **Administración de Usuarios (`/usuarios`)**: Módulo restringido para el rol `ADMIN`. Permite altas, bajas lógicas (nunca borrado físico) y reasignación de roles.
3. **Ayuda Metodológica (`/ayuda`)**: Manual operativo con fórmulas matemáticas explicadas en lenguaje de negocio, caso numérico de Carnauba T1 (`INS-001`) y guía de interpretación de pronósticos (MAPE vs. Sesgo).

---

## 📂 Estructura del Código

- `src/engine/`: Funciones puras determinísticas para el cálculo de ROP, Stock de Seguridad, Fill Rate, MAPE, Sesgo y clasificación ABC.
- `src/engine/__tests__/`: Pruebas de integración y casos borde con Vitest.
- `src/services/`: Capa de abstracción de datos (`dataProvider.ts`, `mockProvider.ts`).
- `src/store/`: Estado global de la aplicación usando Zustand (`useAppStore.ts`).
- `src/pages/`: Pantallas con estados de carga, vacío y error.
