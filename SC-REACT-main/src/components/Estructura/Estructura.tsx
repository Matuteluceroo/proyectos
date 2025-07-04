import React, { ReactElement, ReactNode, useState } from "react"
import Sidebar from "../../components/Header/Sidebar"
import "./Estructura.css"

interface EstructuraProps {
  children: React.ReactNode
  rutaVolver?: string
  FooterButton?: ReactElement<{ collapsed?: boolean }>
}

const Estructura: React.FC<EstructuraProps> = ({
  children,
  rutaVolver,
  FooterButton,
}) => {
  const [collapsed, setCollapsed] = useState(true)

  const handleToggle = (nuevoEstado: boolean) => {
    setCollapsed(nuevoEstado)
  }

  return (
    <div className="estructura-con-sidebar">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggle}
        rutaVolver={rutaVolver}
        FooterButton={FooterButton}
      />

      <div
        className="estructura-content-sidebar"
        style={{
          marginLeft: collapsed ? "70px" : "250px",
          width: collapsed ? "calc(100% - 70px)" : "calc(100% - 250px)",
          transition: "margin-left 0.3s ease, width 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Estructura
