import Modal from "../Modal/Modal"

type Props = {
  isOpen: boolean
  onClose: () => void
  item: any | null
}

const getPreviewPath = (item: any): string => {
  const id = item?.id ?? item?.id_contenido ?? item?.ID

  const tipo = (item?.tipoNombre || "").toUpperCase()
  const archivo = item?.url_archivo?.replace(/\\/g, "/")?.split("/")?.pop()

  if (tipo === "HTML") return `/preview/html/${id}`
  if (tipo === "PDF") return `/preview/pdf/${archivo}`
  if (tipo === "VIDEO") return `/preview/video/${archivo}`
  if (tipo === "IMAGEN") return `/preview/imagen/${archivo}`

  // fallback
  return `/preview/html/${id}`
}

export default function PreviewContenidoModal({
  isOpen,
  onClose,
  item,
}: Props) {
  if (!isOpen || !item) return null

  const src = getPreviewPath(item)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vista previa — ${item.titulo}`}
      minWidth="370px"
      maxWidth="400px"
      variant="preview"
    >
      <div style={{ height: "75vh", overflow: "auto" }}>
        <iframe
          src={src}
          title="Vista previa contenido"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "6px",
          }}
        />
      </div>
    </Modal>
  )
}
