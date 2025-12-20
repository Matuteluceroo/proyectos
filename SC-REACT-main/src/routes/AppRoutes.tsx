// src/routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PrivateRoute from "./PrivateRoute"
import Login from "../pages/Login/Login"
import Administracion from "../pages/Administracion/Administracion"
import Dashboard from "../pages/Dashboard/Dashboard"
import InformesLicitaciones from "../pages/InformesGerenciales/InformesLicitaciones/InformesLicitaciones"
import InformesLaboratorios from "../pages/InformesGerenciales/InformesLaboratorios/InformesLaboratorios"
import InformesProductos from "../pages/InformesGerenciales/InformesProductos/InformesProductos"
import Testing from "../testing/Testing"
import MenuInformes from "../pages/InformesGerenciales/MenuInformesGerenciales"
// import InformesProductos from "../pages/InformesGerenciales/InformesProductos"
import Contenido from "../pages/Contenido/Contenido"
import Buscador from "../pages/Buscador/Buscador"
import Documentos from "../pages/Documentos/Documentos"
// import VerDocumento from "../pages/Documentos/VerDocumento";
import EditarContenido from "../pages/Contenido/EditarContenido"
import GestorContenido from "../pages/Contenido/GestorContenido"
import HtmlVisorPure from "../components/Visores/HtmlVisorPure"
import PdfVisorPure from "../components/Visores/PdfVisorPure"
import VideoVisorPure from "../components/Visores/VideoVisorPure"
import ImagenVisorPure from "../components/Visores/ImagenVisorPure"
import HtmlVisorPureCurso from "../components/Visores/Cursos/HtmlVisorPureCurso"
import PdfVisorPureCurso from "../components/Visores/Cursos/PdfVisorPureCurso"
import VideoVisorPureCurso from "../components/Visores/Cursos/VideoVisorPure"
import ImagenVisorPureCurso from "../components/Visores/Cursos/ImagenVisorPure"
import VisorHtml from "../pages/Contenido/VisorHtml"
import VisorPDF from "../pages/Visor/VisorPDF"
import VisorVideo from "../pages/Visor/VisorVideo"
import VisorImagen from "../pages/Visor/VisorImagen"
import Capacitaciones from "../pages/Capacitaciones/Capacitaciones"
import BuscadorVoz from "../pages/Buscador/BuscadorVoz"
import CursoViewer from "../pages/CursoViewer/CursoViewer"
import MisCapacitaciones from "../pages/MisCapacitaciones/MisCapacitaciones"
import FeedbackConocimiento from "../pages/FeedbackConocimiento/FeedbackConocimiento"

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/administracion"
        element={
          <PrivateRoute
            element={<Administracion />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/menu-informes-gerenciales"
        element={
          <PrivateRoute
            element={<MenuInformes />}
            allowedRoles={["GERENTE", "ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      >
        <Route
          path="informes-conocimientos"
          element={<InformesLicitaciones />}
        />
        <Route path="informes-productos" element={<InformesProductos />} />
        <Route path="informes-laboratorio" element={<InformesLaboratorios />} />
      </Route>

      <Route
        path="/testing"
        element={
          <PrivateRoute element={<Testing />} allowedRoles={["TESTER"]} />
        }
      />
      <Route
        path="/informes"
        element={
          <PrivateRoute
            element={<InformesLicitaciones />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
              "EMPLEADO",
              "EXPERTO",

              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute
            element={<Dashboard />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
              "EMPLEADO",
              "EXPERTO",

              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      />
      <Route
        path="/visor-pdf/:nombre"
        element={
          <PrivateRoute
            element={<VisorPDF />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/visor-video/:nombre"
        element={
          <PrivateRoute
            element={<VisorVideo />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/visor-imagen/:nombre"
        element={
          <PrivateRoute
            element={<VisorImagen />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      {/* <Route
        path="/visor/:id"
        element={
          <PrivateRoute element={<Visor />} allowedRoles={["ADMINISTRADOR","EMPLEADO","EXPERTO",]} />
        }
      /> */}
      <Route
        path="/editar-contenido/:id"
        element={
          <PrivateRoute
            element={<EditarContenido />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/visor-html/:id"
        element={
          <PrivateRoute
            element={<VisorHtml />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />

      <Route
        path="/contenido"
        element={
          <PrivateRoute
            element={<GestorContenido />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/crear-contenido"
        element={
          <PrivateRoute
            element={<Contenido />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/buscador"
        element={
          <PrivateRoute
            element={<Buscador />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
              "EMPLEADO",
              "EXPERTO",

              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      />
      <Route
        path="/puntoconocimiento"
        element={
          <PrivateRoute
            element={<BuscadorVoz />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
              "EMPLEADO",
              "EXPERTO",

              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      />
      <Route
        path="/subir-contenido"
        element={
          <PrivateRoute
            element={<Documentos />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
              "EMPLEADO",
              "EXPERTO",

              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      />
      {/* <Route
        path="/documentos/:id"
        element={
          <PrivateRoute
            element={<VerDocumento />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR","EMPLEADO","EXPERTO",
              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      /> */}
      {/* ========= PREVIEW (SIN ESTRUCTURA) ========= */}
      <Route
        path="/preview/html/:id"
        element={
          <PrivateRoute
            element={<HtmlVisorPure />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />

      <Route
        path="/preview/pdf/:nombre"
        element={
          <PrivateRoute
            element={<PdfVisorPure />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute
            element={<FeedbackConocimiento />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />

      <Route
        path="/preview/video/:nombre"
        element={
          <PrivateRoute
            element={<VideoVisorPure />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />

      <Route
        path="/preview/imagen/:nombre"
        element={
          <PrivateRoute
            element={<ImagenVisorPure />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      {/* <Route
        path="/curso/:id"
        element={
          <PrivateRoute
            element={<CursoViewer />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />  */}
      {/* <Route
        path="/curso/:id"
        element={
          <PrivateRoute
            element={<CursoViewer />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      /> */}
      {/* <Route
        path="/curso/:id"
        element={
          <PrivateRoute
            element={<CursoViewer />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      >
        <Route path="preview/html/:idContenido" element={<HtmlVisorPure />} />
        <Route path="preview/pdf/:nombre" element={<PdfVisorPure />} />
        <Route path="preview/video/:nombre" element={<VideoVisorPure />} />
        <Route path="preview/imagen/:nombre" element={<ImagenVisorPure />} />
      </Route> */}
      <Route
        path="/curso/:id"
        element={
          <PrivateRoute
            element={<CursoViewer />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      >
        <Route
          path="vista/html/:idContenido"
          element={<HtmlVisorPureCurso />}
        />
        <Route path="vista/pdf/:nombre" element={<PdfVisorPure />} />
        <Route path="vista/video/:nombre" element={<VideoVisorPure />} />
        <Route path="vista/imagen/:nombre" element={<ImagenVisorPure />} />
      </Route>

      <Route
        path="/mis-capacitaciones"
        element={
          <PrivateRoute
            element={<MisCapacitaciones />}
            allowedRoles={["ADMINISTRADOR", "EMPLEADO", "EXPERTO"]}
          />
        }
      />
      <Route
        path="/capacitaciones"
        element={
          <PrivateRoute
            element={<Capacitaciones />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
              "EMPLEADO",
              "EXPERTO",

              "ADM-KAIROS",
              "LIDER-LICITADOR",
              "COMPRADOR",
              "LOGISTICA",
              "ADMLOGISTICA",
              "ADMIN-COMPARATIVOS",
            ]}
          />
        }
      />
    </Routes>
  </Router>
)

export default AppRoutes
