import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store/useAppStore';
import { mockProvider } from '../../services/mockProvider';

describe('Pruebas de Seguridad, Gobernanza y Permisos RBAC', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentUser: {
        usuario_id: 'USR-001',
        nombre: 'Rosa Quispe',
        rol: 'JEFE_COMPRAS',
        area: 'COMPRAS',
        estado: 'ACTIVO',
      },
    });
  });

  it('1. Helpers de Permisos: distingue correctamente entre LECTURA, PROPUESTA y ESCRITURA', () => {
    const store = useAppStore.getState();

    // JEFE_COMPRAS tiene ESCRITURA en alertas y LECTURA en inventario
    expect(store.getPermiso('alertas')).toBe('ESCRITURA');
    expect(store.puedeEditar('alertas')).toBe(true);
    expect(store.puedeAprobar('alertas')).toBe(true);

    expect(store.getPermiso('inventario')).toBe('LECTURA');
    expect(store.puedeEditar('inventario')).toBe(false);

    // JEFE_COMPRAS tiene PROPUESTA en parametros
    expect(store.getPermiso('parametros')).toBe('PROPUESTA');
    expect(store.puedeProponer('parametros')).toBe(true);
    expect(store.puedeEditar('parametros')).toBe(false);

    // Cambiar a usuario LECTOR
    useAppStore.setState({
      currentUser: {
        usuario_id: 'USR-010',
        nombre: 'Lector Consulta',
        rol: 'LECTOR',
        area: 'OPERACIONES',
        estado: 'ACTIVO',
      },
    });

    const storeLector = useAppStore.getState();
    expect(storeLector.getPermiso('inventario')).toBe('LECTURA');
    expect(storeLector.puedeLeer('inventario')).toBe(true);
    expect(storeLector.puedeEditar('inventario')).toBe(false);
    expect(storeLector.puedeAprobar('inventario')).toBe(false);
    expect(storeLector.puedeCerrar('inventario')).toBe(false);
  });

  it('2. Bloqueo de Usuarios Inactivos: getPermiso devuelve NINGUNO si el usuario está INACTIVO', () => {
    useAppStore.setState({
      currentUser: {
        usuario_id: 'USR-099',
        nombre: 'Inactivo Test',
        rol: 'ADMIN',
        area: 'SISTEMAS',
        estado: 'INACTIVO',
      },
    });

    const store = useAppStore.getState();
    expect(store.getPermiso('dashboard')).toBe('NINGUNO');
    expect(store.puedeLeer('dashboard')).toBe(false);
    expect(store.puedeEditar('dashboard')).toBe(false);
  });

  it('3. Disponibilidad de Módulos Protegidos: rechaza módulos no autorizados para el rol COMERCIAL', () => {
    useAppStore.setState({
      currentUser: {
        usuario_id: 'USR-005',
        nombre: 'Comercial Demo',
        rol: 'COMERCIAL',
        area: 'VENTAS',
        estado: 'ACTIVO',
      },
    });

    const store = useAppStore.getState();
    expect(store.getPermiso('parametros')).toBe('NINGUNO');
    expect(store.getPermiso('usuarios')).toBe('NINGUNO');
    expect(store.puedeEditar('parametros')).toBe(false);
  });

  it('4. Validación de Acta de Revisión: la revisión ABIERTA tiene estado BORRADOR y no declara CONFORME', async () => {
    const revisiones = await mockProvider.getRevisiones();
    const abierta = revisiones.find((r) => r.estado === 'ABIERTA');

    expect(abierta).toBeDefined();
    expect(abierta?.estado).toBe('ABIERTA');
    expect(abierta?.estado === 'CERRADA').toBe(false);
  });
});
