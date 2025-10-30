import { Router } from "express";
import { TiposConocimientoController } from "../controllers/tiposConocimiento.js";
import { validateToken } from "../middleware/jwt.js";

export const tiposConocimientoRouter = Router();

// Rutas
tiposConocimientoRouter.get("/", validateToken, TiposConocimientoController.getAll);
tiposConocimientoRouter.get("/:id", validateToken, TiposConocimientoController.getById);
tiposConocimientoRouter.post("/", validateToken, TiposConocimientoController.create);
tiposConocimientoRouter.patch("/:id", validateToken, TiposConocimientoController.update);
tiposConocimientoRouter.delete("/:id", validateToken, TiposConocimientoController.delete);
