import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '../../../components/Button/Button'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import InfoItem from '../../../components/InfoItem/InfoItem'
import { ModalFinLicitacion } from '../SeleccionCostos/ModalsSeleccion'
import { useObtenerLicitacionByID } from '../../../services/connections/licitaciones'
import { useObtenerStockDeLicitacion } from '../../../services/connections/stock'
import { useGenerarExcel } from '../../../services/connections/documents'
import { formatearNumero } from '../../../services/functions'
import '../SeleccionCostos/SeleccionCostos.css'
import { getEncabezadosTablaCotizaciones } from '../SeleccionCostos/columnas'
import { DTableCotizaciones } from '../SeleccionCostos/DTableCotizaciones'
import { Column } from '../../../types/TableTypes'
import Estructura from '../../../components/Estructura/Estructura'
import { FiFileText, FiUpload, FiEye, FiEyeOff } from 'react-icons/fi'

const VistaLicitacion = () => {
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
  const [modalFinalizarLicitacionOpen, setModalFinalizarLicitacionOpen] =
    useState(false)
  const [verStock, setVerStock] = useState(true)
  const tableRef = useRef<any>(null)
  const obtenerLicitacionByID = useObtenerLicitacionByID()
  const obtenerStockDeLicitacion = useObtenerStockDeLicitacion()

  const listaColumsLicitacion: Column[] = [
    {
      id: 'renglon',
      label: 'R',
      width: '60px',
      type: 'number',
      editable: false,
    },
    {
      id: 'cantidad',
      label: 'Cantidad',
      width: '70px',
      type: 'number',
      editable: false,
    },
    {
      id: 'descripcion',
      label: 'Descripcion',
      width: '300px',
      editable: false,
    },
    {
      id: 'nombre_comercial',
      label: 'Nombre Comercial',
      width: '100px',
      editable: false,
    },
    {
      id: 'laboratorio_elegido',
      label: 'Lab Elegido',
      width: '100px',
      editable: false,
    },
    { id: 'ANMAT', label: 'ANMAT', width: '60px', editable: false },
    {
      id: 'costo_elegido',
      label: 'Costo Elegido',
      width: '90px',
      editable: false,
      type: 'number',
      value: (row) => '$ ' + formatearNumero(row['costo_elegido']),
    },
    {
      id: 'precio_vta',
      label: 'Precio Venta',
      width: '90px',
      editable: false,
      type: 'number',
      value: (row) => '$ ' + formatearNumero(row['precio_vta']),
    },
    {
      id: 'precio_vta_total',
      label: 'Precio Venta Total',
      width: '110px',
      editable: false,
      type: 'number',
      value: (row) => '$ ' + formatearNumero(row['precio_vta_total']),
    },
    {
      id: 'observaciones',
      label: 'Observaciones Cliente',
      width: '115px',
      editable: false,
    },
    {
      id: 'margen',
      label: 'Margen',
      width: '65px',
      editable: false,
      value: (row) => {
        const precio_vta = parseFloat(row['precio_vta'])
        if (isNaN(precio_vta)) return '-'
        const costo_elegido = parseFloat(row['costo_elegido'])
        if (isNaN(costo_elegido)) return '-'
        const margen = ((precio_vta - costo_elegido) / precio_vta) * 100
        return formatearNumero(margen) + '%'
      },
    },
    { id: 'codigoTarot', label: 'COD TAROT', width: '1px', visible: false },
    {
      id: 'observaciones_internas',
      label: 'Observaciones Internas',
      width: '110px',
      editable: false,
    },
  ]

  const listaEncabezadosCotizaciones = getEncabezadosTablaCotizaciones(
    [''],
    () => null
  )

  const llenarRenglonesLicitacion = async (dataLic: any) => {
    const renglonesDeLicitacion = dataLic.renglones.map((ren: any) => {
      if (ren.alternativo !== 0) {
        if (ren.alternativo === 1) {
          ren.renglon = ren.renglon + ' ALT'
        } else {
          ren.renglon = ren.renglon + ' ALT ' + ren.alternativo
        }
      }
      const precio_u = parseFloat(ren.precio_vta)
      const cantidad = parseFloat(ren.cantidad)
      const precioVtaTot =
        isNaN(precio_u) || isNaN(cantidad) ? 0 : precio_u * cantidad

      return {
        ...ren,
        precio_vta_total: precioVtaTot,
      }
    })

    setRenglones(renglonesDeLicitacion)
  }

  useEffect(() => {
    calcularTotal()
  }, [renglones])

  const llenarCotizacionesLicitacion = async (dataLic: any) => {
    const cotizacionesDeLicitacion = dataLic.cotizaciones
    if (!dataLic.id) return
    if (verStock) {
      const productosStock = await obtenerStockDeLicitacion(dataLic.id)
      if (!productosStock) return
      const cotizacionesConStock = [
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
      try {
        const dataLic = await obtenerLicitacionByID({ idLicitacion })
        setDataLicitacion(dataLic)

        llenarRenglonesLicitacion(dataLic)
        llenarCotizacionesLicitacion(dataLic)
      } catch (error) {
        console.error('Error obteniendo los datos:', error)
      }
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
    const datos = cotizaciones

    const headers = listaEncabezadosCotizaciones.reduce(
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

  const calcularTotal = useCallback(() => {
    const tableData = getTableData()
    let precioTot = 0

    setRenglones((prevRenglones) => {
      return JSON.stringify(prevRenglones) !== JSON.stringify(tableData)
        ? tableData
        : prevRenglones
    })

    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i].alternativo === 0) {
        const totalFila = tableData[i].precio_vta_total
        if (totalFila !== undefined && !isNaN(Number(totalFila))) {
          precioTot += totalFila
        }
      }
    }

    setPrecioTotal((prevTotal) => {
      const nuevoTotal = formatearNumero(precioTot)
      return prevTotal !== nuevoTotal ? nuevoTotal : prevTotal
    })
  }, [getTableData])

  const TotalDemanda = ({ precioTotal }: { precioTotal: string | number }) => {
    return (
      <div className="contentTotal">
        <p className="totalDemanda">TOTAL: ${precioTotal}</p>
      </div>
    )
  }

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
          VISTA DE LICITACION
        </h1>
        <div
          style={{
            width: '300px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            text={'GENERAR PDF'}
            icon={
              <FiFileText
                size={18}
                style={{ marginRight: '8px' }}
              />
            }
            className={'boton-accion'}
            onClick={() => setModalFinalizarLicitacionOpen(true)}
          />
        </div>
      </div>
      <div style={{ height: '10vh', overflow: 'hidden' }}>
        <div className="data-cliente-row">
          <InfoItem
            fieldName="CLIENTE"
            value={dataLicitacion['cliente']}
          />
          <InfoItem
            fieldName="OBJETO"
            value={dataLicitacion?.['objeto'] || ''}
          />
          <InfoItem
            fieldName="FECHA"
            value={dataLicitacion['fecha']}
          />
          <InfoItem
            fieldName="TIPO"
            value={dataLicitacion['tipo']}
          />
          <InfoItem
            fieldName="HORA"
            value={dataLicitacion?.['hora'] || ''}
          />
          <InfoItem
            fieldName="N° C/L"
            value={dataLicitacion['nroLic']}
          />
        </div>
      </div>

      <div
        className="row"
        style={{ height: '80vh', overflow: 'hidden', margin: '2px' }}
      >
        <div
          className="col-12 col-md-6 d-flex flex-column"
          style={{ height: '100%' }}
        >
          <div
            className="row align-items-center"
            style={{ flexShrink: 0 }}
          >
            <div className="col-12 col-sm-3 mb-2 mb-sm-0">
              <h2 className="subTitle mb-0">Demanda</h2>
            </div>
            <div className="col-12 col-sm-3 mb-2 mb-sm-0">
              <Button
                className="btnFuncTabla"
                text={
                  <>
                    <FiUpload style={{ marginRight: '8px' }} />
                    Exportar Excel
                  </>
                }
                onClick={exportarExcelDemanda}
              />
            </div>
          </div>

          <VirtualizedTable
            rows={renglones}
            setRows={setRenglones}
            columns={listaColumsLicitacion}
            ref={tableRef}
          />

          <div style={{ flexShrink: 0 }}>
            <TotalDemanda precioTotal={precioTotal} />
            <p className="text-end mb-0 px-2">
              El total no incluye el precio de los alternativos
            </p>
          </div>
        </div>

        <div
          className="col-12 col-md-6 d-flex flex-column"
          style={{ height: '100%' }}
        >
          <div
            className="row align-items-center"
            style={{ flexShrink: 0 }}
          >
            <div className="col-12 col-sm-3">
              <h2 className="subTitle">Cotizaciones</h2>
            </div>
            <div className="col-6 col-sm-3 mt-2 mt-sm-0">
              <p id="p_menorCosto">MENOR COSTO</p>
              <p id="p_masReciente">MÁS RECIENTE</p>
              <p id="p_stock">STOCK</p>
            </div>
            <div className="col-6 col-sm-3 mt-2 mt-sm-0">
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
            <div className="col-6 col-sm-3 mt-2 mt-sm-0">
              <Button
                className="btnFuncTabla"
                text={
                  <>
                    <FiUpload style={{ marginRight: '8px' }} />
                    Exportar Excel
                  </>
                }
                onClick={exportarExcelCotizaciones}
              />
            </div>
          </div>

          {/* <VirtualizedTable
            rows={cotizaciones}
            setRows={setCotizaciones}
            columns={listaEncabezadosCotizaciones}
          /> */}
          <DTableCotizaciones
            rows={cotizaciones}
            setRows={setCotizaciones}
            elegirCotizacionRenglon={() => null}
          />
        </div>
      </div>
      <ModalFinLicitacion
        isOpen={modalFinalizarLicitacionOpen}
        setIsOpen={setModalFinalizarLicitacionOpen}
        data_cliente={dataLicitacion}
        data_renglones={renglones}
        total={precioTotal}
        guardarCostosElegidos={() => {}}
      />
    </Estructura>
  )
}

export default VistaLicitacion
