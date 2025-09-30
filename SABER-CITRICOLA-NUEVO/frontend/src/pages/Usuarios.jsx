// 👥 Usuarios.jsx - Página de gestión de usuarios
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Usuarios = () => {
  // 🎣 Estados
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 🎣 Hooks
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  // 📥 Obtener usuarios del backend
  const obtenerUsuarios = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/usuarios`);
      const data = await response.json();

      if (response.ok) {
        setUsuarios(data.usuarios);
      } else {
        setError(data.error || 'Error al obtener usuarios');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Cargar usuarios cuando se monta el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []); // [] significa que solo se ejecuta una vez

  return (
    <div className="usuarios-page">
      <div className="page-container">
        {/* 🧭 Header de la página */}
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            ← Volver al Dashboard
          </button>
          <h1>👥 Gestión de Usuarios</h1>
          <button className="btn-primary">
            ➕ Agregar Usuario
          </button>
        </div>

        {/* ⏳ Estado de carga */}
        {isLoading && (
          <div className="loading">
            <p>⏳ Cargando usuarios...</p>
          </div>
        )}

        {/* ❌ Estado de error */}
        {error && (
          <div className="message error">
            ❌ {error}
            <button onClick={obtenerUsuarios} className="btn-link">
              🔄 Reintentar
            </button>
          </div>
        )}

        {/* 📋 Lista de usuarios */}
        {!isLoading && !error && (
          <div className="usuarios-grid">
            {usuarios.length === 0 ? (
              <div className="empty-state">
                <p>👤 No hay usuarios registrados</p>
              </div>
            ) : (
              usuarios.map((usuario) => (
                <div key={usuario.id} className="usuario-card">
                  <div className="usuario-avatar">
                    👤
                  </div>
                  <div className="usuario-info">
                    <h3>{usuario.username}</h3>
                    <p><strong>Email:</strong> {usuario.email || 'Sin email'}</p>
                    <p><strong>ID:</strong> {usuario.id}</p>
                    <p><strong>Creado:</strong> {new Date(usuario.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="usuario-actions">
                    <button className="btn-small btn-secondary">
                      ✏️ Editar
                    </button>
                    <button className="btn-small btn-danger">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 📊 Estadísticas */}
        {usuarios.length > 0 && (
          <div className="stats">
            <p>📊 Total de usuarios: <strong>{usuarios.length}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;

// 📝 CONCEPTOS NUEVOS:
// 
// 1. useEffect() → Hook para efectos secundarios (llamadas a API)
// 2. map() → Crear una lista de componentes desde un array
// 3. key prop → Identificador único para elementos de lista
// 4. new Date() → Formatear fechas
// 5. Estados de carga/error → UX mejor para el usuario