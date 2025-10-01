// 🔔 NotificationContainer.jsx - Contenedor visual de notificaciones
import { useNotification } from '../context/NotificationContext';
import './NotificationContainer.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationToast = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'loading': return '⏳';
      default: return '📢';
    }
  };

  const getClassName = () => {
    const baseClass = 'notification-toast';
    return `${baseClass} ${baseClass}--${notification.type}`;
  };

  return (
    <div className={getClassName()}>
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-icon">{getIcon()}</span>
          <span className="notification-title">{notification.title}</span>
          <button 
            className="notification-close"
            onClick={onClose}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
        
        {notification.message && (
          <div className="notification-message">
            {notification.message}
          </div>
        )}
        
        {notification.actions && (
          <div className="notification-actions">
            {notification.actions.map((action, index) => (
              <button
                key={index}
                className={`notification-action ${action.variant || 'primary'}`}
                onClick={() => {
                  action.onClick();
                  if (action.closeOnClick !== false) {
                    onClose();
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {notification.autoHide && (
        <div 
          className="notification-progress"
          style={{
            animationDuration: `${notification.duration}ms`
          }}
        />
      )}
    </div>
  );
};

export default NotificationContainer;