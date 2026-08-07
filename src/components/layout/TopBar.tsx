import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { dataProvider } from '../../services/dataProvider';
import { Usuario } from '../../types';
import { User, Calendar, RefreshCw, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [userList, setUserList] = React.useState<Usuario[]>([]);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    dataProvider.getUsuarios().then(setUserList);
  }, []);

  const handleSelectUser = (user: Usuario) => {
    setCurrentUser(user);
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-[32px] left-0 right-0 h-14 bg-[#14532D] text-white flex items-center justify-between px-6 z-40 border-b border-green-900 shadow-md">
      <div className="flex items-center space-x-4">
        <div 
          onClick={() => navigate('/inicio')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-[#15803D] rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-green-600 transition-colors">
            <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45"></div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
              ECOWAX <span className="text-green-200 font-medium text-xs normal-case">| Intelligence</span>
            </h1>
            <p className="text-[10px] text-green-200/80 font-medium -mt-0.5">Demanda & Abastecimiento</p>
          </div>
        </div>

        <div className="h-4 w-px bg-green-800 hidden md:block"></div>

        {/* Campaña Activa & Fecha */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-800/80 text-green-100 border border-green-700 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Campaña Activa: Cítricos (Sur) / Palta (Centro)
          </div>
          <div className="flex items-center text-green-200 text-[11px] space-x-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-green-300" />
            <span>06/08/2026</span>
          </div>
        </div>
      </div>

      {/* Selector de Usuario / Rol */}
      <div className="relative">
        <button
          id="user-selector-button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-green-800 hover:bg-green-700 border border-green-700 text-xs text-white transition-all focus:outline-none focus:ring-2 focus:ring-green-400/40 cursor-pointer"
          aria-label="Seleccionar usuario"
        >
          <div className="w-6 h-6 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-xs">
            {currentUser?.nombre ? currentUser.nombre.substring(0, 2).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-bold text-white leading-none">{currentUser?.nombre}</div>
            <div className="text-[10px] text-green-200 mt-0.5">{currentUser?.rol}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-green-200" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 text-xs">
            <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <p className="text-[11px] font-bold text-slate-900">Cambiar perfil de demostración</p>
              <p className="text-[10px] text-slate-500">Determina los permisos y rutas accesibles</p>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {userList.map((u) => (
                <button
                  key={u.usuario_id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    currentUser?.usuario_id === u.usuario_id ? 'bg-green-50 text-[#15803D] font-bold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{u.nombre}</div>
                    <div className="text-[10px] text-slate-400">{u.area}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    u.rol === 'LECTOR' 
                      ? 'bg-amber-50 border-amber-200 text-amber-800 font-bold' 
                      : u.rol === 'ADMIN'
                      ? 'bg-green-50 border-green-200 text-[#15803D] font-bold'
                      : 'bg-slate-100 border-slate-200 text-slate-700 font-medium'
                  }`}>
                    {u.rol}
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-3.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs flex items-center space-x-1.5 font-medium"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Ir a pantalla de acceso</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
