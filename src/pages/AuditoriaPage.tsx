import React, { useState, useEffect, useMemo } from 'react';
import { dataProvider } from '../services/dataProvider';
import { RegistroAuditoria, Usuario } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Lock,
  User,
  FileText,
  Clock,
  RefreshCw,
  AlertCircle,
  Database
} from 'lucide-react';

export function AuditoríaPage() {
  const [logs, setLogs] = useState<RegistroAuditoria[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState<string>('TODOS');
  const [filtroEntidad, setFiltroEntidad] = useState<string>('TODAS');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState<string>('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const cargarAuditoria = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, userList] = await Promise.all([
        dataProvider.getAuditoria(),
        dataProvider.getUsuarios(),
      ]);
      setLogs(data);
      setUsuarios(userList);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los registros de auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAuditoria();
  }, []);

  // Entidades únicas
  const entidadesDisponibles = useMemo(() => {
    const setEnt = new Set<string>();
    logs.forEach((log) => setEnt.add(log.entidad));
    return Array.from(setEnt);
  }, [logs]);

  // Filtrado de logs
  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      // Filtro Usuario
      if (filtroUsuario !== 'TODOS' && log.usuario_id !== filtroUsuario) {
        return false;
      }
      // Filtro Entidad
      if (filtroEntidad !== 'TODAS' && log.entidad !== filtroEntidad) {
        return false;
      }
      // Filtro Fecha Desde
      if (filtroFechaDesde && log.timestamp.slice(0, 10) < filtroFechaDesde) {
        return false;
      }
      // Filtro Fecha Hasta
      if (filtroFechaHasta && log.timestamp.slice(0, 10) > filtroFechaHasta) {
        return false;
      }
      // Búsqueda por texto (motivo, id, valor)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchMotivo = log.motivo?.toLowerCase().includes(term);
        const matchEntidadId = log.entidad_id?.toLowerCase().includes(term);
        const matchCampo = log.campo?.toLowerCase().includes(term);
        const matchUser = log.usuario_id?.toLowerCase().includes(term);
        if (!matchMotivo && !matchEntidadId && !matchCampo && !matchUser) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filtroUsuario, filtroEntidad, filtroFechaDesde, filtroFechaHasta, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#15803D] border border-green-200 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> Bitácora Inalterable
            </span>
            <span className="text-xs text-slate-400">| Sistema SOX / Trazabilidad ISO 9001</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#15803D]" />
            Auditoría & Trazabilidad de Cambios
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro cronológico inmutable de modificaciones en parámetros, decisiones de compra y datos maestro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Acceso Solo Lectura (100% Protegido)</span>
          </div>
          <button
            onClick={cargarAuditoria}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#15803D]" />
            Filtros de Búsqueda y Auditoría
          </h2>
          <button
            onClick={() => {
              setFiltroUsuario('TODOS');
              setFiltroEntidad('TODAS');
              setFiltroFechaDesde('');
              setFiltroFechaHasta('');
              setSearchTerm('');
            }}
            className="text-xs text-[#15803D] hover:text-[#14532D] font-semibold cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Búsqueda General */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Buscar por Palabra Clave
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Motivo, ID de Entidad, Campo, Usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filtro Usuario */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> Usuario
            </label>
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los usuarios</option>
              {usuarios.map((u) => (
                <option key={u.usuario_id} value={u.usuario_id}>
                  {u.usuario_id} - {u.nombre} ({u.rol})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Entidad */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-400" /> Entidad Modificada
            </label>
            <select
              value={filtroEntidad}
              onChange={(e) => setFiltroEntidad(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODAS">Todas las entidades</option>
              {entidadesDisponibles.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Desde
              </label>
              <input
                type="date"
                value={filtroFechaDesde}
                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtroFechaHasta}
                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Cargando registros de auditoría...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={cargarAuditoria}
              className="mt-2 px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl hover:bg-rose-100 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No se encontraron registros de auditoría</p>
            <p className="text-xs text-slate-400">Intente modificar los criterios de búsqueda o limpiar los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Timestamp / Log ID</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Entidad / ID</th>
                  <th className="px-4 py-3">Campo Modificado</th>
                  <th className="px-4 py-3">Valor Anterior</th>
                  <th className="px-4 py-3">Valor Nuevo</th>
                  <th className="px-4 py-3">Motivo / Justificación</th>
                  <th className="px-4 py-3 text-center">Regla Versión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logsFiltrados.map((log) => {
                  const usuarioInfo = usuarios.find((u) => u.usuario_id === log.usuario_id);
                  return (
                    <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{log.timestamp}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.log_id}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{log.usuario_id}</div>
                        {usuarioInfo && (
                          <div className="text-[10px] text-slate-500">
                            {usuarioInfo.nombre} ({usuarioInfo.rol})
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] rounded font-semibold border border-slate-200 mb-0.5">
                          {log.entidad}
                        </span>
                        <div className="font-bold font-mono text-indigo-700">{log.entidad_id}</div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {log.campo}
                      </td>

                      <td className="px-4 py-3 font-mono text-rose-700 bg-rose-50/50 rounded px-2 py-1 max-w-[120px] truncate" title={log.valor_anterior || '—'}>
                        {log.valor_anterior || '—'}
                      </td>

                      <td className="px-4 py-3 font-mono text-emerald-700 bg-emerald-50/50 rounded px-2 py-1 max-w-[120px] truncate" title={log.valor_nuevo}>
                        {log.valor_nuevo}
                      </td>

                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="text-slate-600 line-clamp-2" title={log.motivo}>
                          {log.motivo}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded-full border border-slate-200">
                          {log.version_regla}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between">
          <span>Mostrando {logsFiltrados.length} de {logs.length} registros auditados</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-3 h-3" /> Ningún usuario ni administrador puede eliminar o modificar estas filas.
          </span>
        </div>
      </div>
    </div>
  );
}
export default AuditoríaPage;
