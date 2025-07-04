import React, { useEffect } from 'react'
import { AlertProps } from './AlertProps'
import './AlertCuidado.css'

const AlertCuidado = ({
  message,
  titulo = 'Importante!',
  duration = 3000,
  setIsOpen,
  isOpen,
  onClose,
}: AlertProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false)
        if (onClose) onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, setIsOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="alert-cuidado-overlay">
      <div className="alert-cuidado-modal">
        <div className="alert-cuidado-icon">
          <span>!</span>
        </div>
        <h2 className="alert-cuidado-title">{titulo}</h2>
        <p className="alert-cuidado-message">{message}</p>
        <button
          className="alert-cuidado-btn"
          onClick={() => setIsOpen(false)}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default AlertCuidado
