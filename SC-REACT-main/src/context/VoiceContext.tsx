import { createContext, useContext, useEffect, useRef, useState } from "react"

type VoiceContextType = {
  startListening: () => void
  isListening: boolean
}

const VoiceContext = createContext<VoiceContextType | null>(null)

export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const recognitionRef = useRef<any>(null)
  const [isListening, setIsListening] = useState(false)

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz")
      return
    }

    if (!recognitionRef.current) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = "es-ES"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = (e: any) =>
        console.error("❌ Error voz:", e)

      recognition.onresult = (event: any) => {
        const texto = event.results?.[0]?.[0]?.transcript
        console.log("🗣️ Texto:", texto)
      }

      recognitionRef.current = recognition
    }

    recognitionRef.current.start()
  }

  // ✅ ATAJO GLOBAL Ctrl + D
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault()
        startListening()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <VoiceContext.Provider value={{ startListening, isListening }}>
      {children}
    </VoiceContext.Provider>
  )
}

export const useVoice = () => {
  const ctx = useContext(VoiceContext)
  if (!ctx) {
    throw new Error("useVoice debe usarse dentro de VoiceProvider")
  }
  return ctx
}
