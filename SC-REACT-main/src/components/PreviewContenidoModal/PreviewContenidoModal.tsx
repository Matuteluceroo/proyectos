import Modal from "../Modal/Modal"

type Props = {
  isOpen: boolean
  onClose: () => void
  item: any | null
}

const getPreviewPath = (item: any): string => {
  const id = item?.id ?? item?.id_contenido
  const tipo = (item?.tipoNombre || item?.tipo || "").toUpperCase()
  const titulo = item?.titulo

  if (!id || !tipo) return ""

  console.log("🧪 Preview PATCH:", { tipo, id, titulo })

  if (tipo === "HTML") {
    return `/preview/html/${id}`
  }

  if (tipo === "PDF") {
    return `/preview/pdf/${id}-${titulo}.pdf`
  }

  if (tipo === "VIDEO") {
    return `/preview/video/${id}-${titulo}.mp4`
  }

  if (tipo === "IMAGEN") {
    return `/preview/imagen/${id}-${titulo}.jpg`
  }

  return ""
}

export default function PreviewContenidoModal({
  isOpen,
  onClose,
  item,
}: Props) {
  if (!isOpen || !item) return null

  const path = getPreviewPath(item)
  if (!path) return null

  const src = `${window.location.origin}${path}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vista previa — ${item.titulo}`}
      maxWidth="1200px"
      variant="preview"
    >
      <div style={{ height: "75vh" }}>
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
