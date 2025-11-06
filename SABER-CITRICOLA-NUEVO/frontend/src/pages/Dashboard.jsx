// 🏠 Dashboard.jsx - Enrutador principal que redirige según el rol
import { useAuth } from '../hooks/useAuth';
import DashboardAdmin from './DashboardAdmin';
import DashboardExperto from './DashboardExperto';
import DashboardOperador from './DashboardOperador';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si no hay usuario, no renderizar nada (el AuthContext redirigirá al login)
  if (!user) {
    return null;
  }

  // Renderizar el dashboard específico según el rol
  switch (user.rol) {
    case 'administrador':
      return <DashboardAdmin />;
    
    case 'experto':
      return <DashboardExperto />;
    
    case 'operador':
      return <DashboardOperador />;
    
    default:
      // Rol no reconocido, mostrar dashboard básico
      return (
        <div className="dashboard-page">
          <div className="error-message">
            <h2>⚠️ Rol no reconocido</h2>
            <p>Tu rol: <strong>{user.rol}</strong></p>
            <p>Contacta al administrador para resolver este problema.</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;

// En la sección donde tienes el botón de Gestionar Contenido, actualiza el onClick:
<button 
    onClick={() => navigate('/gestionar-contenido')}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-left"
>
    <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">📄</span>
        <h3 className="text-lg font-semibold text-gray-800">Gestionar Contenido</h3>
    </div>
    <p className="text-gray-600 text-sm">Administrar categorías y documentos</p>
</button>