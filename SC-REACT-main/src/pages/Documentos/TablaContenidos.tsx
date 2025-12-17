import { useEffect, useState } from "react"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import {
  useObtenerContenidos,
  useActualizarContenido,
  useEliminarContenido,
} from "../../services/connections/contenido"
import Modal from "../../components/Modal/Modal"
import Alert from "../../components/Alert/Alert"
import AlertErrores from "../../components/Alert/AlertErrores"
import AlertOptions from "../../components/Alert/AlertOptions"

/** Íconos inline (SVG → data URI) */
const EDIT_ICON =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%233498db' d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83l3.75 3.75l1.84-1.82z'/></svg>`
  )

const DELETE_ICON =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23e74c3c' d='M6 7h12v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 1h4v2H4V4h4l1-1z'/></svg>`
  )

export default function TablaContenidos() {
  const obtenerContenidos = useObtenerContenidos()
  const actualizarContenido = useActualizarContenido()
  const eliminarContenido = useEliminarContenido()

  const [rows, setRows] = useState<any[]>([])

  // edición
  const [modalEditOpen, setModalEditOpen] = useState(false)
  const [editData, setEditData] = useState<{
    id: number
    titulo: string
    descripcion: string
    id_tipo: number
    url_archivo: string
  }>({
    id: 0,
    titulo: "",
    descripcion: "",
    id_tipo: 0,
    url_archivo: "",
  })

  // eliminación
  const [alertConfirm, setAlertConfirm] = useState(false)
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null)

  // alertas genéricas
  const [alertSuccess, setAlertSuccess] = useState(false)
  const [alertError, setAlertError] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await obtenerContenidos()
        console.log(data)
        if (data) setRows(data)
      } catch (e) {
        console.error("❌ Error al obtener contenidos:", e)
      }
    })()
  }, [])

  /** Handlers de acciones */
  const handleEditar = (row: any) => {
    setEditData({
      id: row.id ?? row.id_contenido,
      titulo: row.titulo || "",
      descripcion: row.descripcion || "",
      id_tipo: row.id_tipo,
      url_archivo: row.url_archivo,
    })
    setModalEditOpen(true)
  }

  const guardarEdicion = async () => {
    try {
      await actualizarContenido(editData.id, {
        titulo: editData.titulo,
        descripcion: editData.descripcion,
        id_tipo: editData.id_tipo,
        url_archivo: editData.url_archivo,
      })

      setRows((prev) =>
        prev.map((r) =>
          (r.id ?? r.id_contenido) === editData.id
            ? {
                ...r,
                titulo: editData.titulo,
                descripcion: editData.descripcion,
              }
            : r
        )
      )

      setModalEditOpen(false)
      setAlertSuccess(true)
    } catch (e) {
      console.error("❌ Error al actualizar contenido:", e)
      setAlertError(true)
    }
  }

  const pedirEliminar = (row: any) => {
    const id = row.id ?? row.id_contenido
    if (!id) return
    setIdAEliminar(id)
    setAlertConfirm(true)
  }

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return
    setAlertConfirm(false)
    try {
      await eliminarContenido(idAEliminar) // PATCH estado = 0
      setRows((prev) =>
        prev.filter((r) => (r.id ?? r.id_contenido) !== idAEliminar)
      )
      setAlertSuccess(true)
    } catch (e) {
      console.error("❌ Error al desactivar contenido:", e)
      setAlertError(true)
    } finally {
      setIdAEliminar(null)
    }
  }

  /** Columnas para VirtualizedTable (compatibles con CellTableComp) */
  const columns = [
    { id: "id", options: true, label: "ID", width: "70px" },
    { id: "titulo", options: true, label: "Título", width: "220px" },
    { id: "descripcion", options: true, label: "Descripción", width: "300px" },
    { id: "nombre", options: true, label: "Tipo", width: "140px" }, // viene de listarContenidos: tc.nombre AS nombre
    { id: "tags", options: true, label: "Tags", width: "140px" }, // viene de listarContenidos: tc.nombre AS nombre
    { id: "autor", options: true, label: "Autor", width: "180px" },
    // acciones (id debe empezar con 'btn', usa col.ico + col.onclick)
    {
      id: "btnEditar",

      options: true,
      label: "Editar",
      width: "70px",
      ico: EDIT_ICON,
      onclick: (row: any) => handleEditar(row),
    },
    {
      id: "btnEliminar",

      options: true,
      label: "Eliminar",
      width: "70px",
      ico: DELETE_ICON,
      onclick: (row: any) => pedirEliminar(row),
    },
  ]

  return (
    <>
      <VirtualizedTable
        nombreTabla="contenidos"
        columns={columns as any}
        rows={rows}
        setRows={setRows}
      />

      {/* Modal Edición */}
      <Modal
        isOpen={modalEditOpen}
        onClose={() => setModalEditOpen(false)}
        title="Editar Contenido"
      >
        <div className="mb-2">
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Título
          </label>
          <input
            type="text"
            className="form-control"
            value={editData.titulo}
            onChange={(e) =>
              setEditData((p) => ({ ...p, titulo: e.target.value }))
            }
          />
        </div>

        <div className="mb-2">
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Descripción
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={editData.descripcion}
            onChange={(e) =>
              setEditData((p) => ({ ...p, descripcion: e.target.value }))
            }
          />
        </div>

        <div style={{ textAlign: "right", marginTop: 12 }}>
          <button
            className="btn btn-primary"
            onClick={guardarEdicion}
            style={{ marginRight: 10 }}
          >
            💾 Guardar
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setModalEditOpen(false)}
          >
            ❌ Cancelar
          </button>
        </div>
      </Modal>

      {/* Confirmación Eliminar (borrado lógico) */}
      <AlertOptions
        isOpen={alertConfirm}
        title="¿Desactivar contenido?"
        message="Quedará inactivo (estado = 0) y no se mostrará en listados."
        confirmText="Sí, desactivar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminacion}
        onCancel={() => setAlertConfirm(false)}
      />

      {/* Alertas resultado */}
      <Alert
        isOpen={alertSuccess}
        setIsOpen={setAlertSuccess}
        titulo="¡Éxito!"
        message="Operación realizada correctamente."
      />
      <AlertErrores
        isOpen={alertError}
        setIsOpen={setAlertError}
        titulo="Error"
        message="No se pudo completar la operación."
      />
    </>
  )
}
