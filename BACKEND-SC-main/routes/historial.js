import { Router } from "express";
import { HistorialController } from "../controllers/historial.js";
import { validateToken } from "../middleware/jwt.js";

export const historialRouter = Router();

// ✅ Registrar nueva consulta al ver un contenido
historialRouter.post("/agregar", validateToken, HistorialController.registrarConsulta);

// (opcional) obtener todas las consultas
historialRouter.get("/", validateToken, HistorialController.getAll);
historialRouter.get("/top", validateToken, HistorialController.getTopConsultados);

