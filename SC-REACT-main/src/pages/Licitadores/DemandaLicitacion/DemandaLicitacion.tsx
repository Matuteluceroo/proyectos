import React, { useState, useEffect, useRef } from 'react'
import Button from '../../../components/Button/Button'
import Modal from '../../../components/Modal/Modal'
import FormReutilizable from '../../../components/DynamicForm/FormReutilizable'
import {
  Field,
  GroupedField,
} from '../../../components/DynamicForm/FormReutilizableTypes'
import { useNavigate } from 'react-router-dom'
import { useGenerarExcel } from '../../../services/connections/documents'
import {
  useObtenerLicitacionByID,
  useEliminarLicitacion,
  useObtenerClientesZona,
  useObtenerNombreTarot,
  useEliminarRenglon,
  useEliminarRenglonesLicitacion,
  useListaCodigos,
} from '../../../services/connections/licitaciones'
import { useSocket } from '../../../services/SocketContext'
import eliminarIco from '../../../assets/trash.svg'
import Alert from '../../../components/Alert/Alert'
import AlertOptions from '../../../components/Alert/AlertOptions'
import AlertaCuidado from '../../../components/Alert/AlertCuidado'
import FileUpload from '../../../components/FileUpload/FileUpload'
import BuscadorModalTabla from '../../../components/Button/ButtonBuscador'
import Estructura from '../../../components/Estructura/Estructura'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import { DataLicitacion } from './demandaLicitacionTypes'
import { Column } from '../../../types/TableTypes'
import BotonVolver from '../../../components/Button/BotonVolver'
import { FiSend, FiTrash2 } from 'react-icons/fi'
import { useObtenerUsuariosEnLinea } from '../../../services/connections/usuarios'
import {
  useCrearLicitacion,
  useModificarLicitacion,
  useCrearRenglonesLicitacion,
  useModificarRenglonesLicitacion,
  useAsociarUsuarioLicitacion,
} from '../../../services/connections/licitaciones'

type Renglon = {
  renglon: string
  cantidad: string
  descripcion: string
  codigoTarot: string
  descripcionTarot?: string
  [key: string]: any // Puedes agregar más propiedades si las conoces
}

type Cliente = {
  COD_CLIENT: string
  RAZON_SOCI: string
}

type ClienteItem = {
  value: string
  label: string
}

