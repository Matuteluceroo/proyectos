// models/user.js
/* import { getCurrentProvincias } from '../app.js'; */
import { sql } from '../connection.js'
const tableName = 'Estado_CtaCte'

// SELECT * FROM Estado_CtaCte WHERE T_COMP = 'FAC'

export class FacturasModel {
  static async getAll() {

    const result = await sql.query(`SELECT 
    cta_cte.COD_CLIENT
	,cli.COD_CLIENT
	,cli.NOMBRE_PRO as PROVINCIA
	,cta_cte.ESTADO
	,cta_cte.FECHA as FEC_EMIS_FAC
	,cta_cte.IMPORTE
	,cta_cte.N_COMP_ORIGEN
  ,cta_cte.NRO_OC_COMP
	,cta_cte.[NRO COMPROBANTE] as NRO_FAC
	,cta_cte.RAZON_SOCI
	,cta_cte.T_COMP
	,cta_cte.T_COMP_ORIGEN
	,obs.*, 
    ISNULL(saldos.SALDADO, 0) AS SALDADO 
FROM Estado_CtaCte AS cta_cte
OUTER APPLY (
    SELECT TOP 1 * 
    FROM Obs_facturas AS obs
    WHERE obs.nro_factura = cta_cte.[NRO COMPROBANTE]
    ORDER BY obs.fecha_modificacion DESC
) AS obs
OUTER APPLY (
    SELECT SUM(IMPORTE) AS SALDADO
    FROM Estado_CtaCte AS pagos
    WHERE pagos.T_COMP != 'FAC'
      AND pagos.N_COMP_ORIGEN = cta_cte.[NRO COMPROBANTE]
) AS saldos
INNER JOIN Cliente_Provincia cli
ON cli.COD_CLIENT = cta_cte.COD_CLIENT
WHERE 
    cta_cte.T_COMP = 'FAC'
ORDER BY cta_cte.FECHA DESC;
`);
    return result.recordset;
  }

