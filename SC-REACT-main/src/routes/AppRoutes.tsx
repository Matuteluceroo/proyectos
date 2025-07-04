// src/routes/AppRoutes.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/Login/Login";
import MenuLic from "../pages/Licitadores/MenuLic/MenuLic";
import DemandaLicitacion from "../pages/Licitadores/DemandaLicitacion/DemandaLicitacion";
import SeleccionCostos from "../pages/Licitadores/SeleccionCostos/SeleccionCostos";
import VistaLicitacion from "../pages/Licitadores/VistaLicitacion/VistaLicitacion";
import Preganados from "../pages/Licitadores/Preganados/PreGanados";
import Cotizaciones from "../pages/Compras/Cotizaciones/Cotizaciones";
import HojaRuta from "../pages/Logistica/HojaRuta";
import ListaPartes from "../pages/Logistica/ListaPartes";
import ListaRemitos from "../pages/Logistica/ListaRemitos";
import Administracion from "../pages/Administracion/Administracion";
import InformesLicitaciones from "../pages/InformesGerenciales/InformesLicitaciones/InformesLicitaciones";
import InformesLaboratorios from "../pages/InformesGerenciales/InformesLaboratorios/InformesLaboratorios";
import InformesProductos from "../pages/InformesGerenciales/InformesProductos/InformesProductos";
import InformesCobranzas from "../pages/InformesGerenciales/informesCobranzas/InformesCobranzas";
import InformeLicitacion from "../pages/InformesGerenciales/DataLicitacion";
import Cobranzas from "../pages/Cobranzas/MenuCobranzas";
import Factura from "../pages/Cobranzas/Factura";
import Testing from "../testing/Testing";
import Kairos from "../pages/Compras/KairosCRUD/Kairos";
import Reportes from "../pages/CentroReportes/Reportes";
import ReporteBase from "../pages/CentroReportes/reportesPowerBI/BaseReporte";
import Comparativos from "../pages/Comparativos/Comparativos";
import ControlRemitos from "../pages/Licitadores/ControlRemitos/ControlRemitos";
import MenuInformes from "../pages/InformesGerenciales/MenuInformesGerenciales";
// import InformesProductos from "../pages/InformesGerenciales/InformesProductos"
import Sugerencias from "../pages/CentroReportes/Sugerencias";
import Stock from "../pages/CentroReportes/Stock";
import Contenido from "../pages/Contenido/Contenido";
import Documentos from "../pages/Documentos/Documentos";
import VerDocumento from "../pages/Documentos/VerDocumento";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/menu_licitaciones"
        element={
          <PrivateRoute
            element={<MenuLic />}
            allowedRoles={["LICITADOR", "LIDER-LICITADOR"]}
          />
        }
      />
      <Route
        path="/licitacion_demanda"
        element={
          <PrivateRoute
            element={<DemandaLicitacion />}
            allowedRoles={["LICITADOR", "LIDER-LICITADOR"]}
          />
        }
      />
      <Route
        path="/control_remitos"
        element={
          <PrivateRoute
            element={<ControlRemitos />}
            allowedRoles={["LICITADOR", "LIDER-LICITADOR"]}
          />
        }
      />

      <Route path="/comparativos_admin" element={<Comparativos />} />
      <Route
        path="/seleccion_costos"
        element={
          <PrivateRoute
            element={<SeleccionCostos />}
            allowedRoles={["LICITADOR", "LIDER-LICITADOR"]}
          />
        }
      />
      <Route
        path="/vista_licitacion"
        element={
          <PrivateRoute
            element={<VistaLicitacion />}
            allowedRoles={["LICITADOR", "LIDER-LICITADOR"]}
          />
        }
      />
      <Route
        path="/cotizaciones"
        element={
          <PrivateRoute
            element={<Cotizaciones />}
            allowedRoles={["COMPRADOR"]}
          />
        }
      />
      <Route
        path="/logistica/hoja-de-ruta"
        element={
          <PrivateRoute
            element={<HojaRuta />}
            allowedRoles={["ADMLOGISTICA"]}
          />
        }
      />
      <Route
        path="/logistica/lista-partes"
        element={
          <PrivateRoute
            element={<ListaPartes />}
            allowedRoles={["LOGISTICA", "ADMLOGISTICA"]}
          />
        }
      />
      <Route
        path="/logistica/lista-remitos/:nro_parte"
        element={
          <PrivateRoute
            element={<ListaRemitos />}
            allowedRoles={["LOGISTICA", "ADMLOGISTICA"]}
          />
        }
      />
      <Route
        path="/administrador_kairos"
        element={
          <PrivateRoute element={<Kairos />} allowedRoles={["ADM-KAIROS"]} />
        }
      />
      <Route
        path="/cobranzas"
        element={
          <PrivateRoute
            element={<Cobranzas />}
            allowedRoles={["COBRADOR", "LICITADOR", "ADMCOBRANZAS"]}
          />
        }
      />
      <Route
        path="/preganados"
        element={
          <PrivateRoute
            element={<Preganados />}
            allowedRoles={["LICITADOR", "LIDER-LICITADOR"]}
          />
        }
      />
      <Route
        path="/factura"
        element={
          <PrivateRoute
            element={<Factura />}
            allowedRoles={["COBRADOR", "LICITADOR", "ADMCOBRANZAS"]}
          />
        }
      />
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
        path="/sugerencias"
        element={
          <PrivateRoute
            element={<Sugerencias />}
            allowedRoles={["ADMINISTRADOR"]}
          />
        }
      />
      <Route
        path="/menu-informes-gerenciales"
        element={
          <PrivateRoute element={<MenuInformes />} allowedRoles={["GERENTE"]} />
        }
      >
        <Route
          path="informes-licitaciones"
          element={<InformesLicitaciones />}
        />
        <Route path="informes-productos" element={<InformesProductos />} />
        <Route path="informes-laboratorio" element={<InformesLaboratorios />} />
        <Route path="datos-licitacion" element={<InformeLicitacion />} />
        <Route path="informes-cobranzas" element={<InformesCobranzas />} />
      </Route>

      <Route
        path="/testing"
        element={
          <PrivateRoute element={<Testing />} allowedRoles={["TESTER"]} />
        }
      />
      <Route
        path="/reportes"
        element={
          <PrivateRoute
            element={<Reportes />}
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
        path="/reportes/:selectedLink"
        element={
          <PrivateRoute
            element={<ReporteBase />}
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
        path="/stock"
        element={
          <PrivateRoute
            element={<Stock />}
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
