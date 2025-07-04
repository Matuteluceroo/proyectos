import React, { useState, useEffect, useRef } from 'react'
import Estructura from '../../../components/Estructura/Estructura'
import {
  useAgregarProductoKairos,
  useObtenerKairos,
  useModificarProductoKairos,
  useEliminarProductoKairos,
  useObtenerProductoPorCodTarot,
  useObtenerProductoPorCodAnmat,
  useObtenerProductoPorCodKairos,
  useObtenerProductoPorLaboratorio,
  useObtenerProductoPorCodTango,
  useObtenerProductoPorDrogaPresentacion,
  useAgregarListaProductoKairos,
  useModificarListaProductoKairos,
} from '../../../services/connections/kairos'
import Modal from '../../../components/Modal/Modal'
import AlertOptions from '../../../components/Alert/AlertOptions'
import Alert from '../../../components/Alert/Alert'
import { ModalNoAsociados } from '../Cotizaciones/ModalsCotizaciones'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import FileUpload from '../../../components/FileUpload/FileUpload'
import { getColumnasKairos } from './columnsKairos'
import BotonesTabla from './BotonesTabla'
import ModalAgregar from './ModalAgregar'
import { ProductoKairos } from './typesKairos'
import BotonCerrarSesion from '../../../components/Button/BotonCerrarSesion'
import { useNavigate } from 'react-router-dom'

