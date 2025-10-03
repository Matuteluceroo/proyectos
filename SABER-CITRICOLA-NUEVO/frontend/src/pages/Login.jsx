// 🔐 Login.jsx - Página de login funcionando  
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Validación
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Usuario es requerido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        const userName = result.usuario?.nombre_completo || result.usuario?.username || 'Usuario';
        showSuccess(`¡Bienvenido ${userName}!`);
        
        // Redirigir al dashboard (simplificado ya que tenemos un dashboard que maneja roles)
        navigate('/dashboard');
      } else {
        showError(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      showError('Error de conexión. Verifica tu conexión a internet.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🍊 Saber Citrícola
          </h2>
          <p className="text-gray-600">
            Sistema de Gestión del Conocimiento
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingresa tu usuario"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingresa tu contraseña"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p className="mb-3">Usuarios de prueba:</p>
          <div className="space-y-2">
            <button 
              type="button"
              className="block w-full text-left px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              onClick={() => setFormData({ username: 'admin', password: '123456' })}
            >
              👨‍💼 Admin: admin / 123456
            </button>
            <button 
              type="button"
              className="block w-full text-left px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              onClick={() => setFormData({ username: 'experto1', password: '123456' })}
            >
              🧠 Experto: experto1 / 123456
            </button>
            <button 
              type="button"
              className="block w-full text-left px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              onClick={() => setFormData({ username: 'operador1', password: '123456' })}
            >
              👷‍♂️ Operador: operador1 / 123456
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;