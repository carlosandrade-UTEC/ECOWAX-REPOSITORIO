export interface LineaOrdenCompra {
  cantidad_solicitada: number;
  cantidad_recibida: number;
  a_tiempo: boolean;
  completo: boolean;
  es_urgente: boolean;
  recibida: boolean;
}

export function calcularFillRate(lineas: LineaOrdenCompra[]): number | null {
  const lineasRecibidas = lineas.filter((l) => l.recibida);
  if (lineasRecibidas.length === 0) return null;

  const sumSolicitada = lineasRecibidas.reduce((sum, l) => sum + l.cantidad_solicitada, 0);
  if (sumSolicitada === 0) return null;

  const sumRecibida = lineasRecibidas.reduce((sum, l) => sum + l.cantidad_recibida, 0);
  return sumRecibida / sumSolicitada;
}

export function calcularOTIF(lineas: LineaOrdenCompra[]): number | null {
  if (lineas.length === 0) return null;

  const cumpen = lineas.filter((l) => l.a_tiempo && l.completo).length;
  return cumpen / lineas.length;
}

export function calcularPctUrgentes(lineas: LineaOrdenCompra[]): number | null {
  if (lineas.length === 0) return null;

  const urgentes = lineas.filter((l) => l.es_urgente).length;
  return urgentes / lineas.length;
}

export interface RegistroPronosticoReal {
  pronostico: number;
  real: number;
}

export function calcularMAPE(registros: RegistroPronosticoReal[]): number | null {
  const validos = registros.filter((r) => r.real > 0);
  if (validos.length === 0) return null;

  const sumErrorRelativo = validos.reduce(
    (sum, r) => sum + Math.abs(r.real - r.pronostico) / r.real,
    0
  );
  return sumErrorRelativo / validos.length;
}

export function calcularSesgo(registros: RegistroPronosticoReal[]): number | null {
  const validos = registros.filter((r) => r.real > 0);
  if (validos.length === 0) return null;

  const sumReal = validos.reduce((sum, r) => sum + r.real, 0);
  if (sumReal === 0) return null;

  const sumDiff = validos.reduce((sum, r) => sum + (r.pronostico - r.real), 0);
  return sumDiff / sumReal;
}

export function evaluarSemaforoKPI(
  kpiKey: string,
  valor: number | null,
  meta: number,
  direccion: 'MAYOR_MEJOR' | 'MENOR_MEJOR' | 'BANDA',
  alertaAmarilla: number,
  alertaRoja: number
): 'VERDE' | 'AMBAR' | 'ROJO' | 'SIN_DATO' {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'SIN_DATO';
  }

  if (direccion === 'MAYOR_MEJOR') {
    if (valor >= meta) return 'VERDE';
    if (valor >= alertaAmarilla) return 'AMBAR';
    return 'ROJO';
  }

  if (direccion === 'MENOR_MEJOR') {
    if (valor <= meta) return 'VERDE';
    if (valor <= alertaAmarilla) return 'AMBAR';
    return 'ROJO';
  }

  if (direccion === 'BANDA') {
    // Para sesgo, por ejemplo: ideal es 0.0, advertencia si abs(valor) > alertaAmarilla
    const absVal = Math.abs(valor);
    if (absVal <= alertaAmarilla) return 'VERDE';
    if (absVal <= alertaRoja) return 'AMBAR';
    return 'ROJO';
  }

  return 'VERDE';
}
