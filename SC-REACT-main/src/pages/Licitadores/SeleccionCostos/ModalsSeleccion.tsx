import React, { useState, useRef, useEffect } from 'react'
import VirtualizedTable from '../../../components/VirtualizedTable/VirtualizedTable'
import Modal from '../../../components/Modal/Modal'
import Button from '../../../components/Button/Button'
import FormReutilizable from '../../../components/DynamicForm/FormReutilizable'
import { useEliminarRenglon } from '../../../services/connections/licitaciones'
import {
  useModificarLicitacion,
  useCrearRenglonAlternativo,
} from '../../../services/connections/licitaciones'
import { useGenerarPDF } from '../../../services/connections/documents'
import AlertCuidado from '../../../components/Alert/AlertCuidado'
import AlertOptions from '../../../components/Alert/AlertOptions'
import './ModalsSeleccion.css'
import { numeroALetrasConCentavos } from '../../../services/functions'
import { FieldsListProps } from '../../../components/DynamicForm/FormReutilizableTypes'
import {
  getColumnasAlternativoAdd,
  getColumnasAlternativoEliminar,
  getColumnasDemanda,
} from './columnas'

type ModalAddAlternativoProps = {
  renglones: any[]
  setRenglones: React.Dispatch<React.SetStateAction<any[]>>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModalAddAlternativo = ({
  renglones,
  setRenglones,
  isOpen,
  setIsOpen,
}: ModalAddAlternativoProps) => {
  const crearRenglonAlternativo = useCrearRenglonAlternativo()

  const columnasAlternativo = getColumnasAlternativoAdd()

  const filasSinAlternativos = () => {
    const filas = renglones
    const filasSinAlt = []
    for (let i = 0; i < filas.length; i++) {
      if (filas[i]['alternativo'] === 0) {
        filasSinAlt.push(filas[i])
      }
    }
    return filasSinAlt
  }

  const nuevaFilaAlternativa = async (row: any) => {
    let nroAlt: string = ''
    for (let i = 0; i < renglones.length; i++) {
      const currentReng = renglones[i]['renglon']
      if (currentReng.split(' ')[0] == row.renglon) {
        if (currentReng.includes('ALT')) {
          if (
            currentReng.split(' ')[2] === undefined ||
            currentReng.split(' ')[2] === ''
          ) {
            nroAlt = '2'
          } else {
            nroAlt = (parseInt(currentReng.split(' ')[2]) + 1).toString()
          }
        }
      }
    }
    const alternativo = () => {
      if (nroAlt === '') return 1
      return nroAlt
    }

    const renglonToAdd = {
      idLicitacion: row.idLicitacion,
      renglon: row.renglon,
      cantidad: row.cantidad,
      descripcion: row.descripcion,
      codigoTarot: row.codigoTarot,
      descripcionTarot: row.descripcionTarot,
      alternativo: alternativo(),
    }

    const newRengAlt = await crearRenglonAlternativo({
      idLicitacion: row.idLicitacion,
      datos: renglonToAdd,
    })

    const newIdRengAlt = newRengAlt.newRenglon.idRenglon
    const alternativeRow = {
      idLicitacion: row.idLicitacion,
      idRenglon: newIdRengAlt,
      renglon: row.renglon + ' ALT ' + nroAlt,
      cantidad: row.cantidad,
      descripcion: row.descripcion,
      codigoTarot: row.codigoTarot,
      descripcionTarot: row.descripcionTarot,
      alternativo: alternativo(),
    }
    setRenglones((renglones) => {
      const actualizados = [...renglones, alternativeRow]

      return actualizados
    })

    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="ELIJA RENGLÓN DE ALTERNATIVO"
      minWidth={'100px'}
    >
      <div style={{ height: '300px', overflowX: 'auto' }}>
        <VirtualizedTable
          rows={filasSinAlternativos()}
          columns={columnasAlternativo}
          setRows={setRenglones}
          onClickRow={nuevaFilaAlternativa}
        />
      </div>
    </Modal>
  )
}
type ModalDeleteAlternativoProps = {
  renglones: any[]
  setRenglones: React.Dispatch<React.SetStateAction<any[]>>
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModalDelelteAlternativo = ({
  renglones,
  setRenglones,
  isOpen,
  setIsOpen,
}: ModalDeleteAlternativoProps) => {
  const eliminarRenglon = useEliminarRenglon()
  const defaultSort = { key: 'renglon', direction: 'asc' }
  const eliminarAlternativo = async (row: any) => {
    if (row.idRenglon) {
      await eliminarRenglon(row.idRenglon)
    }

    setRenglones((prevRenglones) =>
      prevRenglones.filter((renglon) => renglon.idRenglon !== row['idRenglon'])
    )
    setIsOpen(false)
  }

  const columnasAlternativoEliminar =
    getColumnasAlternativoEliminar(eliminarAlternativo)

  const filasAlternativos = () => {
    const filas = renglones
    const filasConAlt = []
    for (let i = 0; i < filas.length; i++) {
      if (filas[i]['alternativo'] !== 0) {
        filasConAlt.push(filas[i])
      }
    }
    return filasConAlt
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="ELIJA RENGLÓN A ELIMINAR"
      minWidth={'500px'}
    >
      <div style={{ height: '300px' }}>
        <VirtualizedTable
          rows={filasAlternativos()} // ✅ ya filtradas
          columns={columnasAlternativoEliminar}
          setRows={setRenglones}
        />
      </div>
    </Modal>
  )
}

type ModalElegirRenglonProps = {
  renglones: any[]
  setRenglones: React.Dispatch<React.SetStateAction<any[]>>
  isModalLlenarDemanda: any
  tableRef: React.RefObject<any>
  setIsModalLlenarDemanda: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean
      renglonesAlt: any[]
      cotizacion: any
    }>
  >
}

export const ModalElegirRenglonACompletar = ({
  renglones,
  setRenglones,
  isModalLlenarDemanda,
  setIsModalLlenarDemanda,
  tableRef,
}: ModalElegirRenglonProps) => {
  const colsLlenarDemanda = getColumnasDemanda()

  const filaElegidaLlenar = (row: any) => {
    for (let i = 0; i < renglones.length; i++) {
      if (renglones[i].renglon === row.renglon) {
        const newRenglon = renglones[i]

        newRenglon.nombre_comercial =
          isModalLlenarDemanda.cotizacion.nombre_comercial
        newRenglon.laboratorio_elegido =
          isModalLlenarDemanda.cotizacion.laboratorio
        newRenglon.ANMAT = isModalLlenarDemanda.cotizacion.ANMAT
        newRenglon.costo_elegido = isModalLlenarDemanda.cotizacion.costoFinal

        setRenglones((prevRenglones) => {
          const actualizados = prevRenglones.map((r) =>
            r.renglon === row.renglon ? newRenglon : r
          )

          setTimeout(() => {
            const index = actualizados.findIndex(
              (r) => r.renglon === row.renglon
            )
            if (index >= 0) tableRef.current?.scrollToRow(index)
          }, 50)

          return actualizados
        })

        break
      }
    }

    setIsModalLlenarDemanda({
      isOpen: false,
      renglonesAlt: [],
      cotizacion: null,
    })
  }

  return (
    <Modal
      isOpen={isModalLlenarDemanda.isOpen}
      onClose={() =>
        setIsModalLlenarDemanda({
          isOpen: false,
          renglonesAlt: [],
          cotizacion: null,
        })
      }
      maxWidth={'600px'}
      title={'SELECCIONE EL RENGLÓN'}
    >
      <div style={{ height: '400px' }}>
        <VirtualizedTable
          rows={isModalLlenarDemanda.renglonesAlt}
          setRows={setRenglones}
          columns={colsLlenarDemanda}
          onClickRow={filaElegidaLlenar}
        />
      </div>
    </Modal>
  )
}

type ModalFinLicitacionProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  total: number | string
  data_cliente: any
  data_renglones: any[]
  guardarCostosElegidos: () => void
}

