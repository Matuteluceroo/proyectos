import { sql } from "../connection.js";

export class KpiModel {
  static async totalContenidos() {
    const r = await new sql.Request().query(
      `SELECT COUNT(*) AS total_contenidos FROM Contenido;`
    );
    return r.recordset[0];
  }

  static async contenidosPorMes() {
    const r = await new sql.Request().query(
      `SELECT FORMAT(fecha_creacion, 'yyyy-MM') AS mes,
              COUNT(*) AS total
       FROM Contenido
       GROUP BY FORMAT(fecha_creacion, 'yyyy-MM')
       ORDER BY mes;`
    );
    return r.recordset;
  }

  static async contenidosPorTipo() {
    const r = await new sql.Request().query(
      `SELECT id_tipo, COUNT(*) AS total
       FROM Contenido
       GROUP BY id_tipo;`
    );
    return r.recordset;
  }

  static async topTags() {
    const r = await new sql.Request().query(
      `SELECT TOP 5 t.nombre AS tag, COUNT(*) AS usos
       FROM Contenido_Tags ct
       JOIN Tags t ON ct.id_tag = t.id_tag
       GROUP BY t.nombre
       ORDER BY usos DESC;`
    );
    return r.recordset;
  }

  static async contenidosPorUsuario() {
    const r = await new sql.Request().query(
      `SELECT id_usuario, COUNT(*) AS total
       FROM Contenido
       GROUP BY id_usuario
       ORDER BY total DESC;`
    );
    return r.recordset;
  }

  static async promedioTags() {
    const r = await new sql.Request().query(
      `SELECT AVG(TagCount * 1.0) AS promedio_tags
       FROM (
         SELECT id_contenido, COUNT(*) AS TagCount
         FROM Contenido_Tags
         GROUP BY id_contenido
       ) AS Sub;`
    );
    return r.recordset[0];
  }

  static async coberturaTematica() {
    const r = await new sql.Request().query(
      `SELECT 
          COUNT(DISTINCT t.id_tag) * 100.0 / (SELECT COUNT(*) FROM Tags) AS porcentaje_cobertura
       FROM Contenido_Tags ct
       JOIN Tags t ON ct.id_tag = t.id_tag;`
    );
    return r.recordset[0];
  }
}




// // models/kpi.js
// // Tablas/columnas según tu dump:
// // Contenido, TiposConocimiento, Contenido_Tags, Tags,
// // HistorialConsultas(fecha_consulta), ParticipacionEntrenamiento(fecha_finalizacion,id_estado),
// // Entrenamientos, EstadoParticipacion, Usuario_Rol(idUsuario)
// import { sql } from "../connection.js";

// export class KpiModel {
//   // ---------- CONTENIDO ----------
//   static async contenidosPublicados() {
//     const r = await new sql.Request().query(
//       `SELECT COUNT(*) AS ContenidosPublicados FROM Contenido;`
//     );
//     return r.recordset[0];
//   }

//   static async contenidosPorTipo() {
//     const q = `
//       SELECT tc.nombre AS tipo, COUNT(*) AS cantidad
//       FROM Contenido c
//       JOIN TiposConocimiento tc ON tc.id_tipo = c.id_tipo
//       GROUP BY tc.nombre
//       ORDER BY cantidad DESC;`;
//     const r = await new sql.Request().query(q);
//     return r.recordset;
//   }

//   static async coberturaTags() {
//     const q = `
//       WITH t AS (
//         SELECT c.id_contenido, COUNT(ct.id_tag) AS n_tags
//         FROM Contenido c
//         LEFT JOIN Contenido_Tags ct ON ct.id_contenido = c.id_contenido
//         GROUP BY c.id_contenido
//       )
//       SELECT 
//         CAST(100.0*SUM(CASE WHEN n_tags>0 THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0) AS DECIMAL(10,2)) AS CoberturaTagsPct,
//         CAST(AVG(CAST(n_tags AS float)) AS DECIMAL(10,2)) AS TagsPromedioPorContenido
//       FROM t;`;
//     const r = await new sql.Request().query(q);
//     return r.recordset[0];
//   }

//   static async contenidosFrios({ days }) {
//     const req = new sql.Request();
//     req.input("days", sql.Int, days);
//     const q = `
//       SELECT COUNT(*) AS ContenidosFrios
//       FROM Contenido c
//       LEFT JOIN (
//         SELECT DISTINCT id_contenido
//         FROM HistorialConsultas
//         WHERE fecha_consulta >= DATEADD(day,-@days,GETDATE())
//       ) h ON h.id_contenido = c.id_contenido
//       WHERE h.id_contenido IS NULL;`;
//     const r = await req.query(q);
//     return r.recordset[0];
//   }

