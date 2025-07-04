import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatearNumero } from '../../../services/functions'
import {
  useObtenerLicitacionByID,
  useModificarPreganadoRenglonesLicitacion,
} from '../../../services/connections/licitaciones'
import Button from '../../../components/Button/Button'
import Estructura from '../../../components/Estructura/Estructura'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import InfoItem from '../../../components/InfoItem/InfoItem'
import agregarIco from '../../../assets/add.svg'
import ModalsPreGanados from './ModalsPreGanados'
import Alert from '../../../components/Alert/Alert'
import AlertErrores from '../../../components/Alert/AlertErrores'
import { Column } from '../../../types/TableTypes'

const PreGanados = () => {
  const [dataLicitacion, setDataLicitacion] = useState<any>({})
  const [renglones, setRenglones] = useState<any[]>([])
  const [precioTotal, setPrecioTotal] = useState(0)
  const obtenerLicitacionByID = useObtenerLicitacionByID()
  const modificarPreganadoRenglonesLicitacion =
    useModificarPreganadoRenglonesLicitacion()
  const tableRef = useRef<any>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [tableModalRows, setTableModalRows] = useState<any>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [idRenglonSeleccionado, setIdRenglonSeleccionado] = useState<
    string | null
  >(null)
  const navigate = useNavigate()

  const handleAbrirModal = (row: any) => {
    setIdRenglonSeleccionado(row.idRenglon)
    const renglonSeleccionado = renglones.find(
      (r: any) => r.renglon === row.idRenglon
    )
    setTableModalRows(renglonSeleccionado ? [renglonSeleccionado] : [])
    setModalOpen(true)
  }

  const handleCerrarModal = () => {
    // Si los datos en el modal han sido modificados, actualiza los renglones
    if (tableModalRows.length > 0) {
      setRenglones((prevRenglones: any) => {
        return prevRenglones.map((r: any) =>
          r.renglon === idRenglonSeleccionado
            ? { ...r, ...tableModalRows[0] }
            : r
        )
      })
    }
    setModalOpen(false)
    setIdRenglonSeleccionado(null) // Resetear el ID cuando se cierra el modal
  }

  const handleGuardar = async () => {
    try {
      const datosActualizados = tableRef.current?.getData()

      const datosParaGuardar = datosActualizados.map((renglon: any) => {
        const datosRenglon = {
          idRenglon: renglon.idRenglon,
          preganado: renglon.preganado,
          mes_estimado_entrega: renglon.mes_estimado_entrega,
        }
        return datosRenglon
      })

      const resultado = await modificarPreganadoRenglonesLicitacion({
        idLicitacion: dataLicitacion.id,
        renglones: datosParaGuardar,
      })
      setAlertMessage('Guardado Exitosamente')
      setAlertOpen(true)
    } catch (error: any) {
      console.error('Error completo al guardar renglones:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      })
      setAlertaError(true)
      setTituloAlerta('ERROR')
      setAlertMessage('¡Ocurrió un error al guardar los renglones!')
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
      } catch (error) {
        console.error('Error obteniendo los datos:', error)
      }
    }
  }

  useEffect(() => {
    llenarDatos()
  }, [])

  const listaColumsLicitacion: Column[] = [
    {
      id: 'preganado',
      label: 'Pre',
      width: '40px',
      type: 'checkbox',
      editable: (row) => row.preganadoEditable !== false,
    },
    {
      id: 'mes_estimado_entrega',
      label: 'Mes estimado de entrega',
      width: '200px',
      options: true,
      type: 'month',
      editable: (row) => row.mesEditable !== false,
    },
    {
      id: 'renglon',
      label: 'Renglon',
      width: '70px',
      type: 'number',
      editable: false,
      options: true,
    },
    {
      id: 'cantidad',
      label: 'Cantidad',
      width: '70px',
      type: 'number',
      editable: false,
      options: true,
    },
    {
      id: 'descripcion',
      label: 'Descripcion',
      width: '290px',
      editable: false,
      options: true,
    },
    {
      id: 'laboratorio_elegido',
      label: 'Laboratorio Elegido',
      width: '230px',
      editable: false,
      options: true,
    },
    {
      id: 'costo_elegido',
      label: 'Costo Elegido',
      width: '120px',
      editable: false,
      options: true,
      value: (row) => {
        const costo_elegido = parseFloat(row['costo_elegido'])

        return '$ ' + formatearNumero(costo_elegido.toString())
      },
    },
    {
      id: 'precio_vta',
      label: 'Precio Venta Elegido',
      width: '150px',
      editable: false,
      options: true,
      value: (row) => {
        const precio_vta = parseFloat(row['precio_vta'])

        return '$ ' + formatearNumero(precio_vta.toString())
      },
    },
    {
      id: 'precio_vta_total',
      label: 'Precio Venta Total',
      width: '150px',
      options: true,
      editable: false,
      value: (row) => {
        const precio_u = parseFloat(row['precio_vta'])
        const cantidad = parseFloat(row['cantidad'])
        const precioVtaTot = precio_u * cantidad

        row.precio_vta_total = precioVtaTot

        if (isNaN(precioVtaTot)) return '-'

        setTimeout(() => {
          calcularTotal()
        }, 10)

        return '$ ' + formatearNumero(precioVtaTot.toString())
      },
    },

    {
      id: 'btn',
      label: 'Agregar',
      width: '110px',
      editable: false,
      ico: agregarIco,
      onclick: handleAbrirModal,
    },
  ]

  const getTableData = () => {
    if (tableRef.current) {
      const tableData = tableRef.current.getData()
      return tableData
    }
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

    setPrecioTotal((prevTotal: any) => {
      const nuevoTotal = formatearNumero(precioTot)
      return prevTotal !== nuevoTotal ? nuevoTotal : prevTotal
    })
  }, [])

  const TotalDemanda = ({ precioTotal }: { precioTotal: string | number }) => {
    return (
      <div className="contentTotal">
        <p className="totalDemanda">TOTAL: ${precioTotal}</p>
      </div>
    )
  }
  const llenarRenglonesLicitacion = (dataLic: any) => {
    if (!dataLic || !dataLic.renglones) return

    const renglonesFiltrados = dataLic.renglones
      .filter((r: any) => r.alternativo === 0)
      .map((r: any) => {
        const tienePrecio = !!r.precio_vta && r.precio_vta !== ''
        return {
          ...r,
          preganado: r.preganado || false,
          mes_estimado_entrega: r.mes_estimado_entrega || '',
          mesEditable: tienePrecio,
          preganadoEditable: tienePrecio,
        }
      })

    setRenglones(renglonesFiltrados)
  }
  return (
    <Estructura rutaVolver="/menu_licitaciones">
      <div
        className="d-flex flex-column"
        style={{ height: '100vh', padding: '1rem' }}
      >
        {/* Fila de título y botón */}
        <div className="row align-items-center justify-content-center mb-3">
          <div className="col-4 d-flex justify-content-start" />
          <div className="col-4 text-center">
            <h1 className="headerTitle m-0">4- PREGANADOS</h1>
          </div>

          <div className="col-4 d-flex justify-content-end">
            <Button
              text={'GUARDAR'}
              className={'boton-accion'}
              onClick={handleGuardar}
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
              value={dataLicitacion['objeto']}
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
              value={dataLicitacion['hora']}
            />
            <InfoItem
              fieldName="N° C/L"
              value={dataLicitacion['nroLic']}
            />
          </div>
        </div>
        <div
          style={{
            height: '80vh',
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flexGrow: 1, overflowY: 'auto', margin: '5px' }}>
            <VirtualizedTable
              rows={renglones}
              columns={listaColumsLicitacion}
              setRows={setRenglones}
              ref={tableRef}
            />
          </div>
          <div style={{ flexShrink: 0 }}>
            <TotalDemanda precioTotal={precioTotal} />
          </div>
        </div>
      </div>
      <ModalsPreGanados
        isOpen={modalOpen}
        onClose={handleCerrarModal}
        idRenglon={idRenglonSeleccionado}
        /* tableRows={tableModalRows}
        setTableRows={setTableModalRows} */
      />
      <Alert
        isOpen={alertOpen}
        setIsOpen={setAlertOpen}
        message={alertMessage}
      />
      <AlertErrores
        setIsOpen={setAlertaError}
        isOpen={alertaError}
        message={alertMessage}
        titulo={tituloAlerta}
      />
    </Estructura>
  )
}
export default PreGanados
