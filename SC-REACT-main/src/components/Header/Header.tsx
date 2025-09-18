import React, { useEffect, useState, useRef } from "react"
import porfileIco from "../../assets/porfile.svg"
import logo from "../../assets/logo.png"
import { useSocket } from "../../services/SocketContext"
import "./Header.css"
import { Link } from "react-router-dom"
import ProfileModal from "./ProfileModal"
import NotificationModal from "./NotificacionModal"
import { useObtenerImagenPerfil } from "../../services/connections/usuarios"
import Button from "../Button/Button"
import { useNavigate } from "react-router-dom"
type HeaderProps = {
  Components?: React.ComponentType<any> // Puedes usar React.FC si el componente es funcional y no tiene props específicas
  isCellPhone?: boolean
}

const Header: React.FC<HeaderProps> = ({ Components, isCellPhone = false }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false)
  const { currentUser, notificaciones } = useSocket()
  const [hasNotifications, setHasNotifications] = useState<boolean>(false)
  const [porfilePhoto, setPorfilePhoto] = useState<string>(porfileIco)
  const obtenerImagen = useObtenerImagenPerfil()
  const navigate = useNavigate()
  useEffect(() => {
    const getFotoPerfilSrc = async () => {
      try {
        console.log("getFotoPerfilSrc",currentUser.id)
        const fotoPerfil = await obtenerImagen({ idUsuario: currentUser.id })
        const src = fotoPerfil?.imagen

        if (!src) {
          setPorfilePhoto(porfileIco)
          return
        }

        if (src.startsWith("data:image")) {
          setPorfilePhoto(src)
        } else {
          setPorfilePhoto(`${src}?v=${new Date().getTime()}`)
        }
      } catch (error) {
        console.error("Error obteniendo imagen de perfil:", error)
        setPorfilePhoto(porfileIco) // Fallback seguro
      }
    }
    getFotoPerfilSrc()
  }, [])

  useEffect(() => {
    setHasNotifications(notificaciones.length > 0)
  }, [notificaciones])

  const handleCloseModal = () => setIsModalOpen(false)
  const handleOpenNotifications = () => {
    setIsNotificationOpen(true)
    setHasNotifications(false)
  }
  const handleCloseNotifications = () => setIsNotificationOpen(false)

  return (
    <div className="row headerContent align-items-center justify-content-between">
      <div className="col p-0 d-flex align-items-center">
        {Components ? <Components /> : null}
      </div>
      <div className="col-auto d-flex align-items-center gap-2">
        <Button
          text={"VER STOCK"}
          className={"btnHeader2"}
          onClick={() => navigate("/stock")}
        />
        <Link to="/reportes" title="Ir a Reportes">
          <img
            src={logo}
            alt="Sitio Externo"
            className="icono-reportes"
            title="Ir a reportes"
          />
        </Link>

        <div className="perfil-card">
          <div className="foto-con-noti">
            <img
              src={porfilePhoto}
              alt="Perfil"
              className="foto-perfil-grande"
              onClick={() => setIsModalOpen(true)}
            />
            <span
              className="noti-circulo"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenNotifications()
              }}
            >
              {notificaciones.length}
            </span>
          </div>
          <p className="nombre-usuario">
            {currentUser ? currentUser.usuario : "Usuario"}
          </p>
        </div>
      </div>

      <ProfileModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        currentUser={currentUser}
        porfilePhoto={porfilePhoto}
        notificaciones={notificaciones}
      />
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={handleCloseNotifications}
        notificaciones={notificaciones}
      />
    </div>
  )
}

export default Header
