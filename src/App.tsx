import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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

        {/* Rutas Protegidas por Rol y Módulo dentro de AppShell */}
        <Route
          path="/inicio"
          element={
            <ProtectedRoute modulo="inicio">
              <AppShell>
                <Inicio />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute modulo="dashboard">
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/kpi/:kpiKey"
          element={
            <ProtectedRoute modulo="dashboard">
              <AppShell>
                <DetalleKpi />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute modulo="inventario">
              <AppShell>
                <InventarioCobertura />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pronostico"
          element={
            <ProtectedRoute modulo="pronostico">
              <AppShell>
                <PronosticoPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Alertas */}
        <Route
          path="/alertas"
          element={
            <ProtectedRoute modulo="alertas">
              <AppShell>
                <AlertasPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alertas/:id"
          element={
            <ProtectedRoute modulo="alertas">
              <AppShell>
                <DetalleAlertaPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Recomendaciones */}
        <Route
          path="/recomendaciones"
          element={
            <ProtectedRoute modulo="recomendaciones">
              <AppShell>
                <RecomendacionesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recomendaciones/:id"
          element={
            <ProtectedRoute modulo="recomendaciones">
              <AppShell>
                <DetalleRecomendacionPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Decisiones */}
        <Route
          path="/decisiones"
          element={
            <ProtectedRoute modulo="decisiones">
              <AppShell>
                <HistorialDecisionesPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Revisión Mensual y Acta */}
        <Route
          path="/revision"
          element={
            <ProtectedRoute modulo="revision_mensual">
              <AppShell>
                <RevisionMensualPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revision-mensual"
          element={
            <ProtectedRoute modulo="revision_mensual">
              <AppShell>
                <RevisionMensualPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/revision/:id/acta"
          element={
            <ProtectedRoute modulo="revision_mensual">
              <AppShell>
                <ActaRevisionPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Carga de Datos */}
        <Route
          path="/carga"
          element={
            <ProtectedRoute modulo="carga_datos">
              <AppShell>
                <CargaDatosPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/carga-datos"
          element={
            <ProtectedRoute modulo="carga_datos">
              <AppShell>
                <CargaDatosPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/carga/:id"
          element={
            <ProtectedRoute modulo="carga_datos">
              <AppShell>
                <ResultadoCargaPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Maestros */}
        <Route
          path="/maestros/sku"
          element={
            <ProtectedRoute modulo="maestros">
              <AppShell>
                <MaestroSkusPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maestros/proveedores"
          element={
            <ProtectedRoute modulo="maestros">
              <AppShell>
                <MaestroProveedoresPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route path="/maestros" element={<Navigate to="/maestros/sku" replace />} />

        {/* Parámetros */}
        <Route
          path="/parametros"
          element={
            <ProtectedRoute modulo="parametros">
              <AppShell>
                <ParametrosPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Auditoría */}
        <Route
          path="/auditoria"
          element={
            <ProtectedRoute modulo="auditoria">
              <AppShell>
                <AuditoríaPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Usuarios & Permisos */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute modulo="usuarios">
              <AppShell>
                <UsuariosPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Ayuda & Reglas Metodológicas */}
        <Route
          path="/ayuda"
          element={
            <ProtectedRoute modulo="inicio">
              <AppShell>
                <AyudaPage />
              </AppShell>
            </ProtectedRoute>
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
