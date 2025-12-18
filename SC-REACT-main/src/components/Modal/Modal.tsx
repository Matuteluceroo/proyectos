import { ReactNode } from "react"
import "./Modal.css"

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
  type?: string
  selectedId?: string | number
  minWidth?: string
  maxWidth?: string
  isCellPhone?: boolean
  variant?: "default" | "preview" // 👈 NUEVO
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  minWidth = "auto",
  maxWidth = "600px",
  variant = "default",
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="my-modal-overlay" onClick={onClose}>
      <div
        className={`my-modal-content ${
          variant === "preview" ? "modal-preview-grande" : ""
        }`}
        style={{
          minWidth,
          maxWidth: variant === "preview" ? undefined : maxWidth,
          maxHeight: variant === "preview" ? undefined : "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        {title && (
          <div className="my-modal-header">
            <h2 className="my-modal-title">{title}</h2>
            <button
              className="my-modal-close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}

        {/* BODY */}
        <div className="my-modal-body">{children}</div>
      </div>
    </div>
  )
}
