import jwt from 'jsonwebtoken';

export function generateAccessToken(user) {
  return jwt.sign(user, process.env.SECRET, { expiresIn: '5h' });
}

export function validateToken(req, res, next) {
  //next();
  //return
  const accessToken = req.cookies?.token;

  if (!accessToken) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(accessToken, process.env.SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        mensaje: 'Acceso denegado, token expirado o inválido',
      });
    }
    req.user = user;
    next();
  });
}

