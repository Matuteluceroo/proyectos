import { ReactNode } from 'react'
import './Modal.css'

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
}
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  type,
  selectedId,
  minWidth,
  maxWidth,
  isCellPhone = false,
}: ModalProps) => {
  if (!isOpen) return null

  const isMobile = window.innerWidth < 768

  if (type === 'ofTable' && !isCellPhone) {
    if (!selectedId) return null

    return (
      <div
        className="my-modal-overlay-table"
        onClick={onClose}
      >
        <div
          className="my-modal-content-table"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="my-modal-header">
            {title && <h2 className="my-modal-title">{title}</h2>}
            <button
              className="my-modal-close"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
          <div className="my-modal-body">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="my-modal-overlay"
      onClick={onClose}
      style={{
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        display: 'flex',
        minHeight: '100vh',
        paddingTop: isMobile ? '20px' : '0',
      }}
    >
      <div
        className="my-modal-content"
        style={{
          minWidth,
          maxWidth,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="my-modal-header">
          {title && <h2 className="my-modal-title">{title}</h2>}
          <button
            className="my-modal-close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="my-modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
