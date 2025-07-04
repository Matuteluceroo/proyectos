import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import FormReutilizable from "../../components/DynamicForm/FormReutilizable"
import { Field } from "../../components/DynamicForm/FormReutilizableTypes"
import { useEnviarSugerencia } from "../../services/connections/reportes"
import { useSocket } from "../../services/SocketContext"
import Alert from "../../components/Alert/Alert"
import AlertErrores from "../../components/Alert/AlertErrores"
import "./Reportes.css"
import configImg from "../../assets/trabajo.svg"
import logo from "../../assets/logo.svg"
import Estructura from "../../components/Estructura/Estructura"

const externalLinks = {
  microsoft365: "https://www.office.com",
  copilot: "https://copilot.microsoft.com",
  sharepoint: "https://macropharmacomar.sharepoint.com",
  outlook: "https://outlook.office.com",
  internos: {
    documentos: "https://macropharmacomar.sharepoint.com/sites/documentos",
    teams: "https://teams.microsoft.com",
  },
}

const camposForm: Field[] = [
  {
    nombreCampo: "nombre",
    labelText: "Nombre",
    placeholder: "Tu nombre (opcional)",
    type: "text",
  },
  {
    nombreCampo: "mensaje",
    labelText: "Mensaje",
    type: "text",
    placeholder: "Escribí tu mensaje aquí *",
  },
]

const Reportes: React.FC = () => {
  const [formData, setFormData] = useState<{
    nombre?: string
    mensaje?: string
  }>({})
  const [alerta, setAlerta] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState("")
  const [tituloAlerta, setTituloAlerta] = useState("")
  const enviarSugerencia = useEnviarSugerencia()
  const { currentUser } = useSocket()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [submenuPowerBI, setSubmenuPowerBI] = useState(false)

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto)
    setSubmenuPowerBI(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      nombreUsuario: currentUser.nombre,
      nombre: formData.nombre,
      mensaje: formData.mensaje,
    }
    try {
      await enviarSugerencia(payload)
      setAlerta(true)
      setTituloAlerta("GRACIAS")
      setMsgAlerta("¡Gracias por tu sugerencia!")
      setFormData({ nombre: "", mensaje: "" })
    } catch {
      setAlertaError(true)
      setTituloAlerta("ERROR")
      setMsgAlerta("¡No se pudo enviar la sugerencia!")
    }
  }

  return (
    <Estructura>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <header className="navbar-dropdown">
          <div className="logo-navbar">
            <img src={logo} alt="Configuración" className="logo" />
          </div>
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>

          <nav>
            <ul className={`nav-items ${menuAbierto ? "activo" : ""}`}>
              <li
                className={`nav-item dropdown ${
                  submenuPowerBI ? "activo" : ""
                }`}
              >
                <span onClick={() => setSubmenuPowerBI((prev) => !prev)}>
                  Power BI
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <a
                      href="/reportes/BIDMASTER"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      BidMaster
                    </a>
                  </li>
                  <li>
                    <a
                      href="/reportes/informe_comparativos_completos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Participación Licitaciones
                    </a>
                  </li>
                  <li>
                    <a
                      href="/reportes/Estado_Carga_Comparativos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Estado Carga Comparativos
                    </a>
                  </li>
                  <li>
                    <a
                      href="/reportes/informe_ventas_cobros"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ventas, Cobros, Pedidos
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link to="/comparativos_admin">Comparativos</Link>
              </li>
              <li className="nav-item dropdown">
                <a href={externalLinks.internos.documentos} target="_blank">
                  Documentos
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href={externalLinks.internos.teams} target="_blank">
                  Teams
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href={externalLinks.microsoft365} target="_blank">
                  Microsoft 365
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href={externalLinks.copilot} target="_blank">
                  Copilot IA
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href={externalLinks.sharepoint} target="_blank">
                  SharePoint
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href={externalLinks.outlook} target="_blank">
                  Outlook
                </a>
              </li>
              <li className="nav-item dropdown">
                <a href="/" target="_blank" rel="noopener noreferrer">
                  KTC App
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <div className="fondo-hero">
          <div className="contenedor-hero">
            <div className="contenido-texto">
              <h1>
                <span className="azul"> Simplificá tu</span> <br />
                <span className="rosa">trabajo</span>
              </h1>
              <p className="texto-descriptivo">
                Bienvenido al centro de reportes de Macropharma. Accedé a tus
                herramientas, reportes y sugerencias desde un solo lugar.
              </p>

              <div className="formulario-sugerencia-hero">
                <h4>¿Quieres agregar algo?</h4>
                <h5>¡Enviános tu sugerencia!</h5>
                <FormReutilizable
                  fields={camposForm}
                  values={formData}
                  onChangeForm={(valores) => setFormData(valores)}
                />
                <div className="boton-formulario-container">
                  <button className="btnFuncTabla" onClick={handleSubmit}>
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            <img src={configImg} alt="Configuración" className="imagen-hero" />
          </div>
        </div>
      </div>

      <AlertErrores
        setIsOpen={setAlertaError}
        isOpen={alertaError}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
      <Alert
        titulo={tituloAlerta}
        message={msgAlerta}
        duration={5000}
        setIsOpen={setAlerta}
        isOpen={alerta}
      />
    </Estructura>
  )
}

export default Reportes
