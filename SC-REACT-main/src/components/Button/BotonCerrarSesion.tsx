import { FiLogOut } from "react-icons/fi"

type BotonCerrarSesionProps = {
  onClick: () => void
  text?: string
  collapsed?: boolean
}

const BotonCerrarSesion = ({
  onClick,
  text = "Cerrar sesión",
  collapsed = false,
}: BotonCerrarSesionProps) => {
  return (
    <button onClick={onClick} className="sidebar-button" title={text}>
      <FiLogOut size={20} />
      {!collapsed && <span className="sidebar-text">{text}</span>}
    </button>
  )
}

export default BotonCerrarSesion
