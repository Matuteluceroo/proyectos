import { Outlet } from "react-router-dom"
import "./MenuInformesGerenciales.css"
import Estructura from "../../components/Estructura/Estructura"
import SidebarGerencial from "./SidebarGerencial"

const MenuInformesGerenciales = ({}) => {
  return (
    <Estructura>
      <div className="layout-container">
        <SidebarGerencial />
        <main
          className="main-content px-4 py-3"
          style={{ background: "#1e293b" }}
        >
          <Outlet />
        </main>
      </div>
    </Estructura>
  )
}

export default MenuInformesGerenciales
