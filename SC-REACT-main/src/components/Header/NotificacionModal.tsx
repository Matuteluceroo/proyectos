import Modal from "../Modal/Modal"
import "./Sidebar.css"
import porfileIco from "../../assets/porfile.svg"

const NotificationModal = ({
  isOpen,
  onClose,
  notificaciones,
}: {
  isOpen: boolean
  onClose: () => void
  notificaciones: {
    usuario: string
    mensaje: string
    fotoPerfil?: string
  }[]
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notificaciones">
      <div>
        {notificaciones.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No hay notificaciones nuevas
          </p>
        ) : (
          notificaciones.map((noti, index) => (
            <div className="noti-item" key={index}>
              <img
                src={noti.fotoPerfil || porfileIco} // usar imagen por defecto si no hay
                alt={noti.usuario}
                className="noti-avatar"
              />
              <div className="noti-content">
                <span className="noti-usuario">{noti.usuario}</span>
                <span className="noti-mensaje">{noti.mensaje}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}

export default NotificationModal
