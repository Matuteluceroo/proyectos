import React, { useEffect, useRef } from "react"
import "./Alert.css"          
import "./AlertCuidado.css"   
import "./AlertOptions.css"   


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
  const overlayRef = useRef(null)

  // Defaults por tipo
  const defaults = {
    success: { title: "¡Éxito!", icon: "✔", auto: duration ?? 3000 },
    warning: { title: "Importante!", icon: "!", auto: duration ?? 3000 },
    error:   { title: "Error",       icon: "✖", auto: duration ?? 3000 },
    confirm: { title: "¿Estás seguro?", icon: "?", auto: null }, // no autocierre
  }

  const cfg = defaults[type] || defaults.success
  const finalTitle = title ?? cfg.title


  useEffect(() => {
    if (!isOpen) return
    if (type === "confirm") return
    if (!cfg.auto) return
    const t = setTimeout(() => {
      setIsOpen(false)
      onClose && onClose()
    }, cfg.auto)
    return () => clearTimeout(t)
  }, [isOpen, cfg.auto, onClose, setIsOpen, type])

  if (!isOpen) return null

  
  const mapClasses = () => {
    if (type === "success") {
      return {
        overlay: "alert-success-overlay",
        modal: "alert-success-modal",
        icon: "alert-success-icon",
        title: "alert-success-title",
        message: "alert-success-message",
        footer: null,
        primaryBtn: "btn-continuar",
      }
    }
    if (type === "confirm") {
      return {
        overlay: "alert-overlay",
        modal: "alert-modal",
        icon: "alert-icon",
        title: "alert-title",
        message: "alert-message",
        footer: "alert-buttons",
        cancelBtn: "btn-cancel",
        confirmBtn: "btnConfirmar",
      }
    }

    return {
      overlay: "alert-cuidado-overlay",
      modal: "alert-cuidado-modal",
      icon: "alert-cuidado-icon",
      title: "alert-cuidado-title",
      message: "alert-cuidado-message",
      primaryBtn: "alert-cuidado-btn",
    }
  }

  const classes = mapClasses()


  const onOverlayClick = (e) => {
    if (overlayRef.current && e.target === overlayRef.current && type !== "confirm") {
      setIsOpen(false)
      onClose && onClose()
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (type === "confirm") {
          onCancel ? onCancel() : setIsOpen(false)
        } else {
          setIsOpen(false)
          onClose && onClose()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel, onClose, setIsOpen, type])

  return (
    <div
      className={classes.overlay}
      ref={overlayRef}
      onClick={onOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
    >
      <div className={classes.modal}>
        <div className={classes.icon}>{cfg.icon}</div>
        <h2 id="alert-title" className={classes.title}>
          {finalTitle}
        </h2>
        {message ? <p className={classes.message}>{message}</p> : null}

        {type === "confirm" ? (
          <div className={classes.footer}>
            <button
              className={classes.cancelBtn}
              onClick={() => (onCancel ? onCancel() : setIsOpen(false))}
            >
              {cancelText}
            </button>
            <button
              className={classes.confirmBtn}
              onClick={() => (onConfirm ? onConfirm() : setIsOpen(false))}
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <button
            className={classes.primaryBtn}
            onClick={() => {
              setIsOpen(false)
              onClose && onClose()
            }}
          >
            Continuar
          </button>
        )}
      </div>
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

// Confirm (sin autocierre)
<Alert
  type="confirm"
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  message="Esta acción no se puede deshacer."
  confirmText="Sí, borrar"
  cancelText="Cancelar"
  onConfirm={() => {  setIsOpen(false) }}
  onCancel={() => setIsOpen(false)}
/> 

*/}
