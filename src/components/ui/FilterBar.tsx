import { useAppStore } from '../../store/useAppStore';
import { Filter, RotateCcw } from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters, clearFilters, zonas, campanias, proveedores } = useAppStore();

  const hasActiveFilters =
    filters.zonaId ||
    filters.campaniaId ||
    (filters.claseAbc && filters.claseAbc !== 'TODOS') ||
    filters.proveedorId;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs mb-6">
      <div className="flex items-center space-x-2 text-slate-900 font-bold">
        <Filter className="w-4 h-4 text-[#15803D]" />
        <span>Filtros Operativos:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Zona */}
        <select
          value={filters.zonaId || ''}
          onChange={(e) => setFilters({ zonaId: e.target.value || undefined })}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 min-h-[44px] font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#15803D] transition-all"
        >
          <option value="">Todas las Zonas</option>
          {zonas.map((z) => (
            <option key={z.zona_id} value={z.zona_id}>
              {z.nombre} ({z.departamentos.split(',')[0]})
            </option>
          ))}
        </select>

        {/* Campaña */}
        <select
          value={filters.campaniaId || ''}
          onChange={(e) => setFilters({ campaniaId: e.target.value || undefined })}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#15803D] transition-all"
        >
          <option value="">Todas las Campañas</option>
          {campanias.map((c) => (
            <option key={c.campania_id} value={c.campania_id}>
              {c.cultivo} ({c.ventana})
            </option>
          ))}
        </select>

        {/* Clase ABC */}
        <select
          value={filters.claseAbc || 'TODOS'}
          onChange={(e) => setFilters({ claseAbc: e.target.value as any })}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#15803D] font-bold transition-all"
        >
          <option value="TODOS">Todas las Clases ABC</option>
          <option value="A">Clase A (Alto impacto)</option>
          <option value="B">Clase B (Impacto medio)</option>
          <option value="C">Clase C (Bajo impacto)</option>
        </select>

        {/* Proveedor */}
        <select
          value={filters.proveedorId || ''}
          onChange={(e) => setFilters({ proveedorId: e.target.value || undefined })}
          className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-[#15803D] transition-all"
        >
          <option value="">Todos los Proveedores</option>
          {proveedores.map((p) => (
            <option key={p.proveedor_id} value={p.proveedor_id}>
              {p.nombre} ({p.pais})
            </option>
          ))}
        </select>

        {/* Limpiar */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 text-[#15803D] hover:text-[#14532D] px-3 py-2 bg-green-50 hover:bg-green-100 rounded-xl transition-all font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
}
