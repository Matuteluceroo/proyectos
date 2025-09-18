import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AiOutlineHome, AiOutlineBarChart } from "react-icons/ai"
import { FiClipboard, FiBox, FiDollarSign, FiSettings } from "react-icons/fi"
import { MdPeopleAlt } from "react-icons/md"
import "./MenuInformesGerenciales.css"

const menuItems = [
  {
    path: "/menu-informes-gerenciales",
    label: "Inicio",
    icon: <AiOutlineHome />,
  },
  {
    path: "/menu-informes-gerenciales/informes-conocimientos",
    label: "Conocimientos",
    icon: <FiClipboard />,
  },
  {
    path: "/menu-informes-gerenciales/informes-laboratorio",
    label: "Capacitaciones",
    icon: <AiOutlineBarChart />,
  },

]

const SidebarGerencial = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="sidebar moderno">
      <div className="sidebar-header">Informes Gerenciales</div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            <span className="text">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default SidebarGerencial