export const ModalFinLicitacion = ({
  isOpen,
  setIsOpen,
  total,
  data_cliente: data_licitacion,
  data_renglones,
  guardarCostosElegidos,
}: ModalFinLicitacionProps) => {
  const [colsMarcadas, setColsMarcadas] = useState<any>([])
  const [firmasMarcadas, setFirmasMarcadas] = useState<any>([])
  const formRef = useRef<any>(null)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState('')
  const [tituloAlerta, setTituloAlerta] = useState('')
  const [modalConfirmarOpen, setModalConfirmarOpen] = useState(false)
  const modificarLicitacion = useModificarLicitacion()
  const [formato, setFormato] = useState('juntos')
  const [incluirRenglones, setIncluirRenglones] = useState('todos')
  const [descripcionSeleccionada, setDescripcionSeleccionada] =
    useState('descripcion')
  const [totalLetra, setTotalLetra] = useState(numeroALetrasConCentavos(total))
  const [montoChequeado, setMontoChequeado] = useState(false)
  const colsListar = ['nombre_comercial', 'observaciones']
  const firmas = [
    'FRANCO SANDOVAL',
    'MARIA LETICIA HOLGADO',
    'DALMA T. GUTIERREZ',
    'DIEGO ZALAZAR',
    'PAULO DELLUNIVERSIDAD',
  ]

  const ListaCheckBox = ({
    elementosLista,
    selectedElements,
    setSelectedElements,
    prefix = 'cb',
  }: {
    elementosLista: any[]
    selectedElements: any[]
    setSelectedElements: React.Dispatch<React.SetStateAction<any[]>>
    prefix?: string
  }) => {
    const handleCheckboxChange = (elemento: any) => {
      setSelectedElements((prev) =>
        prev.includes(elemento)
          ? prev.filter((c) => c !== elemento)
          : [...prev, elemento]
      )
    }

    return elementosLista.map((elemento, index) => {
      const id = `${prefix}-${index}`

      return (
        <label
          key={id}
          htmlFor={id}
          className="elementoColLista"
        >
          <p style={{ margin: 0 }}>{elemento}</p>
          <input
            id={id}
            type="checkbox"
            checked={selectedElements.includes(elemento)}
            onChange={() => handleCheckboxChange(elemento)}
            style={{ cursor: 'pointer' }}
          />
        </label>
      )
    })
  }

  useEffect(() => {
    if (total) {
      setTotalLetra(numeroALetrasConCentavos(total))
    }
  }, [total])

  const camposFormulario: FieldsListProps = [
    {
      nombreCampo: 'text_monto',
      labelText: 'Monto',
      type: 'text',
      defaultValue: totalLetra,
      onChange: (e) => setTotalLetra(e.target.value),
    },
    {
      nombreCampo: 'entrega',
      labelText: 'Entrega',
      type: 'text',
      defaultValue: 'Según pliego',
    },
    {
      nombreCampo: 'mantenimiento',
      labelText: 'Mantenimiento',
      type: 'text',
      defaultValue: 'Según pliego',
    },
    {
      nombreCampo: 'pago',
      labelText: 'Pago',
      type: 'text',
      defaultValue: 'Según pliego',
    },
  ]

  const handleSubmit = async () => {
    if (!montoChequeado) {
      setTituloAlerta('CUIDADO')
      setMsgAlerta('Debes confirmar que el monto ingresado es correcto.')
      setAlertaCuidado(true)
      return
    }
    guardarCostosElegidos()
    if (formRef.current) {
      const formData = formRef.current?.getFormData()
      const colsIncluir = [
        'renglon',
        'cantidad',
        descripcionSeleccionada,
        'laboratorio_elegido',
        'ANMAT',
        'precio_vta',
        'precio_vta_total',
      ].concat(colsMarcadas)

      const cols = colsIncluir.concat(colsMarcadas)
      const datosAEnviar = {
        cliente: data_licitacion.cliente,
        fecha: data_licitacion.fecha,
        nroLic: data_licitacion.nroLic,
        tipo: data_licitacion.tipo,
        codCliente: data_licitacion.codCliente,
        hora: data_licitacion.hora,
        objeto: data_licitacion.objeto,
        estado: data_licitacion.estado,
      }

      let dataFiltrada: any[] = (data_renglones || []).map((item) =>
        cols.reduce((acc: { [key: string]: string }, col) => {
          acc[col] = item[col] || '' // Valor por defecto si es undefined
          return acc
        }, {})
      )

      if (incluirRenglones === 'conPrecio') {
        dataFiltrada = dataFiltrada.filter((item) => {
          return item.precio_vta != null && item.precio_vta.trim() !== ''
        })
      }
      const datos_cliente = {
        cliente: data_licitacion.cliente,
        fecha: data_licitacion.fecha,
        nroLic: data_licitacion.nroLic,
        tipo: data_licitacion.tipo,
        codCliente: data_licitacion.codCliente,
        hora: data_licitacion.hora,
        objeto: data_licitacion.objeto,
      }
      if (formato === 'juntos') {
        const data = {
          TIPO: 'pdf',
          data_cliente: datos_cliente,
          data_renglones: dataFiltrada,
          data_entrega: formData,
          total_licitacion: total,
          firmas_chequeadas: firmasMarcadas,
        }
        const nombrePDF = `${data_licitacion['fecha'].replaceAll('-', ' ')} ${
          data_licitacion['cliente']
        } ${data_licitacion['tipo']} ${data_licitacion['nroLic']}`

        const finLicit = await useGenerarPDF(data, nombrePDF)
      } else if (formato === 'separados') {
        const dataFiltradaAlt = dataFiltrada.filter((item) =>
          item.renglon.includes('ALT')
        )
        const dataFiltradaSinAlt = dataFiltrada.filter(
          (item) => !item.renglon.includes('ALT')
        )
        const dataAlt = {
          TIPO: 'pdf',
          data_cliente: data_licitacion,
          data_renglones: dataFiltradaAlt,
          data_entrega: formData,
          total_licitacion: total,
          firmas_chequeadas: firmasMarcadas,
        }
        const nombrePDFAlt = `${data_licitacion['fecha'].replaceAll(
          '-',
          ' '
        )} ${data_licitacion['cliente']} ${data_licitacion['tipo']} ${
          data_licitacion['nroLic']
        } ${'ALTERNATIVOS'}`
        const dataSinAlt = {
          TIPO: 'pdf',
          data_cliente: data_licitacion,
          data_renglones: dataFiltradaSinAlt,
          data_entrega: formData,
          total_licitacion: total,
          firmas_chequeadas: firmasMarcadas,
          tipo_descripcion: descripcionSeleccionada,
        }
        const nombrePDFSinAlt = `${data_licitacion['fecha'].replaceAll(
          '-',
          ' '
        )} ${data_licitacion['cliente']} ${data_licitacion['tipo']} ${
          data_licitacion['nroLic']
        }`
        const finLicitSinAlt = await useGenerarPDF(dataSinAlt, nombrePDFSinAlt)
        const finLicitAlt = await useGenerarPDF(dataAlt, nombrePDFAlt)
      }

      //data_licitacion["estado"] = "OFERTA PRESENTADA"
      await modificarLicitacion({
        idLicitacion: data_licitacion.id,
        dataLicitacion: datosAEnviar,
      })
      setIsOpen(false)
      setModalConfirmarOpen(false)
    }
  }
  const handleChangeFormato = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormato(e.target.value)
  }
  const handleChangeRenglonesPrecio = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIncluirRenglones(e.target.value)
  }
  const handleChangeDescripcion = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescripcionSeleccionada(e.target.value)
  }
  return (
    <>
      <AlertCuidado
        titulo={tituloAlerta}
        message={msgAlerta}
        duration={5000} // Duración en milisegundos
        setIsOpen={setAlertaCuidado}
        isOpen={alertaCuidado}
      />
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth={'1100px'}
        title={'Formulario de Entrega'}
      >
        <div className="formulario-entrega-container layout-3-cols">
          <div className="col-form">
            <h3>Elegir Columnas</h3>
            <ListaCheckBox
              elementosLista={colsListar}
              selectedElements={colsMarcadas}
              setSelectedElements={setColsMarcadas}
              prefix="col"
            />
            <br />
            <h3>Incluir Renglones</h3>
            <div onChange={handleChangeRenglonesPrecio}>
              <label>
                <input
                  type="radio"
                  name="opcionRenglones"
                  value="todos"
                  defaultChecked={true}
                />{' '}
                TODOS LOS RENGLONES
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="opcionRenglones"
                  value="conPrecio"
                />{' '}
                RENGLONES CON PRECIO
              </label>
            </div>
            <h3>Tipo de Descripción</h3>
            <div onChange={handleChangeDescripcion}>
              <label>
                <input
                  type="radio"
                  name="opcionDescripcion"
                  value="descripcion"
                  checked={descripcionSeleccionada === 'descripcion'}
                  onChange={() => setDescripcionSeleccionada('descripcion')}
                />{' '}
                Descripción
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="opcionDescripcion"
                  value="descripcionTarot"
                  checked={descripcionSeleccionada === 'descripcionTarot'}
                  onChange={() =>
                    setDescripcionSeleccionada('descripcionTarot')
                  }
                />{' '}
                Descripción Tarot
              </label>
            </div>
          </div>
          <div className="col-form">
            <h3>Elegir Firmas</h3>
            <ListaCheckBox
              elementosLista={firmas}
              selectedElements={firmasMarcadas}
              setSelectedElements={setFirmasMarcadas}
              prefix="firma"
            />
            <h3>Formato</h3>
            <div onChange={handleChangeFormato}>
              <label>
                <input
                  type="radio"
                  name="opcionFormato"
                  value="juntos"
                  defaultChecked={true}
                />{' '}
                Productos y Alternativos JUNTOS
              </label>
              <br />
              <label>
                <input
                  type="radio"
                  name="opcionFormato"
                  value="separados"
                />{' '}
                Productos y Alternativos SEPARADOS
              </label>
            </div>
            <AlertOptions
              title={'ENVIAR LICITACIÓN'}
              message={
                '¿Está seguro que desea enviar la licitación? Una vez enviada, no podrá volver a modificarla'
              }
              isOpen={modalConfirmarOpen}
              onCancel={() => setModalConfirmarOpen(false)}
              onConfirm={handleSubmit}
            />
          </div>
          <div className="col-form-right">
            <h3>Pie del PDF</h3>
            <p id="totalNum">${total}</p>
            <FormReutilizable
              fields={camposFormulario}
              ref={formRef}
            />
          </div>
          <div style={{ margin: 0, padding: 0, textAlign: 'center' }}>
            <Button
              className={'btnHeader2'}
              text={'Enviar'}
              onClick={() => setModalConfirmarOpen(true)}
            />
            <div style={{ marginTop: '0.5rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={montoChequeado}
                  onChange={(e) => setMontoChequeado(e.target.checked)}
                />{' '}
                Confirmo que el monto escrito ingresado es correcto
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
