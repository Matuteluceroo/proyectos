import React from "react"
import { FiPlus } from "react-icons/fi" // icono +
import "./Button.css"

type BotonAgregarProps = {
  text: string
  onClick: () => void
  icono?: React.ReactNode
  className?: string
}

const BotonAgregar = ({
  text,
  onClick,
  icono = <FiPlus />,
  className = "",
}: BotonAgregarProps) => {
  return (
    <button className={`boton-accion ${className}`} onClick={onClick}>
      {icono}
      <span>{text}</span>
    </button>
  )
}

export default BotonAgregar
