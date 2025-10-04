import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  MouseEvent,
} from 'react'
import './Administracion.css'
import Button from '../../components/Button/Button'
import {
  useObtenerUsuarios,
  useObtenerUsuariosEnLinea,
  useAgregarUsuario,
  useModificarUsuario,
  useEliminarUsuario,
  useRestartPassword,
  useAgregarRolUsuario,
  useEliminarRolUsuario,
} from '../../services/connections/usuarios.js'
import editarIco from '../../assets/edit.svg'
import eliminarIco from '../../assets/trash.svg'
import messageIco from '../../assets/message.svg'
import Deleteable from '../../components/DeleteableElement/Deleteable'
import Estructura from '../../components/Estructura/Estructura'
import VirtualizedTable from '../../components/VirtualizedTable/VirtualizedTable'
import FormReutilizable from '../../components/DynamicForm/FormReutilizable'
import type { FormReutilizableRef } from '../../components/DynamicForm/FormReutilizableTypes'
import Alert from '../../components/Alert/Alert'
import AlertErrores from '../../components/Alert/AlertErrores'
import AlertCuidado from '../../components/Alert/AlertCuidado'
import { Rol } from '../../services/connections/usuarios.js'
import { useNavigate } from 'react-router-dom'
import ModalNotificaciones from '../../components/ModalNotificaciones/ModalNotificaciones'

const LISTA_ROLES: Rol[] = [
  'LICITADOR',
  'LIDER-LICITADOR',
  'COMPRADOR',
  'ADMLOGISTICA',
  'LOGISTICA',
  'ADM-KAIROS',
  'COBRADOR',
  'ADMCOBRANZAS',
  'ADMINISTRADOR',
  'GERENTE',
  'TESTER',
  'ADMIN-COMPARATIVOS',
  'SIN_ROL',
]

type UsuarioType = {
  id: number
  userName: string
  rol: Rol
  nombre: string
  idZona: string
  otros: string
  online?: boolean
  rolesDeUsuario?: { rol: Rol; idUsuario: number }[]
}

type FormData = {
  id: number | null
  userName: string
  rol: Rol
  nombre: string
  idZona: string
  otros: string
}

