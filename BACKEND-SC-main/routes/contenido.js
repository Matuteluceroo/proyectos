import multer from "multer";
import path from "path";
import { Router } from "express";
import { ContenidoController } from "../controllers/contenido.js";
import { validateToken } from "../middleware/jwt.js";

export const contenidosRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.RUTA_CONTENIDOS);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// Rutas separadas por tipo
contenidosRouter.post(
  "/subir-pdf",
  validateToken,
  upload.single("archivo"),
  ContenidoController.subirPDF
);

contenidosRouter.post(
  "/subir-video",
  validateToken,
  upload.single("archivo"),
  ContenidoController.subirVideo
);

contenidosRouter.post(
  "/subir-imagen",
  validateToken,
  upload.single("archivo"),
  ContenidoController.subirImagen
);

contenidosRouter.get(
  "/listar",
  validateToken,
  ContenidoController.listarContenidos
);


// GET /api/contenidos/:id/archivos  -> lista archivos por id
contenidosRouter.get('/:id/archivos', validateToken, ContenidoController.listarArchivosPorId);

// GET /api/contenidos/archivo/:tipo/:fileName -> sirve archivo (inline/stream)
contenidosRouter.get('/archivo/:tipo/:fileName', validateToken, ContenidoController.servirArchivo);
