import { useEffect, useRef, useState } from 'react'
import Modal from '../../../components/Modal/Modal'
import FormReutilizable from '../../../components/DynamicForm/FormReutilizable'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import Button from '../../../components/Button/Button'
import borrarIco from '../../../assets/trash.svg'
import editarIco from '../../../assets/edit.svg'
import Alert from '../../../components/Alert/Alert'
import AlertCuidado from '../../../components/Alert/AlertCuidado'
import AlertErrores from '../../../components/Alert/AlertErrores'
import AlertOptions from '../../../components/Alert/AlertOptions'
import {
  useObtenerRealesDeRenglon,
  useCrearNuevoReal,
  useEliminarReal,
  useModificarReal,
} from '../../../services/connections/reales.js'
import { Field } from '../../../components/DynamicForm/FormReutilizableTypes'

const ModalsPreGanados = ({
  isOpen,
  onClose,
  idRenglon,
}: {
  isOpen: boolean
  onClose: () => void
  idRenglon: string | null
}) => {
  const [formData, setFormData] = useState({
    cantidad_real: '',
    costo_real: '',
    precio_real: '',
    laboratorio_real: '',
  })
  const [tableRows, setTableRows] = useState<any[]>([])
  const [rowToDelete, setRowToDelete] = useState<{ idReal: number } | null>(
    null
  )
  const [isAlertEliminarReal, setIsAlertEliminarReal] = useState(false)
  const [alerta, setAlerta] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [modoEditar, setModoEditar] = useState(false)
  const [idEditando, setIdEditando] = useState(null)
  const modificarReal = useModificarReal()
  const formRef = useRef<any>(null)
  const obtenerRealesDeRenglon = useObtenerRealesDeRenglon()
  const crearNuevoReal = useCrearNuevoReal()
  const eliminarReal = useEliminarReal()

  const camposFormulario: Field[] = [
    {
      nombreCampo: 'cantidad_real',
      labelText: 'Cantidad Real',
      type: 'number',
    },
    { nombreCampo: 'costo_real', labelText: 'Costo Real', type: 'number' },
    { nombreCampo: 'precio_real', labelText: 'Precio Real', type: 'number' },
    {
      nombreCampo: 'laboratorio_real',
      labelText: 'Laboratorio Real',
      type: 'text',
    },
  ]
  useEffect(() => {
    if (modoEditar && formRef.current && formData) {
      Object.entries(formData).forEach(([key, value]) => {
        formRef.current?.setFieldValue(key, value)
      })
    }
  }, [modoEditar, formData])

  useEffect(() => {
    if (!idRenglon) return
    const obtenerReales = async () => {
      const reales = await obtenerRealesDeRenglon(idRenglon)

      setTableRows(reales)
    }

    obtenerReales()
  }, [idRenglon])

  const handleAgregar = async () => {
    const datosForm = formRef.current?.getFormData?.()

    if (!datosForm) return
    const vacios = Object.values(datosForm).some((v) => v === '')
    if (vacios) {
      setAlertaCuidado(true)
      setTituloAlerta('CAMPOS INCOMPLETOS')
      setMsgAlerta('¡Por favor complete todos los campos!')
      return
    }

    try {
      if (!idRenglon) {
        setAlertaCuidado(true)
        setTituloAlerta('CUIDADO')
        setMsgAlerta('ID de renglón inválido')
        return
      }

      if (modoEditar && idEditando) {
        await modificarReal(idEditando, {
          cantidad_real: datosForm.cantidad_real,
          costo_real: datosForm.costo_real,
          precio_real: datosForm.precio_real,
          laboratorio_real: datosForm.laboratorio_real.toString().trim(),
          idRenglon: Number(idRenglon),
        })
        setAlerta(true)
        setTituloAlerta('EXITO')
        setMsgAlerta('¡El renglón se modificó correctamente.!')
      } else {
        await crearNuevoReal({
          cantidad_real: datosForm.cantidad_real,
          costo_real: datosForm.costo_real,
          precio_real: datosForm.precio_real,
          laboratorio_real: datosForm.laboratorio_real.toString().trim(),
          idRenglon: Number(idRenglon),
        })

        setAlerta(true)
        setTituloAlerta('EXITO')
        setMsgAlerta('¡Guardado exitosamente!')
      }

      // Refrescar tabla desde la fuente después de guardar
      const realesActualizados = await obtenerRealesDeRenglon(idRenglon)
      setTableRows(realesActualizados)

      // Limpiar formulario y resetear estado
      setFormData({
        cantidad_real: '',
        costo_real: '',
        precio_real: '',
        laboratorio_real: '',
      })
      setModoEditar(false)
      setIdEditando(null)
    } catch (error: any) {
      console.error('Error completo:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      })
      setAlertaError(true)
      setTituloAlerta('ERROR')
      setMsgAlerta('¡Error al guardar!')
    }
  }

  const handleEliminar = (row: any) => {
    setRowToDelete(row)
    setIsAlertEliminarReal(true)
  }

  const handleConfirmDeleteReal = async () => {
    if (!rowToDelete) return

    try {
      await eliminarReal({ idReal: rowToDelete.idReal })

      setTableRows((prev: any) =>
        prev.filter((item: any) => item.idReal !== rowToDelete.idReal)
      )
    } catch (error: any) {
      setAlertaError(true)
      setTituloAlerta('ERROR')
      setMsgAlerta('¡Error al eliminar!')
    } finally {
      setRowToDelete(null)
      setIsAlertEliminarReal(false)
    }
  }

  const handleCancelDelete = () => {
    setRowToDelete(null)
    setIsAlertEliminarReal(false)
  }

  const handleEditar = (row: any) => {
    setFormData({
      cantidad_real: row.cantidad_real,
      costo_real: row.costo_real,
      precio_real: row.precio_real,
      laboratorio_real: row.laboratorio_real,
    })

    setModoEditar(true)
    setIdEditando(row.idReal)
  }

  const columnas = [
    {
      id: 'cantidad_real',
      label: 'Cantidad Real',
      editable: false,
      options: false,
      width: '100px',
    },
    {
      id: 'costo_real',
      label: 'Costo Real',
      editable: false,
      options: false,
      width: '80px',
    },
    {
      id: 'precio_real',
      label: 'Precio Real',
      editable: false,
      options: false,
      width: '100px',
    },
    {
      id: 'laboratorio_real',
      label: 'Laboratorio Real',
      editable: false,
      width: '130px',
      options: false,
    },
    {
      id: 'btnEditar',
      label: 'Editar',
      ico: editarIco,
      width: '70px',
      onclick: handleEditar,
    },
    {
      id: 'btnEliminar',
      label: 'Eliminar',
      ico: borrarIco,
      width: '85px',
      onclick: handleEliminar,
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AGREGAR VALORES REALES"
    >
      <div
        className="row"
        style={{ height: '50vh' }}
      >
        <div className="col-12 col-md-4 d-flex flex-column gap-3">
          <FormReutilizable
            ref={formRef}
            fields={camposFormulario}
            /* initialData={formData} */
            /* onChange={setFormData} */
          />

          <Button
            text={modoEditar ? 'ACTUALIZAR' : 'AGREGAR'}
            className="btnHeader2"
            onClick={handleAgregar}
          />
        </div>

        <div
          className="col-12 col-md-8 d-flex flex-column"
          style={{ height: '100%' }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <VirtualizedTable
              rows={tableRows}
              setRows={setTableRows}
              columns={columnas}
            />
          </div>
        </div>
      </div>
      <AlertCuidado
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
      <AlertOptions
        isOpen={isAlertEliminarReal}
        title="¿Deseas eliminar este registro?"
        message="Esta acción no se puede deshacer"
        onConfirm={handleConfirmDeleteReal}
        onCancel={handleCancelDelete}
      />
    </Modal>
  )
}

export default ModalsPreGanados
