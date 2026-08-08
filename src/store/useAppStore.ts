import { create } from 'zustand';
import { dataProvider } from '../services/dataProvider';
import { ordenarAlertasPorCriticidad } from '../engine';
import { SEED_DATA_RAW } from '../data/seed';
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

  // Estados de carga y navegación UI
  loading: boolean;
  error: string | null;
  mobileMenuOpen: boolean;

  // Acciones
  setCurrentUser: (user: Usuario | null) => void;
  logout: () => void;
  setFilters: (filters: Partial<GlobalFilterState>) => void;
  clearFilters: () => void;
  loadInitialData: () => Promise<void>;
  submitDecision: (data: Omit<Decision, 'decision_id'>) => Promise<Decision>;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  // Helper de verificación de permisos
  getPermiso: (modulo: ModuloApp) => PermisoNivel;
  puedeLeer: (modulo: ModuloApp) => boolean;
  puedeProponer: (modulo: ModuloApp) => boolean;
  puedeEditar: (modulo: ModuloApp) => boolean;
  puedeAprobar: (modulo: ModuloApp) => boolean;
  puedeCerrar: (modulo: ModuloApp) => boolean;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  currentUser: null,
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
  mobileMenuOpen: false,

  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  setCurrentUser: (user: Usuario | null) => {
    set({ currentUser: user });
  },

  logout: () => {
    set({ currentUser: null });
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
    if (!currentUser || currentUser.estado === 'INACTIVO') return 'NINGUNO';
    if (!permisosMapa) {
      const defaultPerms = (SEED_DATA_RAW as any).permisos;
      const rolPermisos = defaultPerms ? defaultPerms[currentUser.rol] : null;
      return rolPermisos ? (rolPermisos[modulo] || 'NINGUNO') : 'NINGUNO';
    }
    const rolPermisos = permisosMapa[currentUser.rol];
    if (!rolPermisos) return 'NINGUNO';
    return rolPermisos[modulo] || 'NINGUNO';
  },

  puedeLeer: (modulo: ModuloApp): boolean => {
    return get().getPermiso(modulo) !== 'NINGUNO';
  },

  puedeProponer: (modulo: ModuloApp): boolean => {
    const perm = get().getPermiso(modulo);
    return perm === 'PROPUESTA' || perm === 'ESCRITURA';
  },

  puedeEditar: (modulo: ModuloApp): boolean => {
    return get().getPermiso(modulo) === 'ESCRITURA';
  },

  puedeAprobar: (modulo: ModuloApp): boolean => {
    return get().getPermiso(modulo) === 'ESCRITURA';
  },

  puedeCerrar: (modulo: ModuloApp): boolean => {
    return get().getPermiso(modulo) === 'ESCRITURA';
  },
}));