const DemandaLicitacion = () => {
  const [dataLicitacion, setDataLicitacion] = useState<DataLicitacion>({
    id: null,
    codCliente: '',
    cliente: '',
    fecha: '',
    hora: '',
    objeto: '',
    tipo: '',
    nroLic: '',
    estado: '',
    usuarios: [],
  })
  const [renglones, setRenglones] = useState<Renglon[]>([])
  const [listaClientes, setListaClientes] = useState<ClienteItem[]>([
    { value: '0', label: 'Seleccione un cliente' },
  ])
  const [isModalImportarOpen, setIsModalImportarOpen] = useState(false)
  const [isModalNuevoClienteOpen, setIsModalNuevoClienteOpen] = useState(false)
  const [dataExcel, setDataExcel] = useState([])
  const [currentNewIdRenglon, setCurrentNewIdRenglon] = useState(1)
  const [alerta, setAlerta] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [alertaOptionsOpen, setAlertaOptionsOpen] = useState(false)
  const [msgAlertaOptions, setMsgAlertaOptions] = useState('')
  const [tituloAlertaOptions, setTituloAlertaOptions] = useState('')
  const [options, setOptions] = useState('')
  const [isAlertaElimianrRenglon, setIsAlertaElimianrRenglon] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<Renglon | null>(null)
  const [datosAImportar, setDatosAImportar] = useState<any[]>([])
  const formRef = useRef<any>(null)
  const nuevoClienteRef = useRef<any>(null)
  const tableRef = useRef<any>(null)
  const prevCodigosRef = useRef<{ [key: string]: string }>({})
  const obtenerLicitacionByID = useObtenerLicitacionByID()
  const eliminarLicitacion = useEliminarLicitacion()
  const obtenerClientesZona = useObtenerClientesZona()
  const obtenerNombreTarot = useObtenerNombreTarot()
  const eliminarRenglonesLicitacion = useEliminarRenglonesLicitacion()
  const eliminarRenglon = useEliminarRenglon()
  const listaCodigosMasiva = useListaCodigos()
  const { currentUser, enviarNotificacion } = useSocket()
  const obtenerUsuariosEnLinea = useObtenerUsuariosEnLinea()
  const crearLicitacion = useCrearLicitacion()
  const modificarLicitacion = useModificarLicitacion()
  const crearRenglonesLicitacion = useCrearRenglonesLicitacion()
  const modificarRenglonesLicitacion = useModificarRenglonesLicitacion()
  const asociarUsuarioLicitacion = useAsociarUsuarioLicitacion()
  const navigate = useNavigate()
  const guardarLicitacion = async (currentEstado: string) => {
    if (formRef.current) {
      const formulario = await formRef.current.getFormData()

      if (
        formulario.cliente === '' ||
        formulario.cliente === '0' ||
        formulario.fecha === '' ||
        formulario.tipo === '' ||
        formulario.nroLic === '' ||
        formulario.hora === ''
      ) {
        setAlertaCuidado(true)
        setTituloAlerta('DATOS DEL CLIENTE INCOMPLETOS')
        setMsgAlerta('¡Debe completar todos los datos del cliente!')
        return
      }
      if (
        dataLicitacion.estado !== 'INICIADA' &&
        dataLicitacion.estado !== ''
      ) {
        currentEstado = dataLicitacion?.estado || ''
      }

      const listaRenglones = tableRef.current.getData()

      if (listaRenglones.length === 0 || !listaRenglones.length) {
        setAlertaCuidado(true)
        setTituloAlerta('ATENCION')
        setMsgAlerta('La licitación no tiene renglones')
        return null
      }
      for (let i = 0; i < listaRenglones.length; i++) {
        if (
          !listaRenglones[i]['descripcionTarot'] ||
          listaRenglones[i]['descripcionTarot'] === 'No asignado en Tarot'
        )
          listaRenglones[i]['codigoTarot'] = '0'
      }

      if (!dataLicitacion.id || dataLicitacion.id === undefined) {
        const nuevaLic = await crearLicitacion({
          codCliente: formulario['cliente'],
          cliente: formulario['optionLabel'] || dataLicitacion['cliente'],
          fecha: formulario['fecha'],
          nroLic: formulario['nroLic'],
          tipo: formulario['tipo'],
          hora: formulario['hora'],
          objeto: formulario['objeto'],
          estado: currentEstado,
        })
        if (!nuevaLic) return
        const idNuevaLicitacion = nuevaLic.newLicitacion.id

        const newRengs = await crearRenglonesLicitacion({
          idLicitacion: idNuevaLicitacion,
          renglones: listaRenglones,
        })
        if (!newRengs) return
        const usLic = await asociarUsuarioLicitacion(
          idNuevaLicitacion,
          currentUser.id
        )
        if (!usLic) return
        navigate('/menu_licitaciones')
      } else {
        const renglonesAgregar = []
        const renglonesActualizar = []
        // MODIFICAR LICITACION/RENGLONES Existentes
        for (let i = 0; i < listaRenglones.length; i++) {
          if (listaRenglones[i]['idLicitacion']) {
            // modificar por id de renglon
            renglonesActualizar.push(listaRenglones[i])
          } else {
            renglonesAgregar.push(listaRenglones[i])
          }
        }
        const idLicitacion = dataLicitacion.id
        const modLic = await modificarLicitacion({
          idLicitacion,
          dataLicitacion: {
            codCliente: formulario['cliente'],
            cliente: formulario['optionLabel'] || dataLicitacion['cliente'],
            fecha: formulario['fecha'],
            nroLic: formulario['nroLic'],
            tipo: formulario['tipo'],
            hora: formulario['hora'],
            objeto: formulario['objeto'],
            estado: currentEstado,
          },
        })
        if (!modLic) return
        if (renglonesAgregar.length > 0) {
          const newRengs = await crearRenglonesLicitacion({
            idLicitacion: dataLicitacion.id,
            renglones: renglonesAgregar,
          })
          if (!newRengs) return
        }
        if (renglonesActualizar.length > 0) {
          const modifReng = await modificarRenglonesLicitacion({
            idLicitacion: dataLicitacion.id,
            renglones: renglonesActualizar,
          })
          if (!modifReng) return
        }

        const asUs = await asociarUsuarioLicitacion(
          dataLicitacion.id,
          currentUser.id
        )
        if (!asUs) return
      }
      if (currentEstado === 'EN CURSO') {
        setAlerta(true)
        setTituloAlerta('LICITACIÓN ENVIADA')
        setMsgAlerta('¡La licitación se envio correctamente a Compras!')
      } else {
        setAlerta(true)
        setTituloAlerta('LICITACIÓN GUARDADA')
        setMsgAlerta('¡Licitación guardada correctamente!')
      }

      // Aqui actualizo los renglones
      const getL = await getLicitacion()
      if (!getL) return
      return {
        codCliente: formulario['cliente'],
        cliente: formulario['optionLabel'] || dataLicitacion['cliente'],
        fecha: formulario['fecha'],
        nroLic: formulario['nroLic'],
        tipo: formulario['tipo'],
        hora: formulario['hora'],
        objeto: formulario['objeto'],
        estado: currentEstado,
      }
    } else {
      setAlertaCuidado(true)
      setTituloAlerta('ATENCION')
      setMsgAlerta('No hay formulario')
      return null
    }
  }

  const enviarACompras = async () => {
    const datosAEnviar = await guardarLicitacion('EN CURSO')
    if (!datosAEnviar) return

    if (datosAEnviar) {
      const usuariosEnLinea = await obtenerUsuariosEnLinea()
      if (!usuariosEnLinea) return

      const mensaje =
        'Solicito cotizaciones de licitación ' +
        datosAEnviar.nroLic +
        ', cliente ' +
        datosAEnviar.cliente
      usuariosEnLinea.forEach((us: any) => {
        if (us.userData.rol === 'COMPRADOR') {
          enviarNotificacion(us.userData.usuario, {
            usuario: currentUser.usuario,
            mensaje,
          })
        }
      })
    }
  }
  const btnEliminarLicitacion = async () => {
    if (!dataLicitacion.id) {
      setAlertaError(true)
      setTituloAlerta('ERROR')
      setMsgAlerta('NO SE PUEDE ELIMINAR LA LICITACIÓN')
    }
    setAlertaOptionsOpen(true)
    setTituloAlertaOptions('Se eliminara la licitación')
    setMsgAlertaOptions('¿Estás seguro de que deseas eliminar la licitación?')
    setOptions('eliminar')
  }
  const getLicitacion = async () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    const idLicitacion = params.get('id')

    if (idLicitacion) {
      const dataLic = await obtenerLicitacionByID({ idLicitacion })

      if (dataLic.codCliente === 'N-C') {
        setListaClientes((prev) => {
          const nuevoCliente: ClienteItem = {
            value: 'N-C',
            label: dataLic.cliente,
          }
          return [...prev, nuevoCliente]
        })
      }

      if (!dataLic) return null
      setDataLicitacion(dataLic)

      // Saco alternativos
      const renglonesLicitacion = dataLic.renglones.filter(
        (reng: Renglon) => reng.alternativo === 0
      )
      setRenglones(renglonesLicitacion)
      return dataLic
    }
  }

  const codigoTarotList = renglones.map(
    (row) => row.codigoTarot?.toString().slice(0, 6) || ''
  )

  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = []

    renglones.forEach((row: any, index: number) => {
      const codigo = row.codigoTarot?.toString().slice(0, 6)
      const key = row.newId ?? index // Si newId existe, úsalo; si no, usa el índice

      // Detectar si cambió respecto al valor anterior
      const prevCodigo = prevCodigosRef.current[key]

      if (codigo && codigo !== prevCodigo) {
        // Guardar nuevo valor para futuras comparaciones
        prevCodigosRef.current[key] = codigo

        const timeoutId = setTimeout(async () => {
          if (codigo === '0') {
            const nombreTarot = row.descripcionTarot
            if (nombreTarot !== 'No asignado en Tarot') {
              setRenglones((prev) => {
                const updated: any = [...prev]
                updated[index] = {
                  ...updated[index],
                  descripcionTarot: 'No asignado en Tarot',
                }
                return updated
              })
            }
          } else {
            await obtenerNombreYActualizar(index, codigo)
          }
        }, 200)

        timeoutIds.push(timeoutId)
      }
    })

    return () => {
      timeoutIds.forEach(clearTimeout)
    }
  }, [codigoTarotList])

  const agregarRenglonesExcel = async (nuevosRenglones: Renglon[]) => {
    // Obtener descripciones desde el backend
    const codigosUnicos = [
      ...new Set(
        nuevosRenglones.map((r) => r.codigoTarot).filter((c) => c !== '0')
      ),
    ]

    let nombresTarot = []
    try {
      nombresTarot = await listaCodigosMasiva({ listaCodigos: codigosUnicos })
    } catch (error) {
      console.error('Error al obtener nombres tarot:', error)
    }

    const diccionarioTarot: any = {}
    nombresTarot.forEach(
      (item: { codTarot: string; descripcionTarot: string }) => {
        diccionarioTarot[item.codTarot] = item.descripcionTarot
      }
    )
    const renglonesConNombre = nuevosRenglones.map((r, index) => ({
      ...r,
      descripcionTarot:
        diccionarioTarot[r.codigoTarot] || 'No asignado en Tarot',
      newId: index,
    }))

    // Agregarlos a los actuales
    setRenglones((prev) => [...prev, ...renglonesConNombre])
    setIsModalImportarOpen(false)
  }

  useEffect(() => {
    const procesarExcel = async () => {
      const nuevosRenglones: Renglon[] = []

      for (let i = 1; i < dataExcel.length; i++) {
        const filaExcel: Renglon[] = dataExcel[i]
        nuevosRenglones.push({
          renglon: filaExcel[0]?.toString(),
          cantidad: filaExcel[1]?.toString(),
          descripcion: filaExcel[2]?.toString(),
          codigoTarot: filaExcel[3]?.toString(),
        })
      }

      // Detectar duplicados por campo "renglon"
      const renglonesActuales = [...renglones]
      const existentes = new Set(renglonesActuales.map((r) => r.renglon))
      const duplicados = nuevosRenglones.filter((r) =>
        existentes.has(r.renglon)
      )

      if (duplicados.length > 0) {
        setTituloAlertaOptions('Renglones duplicados')
        setMsgAlertaOptions(
          'El Excel contiene renglones ya existentes. ¿Deseás agregarlos igual?'
        )
        setOptions('importarConDuplicados')
        setAlertaOptionsOpen(true)
      } else {
        await agregarRenglonesExcel(nuevosRenglones)
      }
    }

    if (dataExcel.length > 0) {
      procesarExcel()
    }
  }, [dataExcel])

  useEffect(() => {
    const fetchData = async () => {
      const listaCli = async () => {
        const listInicial = [
          { COD_CLIENT: '0', RAZON_SOCI: 'Seleccione un cliente' },
        ]
        if (currentUser['idZona'] === null) {
          return listInicial
        } else {
          const clientes_lic = await obtenerClientesZona(currentUser.idZona)
          if (!clientes_lic) return null
          return listInicial.concat(clientes_lic)
        }
      }

      const clientes: Cliente[] | null = await listaCli()
      if (!clientes) return null

      setListaClientes(
        clientes.map((cliente) => ({
          value: cliente.COD_CLIENT,
          label: cliente.RAZON_SOCI,
        }))
      )

      await getLicitacion()
    }

    fetchData()
  }, [])

  const agregarNuevoCliente = () => {
    if (nuevoClienteRef.current) {
      const formulario = nuevoClienteRef.current.getFormData()

      if (formulario.nuevoCliente === '') {
        alert('Debe completar el campo del nuevo cliente')
        return
      }

      setListaClientes((prev) => {
        const nuevoCliente: ClienteItem = {
          value: 'N-C',
          label: formulario.nuevoCliente,
        }
        return [...prev, nuevoCliente]
      })
      setIsModalNuevoClienteOpen(false)
      alert('CLIENTE AGREGADO CORRECTAMENTE')
    }
  }

  const camposFormulario: (Field | GroupedField)[] = [
    {
      group: true,
      nombreCampo: 'cliente',
      fields: [
        {
          nombreCampo: 'cliente',
          labelText: 'Cliente',
          type: 'select',
          options: listaClientes,
          defaultValue: dataLicitacion.codCliente,
          width: '85%',
        },
        {
          nombreCampo: 'btnNuevoCliente',
          labelText: '+',
          type: 'button',
          onClick: () => {
            setIsModalNuevoClienteOpen(true)
          },
          width: '10%',
        },
      ],
    },
    {
      nombreCampo: 'fecha',
      labelText: 'Fecha',
      type: 'date',
      placeholder: 'Fecha de Apertura',
      defaultValue: dataLicitacion.fecha,
    },
    {
      nombreCampo: 'hora',
      labelText: 'Hora',
      type: 'time',
      placeholder: 'Hora de apertura',
      defaultValue: dataLicitacion.hora,
    },
    {
      nombreCampo: 'objeto',
      labelText: 'Objeto',
      type: 'text',
      defaultValue: dataLicitacion.objeto,
    },
    {
      nombreCampo: 'tipo',
      labelText: 'Tipo',
      type: 'text',
      placeholder: 'Tipo de licitación',
      defaultValue: dataLicitacion.tipo,
    },
    {
      nombreCampo: 'nroLic',
      labelText: 'N° C/L',
      type: 'text',
      placeholder: 'Nro de Licitación',
      defaultValue: dataLicitacion.nroLic,
    },
  ]

  const btnEliminarRenglon = async (row: Renglon) => {
    setRowToDelete(row) // Guarda la fila a eliminar
    setIsAlertaElimianrRenglon(true) // Abre el modal
  }

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return

    const dataRenglones: any[] = tableRef.current?.getData()

    if (!rowToDelete.idRenglon) {
      setRenglones(
        dataRenglones.filter(
          (renglon) =>
            renglon.idRenglon || renglon.newId !== rowToDelete['newId']
        )
      )
    } else {
      setRenglones(
        dataRenglones.filter(
          (renglon) => renglon.idRenglon !== rowToDelete['idRenglon']
        )
      )
      await eliminarRenglon(rowToDelete['idRenglon'])
    }

    setIsAlertaElimianrRenglon(false) // Cierra el modal después de eliminar
    setRowToDelete(null) // Limpia la fila seleccionada
  }

  const handleCancelDelete = () => {
    setIsAlertaElimianrRenglon(false)
    setRowToDelete(null)
  }

  const obtenerNombreYActualizar = async (rowIndex: number, codigo: string) => {
    const nombre = await obtenerNombreTarot(codigo)

    // Hacemos una única actualización solo si el nombre ha cambiado
    setRenglones((prev) => {
      const updated = [...prev]
      const row = updated[rowIndex]
      if (!row) return prev

      const nuevoValor = nombre || 'No asignado en Tarot'
      if (row.descripcionTarot === nuevoValor) {
        // Si ya coincide, no modificamos nada
        return prev
      }

      updated[rowIndex] = {
        ...row,
        descripcionTarot: nuevoValor,
      }
      return updated
    })
  }

  const columnasDemanda: Column[] = [
    {
      id: 'renglon',
      label: 'Renglon',
      width: '70px',
      editable: true,
      type: 'number',
      options: true,
    },
    {
      id: 'cantidad',
      label: 'Cantidad',
      width: '70px',
      editable: true,
      type: 'number',
      options: true,
    },
    {
      id: 'descripcion',
      label: 'Descripcion',
      width: '400px',
      editable: true,
      options: true,
    },
    {
      id: 'codigoTarot',
      label: 'Cod Tarot',
      width: '80px',
      editable: true,
      type: 'number',
    },
    {
      id: 'descripcionTarot',
      label: 'Nombre Tarot',
      width: '350px',
      editable: false,
      options: true,
      value: (row: Renglon) => {
        if (!row['descripcionTarot'])
          row['descripcionTarot'] = 'No asignado en Tarot'
        return row['descripcionTarot']
      },
    },
    {
      id: 'btnEliminar',
      label: 'Eliminar',
      width: '90px',
      ico: eliminarIco,
      onclick: btnEliminarRenglon,
    },
  ]

  const importarExcel = async () => {
    actualizarFormRenglones()

    if (renglones.length === 0) {
      actualizarFormRenglones()

      const newRenglon = {
        renglon: '',
        cantidad: '',
        descripcion: '',
        codigoTarot: '',
        descripcionTarot: '',
        precio_vta_total: '-',
      }

      const updatedRenglones = [...renglones, newRenglon]
      setDatosAImportar(updatedRenglones)
    } else {
      setDatosAImportar(renglones)
    }

    setIsModalImportarOpen(true)
  }

  const agregarRenglon = async () => {
    actualizarFormRenglones()
    const newRenglon = {
      renglon: '',
      cantidad: '',
      descripcion: '',
      codigoTarot: '0',
      newId: currentNewIdRenglon,
    }

    setRenglones((prevRenglones) => {
      const nuevos = [...prevRenglones, newRenglon]

      setTimeout(() => {
        tableRef.current?.scrollToRow(nuevos.length - 1)
      }, 100) // Aseguramos que el nuevo dato esté renderizado

      return nuevos
    })

    setCurrentNewIdRenglon((prev) => prev + 1)
  }

  const actualizarFormRenglones = async () => {
    const datos = tableRef.current.getData()
    const formulario = formRef.current?.getFormData()

    const valorDeNombreCliente =
      formulario.optionLabel || dataLicitacion.cliente

    const dataLic: DataLicitacion = {
      id: dataLicitacion.id,
      codCliente: formulario.cliente,
      cliente: valorDeNombreCliente,
      fecha: formulario.fecha,
      hora: formulario.hora,
      objeto: formulario.objeto,
      tipo: formulario.tipo,
      nroLic: formulario.nroLic,
      estado: dataLicitacion.estado,
    }
    setDataLicitacion(dataLic)
    setRenglones(datos)
    return datos
  }

  const limpiarTabla = async () => {
    setAlertaOptionsOpen(true)
    setOptions('limpiar')
    setTituloAlertaOptions('Se eliminaran todos los renglones')
    setMsgAlertaOptions('¿Estás seguro de que deseas limpiar la tabla?')
  }

  const exportarExcel = async () => {
    const nombreExcel =
      'Demanda  ' +
      dataLicitacion['fecha'].replaceAll('-', ' ') +
      ' ' +
      dataLicitacion['cliente'] +
      ' ' +
      dataLicitacion['tipo'] +
      ' ' +
      dataLicitacion['nroLic']
    const listaEncabezados = columnasDemanda

    const headers = listaEncabezados.reduce<{ [key: string]: string }>(
      (acc, encabezado) => {
        if (!encabezado.id.startsWith('btn')) {
          acc[encabezado.id] = encabezado.label // Usa 'id' como clave y 'label' como valor
        }
        return acc
      },
      {}
    )

    const datosFiltrados = renglones.map((fila) => {
      // Filtrar solo las columnas que están en 'headers'
      const filaFiltrada = Object.keys(fila)
        .filter((key) => headers.hasOwnProperty(key)) // Filtrar solo las claves que existen en 'headers'
        .reduce<{ [key: string]: any }>((obj, key) => {
          obj[key] = fila[key] // Asignar la propiedad a un nuevo objeto
          return obj
        }, {})

      return filaFiltrada
    })

    const data = {
      data_renglones: datosFiltrados,
      headers: headers,
    }
    await useGenerarExcel(data, nombreExcel)
  }

  const handleConfirm = async () => {
    setAlertaOptionsOpen(false)

    if (options === 'eliminar') {
      if (dataLicitacion.id !== null) {
        const elimLic = await eliminarLicitacion(dataLicitacion.id)
        if (!elimLic) return

        setAlerta(true)
        setTituloAlerta('EXITO')
        setMsgAlerta('Licitación eliminada')
        navigate('/menu_licitaciones')
      }
      return
    }
    if (options === 'importarConDuplicados') {
      const nuevosRenglones: Renglon[] = []

      for (let i = 1; i < dataExcel.length; i++) {
        const filaExcel: Renglon[] = dataExcel[i]
        nuevosRenglones.push({
          renglon: filaExcel[0]?.toString(),
          cantidad: filaExcel[1]?.toString(),
          descripcion: filaExcel[2]?.toString(),
          codigoTarot: filaExcel[3]?.toString(),
        })
      }

      await agregarRenglonesExcel(nuevosRenglones)
    }
    if (options === 'limpiar') {
      if (dataLicitacion.id) {
        const eliminarTodosRenglones = await eliminarRenglonesLicitacion(
          dataLicitacion.id
        )
        if (!eliminarTodosRenglones) return
      }

      setRenglones([])
      setAlerta(true)
      setTituloAlerta('ALERTA')
      setMsgAlerta('Se eliminaron todos los renglones correctamente')
      // navigate('/menu_licitaciones');
    }
  }

  const handleCancel = () => {
    setAlertaOptionsOpen(false)
  }

  return (
    <Estructura rutaVolver="/menu_licitaciones">
      <div
        className="d-flex justify-content-between align-items-center flex-wrap px-3 py-2"
        style={{ width: '100%' }}
      >
        <div className="d-flex align-items-center">
          {currentUser.rol === 'LIDER-LICITADOR' && dataLicitacion.id && (
            <Button
              text={'ELIMINAR LICITACIÓN'}
              title="ELIMINAR LICITACIÓN"
              className="btnEliminar"
              onClick={btnEliminarLicitacion}
              icon={<FiTrash2 style={{ marginRight: '8px' }} />}
            />
          )}
        </div>
        <div className="flex-grow-1 text-center">
          <h1 className="headerTitle m-0">DATOS DE PLIEGO</h1>
        </div>
        <div className="d-flex align-items-center">
          <Button
            text={'GUARDAR'}
            title="GUARDAR"
            className="boton-accion me-2"
            onClick={async () => {
              actualizarFormRenglones()
              const guardLic = await guardarLicitacion('INICIADA')
              if (!guardLic) return
            }}
          />
          <Button
            text={
              <span>
                <FiSend style={{ marginRight: '5px' }} /> GUARDAR Y ENVIAR A
                COMPRAS
              </span>
            }
            className="boton-accion"
            onClick={enviarACompras}
            title="GUARDAR Y ENVIAR A COMPRAS"
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          margin: '5px',
        }}
      >
        <div>
          <h2 className="sub-title">Datos del cliente</h2>
          <div id="div-DataCliente">
            <FormReutilizable
              ref={formRef}
              fields={camposFormulario}
              onChangeForm={(valores) => {
                const clienteElegido = listaClientes.find(
                  (c) => c.value === valores.cliente
                )
                if (clienteElegido) {
                  valores.optionLabel = clienteElegido.label
                }
              }}
            />
          </div>
        </div>

        <div style={{ marginLeft: '30px' }}>
          <h2 className="sub-title">Renglones de la licitacion</h2>

          <div
            style={{
              height: '7vh',
              display: 'flex',
              justifyContent: 'space-around',
            }}
          >
            <div>
              <Button
                title="Importar excel"
                className="btnFuncTabla"
                text={'Importar excel'}
                onClick={importarExcel}
              />
            </div>
            <div>
              <Button
                className="btnFuncTabla"
                title="Agregar Renglon"
                text={'Agregar Renglon'}
                onClick={agregarRenglon}
              />
            </div>
            <div>
              <Button
                className="btnFuncTabla"
                title="Limpiar tabla"
                text={'Limpiar tabla'}
                onClick={limpiarTabla}
              />
            </div>
            <div>
              <Button
                className="btnFuncTabla"
                title="Exportar excel"
                text={'Exportar excel'}
                onClick={exportarExcel}
              />
            </div>
            <div>
              <BuscadorModalTabla title="BUSCAR CÓDIGO TAROT" />
            </div>
          </div>

          <div style={{ height: '78vh' }}>
            <VirtualizedTable
              rows={renglones}
              columns={columnasDemanda}
              ref={tableRef}
              setRows={setRenglones}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalNuevoClienteOpen}
        onClose={() => setIsModalNuevoClienteOpen(false)}
        title={'AGREGAR NUEVO CLIENTE'}
      >
        <FormReutilizable
          ref={nuevoClienteRef}
          fields={[
            {
              nombreCampo: 'nuevoCliente',
              labelText: 'Nuevo Cliente',
              type: 'text',
              placeholder: 'Ingrese el nombre del nuevo cliente',
            },
          ]}
        />
        <Button
          text="AGREGAR"
          className="boton-accion"
          onClick={agregarNuevoCliente}
        />
      </Modal>
      <Modal
        isOpen={isModalImportarOpen}
        onClose={() => setIsModalImportarOpen(false)}
        title={'IMPORTAR EXCEL'}
      >
        <FileUpload
          setData={setDataExcel}
          encabezados={[
            {
              id: 'renglon',
              label: 'Renglon',
            },
            {
              id: 'cantidad',
              label: 'Cantidad',
            },
            {
              id: 'descripcion',
              label: 'Descripcion',
            },
            {
              id: 'codigoTarot',
              label: 'Cod Tarot',
            },
          ]}
          datosTabla={datosAImportar}
          paso={'Demanda '}
          usarEncabezados={false}
        />
      </Modal>

      <AlertOptions
        isOpen={isAlertaElimianrRenglon}
        title="Confirmación"
        message="¿Estás seguro que deseas eliminar el renglón?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <AlertaCuidado
        setIsOpen={setAlertaCuidado}
        isOpen={alertaCuidado}
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

      <AlertOptions
        title={tituloAlertaOptions}
        message={msgAlertaOptions}
        isOpen={alertaOptionsOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Estructura>
  )
}

export default DemandaLicitacion
