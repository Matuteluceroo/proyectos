import { Router } from "express";
import { CapacitacionController } from "../controllers/capacitaciones.js";
import { validateToken } from "../middleware/jwt.js";

export const capacitacionesRouter = Router();

capacitacionesRouter.get("/", validateToken, CapacitacionController.getAll);
capacitacionesRouter.get("/:id", validateToken, CapacitacionController.getById);
capacitacionesRouter.post("/", validateToken, CapacitacionController.create);
capacitacionesRouter.put("/:id", validateToken, CapacitacionController.update);
capacitacionesRouter.delete(
  "/:id",
  validateToken,
  CapacitacionController.delete
);
