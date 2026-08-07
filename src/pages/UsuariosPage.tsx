import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { dataProvider } from '../services/dataProvider';
import { Usuario, RolUsuario, ModuloApp, PermisoNivel, PermisosMapa } from '../types';
import { Unauthorized403 } from './Unauthorized403';
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Grid,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Lock
} from 'lucide-react';

const ALL_ROLES: RolUsuario[] = [
  'ADMIN',
  'JEFE_COMPRAS',
  'ANALISTA_COMPRAS',
  'GERENTE_OPERACIONES',
  'PLANEAMIENTO',
  'COMERCIAL',
  'FINANZAS',
  'GERENTE_GENERAL',
  'DATA_ANALYST',
  'LECTOR',
];

const MODULOS_MAP: { id: ModuloApp; name: string }[] = [
  { id: 'inicio', name: 'Inicio' },
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'inventario', name: 'Inventario' },
  { id: 'pronostico', name: 'Pronóstico' },
  { id: 'alertas', name: 'Alertas' },
  { id: 'recomendaciones', name: 'Recomendaciones' },
  { id: 'decisiones', name: 'Decisiones' },
  { id: 'revision_mensual', name: 'Revisión Mensual' },
  { id: 'carga_datos', name: 'Carga de Datos' },
  { id: 'maestros', name: 'Maestros' },
  { id: 'parametros', name: 'Parámetros' },
  { id: 'auditoria', name: 'Auditoría' },
  { id: 'usuarios', name: 'Usuarios' },
];

