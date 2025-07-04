import React, { useState, useEffect, useRef, useCallback } from 'react'
import Button from '../../../components/Button/Button'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import InfoItem from '../../../components/InfoItem/InfoItem'
import Modal from '../../../components/Modal/Modal'
import FileUpload from '../../../components/FileUpload/FileUpload'
import { DTableCotizaciones } from './DTableCotizaciones'
import {
  ModalAddAlternativo,
  ModalDelelteAlternativo,
  ModalElegirRenglonACompletar,
  ModalFinLicitacion,
} from './ModalsSeleccion'
import {
  useObtenerLicitacionByID,
  useModificarRenglonesLicitacion,
  useAsociarUsuarioLicitacion,
} from '../../../services/connections/licitaciones.js'
import { useObtenerStockDeLicitacion } from '../../../services/connections/stock'
import { useGenerarExcel } from '../../../services/connections/documents'
import { formatearNumero } from '../../../services/functions'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../../services/SocketContext'
import './SeleccionCostos.css'
import Alert from '../../../components/Alert/Alert'
import AlertCuidado from '../../../components/Alert/AlertCuidado'
import volver from '../../../assets/volver.svg'
import {
  getEncabezadosTablaCotizaciones,
  getColumnasLicitacion,
} from './columnas'
import Estructura from '../../../components/Estructura/Estructura'
import { FiFileText, FiSave, FiEye, FiEyeOff } from 'react-icons/fi'

