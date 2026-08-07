import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export function Unauthorized403() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs max-w-lg mx-auto text-center my-12 space-y-4">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-900">403 — Acceso No Autorizado</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Su perfil actual (<strong className="text-slate-800">{currentUser?.nombre}</strong> — <span className="font-mono text-rose-700 font-bold">{currentUser?.rol}</span>) no cuenta con privilegios suficientes para acceder a este módulo del sistema.
      </p>
      <div className="pt-2">
        <button
          onClick={() => navigate('/inicio')}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Resumen Ejecutivo</span>
        </button>
      </div>
    </div>
  );
}
