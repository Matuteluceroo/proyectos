// src/routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/Login/Login";
import Administracion from "../pages/Administracion/Administracion";
import Dashboard from "../pages/Dashboard/Dashboard";
import InformesLicitaciones from "../pages/InformesGerenciales/InformesLicitaciones/InformesLicitaciones";
import InformesLaboratorios from "../pages/InformesGerenciales/InformesLaboratorios/InformesLaboratorios";
import InformesProductos from "../pages/InformesGerenciales/InformesProductos/InformesProductos";
import Testing from "../testing/Testing";
import Visor from "../pages/Visor/Visor";
import MenuInformes from "../pages/InformesGerenciales/MenuInformesGerenciales";
// import InformesProductos from "../pages/InformesGerenciales/InformesProductos"
import Contenido from "../pages/Contenido/Contenido";
import Buscador from "../pages/Buscador/Buscador";
import Documentos from "../pages/Documentos/Documentos";
import VerDocumento from "../pages/Documentos/VerDocumento";

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
            allowedRoles={["ADMINISTRADOR"]}
          />
        }
      />
      <Route
        path="/menu-informes-gerenciales"
        element={
          <PrivateRoute
            element={<MenuInformes />}
            allowedRoles={["GERENTE", "ADMINISTRADOR"]}
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
        path="/visor/:id"
        element={
          <PrivateRoute
            element={<Visor />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
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
        path="/contenido"
        element={
          <PrivateRoute
            element={<Contenido />}
            allowedRoles={[
              "COBRADOR",
              "LICITADOR",
              "ADMCOBRANZAS",
              "TESTER",
              "GERENTE",
              "ADMINISTRADOR",
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
              "ADMINISTRADOR",
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
);

export default AppRoutes;
