// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Estructura from "../../components/Estructura/Estructura";
// import EditorTexto from "../../components/EditorTexto/EditorTexto";
// import {
//   useObtenerDocumentoByID,
//   useActualizarDocumento,
// } from "../../services/connections/documentos";
// import "./EditorHTML.css";

export default function EditorHTML() {
  //   const { id } = useParams();
  //   const navigate = useNavigate();
  //   const obtenerDocumentoByID = useObtenerDocumentoByID();
  //   const actualizarDocumento = useActualizarDocumento();

  //   const [titulo, setTitulo] = useState("");
  //   const [descripcion, setDescripcion] = useState("");
  //   const [html, setHtml] = useState("");
  //   const [textoPlano, setTextoPlano] = useState("");
  //   const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     const fetchDocumento = async () => {
  //       try {
  //         const data = await obtenerDocumentoByID(Number(id));
  //         if (!data) throw new Error("Documento no encontrado");
  //         setTitulo(data.titulo || "");
  //         setDescripcion(data.descripcion || "");
  //         setHtml(data.html || "");
  //         setTextoPlano(data.textoPlano || "");
  //       } catch (error) {
  //         console.error("❌ Error al cargar documento:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchDocumento();
  //   }, [id]);

  //   const handleGuardar = async () => {
  //     try {
  //       await actualizarDocumento(Number(id), {
  //         titulo,
  //         descripcion,
  //         html,
  //         textoPlano,
  //       });
  //       alert("✅ Documento actualizado correctamente");
  //     } catch (error) {
  //       console.error("❌ Error al actualizar documento:", error);
  //     }
  //   };

  //   if (loading)
  //     return (
  //       <Estructura>
  //         <p style={{ color: "#497b1a", textAlign: "center" }}>Cargando documento...</p>
  //       </Estructura>
  //     );

  return <h1>EditorHTML</h1>;
  //     <Estructura>
  //       <div className="editorhtml-wrapper">
  //         <h2 className="titulo-editor">✏️ Editar documento #{id}</h2>

  //         <div className="form-group">
  //           <label className="label">Título:</label>
  //           <input
  //             type="text"
  //             className="input"
  //             value={titulo}
  //             onChange={(e) => setTitulo(e.target.value)}
  //           />
  //         </div>

  //         <div className="form-group">
  //           <label className="label">Descripción:</label>
  //           <textarea
  //             className="input textarea"
  //             rows={2}
  //             value={descripcion}
  //             onChange={(e) => setDescripcion(e.target.value)}
  //           />
  //         </div>

  //         {/* 🧩 Split View: Editor + Vista previa */}
  //         <div
  //           className="split-container"
  //           style={{
  //             display: "grid",
  //             gridTemplateColumns: "1fr 1fr",
  //             gap: "20px",
  //             marginTop: "15px",
  //           }}
  //         >
  //           {/* 🖋️ Editor */}
  //           <div className="editor-zone">
  //             <EditorTexto
  //               initialContent={html}
  //               onChange={(nuevoHtml, textoPlano) => {
  //                 setHtml(nuevoHtml);
  //                 setTextoPlano(textoPlano);
  //               }}
  //             />
  //           </div>

  //           {/* 👁️ Vista previa */}
  //           <div
  //             className="preview-zone"
  //             style={{
  //               border: "1px solid #ddd",
  //               borderRadius: "8px",
  //               padding: "15px",
  //               backgroundColor: "white",
  //               overflowY: "auto",
  //               height: "600px",
  //             }}
  //           >
  //             <h3 style={{ color: "#497b1a", marginBottom: "10px" }}>Vista previa</h3>
  //             <div
  //               dangerouslySetInnerHTML={{ __html: html }}
  //               style={{
  //                 lineHeight: "1.5",
  //                 fontFamily: "Arial, sans-serif",
  //                 color: "#333",
  //               }}
  //             />
  //           </div>
  //         </div>

  //         <div className="acciones-editor" style={{ marginTop: "20px" }}>
  //           <button onClick={handleGuardar} className="btn-guardar">
  //             💾 Guardar cambios
  //           </button>
  //           <button onClick={() => navigate("/contenido")} className="btn-volver">
  //             🔙 Volver
  //           </button>
  //         </div>
  //       </div>
  //     </Estructura>
  //   );
}
