import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  searchColumnKey?: string;
  onRowClick?: (row: TData) => void;
  selectedRowId?: string;
  rowIdKey?: keyof TData;
}

export function DataTable<TData>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  onRowClick,
  selectedRowId,
  rowIdKey,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Buscador Superior */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-slate-800 transition-all font-medium"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          {table.getFilteredRowModel().rows.length} registros
        </div>
      </div>

      {/* Tabla HTML */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/70 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100 tracking-widest">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={`px-4 py-3 select-none ${
                        canSort ? 'cursor-pointer hover:bg-slate-100/50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {canSort && (
                          <span className="text-slate-400">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[#15803D]" />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown className="w-3 h-3 text-[#15803D]" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6">
                  <EmptyState
                    title="No hay registros"
                    message="No se encontraron datos disponibles bajo los filtros aplicados."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowObj = row.original;
                const isSelected =
                  rowIdKey && selectedRowId && String(rowObj[rowIdKey]) === String(selectedRowId);

                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(rowObj)}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-green-50 font-semibold' : ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle font-normal font-mono text-[11px] text-slate-800">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
