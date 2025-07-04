import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSocket } from '../../../services/SocketContext'
import {
  useObtenerLicitaciones,
  useObtenerLicitacionByID,
  useModificarLicitacion,
  useAsociarUsuarioLicitacion,
} from '../../../services/connections/licitaciones'
import {
  useCrearCotizacionesLicitacion,
  useCrearNuevaCotizacion,
  useObtenerEquivalenciaKairos,
} from '../../../services/connections/compras'
import { useGenerarExcel } from '../../../services/connections/documents'
import './Cotizaciones.css'
import { obtenerFechaYHoraActual } from '../../../services/functions'
import Alert from '../../../components/Alert/Alert'
import AlertaCuidado from '../../../components/Alert/AlertCuidado'
import AuxiliarCotizaciones from './AuxiliarCotizaciones'
import {
  ModalLicitacionesEnCurso,
  ModalNoAsociados,
} from './ModalsCotizaciones'
import ModalAgregarCotizacion from './ModalsCotizaciones'
import Modal from '../../../components/Modal/Modal'
import FileUpload from '../../../components/FileUpload/FileUpload'
import Estructura from '../../../components/Estructura/Estructura'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import { getCotizacionesColumns } from './cotizacionesColumns'
import FuncionalidadesTabla from './BotonesTabla'
import { useNavigate } from 'react-router-dom'
import BotonAccion from '../../../components/Button/BotonAgregar'

interface Cotizacion {
  idRenglon: number
  idLicitacion: number
  idKairos?: number
  costoFinal: number | null
  mantenimiento?: string
  observaciones?: string
  codigoTarot?: string
  idUsuario: string | null
  fechora_comp?: string
  idCompra?: number | null
  [key: string]: any
}

