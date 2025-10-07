// 🔔 NotificationContext.jsx - Sistema de notificaciones global
import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // 🆔 Generar ID único para cada notificación
  const generateId = () => Date.now() + Math.random();

  // ➕ Agregar notificación
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const newNotification = {
      id,
      timestamp: new Date(),
      autoHide: true,
      duration: 5000, // 5 segundos por defecto
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-eliminar si está habilitado
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // ❌ Eliminar notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // 🗑️ Limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 🎯 Métodos de conveniencia para diferentes tipos
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Éxito',
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Error',
      message,
      autoHide: false, // Los errores requieren acción manual
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Advertencia',
      message,
      duration: 7000, // Más tiempo para advertencias
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Información',
      message,
      ...options
    });
  }, [addNotification]);

  // 📤 Notificaciones para acciones comunes
  const showLoading = useCallback((message = 'Cargando...', options = {}) => {
    return addNotification({
      type: 'loading',
      title: 'Procesando',
      message,
      autoHide: false,
      ...options
    });
  }, [addNotification]);

  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates }
          : notification
      )
    );
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;