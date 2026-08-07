import { create } from 'zustand';
import { dataProvider } from '../services/dataProvider';
import { ordenarAlertasPorCriticidad } from '../engine';
import {
  Usuario,
  GlobalFilterState,
  ModuloApp,
  PermisoNivel,
  PermisosMapa,
  Sku,
  Proveedor,
  Zona,
  Campania,
  Alerta,
  Recomendacion,
  Decision,
  ReordenCalculado,
  ProyeccionInventario,
  UmbralKPI,
  RegistroKPI,
} from '../types';

interface AppStoreState {
  // Estado de sesión y usuario
  currentUser: Usuario | null;
  permisosMapa: PermisosMapa | null;
  usuarios: Usuario[];
  
  // Filtros globales
  filters: GlobalFilterState;

  // Datos cacheados / sincronizados
  skus: Sku[];
  proveedores: Proveedor[];
  zonas: Zona[];
  campanias: Campania[];
  alertas: Alerta[];
  recomendaciones: Recomendacion[];
  decisiones: Decision[];
  reorden: ReordenCalculado[];
  proyecciones: ProyeccionInventario[];
  umbrales: UmbralKPI[];
  kpis: RegistroKPI[];

  // Estados de carga
  loading: boolean;
  error: string | null;

  // Acciones
  setCurrentUser: (user: Usuario) => void;
  setFilters: (filters: Partial<GlobalFilterState>) => void;
  clearFilters: () => void;
  loadInitialData: () => Promise<void>;
  submitDecision: (data: Omit<Decision, 'decision_id'>) => Promise<Decision>;
  
  // Helper de verificación de permisos
  getPermiso: (modulo: ModuloApp) => PermisoNivel;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  currentUser: {
    usuario_id: 'USR-001',
    nombre: 'Rosa Quispe',
    rol: 'JEFE_COMPRAS',
    area: 'Compras',
  },
  permisosMapa: null,
  usuarios: [],
  filters: {
    claseAbc: 'TODOS',
  },

  skus: [],
  proveedores: [],
  zonas: [],
  campanias: [],
  alertas: [],
  recomendaciones: [],
  decisiones: [],
  reorden: [],
  proyecciones: [],
  umbrales: [],
  kpis: [],

  loading: false,
  error: null,

  setCurrentUser: (user: Usuario) => {
    set({ currentUser: user });
  },

  setFilters: (newFilters: Partial<GlobalFilterState>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: { claseAbc: 'TODOS' } });
  },

  loadInitialData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        skus,
        proveedores,
        zonas,
        campanias,
        rawAlertas,
        recomendaciones,
        decisiones,
        reorden,
        proyecciones,
        umbrales,
        kpis,
        permisosMapa,
        usuarios,
      ] = await Promise.all([
        dataProvider.getSkus(),
        dataProvider.getProveedores(),
        dataProvider.getZonas(),
        dataProvider.getCampanias(),
        dataProvider.getAlertas(),
        dataProvider.getRecomendaciones(),
        dataProvider.getDecisiones(),
        dataProvider.getReorden(),
        dataProvider.getProyeccionesInventario(),
        dataProvider.getUmbrales(),
        dataProvider.getKpis(),
        dataProvider.getPermisos(),
        dataProvider.getUsuarios(),
      ]);

      const alertas = ordenarAlertasPorCriticidad(rawAlertas);

      set({
        skus,
        proveedores,
        zonas,
        campanias,
        alertas,
        recomendaciones,
        decisiones,
        reorden,
        proyecciones,
        umbrales,
        kpis,
        permisosMapa,
        usuarios,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Error al cargar los datos de abastecimiento.',
        loading: false,
      });
    }
  },

  submitDecision: async (data) => {
    set({ loading: true });
    try {
      const decision = await dataProvider.submitDecision(data);
      // Recargar decisiones y recomendaciones
      const [newDecisiones, newRecomendaciones] = await Promise.all([
        dataProvider.getDecisiones(),
        dataProvider.getRecomendaciones(),
      ]);
      set({
        decisiones: newDecisiones,
        recomendaciones: newRecomendaciones,
        loading: false,
      });
      return decision;
    } catch (err: any) {
      set({
        error: err.message || 'Error al registrar la decisión de compra.',
        loading: false,
      });
      throw err;
    }
  },

  getPermiso: (modulo: ModuloApp): PermisoNivel => {
    const { currentUser, permisosMapa } = get();
    if (!currentUser || !permisosMapa) return 'LECTURA';
    const rolPermisos = permisosMapa[currentUser.rol];
    if (!rolPermisos) return 'NINGUNO';
    return rolPermisos[modulo] || 'NINGUNO';
  },
}));
