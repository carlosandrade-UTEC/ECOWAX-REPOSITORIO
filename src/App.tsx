import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';
import { Dashboard } from './pages/Dashboard';
import { DetalleKpi } from './pages/DetalleKpi';
import { InventarioCobertura } from './pages/InventarioCobertura';
import { PronosticoPage } from './pages/Pronostico';
import { AlertasPage } from './pages/AlertasPage';
import { DetalleAlertaPage } from './pages/DetalleAlertaPage';
import { RecomendacionesPage } from './pages/RecomendacionesPage';
import { DetalleRecomendacionPage } from './pages/DetalleRecomendacionPage';
import { HistorialDecisionesPage } from './pages/HistorialDecisionesPage';
import { RevisionMensualPage } from './pages/RevisionMensualPage';
import { ActaRevisionPage } from './pages/ActaRevisionPage';
import { CargaDatosPage } from './pages/CargaDatosPage';
import { ResultadoCargaPage } from './pages/ResultadoCargaPage';
import { MaestroSkusPage } from './pages/MaestroSkusPage';
import { MaestroProveedoresPage } from './pages/MaestroProveedoresPage';
import { ParametrosPage } from './pages/ParametrosPage';
import { AuditoríaPage } from './pages/AuditoriaPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { AyudaPage } from './pages/AyudaPage';

export function App() {
  const { loadInitialData } = useAppStore();

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas Principales dentro de AppShell */}
        <Route
          path="/inicio"
          element={
            <AppShell>
              <Inicio />
            </AppShell>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <Dashboard />
            </AppShell>
          }
        />
        <Route
          path="/kpi/:kpiKey"
          element={
            <AppShell>
              <DetalleKpi />
            </AppShell>
          }
        />
        <Route
          path="/inventario"
          element={
            <AppShell>
              <InventarioCobertura />
            </AppShell>
          }
        />
        <Route
          path="/pronostico"
          element={
            <AppShell>
              <PronosticoPage />
            </AppShell>
          }
        />

        {/* Alertas */}
        <Route
          path="/alertas"
          element={
            <AppShell>
              <AlertasPage />
            </AppShell>
          }
        />
        <Route
          path="/alertas/:id"
          element={
            <AppShell>
              <DetalleAlertaPage />
            </AppShell>
          }
        />

        {/* Recomendaciones */}
        <Route
          path="/recomendaciones"
          element={
            <AppShell>
              <RecomendacionesPage />
            </AppShell>
          }
        />
        <Route
          path="/recomendaciones/:id"
          element={
            <AppShell>
              <DetalleRecomendacionPage />
            </AppShell>
          }
        />

        {/* Decisiones */}
        <Route
          path="/decisiones"
          element={
            <AppShell>
              <HistorialDecisionesPage />
            </AppShell>
          }
        />

        {/* Revisión Mensual y Acta */}
        <Route
          path="/revision"
          element={
            <AppShell>
              <RevisionMensualPage />
            </AppShell>
          }
        />
        <Route
          path="/revision-mensual"
          element={
            <AppShell>
              <RevisionMensualPage />
            </AppShell>
          }
        />
        <Route
          path="/revision/:id/acta"
          element={
            <AppShell>
              <ActaRevisionPage />
            </AppShell>
          }
        />

        {/* Carga de Datos */}
        <Route
          path="/carga"
          element={
            <AppShell>
              <CargaDatosPage />
            </AppShell>
          }
        />
        <Route
          path="/carga-datos"
          element={
            <AppShell>
              <CargaDatosPage />
            </AppShell>
          }
        />
        <Route
          path="/carga/:id"
          element={
            <AppShell>
              <ResultadoCargaPage />
            </AppShell>
          }
        />

        {/* Maestros */}
        <Route
          path="/maestros/sku"
          element={
            <AppShell>
              <MaestroSkusPage />
            </AppShell>
          }
        />
        <Route
          path="/maestros/proveedores"
          element={
            <AppShell>
              <MaestroProveedoresPage />
            </AppShell>
          }
        />
        <Route path="/maestros" element={<Navigate to="/maestros/sku" replace />} />

        {/* Parámetros */}
        <Route
          path="/parametros"
          element={
            <AppShell>
              <ParametrosPage />
            </AppShell>
          }
        />

        {/* Auditoría */}
        <Route
          path="/auditoria"
          element={
            <AppShell>
              <AuditoríaPage />
            </AppShell>
          }
        />

        {/* Usuarios & Permisos */}
        <Route
          path="/usuarios"
          element={
            <AppShell>
              <UsuariosPage />
            </AppShell>
          }
        />

        {/* Ayuda & Reglas Metodológicas */}
        <Route
          path="/ayuda"
          element={
            <AppShell>
              <AyudaPage />
            </AppShell>
          }
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
