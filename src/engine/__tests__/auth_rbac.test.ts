import { describe, it, expect } from 'vitest';
import { useAppStore } from '../../store/useAppStore';
import { Usuario } from '../../types';

describe('Pruebas de Control de Acceso por Roles (RBAC) - Tarea 4', () => {
  it('1. Usuario no autenticado debe recibir permiso NINGUNO para todos los módulos', () => {
    useAppStore.getState().setCurrentUser(null);

    const store = useAppStore.getState();
    expect(store.getPermiso('dashboard')).toBe('NINGUNO');
    expect(store.getPermiso('parametros')).toBe('NINGUNO');
    expect(store.getPermiso('usuarios')).toBe('NINGUNO');
  });

  it('2. Usuario con rol LECTOR no debe tener acceso a parametros ni usuarios (NINGUNO)', () => {
    const lector: Usuario = {
      usuario_id: 'USR-010',
      nombre: 'Cindy Salazar',
      rol: 'LECTOR',
      area: 'Comercial',
      email: 'cindy.salazar@ecowax.com',
    };

    useAppStore.getState().setCurrentUser(lector);
    const store = useAppStore.getState();

    // Puede ver el dashboard / inicio / inventario
    expect(store.getPermiso('dashboard')).toBe('LECTURA');
    expect(store.getPermiso('inventario')).toBe('LECTURA');

    // NINGUNO para modulos restrictivos
    expect(store.getPermiso('parametros')).toBe('NINGUNO');
    expect(store.getPermiso('usuarios')).toBe('NINGUNO');
    expect(store.getPermiso('carga_datos')).toBe('NINGUNO');
    expect(store.getPermiso('auditoria')).toBe('NINGUNO');
  });

  it('3. Usuario con rol PLANEAMIENTO/PROPUESTA debe tener nivel PROPUESTA en parametros', () => {
    const planeamiento: Usuario = {
      usuario_id: 'USR-004',
      nombre: 'Diego Ferrer',
      rol: 'PLANEAMIENTO',
      area: 'Operaciones',
      email: 'diego.ferrer@ecowax.com',
    };

    useAppStore.getState().setCurrentUser(planeamiento);
    const store = useAppStore.getState();

    expect(store.getPermiso('parametros')).toBe('PROPUESTA');
  });

  it('4. Usuario con rol ADMIN debe tener acceso ESCRITURA en todos los módulos', () => {
    const admin: Usuario = {
      usuario_id: 'USR-009',
      nombre: 'Christian Lopez',
      rol: 'ADMIN',
      area: 'TI',
      email: 'christian.lopez@ecowax.com',
    };

    useAppStore.getState().setCurrentUser(admin);
    const store = useAppStore.getState();

    expect(store.getPermiso('dashboard')).toBe('ESCRITURA');
    expect(store.getPermiso('parametros')).toBe('ESCRITURA');
    expect(store.getPermiso('usuarios')).toBe('ESCRITURA');
    expect(store.getPermiso('carga_datos')).toBe('ESCRITURA');
  });

  it('5. La sesión debe poder cerrarse limpiando la memoria con logout()', () => {
    useAppStore.getState().logout();
    expect(useAppStore.getState().currentUser).toBeNull();
    expect(useAppStore.getState().getPermiso('dashboard')).toBe('NINGUNO');
  });
});
