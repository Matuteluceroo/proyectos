import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import FormReutilizable from '../DynamicForm/FormReutilizable'
import { useCambiarPassword } from '../../services/connections/usuarios'
import CameraCapture from '../CameraCapture/CameraCapture'
import {
  useEnviarImagenAlBackend,
  useObtenerImagenPerfil,
  useEliminarFotoPerfil,
} from '../../services/connections/usuarios'
import porfileIco from '../../assets/porfile.svg'
import Alert from '../../components/Alert/Alert'
import AlertOptions from '../../components/Alert/AlertOptions'
import AlertaCuidado from '../../components/Alert/AlertCuidado'
import AlertErrores from '../Alert/AlertErrores'
import './Header.css'

type Role = {
  rol: string
}

type User = {
  id: string
  usuario: string
  roles_usuario: Role[]
  rol: string // Puede ser necesario para navegar por el sistema
}

type ProfileModalProps = {
  isModalOpen: boolean
  handleCloseModal: () => void
  currentUser: User
  porfilePhoto: string
  notificaciones: { usuario: string; mensaje: string }[]
  initialView?: string | null
}

type Field = {
  nombreCampo: string
  labelText: string
  type:
    | 'number'
    | 'password'
    | 'text'
    | 'checkbox'
    | 'select'
    | 'radio'
    | 'textarea' // Tipamos `type` con los valores válidos
  placeholder: string
}