const SeleccionCostos = () => {
  const navigate = useNavigate()
  const [dataLicitacion, setDataLicitacion] = useState<{
    id?: string
    fecha: string
    tipo: string
    cliente: string
    nroLic: string
    objeto?: string
    hora?: string
  }>({ fecha: '', tipo: '', cliente: '', nroLic: '' })
  const [renglones, setRenglones] = useState<any[]>([])
  const [cotizaciones, setCotizaciones] = useState<any[]>([])
  const [precioTotal, setPrecioTotal] = useState<number | string>(0)
  const [modalAlternativoOpen, setModalAlternativoOpen] = useState(false)
  const [modalEliminarAlternativoOpen, setModalEliminarAlternativoOpen] =
    useState(false)
  const [datosTablaExportar, setDatosTablaExportar] = useState<any[]>([])
  const [isModalImportarOpen, setIsModalImportarOpen] = useState(false)
  const [isModalLlenarDemanda, setIsModalLlenarDemanda] = useState<
    React.SetStateAction<{
      isOpen: boolean
      renglonesAlt: any[]
      cotizacion: any
    }>
  >({
    isOpen: false,
    renglonesAlt: [],
    cotizacion: null,
  })
  const [modalFinalizarLicitacionOpen, setModalFinalizarLicitacionOpen] =
    useState(false)
  const { currentUser } = useSocket()
  const [alerta, setAlerta] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [verStock, setVerStock] = useState(true)
  const [modoPrecio, setModoPrecio] = useState('precio')
  const tableRef = useRef<any>(null)
  const obtenerLicitacionByID = useObtenerLicitacionByID()
  const modificarRenglonesLicitacion = useModificarRenglonesLicitacion()
  const asociarUsuarioLicitacion = useAsociarUsuarioLicitacion()
  const obtenerStockDeLicitacion = useObtenerStockDeLicitacion()
  const [dataExcel, setDataExcel] = useState<any[]>([])
  const elegirCotizacionRenglon = (row: any) => {
    const renglonesARellenar: any[] = []
    for (let i = 0; i < renglones.length; i++) {
      if (
        renglones[i].renglon === row.renglon ||
        renglones[i].renglon?.split(' ')[0] === row.renglon
      ) {
        renglonesARellenar.push(renglones[i])
      }
    }

    if (renglonesARellenar.length === 1) {
      setRenglones(() => {
        const datos = getTableData()
        return datos.map((r: any) =>
          r.renglon === row.renglon
            ? {
                ...r,
                nombre_comercial: row.nombre_comercial,
                laboratorio_elegido: row.laboratorio,
                ANMAT: row.ANMAT,
                costo_elegido: row.costoFinal,
              }
            : r
        )
      })
      setTimeout(() => {
        const index = getTableData()?.findIndex(
          (r: any) => r.renglon === row.renglon
        )

        if (index >= 0) {
          tableRef.current?.scrollToRow(index)
        }
      }, 50)
    } else {
      setIsModalLlenarDemanda({
        isOpen: true,
        renglonesAlt: renglonesARellenar,
        cotizacion: row,
      })
    }
  }

  const llenarRenglonesLicitacion = async (dataLic: any) => {
    const renglonesDeLicitacion = dataLic.renglones

    renglonesDeLicitacion.forEach((ren: any) => {
      if (ren.alternativo !== 0) {
        if (ren.alternativo === 1) {
          ren.renglon = ren.renglon + ' ALT'
        } else {
          ren.renglon = ren.renglon + ' ALT ' + ren.alternativo
        }
      }
    })
    setRenglones(renglonesDeLicitacion)
  }

  const llenarCotizacionesLicitacion = async (dataLic: any) => {
    const cotizacionesDeLicitacion = dataLic.cotizaciones
    if (!dataLic.id) return
    if (verStock) {
      const productosStock = await obtenerStockDeLicitacion(dataLic.id)
      if (!productosStock) return
      const cotizacionesConStock: any[] = [
        ...productosStock,
        ...cotizacionesDeLicitacion,
      ]
      setCotizaciones(cotizacionesConStock)
    } else {
      setCotizaciones(cotizacionesDeLicitacion)
    }
  }

  async function llenarDatos() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    const idLicitacion = params.get('id')

    if (idLicitacion) {
      const dataLic = await obtenerLicitacionByID({ idLicitacion })
      setDataLicitacion(dataLic)

      llenarRenglonesLicitacion(dataLic)
      llenarCotizacionesLicitacion(dataLic)
    }
  }

  useEffect(() => {
    llenarDatos()
  }, [])

  useEffect(() => {
    if (dataLicitacion) {
      llenarCotizacionesLicitacion(dataLicitacion)
    }
  }, [verStock])

  const getTableData = () => {
    if (tableRef.current) {
      const tableData = tableRef.current?.getData()
      return tableData
    }
  }
  const exportarExcelDemanda = async () => {
    const nombreExcel =
      'Demanda con costos  ' +
      dataLicitacion['fecha'].replaceAll('-', ' ') +
      ' ' +
      dataLicitacion['cliente'] +
      ' ' +
      dataLicitacion['tipo'] +
      ' ' +
      dataLicitacion['nroLic']
    const listaEncabezados = listaColumsLicitacion
    const datos = getTableData()

    const headers = listaEncabezados.reduce(
      (acc: { [key: string]: string }, encabezado) => {
        if (!encabezado.id.startsWith('btn')) {
          acc[encabezado.id] = encabezado.label
        }
        return acc
      },
      {}
    )

    const datosFiltrados = datos.map((row: any) => {
      const precio_u = parseFloat(row['precio_vta'])
      const cantidad = parseFloat(row['cantidad'])
      const precioVtaTot = precio_u * cantidad
      if (isNaN(precioVtaTot)) {
        row.precio_vta_total = '-'
      } else {
        row.precio_vta_total = precioVtaTot.toString()
      }
      const filaFiltrada = Object.keys(row)
        .filter((key) => headers.hasOwnProperty(key))
        .reduce((obj: { [key: string]: string }, key) => {
          obj[key] = row[key]
          return obj
        }, {})

      return filaFiltrada
    })

    const data = {
      TIPO: 'excel',
      data_renglones: datosFiltrados,
      headers: headers,
    }
    await useGenerarExcel(data, nombreExcel)
  }

  const exportarExcelCotizaciones = async () => {
    const nombreExcel =
      'Cotizaciones ' +
      dataLicitacion['fecha'].replaceAll('-', ' ') +
      ' ' +
      dataLicitacion['cliente'] +
      ' ' +
      dataLicitacion['tipo'] +
      ' ' +
      dataLicitacion['nroLic']
    const listaEncabezados = getEncabezadosTablaCotizaciones([''], () => null)
    const datos = cotizaciones

    const headers = listaEncabezados.reduce(
      (acc: { [key: string]: string }, encabezado) => {
        if (!encabezado.id.startsWith('btn')) {
          acc[encabezado.id] = encabezado.label
        }
        return acc
      },
      {}
    )

    const datosFiltrados = datos.map((row) => {
      const filaFiltrada = Object.keys(row)
        .filter((key) => headers.hasOwnProperty(key))
        .reduce((obj: { [key: string]: string }, key) => {
          obj[key] = row[key]
          return obj
        }, {})

      return filaFiltrada
    })
    const data = {
      TIPO: 'excel',
      data_renglones: datosFiltrados,
      headers: headers,
    }
    await useGenerarExcel(data, nombreExcel)
  }

  const calcularTotal = useCallback(
    (datos?: any[]) => {
      const tabla = datos || renglones
      let precioTot = 0

      for (let i = 0; i < tabla.length; i++) {
        const fila = tabla[i]

        if (fila.alternativo == 0 || fila.alternativo === undefined) {
          const cantidad = Number(fila.cantidad)
          const precioVta = Number(fila.precio_vta)
          const totalFila = cantidad * precioVta

          if (!isNaN(totalFila)) {
            precioTot += totalFila
          }
        }
      }

      const nuevoTotal = formatearNumero(precioTot)

      setPrecioTotal((prev) => (prev !== nuevoTotal ? nuevoTotal : prev))
    },
    [renglones]
  )

  const listaColumsLicitacion = getColumnasLicitacion(modoPrecio, calcularTotal)

  async function guardarCostosElegidos() {
    const contenidoTablaLicitacion = getTableData()
    const listaRenglonesAModificar: any[] = []

    contenidoTablaLicitacion.forEach((ren: any) => {
      if (ren.alternativo !== 0) {
        if (ren.idRenglon) {
          listaRenglonesAModificar.push({
            ...ren,
            renglon: ren['renglon'].split(' ')[0],
            nombre_comercial: ren['nombre_comercial'],
            laboratorio_elegido: ren['laboratorio_elegido'],
            costo_elegido: ren['costo_elegido'],
            ANMAT: ren['ANMAT'],
            precio_vta: ren['precio_vta'],
            observaciones: ren['observaciones'],
            margen: ren['margen'],
            observaciones_internas: ren['observaciones_internas'],
          })
        }
      } else {
        listaRenglonesAModificar.push({
          ...ren,
          nombre_comercial: ren['nombre_comercial'],
          laboratorio_elegido: ren['laboratorio_elegido'],
          ANMAT: ren['ANMAT'],
          costo_elegido: ren['costo_elegido'],
          precio_vta: ren['precio_vta'],
          observaciones: ren['observaciones'],
          margen: ren['margen'],
          observaciones_internas: ren['observaciones_internas'],
        })
      }
    })

    if (listaRenglonesAModificar.length > 0) {
      await modificarRenglonesLicitacion({
        idLicitacion: dataLicitacion?.id || '',
        renglones: listaRenglonesAModificar,
      })
    }

    await asociarUsuarioLicitacion(dataLicitacion.id || '', currentUser.id)
    if (modalFinalizarLicitacionOpen === false) {
      setTituloAlerta('LICITACIÓN GUARDADA')
      setMsgAlerta('¡Los cambios en la licitación se guardaron correctamente!')
      setAlerta(true)
      navigate(`/seleccion_costos?id=${dataLicitacion.id}`)
    }
  }

  const verificarAlternativos = () => {
    const hayAlternativo = () => {
      const filas = renglones
      for (let i = 0; i < filas.length; i++) {
        if (filas[i]['alternativo'] !== 0) {
          return true
        }
      }
      return false
    }

    if (hayAlternativo()) {
      setModalEliminarAlternativoOpen(true)
    } else {
      setAlertaCuidado(true)
      setTituloAlerta('NO HAY ALTERNATIVOS PARA ELIMINAR')
      setMsgAlerta(
        'Para poder eliminar un reglón alternativo debe existir uno.'
      )
    }
  }

  const TotalDemanda = ({ precioTotal }: { precioTotal: string | number }) => {
    return (
      <div className="contentTotal">
        <p className="totalDemanda">TOTAL: ${precioTotal}</p>
      </div>
    )
  }

  const handleChangeRenglonesPrecio = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setModoPrecio(e.target.value)
  }

  useEffect(() => {
    const resizer = document.getElementById('resizer') as HTMLElement | null
    const leftPanel = document.getElementById(
      'panelTablaDemanda'
    ) as HTMLElement | null

    let x = 0
    let leftWidth = 0

    const mouseDownHandler = function (e: MouseEvent) {
      if (leftPanel) {
        x = e.clientX
        leftWidth = leftPanel.getBoundingClientRect().width

        document.addEventListener('mousemove', mouseMoveHandler)
        document.addEventListener('mouseup', mouseUpHandler)
        document.body.style.cursor = 'col-resize'
      }
    }

    const mouseMoveHandler = function (e: MouseEvent) {
      if (leftPanel && resizer) {
        const dx = e.clientX - x
        const containerWidth =
          (resizer.parentNode as HTMLElement)?.getBoundingClientRect().width ||
          0
        const newLeftWidth = ((leftWidth + dx) * 100) / containerWidth
        if (newLeftWidth > 20 && newLeftWidth < 80) {
          leftPanel.style.flexBasis = `${newLeftWidth}%`
        }
      }
    }

    const mouseUpHandler = function () {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
      document.body.style.cursor = 'default'
    }

    if (resizer) {
      resizer.addEventListener('mousedown', mouseDownHandler)
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener('mousedown', mouseDownHandler)
      }
    }
  }, [])

  const importarExcel = () => {
    if (tableRef.current) {
      // const todosLosDatos = tableRef.current.getFilteredData()

      setDatosTablaExportar(renglones)
    }
    setIsModalImportarOpen(true)
  }
  useEffect(() => {
    if (dataExcel.length === 0) return

    const nuevosRenglones = dataExcel.map((fila) => ({
      alternativo: fila['idalternativo'] ?? '',
      codigoTarot: fila['idcodigoTarot'] ?? '',
      idLicitacion: fila['idLicitacion'] ?? '',
      idRenglon: fila['idRenglon'] ?? '',
      renglon: fila['R'] ?? '',
      cantidad: fila['CANT'] ?? '',
      descripcion: fila['DESCRIPCIÓN'] ?? '',
      descripcionTarot: fila['NOMBRE TAROT'] ?? '',
      nombre_comercial: fila['NOMBRE COMERCIAL'] ?? '',
      laboratorio_elegido: fila['LAB ELEGIDO'] ?? '',
      ANMAT: fila['ANMAT'] ?? '',
      costo_elegido: fila['COSTO ELEGIDO'] ?? '',
      precio_vta: fila['PRECIO VTA'] ?? '',
      precio_vta_total: fila['PRECIO TOTAL'] ?? '',
      observaciones: fila['OBSERVACIONES CLIENTE'] ?? '',
      margen: fila['MARGEN'] ?? '',
      observaciones_internas: fila['OBSERVACIONES INTERNAS'] ?? '',
    }))

    setRenglones(nuevosRenglones)
    setIsModalImportarOpen(false)
  }, [dataExcel])
  useEffect(() => {
    calcularTotal(renglones)
  }, [renglones])

  return (
    <Estructura rutaVolver="/menu_licitaciones">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div style={{ width: '300px' }} />
        <h1
          className="headerTitle m-0"
          style={{ textAlign: 'center' }}
        >
          SELECCIÓN DE COSTOS
        </h1>
        <div
          style={{
            width: '300px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            text="GUARDAR"
            icon={
              <FiSave
                size={18}
                style={{ marginRight: '8px' }}
              />
            }
            className="boton-accion"
            onClick={guardarCostosElegidos}
          />

          <Button
            text="GENERAR PDF"
            icon={
              <FiFileText
                size={18}
                style={{ marginRight: '8px' }}
              />
            }
            className="boton-accion"
            onClick={() => setModalFinalizarLicitacionOpen(true)}
          />
        </div>
      </div>

      {/* INFO CLIENTE */}
      <div style={{ height: '10vh', overflow: 'hidden' }}>
        <div className="data-cliente-row">
          <InfoItem
            fieldName={'CLIENTE'}
            value={dataLicitacion['cliente']}
          />
          <InfoItem
            fieldName={'OBJETO'}
            value={dataLicitacion?.['objeto'] || ''}
          />
          <InfoItem
            fieldName={'FECHA'}
            value={dataLicitacion['fecha']}
          />
          <InfoItem
            fieldName={'TIPO'}
            value={dataLicitacion['tipo']}
          />
          <InfoItem
            fieldName={'HORA'}
            value={dataLicitacion?.['hora'] || ''}
          />
          <InfoItem
            fieldName={'N° C/L'}
            value={dataLicitacion['nroLic']}
          />
        </div>
      </div>

      <div
        style={{
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex' }}>
          <div
            style={{
              width: '50%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2px',
              alignItems: 'center',
            }}
          >
            <h2 className="subTitle">Demanda</h2>
            <Button
              id="btnImportarExcel"
              title="Importar Excel"
              className="btnFuncTabla"
              text={'Importar Excel'}
              onClick={importarExcel}
            />
            <Button
              text="Agregar Alt"
              onClick={() => setModalAlternativoOpen(true)}
              className="btnFuncTabla"
            />
            <Button
              text="Eliminar Alt"
              onClick={verificarAlternativos}
              className="btnFuncTabla"
            />
            <div
              onChange={handleChangeRenglonesPrecio}
              className="ms-2"
            >
              <label className="me-2">
                <input
                  type="radio"
                  name="opcionRenglones"
                  value="precio"
                  defaultChecked
                />{' '}
                POR PRECIO
              </label>
              <label>
                <input
                  type="radio"
                  name="opcionRenglones"
                  value="margen"
                />{' '}
                POR MARGEN
              </label>
            </div>
          </div>

          {/* COTIZACIONES */}
          <div
            style={{
              width: '50%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              <div>
                <h2 className="subTitle">Cotizaciones</h2>
              </div>
              <div>
                <p id="p_menorCosto">MENOR COSTO</p>
                <p id="p_masReciente">MÁS RECIENTE</p>
                <p id="p_stock">STOCK</p>
              </div>
              <div>
                <Button
                  text={
                    <>
                      {verStock ? (
                        <>
                          <FiEyeOff style={{ marginRight: '8px' }} />
                          Ocultar Stock
                        </>
                      ) : (
                        <>
                          <FiEye style={{ marginRight: '8px' }} />
                          Ver Stock
                        </>
                      )}
                    </>
                  }
                  className="btnFuncTabla"
                  onClick={() => setVerStock(!verStock)}
                />
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div
            id="panelTablaDemanda"
            style={{
              flexBasis: '50%',
              flexShrink: 0,
              flexGrow: 0,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <VirtualizedTable
              rows={renglones}
              setRows={setRenglones}
              columns={listaColumsLicitacion}
              ref={tableRef}
            />
            <div className="px-3">
              <TotalDemanda precioTotal={precioTotal} />
              <p className="text-end">
                El total no incluye el precio de los alternativos
              </p>
            </div>
          </div>

          {/* RESIZER */}
          <div
            id="resizer"
            style={{
              width: '6px',
              cursor: 'col-resize',
              backgroundColor: '#ccc',
            }}
          />

          {/* COTIZACIONES */}
          <div
            id="panelTablaCotizaciones"
            style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              margin: '5px',
            }}
          >
            <DTableCotizaciones
              rows={cotizaciones}
              setRows={setCotizaciones}
              elegirCotizacionRenglon={elegirCotizacionRenglon}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalImportarOpen}
        onClose={() => setIsModalImportarOpen(false)}
        title={'IMPORTAR EXCEL'}
      >
        <FileUpload
          setData={setDataExcel}
          encabezados={listaColumsLicitacion}
          datosTabla={datosTablaExportar}
          paso={'Seleccion de Costos '}
          usarEncabezados={true}
        />
      </Modal>
      <ModalAddAlternativo
        renglones={renglones}
        setRenglones={setRenglones}
        isOpen={modalAlternativoOpen}
        setIsOpen={setModalAlternativoOpen}
      />

      <ModalDelelteAlternativo
        renglones={renglones}
        setRenglones={setRenglones}
        isOpen={modalEliminarAlternativoOpen}
        setIsOpen={setModalEliminarAlternativoOpen}
      />

      <ModalElegirRenglonACompletar
        renglones={renglones}
        setRenglones={setRenglones}
        tableRef={tableRef}
        isModalLlenarDemanda={isModalLlenarDemanda}
        setIsModalLlenarDemanda={setIsModalLlenarDemanda}
      />

      <ModalFinLicitacion
        isOpen={modalFinalizarLicitacionOpen}
        setIsOpen={setModalFinalizarLicitacionOpen}
        data_cliente={dataLicitacion}
        data_renglones={renglones}
        total={precioTotal}
        guardarCostosElegidos={guardarCostosElegidos}
      />
      <AlertCuidado
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
    </Estructura>
  )
}

export default SeleccionCostos

export const SeleccionCostosHeaderContent = ({
  guardarCostosElegidos,
  setModalFinalizarLicitacionOpen,
}: {
  guardarCostosElegidos: () => void
  setModalFinalizarLicitacionOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const navigate = useNavigate()

  return (
    <div className="encabezado-costos position-relative d-flex justify-content-center align-items-center">
      <div className="btn-volver position-absolute start-0 ms-3">
        <Button
          className="btnBack"
          icon={
            <img
              src={volver}
              alt="volver"
            />
          }
          onClick={() => navigate('/menu_licitaciones')}
        />
      </div>

      <div className="d-flex flex-column flex-md-row align-items-center gap-3 text-center">
        <h1 className="headerTitle m-0">3 - SELECCIÓN DE COSTOS</h1>
        <div className="d-flex flex-row gap-2">
          <Button
            text="GUARDAR"
            className="btnHeader2"
            onClick={guardarCostosElegidos}
          />
          <Button
            text="GENERAR PDF"
            className="btnHeader2"
            onClick={() => setModalFinalizarLicitacionOpen(true)}
          />
        </div>
      </div>
    </div>
  )
}
