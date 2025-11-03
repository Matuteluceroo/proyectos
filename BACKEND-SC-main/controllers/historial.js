import { HistorialModel } from "../models/historial.js";

export class HistorialController {
  // ✅ Registrar nueva consulta

  static async registrarConsulta(req, res) {
    console.log("entre registrarConsulta");
    try {
      const { id_usuario, id_contenido } = req.body;
      console.log("📥 registrarConsulta:", id_usuario, id_contenido); // <--- log visible

      if (!id_usuario || !id_contenido) {
        return res.status(400).json({ mensaje: "Faltan datos requeridos" });
      }

      const ok = await HistorialModel.registrarConsulta({
        id_usuario,
        id_contenido,
      });
      console.log("📤 resultado INSERT:", ok);

      if (!ok)
        return res
          .status(500)
          .json({ mensaje: "No se pudo registrar la consulta" });

      res.status(201).json({ mensaje: "Consulta registrada correctamente" });
    } catch (error) {
      console.error("❌ Error en registrarConsulta:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }

  // ✅ Obtener historial (opcional)
  static async getAll(req, res) {
    try {
      console.log("entre getAll");
      const historial = await HistorialModel.getAll();
      res.json(historial);
    } catch (error) {
      console.error("❌ Error en getAll historial:", error);
      res.status(500).json({ mensaje: "Error al obtener el historial" });
    }
  }
  // ✅ Top 5 contenidos más consultados recientemente
  static async getTopConsultados(req, res) {
    try {
      console.log("entre getTopConsultados");
      const top = await HistorialModel.getTopConsultados();
      res.json(top);
    } catch (error) {
      console.error("❌ Error en getTopConsultados:", error);
      res.status(500).json({ mensaje: "Error al obtener el top de consultas" });
    }
  }
}
