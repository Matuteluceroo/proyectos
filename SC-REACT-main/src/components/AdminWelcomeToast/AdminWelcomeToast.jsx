import React, { useState, useEffect } from 'react';
import { useSocket } from '../../services/SocketContext';
import './AdminWelcomeToast.css';

const AdminWelcomeToast = () => {
  const { currentUser } = useSocket();
  const [toasts, setToasts] = useState([]);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Solo mostrar para administradores y solo una vez por sesión
    if (currentUser?.rol === 'ADMINISTRADOR' && !hasShown) {
      const sessionKey = `admin-welcome-${currentUser.id}`;
      const alreadyShown = sessionStorage.getItem(sessionKey);
      
      if (!alreadyShown) {
        // Pequeño delay para mejor UX
        const timer = setTimeout(() => {
          showWelcomeToasts();
          sessionStorage.setItem(sessionKey, 'true');
          setHasShown(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, hasShown]);

  const showWelcomeToasts = () => {
    const welcomeToasts = [
      {
        id: 1,
        type: 'success',
        icon: '✅',
        title: 'Éxito',
        message: `¡Bienvenido ${currentUser?.nombre || currentUser?.usuario || 'Juan'} Administrador!`,
        duration: 5000
      },
      {
        id: 2,
        type: 'info',
        icon: 'ℹ️',
        title: 'Información',
        message: 'Tienes acceso completo al sistema',
        duration: 5000
      }
    ];

    // Mostrar primer toast inmediatamente
    setToasts([welcomeToasts[0]]);

    // Mostrar segundo toast con delay
    setTimeout(() => {
      setToasts(prev => [...prev, welcomeToasts[1]]);
    }, 500);

    // Auto-remover toasts después de su duración
    welcomeToasts.forEach((toast, index) => {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration + (index * 500));
    });
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.map(toast => 
      toast.id === toastId 
        ? { ...toast, removing: true }
        : toast
    ));

    // Remover completamente después de la animación
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== toastId));
    }, 300);
  };

  if (!currentUser || currentUser.rol !== 'ADMINISTRADOR' || toasts.length === 0) {
    return null;
  }

  return (
    <div className="admin-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`admin-toast admin-toast-${toast.type} ${toast.removing ? 'removing' : ''}`}
        >
          <div className="admin-toast-icon">
            {toast.icon}
          </div>
          <div className="admin-toast-content">
            <div className="admin-toast-title">
              {toast.title}
            </div>
            <div className="admin-toast-message">
              {toast.message}
            </div>
          </div>
          <button
            className="admin-toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminWelcomeToast;