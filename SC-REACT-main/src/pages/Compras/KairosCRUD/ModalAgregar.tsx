import React from "react"
import Button from "../../../components/Button/Button"
import FormReutilizable from "../../../components/DynamicForm/FormReutilizable"
import Modal from "../../../components/Modal/Modal"
import { camposFormProductoKairos } from "./columnsKairos"
import { ProductoKairos } from "./typesKairos"

interface ModalAgregarProps {
  modalAgregarProductos: boolean
  setModalAgregarProductos: React.Dispatch<React.SetStateAction<boolean>>
  limpiarModal: () => void
  modoEdicion: boolean
  formDataProducto: ProductoKairos
  setFormDataProducto: React.Dispatch<React.SetStateAction<ProductoKairos>>
  btnModificarProducto: () => void | Promise<void>
  btnAgregarProducto: () => void | Promise<void>
  importarExcel: () => void
  formKey: number
}

const ModalAgregar: React.FC<ModalAgregarProps> = ({
  modalAgregarProductos,
  setModalAgregarProductos,
  limpiarModal,
  modoEdicion,
  formDataProducto,
  setFormDataProducto,
  btnModificarProducto,
  btnAgregarProducto,
  importarExcel,
  formKey,
}) => {
  return (
    <Modal
      isOpen={modalAgregarProductos}
      onClose={() => {
        setModalAgregarProductos(false)
        limpiarModal()
      }}
      title={
        modoEdicion
          ? "MODIFICAR UN PRODUCTO EXISTENTE"
          : "AGREGAR UN PRODUCTO AL KAIROS"
      }
      maxWidth={"450px"}
    >
      <FormReutilizable
        key={formKey}
        fields={camposFormProductoKairos}
        values={formDataProducto}
        onChangeForm={(formValues) =>
          setFormDataProducto((prev) => ({
            ...prev,
            ...formValues,
          }))
        }
      />
      <div className="row mt-3">
        <div className="col-7">
          <Button
            text={modoEdicion ? "Modificar Producto" : "Agregar Producto"}
            className="boton-accion"
            onClick={modoEdicion ? btnModificarProducto : btnAgregarProducto}
          />
        </div>
        <div className="col-5">
          <Button
            text={"IMPORTAR EXCEL"}
            onClick={importarExcel}
            className="btnFuncTabla"
          />
        </div>
      </div>
    </Modal>
  )
}

export default ModalAgregar
