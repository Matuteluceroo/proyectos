// 🛣️ App.jsx - Router principal de la aplicación
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import ConnectionStatus from './components/ConnectionStatus/ConnectionStatus';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import DocumentList from './components/DocumentList/DocumentList';
import CreaDocumento from './pages/CreaDocumento/CreaDocumento';
import MisDocumentos from './pages/MisDocumentos/MisDocumentos';
import Biblioteca from './pages/Biblioteca/Biblioteca';
import DocumentoDetalle from './pages/DocumentoDetalle/DocumentoDetalle';
import CategoriaDetalle from './pages/CategoriaDetalle/CategoriaDetalle';
import EditarDocumento from './pages/EditarDocumento/EditarDocumento';
import CreaCapacitacion from './pages/CreaCapacitacion/CreaCapacitacion';
import Capacitaciones from './pages/Capacitaciones/Capacitaciones';
import './App.css';
import GestionContenido from './pages/GestionContenido';
import Reportes from './pages/Reportes';
import ConfiguracionAdmin from './pages/ConfiguracionAdmin';
import GuiasRapidas from './pages/GuiasRapidas';
import Procedimientos from './pages/Procedimientos';
import MiProgreso from './pages/MiProgreso';

// 🛡️ Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isInitializing } = useAuth();
  
  // Si aún está inicializando, mostrar loading
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🍊 Cargando Saber Citrícola...
      </div>
    );
  }
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está logueado, mostrar el componente
  return children;
};

// 🔄 Componente para redireccionar si ya está logueado
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isInitializing } = useAuth();
  
  // Si aún está inicializando, mostrar loading
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🍊 Cargando Saber Citrícola...
      </div>
    );
  }
  
  // Si ya está logueado, redirigir al dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si no está logueado, mostrar el componente
  return children;
};

// � Componente para la ruta raíz
const RootRedirect = () => {
  const { isLoggedIn, isInitializing } = useAuth();
  
  // Si aún está inicializando, mostrar loading
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          🍊
        </div>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Saber Citrícola
        </div>
        <div style={{
          fontSize: '16px',
          opacity: 0.9
        }}>
          Cargando el sistema...
        </div>
      </div>
    );
  }
  
  // Redirigir según estado de autenticación
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

// �🏗️ Componente principal de la aplicación
function AppContent() {
  return (
    <div className="app">
      <Routes>
        {/* 🏠 Ruta raíz - maneja la redirección inteligente */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* 🔐 Ruta pública - Solo si NO está logueado */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* 🛡️ Rutas protegidas - Solo si está logueado */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          } 
        />
        
        {/* 📄 Rutas protegidas - Solo si está logueado */}
        <Route 
          path="/documentos" 
          element={
            <ProtectedRoute>
              <DocumentList />
            </ProtectedRoute>
          } 
        />
        
        {/* ✍️ Ruta para crear documentos - Solo si está logueado */}
        <Route 
          path="/crear-documento" 
          element={
            <ProtectedRoute>
              <CreaDocumento />
            </ProtectedRoute>
          } 
        />
        
        {/* 📚 Ruta para biblioteca - Solo si está logueado */}
        <Route 
          path="/biblioteca" 
          element={
            <ProtectedRoute>
              <Biblioteca />
            </ProtectedRoute>
          } 
        />
        
        {/* 📄 Ruta para ver documento específico - Solo si está logueado */}
        <Route 
          path="/documento/:id" 
          element={
            <ProtectedRoute>
              <DocumentoDetalle />
            </ProtectedRoute>
          } 
        />
        
        {/* 📂 Ruta para ver categoría específica - Solo si está logueado */}
        <Route 
          path="/categoria/:id" 
          element={
            <ProtectedRoute>
              <CategoriaDetalle />
            </ProtectedRoute>
          } 
        />
        
        {/* ✏️ Ruta para editar documento - Solo si está logueado */}
        <Route 
          path="/editar-documento/:id" 
          element={
            <ProtectedRoute>
              <EditarDocumento />
            </ProtectedRoute>
          } 
        />
        
        {/* 🎓 Ruta para crear capacitación - Solo expertos y administradores */}
        <Route 
          path="/crear-capacitacion" 
          element={
            <ProtectedRoute>
              <CreaCapacitacion />
            </ProtectedRoute>
          } 
        />
        
        {/* 📚 Ruta para ver capacitaciones - Solo si está logueado */}
        <Route 
          path="/capacitaciones" 
          element={
            <ProtectedRoute>
              <Capacitaciones />
            </ProtectedRoute>
          } 
        />
        
        {/* 📄 Ruta para mis documentos - Solo si está logueado */}
        <Route 
          path="/mis-documentos" 
          element={
            <ProtectedRoute>
              <MisDocumentos />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/gestionar-contenido" 
          element={
            <ProtectedRoute>
              <GestionContenido />
            </ProtectedRoute>
          }
        />
        
        {/* 📊 Ruta para reportes del administrador - Solo si está logueado */}
        <Route 
          path="/reportes" 
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          } 
        />
        
        {/* ⚙️ Ruta para configuración del administrador - Solo si está logueado */}
        <Route 
          path="/configuracion" 
          element={
            <ProtectedRoute>
              <ConfiguracionAdmin />
            </ProtectedRoute>
          } 
        />
        
        {/* ⚡ Ruta para guías rápidas - Solo si está logueado */}
        <Route 
          path="/guias-rapidas" 
          element={
            <ProtectedRoute>
              <GuiasRapidas />
            </ProtectedRoute>
          } 
        />
        
        {/* 📋 Ruta para procedimientos - Solo si está logueado */}
        <Route 
          path="/procedimientos" 
          element={
            <ProtectedRoute>
              <Procedimientos />
            </ProtectedRoute>
          } 
        />
        
        {/* 📊 Ruta para mi progreso - Solo si está logueado */}
        <Route 
          path="/mi-progreso" 
          element={
            <ProtectedRoute>
              <MiProgreso />
            </ProtectedRoute>
          } 
        />
        
        {/* 🚫 Ruta 404 - Para páginas que no existen */}
        <Route 
          path="*" 
          element={
            <div className="page-container">
              <h1>🚫 Página no encontrada</h1>
              <p>La página que buscas no existe.</p>
              <button onClick={() => window.location.href = '/dashboard'}>
                🏠 Ir al Dashboard
              </button>
            </div>
          } 
        />
      </Routes>
      
      {/* 🔔 Contenedor de notificaciones - Se renderiza en toda la app */}
      <NotificationContainer />
      
      {/* 🌐 Indicador de estado de conexión offline/online */}
      <ConnectionStatus />
    </div>
  );
}

// 🌟 Componente raíz con todos los providers
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;