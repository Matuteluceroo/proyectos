import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
// @ts-ignore
import html2pdf from "html2pdf.js";
import ModalImageUploader from "../ImageUploader/ImageUploader";
import Button from "../../components/Button/Button";

import { useCrearDocumento } from "../../services/connections/documentos";

import "./EditorTexto.css";

import Modal from "../Modal/Modal";
import FormReutilizable from "../DynamicForm/FormReutilizable";
import {
  Field,
  FormReutilizableRef,
} from "../DynamicForm/FormReutilizableTypes"; // ajustá ruta si hace falta
import { useRef, useState } from "react";
import { useSocket } from "../../services/SocketContext";

const EditorTexto = () => {
  const formRef = useRef<FormReutilizableRef>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { currentUser, notificaciones } = useSocket();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Superscript,
      Subscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: "<p>Escribí tu contenido acá...</p>",
  });
  const crearDocumento = useCrearDocumento();
  const [titulo, setTitulo] = useState("Documento sin título");
  const camposFormulario: Field[] = [
    {
      nombreCampo: "titulo",
      labelText: "Título",
      type: "text" as const,
      width: "100%",
    },
    {
      nombreCampo: "descripcion",
      labelText: "Descripción",
      type: "textarea" as const,
      width: "100%",
    },
    {
      nombreCampo: "previewImg",
      labelText: "Imagen de portada (URL)",
      type: "file" as const,
      width: "100%",
    },
    {
      nombreCampo: "tags",
      labelText: "Tags (coma separados)",
      type: "text" as const,
      width: "100%",
    },
  ];
  const handleAbrirModalGuardar = () => {
    setModalOpen(true);
  };
  const handleConfirmarGuardado = async () => {
    if (!editor || !formRef.current) return;

    const { titulo, descripcion, previewImg, tags } =
      formRef.current.getFormData();
    const html = editor.getHTML();
    const textoPlano = editor.getText();

    try {
      

      await crearDocumento({
        titulo,
        descripcion,
        id_tipo: 4, // el tipo correspondiente al contenido HTML en tu tabla TiposConocimiento
        id_usuario: currentUser.id,
        almacenamiento: "HTML",
        url_archivo: previewImg || null,
        html,
        textoPlano,
        tags,
      });

      alert("✅ Documento guardado correctamente");
      setModalOpen(false);
    } catch (error) {
      console.error("❌ Error al guardar documento:", error);
      alert("Ocurrió un error al guardar el documento");
    }
  };

  // const handleGuardar = async () => {
  //   if (!editor) return;

  //   try {
  //     const html = editor.getHTML();
  //     const textoPlano = editor.getText();

  //     await crearDocumento({
  //       titulo,
  //       html,
  //       textoPlano,
  //       autor: 3064, // Reemplazalo con el ID real del usuario logueado
  //     });

  //     alert("✅ Documento guardado con éxito");
  //   } catch (e) {
  //     alert("❌ Error al guardar documento: ");
  //   }
  // };

  const exportarPDF = () => {
    if (!editor) return;
    const content = editor.getHTML();
    html2pdf()
      .from(content)
      .set({
        margin: 10,
        filename: "contenido.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

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
          text="💾 Guardar"
          className="boton-accion"
          onClick={handleAbrirModalGuardar}
        />
      </div>

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
          onClick={exportarPDF}
        />
      </div>

      <div className="editor-box">
        <EditorContent editor={editor} className="editor-content" />
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Guardar documento"
        maxWidth="600px"
      >
        <FormReutilizable
          ref={formRef}
          fields={camposFormulario}
          onChangeForm={() => {}}
        />

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button onClick={handleConfirmarGuardado}>✅ Confirmar</button>
        </div>
      </Modal>
    </div>
  );
};

export default EditorTexto;
