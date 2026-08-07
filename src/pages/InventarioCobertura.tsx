import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { FilterBar } from '../components/ui/FilterBar';
import { AbcBadge, SemaforoBadge } from '../components/ui/Badge';
import { ProyeccionChart } from '../components/charts/ProyeccionChart';
import { DataTable } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatoNumero, formatoFechaISOAFormatoPeruano } from '../engine/formato';
import { mockProvider } from '../services/mockProvider';
import { ProyeccionInventario, ReordenCalculado, Sku } from '../types';
import { ColumnDef } from '@tanstack/react-table';
import { Package, Download, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export function InventarioCobertura() {
  const {
    skus,
    reorden,
    filters,
    loading,
    error,
    loadInitialData,
  } = useAppStore();

  const [selectedSkuId, setSelectedSkuId] = React.useState<string>('INS-001');
  const [proyeccionesSku, setProyeccionesSku] = React.useState<ProyeccionInventario[]>([]);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    mockProvider.getProyeccionesInventario(selectedSkuId).then(setProyeccionesSku);
  }, [selectedSkuId]);

  if (loading) {
    return <LoadingSkeleton lines={10} />;
  }

  if (error) {
    return <ErrorState errorMessage={error} onRetry={loadInitialData} />;
  }

  // Filtrar según filtros globales
  let reordenFiltrado = reorden;
  if (filters.claseAbc && filters.claseAbc !== 'TODOS') {
    reordenFiltrado = reordenFiltrado.filter((r) => r.clase_abc === filters.claseAbc);
  }
  if (filters.proveedorId) {
    const skusProv = skus
      .filter((s) => s.proveedor_default === filters.proveedorId)
      .map((s) => s.sku_id);
    reordenFiltrado = reordenFiltrado.filter((r) => skusProv.includes(r.sku_id));
  }

  // Columnas para TanStack Table
  const columns: ColumnDef<ReordenCalculado, any>[] = [
    {
      accessorKey: 'sku_id',
      header: 'SKU / Insumo',
      cell: ({ row }) => {
        const skuInfo = skus.find((s) => s.sku_id === row.original.sku_id);
        return (
          <div>
            <div className="font-bold text-slate-900">{row.original.sku_id}</div>
            <div className="text-[10px] text-slate-500 font-sans truncate max-w-[160px]">
              {skuInfo?.nombre || ''}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'clase_abc',
      header: 'Clase ABC',
      cell: ({ getValue }) => <AbcBadge clase={getValue()} />,
    },
    {
      accessorKey: 'inventario_disponible',
      header: 'Disponible',
      cell: ({ getValue }) => formatoNumero(getValue(), 1),
    },
    {
      accessorKey: 'inventario_comprometido',
      header: 'Comprometido',
      cell: ({ getValue }) => formatoNumero(getValue(), 1),
    },
    {
      accessorKey: 'inventario_transito',
      header: 'En Tránsito',
      cell: ({ getValue }) => formatoNumero(getValue(), 1),
    },
    {
      accessorKey: 'posicion_inventario',
      header: 'Posición Total',
      cell: ({ getValue }) => (
        <span className="font-bold text-slate-900">{formatoNumero(getValue(), 1)}</span>
      ),
    },
    {
      accessorKey: 'punto_reorden',
      header: 'ROP',
      cell: ({ getValue }) => (
        <span className="text-amber-800 font-semibold">{formatoNumero(getValue(), 1)}</span>
      ),
    },
    {
      accessorKey: 'stock_seguridad',
      header: 'Stock Seg.',
      cell: ({ getValue }) => (
        <span className="text-rose-800 font-semibold">{formatoNumero(getValue(), 1)}</span>
      ),
    },
    {
      accessorKey: 'cobertura_actual_dias',
      header: 'Cobertura',
      cell: ({ getValue }) => {
        const val = getValue();
        return (
          <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
            val < 45 ? 'bg-rose-100 text-rose-900' : val < 60 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
          }`}>
            {val} días
          </span>
        );
      },
    },
    {
      accessorKey: 'fecha_estimada_quiebre',
      header: 'Fecha Quiebre',
      cell: ({ getValue }) => (
        <span className="font-bold text-slate-900">{formatoFechaISOAFormatoPeruano(getValue())}</span>
      ),
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const r = row.original;
        if (r.posicion_inventario < r.punto_reorden) {
          return <SemaforoBadge estado="ROJO" />;
        }
        if (r.cobertura_actual_dias < 60) {
          return <SemaforoBadge estado="AMBAR" />;
        }
        return <SemaforoBadge estado="VERDE" />;
      },
    },
  ];

  const handleExportVisual = () => {
    setExportMessage('Simulación de exportación iniciada: Generando archivo Excel (XLSX) con la matriz de inventario y parámetros de reorden...');
    setTimeout(() => setExportMessage(null), 4000);
  };

  const selectedReorden = reorden.find((r) => r.sku_id === selectedSkuId);
  const selectedSku = skus.find((s) => s.sku_id === selectedSkuId);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#15803D]" />
            <span>Inventario & Cobertura Dinámica de Insumos</span>
          </h2>
          <p className="text-xs text-slate-500">
            Monitoreo en tiempo real de posición de inventario, stock de seguridad y fechas proyectadas de quiebre
          </p>
        </div>

        <button
          onClick={handleExportVisual}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Exportar Matriz en Excel</span>
        </button>
      </div>

      {exportMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Filtros Operativos */}
      <FilterBar />

      {/* Tabla de Inventario */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500 font-medium">
          Haga clic sobre cualquier fila para seleccionar el insumo y proyectar su curva de agotamiento a 12 meses:
        </div>
        <DataTable
          data={reordenFiltrado}
          columns={columns}
          searchPlaceholder="Buscar por código SKU..."
          onRowClick={(row) => setSelectedSkuId(row.sku_id)}
          selectedRowId={selectedSkuId}
          rowIdKey="sku_id"
        />
      </div>

      {/* Gráfico de Proyección a 12 Meses del SKU Seleccionado */}
      <ProyeccionChart
        proyecciones={proyeccionesSku}
        reordenInfo={selectedReorden}
        sku={selectedSku}
      />
    </div>
  );
}