type FiltrosKairos = Omit<ProductoKairos, 'id' | 'nombre_comercial'>
type TableRefType = {
  setFilters?: (filters: object) => void
  getFilteredData?: () => any[]
}
const Kairos: React.FC = () => {
  const [productos, setProductos] = useState<ProductoKairos[]>([])
  const [formDataProducto, setFormDataProducto] = useState<ProductoKairos>({
    id: null,
    laboratorio: '',
    nombre_comercial: '',
    droga_presentacion: '',
    ANMAT: '',
    cod_tarot: '',
    cod_kairos: '',
    codTango: '',
  })
  const [tempFilters, setTempFilters] = useState<FiltrosKairos>({
    laboratorio: '',
    droga_presentacion: '',
    cod_tarot: '',
    cod_kairos: '',
    ANMAT: '',
    codTango: '',
  })
  const [currentFilters, setCurrentFilters] = useState<FiltrosKairos>({
    laboratorio: '',
    droga_presentacion: '',
    cod_tarot: '',
    cod_kairos: '',
    ANMAT: '',
    codTango: '',
  })
  const [filtroActivo, setFiltroActivo] = useState<string | null>(null)
  const tableRef = useRef<TableRefType | null>(null)
  const [formKey, setFormKey] = useState<number>(0)
  const [isModalNoAsocOpen, setIsModalNoAsocOpen] = useState<boolean>(false)
  const [datosAImportar, setDatosAImportar] = useState<any[]>([])
  const [modalAgregarProductos, setModalAgregarProductos] =
    useState<boolean>(false)
  const [modoEdicion, setModoEdicion] = useState<boolean>(false)
  const [alerta, setAlerta] = useState<boolean>(false)
  const [msgAlerta, setMsgAlerta] = useState<string>('')
  const [tituloAlerta, setTituloAlerta] = useState<string>('')
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null)
  const [alertaOptionsOpen, setAlertaOptionsOpen] = useState<boolean>(false)
  const [isModalImportarNuevosOpen, setIsModalImportarNuevosOpen] =
    useState<boolean>(false)
  const [dataExcelNuevos, setDataExcelNuevos] = useState<any[]>([])
  const [isModalImportarCambiosOpen, setIsModalImportarCambiosOpen] =
    useState<boolean>(false)
  const [dataExcelCambios, setDataExcelCambios] = useState<any[]>([])
  const navigate = useNavigate()

  const modificarProducto = (row: ProductoKairos) => {
    setModoEdicion(true)
    setFormKey((prev) => prev + 1)
    setFormDataProducto({
      ...row,
      id: row.idKairos ?? row.id ?? '',
    })
    setModalAgregarProductos(true)
  }

  const eliminiarProducto = (row: ProductoKairos) => {
    setIdAEliminar(row.idKairos)
    setAlertaOptionsOpen(true)
  }

  const columnasKairos = getColumnasKairos(modificarProducto, eliminiarProducto)

  const obtenerKairos = useObtenerKairos()
  const agregarProductoKairos = useAgregarProductoKairos()
  const modificarProductoKairos = useModificarProductoKairos()
  const eliminarProductoKairos = useEliminarProductoKairos()
  const obtenerProductoPorCodTarot = useObtenerProductoPorCodTarot()
  const obtenerProductoPorCodAnmat = useObtenerProductoPorCodAnmat()
  const obtenerProductoPorCodKairos = useObtenerProductoPorCodKairos()
  const obtenerProductoPorLaboratorio = useObtenerProductoPorLaboratorio()
  const obtenerProductoPorDrogaPresentacion =
    useObtenerProductoPorDrogaPresentacion()
  const obtenerProductoPorCodTango = useObtenerProductoPorCodTango()
  const agregarListaProductoKairos = useAgregarListaProductoKairos()
  const modificarListaProductoKairos = useModificarListaProductoKairos()

  /* const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTempFilters((prevFilters) => {
      if (!filtroActivo) {
        setFiltroActivo(name)
        return { ...prevFilters, [name]: value }
      }
      if (filtroActivo === name) {
        return { ...prevFilters, [name]: value }
      }
      return prevFilters
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentFilters(tempFilters)
      setTempFilters({
        laboratorio: '',
        droga_presentacion: '',
        cod_tarot: '',
        cod_kairos: '',
        ANMAT: '',
        codTango: '',
      })
      setFiltroActivo(null)
    }
  } */

  useEffect(() => {
    const procesarExcel = async () => {
      const prodsAgg = await agregarListaProductoKairos(dataExcelNuevos)
      setTituloAlerta('PRODUCTOS AGREGADOS')
      setMsgAlerta('Se agregaron correctamente los productos')
      setAlerta(true)
      setIsModalImportarNuevosOpen(false)
    }
    if (dataExcelNuevos.length > 0) {
      procesarExcel()
    }
  }, [dataExcelNuevos])

  useEffect(() => {
    const procesarExcel = async () => {
      const prodsModd = await modificarListaProductoKairos(dataExcelCambios)
      setTituloAlerta('PRODUCTOS Modificados')
      setMsgAlerta('Se modificaron correctamente los productos')
      setAlerta(true)
      setIsModalImportarCambiosOpen(false)
    }
    if (dataExcelCambios.length > 0) {
      procesarExcel()
    }
  }, [dataExcelCambios])

  useEffect(() => {
    cargarProductos()
  }, [currentFilters])

  useEffect(() => {
    if (isModalImportarCambiosOpen) {
      const datosFiltrados = tableRef.current?.getFilteredData?.() || []
      setDatosAImportar(datosFiltrados)
    }
  }, [isModalImportarCambiosOpen])

  const cargarProductos = async () => {
    let dataProductos: ProductoKairos[] = []
    if (currentFilters.laboratorio) {
      dataProductos = await obtenerProductoPorLaboratorio(
        currentFilters.laboratorio
      )
    } else if (currentFilters.droga_presentacion) {
      dataProductos = await obtenerProductoPorDrogaPresentacion(
        currentFilters.droga_presentacion
      )
    } else if (currentFilters.cod_tarot) {
      dataProductos = await obtenerProductoPorCodTarot(currentFilters.cod_tarot)
    } else if (currentFilters.cod_kairos) {
      dataProductos = await obtenerProductoPorCodKairos(
        currentFilters.cod_kairos
      )
    } else if (currentFilters.ANMAT) {
      dataProductos = await obtenerProductoPorCodAnmat(currentFilters.ANMAT)
    } else if (currentFilters.codTango) {
      dataProductos = await obtenerProductoPorCodTango(currentFilters.codTango)
    } else {
      dataProductos = await obtenerKairos()
    }
    setProductos(dataProductos || [])
  }

  const limpiarFiltros = () => {
    const filtrosVacios: FiltrosKairos = {
      laboratorio: '',
      droga_presentacion: '',
      cod_tarot: '',
      cod_kairos: '',
      ANMAT: '',
      codTango: '',
    }
    setTempFilters(filtrosVacios)
    setCurrentFilters(filtrosVacios)
    setFiltroActivo(null)
    tableRef.current?.setFilters?.({})
  }

  const btnAgregarProducto = async () => {
    const {
      laboratorio,
      nombre_comercial,
      droga_presentacion,
      ANMAT,
      cod_tarot,
    } = formDataProducto
    if (
      !laboratorio ||
      !nombre_comercial ||
      !droga_presentacion ||
      !ANMAT ||
      !cod_tarot
    ) {
      setAlerta(true)
      setTituloAlerta('Error')
      setMsgAlerta('Falta completar campos obligatorios')
      return
    }
    const nuevoProducto = { ...formDataProducto, id: null }
    const val = await agregarProductoKairos(nuevoProducto)
    if (!val) {
      setAlerta(true)
      setTituloAlerta('Error de servidor')
      setMsgAlerta('Ocurrió un error en el servidor')
      return
    }
    setAlerta(true)
    setTituloAlerta('Éxito')
    setMsgAlerta('El producto se agregó correctamente')
    limpiarModal()
    cargarProductos()
  }

  const btnModificarProducto = async () => {
    const {
      laboratorio,
      nombre_comercial,
      droga_presentacion,
      ANMAT,
      cod_tarot,
    } = formDataProducto

    if (
      !laboratorio ||
      !nombre_comercial ||
      !droga_presentacion ||
      !ANMAT ||
      !cod_tarot
    ) {
      setAlerta(true)
      setTituloAlerta('Error')
      setMsgAlerta('Faltan campos obligatorios')
      return
    }

    if (formDataProducto.id == null) {
      setAlerta(true)
      setTituloAlerta('Error')
      setMsgAlerta('ID inválido para modificación')
      return
    }

    const val = await modificarProductoKairos(
      formDataProducto.id,
      formDataProducto
    )

    if (!val) return

    setAlerta(true)
    setTituloAlerta('Éxito')
    setMsgAlerta('El producto se modificó correctamente')
    setModalAgregarProductos(false)
    cargarProductos()
  }

  const limpiarModal = () => {
    setFormDataProducto({
      id: null,
      laboratorio: '',
      nombre_comercial: '',
      droga_presentacion: '',
      ANMAT: '',
      cod_tarot: '',
      cod_kairos: '',
      codTango: '',
    })
  }

  /* const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormDataProducto((prev) => ({ ...prev, [id]: value }))
  } */

  const handleConfirm = async () => {
    if (!idAEliminar) return
    const eliminado = await eliminarProductoKairos({ idKairos: idAEliminar })
    if (!eliminado) {
      setAlerta(true)
      setMsgAlerta('No se pudo eliminar este producto')
      setTituloAlerta('Error')
    } else {
      setAlerta(true)
      setMsgAlerta('El producto se eliminó correctamente')
      setTituloAlerta('Éxito')
    }
    setIdAEliminar(null)
    setAlertaOptionsOpen(false)
    cargarProductos()
  }

  const handleCancel = () => {
    setAlertaOptionsOpen(false)
  }

  return (
    <Estructura>
      <div>
        <h1>KAIROS</h1>
      </div>
      <BotonesTabla
        limpiarFiltros={limpiarFiltros}
        setIsModalNoAsocOpen={setIsModalNoAsocOpen}
        setModalAgregarProductos={setModalAgregarProductos}
        setModoEdicion={setModoEdicion}
        setIsModalImportarCambiosOpen={setIsModalImportarCambiosOpen}
      />
      <div style={{ height: '87vh' }}>
        {productos.length > 0 ? (
          <VirtualizedTable
            nombreTabla="tblKairos"
            rows={productos}
            setRows={setProductos}
            columns={columnasKairos}
            ref={tableRef}
          />
        ) : (
          <div
            className="alert alert-warning"
            role="alert"
          >
            NO HAY PRODUCTOS DENTRO DE KAIROS PARA MOSTRAR.
          </div>
        )}
      </div>
      <AlertOptions
        title="Confirmar"
        message="¿Estas seguro que deseas eliminar este producto del kairos? Esta acción es permanente"
        isOpen={alertaOptionsOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Alert
        titulo={tituloAlerta}
        message={msgAlerta}
        duration={5000}
        setIsOpen={setAlerta}
        isOpen={alerta}
      />
      <ModalAgregar
        formKey={formKey}
        btnAgregarProducto={btnAgregarProducto}
        btnModificarProducto={btnModificarProducto}
        formDataProducto={formDataProducto}
        setFormDataProducto={setFormDataProducto}
        limpiarModal={limpiarModal}
        modalAgregarProductos={modalAgregarProductos}
        modoEdicion={modoEdicion}
        setModalAgregarProductos={setModalAgregarProductos}
        importarExcel={() => setIsModalImportarNuevosOpen(true)}
      />
      <Modal
        isOpen={isModalImportarNuevosOpen}
        onClose={() => setIsModalImportarNuevosOpen(false)}
        title={'IMPORTAR EXCEL'}
      >
        <FileUpload
          setData={setDataExcelNuevos}
          encabezados={[
            { id: 'idKairos', label: 'idKairos' },
            {
              id: 'laboratorio',
              label: 'laboratorio',
            },
            {
              id: 'nombre_comercial',
              label: 'nombre_comercial',
            },
            {
              id: 'droga_presentacion',
              label: 'droga_presentacion',
            },
            {
              id: 'ANMAT',
              label: 'ANMAT',
            },
            {
              id: 'cod_tarot',
              label: 'cod_tarot',
            },
            {
              id: 'cod_kairos',
              label: 'cod_kairos',
            },
            {
              id: 'codTango',
              label: 'codTango',
            },
          ]}
          datosTabla={[
            {
              laboratorio: '',
              nombre_comercial: '',
              droga_presentacion: '',
              ANMAT: '',
              cod_tarot: '',
              cod_kairos: '',
              codTango: '',
            },
          ]}
          paso={'Nuevos Kairos'}
          usarEncabezados={false}
        />
      </Modal>
      <Modal
        isOpen={isModalImportarCambiosOpen}
        onClose={() => setIsModalImportarCambiosOpen(false)}
        title={'IMPORTAR EXCEL'}
      >
        <FileUpload
          setData={setDataExcelCambios}
          encabezados={[
            { id: 'idKairos', label: 'idKairos' },
            {
              id: 'laboratorio',
              label: 'laboratorio',
            },
            {
              id: 'nombre_comercial',
              label: 'nombre_comercial',
            },
            {
              id: 'droga_presentacion',
              label: 'droga_presentacion',
            },
            {
              id: 'ANMAT',
              label: 'ANMAT',
            },
            {
              id: 'cod_tarot',
              label: 'cod_tarot',
            },
            {
              id: 'cod_kairos',
              label: 'cod_kairos',
            },
            {
              id: 'codTango',
              label: 'codTango',
            },
          ]}
          datosTabla={datosAImportar}
          paso={'MODIFICAR KAIROS'}
          usarEncabezados={false}
        />
      </Modal>

      <ModalNoAsociados
        isModalNoAsocOpen={isModalNoAsocOpen}
        setIsModalNoAsocOpen={setIsModalNoAsocOpen}
        visible={false}
      />
    </Estructura>
  )
}

export default Kairos
