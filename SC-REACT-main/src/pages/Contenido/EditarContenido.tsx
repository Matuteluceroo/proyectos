import Estructura from "../../components/Estructura/Estructura";
import EditorTextoEditar from "../../components/EditorTexto/EditorTextoEditar";

export default function EditarContenido() {
  return (
    <Estructura>
      <div style={{ height: "100vh", padding: "1rem" }}>
        <h1 className="text-center mb-3">✏️ Editar Contenido</h1>
        <EditorTextoEditar />
      </div>
    </Estructura>
  );
}
