import { CapacitacionModel } from "../models/capacitaciones.js";

export class CapacitacionController {
  static async getAll(req, res) {
    try {
      const data = await CapacitacionModel.getAll();
      res.json(data);
    } catch (e) {
      console.error("❌ Error en getAll Capacitaciones:", e);
      res
        .status(500)
        .json({ mensaje: "Error al obtener capacitaciones", error: e.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await CapacitacionModel.getById(id);
      if (!data || data.length === 0)
        return res.status(404).json({ mensaje: "Capacitación no encontrada" });
      res.json(data);
    } catch (e) {
      console.error("❌ Error en getById Capacitaciones:", e);
      res
        .status(500)
        .json({ mensaje: "Error al obtener capacitación", error: e.message });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, descripcion, id_creador, contenidos } = req.body;
      const id = await CapacitacionModel.create({
        nombre,
        descripcion,
        id_creador,
        contenidos,
      });
      res
        .status(201)
        .json({ mensaje: "Capacitación creada correctamente", id });
    } catch (e) {
      console.error("❌ Error en create Capacitaciones:", e);
      res
        .status(500)
        .json({ mensaje: "Error al crear capacitación", error: e.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, contenidos } = req.body;
      await CapacitacionModel.update({ id, nombre, descripcion, contenidos });
      res.json({ mensaje: "Capacitación actualizada correctamente" });
    } catch (e) {
      console.error("❌ Error en update Capacitaciones:", e);
      res
        .status(500)
        .json({
          mensaje: "Error al actualizar capacitación",
          error: e.message,
        });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await CapacitacionModel.delete(id);
      res.json({ mensaje: "Capacitación eliminada correctamente" });
    } catch (e) {
      console.error("❌ Error en delete Capacitaciones:", e);
      res
        .status(500)
        .json({ mensaje: "Error al eliminar capacitación", error: e.message });
    }
  }
}
