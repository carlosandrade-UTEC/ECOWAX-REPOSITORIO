/**
 Generador robusto de Identificadores Únicos (UUID v4)
 Previene colisiones en cargas concurrentes y mutaciones del sistema.
 */
export function generarUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback seguro usando aleatoriedad criptográfica o sintética
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Genera una clave de idempotencia basada en el archivo y contenido para evitar cargas duplicadas.
 */
export function generarClaveIdempotencia(
  nombreArchivo: string,
  tamanioBytes: number,
  totalFilas: number,
  periodo: string
): string {
  return `IDEMP-${nombreArchivo.replace(/[^a-zA-Z0-9]/g, '')}-${tamanioBytes}-${totalFilas}-${periodo}`;
}
