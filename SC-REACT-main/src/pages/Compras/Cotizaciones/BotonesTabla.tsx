import React from "react"
import Button from "../../../components/Button/Button"
import BuscadorModalTabla from "../../../components/Button/ButtonBuscador"

interface FuncionalidadesTablaProps {
  incluirRenglones: string
  handleChangeRenglonesPrecio: (e: React.ChangeEvent<HTMLInputElement>) => void
  setIsModalNoAsocOpen: (open: boolean) => void
  setIsModalLicitacionOpen: (open: boolean) => void
  limpiarFiltros: () => void
  importarExcel: () => void
  exportarExcel: () => void
  obtenerListaProductosTarot: () => Promise<any>
  cantidadCostosFiltrados: number
}

const FuncionalidadesTabla: React.FC<FuncionalidadesTablaProps> = ({
  incluirRenglones,
  handleChangeRenglonesPrecio,
  setIsModalNoAsocOpen,
  setIsModalLicitacionOpen,
  limpiarFiltros,
  importarExcel,
  exportarExcel,
  cantidadCostosFiltrados,
}) => {
  return (
    <div className="row justify-content-center align-items-center h-100">
      <div className="col-2" onChange={handleChangeRenglonesPrecio}>
        <label>
          <input
            type="radio"
            name="opcionRenglones"
            value="todos"
            checked={incluirRenglones === "todos"}
            onChange={handleChangeRenglonesPrecio}
          />{" "}
          TODOS LOS RENGLONES
        </label>
        <label>
          <input
            type="radio"
            name="opcionRenglones"
            value="cotizados"
            checked={incluirRenglones === "cotizados"}
            onChange={handleChangeRenglonesPrecio}
          />{" "}
          RENGLONES COTIZADOS
        </label>
        <label>
          <input
            type="radio"
            name="opcionRenglones"
            value="sinCotizar"
            checked={incluirRenglones === "sinCotizar"}
            onChange={handleChangeRenglonesPrecio}
          />{" "}
          RENGLONES SIN COTIZAR
        </label>
      </div>

      <>
        <div className="col-auto">
          <Button
            className="btnFuncTabla"
            text={"Renglones no asociados"}
            onClick={() => setIsModalNoAsocOpen(true)}
          />
        </div>
        <div className="col-auto">
          <Button
            className="btnFuncTabla"
            text={"Ver Licitacion"}
            onClick={() => setIsModalLicitacionOpen(true)}
            title="Ver licitación"
          />
        </div>
        <div className="col-auto">
          <Button
            className="btnFuncTabla"
            text={"Limpiar Filtros"}
            onClick={limpiarFiltros}
            title="Limpiar filtros"
          />
        </div>
        <div className="col-auto">
          <Button
            id="btnImportarExcel"
            title="Importar Excel"
            className="btnFuncTabla"
            text={"Importar Excel"}
            onClick={importarExcel}
          />
        </div>
        <div className="col-auto">
          <Button
            className="btnFuncTabla"
            text={"Exportar Excel"}
            onClick={exportarExcel}
            title="Exportar Excel"
          />
        </div>
        <div className="col-auto">
          <BuscadorModalTabla title="BUSCAR CÓDIGO TAROT" />
          <p className="cantidad-renglones-tabla">
            Renglones en tabla: {cantidadCostosFiltrados}
          </p>
        </div>
      </>
    </div>
  )
}

export default FuncionalidadesTabla
