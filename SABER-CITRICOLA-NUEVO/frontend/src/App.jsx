// 🛣️ App.jsx - Router principal de la aplicación
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import './App.css';
import TestFileUpload from './pages/TestFileUpload';

// 🛡️ Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está logueado, mostrar el componente
  return children;
};

// � Componente para redireccionar si ya está logueado
const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  // Si ya está logueado, redirigir al dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si no está logueado, mostrar el componente
  return children;
};

// 🏗️ Componente principal de la aplicación
function AppContent() {
  return (
    <div className="app">
      <Routes>
        {/* 🏠 Ruta raíz - redirige al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
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
        
        <Route 
          path="/test-upload" 
          element={<TestFileUpload />}
        />
        
        {/* �️ Rutas protegidas - Solo si está logueado */}
        <Route 
          path="/documentos" 
          element={
            <ProtectedRoute>
              <div className="page-container">
                <h1>📄 Documentos</h1>
                <p>Esta página estará disponible pronto...</p>
                <button onClick={() => window.history.back()}>
                  ← Volver
                </button>
              </div>
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

// 📝 CONCEPTOS IMPORTANTES:
// 
// 1. BrowserRouter → Habilita la navegación en la app
// 2. Routes → Contenedor de todas las rutas
// 3. Route → Define una ruta específica (path + component)
// 4. Navigate → Redirige programáticamente
// 5. ProtectedRoute → Componente personalizado para rutas que requieren login
// 6. replace → Reemplaza la entrada del historial (no permite "volver")
// 7. Providers → Envuelven la app para compartir estado global
