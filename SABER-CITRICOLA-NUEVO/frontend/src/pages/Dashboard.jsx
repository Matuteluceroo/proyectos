// 🏠 Dashboard.jsx - Enrutador principal que redirige según el rol
import { useAuth } from '../context/AuthContext';
import DashboardAdmin from './DashboardAdmin';
import DashboardExperto from './DashboardExperto';
import DashboardOperador from './DashboardOperador';

const Dashboard = () => {
  const { user } = useAuth();

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