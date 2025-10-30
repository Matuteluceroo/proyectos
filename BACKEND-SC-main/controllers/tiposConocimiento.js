import { TiposConocimientoModel } from "../models/tiposConocimiento.js";

export class TiposConocimientoController {
  static async getAll(req, res) {
    try {
      const tipos = await TiposConocimientoModel.getAll();
      if (tipos.length === 0)
        return res.status(404).json({ mensaje: "No hay tipos de conocimiento registrados" });
      return res.json(tipos);
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error al obtener tipos de conocimiento", error: error.message });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const tipo = await TiposConocimientoModel.getById({ id });
      if (!tipo)
        return res.status(404).json({ mensaje: `No existe tipo con id ${id}` });
      return res.json(tipo);
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error al obtener tipo de conocimiento", error: error.message });
    }
  }

  static async create(req, res) {
    const { nombre } = req.body;
    try {
      if (!nombre) return res.status(400).json({ mensaje: "Falta el campo nombre" });
      const nuevo = await TiposConocimientoModel.create({ nombre });
      return res.status(201).json({ mensaje: "Tipo de conocimiento creado", nuevo });
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error al crear tipo de conocimiento", error: error.message });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
      const actualizado = await TiposConocimientoModel.update({ id, nombre });
      if (!actualizado)
        return res.status(404).json({ mensaje: "Tipo no encontrado" });
      return res.json({ mensaje: "Tipo de conocimiento actualizado" });
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error al actualizar tipo de conocimiento", error: error.message });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      const eliminado = await TiposConocimientoModel.delete({ id });
      if (!eliminado)
        return res.status(404).json({ mensaje: "Tipo no encontrado" });
      return res.json({ mensaje: "Tipo de conocimiento eliminado" });
    } catch (error) {
      return res
        .status(500)
        .json({ mensaje: "Error al eliminar tipo de conocimiento", error: error.message });
    }
  }
}
