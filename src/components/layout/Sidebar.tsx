import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { ModuloApp } from '../../types';
import {
  Home,
  LayoutDashboard,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  CalendarCheck,
  History,
  UploadCloud,
  Database,
  Sliders,
  ShieldCheck,
  Users,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface MenuItem {
  id: ModuloApp;
  label: string;
  path: string;
  icon: React.ElementType;
  disabled?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function Sidebar() {
  const { getPermiso } = useAppStore();
  const location = useLocation();

  const sections: MenuSection[] = [
    {
      title: 'Estado',
      items: [
        { id: 'inicio', label: 'Inicio', path: '/inicio', icon: Home },
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { id: 'inventario', label: 'Inventario & Cobertura', path: '/inventario', icon: Package },
        { id: 'pronostico', label: 'Pronóstico', path: '/pronostico', icon: TrendingUp },
      ],
    },
    {
      title: 'Decisión',
      items: [
        { id: 'alertas', label: 'Alertas Activas', path: '/alertas', icon: AlertTriangle },
        { id: 'recomendaciones', label: 'Recomendaciones', path: '/recomendaciones', icon: CheckSquare },
        { id: 'decisiones', label: 'Historial de Decisiones', path: '/decisiones', icon: History },
        { id: 'revision_mensual', label: 'Revisión Mensual', path: '/revision-mensual', icon: CalendarCheck },
      ],
    },
    {
      title: 'Datos',
      items: [
        { id: 'carga_datos', label: 'Carga de Datos', path: '/carga-datos', icon: UploadCloud },
        { id: 'maestros', label: 'Maestros (SKUs / Prov)', path: '/maestros/sku', icon: Database },
        { id: 'parametros', label: 'Parámetros', path: '/parametros', icon: Sliders },
      ],
    },
    {
      title: 'Gobierno',
      items: [
        { id: 'auditoria', label: 'Auditoría', path: '/auditoria', icon: ShieldCheck },
        { id: 'usuarios', label: 'Usuarios & Permisos', path: '/usuarios', icon: Users },
        { id: 'inicio', label: 'Ayuda & Reglas', path: '/ayuda', icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#166534] border-r border-green-800 text-white flex flex-col fixed top-[88px] bottom-0 left-0 z-30 select-none overflow-y-auto shrink-0 shadow-lg">
      <div className="p-4 space-y-6 flex-1">
        {sections.map((section) => {
          // Filtrar ítems visibles según permisos
          const visibleItems = section.items.filter((item) => {
            if (item.disabled) return true; // los deshabilitados se muestran con etiqueta
            const permiso = getPermiso(item.id);
            return permiso !== 'NINGUNO';
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <h3 className="px-3 text-[11px] font-bold text-green-200/80 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <li key={item.label}>
                        <div
                          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-green-300/60 cursor-not-allowed opacity-75"
                          title="Funcionalidad programada para la siguiente iteración"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-4 h-4 text-green-300/60" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-900/60 text-green-200 font-semibold border border-green-700">
                            Próx.
                          </span>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-[#15803D] text-white font-bold shadow-sm'
                              : 'text-green-100 hover:bg-green-700/60 hover:text-white'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-[#14532D] rounded-2xl p-4 text-white space-y-2.5 shadow-sm border border-green-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-green-200 font-semibold uppercase tracking-wider">Reglas de Negocio</span>
            <span className="font-mono text-emerald-300 font-bold text-[10px] bg-green-900/80 px-2 py-0.5 rounded-full border border-green-700">
              RB-2026.08
            </span>
          </div>
          <div className="h-1.5 w-full bg-green-900 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-emerald-400 rounded-full"></div>
          </div>
          <p className="text-[11px] text-green-200/80 font-medium">
            ECOPROA E.I.R.L. © 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
