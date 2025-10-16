import React, { useEffect } from "react"
import "./Alert.css"


const Alert = ({
  type = "success",
  isOpen,
  setIsOpen,
  title,
  message,
  duration,
  onClose,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) => {
  // Defaults por tipo
  const defaults = {
    success: { title: "¡Éxito!", icon: "✔", auto: duration ?? 3000 },
    warning: { title: "Importante", icon: "!", auto: duration ?? 4000 },
    error:   { title: "Error", icon: "✖", auto: duration ?? 4000 },
    confirm: { title: "¿Estás seguro?", icon: "?", auto: null }, // no autocierre
  }

  const cfg = defaults[type] || defaults.success
  const finalTitle = title ?? cfg.title

  useEffect(() => {
    if (!isOpen) return
    if (type === "confirm" || !cfg.auto) return

    const t = setTimeout(() => {
      setIsOpen(false)
      onClose && onClose()
    }, cfg.auto)

    return () => clearTimeout(t)
  }, [isOpen, cfg.auto, onClose, setIsOpen, type])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false)
        if (type === "confirm") {
          onCancel ? onCancel() : onClose && onClose()
        } else {
          onClose && onClose()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onCancel, onClose, setIsOpen, type])

  if (!isOpen) return null

  const isConfirm = type === "confirm"

  return (
    <div className={`alert-toast ${type} ${isConfirm ? 'confirm' : ''}`} role="alert">
      <div className="alert-icon">{cfg.icon}</div>
      <div className="alert-content">
        <h3 className="alert-title">{finalTitle}</h3>
        {message && <p className="alert-message">{message}</p>}
      </div>
      {isConfirm ? (
        <div className="alert-buttons">
          <button
            className="btn-confirm"
            onClick={() => {
              onConfirm && onConfirm()
              setIsOpen(false)
            }}
          >
            {confirmText}
          </button>
          <button
            className="btn-cancel"
            onClick={() => {
              onCancel && onCancel()
              setIsOpen(false)
            }}
          >
            {cancelText}
          </button>
        </div>
      ) : (
        <button className="alert-close" onClick={() => setIsOpen(false)}>
          &times;
        </button>
      )}
    </div>
  )
}

export default Alert
// Como se usa

// Success (autocierra)
{/*
  
  <Alert
  type="success"
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  message="Guardado correctamente."
/>

// Warning (autocierra o con duración custom)
<Alert
  type="warning"
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  message="Faltan campos obligatorios."
  duration={5000}
/>

// Error (autocierra)
<Alert
  type="error"
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  title="No pudimos guardar"
  message="Revisá tu conexión e intentá de nuevo."
/>

// Confirm (sin autocierre) - Ahora se muestra como un toast especial
<Alert
  type="confirm"
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  message="Esta acción no se puede deshacer."
  confirmText="Sí, borrar"
  cancelText="Cancelar"
  onConfirm={() => { console.log('Confirmado') }}
  onCancel={() => console.log('Cancelado')}
/> 

*/