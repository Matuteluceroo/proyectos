import { useEffect, useState } from "react";
import Estructura from "../../components/Estructura/Estructura";
import { useNavigate } from "react-router-dom";
import { useObtenerContenidosHTML } from "../../services/connections/documentos";
import "./Contenido.css";
import { useEliminarDocumento } from "../../services/connections/documentos"; // arriba del archivo

import Alert from "../../components/Alert/Alert";
import AlertErrores from "../../components/Alert/AlertErrores";
import AlertOptions from "../../components/Alert/AlertOptions";

export default function GestorContenido() {
  const navigate = useNavigate();
  const [contenidos, setContenidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const obtenerContenidosHTML = useObtenerContenidosHTML();
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState(false);
  const [alertConfirm, setAlertConfirm] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  const eliminarDocumento = useEliminarDocumento();

  const handleEliminar = (id: number) => {
    setIdAEliminar(id);
    setAlertConfirm(true); // abre el modal de confirmación
  };

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    setAlertConfirm(false);
    try {
      await eliminarDocumento(idAEliminar);
      setContenidos((prev) =>
        prev.filter((c) => c.id_contenido !== idAEliminar)
      );
      setAlertSuccess(true);
    } catch (err) {
      console.error("❌ Error al eliminar contenido:", err);
      setAlertError(true);
    } finally {
      setIdAEliminar(null);
    }
  };

  useEffect(() => {
    const fetchContenidos = async () => {
      try {
        const data = await obtenerContenidosHTML();
        setContenidos(data || []);
      } catch (err) {
        console.error("❌ Error al obtener contenidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContenidos();
  }, []);

  return (
    <Estructura>
      <div className="p-4">
        <h1 className="text-[#497b1a] font-semibold mb-4">
          📚 Gestor de Contenidos
        </h1>

        <div className="flex gap-3 mb-4">
          <button
            className="btn btn-success"
            onClick={() => navigate("/crear-contenido")}
          >
            ➕ Crear contenido
          </button>
        </div>

        <hr className="my-4" />

        <h2 className="text-[#497b1a] text-lg font-semibold mb-3">
          📄 Listado de Contenidos HTML
        </h2>

        {loading ? (
          <p className="text-gray-600">Cargando contenidos...</p>
        ) : contenidos.length === 0 ? (
          <p className="text-gray-600">No hay contenidos disponibles.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-striped w-full bg-white border rounded shadow-sm">
              <thead className="bg-[#7ab648] text-white">
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Autor</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {contenidos.map((c) => (
                  <tr key={c.id_contenido}>
                    <td>{c.id_contenido}</td>
                    <td>{c.titulo}</td>
                    <td className="truncate max-w-[250px]">
                      {c.descripcion || "-"}
                    </td>
                    <td>{c.id_usuario}</td>
                    <td>
                      {new Date(c.fecha_creacion).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            navigate(`/visor-html/${c.id_contenido}`)
                          }
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() =>
                            navigate(`/editar-contenido/${c.id_contenido}`)
                          }
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(c.id_contenido)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AlertOptions
        isOpen={alertConfirm}
        title="¿Eliminar contenido?"
        message="Esta acción no se puede deshacer. ¿Querés continuar?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminacion}
        onCancel={() => setAlertConfirm(false)}
      />

      <Alert
        isOpen={alertSuccess}
        setIsOpen={setAlertSuccess}
        message="El contenido fue eliminado correctamente."
        titulo="¡Éxito!"
      />

      <AlertErrores
        isOpen={alertError}
        setIsOpen={setAlertError}
        message="No se pudo eliminar el contenido."
        titulo="Error"
      />
    </Estructura>
  );
}
