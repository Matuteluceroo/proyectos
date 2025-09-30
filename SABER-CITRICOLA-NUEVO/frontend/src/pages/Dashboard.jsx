// 🏠 Dashboard.jsx - Página principal después del login
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // 🎣 Hooks
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🚪 Manejar logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🧭 Navegar a otras páginas
  const goToUsuarios = () => navigate('/usuarios');
  const goToDocumentos = () => navigate('/documentos');

  return (
    <div className="dashboard-page">
      <div className="dashboard">
        <h1>🍊 Saber Citrícola - Dashboard</h1>
        
        <div className="user-info">
          <h2>¡Bienvenido, {user?.username}! 👋</h2>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
        
        <div className="dashboard-grid">
          {/* 📊 Tarjetas de métricas */}
          <div className="metric-card">
            <h3>👥 Usuarios</h3>
            <p className="metric-number">5</p>
            <p className="metric-label">Usuarios activos</p>
          </div>
          
          <div className="metric-card">
            <h3>📄 Documentos</h3>
            <p className="metric-number">12</p>
            <p className="metric-label">Documentos creados</p>
          </div>
          
          <div className="metric-card">
            <h3>📊 Reportes</h3>
            <p className="metric-number">8</p>
            <p className="metric-label">Reportes generados</p>
          </div>
          
          <div className="metric-card">
            <h3>🍊 Productos</h3>
            <p className="metric-number">25</p>
            <p className="metric-label">Productos citrícolas</p>
          </div>
        </div>
        
        <div className="actions">
          <button className="btn-secondary" onClick={goToUsuarios}>
            👥 Gestionar Usuarios
          </button>
          <button className="btn-secondary" onClick={goToDocumentos}>
            📄 Ver Documentos
          </button>
          <button className="btn-secondary">
            📊 Generar Reportes
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// 📝 NUEVOS CONCEPTOS:
// 
// 1. user?.username → Operador opcional (si user existe, mostrar username)
// 2. navigate('/ruta') → Cambiar de página programáticamente
// 3. Componente funcional puro → Solo recibe props y devuelve JSX
// 4. Grid layout → Organizar tarjetas en cuadrícula