  static async getByNroFactura({ nro_factura }) {
    if (!nro_factura || nro_factura.trim() === "") {
      throw new Error("Número de factura no válido");
    }

    const request = new sql.Request();
    request.input("nro_fact", sql.VarChar, nro_factura);

    try {
      const result = await request.query(`
        SELECT 
          cta_cte.[NRO COMPROBANTE] AS [NRO COMPROBANTE],
          cta_cte.[FECHA],
          cta_cte.[IMPORTE],
          cta_cte.[RAZON_SOCI],
          cli.NOMBRE_PRO AS PROVINCIA
        FROM Estado_CtaCte cta_cte
        LEFT JOIN Cliente_Provincia cli ON cli.COD_CLIENT = cta_cte.COD_CLIENT
        WHERE cta_cte.[NRO COMPROBANTE] = @nro_fact
      `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error("Error al obtener la factura por número:", error);
      throw new Error("Error al obtener la factura");
    }
  }


  // static async getByNroFactura({ nro_factura }) {
  //   if (!nro_factura || nro_factura.trim() === "") {
  //     throw new Error("Número de factura no válido");
  //   }

  //   const request = new sql.Request();
  //   request.input("nro_fact", sql.VarChar, nro_factura);

  //   try {
  //     const result = await request.query(`
  //       SELECT
  //         ec.COD_CLIENT,
  //         ec.FECHA,
  //         ec.T_COMP,
  //         ec.[NRO COMPROBANTE] AS NRO_FACTURA,
  //         ec.T_COMP_ORIGEN,
  //         ec.N_COMP_ORIGEN,
  //         ec.IMPORTE,
  //         ec.ESTADO,
  //         ec.NRO_FAC,
  //         ec.FEC_EMIS_FAC,
  //         ec.NRO_PEDIDO,
  //         ec.NRO_OC_COMP,
  //         ec.LEYENDA_1,
  //         ec.LEYENDA_2,
  //         ec.FECHA_ENTREGA,
  //         ec.N_REMITO,
  //         ec.TOTAL_PED,
  //         ec.COD_CLIENTE,
  //         ec.ESTADO_FACTURA,
  //         ec.MONTO_FAC,
  //         ec.FECHA_RECIBO,
  //         cli.NOMBRE_PRO AS PROVINCIA,
  //         cli.RAZON_SOCI
  //       FROM Estado_CtaCte ec
  //       LEFT JOIN Cliente_Provincia cli ON cli.COD_CLIENT = ec.COD_CLIENT
  //       WHERE ec.[NRO COMPROBANTE] = @nro_fact
  //     `);

  //     return result.recordset[0] || null;

  //   } catch (error) {
  //     console.error("Error al obtener la factura por número:", error);
  //     throw new Error("Error al obtener la factura");
  //   }
  // }

  static async getByProvincia({ consultasProv }) {
    const request = new sql.Request();
    //request.input('consultasProv', sql.VarChar, consultasProv);
    try { //
      let consulta = `WITH UltimaObs AS (
      SELECT *,
             ROW_NUMBER() OVER (PARTITION BY nro_factura ORDER BY fecha_modificacion DESC) AS rn
      FROM Obs_facturas
  ),
  Saldos AS (
      SELECT N_COMP_ORIGEN, SUM(IMPORTE) AS SALDADO
      FROM Estado_CtaCte
      WHERE T_COMP != 'FAC'
      GROUP BY N_COMP_ORIGEN
  )
  SELECT 
      cta_cte.COD_CLIENT,
      cli.COD_CLIENT,
      cli.NOMBRE_PRO AS PROVINCIA,
      cta_cte.ESTADO,
      cta_cte.FECHA AS FEC_EMIS_FAC,
      cta_cte.IMPORTE,
      cta_cte.N_COMP_ORIGEN,
      cta_cte.NRO_OC_COMP,
      cta_cte.[NRO COMPROBANTE] AS NRO_FAC,
      cta_cte.RAZON_SOCI,
      cta_cte.T_COMP,
      cta_cte.T_COMP_ORIGEN,
      ISNULL(obs.SALDADO, 0) AS SALDADO,
      obs_fact.*
  FROM Estado_CtaCte AS cta_cte
  LEFT JOIN Saldos obs ON obs.N_COMP_ORIGEN = cta_cte.[NRO COMPROBANTE]
  LEFT JOIN (
      SELECT * FROM UltimaObs WHERE rn = 1
  ) AS obs_fact ON obs_fact.nro_factura = cta_cte.[NRO COMPROBANTE]
  INNER JOIN Cliente_Provincia cli ON cli.COD_CLIENT = cta_cte.COD_CLIENT
  WHERE cta_cte.T_COMP = 'FAC'
      `
      consulta = consulta + "AND (" + consultasProv + ") ORDER BY cta_cte.FECHA DESC;"
      const result = await request.query(consulta);

      return result.recordset
    } catch (error) {
      console.log("ERROR: ", error.message)
      throw new Error('Error al obtener las facturas');
    }
  }

  static async getByIdZona({ idZona }) {
    const request = new sql.Request();
    request.input('idZona', sql.VarChar, idZona);
    try {
      const result = await request.query(`SELECT 
          es_cta.*,
          cli_pro.ID_ZONA,
          cli_pro.NOMBRE_ZONA
      FROM Estado_CtaCte es_cta
      INNER JOIN Cliente_Provincia cli_pro 
          ON es_cta.COD_CLIENT = cli_pro.COD_CLIENT
      WHERE cli_pro.ID_ZONA = @idZona
      AND T_COMP = 'FAC' ORDER BY es_cta.FEC_EMIS_FAC DESC;`);

      return result.recordset
    } catch (error) {
      throw new Error('Error al obtener las facturas');
    }
  }

  static async getObservacionesFactura({ nroFactura }) {
    const request = new sql.Request()
    request.input('nroFactura', sql.VarChar, nroFactura)

    try {
      const result = await request.query(`SELECT [nro_factura]
      ,[op_exp]
      ,[habilitado_pago]
      ,[observaciones]
      ,[fecha_gestion]
      ,[fecha_modificacion]
      ,[fecha_entrega_documentacion]
      ,[idUsuario]
	    ,us.nombre as nombreUsuario
      FROM Obs_facturas obs_fac
      JOIN Usuarios us
      ON us.id = obs_fac.idUsuario
  WHERE nro_factura = @nroFactura
  ORDER BY fecha_modificacion DESC`)

      return result.recordset
    } catch (e) {
      throw new Error('Error al obtener las observaciones de la factura');
    }
  }

  static async agregarObservacion({ input }) {
    const { nro_factura, op_exp, habilitado_pago, observaciones, fecha_gestion, fecha_entrega_documentacion, idUsuario } = input;

    const request = new sql.Request();
    try {
      const fechaActual = new Date();
      const fecha_modificacion = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(2, '0')} ${String(fechaActual.getHours()).padStart(2, '0')}:${String(fechaActual.getMinutes()).padStart(2, '0')}`;

      // Insertar la nueva licitación
      request.input('nro_factura', sql.VarChar, nro_factura || "")
      request.input('op_exp', sql.VarChar, op_exp || "")
      request.input('habilitado_pago', sql.VarChar, habilitado_pago || "")
      request.input('observaciones', sql.VarChar, observaciones || "")
      request.input('fecha_gestion', sql.Date, fecha_gestion || "")
      request.input('fecha_entrega_documentacion', sql.Date, fecha_entrega_documentacion || null)
      request.input('idUsuario', sql.VarChar, idUsuario || "")
      request.input('fecha_modificacion', sql.VarChar, fecha_modificacion || "")

      await request.query(`
            INSERT INTO Obs_facturas 
            (nro_factura, op_exp, habilitado_pago, observaciones, fecha_gestion, fecha_entrega_documentacion, fecha_modificacion, idUsuario) 
            VALUES (@nro_factura, @op_exp, @habilitado_pago, @observaciones, @fecha_gestion, @fecha_entrega_documentacion, @fecha_modificacion, @idUsuario)
        `);

      // Recuperar la licitación recién insertada (sin necesidad de pasar el id, que es autoincremental)
      const resultNuevo = await request.query(`
            SELECT TOP 1 * FROM Obs_facturas WHERE nro_factura = @nro_factura ORDER BY nro_factura DESC
        `);

      return resultNuevo.recordset[0]; // Devuelve el nuevo registro con id generado automáticamente

    } catch (e) {
      throw new Error('Error creating licitacion: ' + e.message);
    }
  }

  static async eliminarObservacion({ nroFactura, fecha_modificacion }) {
    const request = new sql.Request()
    request.input('nroFactura', sql.VarChar, nroFactura)
    request.input('fecha_modificacion', sql.VarChar, fecha_modificacion)

    try {
      const resultExistente = await request.query(`SELECT *
          FROM Obs_facturas
	        WHERE nro_factura = @nroFactura AND fecha_modificacion = @fecha_modificacion`)

      if (!resultExistente.recordset[0]) return false;

      await request.query(`DELETE FROM Obs_facturas WHERE nro_factura = @nroFactura AND fecha_modificacion = @fecha_modificacion`)


      return resultExistente.recordset[0]
    } catch (e) {
      throw new Error('Error al obtener las observaciones de la factura');
    }
  }

  static async getDocumentosFactura({ nroFactura }) {
    const request = new sql.Request()
    request.input('nroFactura', sql.VarChar, nroFactura)

    try {
      const result = await request.query(`SELECT T_COMP, [NRO COMPROBANTE] AS NRO_COMPROBANTE, IMPORTE, FECHA_RECIBO, ESTADO
  FROM [Estado_CtaCte]
  where T_COMP != 'FAC' 
  AND NRO_FAC = @nroFactura;`)

      return result.recordset
    } catch (e) {
      console.error("ERROR: ", e)
      throw new Error('Error al obtener las observaciones de la factura');
    }
  }

  static async getImportesNegativos() {
    const result = await sql.query(`SELECT SUM(IMPORTE) AS TotalImporte
FROM ${tableName} AS cta_cte 
WHERE T_COMP != 'FAC';`);

    return result.recordset[0];
  }

  // static async getFacturasConFiltros(filters) {
  //   try {
  //     const consultaBase = `WITH cte AS (
  //       SELECT 
  //         cli.COD_CLIENT,
  //         cli.NOMBRE_PRO as PROVINCIA,
  //         cta_cte.RAZON_SOCI,
  //         cta_cte.FECHA as FEC_EMIS_FAC,
  //         cta_cte.T_COMP,
  //         cta_cte.[NRO COMPROBANTE] as NRO_FAC,
  //         cta_cte.T_COMP_ORIGEN,
  //         cta_cte.N_COMP_ORIGEN,
  //         cta_cte.NRO_OC_COMP,
  //         cta_cte.IMPORTE,
  //         cta_cte.ESTADO,
  //         ISNULL(saldos.SALDADO, 0) AS SALDADO,
  //         fec_pago.fec_ult_pago,
  //         obs.*
  //       FROM Estado_CtaCte AS cta_cte
  //       OUTER APPLY (
  //         SELECT TOP 1 *
  //         FROM Obs_facturas AS obs
  //         WHERE obs.nro_factura = cta_cte.[NRO COMPROBANTE]
  //         ORDER BY obs.fecha_modificacion DESC
  //       ) AS obs
  //       OUTER APPLY (
  //         SELECT SUM(IMPORTE) AS SALDADO
  //         FROM Estado_CtaCte AS pagos
  //         WHERE pagos.T_COMP != 'FAC'
  //           AND pagos.N_COMP_ORIGEN = cta_cte.[NRO COMPROBANTE]
  //       ) AS saldos
  //       OUTER APPLY (
  //         SELECT TOP(1) FECHA AS fec_ult_pago
  //         FROM Estado_CtaCte AS pagos
  //         WHERE pagos.T_COMP != 'FAC'
  //           AND pagos.N_COMP_ORIGEN = cta_cte.[NRO COMPROBANTE]
  //       ) AS fec_pago
  //       INNER JOIN Cliente_Provincia cli
  //       ON cli.COD_CLIENT = cta_cte.COD_CLIENT
  //     )
  //   `;

  //     let whereFinal = "WHERE T_COMP = 'FAC'"; // filtro obligatorio

  //     if (filters && filters.trim() !== "") {
  //       // Si el string ya incluye "WHERE", solo concatenamos con AND
  //       if (/^\s*WHERE\s+/i.test(filters)) {
  //         whereFinal = filters + " AND T_COMP = 'FAC'";
  //       } else {
  //         whereFinal = "WHERE " + filters + " AND T_COMP = 'FAC'";
  //       }
  //     }

  //     const consultaFinal = `${consultaBase} SELECT * FROM cte ${whereFinal} ORDER BY FEC_EMIS_FAC DESC;`;

  //     const result = await sql.query(consultaFinal);
  //     return result.recordset;

  //   } catch (error) {
  //     console.log("ERROR: ", error.message);
  //     throw new Error(error.message);
  //   }
  // }

  static async getFacturasConFiltros(filters) {
    try {
      const consultaBase = `
        WITH cte AS (
          SELECT 
            cli.COD_CLIENT,
            cli.NOMBRE_PRO as PROVINCIA,
            cta_cte.RAZON_SOCI,
            cta_cte.FECHA as FEC_EMIS_FAC,
            cta_cte.T_COMP,
            cta_cte.[NRO COMPROBANTE] as NRO_FAC,
            cta_cte.T_COMP_ORIGEN,
            cta_cte.N_COMP_ORIGEN,
            cta_cte.NRO_OC_COMP,
            cta_cte.IMPORTE,
            cta_cte.ESTADO,
            ISNULL(saldos.SALDADO, 0) AS SALDADO,
            fec_pago.fec_ult_pago,
            obs.nro_factura,
            obs.op_exp,
            obs.habilitado_pago,
            obs.sello,
            obs.observaciones,
            obs.fecha_gestion,
            obs.fecha_modificacion,
            obs.idUsuario,
            obs.fecha_entrega_documentacion
          FROM Estado_CtaCte AS cta_cte
          OUTER APPLY (
            SELECT TOP 1 
              nro_factura, op_exp, habilitado_pago, sello, observaciones,
              fecha_gestion, fecha_modificacion, idUsuario, fecha_entrega_documentacion
            FROM Obs_facturas
            WHERE nro_factura = cta_cte.[NRO COMPROBANTE]
            ORDER BY fecha_modificacion DESC
          ) AS obs
          OUTER APPLY (
            SELECT SUM(IMPORTE) AS SALDADO
            FROM Estado_CtaCte
            WHERE T_COMP != 'FAC'
              AND N_COMP_ORIGEN = cta_cte.[NRO COMPROBANTE]
          ) AS saldos
          OUTER APPLY (
            SELECT TOP(1) FECHA AS fec_ult_pago
            FROM Estado_CtaCte
            WHERE T_COMP != 'FAC'
              AND N_COMP_ORIGEN = cta_cte.[NRO COMPROBANTE]
          ) AS fec_pago
          INNER JOIN Cliente_Provincia cli
            ON cli.COD_CLIENT = cta_cte.COD_CLIENT
        )
      `;

      let whereFinal = "WHERE T_COMP = 'FAC'";

      if (filters && filters.trim() !== "") {
        if (/^\s*WHERE\s+/i.test(filters)) {
          whereFinal = filters + " AND T_COMP = 'FAC'";
        } else {
          whereFinal = "WHERE " + filters + " AND T_COMP = 'FAC'";
        }
      }

      const consultaFinal = `${consultaBase} SELECT * FROM cte ${whereFinal} ORDER BY FEC_EMIS_FAC DESC;`;
      console.log(consultaFinal)
      const result = await sql.query(consultaFinal);
      return result.recordset;

    } catch (error) {
      console.log("ERROR: ", error.message);
      throw new Error("Error al obtener facturas con filtros: " + error.message);
    }
  }

  static async agregarObservacionSimple(input) {
    const {
      nro_factura,
      op_exp,
      habilitado_pago,
      observaciones,
      fecha_gestion,
      fecha_entrega_documentacion,
      idUsuario,
    } = input

    const request = new sql.Request()
    try {
      const fechaActual = new Date()
      const fecha_modificacion = `${fechaActual.getFullYear()}-${String(
        fechaActual.getMonth() + 1
      ).padStart(2, '0')}-${String(fechaActual.getDate()).padStart(
        2,
        '0'
      )} ${String(fechaActual.getHours()).padStart(2, '0')}:${String(
        fechaActual.getMinutes()
      ).padStart(2, '0')}`

      request.input('nro_factura', sql.VarChar, nro_factura || '')
      request.input('op_exp', sql.VarChar, op_exp || '')
      request.input('habilitado_pago', sql.VarChar, habilitado_pago || '')
      request.input('observaciones', sql.VarChar, observaciones || '')
      request.input('fecha_gestion', sql.Date, fecha_gestion || null)
      request.input(
        'fecha_entrega_documentacion',
        sql.Date,
        fecha_entrega_documentacion || null
      )
      request.input('idUsuario', sql.VarChar, idUsuario || '')
      request.input('fecha_modificacion', sql.VarChar, fecha_modificacion || '')

      await request.query(`
      INSERT INTO Obs_facturas 
      (nro_factura, op_exp, habilitado_pago, observaciones, fecha_gestion, fecha_entrega_documentacion, fecha_modificacion, idUsuario) 
      VALUES (@nro_factura, @op_exp, @habilitado_pago, @observaciones, @fecha_gestion, @fecha_entrega_documentacion, @fecha_modificacion, @idUsuario)
    `)

      const resultNuevo = await request.query(`
      SELECT TOP 1 * FROM Obs_facturas 
      WHERE nro_factura = @nro_factura 
      ORDER BY fecha_modificacion DESC
    `)

      return resultNuevo.recordset[0]
    } catch (e) {
      throw new Error('Error insertando observación: ' + e.message)
    }
  }

}
