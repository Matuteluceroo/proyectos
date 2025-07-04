import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react"
import { io } from "socket.io-client"

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const [notificaciones, setNotificaciones] = useState([])
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser")
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [urlSend, setUrlSend] = useState(() => {
    return localStorage.getItem("url_send") || null
  })
  const [isConnected, setIsConnected] = useState(false)

  const connectSocket = useCallback((userData, url_send) => {
    if (socketRef.current && socketRef.current.connected) {
      console.warn("El socket ya está conectado.")
      return
    }

    // console.log("📡 Intentando conectar a:", url_send)

    setCurrentUser(userData)
    setUrlSend(url_send)

    localStorage.setItem("currentUser", JSON.stringify(userData))
    localStorage.setItem("url_send", url_send)

    const newSocket = io(url_send, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    newSocket.once("connect", () => {
      setIsConnected(true)
      //console.log("✅ Socket conectado:", newSocket.id)
      newSocket.emit("register", userData)
    })

    newSocket.on("nuevaNotificacion", (mensaje) => {
      setNotificaciones((prev) => [...prev, mensaje])
    })

    newSocket.on("disconnect", (reason) => {
      //console.log("⚠️ Socket desconectado:", reason)
      setIsConnected(false)
    })

    newSocket.on("connect_error", (err) => {
      console.error("❌ Error al conectar socket:", err.message)
      setIsConnected(false)
    })

    socketRef.current = newSocket
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.connected) {
        socketRef.current.disconnect()
      }
      socketRef.current = null
    }
    setCurrentUser(null)
    setNotificaciones([])
    setUrlSend(null)
    setIsConnected(false)
    localStorage.removeItem("currentUser")
    localStorage.removeItem("url_send")
    // console.log("🛑 Socket desconectado correctamente.")
  }, [])

  const enviarNotificacion = useCallback((receptorId, mensaje) => {
    if (socketRef.current) {
      socketRef.current.emit("enviarNotificacion", { receptorId, mensaje })
      // console.log(`📨 Notificación enviada a ${receptorId}: ${mensaje.mensaje}`)
    } else {
      console.error("❌ No hay conexión activa con el servidor.")
    }
  }, [])

  useEffect(() => {
    if (currentUser && urlSend && !socketRef.current) {
      connectSocket(currentUser, urlSend)
    }
  }, [currentUser, urlSend, connectSocket])

  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [disconnectSocket])

  const contextValue = {
    connectSocket,
    disconnectSocket,
    enviarNotificacion,
    notificaciones,
    currentUser,
    isConnected,
    get socket() {
      return socketRef.current
    },
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}
