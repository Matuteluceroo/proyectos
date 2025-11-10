import { useEffect, useState } from "react";
import Estructura from "../../components/Estructura/Estructura";
import { useCapacitaciones } from "../../services/connections/capacitaciones";
import { useContenidosCompletos } from "../../services/connections/contenido";
import "./Capacitaciones.css";
import { useSocket } from "../../services/SocketContext";

/** ===== Tipos ===== */
type Origen = "ARCHIVO" | "HTML";

interface ContenidoListado {
  id: number;
  origen: Origen; // viene de /contenidos/todos
  titulo: string;
  tipoNombre?: string;
  autorNombre?: string;
  url_archivo?: string;
}

interface ContenidoSeleccion {
  id_contenido: number;
  tipo_origen: Origen; // lo que enviamos al backend
}

interface CapacitacionResumen {
  id_capacitacion: number;
  nombre: string;
  descripcion?: string;
  fecha_creacion?: string;
}

interface FormState {
  id_capacitacion: number | null;
  nombre: string;
  descripcion: string;
  contenidos: ContenidoSeleccion[];
}

export default function Capacitaciones() {
  const { currentUser, notificaciones } = useSocket();
  const { getAll, create, update, remove, getById } = useCapacitaciones();
  const { getAllCompletos } = useContenidosCompletos();

  // 💡 Tipar los estados evita el never[]
  const [capacitaciones, setCapacitaciones] = useState<CapacitacionResumen[]>(
    []
  );
  const [contenidos, setContenidos] = useState<ContenidoListado[]>([]);
  const [form, setForm] = useState<FormState>({
    id_capacitacion: null,
    nombre: "",
    descripcion: "",
    contenidos: [], // ContenidoSeleccion[]
  });
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    cargarCapacitaciones();
    cargarContenidos();
  }, []);

  const cargarCapacitaciones = async () => {
    const data = await getAll();
    if (Array.isArray(data)) {
      // asegurar el shape mínimo
      const mapped: CapacitacionResumen[] = data.map((c: any) => ({
        id_capacitacion: c.id_capacitacion,
        nombre: c.nombre,
        descripcion: c.descripcion,
        fecha_creacion: c.fecha_creacion,
      }));
      setCapacitaciones(mapped);
    } else {
      setCapacitaciones([]);
    }
  };

  const cargarContenidos = async () => {
    const data = await getAllCompletos();
    if (Array.isArray(data)) {
      const mapped: ContenidoListado[] = data.map((x: any) => ({
        id: x.id,
        origen: (x.origen as Origen) ?? "ARCHIVO",
        titulo: x.titulo,
        tipoNombre: x.tipoNombre,
        autorNombre: x.autorNombre,
        url_archivo: x.url_archivo,
      }));
      setContenidos(mapped);
    } else {
      setContenidos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      id_creador: currentUser.id,
      contenidos: form.contenidos.map((c) => ({
        id_contenido: c.id_contenido,
        tipo_origen: c.tipo_origen,
      })),
    };
    if (editMode && form.id_capacitacion) {
      await update(form.id_capacitacion, payload);
    } else {
      await create(payload);
    }
    resetForm();
    await cargarCapacitaciones();
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta capacitación?")) {
      await remove(id);
      await cargarCapacitaciones();
    }
  };

  // Para editar, ideal traer los contenidos asociados desde GET /capacitaciones/:id
  const handleEdit = async (cap: CapacitacionResumen) => {
    // Traer detalle (incluye contenidos con id_contenido + tipo_origen)
    const detalle = await getById(cap.id_capacitacion);
    // detalle puede venir como lista de filas; convertimos a lista de contenidos únicos
    const seleccion: ContenidoSeleccion[] = Array.isArray(detalle)
      ? detalle
          .filter((r: any) => r?.id_contenido && r?.tipo_origen)
          .map((r: any) => ({
            id_contenido: Number(r.id_contenido),
            tipo_origen: (r.tipo_origen as Origen) ?? "ARCHIVO",
          }))
      : [];

    setForm({
      id_capacitacion: cap.id_capacitacion,
      nombre: cap.nombre ?? "",
      descripcion: cap.descripcion ?? "",
      contenidos: dedupeSelecciones(seleccion),
    });
    setEditMode(true);
  };

  const resetForm = () => {
    setForm({
      id_capacitacion: null,
      nombre: "",
      descripcion: "",
      contenidos: [],
    });
    setEditMode(false);
  };

  // Alterna selección de un contenido (desde la lista de la derecha)
  const toggleContenido = (contenido: ContenidoListado) => {
    setForm((prev) => {
      const existe = prev.contenidos.some(
        (c) =>
          c.id_contenido === contenido.id && c.tipo_origen === contenido.origen
      );
      if (existe) {
        return {
          ...prev,
          contenidos: prev.contenidos.filter(
            (c) =>
              !(
                c.id_contenido === contenido.id &&
                c.tipo_origen === contenido.origen
              )
          ),
        };
      }
      return {
        ...prev,
        contenidos: [
          ...prev.contenidos,
          { id_contenido: contenido.id, tipo_origen: contenido.origen },
        ],
      };
    });
  };

  const isContenidoSeleccionado = (contenido: ContenidoListado) =>
    form.contenidos.some(
      (c) =>
        c.id_contenido === contenido.id && c.tipo_origen === contenido.origen
    );

return (
  <Estructura>
    <div className="p-6 space-y-8">
      {/* Título principal */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          📘 Gestión de Capacitaciones
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Creá, editá y organizá capacitaciones combinando contenidos HTML y archivos.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow rounded-2xl p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">
          {editMode ? "Editar capacitación" : "Nueva capacitación"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Descripción
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
              />
            </div>
          </div>

          {/* Selector de contenidos */}
          <div>
            <p className="font-medium text-slate-600 mb-2">Seleccionar contenidos:</p>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg border-slate-200">
              {contenidos.map((c) => (
                <span
                  key={`${c.id}-${c.origen}`}
                  onClick={() => toggleContenido(c)}
                  className={`px-3 py-1 text-sm rounded-full cursor-pointer border transition-all duration-200 
                    ${
                      isContenidoSeleccionado(c)
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-blue-50 border-slate-300"
                    }`}
                >
                  {c.titulo.replace(/_/g, " ")}{" "}
                  <span className="text-xs opacity-80">({c.origen})</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {editMode ? "Actualizar capacitación" : "Crear capacitación"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de capacitaciones */}
      <div>
        <h2 className="text-xl font-semibold text-slate-700 mb-3 flex items-center gap-2">
          📋 Capacitaciones existentes
        </h2>

        <div className="bg-white shadow border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4">Creada</th>
                <th className="py-2 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {capacitaciones.map((cap) => (
                <tr
                  key={cap.id_capacitacion}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="py-2 px-4 text-slate-700">{cap.id_capacitacion}</td>
                  <td className="py-2 px-4 font-medium text-slate-800">{cap.nombre}</td>
                  <td className="py-2 px-4 text-slate-600">{cap.descripcion}</td>
                  <td className="py-2 px-4 text-slate-500">{cap.fecha_creacion}</td>
                  <td className="py-2 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(cap)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(cap.id_capacitacion)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {capacitaciones.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-500 py-4">
                    No hay capacitaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Estructura>
);

}

/** Dedup por (id_contenido, tipo_origen) */
function dedupeSelecciones(items: ContenidoSeleccion[]): ContenidoSeleccion[] {
  const seen = new Set<string>();
  const out: ContenidoSeleccion[] = [];
  for (const it of items) {
    const key = `${it.id_contenido}-${it.tipo_origen}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}
