import React from "react"
import { SocketProvider } from "./services/SocketContext"
import { AlertProvider } from "./services/AlertContext"
import { LoaderProvider } from "./services/LoaderContext"
import { useLoader } from "./services/LoaderContext"
import Loader from "./components/Loader/Loader"
import AppRoutes from "./routes/AppRoutes"
import "bootstrap/dist/css/bootstrap.min.css"
import SocketStatusBanner from "./testing/SocketStatusBanner"
import { VoiceProvider } from "./context/VoiceContext"

const LoaderWrapper = () => {
  const { loading } = useLoader()
  return loading ? <Loader /> : null
}

const App = () => (
  <LoaderProvider>
    <AlertProvider>
      <SocketProvider>
        <VoiceProvider>
          <AppRoutes />
          <SocketStatusBanner />
          <LoaderWrapper />
        </VoiceProvider>
      </SocketProvider>
    </AlertProvider>
  </LoaderProvider>
)

export default App
