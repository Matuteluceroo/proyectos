// 🔐 Login.jsx - Página de login separada
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // 🎣 Hooks para el estado local
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [message, setMessage] = useState('');

  // 🎣 Hooks de React Router y Auth Context
  const navigate = useNavigate(); // Para navegar a otras páginas
  const { login, isLoading } = useAuth(); // Del contexto global

  // 🔐 Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Usar la función login del contexto
    const result = await login(username, password);
    
    if (result.success) {
      setMessage(result.message);
      // 🚀 Navegar al dashboard después del login exitoso
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🍊 Saber Citrícola</h1>
        <p className="subtitle">Sistema de Gestión Citrícola</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">👤 Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">🔐 Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Iniciando...' : '🚀 Iniciar Sesión'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        
        <div className="help">
          <p><strong>Datos de prueba:</strong></p>
          <p>Usuario: admin | Contraseña: 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// 📝 CONCEPTOS NUEVOS:
// 
// 1. useNavigate() → Hook para cambiar de página programáticamente
// 2. useAuth() → Nuestro hook personalizado del contexto
// 3. setTimeout() → Esperar un poco antes de navegar (UX mejor)
// 4. export default → Exportar el componente para usarlo en otras partes