//   static async topContenidos({ days, top }) {
//     const req = new sql.Request();
//     req.input("days", sql.Int, days);
//     req.input("top", sql.Int, top);
//     const q = `
//       SELECT TOP (@top) c.id_contenido, c.titulo, COUNT(*) AS vistas
//       FROM HistorialConsultas h
//       JOIN Contenido c ON c.id_contenido = h.id_contenido
//       WHERE h.fecha_consulta >= DATEADD(day,-@days,GETDATE())
//       GROUP BY c.id_contenido, c.titulo
//       ORDER BY vistas DESC;`;
//     const r = await req.query(q);
//     return r.recordset;
//   }

//   // ---------- USO / ENGAGEMENT ----------
//   static async mau({ days }) {
//     const req = new sql.Request();
//     req.input("days", sql.Int, days);
//     const q = `
//       WITH u_cons AS (
//         SELECT DISTINCT id_usuario
//         FROM HistorialConsultas
//         WHERE fecha_consulta >= DATEADD(day,-@days,GETDATE())
//       ),
//       u_part AS (
//         SELECT DISTINCT id_usuario
//         FROM ParticipacionEntrenamiento
//         WHERE fecha_finalizacion IS NOT NULL
//           AND fecha_finalizacion >= DATEADD(day,-@days,GETDATE())
//       )
//       SELECT COUNT(DISTINCT id_usuario) AS MAU
//       FROM (SELECT * FROM u_cons UNION ALL SELECT * FROM u_part) u;`;
//     const r = await req.query(q);
//     return r.recordset[0];
//   }

//   static async consultasPorUsuarioActivo({ days }) {
//     const req = new sql.Request();
//     req.input("days", sql.Int, days);
//     const q = `
//       WITH per AS (
//         SELECT id_usuario, COUNT(*) n
//         FROM HistorialConsultas
//         WHERE fecha_consulta >= DATEADD(day,-@days,GETDATE())
//         GROUP BY id_usuario
//       )
//       SELECT CAST(AVG(CAST(n AS float)) AS DECIMAL(10,2)) AS ConsultasPorUsuarioActivo
//       FROM per;`;
//     const r = await req.query(q);
//     return r.recordset[0];
//   }

//   static async engagementPorTag({ days, top }) {
//     const req = new sql.Request();
//     req.input("days", sql.Int, days);
//     req.input("top", sql.Int, top);
//     const q = `
//       SELECT TOP (@top) t.nombre AS tag, COUNT(*) AS vistas
//       FROM HistorialConsultas h
//       JOIN Contenido_Tags ct ON ct.id_contenido = h.id_contenido
//       JOIN Tags t ON t.id_tag = ct.id_tag
//       WHERE h.fecha_consulta >= DATEADD(day,-@days,GETDATE())
//       GROUP BY t.nombre
//       ORDER BY vistas DESC;`;
//     const r = await req.query(q);
//     return r.recordset;
//   }

//   // ---------- ENTRENAMIENTOS ----------
//   static async inscritosPorEntrenamiento() {
//     const q = `
//       SELECT e.id_entrenamiento, e.nombre, COUNT(DISTINCT p.id_usuario) AS inscritos
//       FROM Entrenamientos e
//       LEFT JOIN ParticipacionEntrenamiento p ON p.id_entrenamiento = e.id_entrenamiento
//       GROUP BY e.id_entrenamiento, e.nombre
//       ORDER BY inscritos DESC;`;
//     const r = await new sql.Request().query(q);
//     return r.recordset;
//   }

//   static async estadosPorEntrenamiento() {
//     const q = `
//       SELECT e.id_entrenamiento, e.nombre,
//              ep.nombre AS estado, COUNT(*) AS cantidad
//       FROM ParticipacionEntrenamiento p
//       JOIN Entrenamientos e ON e.id_entrenamiento = p.id_entrenamiento
//       JOIN EstadoParticipacion ep ON ep.id_estado = p.id_estado
//       GROUP BY e.id_entrenamiento, e.nombre, ep.nombre
//       ORDER BY e.nombre, cantidad DESC;`;
//     const r = await new sql.Request().query(q);
//     return r.recordset;
//   }

//   static async finalizacionPorRol() {
//     // Consideramos “finalizado” cuando el nombre del estado está en este set.
//     const q = `
//       WITH per AS (
//         SELECT ur.rol,
//                SUM(CASE WHEN ep.nombre IN ('Completado','Aprobado','Finalizado') THEN 1 ELSE 0 END) AS finalizados,
//                COUNT(*) AS total
//         FROM Usuario_Rol ur
//         JOIN ParticipacionEntrenamiento p ON p.id_usuario = ur.idUsuario
//         JOIN EstadoParticipacion ep ON ep.id_estado = p.id_estado
//         GROUP BY ur.rol
//       )
//       SELECT rol, finalizados, total,
//              CAST(100.0*finalizados/NULLIF(total,0) AS DECIMAL(10,2)) AS PctFinalizacion
//       FROM per
//       ORDER BY PctFinalizacion DESC;`;
//     const r = await new sql.Request().query(q);
//     return r.recordset;
//   }
// }
