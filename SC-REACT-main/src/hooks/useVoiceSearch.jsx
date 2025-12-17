import { useState, useRef } from "react"

export const useVoiceSearch = ({ onResult }) => {
  const [isVoiceListening, setIsVoiceListening] = useState(false)
  const recognitionRef = useRef(null)

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz")
      return
    }

    // crear instancia UNA sola vez
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition()
      recognition.lang = "es-ES"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        console.log("🎤 Escuchando...")
        setIsVoiceListening(true)
      }

      recognition.onend = () => {
        console.log("🛑 Fin escucha")
        setIsVoiceListening(false)
      }

      recognition.onerror = (e) => {
        console.error("❌ Error voz:", e)
        setIsVoiceListening(false)
      }

      recognition.onresult = (event) => {
        const texto = event.results?.[0]?.[0]?.transcript
        console.log("🗣️ Texto:", texto)
        if (texto && onResult) onResult(texto)
      }

      recognitionRef.current = recognition
    }

    recognitionRef.current.start()
  }

  return {
    startListening,
    isVoiceListening,
  }
}