const Cotizaciones: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [isModalLicitacionOpen, setIsModalLicitacionOpen] = useState(false)
  const [isModalNoAsocOpen, setIsModalNoAsocOpen] = useState(false)
  const [isModalAgregarOpen, setIsModalAgregarOpen] = useState(false)
  const [cotizacionToAdd, setCotizacionToAdd] = useState<Cotizacion | null>(
    null
  )
  const [costo, setCosto] = useState('')
  const [mantenimiento, setMantenimiento] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [licitacionesEnCurso, setLicitacionesEnCurso] = useState<any[]>([])
  const [licitacionElegida, setLicitacionElegida] = useState<any | null>(null)
  const [dataAuxComponent, setDataAuxComponent] = useState<any>({
    Component: null,
    btnCerrarFunc: () => {},
  })
  const [dataAuxOpen, setDataAuxOpen] = useState(false)
  const [cantidadCostosFiltrados, setCantidadCostosFiltrados] = useState(0)
  const [incluirRenglones, setIncluirRenglones] = useState('todos')
  const [alerta, setAlerta] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [isModalImportarOpen, setIsModalImportarOpen] = useState(false)
  const [dataExcel, setDataExcel] = useState<any[]>([])
  const [datosTablaExportar, setDatosTablaExportar] = useState<any[]>([])
  const { currentUser, enviarNotificacion } = useSocket()
  const obtenerLicitaciones = useObtenerLicitaciones()
  const obtenerLicitacionByID = useObtenerLicitacionByID()
  const modificarLicitacion = useModificarLicitacion()
  const asociarUsuarioLicitacion = useAsociarUsuarioLicitacion()
  const obtenerEquivalenciaKairos = useObtenerEquivalenciaKairos()
  const crearComprasLicitacion = useCrearCotizacionesLicitacion()
  const crearNuevaCompra = useCrearNuevaCotizacion()
  const tableRef = useRef<any>(null)
  const enviarRenglonCotizacion = useCallback(
    async (row: Cotizacion) => {
      const idUser = currentUser.id.toString()

      if (!row || row.costoFinal == null || isNaN(row.costoFinal)) {
        setTituloAlerta('CUIDADO')
        setMsgAlerta('No se puede enviar una cotización sin costo final.')
        setAlertaCuidado(true)
        return
      }
      if (row.idCompra !== null && row.idCompra !== undefined) {
        setCotizacionToAdd(row)
        setIsModalAgregarOpen(true)
        return
      }
      const renglon = {
        idRenglon: row.idRenglon,
        idLicitacion: row.idLicitacion,
        idKairos: row.idKairos,
        costoFinal: row.costoFinal,
        mantenimiento: row.mantenimiento,
        observaciones: row.observaciones,
        codTarot: row.codigoTarot,
        idUsuario: idUser,
        fechora_comp: obtenerFechaYHoraActual(),
      }

      await crearComprasLicitacion({
        idLicitacion: row.idLicitacion.toString(),
        idUsuario: idUser,
        compras: [renglon],
      })

      const dataLic = await obtenerLicitacionByID({
        idLicitacion: row.idLicitacion.toString(),
      })

      await modificarLicitacion({
        idLicitacion: row.idLicitacion.toString(),
        dataLicitacion: {
          estado: 'COTIZADO',
          cliente: dataLic.cliente,
          fecha: dataLic.fecha,
          nroLic: dataLic.nroLic,
          tipo: dataLic.tipo,
          hora: dataLic.hora,
          objeto: dataLic.objeto,
          codCliente: dataLic.codCliente,
        },
      })
      await asociarUsuarioLicitacion(
        row.idLicitacion.toString(),
        currentUser.id
      )
      await llenarTablaCotizaciones()

      setTituloAlerta('RENGLÓN ENVIADO')
      setMsgAlerta('La cotización fue enviada correctamente.')
      await enviarNotificacionALicitadores(row.idLicitacion)
      setAlerta(true)
    },
    [
      currentUser,
      modificarLicitacion,
      asociarUsuarioLicitacion,
      obtenerLicitacionByID,
    ]
  )

  const encabezadosTablaCostos = useMemo(
    () => getCotizacionesColumns(enviarRenglonCotizacion),
    [enviarRenglonCotizacion]
  )

  useEffect(() => {
    const llenarTabla = async () => {
      await llenarTablaCotizaciones()
    }
    llenarTabla()
  }, [incluirRenglones, licitacionElegida])

  interface Licitacion {
    estado: string
    usuarios: { rol: string; nombre: string }[]
    cliente: string
    fecha: string
    nroLic: string
    tipo?: string
    hora?: string
    objeto?: string
    codCliente?: string
    [key: string]: any
  }

  const llenarTablaCotizaciones = async () => {
    try {
      const [dataLicitaciones, listaCostos] = await Promise.all([
        obtenerLicitaciones(),
        obtenerEquivalenciaKairos(),
      ])

      for (let i = 0; i < listaCostos.length; i++) {
        listaCostos[i].id = i
      }

      const listaLicitaciones = (dataLicitaciones as Licitacion[])

        .filter((l) => ['EN CURSO', 'COTIZADO'].includes(l.estado))
        .map((l: Licitacion) => ({
          ...l,
          licitadores: l.usuarios
            .filter((u) => u.rol.includes('LICITADOR'))
            .map((u) => u.nombre)
            .join(', '),
        }))

      let filtradoLicitacion = null
      if (licitacionElegida) {
        filtradoLicitacion = listaCostos.filter(
          (item: Cotizacion) => item.idLicitacion === licitacionElegida.id
        )

        let listaCostosFiltrada
        if (incluirRenglones === 'cotizados') {
          listaCostosFiltrada = filtradoLicitacion.filter(
            (item: Cotizacion) => item.costoFinal !== null
          )
        } else if (incluirRenglones === 'sinCotizar') {
          listaCostosFiltrada = filtradoLicitacion.filter(
            (item: Cotizacion) => item.costoFinal === null
          )
        } else {
          listaCostosFiltrada = filtradoLicitacion
        }
        setCotizaciones(listaCostosFiltrada)
        setLicitacionesEnCurso(listaLicitaciones)
      } else {
        let listaCostosFiltrada
        if (incluirRenglones === 'cotizados') {
          listaCostosFiltrada = listaCostos.filter(
            (item: Cotizacion) => item.costoFinal !== null
          )
        } else if (incluirRenglones === 'sinCotizar') {
          listaCostosFiltrada = listaCostos.filter(
            (item: Cotizacion) => item.costoFinal === null
          )
        } else {
          listaCostosFiltrada = listaCostos
        }
        setCotizaciones(listaCostosFiltrada)
        setLicitacionesEnCurso(listaLicitaciones)
      }
    } catch (e) {
      console.error('Error al llenar la tabla de cotizaciones:', e)
    }
  }

  const limpiarFiltros = () => {
    if (tableRef.current) {
      tableRef.current.setFilters({})
    }
  }

  const getTableData = () => {
    if (tableRef.current) {
      const tableData = tableRef.current.getFilteredData()
      return tableData
    }
  }

  const importarExcel = () => {
    setIncluirRenglones('sinCotizar')
    if (tableRef.current) {
      const todosLosDatos = tableRef.current.getFilteredData()

      // Filtrar solo los que no tienen idCompra
      const datosFiltrados = todosLosDatos.filter(
        (row: Cotizacion) => row.idCompra === null
      )
      setDatosTablaExportar(datosFiltrados)
    }
    setIsModalImportarOpen(true)
  }

  const exportarExcel = async () => {
    if (tableRef.current) {
      const datos = tableRef.current.getFilteredData()
      setDatosTablaExportar(datos)
      const nombreExcel = 'Costos ' + obtenerFechaYHoraActual()

      const headers = encabezadosTablaCostos.reduce(
        (acc: Record<string, string>, encabezado) => {
          if (!encabezado.id.startsWith('btn')) {
            acc[encabezado.id] = encabezado.label
          }
          return acc
        },
        {}
      )

      const datosFiltrados = datos.map((row: Cotizacion) => {
        const precio_u = parseFloat(row['precio_vta'])
        const cantidad = parseFloat(row['cantidad'])
        const precioVtaTot = precio_u * cantidad
        row.precio_vta_total = isNaN(precioVtaTot)
          ? '-'
          : precioVtaTot.toString()

        const filaOrdenada: Record<string, any> = {}

        encabezadosTablaCostos.forEach((col) => {
          if (!col.id.startsWith('btn')) {
            filaOrdenada[col.id] = row[col.id] ?? ''
          }
        })

        return filaOrdenada
      })

      const data = {
        data_renglones: datosFiltrados,
        headers: headers,
      }
      await useGenerarExcel(data, nombreExcel)
    }
  }
  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms))

  const enviarCotizacion = async () => {
    const tableData = getTableData()

    const nuevosCostos = []
    const idUser = currentUser.id.toString()

    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i].costoFinal !== null && tableData[i].idCompra === null) {
        const renglonActual = {
          idRenglon: tableData[i]['idRenglon'],
          idLicitacion: tableData[i]['idLicitacion'],
          idKairos: tableData[i]['idKairos'],
          costoFinal: tableData[i]['costoFinal'],
          mantenimiento: tableData[i]['mantenimiento'],
          observaciones: tableData[i]['observaciones'],
          codTarot: tableData[i]['codigoTarot'],
          idUsuario: idUser,
          fechora_comp: obtenerFechaYHoraActual(),
        }
        nuevosCostos.push(renglonActual)
      }
    }

    if (nuevosCostos.length === 0) {
      setTituloAlerta('NO HAY NUEVAS COTIZACIONES PARA ENVIAR')
      setMsgAlerta('Agregue nuevas cotizaciones para poder enviar')
      setAlertaCuidado(true)
      return
    }

    const agrupadosPorLicitacion: Record<string, Cotizacion[]> = {}

    nuevosCostos.forEach((renglon) => {
      const idLicitacion = renglon.idLicitacion

      if (!agrupadosPorLicitacion[idLicitacion]) {
        agrupadosPorLicitacion[idLicitacion] = []
      }

      agrupadosPorLicitacion[idLicitacion].push(renglon)
    })

    await Promise.all(
      Object.keys(agrupadosPorLicitacion).map(async (idLicitacion) => {
        const comprasLicitacion = agrupadosPorLicitacion[idLicitacion]

        await enviarNotificacionALicitadores(Number(idLicitacion))
        await crearComprasLicitacion({
          idLicitacion,
          idUsuario: idUser,
          compras: comprasLicitacion,
        })

        const dataLic = await obtenerLicitacionByID({ idLicitacion })

        await modificarLicitacion({
          idLicitacion: idLicitacion,
          dataLicitacion: {
            estado: 'COTIZADO',
            cliente: dataLic.cliente,
            fecha: dataLic.fecha,
            nroLic: dataLic.nroLic,
            tipo: dataLic.tipo,
            hora: dataLic.hora,
            objeto: dataLic.objeto,
            codCliente: dataLic.codCliente,
          },
        })

        await asociarUsuarioLicitacion(idLicitacion, currentUser.id)
      })
    )

    await delay(500)
    await llenarTablaCotizaciones()

    setTituloAlerta('COTIZACION ENVIADA')
    setMsgAlerta('COTIZACIONES ENVIADAS CORRECTAMENTE')
    setAlerta(true)
    setIncluirRenglones('todos')
  }

  const agregarRenglon = async () => {
    if (costo === '') {
      setTituloAlerta('CUIDADO')
      setMsgAlerta('EL COSTO NO PUEDE ESTAR VACÍO')
      setAlertaCuidado(true)
      return
    }
    if (!cotizacionToAdd) return

    await crearNuevaCompra({
      idRenglon: cotizacionToAdd['idRenglon'].toString(),
      idLicitacion: cotizacionToAdd['idLicitacion'].toString(),
      idKairos: cotizacionToAdd['idKairos']?.toString(),
      costoFinal: costo,
      mantenimiento: mantenimiento,
      observaciones: observaciones,
      codTarot: cotizacionToAdd['codigoTarot']?.toString(),
      idUsuario: currentUser.id.toString(),
      fechora_comp: obtenerFechaYHoraActual(),
    })

    setMsgAlerta('COTIZACIÓN AGREGADA')
    setTituloAlerta('ENVIADA')
    setAlerta(true)

    await enviarNotificacionALicitadores(cotizacionToAdd['idLicitacion'])

    await llenarTablaCotizaciones()
    await asociarUsuarioLicitacion(
      cotizacionToAdd['idLicitacion'].toString(),
      currentUser.id
    )

    setCotizacionToAdd(null)
    setIsModalAgregarOpen(false)
  }

  useEffect(() => {
    if (dataExcel.length === 0) return

    const nuevosRenglones = dataExcel
      .filter((fila) => fila['Costo U.'] != null && fila['Costo U.'] !== '')
      .map((fila) => ({
        idLicitacion: fila['IDLic'] ?? null,
        cliente: fila['Cliente'] ?? '',
        nroLic: fila['Nro Lic'] ?? '',
        idRenglon: fila['idRenglon'] ?? '',
        renglon: fila['R'] ?? '',
        cantidad: fila['Cant'] ?? '',
        descripcion: fila['Descripción (pliego)'] ?? '',
        codigoTarot: fila['Cod Tarot'] ?? '',
        idKairos: fila['IDKai'] ?? '',
        laboratorio: fila['Laboratorio'] ?? '',
        nombre_comercial: fila['Nombre Comercial'] ?? '',
        droga_presentacion: fila['Droga + Presentación (KAIROS)'] ?? '',
        ANMAT: fila['ANMAT'] ?? '',
        costoFinal: fila['Costo U.'] ?? '',
        mantenimiento: fila['Mantenimiento'] ?? '',
        observaciones: fila['Observaciones'] ?? '',
        valorizado: fila['Valorizado'] ?? '',
        fechora_comp: fila['FECHA'] ?? '',
        nombre_usuario: fila['NOMBRE USUARIO'] ?? '',
        idUsuario: null,
        idCompra: null,
      }))

    setCotizaciones(nuevosRenglones)
    setIsModalImportarOpen(false)
  }, [dataExcel])

  const enviarNotificacionALicitadores = async (idLicitacion: number) => {
    const dataLic = await obtenerLicitacionByID({
      idLicitacion: idLicitacion.toString(),
    })
    const usuariosLicitacion = dataLic.usuarios
    const mensaje =
      'Envío cotización de licitación ' +
      dataLic.nroLic +
      ', cliente ' +
      dataLic.cliente

    usuariosLicitacion.forEach((us: { rol: string; userName: string }) => {
      if (us.rol.toUpperCase().includes('LICITADOR')) {
        enviarNotificacion(us.userName, {
          usuario: currentUser.usuario,
          mensaje,
        })
      }
    })
  }

  const filtrosCambian = (
    filters: Record<string, any>,
    filteredSortedRows: Cotizacion[]
  ) => {
    setCantidadCostosFiltrados(filteredSortedRows.length)
  }

  const handleChangeRenglonesPrecio = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIncluirRenglones(e.target.value)
  }

  return (
    <Estructura>
      <div className="h-100 d-flex flex-column px-4 py-3">
        {/* Encabezado */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="headerTitle m-0 text-center flex-grow-1">
            COTIZACIONES
          </h1>
          <BotonAccion
            text="ENVIAR COTIZACION"
            className="boton-accion"
            onClick={enviarCotizacion}
          />
        </div>

        <div style={{ height: '10vh', overflow: 'hidden' }}>
          <FuncionalidadesTabla
            handleChangeRenglonesPrecio={handleChangeRenglonesPrecio}
            incluirRenglones={incluirRenglones}
            cantidadCostosFiltrados={cantidadCostosFiltrados}
            exportarExcel={exportarExcel}
            importarExcel={importarExcel}
            limpiarFiltros={limpiarFiltros}
            setIsModalLicitacionOpen={setIsModalLicitacionOpen}
            setIsModalNoAsocOpen={setIsModalNoAsocOpen}
            obtenerListaProductosTarot={obtenerEquivalenciaKairos}
          />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div className="row h-100 m-0">
            <div
              className={dataAuxOpen ? 'col-4' : 'd-none'}
              style={{ height: '100%', padding: 0 }}
            >
              <AuxiliarCotizaciones
                setOpen={setDataAuxOpen}
                open={dataAuxOpen}
                setDataAuxComponent={setDataAuxComponent}
                dataAuxComponent={dataAuxComponent}
              />
            </div>

            <div
              className={dataAuxOpen ? 'col-8' : 'col-12'}
              style={{
                height: '100%',
                padding: '0 10px',
                borderLeft: dataAuxOpen
                  ? '1px solid rgb(195, 194, 194)'
                  : 'none',
              }}
            >
              <VirtualizedTable
                nombreTabla={'cotizaciones'}
                rows={cotizaciones}
                setRows={setCotizaciones}
                columns={encabezadosTablaCostos}
                ref={tableRef}
                initialFilters={{
                  laboratorio: (
                    currentUser.otros.match(/&([^&]+)&/)?.[1] || ''
                  ).split(';'),
                }}
                onFiltersChange={filtrosCambian}
              />
            </div>
          </div>
        </div>
      </div>

      <ModalAgregarCotizacion
        agregarRenglon={agregarRenglon}
        cotizacionToAdd={
          cotizacionToAdd
            ? {
                cliente: cotizacionToAdd.cliente,
                cantidad: cotizacionToAdd.cantidad,
                descripcion: cotizacionToAdd.descripcion,
                laboratorio: cotizacionToAdd.laboratorio,
              }
            : null
        }
        isModalAgregarOpen={isModalAgregarOpen}
        costo={costo}
        setCosto={setCosto}
        setIsModalAgregarOpen={setIsModalAgregarOpen}
        mantenimiento={mantenimiento}
        setMantenimiento={setMantenimiento}
        observaciones={observaciones}
        setObservaciones={setObservaciones}
      />

      <ModalLicitacionesEnCurso
        isModalLicitacionOpen={isModalLicitacionOpen}
        setIsModalLicitacionOpen={setIsModalLicitacionOpen}
        licitacionesEnCurso={licitacionesEnCurso}
        setLicitacionesEnCurso={setLicitacionesEnCurso}
        setDataAuxComponent={setDataAuxComponent}
        setDataAuxOpen={setDataAuxOpen}
        setLicitacionElegida={setLicitacionElegida}
      />

      <ModalNoAsociados
        isModalNoAsocOpen={isModalNoAsocOpen}
        setIsModalNoAsocOpen={setIsModalNoAsocOpen}
      />
      <Modal
        isOpen={isModalImportarOpen}
        onClose={() => setIsModalImportarOpen(false)}
        title={'IMPORTAR EXCEL'}
      >
        <FileUpload
          setData={setDataExcel}
          encabezados={encabezadosTablaCostos}
          datosTabla={datosTablaExportar}
          paso={'Cotizaciones '}
          usarEncabezados={true}
        />
      </Modal>
      <Alert
        message={msgAlerta}
        titulo={tituloAlerta}
        duration={5000} // Duración en milisegundos
        setIsOpen={setAlerta}
        isOpen={alerta}
      />
      <AlertaCuidado
        message={msgAlerta}
        titulo={tituloAlerta}
        duration={5000}
        isOpen={alertaCuidado}
        setIsOpen={setAlertaCuidado}
      />
    </Estructura>
  )
}

export default Cotizaciones
