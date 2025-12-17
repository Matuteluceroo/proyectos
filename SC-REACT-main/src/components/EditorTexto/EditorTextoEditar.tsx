import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Button from "../../components/Button/Button"
import Modal from "../Modal/Modal"
import FormReutilizable from "../DynamicForm/FormReutilizable"
import {
  Field,
  FormReutilizableRef,
} from "../DynamicForm/FormReutilizableTypes"
import ModalImageUploader from "../ImageUploader/ImageUploader"
import {
  useBuscarHTML,
  useActualizarDocumento,
} from "../../services/connections/documentos"
import { useSocket } from "../../services/SocketContext"

import "./EditorTexto.css"

export default function EditorTextoEditar() {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useSocket()
  const buscarHTML = useBuscarHTML()
  const actualizarDocumento = useActualizarDocumento()

  const [modalOpen, setModalOpen] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [loading, setLoading] = useState(true)
  const formRef = useRef<FormReutilizableRef>(null)
  const [tags, setTags] = useState("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Image.configure({
        inline: false,
        allowBase64: true, // 🔥 necesario para ver imágenes embebidas
      }),
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: "<p>Cargando contenido...</p>",
  })

  useEffect(() => {
    const cargarDocumento = async () => {
      try {
        if (!id) return
        const data = await buscarHTML(Number(id))
        if (data.html) editor?.commands.setContent(data.html)
        setTitulo(data.titulo)
        setDescripcion(data.descripcion || "")
      } catch (err) {
        console.error("❌ Error al cargar documento:", err)
      } finally {
        setLoading(false)
      }
    }
    cargarDocumento()
  }, [id, editor])

  const handleAbrirModalGuardar = () => setModalOpen(true)

  const handleConfirmarGuardado = async () => {
    if (!editor || !id) return
    if (!formRef.current) return // 👈 FIX TS

    const { tags, descripcion } = formRef.current.getFormData()

    const html = editor.getHTML()
    const textoPlano = editor.getText()

    try {
      await actualizarDocumento({
        id_contenido: Number(id),
        titulo,
        descripcion,
        html,
        textoPlano,
        tags,
      })

      alert("✅ Documento actualizado correctamente")
      setModalOpen(false)
    } catch (err) {
      console.error("❌ Error al actualizar documento:", err)
      alert("Ocurrió un error al guardar los cambios")
    }
  }

  if (loading) return <p>Cargando editor...</p>

  return (
    <div className="editor-container">
      <div className="toolbar">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título del documento"
          style={{ padding: "0.5rem", marginRight: "1rem", flex: 1 }}
        />
        <Button
          text="💾 Guardar cambios"
          className="boton-accion"
          onClick={handleAbrirModalGuardar}
        />
      </div>

      {/* 🔹 Barra de herramientas de formato (copiada de EditorTexto.tsx) */}
      <div className="toolbar">
        <Button
          text="B"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <Button
          text="I"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <Button
          text="U"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <Button
          text="• Lista"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <Button
          text="# Lista"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <Button
          text="x²"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleSuperscript().run()}
        />
        <Button
          text="x₂"
          className="boton-accion"
          onClick={() => editor?.chain().focus().toggleSubscript().run()}
        />
        <Button
          text="🗂 Tabla"
          className="boton-accion"
          onClick={() =>
            editor?.chain().focus().insertTable({ rows: 2, cols: 2 }).run()
          }
        />
        <ModalImageUploader
          onInsert={(base64) =>
            editor?.chain().focus().setImage({ src: base64 }).run()
          }
        />
        <Button
          text="📄 Exportar PDF"
          className="boton-accion"
          onClick={() => {
            if (!editor) return
            const html2pdf = require("html2pdf.js")
            const content = editor.getHTML()
            html2pdf()
              .from(content)
              .set({
                margin: 10,
                filename: `${titulo || "contenido"}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
              })
              .save()
          }}
        />
      </div>

      <div className="editor-box">
        <EditorContent editor={editor} className="editor-content" />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Actualizar documento"
      >
        <FormReutilizable
          ref={formRef}
          fields={[
            {
              nombreCampo: "descripcion",
              labelText: "Descripción",
              type: "textarea",
              width: "100%",
            },
            {
              nombreCampo: "tags",
              labelText: "Tags (separados por ;)",
              type: "text",
              width: "100%",
            },
          ]}
          onChangeForm={() => {}}
        />

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button onClick={handleConfirmarGuardado}>✅ Confirmar</button>
        </div>
      </Modal>
    </div>
  )
}
