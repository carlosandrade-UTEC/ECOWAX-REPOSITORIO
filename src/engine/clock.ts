/**
 * Servicio de Reloj Configurable (Clock Service)
 * Permite cambiar la fecha de corte del sistema dinámicamente para operación real,
 * simulaciones S&OP o pruebas automatizadas fijas.
 */

let systemDateIso: string = '2026-08-07';

/**
 * Obtiene la fecha actual del sistema en formato YYYY-MM-DD
 */
export function getSystemDate(): string {
  return systemDateIso;
}

/**
 * Configura una nueva fecha de corte para el sistema
 */
export function setSystemDate(fechaIso: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
    throw new Error(`Formato de fecha de reloj inválido: ${fechaIso}. Debe ser YYYY-MM-DD.`);
  }
  systemDateIso = fechaIso;
}

/**
 * Restablece la fecha del reloj al valor por defecto ('2026-08-07')
 */
export function resetSystemDate(): void {
  systemDateIso = '2026-08-07';
}
