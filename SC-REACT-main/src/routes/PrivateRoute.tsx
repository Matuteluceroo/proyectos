// src/components/PrivateRoute.tsx
import { useState, useEffect, ReactElement } from "react"
import { Navigate } from "react-router-dom"
import { useSocket } from "../services/SocketContext"

interface Role {
  rol: string
}

interface User {
  rol: string
  roles_usuario: Role[]
}

interface PrivateRouteProps {
  element: ReactElement
  allowedRoles: string[]
}

const PrivateRoute = ({ element, allowedRoles }: PrivateRouteProps) => {
  const { currentUser } = useSocket() as { currentUser?: User }
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (currentUser !== undefined) {
      setIsLoading(false)
    }
  }, [currentUser])

  if (isLoading) {
    return (
      <div>
        <h1>CARGANDO...</h1>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const isAllowed = allowedRoles.some((allowedRol) =>
    currentUser.roles_usuario.some((userRol) => allowedRol === userRol.rol)
  )

  if (!isAllowed && !allowedRoles.includes(currentUser.rol)) {
    return <Navigate to="/" replace />
  }

  return element
}

export default PrivateRoute
