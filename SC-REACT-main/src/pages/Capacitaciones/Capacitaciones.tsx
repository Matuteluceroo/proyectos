import { useState, useEffect } from "react";
import Estructura from "../../components/Estructura/Estructura";
import { useCapacitaciones } from "../../services/connections/capacitaciones";
import Buscador from "../Buscador/Buscador";
import eliminarIco from "../../assets/trash.svg";
import "./Capacitaciones.css";
import FormReutilizable from "../../components/DynamicForm/FormReutilizable";
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable";
import Modal from "../../components/Modal/Modal";
import BuscadorCapacitaciones from "./BuscadorCapacitaciones";
import PreviewVisor from "./PreviewModal";

export default function Capacitaciones() {
  const { getAll, create, update, remove, getById } = useCapacitaciones();

  // --------------------------
  // Estados
  // --------------------------
  const [formData, setFormData] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [capacitaciones, setCapacitaciones] = useState<any[]>([]);
  const [contenidos, setContenidos] = useState<any[]>([]);
  const [showBuscador, setShowBuscador] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTipo, setPreviewTipo] = useState<
    "PDF" | "VIDEO" | "IMAGEN" | "HTML" | null
  >(null);
  const [previewNombre, setPreviewNombre] = useState<string | undefined>();
  const [previewId, setPreviewId] = useState<number | undefined>();

  const abrirPreview = (row: any) => {
    const tipo = row.tipoNombre?.toUpperCase();
    if (["PDF", "VIDEO", "IMAGEN", "HTML"].includes(tipo)) {
      setPreviewTipo(tipo as any);
      if (tipo === "HTML") setPreviewId(row.id);
      else setPreviewNombre(row.titulo); // nombre del archivo
      setPreviewOpen(true);
    }
  };

  // --------------------------
  // Cargar capacitaciones
  // --------------------------
  useEffect(() => {
    cargarCapacitaciones();
  }, []);

  const cargarCapacitaciones = async () => {
    const data = await getAll();
    if (Array.isArray(data)) setCapacitaciones(data);
  };

  // --------------------------
  // Formulario
  // --------------------------
  const campos = [
    {
      nombreCampo: "nombre",
      labelText: "Nombre de la capacitación",
      type: "text" as const,
      placeholder: "Ej: Curso de riego avanzado",
    },
    {
      nombreCampo: "descripcion",
      labelText: "Descripción",
      type: "textarea" as const,
      placeholder: "Breve descripción de la capacitación...",
    },
  ];
  const handleChangeForm = (formValues: Record<string, any>) => {
    setFormData(formValues);
  };

  const handleGuardar = async () => {
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      id_creador: 1, // reemplazalo por currentUser.id
      contenidos: contenidos.map((c) => ({
        id_contenido: c.id,
        tipo_origen: c.origen,
      })),
    };

    if (editMode && idEditando) {
      await update(idEditando, payload);
    } else {
      await create(payload);
    }

    resetForm();
    await cargarCapacitaciones();
  };

  const resetForm = () => {
    setFormData({});
    setEditMode(false);
    setIdEditando(null);
    setContenidos([]);
  };

  // --------------------------
  // Edición y eliminación
  // --------------------------
  const handleEditar = async (cap: any) => {
    const detalle = await getById(cap.id_capacitacion);
    const seleccionados =
      Array.isArray(detalle) &&
      detalle
        .filter((r: any) => r.id_contenido)
        .map((r: any) => ({
          id: r.id_contenido,
          titulo: r.titulo,
          tipoNombre: r.tipoNombre,
          origen: r.tipo_origen,
        }));

    setFormData({
      nombre: cap.nombre,
      descripcion: cap.descripcion,
    });
    setContenidos(seleccionados || []);
    setEditMode(true);
    setIdEditando(cap.id_capacitacion);
  };

  const handleEliminar = async (id: number) => {
    if (confirm("¿Eliminar esta capacitación?")) {
      await remove(id);
      await cargarCapacitaciones();
    }
  };

  // --------------------------
  // Contenidos (Buscador + Tabla)
  // --------------------------
  const agregarContenido = (item: any) => {
    setContenidos((prev) => {
      const existe = prev.some(
        (c) => c.id === item.id && c.origen === item.origen
      );
      if (existe) return prev;
      return [...prev, item];
    });
    setShowBuscador(false);
  };

  const quitarContenido = (id: number, origen: string) => {
    setContenidos((prev) =>
      prev.filter((c) => !(c.id === id && c.origen === origen))
    );
  };
  const columnasCapacitaciones = [
    { id: "id_capacitacion", label: "ID", width: "70px" },
    { id: "nombre", label: "Nombre", width: "200px" },
    { id: "descripcion", label: "Descripción", width: "300px" },
    { id: "fecha_creacion", label: "Creación", width: "100px" },
    {
      id: "btnEditar",
      label: "Editar",
      width: "70px",
      onclick: handleEditar,
    },
    {
      id: "btnEliminar",
      label: "Eliminar",
      width: "80px",
      onclick: (row: any) => handleEliminar(row.id_capacitacion),
    },
  ];

  const columnasContenidos = [
    { id: "id", label: "ID", width: "60px" },
    { id: "titulo", label: "Título", width: "250px" },
    { id: "tipoNombre", label: "Tipo", width: "140px" },
    { id: "origen", label: "Origen", width: "90px" },
    {
      id: "btnPreview",
      label: "Vista previa",
      width: "120px",
      onclick: (row: any) => abrirPreview(row),
    },
    {
      id: "btnEliminar",
      label: "Quitar",
      width: "70px",
      ico: eliminarIco,
      onclick: (row: any) => quitarContenido(row.id, row.origen),
    },
  ];

  // --------------------------
  // Render principal
  // --------------------------
  return (
    <Estructura>
      <div className="capacitaciones-container">
        <div className="capacitaciones-formulario">
          <h2 className="titulo">Capacitaciones</h2>
          <FormReutilizable
            fields={campos}
            onChangeForm={handleChangeForm}
            values={formData}
          />

          <div className="acciones-form">
            <button className="btn-primario" onClick={handleGuardar}>
              {editMode ? "Actualizar" : "Crear"}
            </button>
            {editMode && (
              <button className="btn-secundario" onClick={resetForm}>
                Cancelar
              </button>
            )}
            <button
              className="btn-agregar"
              onClick={() => setShowBuscador(true)}
            >
              + Agregar Contenido
            </button>
          </div>

          <div className="tabla-contenidos">
            <VirtualizedTable
              nombreTabla="contenidos_seleccionados"
              columns={columnasContenidos}
              rows={contenidos}
              setRows={setContenidos} // ✅ usa el mismo estado
            />
          </div>
        </div>

        <div className="tabla-capacitaciones">
          <VirtualizedTable
            nombreTabla="capacitaciones"
            columns={columnasCapacitaciones}
            rows={capacitaciones}
            setRows={setCapacitaciones}
          />
        </div>
      </div>

      {/* 🔍 Modal buscador */}
      {showBuscador && (
        <PreviewVisor
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          tipo={previewTipo}
          nombre={previewNombre}
          id={previewId}
        />
      )}
    </Estructura>
  );
}
