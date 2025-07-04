import React from "react"
import { useSocket } from "../services/SocketContext"

const SocketStatusBanner = () => {
  const { isConnected, currentUser } = useSocket()

  const tieneRolTester = currentUser?.roles_usuario?.some(
    (r) => r.rol === "TESTER"
  )

  if (!tieneRolTester) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        padding: "10px 20px",
        borderRadius: "8px",
        backgroundColor: isConnected ? "green" : "red",
        color: "white",
        fontWeight: "bold",
        fontSize: "14px",
        zIndex: 9999,
      }}
    >
      {isConnected ? "Conectado ✅" : "Desconectado ❌"}
    </div>
  )
}

export default SocketStatusBanner
