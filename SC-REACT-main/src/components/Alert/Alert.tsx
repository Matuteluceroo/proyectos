import React, { useEffect } from "react"
import { AlertProps } from "./AlertProps"
import "./Alert.css"

const Alert = ({
  message,
  titulo = "¡Éxito!",
  duration = 50000,
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
    <div className="alert-success-overlay">
      <div className="alert-success-modal">
        <div className="alert-success-icon">✔</div>
        <h2 className="alert-success-title">{titulo}</h2>
        <p className="alert-success-message">{message}</p>
        <button className="btn-continuar" onClick={() => setIsOpen(false)}>
          Continuar
        </button>
      </div>
    </div>
  )
}

export default Alert
