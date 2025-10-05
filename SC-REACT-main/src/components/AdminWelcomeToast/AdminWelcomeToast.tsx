import React, { useState, useEffect } from 'react'
import { useSocket } from '../../services/SocketContext'
import './AdminWelcomeToast.css'

interface ToastNotification {
  id: number
  type: 'success' | 'info'
  title: string
  message: string
  duration: number
}

const AdminWelcomeToast: React.FC = () => {
  const { currentUser } = useSocket()
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  useEffect(() => {
    // Solo mostrar bienvenida una vez para administradores
    if (currentUser?.rol === 'ADMINISTRADOR' && !hasShownWelcome) {
      const welcomeNotifications: ToastNotification[] = [
        {
          id: 1,
          type: 'success',
          title: 'Éxito',
          message: `¡Bienvenido ${currentUser.nombre || currentUser.usuario} Administrador!`,
          duration: 5000
        },
        {
          id: 2,
          type: 'info',
          title: 'Información',
          message: 'Tienes acceso completo al sistema',
          duration: 5000
        }
      ]

      // Mostrar notificaciones con un pequeño delay entre ellas
      setTimeout(() => {
        setNotifications(prev => [...prev, welcomeNotifications[0]])
      }, 500)

      setTimeout(() => {
        setNotifications(prev => [...prev, welcomeNotifications[1]])
      }, 1000)

      setHasShownWelcome(true)
    }
  }, [currentUser, hasShownWelcome])

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  useEffect(() => {
    // Auto-remove notifications after their duration
    notifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)

      return () => clearTimeout(timer)
    })
  }, [notifications])

  if (notifications.length === 0) return null

  return (
    <div className="admin-toast-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`admin-toast admin-toast-${notification.type}`}
        >
          <div className="admin-toast-icon">
            {notification.type === 'success' ? '✅' : 'ℹ️'}
          </div>
          <div className="admin-toast-content">
            <div className="admin-toast-title">{notification.title}</div>
            <div className="admin-toast-message">{notification.message}</div>
          </div>
          <button
            className="admin-toast-close"
            onClick={() => removeNotification(notification.id)}
            title="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default AdminWelcomeToast