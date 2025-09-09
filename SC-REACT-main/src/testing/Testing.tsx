import { useEffect, useState } from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Estructura from "../components/Estructura/Estructura";
import ContenidoViewer from "../components/ContenidoViewer/ContenidoViewer";

// ==========================
// Mock de API
// ==========================
const mock = new MockAdapter(axios, { delayResponse: 500 });

let mockContenidos = [
  {
    id_contenido: 1,
    titulo: "Manual de Seguridad",
    descripcion: "PDF con normas",
    id_tipo: 1,
    id_usuario: 101,
    fecha_creacion: new Date().toISOString(),
    almacenamiento: "ARCHIVO",
    url_archivo: "/files/manual.pdf",
  },
  {
    id_contenido: 2,
    titulo: "Instructivo HTML",
    descripcion: "Documento interno",
    id_tipo: 1,
    id_usuario: 102,
    fecha_creacion: new Date().toISOString(),
    almacenamiento: "HTML",
    html: "<h1>Bienvenido</h1><p>Prueba</p>",
  },
];

let mockTipos = [
  { id_tipo: 1, nombre: "Documento" },
  { id_tipo: 2, nombre: "Video" },
  { id_tipo: 3, nombre: "Imagen" },
];

let mockUsuarios = [
  { id_Usuario: 101, userName: "admin" },
  { id_Usuario: 102, userName: "juan" },
];

mock.onGet("/api/contenido").reply(200, mockContenidos);
mock.onGet("/api/tipos-conocimiento").reply(200, mockTipos);
mock.onGet("/api/usuarios").reply(200, mockUsuarios);

mock.onPost("/api/contenido").reply((config) => {
  const nuevo = JSON.parse(config.data);
  nuevo.id_contenido = mockContenidos.length + 1;
  nuevo.fecha_creacion = new Date().toISOString();
  mockContenidos.push(nuevo);
  return [201, nuevo];
});

mock.onPut(/\/api\/contenido\/\d+/).reply((config) => {
  const id = parseInt(config.url!.split("/").pop()!);
  const actualizado = JSON.parse(config.data);
  const index = mockContenidos.findIndex((c) => c.id_contenido === id);
  if (index !== -1) {
    mockContenidos[index] = { ...mockContenidos[index], ...actualizado };
    return [200, mockContenidos[index]];
  }
  return [404];
});

mock.onDelete(/\/api\/contenido\/\d+/).reply((config) => {
  const id = parseInt(config.url!.split("/").pop()!);
  mockContenidos = mockContenidos.filter((c) => c.id_contenido !== id);
  return [200];
});

// ==========================
// Tipos
// ==========================
type Contenido = {
  id_contenido: number;
  titulo: string;
  descripcion: string;
  id_tipo: number;
  id_usuario: number;
  fecha_creacion: string;
  almacenamiento: "ARCHIVO" | "HTML" | "TEXTO";
  url_archivo?: string;
  html?: string;
  textoPlano?: string;
};

export default function Testing() {
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [form, setForm] = useState<Partial<Contenido>>({});
  const [tipos, setTipos] = useState<{ id_tipo: number; nombre: string }[]>([]);
  const [usuarios, setUsuarios] = useState<
    { id_Usuario: number; userName: string }[]
  >([]);
  const [modo, setModo] = useState<"LISTA" | "FORM">("LISTA");

  useEffect(() => {
    axios.get("/api/contenido").then((res) => {
      console.log("API /contenido devolvió:", res.data);
      setContenidos(Array.isArray(res.data) ? res.data : []);
    });
    axios.get("/api/tipos-conocimiento").then((res) => setTipos(res.data));
    axios.get("/api/usuarios").then((res) => setUsuarios(res.data));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id_contenido) {
      await axios.put(`/api/contenido/${form.id_contenido}`, form);
    } else {
      await axios.post(`/api/contenido`, form);
    }
    const res = await axios.get("/api/contenido");
    setContenidos(Array.isArray(res.data) ? res.data : []);
    setModo("LISTA");
  };

  const handleEdit = (c: Contenido) => {
    setForm(c);
    setModo("FORM");
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`/api/contenido/${id}`);
    setContenidos(contenidos.filter((c) => c.id_contenido !== id));
  };

  return (
    <Estructura>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <ContenidoViewer
          titulo="Manual de Cosecha"
          autor="MLucero"
          tipo={1} // PDF
          archivoUrl="D:\Documentos\1-pdf.pdf"
        />

        <ContenidoViewer
          titulo="Tutorial de herramientas"
          autor="Nacho"
          tipo={2} // Video
          archivoUrl="http://localhost:1235/uploads/VIDEO/45-demo.mp4"
        />

        <ContenidoViewer
          titulo="Foto de la plantación"
          autor="Luis"
          tipo={3} // Imagen
          archivoUrl="D:\Documentos\2-foto"
        />
      </div>
    </Estructura>
  );
}
