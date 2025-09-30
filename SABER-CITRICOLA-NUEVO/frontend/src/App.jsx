import { useState } from 'react'
import './App.css'

function App() {
  // 📊 Estado del componente - información que cambia
  const [username, setUsername] = useState('admin'); // Usuario prellenado
  const [password, setPassword] = useState('123456'); // Contraseña prellenada
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ¿Está logueado?
  const [user, setUser] = useState(null); // Datos del usuario
  const [message, setMessage] = useState(''); // Mensajes para el usuario
  const [isLoading, setIsLoading] = useState(false); // ¿Está cargando?

  // 🌐 URL del backend
  const API_URL = 'http://localhost:5000';

  // 🔐 Función para hacer login
  const handleLogin = async (e) => {
    e.preventDefault(); // Evitar que la página se recargue
    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔄 Intentando login con:', { username, password });
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok) {
        // ✅ Login exitoso
        setIsLoggedIn(true);
        setUser(data.usuario);
        setMessage(`¡Bienvenido, ${data.usuario.username}! 🎉`);
      } else {
        // ❌ Error en el login
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      setMessage('Error de conexión. ¿Está el backend corriendo?');
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Función para logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setMessage('');
    setUsername('admin');
    setPassword('123456');
  };

  // 🎨 Si está logueado, mostrar dashboard
  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="dashboard">
          <h1>🍊 Saber Citrícola - Dashboard</h1>
          <div className="user-info">
            <h2>¡Bienvenido, {user.username}! 👋</h2>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
          
          <div className="actions">
            <button className="btn-secondary">📄 Ver Documentos</button>
            <button className="btn-secondary">📊 Indicadores</button>
            <button className="btn-secondary">👥 Usuarios</button>
            <button className="btn-danger" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔐 Si no está logueado, mostrar login
  return (
    <div className="app">
      <div className="login-container">
        <h1>🍊 Saber Citrícola</h1>
        <p className="subtitle">Sistema de Gestión Citrícola</p>
        
        <form onSubmit={handleLogin} className="login-form">
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
}

export default App
