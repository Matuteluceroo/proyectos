// 🔐 AuthContext.jsx - Manejo global del estado de autenticación
import { createContext, useContext, useState, useEffect } from 'react';

// 📋 Crear el contexto
const AuthContext = createContext();

// 🎯 Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// 🏗️ Proveedor del contexto - Envuelve toda la aplicación
export const AuthProvider = ({ children }) => {
  // 📊 Estados globales
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🌐 URL del backend
  const API_URL = 'http://localhost:5000';

  // 🔐 Función para hacer login
  const login = async (username, password) => {
    setIsLoading(true);
    
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
        setUser(data.usuario);
        setIsLoggedIn(true);
        
        // 💾 Guardar en localStorage para persistencia
        localStorage.setItem('user', JSON.stringify(data.usuario));
        
        return { success: true, message: `¡Bienvenido, ${data.usuario.username}! 🎉` };
      } else {
        // ❌ Error en el login
        return { success: false, message: data.error };
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      return { 
        success: false, 
        message: 'Error de conexión. ¿Está el backend corriendo?' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Función para logout
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    console.log('👋 Usuario deslogueado');
  };

  // 🔄 Verificar si hay usuario guardado al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
        console.log('🔄 Usuario restaurado desde localStorage:', userData);
      } catch (error) {
        console.error('❌ Error al restaurar usuario:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 📦 Valores que se comparten en toda la aplicación
  const value = {
    // Estados
    user,
    isLoading,
    isLoggedIn,
    
    // Funciones
    login,
    logout,
    
    // Configuración
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 📝 EXPLICACIÓN:
// 
// 1. createContext() → Crea un "canal" para compartir datos
// 2. useContext() → Hook para "escuchar" ese canal desde cualquier componente
// 3. Provider → Componente que "transmite" los datos
// 4. localStorage → Guarda datos en el navegador (persiste entre sesiones)
// 5. useEffect → Se ejecuta cuando el componente se monta (carga inicial)