export type AlertProps = {
  message: string
  titulo?: string
  duration?: number
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
  onClose?: () => void
}

export type AlertOptionsProps = {
  message: string
  title?: string
  confirmText?: string
  cancelText?: string
  isOpen: boolean
  onConfirm?: () => void
  onCancel?: () => void
}
