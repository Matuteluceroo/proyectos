// 🔐 AuthContext.jsx - Manejo global del estado de autenticación
import { createContext, useContext, useState, useEffect } from 'react';
import { SERVER_CONFIG } from '../config/app.config.js';

// 📋 Crear el contexto
const AuthContext = createContext();

// 🏗️ Proveedor del contexto - Envuelve toda la aplicación
export const AuthProvider = ({ children }) => {
  // 📊 Estados globales
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 🌐 URL del backend
  const API_URL = SERVER_CONFIG.baseUrl;

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
        credentials: 'include', // 🍪 Incluir cookies
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok && data.usuario) {
        // ✅ Login exitoso
        console.log('👤 Datos del usuario:', data.usuario);
        setUser(data.usuario);
        setIsLoggedIn(true);
        
        // 💾 Guardar en localStorage para compatibilidad (opcional)
        localStorage.setItem('user', JSON.stringify(data.usuario));
        
        console.log('✅ Usuario logueado:', data.usuario);
        
        return { 
          success: true, 
          message: `¡Bienvenido, ${data.usuario.nombre_completo || data.usuario.username}! 🎉`,
          usuario: data.usuario
        };
      } else {
        // ❌ Error en el login
        console.log('❌ Error en respuesta:', data);
        return { success: false, message: data.error || 'Error desconocido' };
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
  const logout = async () => {
    try {
      // 🍪 Limpiar cookie del servidor
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('⚠️ Error al limpiar cookie del servidor:', error);
    }
    
    // Limpiar estado local
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    console.log('👋 Usuario deslogueado');
  };

  // 🔄 Verificar si hay usuario guardado al cargar la app
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 Inicializando autenticación...');
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
      setIsInitializing(false); // Marcar como completada la inicialización
      console.log('✅ Inicialización de autenticación completada');
    };

    initializeAuth();
  }, []);

  // 📦 Valores que se comparten en toda la aplicación
  const value = {
    // Estados
    user,
    isLoading,
    isLoggedIn,
    isInitializing,
    
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