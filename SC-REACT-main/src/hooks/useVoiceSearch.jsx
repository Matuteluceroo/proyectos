import { useEffect, useRef, useState, useCallback } from "react"

export function useVoiceSearch({ onResult }) {
  const [isVoiceListening, setIsVoiceListening] = useState(false)

  // ✅ Guardamos SIEMPRE el último callback
  const onResultRef = useRef(onResult)
  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn("❌ SpeechRecognition no disponible en este navegador")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsVoiceListening(true)
      console.log("🎤 Escuchando...")
    }

    recognition.onend = () => {
      setIsVoiceListening(false)
      console.log("🛑 Fin escucha")
    }

    recognition.onerror = (e) => {
      setIsVoiceListening(false)
      console.error("❌ Error voz:", e)
    }

    recognition.onresult = (event) => {
      const text = event?.results?.[0]?.[0]?.transcript ?? ""
      console.log("🗣️ Texto:", text)

      // ✅ Llamamos SIEMPRE al último handler
      onResultRef.current?.(text)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch {}
      recognitionRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    try {
      recognitionRef.current?.start()
    } catch (e) {
      console.error("❌ No se pudo iniciar reconocimiento:", e)
    }
  }, [])

  return { startListening, isVoiceListening }
}
