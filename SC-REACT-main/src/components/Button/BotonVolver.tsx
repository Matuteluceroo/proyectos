import { FiArrowLeft } from "react-icons/fi"

type BotonVolverProps = {
  onClick: () => void
  text?: string
  collapsed?: boolean
}

const BotonVolver = ({
  onClick,
  text = "Volver",
  collapsed = false,
}: BotonVolverProps) => {
  return (
    <button onClick={onClick} className="sidebar-button" title={text}>
      <FiArrowLeft size={20} />
      {!collapsed && <span className="sidebar-text">{text}</span>}
    </button>
  )
}

export default BotonVolver
