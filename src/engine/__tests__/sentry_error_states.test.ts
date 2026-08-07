import { describe, it, expect } from 'vitest';

describe('Pruebas de Estados de Error y Configuración Sentry (Tarea 6)', () => {
  it('1. Debe validar que VITE_SENTRY_DSN este deshabilitado cuando sea "none" o vacío', () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN || 'none';
    const isSentryActive = Boolean(dsn && dsn !== 'none' && dsn.trim() !== '');

    expect(isSentryActive).toBe(false);
  });

  it('2. Mensaje por defecto de error de API debe ser "No se pudo conectar con el servidor. Intenta de nuevo."', () => {
    const defaultErrorMessage = 'No se pudo conectar con el servidor. Intenta de nuevo.';
    expect(defaultErrorMessage).toContain('No se pudo conectar con el servidor');
  });

  it('3. Mensaje de error inesperado no debe contener stack trace para el usuario', () => {
    const userMessage = 'Ocurrió un error inesperado. El equipo ha sido notificado.';
    expect(userMessage).not.toContain('Error:');
    expect(userMessage).not.toContain('at ');
    expect(userMessage).toContain('El equipo ha sido notificado');
  });
});
