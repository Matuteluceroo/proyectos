import { createContext, useContext, useState } from "react"
import Alert from "../components/Alert/AlertErrores"

const AlertContext = createContext()

export const AlertProvider = ({ children }) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  return (
    <AlertContext.Provider
      value={{ isAlertOpen, setIsAlertOpen, alertMessage, setAlertMessage }}
    >
      {children}
      <Alert
        isOpen={isAlertOpen}
        message={alertMessage}
        setIsOpen={setIsAlertOpen}
        titulo={"ERROR"}
      />
    </AlertContext.Provider>
  )
}

export const useAlert = () => useContext(AlertContext)
