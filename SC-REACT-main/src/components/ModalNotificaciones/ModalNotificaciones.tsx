import { useState } from 'react'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import { useSocket } from '../../services/SocketContext'

const ModalNotificaciones = ({
  isOpen,
  onClose,
  receptorName,
}: {
  isOpen: boolean
  onClose: () => void
  receptorName: string
}) => {
  const { enviarNotificacion, currentUser } = useSocket()
  const [mensaje, setMensaje] = useState('')

  const handleClick = () => {
    if (!mensaje.trim()) return // opcional: no enviar mensajes vacíos
    enviarNotificacion(receptorName, {
      usuario: currentUser.usuario,
      mensaje,
    })
    setMensaje('') // opcional: limpiar tras enviar
    onClose() // opcional: cerrar el modal
  }

  return (
    <Modal
      title="Enviar notificación"
      isOpen={isOpen}
      onClose={onClose}
    >
      <input
        type="text"
        value={mensaje} // 2) bind al estado
        onChange={(e) => setMensaje(e.target.value)} // 3) actualiza estado
        placeholder="Escribe tu mensaje..."
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      <Button
        text={'ENVIAR'}
        onClick={handleClick}
      />
    </Modal>
  )
}

export default ModalNotificaciones
