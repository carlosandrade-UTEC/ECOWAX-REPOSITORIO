/**
 * Formato de números peruano: miles con punto '.', decimales con coma ','.
 * Ejemplo: 1234.56 -> "1.234,56"
 */

export function formatoNumero(
  valor: number | null | undefined,
  decimales: number = 2
): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'sin dato';
  }

  const partes = valor.toFixed(decimales).split('.');
  const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decimales === 0) return entero;
  return `${entero},${partes[1]}`;
}

export function formatoEntero(valor: number | null | undefined): string {
  return formatoNumero(valor, 0);
}

export function formatoMoneda(
  valor: number | null | undefined,
  moneda: 'USD' | 'PEN' = 'USD'
): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'sin dato';
  }
  const prefijo = moneda === 'USD' ? 'USD $' : 'S/';
  return `${prefijo} ${formatoNumero(valor, 2)}`;
}

export function formatoPorcentaje(
  valor: number | null | undefined,
  decimales: number = 1
): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'sin dato';
  }
  const pct = valor * 100;
  return `${formatoNumero(pct, decimales)}%`;
}

export function formatoFechaISOAFormatoPeruano(fechaIso: string | null | undefined): string {
  if (!fechaIso) return 'sin dato';
  // Soporta YYYY-MM-DD o YYYY-MM-DD HH:mm
  const partesFecha = fechaIso.split(' ')[0].split('-');
  if (partesFecha.length !== 3) return fechaIso;
  const [anio, mes, dia] = partesFecha;
  return `${dia}/${mes}/${anio}`;
}
