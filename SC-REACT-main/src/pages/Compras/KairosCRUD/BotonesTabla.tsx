import React from 'react'
import Button from '../../../components/Button/Button'

interface BotonesTablaProps {
  setModalAgregarProductos: React.Dispatch<React.SetStateAction<boolean>>
  setModoEdicion: React.Dispatch<React.SetStateAction<boolean>>
  limpiarFiltros: () => void
  setIsModalNoAsocOpen: React.Dispatch<React.SetStateAction<boolean>>
  setIsModalImportarCambiosOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const BotonesTabla: React.FC<BotonesTablaProps> = ({
  setModalAgregarProductos,
  setModoEdicion,
  limpiarFiltros,
  setIsModalNoAsocOpen,
  setIsModalImportarCambiosOpen,
}) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: '4vh',
        margin: '5px 0',
        gap: '300px',
      }}
    >
      <Button
        id="btnAgregar"
        className="btnFuncTabla"
        text={'Agregar un producto'}
        onClick={() => {
          setModalAgregarProductos(true)
          setModoEdicion(false)
        }}
      />
      <Button
        className="btnFuncTabla"
        text={'Editar productos'}
        onClick={() => {
          setIsModalImportarCambiosOpen(true)
        }}
      />
      <Button
        id="btnLimpiarFiltros"
        className="btnFuncTabla"
        text={'Limpiar filtros'}
        onClick={limpiarFiltros}
      />
      <Button
        className="btnFuncTabla"
        text={'Renglones no asociados'}
        onClick={() => setIsModalNoAsocOpen(true)}
      />
    </div>
  )
}

export default BotonesTabla