const Administracion: React.FC = () => {
  const obtenerUsuarios = useObtenerUsuarios()
  const obtenerUsuariosEnLinea = useObtenerUsuariosEnLinea()
  const agregarUsuario = useAgregarUsuario()
  const modificarUsuario = useModificarUsuario()
  const eliminarUsuario = useEliminarUsuario()
  const restartPassword = useRestartPassword()
  const agregarRolUsuario = useAgregarRolUsuario()
  const eliminarRolUsuario = useEliminarRolUsuario()
  const navigate = useNavigate()
  const formRef = useRef<FormReutilizableRef>(null)
  const [usuarios, setUsuarios] = useState<UsuarioType[]>([])
  const [hiddenBtnsOnEdit, setHiddenBtnOnEdit] = useState(true)
  const [rolesDeUsuario, setRolesDeUsuario] = useState<
    { rol: Rol; idUsuario: number }[]
  >([])

  const [alerta, setAlerta] = useState({
    isOpen: false,
    titulo: '',
    message: '',
  })
  const [alertaError, setAlertaError] = useState({
    isOpen: false,
    titulo: '',
    message: '',
  })
  const [alertaCuidado, setAlertaCuidado] = useState({
    isOpen: false,
    titulo: '',
    message: '',
  })
  const [modalNotificacionOpen, setModalNotificacionOpen] = useState({
    isOpen: false,
    receptorName: '',
  })

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<Rol | 'TODOS'>('TODOS')
  const [filterOnline, setFilterOnline] = useState<'TODOS' | 'ONLINE' | 'OFFLINE'>('TODOS')
  
  // Estados para validaciones
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    id: null,
    userName: '',
    rol: 'SIN_ROL',
    nombre: '',
    idZona: '',
    otros: '',
  })

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true)
      const dataUsuarios = await obtenerUsuarios()
      const usuariosEnLinea = await obtenerUsuariosEnLinea()

      dataUsuarios.forEach((user: UsuarioType) => {
        if (
          usuariosEnLinea.some(
            (onLine: any) => user.userName === onLine.userData.usuario
          )
        ) {
          user.online = true
        }
      })

      setUsuarios(dataUsuarios)
    } catch (error) {
      setAlertaError({
        isOpen: true,
        titulo: 'Error',
        message: 'Error al cargar los usuarios',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const crearUsuario = async () => {
    const errores = validarFormulario(formData)
    setValidationErrors(errores)
    
    if (Object.keys(errores).length > 0) {
      setAlertaCuidado({
        isOpen: true,
        titulo: 'Errores de validación',
        message: 'Por favor corrige los errores en el formulario',
      })
      return
    }

    setIsSubmitting(true)
    if (!formRef.current) return

    const datosForm = formRef.current.getFormData()

    try {
      const val = await agregarUsuario({
        userName: datosForm.userName ?? '',
        nombre: datosForm.nombre ?? '',
        idZona: datosForm.idZona ?? '',
        otros: datosForm.otros ?? '',
        rol: formData.rol,
      })

      if (!val) {
        setAlertaError({
          isOpen: true,
          titulo: 'Error',
          message: 'Hubo un error al agregar el usuario',
        })
        return
      }
      setAlerta({
        isOpen: true,
        titulo: '¡Éxito!',
        message: 'Usuario agregado exitosamente',
      })
      cancelarEdicion()
      cargarUsuarios()
    } catch {
      setAlertaError({
        isOpen: true,
        titulo: 'Error',
        message: 'Hubo un error al agregar el usuario',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const editarUsuario = async () => {
    const errores = validarFormulario(formData)
    setValidationErrors(errores)
    
    if (Object.keys(errores).length > 0) {
      setAlertaCuidado({
        isOpen: true,
        titulo: 'Errores de validación',
        message: 'Por favor corrige los errores en el formulario',
      })
      return
    }

    const currentID = formData.id
    if (currentID && formRef.current) {
      setIsSubmitting(true)
      const dataParaEditar = formRef.current.getFormData()
      const datosCompletos = {
        userName: dataParaEditar.userName ?? '',
        nombre: dataParaEditar.nombre ?? '',
        idZona: dataParaEditar.idZona ?? '',
        otros: dataParaEditar.otros ?? '',
        rol: formData.rol,
        id: currentID,
      }

      try {
        await modificarUsuario({
          idUsuario: currentID,
          datos: datosCompletos,
        })

        setAlerta({
          isOpen: true,
          titulo: '¡Éxito!',
          message: 'USUARIO MODIFICADO',
        })
        await cargarUsuarios()
      } catch {
        setAlertaError({
          isOpen: true,
          titulo: 'Error',
          message: 'ERROR AL MODIFICAR EL USUARIO',
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setAlertaError({
        isOpen: true,
        titulo: 'Error',
        message: 'ERROR AL MODIFICAR EL USUARIO',
      })
    }
  }

  const cancelarEdicion = () => {
    setHiddenBtnOnEdit(true)
    setValidationErrors({})
    const defaultForm: FormData = {
      id: null,
      userName: '',
      rol: 'LICITADOR',
      nombre: '',
      idZona: '',
      otros: '',
    }
    setFormData(defaultForm)
    formRef.current?.setAllFields(defaultForm)
  }

  // Función de validación
  const validarFormulario = (datos: FormData): {[key: string]: string} => {
    const errores: {[key: string]: string} = {}
    
    if (!datos.userName.trim()) {
      errores.userName = 'El nombre de usuario es obligatorio'
    } else if (datos.userName.length < 3) {
      errores.userName = 'El usuario debe tener al menos 3 caracteres'
    } else if (!/^[a-zA-Z0-9_]+$/.test(datos.userName)) {
      errores.userName = 'Solo se permiten letras, números y guiones bajos'
    }
    
    if (!datos.nombre.trim()) {
      errores.nombre = 'El nombre completo es obligatorio'
    } else if (datos.nombre.length < 2) {
      errores.nombre = 'El nombre debe tener al menos 2 caracteres'
    }
    
    // Verificar que el username no exista (solo para usuarios nuevos)
    if (!datos.id && usuarios.some(u => u.userName.toLowerCase() === datos.userName.toLowerCase())) {
      errores.userName = 'Este nombre de usuario ya existe'
    }
    
    return errores
  }

  const reiniciarPassword = async () => {
    if (
      window.confirm('¿Estás seguro de que deseas reestablecer la contraseña?')
    ) {
      if (formData.id == null) {
        console.error('No se puede reiniciar contraseña: id es null')
        return
      }
      await restartPassword({ idUsuario: formData.id })

      setAlerta({
        isOpen: true,
        titulo: '¡Éxito!',
        message: 'CONTRASEÑA ACTUALIZADA',
      })
    }
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    const newFormData = { ...formData, [id]: value }
    setFormData(newFormData)
    
    // Validar en tiempo real
    const errores = validarFormulario(newFormData)
    setValidationErrors(errores)
  }

  const llenarCampos = (row: UsuarioType) => {
    setHiddenBtnOnEdit(false)
    setRolesDeUsuario(row.rolesDeUsuario ?? [])
    setFormData({ ...row })
    formRef.current?.setAllFields(row)
  }

  const eliminiarUsuario = async (row: UsuarioType) => {
    const isConfirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario ${row.userName}?`
    )
    if (isConfirmed) {
      try {
        await eliminarUsuario({ idUsuario: row.id })

        setAlerta({
          isOpen: true,
          titulo: '¡Éxito!',
          message: 'Usuario eliminado exitosamente',
        })
        setUsuarios((prev) => prev.filter((usuario) => usuario.id !== row.id))
      } catch {
        setAlertaError({
          isOpen: true,
          titulo: 'Error',
          message: 'Hubo un error al eliminar el usuario',
        })
      }
    } else {
      setAlerta({
        isOpen: true,
        titulo: 'Cancelado',
        message: 'Eliminación cancelada',
      })
    }
  }

  const agregarNuevoRol = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (formData.id == null) {
      setAlertaCuidado({
        isOpen: true,
        titulo: 'Cuidado',
        message: 'No se puede agregar un rol si el usuario no tiene ID.',
      })
      return
    }

    const nuevoRol = { idUsuario: formData.id, rol: formData.rol }

    setRolesDeUsuario((prev) => [...prev, nuevoRol])

    await agregarRolUsuario({
      idUsuario: formData.id,
      rol: formData.rol,
    })
  }

  const handleDeleteElement = async (value: {
    rol: Rol
    idUsuario: number
  }) => {
    setRolesDeUsuario((prev) => prev.filter((rol) => rol.rol !== value.rol))
    await eliminarRolUsuario({
      idUsuario: value.idUsuario,
      rol: value.rol,
    })
  }

  const camposFormulario = [
    { nombreCampo: 'userName', labelText: 'Usuario:', required: true },
    { nombreCampo: 'nombre', labelText: 'Nombre:', required: true },
    { nombreCampo: 'idZona', labelText: 'Zona:' },
    { nombreCampo: 'otros', labelText: 'Otros:' },
  ].map(({ nombreCampo, labelText, required }) => ({
    nombreCampo,
    labelText,
    type: 'text' as const,
    placeholder: labelText,
    defaultValue: formData[nombreCampo as keyof FormData] as string,
    required,
    error: validationErrors[nombreCampo],
    className: validationErrors[nombreCampo] ? 'form-control is-invalid' : 'form-control'
  }))

  // Componente para renderizar campos con errores
  const FormFieldWithError = ({ field }: { field: any }) => (
    <div className="mb-3">
      <label className="form-label">
        {field.labelText}
        {field.required && <span className="text-danger">*</span>}
      </label>
      <input
        type={field.type}
        className={field.className}
        placeholder={field.placeholder}
        value={formData[field.nombreCampo as keyof FormData] as string}
        onChange={handleInputChange}
        id={field.nombreCampo}
        disabled={isSubmitting}
      />
      {field.error && (
        <div className="invalid-feedback d-block">
          <small>{field.error}</small>
        </div>
      )}
    </div>
  )

  const estiloCeldaOnline = ({ online }: UsuarioType) => ({
    backgroundColor: online ? '#d4edda' : '#f8d7da',
    color: online ? '#155724' : '#721c24',
    fontWeight: 'bold',
    borderRadius: '4px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  })

  const renderCeldaUsuario = (row: UsuarioType) => (
    <div className={row.online ? 'user-status-online' : 'user-status-offline'}>
      <span>{row.online ? '🟢' : '🔴'}</span>
      {row.userName}
    </div>
  )

  const enviarNotificacion = (row: any) => {
    const receptorName = row.userName
    setModalNotificacionOpen({
      isOpen: true,
      receptorName,
    })
  }

  const listaCols = [
    { id: 'id', label: 'ID', width: '50px', options: true },
    {
      id: 'userName',
      label: 'Usuario',
      width: '120px',
      customRender: renderCeldaUsuario,
      options: true,
    },
    { id: 'rol', label: 'Rol', width: '120px', options: true },
    { id: 'nombre', label: 'Nombre', width: '150px', options: true },
    { id: 'idZona', label: 'Zona', width: '90px', options: true },
    { id: 'otros', label: 'Otros', width: '420px' },
    {
      id: 'btnEditar',
      label: 'Editar',
      width: '60px',
      ico: editarIco,
      onclick: llenarCampos,
    },
    {
      id: 'btnEliminar',
      label: 'Eliminar',
      width: '70px',
      ico: eliminarIco,
      onclick: eliminiarUsuario,
    },
    {
      id: 'btnEnviarNotificacion',
      label: 'Notificacion',
      width: '70px',
      ico: messageIco,
      onclick: enviarNotificacion,
    },
  ]

  const handleFormChange = (valores: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...valores }))
  }

  // Función para filtrar usuarios
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesSearch = 
      usuario.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.idZona.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'TODOS' || usuario.rol === filterRole
    
    const matchesOnline = 
      filterOnline === 'TODOS' ||
      (filterOnline === 'ONLINE' && usuario.online) ||
      (filterOnline === 'OFFLINE' && !usuario.online)
    
    return matchesSearch && matchesRole && matchesOnline
  })

  // Estadísticas de usuarios
  const estadisticas = {
    total: usuarios.length,
    online: usuarios.filter(u => u.online).length,
    offline: usuarios.filter(u => !u.online).length,
    porRol: LISTA_ROLES.reduce((acc, rol) => {
      acc[rol] = usuarios.filter(u => u.rol === rol).length
      return acc
    }, {} as Record<Rol, number>)
  }
  return (
    <Estructura>
      <div className="usuario-dashboard">
        {/* Header moderno con gradiente */}
        <div className="row align-items-center justify-content-center mb-4">
          <div className="col-3 d-flex justify-content-start">
            <div className="d-flex align-items-center gap-3">
              <div className="user-info-header">
                <span className="text-muted small">👤 Admin:</span>
                <span className="fw-bold text-dark ms-2">Juan</span>
              </div>
            </div>
          </div>
          <div className="col-6 text-center">
            <h1 className="headerTitle m-0">🍊 GESTIÓN DE USUARIOS</h1>
            <p className="text-muted mt-2">Sistema de Administración Citrícola</p>
          </div>
          <div className="col-3 d-flex justify-content-end gap-2">
            <Button
              text={'📊 VER SUGERENCIA'}
              className="btn-modern"
              onClick={() => navigate('/sugerencias')}
              title="Ver sugerencias"
            />
          </div>
        </div>

        <div className="row h-100 m-0">
          {/* Panel de estadísticas grandes y coloridas */}
          <div className="col-12 mb-4">
            <div className="row g-4">
              <div className="col-3">
                <div className="stats-card stats-card-total">
                  <div className="card-body">
                    <h5 className="card-title">👥 Total Usuarios</h5>
                    <h3 className="user-count-animation">{estadisticas.total}</h3>
                    <small className="opacity-75">Usuarios registrados</small>
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="stats-card stats-card-online">
                  <div className="card-body">
                    <h5 className="card-title">🟢 En Línea</h5>
                    <h3 className="user-count-animation">{estadisticas.online}</h3>
                    <small className="opacity-75">Conectados ahora</small>
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="stats-card stats-card-offline">
                  <div className="card-body">
                    <h5 className="card-title">🔴 Desconectados</h5>
                    <h3 className="user-count-animation">{estadisticas.offline}</h3>
                    <small className="opacity-75">Sin conexión</small>
                  </div>
                </div>
              </div>
              <div className="col-3">
                <div className="stats-card stats-card-admins">
                  <div className="card-body">
                    <h5 className="card-title">👑 Administradores</h5>
                    <h3 className="user-count-animation">{estadisticas.porRol.ADMINISTRADOR || 0}</h3>
                    <small className="opacity-75">Privilegios especiales</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de búsqueda y filtros mejorado */}
          <div className="col-12 mb-4">
            <div className="search-filters">
              <div className="row align-items-end g-3">
                <div className="col-4">
                  <label className="form-label">🔍 Buscar Usuario</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por usuario, nombre o zona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-3">
                  <label className="form-label">🎭 Filtrar por Rol</label>
                  <select
                    className="form-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as Rol | 'TODOS')}
                  >
                    <option value="TODOS">Todos los roles</option>
                    {LISTA_ROLES.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol.replace(/-/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-3">
                  <label className="form-label">🌐 Estado Conexión</label>
                  <select
                    className="form-select"
                    value={filterOnline}
                    onChange={(e) => setFilterOnline(e.target.value as 'TODOS' | 'ONLINE' | 'OFFLINE')}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ONLINE">🟢 En línea</option>
                    <option value="OFFLINE">🔴 Desconectado</option>
                  </select>
                </div>
                <div className="col-2">
                  <button
                    className="btn-clear w-100"
                    onClick={() => {
                      setSearchTerm('')
                      setFilterRole('TODOS')
                      setFilterOnline('TODOS')
                    }}
                  >
                    🗑️ Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="col-3 d-flex flex-column"
            style={{ height: '100%', overflowY: 'auto' }}
          >
            {/* Formulario mejorado con gradiente y validaciones */}
            <div className="form-user-panel">
              <h5>
                {hiddenBtnsOnEdit ? '➕ Nuevo Usuario' : '✏️ Editar Usuario'}
              </h5>
              
              <div className="p-3">
                {camposFormulario.map((field) => (
                  <FormFieldWithError key={field.nombreCampo} field={field} />
                ))}

                {!hiddenBtnsOnEdit && (
                  <div className="mb-3">
                    <div className="d-flex align-items-end gap-2">
                      <div style={{ flex: 1 }}>
                        <label className="form-label">🎭 Roles</label>
                        <select
                          id="rol"
                          className="form-control"
                          value={formData.rol}
                          onChange={handleInputChange}
                        >
                          {LISTA_ROLES.map((rol) => (
                            <option key={rol} value={rol}>
                              {rol.replace(/-/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="btn-modern"
                        style={{ height: '38px', width: '38px', padding: '0', fontSize: '18px' }}
                        onClick={agregarNuevoRol}
                        title="Agregar rol"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {!hiddenBtnsOnEdit && (
                  <div
                    style={{
                      maxHeight: '120px',
                      overflowY: 'auto',
                      border: '2px solid #f97316',
                      borderRadius: '12px',
                      padding: '8px',
                      backgroundColor: '#fff7ed',
                    }}
                  >
                    {rolesDeUsuario
                      .sort((a, b) => a.rol.localeCompare(b.rol))
                      .map((value, index) => (
                        <Deleteable
                          key={index}
                          txtValue={value.rol}
                          onClick={() => handleDeleteElement(value)}
                        />
                      ))}
                  </div>
                )}

                {/* Botones modernos */}
                <div className="row mt-4 g-2">
                  {hiddenBtnsOnEdit ? (
                    <div className="col-12">
                      <button
                        className="btn-modern w-100"
                        onClick={crearUsuario}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Creando...
                          </>
                        ) : (
                          '✨ Crear Usuario'
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="col-4">
                        <button
                          className="btn-modern w-100 small"
                          onClick={editarUsuario}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? '⏳' : '💾'}
                        </button>
                      </div>
                      <div className="col-4">
                        <button
                          className="btn-clear w-100 small"
                          onClick={cancelarEdicion}
                        >
                          ❌
                        </button>
                      </div>
                      <div className="col-4">
                        <button
                          className="btn-modern w-100 small"
                          onClick={reiniciarPassword}
                          style={{ 
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            fontSize: '0.9rem'
                          }}
                        >
                          🔑
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="col-9 d-flex flex-column"
            style={{ height: '100%' }}
          >
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center h-100 loading-overlay">
                <div className="text-center">
                  <div className="spinner-border animated-icon" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 fw-bold text-dark">🔄 Cargando usuarios...</p>
                  <small className="text-muted">Obteniendo datos del sistema</small>
                </div>
              </div>
            ) : (
              <>
                <div className="table-container" style={{ height: '85vh' }}>
                  <VirtualizedTable
                    rows={usuariosFiltrados}
                    setRows={setUsuarios}
                    columns={listaCols}
                  />
                </div>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-primary fs-6">
                      📊 Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
                    </span>
                    {searchTerm && (
                      <span className="filter-badge filter-badge-active">
                        🔍 Filtrado por: "{searchTerm}"
                      </span>
                    )}
                    {filterRole !== 'TODOS' && (
                      <span className="filter-badge filter-badge-active">
                        🎭 Rol: {filterRole}
                      </span>
                    )}
                    {filterOnline !== 'TODOS' && (
                      <span className="filter-badge filter-badge-active">
                        🌐 {filterOnline === 'ONLINE' ? 'En línea' : 'Desconectado'}
                      </span>
                    )}
                  </div>
                  <small className="text-muted">
                    Última actualización: {new Date().toLocaleTimeString()}
                  </small>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Alert
        isOpen={alerta.isOpen}
        titulo={alerta.titulo}
        message={alerta.message}
        setIsOpen={(val) =>
          setAlerta((prev) => ({
            ...prev,
            isOpen: typeof val === 'function' ? val(prev.isOpen) : val,
          }))
        }
      />

      <AlertErrores
        isOpen={alertaError.isOpen}
        titulo={alertaError.titulo}
        message={alertaError.message}
        setIsOpen={(val) =>
          setAlertaError((prev) => ({
            ...prev,
            isOpen: typeof val === 'function' ? val(prev.isOpen) : val,
          }))
        }
      />

      <AlertCuidado
        isOpen={alertaCuidado.isOpen}
        titulo={alertaCuidado.titulo}
        message={alertaCuidado.message}
        setIsOpen={(val) =>
          setAlertaCuidado((prev) => ({
            ...prev,
            isOpen: typeof val === 'function' ? val(prev.isOpen) : val,
          }))
        }
      />

      <ModalNotificaciones
        isOpen={modalNotificacionOpen.isOpen}
        receptorName={modalNotificacionOpen.receptorName}
        onClose={() =>
          setModalNotificacionOpen({
            isOpen: false,
            receptorName: '',
          })
        }
      />
    </Estructura>
  )
}

export default Administracion
