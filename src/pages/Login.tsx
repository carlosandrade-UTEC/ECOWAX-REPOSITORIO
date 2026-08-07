import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { mockProvider } from '../services/mockProvider';
import { Usuario } from '../types';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Login() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState<string>('USR-001');
  const { setCurrentUser } = useAppStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    mockProvider.getUsuarios().then((list) => {
      setUsuarios(list);
      if (list.length > 0) setSelectedUserId(list[0].usuario_id);
    });
  }, []);

  const handleIngresar = () => {
    const found = usuarios.find((u) => u.usuario_id === selectedUserId);
    if (found) {
      setCurrentUser(found);
      navigate('/inicio');
    }
  };

  const selectedUser = usuarios.find((u) => u.usuario_id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Banner de demostración superior */}
      <div className="fixed top-0 left-0 right-0 h-[32px] bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center px-4 z-50">
        MODO DEMOSTRACIÓN — datos sintéticos, no son resultados operativos de ECOWAX
      </div>

      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#15803D] text-white font-bold text-xl shadow-lg mb-2">
            EW
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            ECOWAX Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Demand & Supply Intelligence System (ECOPROA E.I.R.L.)
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ingresar como (Seleccione Perfil):
            </label>
            <select
              id="login-user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            >
              {usuarios.map((u) => (
                <option key={u.usuario_id} value={u.usuario_id}>
                  {u.nombre} — {u.rol} ({u.area})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Usuario Activo:</span>
                <span className="font-semibold text-slate-200">{selectedUser.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rol Operativo:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedUser.rol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Área de Trabajo:</span>
                <span className="text-slate-300">{selectedUser.area}</span>
              </div>
            </div>
          )}

          <button
            id="login-submit-button"
            onClick={handleIngresar}
            className="w-full py-2.5 bg-[#15803D] hover:bg-[#14532D] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Ingresar al Sistema</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 text-center space-y-1">
          <p className="flex items-center justify-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Versión de Reglas: <strong className="text-slate-300 font-mono">RB-2026.08</strong></span>
          </p>
          <p className="text-[10px] text-slate-500">
            Control de acceso basado en roles sin persistencia de cookies/session.
          </p>
        </div>
      </div>
    </div>
  );
}
