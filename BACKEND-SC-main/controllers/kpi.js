import { KpiModel } from "../models/kpi.js";

export class KpiController {
  static async totalContenidos(req, res) {
    try {
      res.json(await KpiModel.totalContenidos());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async contenidosPorMes(req, res) {
    try {
      res.json(await KpiModel.contenidosPorMes());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async contenidosPorTipo(req, res) {
    try {
      res.json(await KpiModel.contenidosPorTipo());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async topTags(req, res) {
    try {
      res.json(await KpiModel.topTags());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async contenidosPorUsuario(req, res) {
    try {
      res.json(await KpiModel.contenidosPorUsuario());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async promedioTags(req, res) {
    try {
      res.json(await KpiModel.promedioTags());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async coberturaTematica(req, res) {
    try {
      res.json(await KpiModel.coberturaTematica());
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

// import { KpiModel } from "../models/kpi.js";

// export class KpiController {
//   // Contenido
//   static async contenidosPublicados(req, res) {
//     try {
//       res.json(await KpiModel.contenidosPublicados());
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async contenidosPorTipo(req, res) {
//     try {
//       res.json(await KpiModel.contenidosPorTipo());
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async coberturaTags(req, res) {
//     try {
//       res.json(await KpiModel.coberturaTags());
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async contenidosFrios(req, res) {
//     try {
//       const days = parseInt(req.query.days ?? "90", 10);
//       res.json(await KpiModel.contenidosFrios({ days }));
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async topContenidos(req, res) {
//     try {
//       const days = parseInt(req.query.days ?? "30", 10);
//       const top = parseInt(req.query.top ?? "10", 10);
//       res.json(await KpiModel.topContenidos({ days, top }));
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }

//   // Uso
//   static async mau(req, res) {
//     try {
//       const days = parseInt(req.query.days ?? "30", 10);
//       res.json(await KpiModel.mau({ days }));
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async consultasPorUsuarioActivo(req, res) {
//     try {
//       const days = parseInt(req.query.days ?? "30", 10);
//       res.json(await KpiModel.consultasPorUsuarioActivo({ days }));
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async engagementPorTag(req, res) {
//     try {
//       const days = parseInt(req.query.days ?? "30", 10);
//       const top = parseInt(req.query.top ?? "20", 10);
//       res.json(await KpiModel.engagementPorTag({ days, top }));
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }

//   // Entrenamientos
//   static async inscritosPorEntrenamiento(req, res) {
//     try {
//       res.json(await KpiModel.inscritosPorEntrenamiento());
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async estadosPorEntrenamiento(req, res) {
//     try {
//       res.json(await KpiModel.estadosPorEntrenamiento());
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
//   static async finalizacionPorRol(req, res) {
//     try {
//       res.json(await KpiModel.finalizacionPorRol());
//     } catch (e) {
//       res.status(500).json({ error: e.message });
//     }
//   }
// }
