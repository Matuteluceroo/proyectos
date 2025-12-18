import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../../services/SocketContext'
import { verificarLogin } from '../../services/connections/usuarios'
import { url } from '../../services/connections/consts'
import './Login.css'
import logo from '../../assets/nombrelogo.png'

const Login = () => {
  const [userName, setUserName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false)
  const [attempts, setAttempts] = useState<number>(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const navigate = useNavigate()
  const { connectSocket, disconnectSocket } = useSocket()

  useEffect(() => {
    disconnectSocket()
  }, [disconnectSocket])

  useEffect(() => {
    if (attempts >= 3 && !lockoutTime) {
      setLockoutTime(Date.now() + 60000)
      setTimeLeft(60)

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setAttempts(0)
            setLockoutTime(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [attempts])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (lockoutTime && Date.now() < lockoutTime) return
    if (!userName || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      const response = await verificarLogin({
        userName,
        password,
      })

      if (response && response.usuario) {
        console.log("response",response)
        console.log("response",response.usuario)
        connectSocket(response.usuario, url.substring(0, url.length - 4))
        // 🔁 Obtenés la imagen desde backend
        /* const nuevaFoto = await obtenerFoto({ idUsuario: response.usuario.id })

        const usuarioConFoto = {
          ...response.usuario,
          fotoPerfil: nuevaFoto?.imagen || null,
        } */

        // 🔁 Ahora sí, conectás con la imagen incluida
        //connectSocket(usuarioConFoto, url.substring(0, url.length - 4))

        //localStorage.setItem('currentUser', JSON.stringify(usuarioConFoto))

        const roles: { [key: string]: string } = {
          ADMINISTRADOR: '/administracion',
          EMPLEADO: '/buscador',
          EXPERTO: '/buscador',
          TESTER: '/testing', // ✅ redirige a ruta válida para rol TESTER
        }
        navigate(roles[response.usuario.rol] || '/Capacitaciones')
      } else {
        setAttempts((prev) => prev + 1)
        setError('Usuario o contraseña incorrectos')
      }
    } catch (err) {
      setAttempts((prev) => prev + 1)
      setError('Usuario o contraseña incorrectos')
    }
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState('CapsLock'))
  }

  const handleInputChange = () => {
    if (error) {
      setError('')
    }
  }

  return (
    <div
      className="login-container"
      style={{
        background: 'linear-gradient(135deg, #f8a55f, #f07221)',
      }}
    >
      <div className="login-content">
        <img
          src={logo}
          alt="Decoración Login"
          className="bg-login-image"
        />

        <div className="login-box">
          <h2></h2>
          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUserName(e.target.value)
                  handleInputChange()
                }}
                placeholder="Usuario"
                title="Ingresar usuario"
                required
                disabled={!!(lockoutTime && Date.now() < lockoutTime)}
              />
            </div>
            <div className="form-group password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value)
                  handleInputChange()
                }}
                onKeyUp={handleKeyUp}
                placeholder="Contraseña"
                title="Ingresar contraseña"
                required
                disabled={!!(lockoutTime && Date.now() < lockoutTime)}
              />
              <button
                type="button"
                className="toggle-password"
                title="Ver contraseña"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {capsLockOn && (
              <p className="caps-lock-warning">⚠️ Mayúscula activada</p>
            )}
            {error && <p className="error-message">{error}</p>}
            {lockoutTime && Date.now() < lockoutTime && (
              <p className="lockout-message">
                Demasiados intentos fallidos. Espera {timeLeft} segundos.
              </p>
            )}
            <button
              type="submit"
              className="login-button"
              title="Iniciar sesión"
              disabled={!!(lockoutTime && Date.now() < lockoutTime)}
            >
              {lockoutTime && Date.now() < lockoutTime
                ? `Espera ${timeLeft}s`
                : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
