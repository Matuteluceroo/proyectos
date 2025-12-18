import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../../services/SocketContext"
import NotificationModal from "../Header/NotificacionModal"
import ProfileModal from "../Header/ProfileModal"
import porfileIco from "../../assets/porfile.svg"
import "./Sidebar.css"
import {
  FiPackage,
  FiBarChart2,
  FiBell,
  FiBriefcase,
  FiUser,
  FiSettings,
  FiSearch,
  FiFile,
  FiEdit,
} from "react-icons/fi"
import { PiStudent } from "react-icons/pi"
import { useObtenerImagenPerfil } from "../../services/connections/usuarios"
import BotonVolver from "../Button/BotonVolver"
import BotonCerrarSesion from "../Button/BotonCerrarSesion"

interface SidebarProps {
  FooterButton?: React.ReactElement<{ collapsed?: boolean }>
  onToggleCollapse?: (collapsed: boolean) => void
  collapsed: boolean
  rutaVolver?: string
}

const Sidebar: React.FC<SidebarProps> = ({
  FooterButton,
  onToggleCollapse,
  collapsed,
  rutaVolver,
}) => {
  const { currentUser, notificaciones } = useSocket()

  const [showNoti, setShowNoti] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [fotoPerfil, setFotoPerfil] = useState<string>(porfileIco)
  const [showRoles, setShowRoles] = useState(false)
  const [showConfigOptions, setShowConfigOptions] = useState(false)
  const [activeProfileView, setActiveProfileView] = useState<string | null>(
    null
  )
  const [pantallaActual, setPantallaActual] = useState<string>(
    localStorage.getItem("pantallaActual") || "/"
  )
  const navigate = useNavigate()
  const obtenerImagen = useObtenerImagenPerfil()

  useEffect(() => {
    const getFotoPerfil = async () => {
      try {
        const result = await obtenerImagen({ idUsuario: currentUser.id })
        if (result?.imagen?.startsWith("data:image")) {
          setFotoPerfil(result.imagen)
        } else {
          setFotoPerfil(porfileIco)
        }
      } catch {
        setFotoPerfil(porfileIco)
      }
    }
    if (currentUser?.id) getFotoPerfil()
  }, [currentUser])

  const toggleSidebar = () => {
    const newState = !collapsed
    onToggleCollapse?.(newState)
  }

  const cambioPantallaActual = () => {
    const url = new URL(window.location.href)
    if (currentUser.rol === "EMPLEADO" || currentUser.rol === "EXPERTO") {
      localStorage.setItem("pantallaActual", url.pathname + url.search)
      console.log(url.pathname)
      console.log(url.search)
      setPantallaActual(url.pathname + url.search)
      return
    }
    if (
      url.pathname === "/contenido" ||
      url.pathname === "/dashboard" ||
      url.pathname === "/subir-contenido" ||
      url.pathname === "/buscador"
    )
      return
    console.log(url.pathname)
    console.log(url.search)
    localStorage.setItem("pantallaActual", url.pathname + url.search)
    setPantallaActual(url.pathname + url.search)
  }

  const navegarPrincipalRol = (rol: string) => {
    const roles: { [key: string]: string } = {
      ADMINISTRADOR: "/administracion",
      EMPLEADO: "/buscador",
      EXPERTO: "/buscador",
    }
    currentUser.rol = rol
    console.log(currentUser.rol)
    console.log(rol)
    navigate(roles[rol] || "/")
  }

  return (
    <div className={`sidebar-fixed ${collapsed ? "collapsed" : "expanded"}`}>
      <div className="sidebar-fixed-volver">
        {rutaVolver ? (
          <BotonVolver
            onClick={() => navigate(rutaVolver)}
            collapsed={collapsed}
            text="Volver"
          />
        ) : (
          <div style={{ height: "48px" }} /> // mismo alto que el botón
        )}
      </div>

      <div className="sidebar-toggle" onClick={toggleSidebar}>
        ☰ {!collapsed}
      </div>

      <div className="sidebar-logo">
        <img
          src={fotoPerfil}
          alt="Perfil"
          className={collapsed ? "profile-img" : "profile-img-collapsed"}
        />
        {!collapsed && (
          <p className="sidebar-username">
            {currentUser?.usuario || "Usuario"}
          </p>
        )}
      </div>

      <div className="sidebar-section" onMouseEnter={cambioPantallaActual}>
        <button
          onClick={() => {
            if (currentUser?.rol === "ADMINISTRADOR") {
              navigate("/administracion")
            } else if (
              currentUser?.rol === "EMPLEADO" ||
              currentUser?.rol === "EXPERTO"
            ) {
              navigate("/buscador")
            }
          }}
          title="Área de Trabajo"
        >
          <FiBriefcase size={20} style={{ color: "#000" }} />
          {!collapsed && <span className="sidebar-text">Área de Trabajo</span>}
        </button>
        <button onClick={() => setShowNoti(true)} title="Ver Notificaciones">
          <div className="noti-container">
            <FiBell size={20} style={{ color: "#000" }} />
            {notificaciones.length > 0 && (
              <span className="noti-badge-sidebar">
                {notificaciones.length}
              </span>
            )}
          </div>
          {!collapsed && <span className="sidebar-text">Notificaciones</span>}
        </button>
        {currentUser?.rol !== "EMPLEADO" && (
          <button onClick={() => navigate("/dashboard")} title="DashBoard">
            <FiBarChart2 size={20} style={{ color: "#000" }} />
            {!collapsed && <span className="sidebar-text">DashBoard</span>}
          </button>
        )}
        {currentUser?.rol !== "EMPLEADO" && (
          <button
            onClick={() => navigate("/contenido")}
            title="Crear Contenido"
          >
            <FiFile size={20} style={{ color: "#000" }} />
            {!collapsed && (
              <span className="sidebar-text">Crear Contenido</span>
            )}
          </button>
        )}
        {currentUser?.rol !== "EMPLEADO" && (
          <button
            onClick={() => navigate("/subir-contenido")}
            title="Subir Contenido"
          >
            <FiEdit size={20} style={{ color: "#000" }} />
            {!collapsed && (
              <span className="sidebar-text">Subir Contenido</span>
            )}
          </button>
        )}
        {currentUser?.rol === "ADMINISTRADOR" && (
          <button
            onClick={() => navigate("/capacitaciones")}
            title="Subir Contenido"
          >
            <PiStudent size={20} style={{ color: "#000" }} />
            {!collapsed && <span className="sidebar-text">Capacitaciones</span>}
          </button>
        )}
        <button onClick={() => navigate("/buscador")} title="Buscar Contenido">
          <FiSearch size={20} style={{ color: "#000" }} />
          {!collapsed && <span className="sidebar-text">Buscar Contenido</span>}
        </button>
        {/* <button
          onClick={() => navigate("/editar-contenido")}
          title="Editar Contenido"
        >
          <FiEdit size={20} style={{ color: "#000" }} />
          {!collapsed && <span className="sidebar-text">Editar Contenido</span>}
        </button>
        <button
          onClick={() => {
            if (collapsed) toggleSidebar();
            setShowRoles((prev) => !prev);
          }}
          title="Mis Roles"
          className="sidebar-roles-toggle"
        >
          <FiUser size={20} />
          {!collapsed && <span className="sidebar-text">Mis Roles</span>}
          {!collapsed && (
            <span
              style={{
                marginLeft: "auto",
                transform: showRoles ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              ▶
            </span>
          )}
        </button> */}

        {showRoles && !collapsed && (
          <div className="sidebar-roles-list">
            {currentUser.roles_usuario.map((rol: any) => (
              <button
                key={rol.rol}
                className="sidebar-subitem"
                onClick={() => navegarPrincipalRol(rol.rol)}
              >
                {rol.rol}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-footer-container">
        <div className="sidebar-config">
          <button
            className="sidebar-button"
            onClick={() => {
              if (collapsed) toggleSidebar()
              setShowConfigOptions((prev) => !prev)
            }}
          >
            <FiSettings size={20} />
            {!collapsed && <span className="sidebar-text">Configuración</span>}
            {!collapsed && (
              <span
                style={{
                  marginLeft: "auto",
                  transform: showConfigOptions
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                ▶
              </span>
            )}
          </button>

          {!collapsed && showConfigOptions && (
            <div className="sidebar-subitems">
              <button
                className="sidebar-subitem"
                onClick={() => {
                  setActiveProfileView("cambiarFoto")
                  setShowProfile(true)
                }}
              >
                Elegir Foto de Perfil
              </button>
              <button
                className="sidebar-subitem"
                onClick={() => {
                  setActiveProfileView("cambiarContraseña")
                  setShowProfile(true)
                }}
              >
                Cambiar Contraseña
              </button>
              <BotonCerrarSesion
                onClick={() => {
                  localStorage.clear()
                  window.location.href = "/"
                }}
                collapsed={collapsed}
              />
            </div>
          )}
        </div>
      </div>

      <NotificationModal
        isOpen={showNoti}
        onClose={() => setShowNoti(false)}
        notificaciones={notificaciones}
      />
      <ProfileModal
        isModalOpen={showProfile}
        handleCloseModal={() => {
          setShowProfile(false)
          setActiveProfileView(null)
        }}
        currentUser={currentUser}
        porfilePhoto={fotoPerfil}
        notificaciones={notificaciones}
        initialView={activeProfileView}
      />
    </div>
  )
}

export default Sidebar
