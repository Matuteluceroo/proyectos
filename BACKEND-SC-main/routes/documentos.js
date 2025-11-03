import { Router } from "express";
import { ContenidoController } from "../controllers/documentos.js"; // mantenemos nombre de archivo
import { validateToken } from "../middleware/jwt.js";
import multer from "multer";
export const documentosRouter = Router();
// Configuración básica: guarda temporalmente, después el Controller lo mueve a la carpeta definitiva
const upload = multer({ dest: "uploads/tmp" });
// Crear documento con archivo
documentosRouter.post(
  "/upload",
  validateToken,
  upload.single("archivo"),
  ContenidoController.crearConArchivo
);

// Buscar
documentosRouter.get("/buscar", validateToken, ContenidoController.buscar);

// Obtener detalle
documentosRouter.get("/:id", validateToken, ContenidoController.getByID);

// ABM de Contenido
documentosRouter.post("/HTML", validateToken, ContenidoController.crearHTML);
documentosRouter.get(
  "/buscarHTML",
  validateToken,
  ContenidoController.buscarHTML
);
documentosRouter.get(
  "/HTML/:id",
  validateToken,
  ContenidoController.getByIDHTML
);
