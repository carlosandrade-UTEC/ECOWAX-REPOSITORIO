import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { dataProvider } from '../services/dataProvider';
import { Usuario } from '../types';
import { Shield, ArrowRight, AlertCircle, CheckCircle2, Lock, Mail, Users } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export function Login() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [emailInput, setEmailInput] = React.useState<string>('carlos.andrade@utec.edu.pe');
  const [errorAcceso, setErrorAcceso] = React.useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = React.useState<string>('');
  const { setCurrentUser } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar lista de usuarios registrada en cfg_roles_permisos
  React.useEffect(() => {
    dataProvider.getUsuarios().then((list) => {
      setUsuarios(list);
      if (list.length > 0) {
        const defaultUser = list.find((u) => u.email === 'carlos.andrade@utec.edu.pe') || list[0];
        setSelectedUserId(defaultUser.usuario_id);
        if (defaultUser.email) setEmailInput(defaultUser.email);
      }
    });
  }, []);

  // Inicializar Google Identity Services (GSI)
  React.useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const userEmail = payload.email;
        if (userEmail) {
          setEmailInput(userEmail);
          validarEIngresar(userEmail);
        }
      } catch (err) {
        setErrorAcceso('Error al procesar las credenciales de Google Identity Services.');
      }
    };

    const loadGsiScript = () => {
      if (document.getElementById('google-gsi-script')) return;
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '108273618293-demo.apps.googleusercontent.com',
            callback: handleCredentialResponse,
          });

          const container = document.getElementById('google-signin-btn-container');
          if (container) {
            window.google.accounts.id.renderButton(container, {
              theme: 'filled_blue',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: 320,
            });
          }
        }
      };
      document.body.appendChild(script);
    };

    loadGsiScript();
  }, [usuarios]);

  const validarEIngresar = (emailTarget: string) => {
    setErrorAcceso(null);
    const cleanEmail = emailTarget.trim().toLowerCase();

    // Buscar en la lista oficial de cfg_roles_permisos / usuarios
    const match = usuarios.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanEmail) ||
        u.usuario_id.toLowerCase() === cleanEmail
    );

    if (match) {
      setCurrentUser(match);
      const fromPath = (location.state as any)?.from?.pathname || '/inicio';
      navigate(fromPath);
    } else {
      setErrorAcceso(`Acceso no autorizado: El correo (${cleanEmail}) no está registrado en la hoja cfg_roles_permisos.`);
    }
  };

  const handleIngresarPorEmail = (e: React.FormEvent) => {
    e.preventDefault();
    validarEIngresar(emailInput);
  };

  const handleSelectQuickUser = (userId: string) => {
    const found = usuarios.find((u) => u.usuario_id === userId);
    if (found) {
      setSelectedUserId(found.usuario_id);
      if (found.email) setEmailInput(found.email);
      setErrorAcceso(null);
    }
  };

  const selectedUser = usuarios.find((u) => u.usuario_id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 select-none">
      {/* Banner de demostración superior */}
      <div className="fixed top-0 left-0 right-0 h-[32px] bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center px-4 z-50">
        MODO DEMOSTRACIÓN — Autenticación Google Identity Services & Control de Acceso cfg_roles_permisos
      </div>

      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 space-y-6 my-10">
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

        {/* Mensaje de Error de Acceso no Autorizado */}
        {errorAcceso && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-700/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Acceso no autorizado</p>
              <p className="mt-0.5 text-rose-200/90">{errorAcceso}</p>
            </div>
          </div>
        )}

        {/* Sección 1: Botón Google Identity Services (GSI) */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
            1. Iniciar Sesión con Google (GSI)
          </label>
          <div id="google-signin-btn-container" className="flex justify-center min-h-[44px]">
            <button
              onClick={() => validarEIngresar(emailInput)}
              className="w-full py-2.5 px-4 bg-white text-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Acceder con Google Account</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">o verifique correo registrado</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        {/* Sección 2: Formulario por Correo Institucional */}
        <form onSubmit={handleIngresarPorEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Correo del Usuario (cfg_roles_permisos):
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ejemplo@ecowax.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Seleccionar perfil rápido de la hoja:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => handleSelectQuickUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
            >
              {usuarios.map((u) => (
                <option key={u.usuario_id} value={u.usuario_id}>
                  {u.nombre} — {u.rol} ({u.email || u.usuario_id})
                </option>
              ))}
              <option value="UNREGISTERED">Usuario No Registrado (noautorizado@gmail.com)</option>
            </select>
          </div>

          {selectedUser && (
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Usuario Registrado:</span>
                <span className="font-bold text-slate-200">{selectedUser.nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rol Asignado:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedUser.rol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Correo Electrónico:</span>
                <span className="font-mono text-slate-300">{selectedUser.email}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#15803D] hover:bg-[#14532D] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <span>Validar e Ingresar</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 text-center space-y-1">
          <p className="flex items-center justify-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reglas de Acceso: <strong className="text-slate-300 font-mono">RB-2026.08</strong></span>
          </p>
          <p className="text-[10px] text-slate-500">
            Sesión guardada únicamente en memoria (sin cookies/localStorage).
          </p>
        </div>
      </div>
    </div>
  );
}