const ProfileModal = ({
  isModalOpen,
  handleCloseModal,
  currentUser,
  porfilePhoto,
  notificaciones,
  initialView,
}: ProfileModalProps) => {
  const [activeView, setActiveView] = useState<string>('menu')
  const [modalTitle, setModalTitle] = useState<string>('MI PERFIL')
  const cambiarPassword = useCambiarPassword()
  const navigate = useNavigate()
  const formRef = useRef<any>(null)
  const enviarImagen = useEnviarImagenAlBackend()
  const obtenerFoto = useObtenerImagenPerfil()
  const eliminarFotoPerfil = useEliminarFotoPerfil()
  const [alerta, setAlerta] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [alertaOptionsOpen, setAlertaOptionsOpen] = useState(false)
  const [msgAlertaOptions, setMsgAlertaOptions] = useState('')
  const [tituloAlertaOptions, setTituloAlertaOptions] = useState('')

  useEffect(() => {
    if (isModalOpen) {
      if (initialView) {
        setActiveView(initialView)
        setModalTitle(
          initialView === 'cambiarFoto' ? 'CAMBIAR FOTO' : 'Cambiar contraseña'
        )
      } else {
        setActiveView('menu')
        setModalTitle('MI PERFIL')
      }
    }
  }, [isModalOpen, initialView])

  const camposPassword: Field[] = [
    {
      nombreCampo: 'currentPassword',
      labelText: 'Contraseña actual',
      type: 'password',
      placeholder: 'Ingrese su contraseña actual',
    },
    {
      nombreCampo: 'newPassword',
      labelText: 'Nueva contraseña',
      type: 'password',
      placeholder: 'Ingrese su nueva contraseña',
    },
    {
      nombreCampo: 'confirmPassword',
      labelText: 'Confirmar nueva contraseña',
      type: 'password',
      placeholder: 'Repita la nueva contraseña',
    },
  ]

  const handleViewChange = (view: string, title: string) => {
    setActiveView(view)
    setModalTitle(title)
  }

  const cambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault()
    const datos = formRef.current.getFormData()

    if (!datos.newPassword) {
      setAlertaCuidado(true)
      setTituloAlerta('ALERTA')
      setMsgAlerta('¡Ingresar una contraseña válida!')
      return
    }

    if (datos.newPassword !== datos.confirmPassword) {
      setAlertaCuidado(true)
      setTituloAlerta('ALERTA')
      setMsgAlerta('La nueva contraseña y su confirmación no coinciden.')
      return
    }

    const cambio = await cambiarPassword({
      idUsuario: Number(currentUser.id),
      userName: currentUser.usuario,
      password: datos.currentPassword,
      newPassword: datos.newPassword,
    })

    if (!cambio) {
      setAlertaError(true)
      setTituloAlerta('ALERTA')
      setMsgAlerta('CONTRASEÑA INCORRECTA')
      return
    }
    setAlerta(true)
    setTituloAlerta('EXITO')
    setMsgAlerta('CONTRASEÑA ACTUALIZADA')
    handleCloseModal()
  }

  const navegarPrincipalRol = (rol: string) => {
    const roles: { [key: string]: string } = {
      LICITADOR: '/menu_licitaciones',
      'LIDER-LICITADOR': '/menu_licitaciones',
      COMPRADOR: '/cotizaciones',
      'ADM-KAIROS': '/administrador_kairos',
      ADMINISTRADOR: '/administracion',
      COBRADOR: '/cobranzas',
      ADMCOBRANZAS: '/cobranzas',
      GERENTE: '/menu-informes-gerenciales',
      ADMLOGISTICA: '/logistica/lista-partes',
      LOGISTICA: '/logistica/lista-partes',
      'ADMIN-COMPARATIVOS': '/comparativos_admin',
      TESTER: '/testing',
    }
    currentUser.rol = rol
    navigate(roles[rol] || '/')
  }

  const RolesUsuario = () => {
    let listaRoles = currentUser?.roles_usuario

    const sortedData = listaRoles.sort((a, b) => {
      if (a.rol < b.rol) return -1
      if (a.rol > b.rol) return 1
      return 0
    })
    return sortedData?.map((rol, index) => (
      <Button
        key={index}
        onClick={() => navegarPrincipalRol(rol.rol)}
        className="btn-light-option"
        text={rol.rol}
      />
    ))
  }

  const handleConfirmarFoto = async (imageData: string) => {
    try {
      await enviarImagen({
        base64Image: imageData,
        idUsuario: currentUser.id,
      })

      const nuevaFoto = await obtenerFoto({ idUsuario: currentUser.id })

      const userActualizado = {
        ...currentUser,
        fotoPerfil: nuevaFoto.imagen,
      }

      localStorage.setItem('currentUser', JSON.stringify(userActualizado))
      handleCloseModal()
      setTituloAlerta('¡Éxito!')
      setMsgAlerta('Foto actualizada correctamente.')
      setAlerta(true)
      window.location.reload()
    } catch (error: any) {
      setTituloAlerta('Error')
      setMsgAlerta('Error al subir la foto.')
      setAlertaError(true)
    }
  }

  const handleOpenConfirmEliminarFoto = () => {
    setTituloAlertaOptions('Confirmación')
    setMsgAlertaOptions(
      '¿Estás seguro de que querés eliminar tu foto de perfil?'
    )
    setAlertaOptionsOpen(true)
  }
  const handleConfirm = async () => {
    try {
      await eliminarFotoPerfil({ idUsuario: currentUser.id })

      const userActualizado = {
        ...currentUser,
        fotoPerfil: '',
      }

      localStorage.setItem('currentUser', JSON.stringify(userActualizado))
      setTituloAlerta('¡Éxito!')
      setMsgAlerta('Foto eliminada correctamente.')
      setAlerta(true)
      handleCloseModal()
      window.location.reload()
    } catch (error: any) {
      setTituloAlerta('Error')
      setMsgAlerta('Error al eliminar la foto.')
      setAlertaError(true)
      console.error('ERROR:', error.message)
    } finally {
      setAlertaOptionsOpen(false)
    }
  }

  const handleCancel = () => {
    setAlertaOptionsOpen(false)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'cambiarContraseña':
        return (
          <div id="changePasswordContainer">
            <FormReutilizable
              ref={formRef}
              fields={camposPassword}
            />
            <button
              type="button"
              className="btnHeader2"
              onClick={cambiarContrasena}
            >
              Cambiar contraseña
            </button>
            <br />
          </div>
        )

      case 'misRoles':
        return (
          <div>
            <div className="roles">
              <RolesUsuario />
            </div>
            <br />
          </div>
        )
      case 'cambiarFoto':
        return (
          <div className="d-flex flex-column align-items-center gap-3 w-100">
            <CameraCapture
              onConfirm={handleConfirmarFoto}
              resizeOptions={{
                maxWidth: 300,
                maxHeight: 300,
                quality: 0.75,
              }}
            />

            <div className="d-flex justify-content-between w-100 px-4 mt-4">
              {porfilePhoto !== porfileIco && (
                <div>
                  <Button
                    className="btnEliminar"
                    text="ELIMINAR FOTO"
                    onClick={handleOpenConfirmEliminarFoto}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 'notificaciones':
        return (
          <div className="d-flex flex-column align-items-center gap-3 w-100">
            <div>
              {notificaciones.length === 0 ? (
                <p>NO HAY NOTIFICACIONES</p>
              ) : (
                notificaciones.map((noti, index) => (
                  <p key={index}>
                    <b>{noti.usuario + ': '}</b> {noti.mensaje}
                  </p>
                ))
              )}
            </div>
            <div className="d-flex justify-content-between w-100 px-4 mt-4">
              <Button
                className="btnHeader2"
                text="VOLVER"
                onClick={() => handleViewChange('menu', 'MI PERFIL')}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="modal-perfil-container">
            <Button
              text="Cambiar contraseña"
              className="btn-light-option"
              onClick={() =>
                handleViewChange('cambiarContraseña', 'Cambiar contraseña')
              }
            />
            <Button
              text="Elegir Foto de Perfil"
              className="btn-light-option"
              onClick={() => handleViewChange('cambiarFoto', 'CAMBIAR FOTO')}
            />
          </div>
        )
    }
  }

  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        minWidth="370px"
        maxWidth="400px"
      >
        <div className="profile-card-light">
          <img
            src={porfilePhoto}
            alt="Foto de perfil"
            className="foto-perfil-light"
          />
          <h2>{currentUser.usuario}</h2>
          {renderContent()}
        </div>
      </Modal>

      <AlertOptions
        isOpen={alertaOptionsOpen}
        title={tituloAlertaOptions}
        message={msgAlertaOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <AlertaCuidado
        setIsOpen={setAlertaCuidado}
        isOpen={alertaCuidado}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
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
    </div>
  )
}

export default ProfileModal
