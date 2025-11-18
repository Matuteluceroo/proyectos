import { generateAccessToken } from "../middleware/jwt.js";
import { LoginModel } from "../models/login.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

export class LoginController {
  static async login(req, res) {
    const { userName, password } = req.body;
    console.log("llego", userName, password);
    const user = await LoginModel.getByAccess({
      userName: userName,
    });

    if (user.length === 0)
      return res
        .status(401)
        .json({ mensaje: "Usuario o contraseña invalidos" });

    const hashedPassword = user[0].password;

    if (await bcrypt.compare(password, hashedPassword)) {
      const accessToken = generateAccessToken(user[0]);
      // Configurar cookie segura
      /* res.cookie('token', accessToken, {
        httpOnly: true,
        secure: true, // Asegúrate de usar HTTPS en producción
        sameSite: 'None', // Cambiar a 'Lax' si necesitas redirecciones cruzadas
        maxAge: 24 * 60 * 60 * 1000, // 1 día
        domain: 'macropharma.ngrok.app',
        path: '/',
      }) */
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true, // HTTPS es obligatorio con SameSite: 'None'
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000, // 1 día
        //  domain: process.env.NGURL,
        path: "/",
      });
      // Enviar respuesta JSON
      const roles_usuario = await LoginModel.getRolesUsuario({
        idUsuario: user[0].id,
      });
      console.log("user", user[0]);
      console.log("user", user[0].id_Usuario);
      console.log("user", user[0].id);
      res.json({
        mensaje: "Acceso autorizado",
        usuario: {
          id: user[0].id_Usuario,
          usuario: user[0].userName,
          rol: user[0].rol,
          nombre: user[0].nombre,
          tags: user[0].tags,
          idZona: user[0].idZona,
          roles_usuario: roles_usuario,
        },
      });
    } else {
      return res
        .status(401)
        .json({ mensaje: "Usuario o contraseña invalidos" });
    }
  }
}

//////////

/* 
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error al codificar la contraseña:', err);
        return;
      }
      console.log('Hash de la contraseña:', hash);
    }) */
///////////
//console.log(user[0])