export function UsuariosPage() {
  const { currentUser } = useAppStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permisosMapa, setPermisosMapa] = useState<PermisosMapa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form para alta
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>('ANALISTA_COMPRAS');
  const [nuevaArea, setNuevaArea] = useState('Compras');
  const [mostrarAltaModal, setMostrarAltaModal] = useState(false);
  const [savingAlta, setSavingAlta] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uList, pMapa] = await Promise.all([
        dataProvider.getUsuarios(),
        dataProvider.getPermisos(),
      ]);
      setUsuarios(uList);
      setPermisosMapa(pMapa);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Verificar si es ADMIN. Si no es admin, mostrar 403.
  if (currentUser?.rol !== 'ADMIN') {
    return <Unauthorized403 moduloRequerido="Administración de Usuarios" />;
  }

  // Crear usuario (Alta)
  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setSavingAlta(true);
    try {
      await dataProvider.createUsuario({
        nombre: nuevoNombre.trim(),
        rol: nuevoRol,
        area: nuevaArea.trim() || 'Operaciones',
        estado: 'ACTIVO',
      });
      setNuevoNombre('');
      setMostrarAltaModal(false);
      await cargarDatos();
      alert('Usuario creado exitosamente con alta y registro en auditoría.');
    } catch (err: any) {
      alert('Error al crear usuario: ' + err.message);
    } finally {
      setSavingAlta(false);
    }
  };

  // Toggle estado (Baja lógica)
  const handleToggleEstado = async (u: Usuario) => {
    const nuevoEst = u.estado === 'INACTIVO' ? 'ACTIVO' : 'INACTIVO';
    const confirmMsg =
      nuevoEst === 'INACTIVO'
        ? `¿Confirma la BAJA LÓGICA del usuario ${u.nombre} (${u.usuario_id})? El usuario no será borrado físicamente pero no podrá ingresar.`
        : `¿Confirma reactivar al usuario ${u.nombre}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await dataProvider.toggleUsuarioEstado(u.usuario_id, nuevoEst);
      await cargarDatos();
    } catch (err: any) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  // Cambiar rol
  const handleCambiarRol = async (u: Usuario, rolNuevo: RolUsuario) => {
    if (u.rol === rolNuevo) return;
    try {
      await dataProvider.updateUsuarioRol(u.usuario_id, rolNuevo);
      await cargarDatos();
    } catch (err: any) {
      alert('Error al actualizar rol: ' + err.message);
    }
  };

  const renderBadgePermiso = (nivel: PermisoNivel) => {
    switch (nivel) {
      case 'ESCRITURA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Escritura
          </span>
        );
      case 'PROPUESTA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Propuesta
          </span>
        );
      case 'LECTURA':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Lectura
          </span>
        );
      case 'NINGUNO':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
            —
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#15803D] border border-green-200 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> Control de Accesos ADMIN
            </span>
            <span className="text-xs text-slate-400">| Gobierno de Seguridad ISO 27001</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#15803D]" />
            Administración de Usuarios y Permisos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de altas, baja lógica de usuarios y asignación de roles. Matriz de permisos RBAC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarAltaModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario (Alta)
          </button>
          <button
            onClick={cargarDatos}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            title="Refrescar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Modal / Formulario de Alta */}
      {mostrarAltaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" /> Alta de Nuevo Usuario
              </h3>
              <button
                onClick={() => setMostrarAltaModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Mendoza"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Área / Departamento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compras / Logística"
                  value={nuevaArea}
                  onChange={(e) => setNuevaArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rol Operativo</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {ALL_ROLES.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  El usuario será creado con estado <strong>ACTIVO</strong> y quedará registrado
                  automáticamente en la bitácora de auditoría inmutable.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarAltaModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAlta}
                  className="px-4 py-2 bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  {savingAlta ? 'Creando...' : 'Guardar y Registrar Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#15803D]" /> Lista de Usuarios del Sistema
            </h2>
            <p className="text-xs text-slate-500">
              Gestione cambios de rol y bajas lógicas (desactivación). Se prohíbe el borrado físico de cuentas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
              Total: {usuarios.length} usuarios
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-[#15803D]" />
            <p className="text-sm font-medium">Cargando directorio de usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">ID Usuario</th>
                  <th className="px-4 py-3">Nombre Completo</th>
                  <th className="px-4 py-3">Área</th>
                  <th className="px-4 py-3">Rol Asignado</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones de Gobierno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usuarios.map((u) => {
                  const isInactive = u.estado === 'INACTIVO';
                  return (
                    <tr
                      key={u.usuario_id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isInactive ? 'bg-slate-50/50 opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-green-950">
                        {u.usuario_id}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">
                        {u.nombre}
                      </td>

                      <td className="px-4 py-3 text-slate-600">{u.area}</td>

                      <td className="px-4 py-3">
                        <select
                          value={u.rol}
                          onChange={(e) => handleCambiarRol(u, e.target.value as RolUsuario)}
                          disabled={isInactive}
                          className="px-2 py-1 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isInactive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <UserX className="w-3 h-3" /> INACTIVO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <UserCheck className="w-3 h-3" /> ACTIVO
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleEstado(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            isInactive
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                          title="Baja Lógica / Reactivación (Sin borrado físico)"
                        >
                          {isInactive ? 'Reactivar' : 'Baja Lógica'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Matriz de Permisos (Rol x Módulo x Permiso) - Tabla de Solo Lectura */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#15803D] border border-green-200 uppercase tracking-wider">
              Control de Accesos Basado en Roles (RBAC)
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#15803D]" /> Matriz de Permisos por Rol × Módulo (Solo Lectura)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Muestra detallada de los permisos asignados a cada perfil de usuario en todos los módulos operativos.
          </p>
        </div>

        {permisosMapa && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                  <th className="px-3 py-2.5 border-r border-slate-800 sticky left-0 bg-slate-900 min-w-[150px]">
                    Rol Operativo
                  </th>
                  {MODULOS_MAP.map((m) => (
                    <th key={m.id} className="px-2.5 py-2.5 text-center border-r border-slate-800 min-w-[85px]">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_ROLES.map((rol) => {
                  const rolPerms = permisosMapa[rol] || {};
                  return (
                    <tr key={rol} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 font-bold font-mono text-slate-900 bg-slate-50 border-r border-slate-200 sticky left-0">
                        {rol}
                      </td>
                      {MODULOS_MAP.map((m) => {
                        const nivel = rolPerms[m.id] || 'NINGUNO';
                        return (
                          <td
                            key={m.id}
                            className="px-2 py-2 text-center border-r border-slate-100"
                          >
                            {renderBadgePermiso(nivel)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Leyenda de Permisos */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Escritura
            </span>
            <span className="text-slate-600 text-[11px]">Acceso total para modificar, aprobar y ejecutar decisiones.</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Propuesta
            </span>
            <span className="text-slate-600 text-[11px]">Permite proponer ajustes que quedan pendientes de aprobación.</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Lectura
            </span>
            <span className="text-slate-600 text-[11px]">Consulta de dashboards, reportes y listas sin modificar datos.</span>
          </div>

          <div className="flex items-start gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
              —
            </span>
            <span className="text-slate-600 text-[11px]">Sin acceso (Acceso denegado con pantalla 403).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UsuariosPage;
