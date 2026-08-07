import { ClaseABC } from '../types';

export interface ItemConsumoValor {
  sku_id: string;
  consumo12Meses: number;
  precioReferenciaUsd: number;
}

export function calcularClasificacionABC(items: ItemConsumoValor[]): Map<string, ClaseABC> {
  const itemsConValor = items.map((item) => ({
    sku_id: item.sku_id,
    valorTotal: item.consumo12Meses * item.precioReferenciaUsd,
  }));

  const valorGranTotal = itemsConValor.reduce((acc, curr) => acc + curr.valorTotal, 0);

  if (valorGranTotal === 0) {
    const map = new Map<string, ClaseABC>();
    items.forEach((item) => map.set(item.sku_id, 'C'));
    return map;
  }

  // Ordenar descendente por valor total
  itemsConValor.sort((a, b) => b.valorTotal - a.valorTotal);

  const resultado = new Map<string, ClaseABC>();
  let acumulado = 0;

  for (const item of itemsConValor) {
    acumulado += item.valorTotal;
    const pctAcumulado = acumulado / valorGranTotal;

    if (pctAcumulado <= 0.800001) {
      resultado.set(item.sku_id, 'A');
    } else if (pctAcumulado <= 0.950001) {
      resultado.set(item.sku_id, 'B');
    } else {
      resultado.set(item.sku_id, 'C');
    }
  }

  return resultado;
}
