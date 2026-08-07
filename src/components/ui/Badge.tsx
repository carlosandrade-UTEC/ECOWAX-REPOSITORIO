import React from 'react';
import { ClaseABC, Criticidad } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verde' | 'ambar' | 'rojo' | 'azul' | 'gris' | 'abcA' | 'abcB' | 'abcC';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'gris', size = 'sm' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  let variantClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (variant) {
    case 'verde':
      variantClasses = 'bg-[#15803D] text-white border-green-800 font-bold';
      break;
    case 'ambar':
      variantClasses = 'bg-[#B45309] text-white border-amber-700 font-bold';
      break;
    case 'rojo':
      variantClasses = 'bg-[#B91C1C] text-white border-red-800 font-bold';
      break;
    case 'azul':
      variantClasses = 'bg-[#15803D] text-white border-green-800 font-bold';
      break;
    case 'abcA':
      variantClasses = 'bg-[#15803D] text-white border-green-800 font-bold shadow-2xs';
      break;
    case 'abcB':
      variantClasses = 'bg-green-50 text-green-900 border-green-200 font-bold';
      break;
    case 'abcC':
      variantClasses = 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
      break;
    default:
      variantClasses = 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  }

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${variantClasses} tracking-tight`}>
      {children}
    </span>
  );
}

export function AbcBadge({ clase }: { clase: ClaseABC }) {
  if (clase === 'A') return <Badge variant="abcA">Clase A</Badge>;
  if (clase === 'B') return <Badge variant="abcB">Clase B</Badge>;
  return <Badge variant="abcC">Clase C</Badge>;
}

export function CriticidadBadge({ criticidad }: { criticidad: Criticidad }) {
  if (criticidad === 'CRITICA') return <Badge variant="rojo">CRÍTICA</Badge>;
  if (criticidad === 'ALTA') return <Badge variant="ambar">ALTA</Badge>;
  if (criticidad === 'MEDIA') return <Badge variant="verde">MEDIA</Badge>;
  return <Badge variant="verde">BAJA</Badge>;
}

export function SemaforoBadge({ estado }: { estado: 'VERDE' | 'AMBAR' | 'ROJO' | 'SIN_DATO' }) {
  if (estado === 'VERDE') {
    return (
      <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5"></span>
        Normal / Meta
      </span>
    );
  }
  if (estado === 'AMBAR') {
    return (
      <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
        Advertencia
      </span>
    );
  }
  if (estado === 'ROJO') {
    return (
      <span className="inline-flex items-center text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>
        Fuera de Meta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
      Sin dato
    </span>
  );
}
