import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { mockProvider } from '../services/mockProvider';
import { Sku, ClaseABC } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import { Database, Edit, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';

export function MaestroSkusPage() {
  const { getPermiso, skus, loadInitialData } = useAppStore();
  const permiso = getPermiso('maestros');

  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoriaFilter, setCategoriaFilter] = React.useState('TODAS');
  const [editingSku, setEditingSku] = React.useState<Sku | null>(null);

  // Advertencia de cambio de clase ABC
  const [showAbcWarning, setShowAbcWarning] = React.useState(false);
  const [pendingAbcChange, setPendingAbcChange] = React.useState<{
    sku: Sku;
    newAbc: ClaseABC;
  } | null>(null);

  if (permiso === 'NINGUNO') {
    return <Unauthorized403 />;
  }

  const categorias = Array.from(new Set(skus.map((s) => s.categoria)));

  const skusFiltrados = skus.filter((s) => {
    const matchSearch =
      s.sku_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoriaFilter === 'TODAS' || s.categoria === categoriaFilter;
    return matchSearch && matchCat;
  });

  const handleEditClick = (sku: Sku) => {
    setEditingSku({ ...sku });
  };

  const handleSelectAbcClass = (newAbc: ClaseABC) => {
    if (!editingSku) return;
    if (editingSku.clase_abc !== newAbc) {
      setPendingAbcChange({ sku: editingSku, newAbc });
      setShowAbcWarning(true);
    } else {
      setEditingSku({ ...editingSku, clase_abc: newAbc });
    }
  };

  const handleConfirmAbcChange = () => {
    if (pendingAbcChange && editingSku) {
      setEditingSku({ ...editingSku, clase_abc: pendingAbcChange.newAbc });
    }
    setShowAbcWarning(false);
    setPendingAbcChange(null);
  };

  const handleSaveSku = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSku) return;
    await mockProvider.updateSku(editingSku);
    await loadInitialData();
    setEditingSku(null);
    alert(`SKU ${editingSku.sku_id} actualizado correctamente en el maestro.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-[#15803D]" />
            <span>Maestro de Insumos & SKUs (dim_sku)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo maestro de insumos químicos, envases y parámetros base de abastecimiento.
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 w-full max-w-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="bg-transparent text-xs w-full focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Categoría:</span>
          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 rounded-lg p-1.5 focus:outline-none"
          >
            <option value="TODAS">Todas las Categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Maestro de SKUs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Código SKU</th>
                <th className="px-3.5 py-2.5">Nombre del Insumo</th>
                <th className="px-3.5 py-2.5">Categoría</th>
                <th className="px-3.5 py-2.5">Unidad</th>
                <th className="px-3.5 py-2.5">Clase ABC</th>
                <th className="px-3.5 py-2.5">Criticidad</th>
                <th className="px-3.5 py-2.5">Proveedor Def.</th>
                <th className="px-3.5 py-2.5 font-mono">Lote Mín.</th>
                <th className="px-3.5 py-2.5 font-mono">Precio Ref. (USD)</th>
                <th className="px-3.5 py-2.5 text-right">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {skusFiltrados.map((s) => (
                <tr key={s.sku_id} className="hover:bg-slate-50/80">
                  <td className="px-3.5 py-2.5 font-bold font-mono text-slate-900">{s.sku_id}</td>
                  <td className="px-3.5 py-2.5 font-bold text-slate-800">{s.nombre}</td>
                  <td className="px-3.5 py-2.5 text-slate-600">{s.categoria}</td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-slate-700">{s.unidad}</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                        s.clase_abc === 'A'
                          ? 'bg-rose-100 text-rose-800'
                          : s.clase_abc === 'B'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Clase {s.clase_abc}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-sans">{s.criticidad}</td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-600">{s.proveedor_default}</td>
                  <td className="px-3.5 py-2.5 font-mono font-bold">{s.lote_minimo}</td>
                  <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                    USD ${s.precio_referencia_usd.toFixed(2)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <button
                      onClick={() => handleEditClick(s)}
                      className="p-1 text-[#15803D] hover:text-[#14532D] hover:bg-green-50 rounded transition-colors cursor-pointer"
                      title="Editar SKU"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDICIÓN DE SKU */}
      {editingSku && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSaveSku}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Editar SKU Maestro: {editingSku.sku_id}</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                {editingSku.categoria}
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  value={editingSku.nombre}
                  onChange={(e) => setEditingSku({ ...editingSku, nombre: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 font-medium focus:ring-2 focus:ring-green-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clase ABC</label>
                  <select
                    value={editingSku.clase_abc}
                    onChange={(e) => handleSelectAbcClass(e.target.value as ClaseABC)}
                    className="w-full border border-slate-300 rounded p-2 font-bold font-mono focus:ring-2 focus:ring-green-600 focus:outline-none bg-amber-50"
                  >
                    <option value="A">Clase A (Nivel Serv. 98%)</option>
                    <option value="B">Clase B (Nivel Serv. 95%)</option>
                    <option value="C">Clase C (Nivel Serv. 90%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    required
                    value={editingSku.unidad}
                    onChange={(e) => setEditingSku({ ...editingSku, unidad: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono focus:ring-2 focus:ring-green-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lote Mínimo</label>
                  <input
                    type="number"
                    required
                    value={editingSku.lote_minimo}
                    onChange={(e) =>
                      setEditingSku({ ...editingSku, lote_minimo: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-slate-300 rounded p-2 font-mono focus:ring-2 focus:ring-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio Ref. (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingSku.precio_referencia_usd}
                    onChange={(e) =>
                      setEditingSku({
                        ...editingSku,
                        precio_referencia_usd: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-slate-300 rounded p-2 font-mono focus:ring-2 focus:ring-green-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSku(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POPUP DE ADVERTENCIA AL CAMBIAR CLASE ABC */}
      {showAbcWarning && pendingAbcChange && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3 text-amber-600">
              <AlertTriangle className="w-7 h-7 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  ⚠️ Advertencia de Cambio en Clase ABC
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Estás modificando la clasificación ABC del SKU{' '}
                  <strong className="text-slate-900 font-mono">{pendingAbcChange.sku.sku_id}</strong> de{' '}
                  <strong className="text-slate-900">Clase {pendingAbcChange.sku.clase_abc}</strong> a{' '}
                  <strong className="text-blue-700">Clase {pendingAbcChange.newAbc}</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2 text-amber-900 leading-relaxed">
              <p className="font-bold">Impacto en el Modelo de Abastecimiento:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 font-sans">
                <li>
                  Ajustará automáticamente el <strong>Nivel de Servicio objetivo</strong> (Clase A: 98%,
                  Clase B: 95%, Clase C: 90%).
                </li>
                <li>
                  Recalculará el <strong>Stock de Seguridad</strong> y el <strong>Punto de Reorden (ROP)</strong>.
                </li>
                <li>
                  Modificará el <strong>Capital de Trabajo</strong> comprometido en inventario de reserva.
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAbcWarning(false);
                  setPendingAbcChange(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAbcChange}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Confirmar Reclasificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
