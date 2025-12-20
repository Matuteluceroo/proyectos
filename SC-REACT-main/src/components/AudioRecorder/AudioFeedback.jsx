import { useEffect, useRef, useState } from "react";

const AudioFeedback = ({ idContenido, tipoOrigen }) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [grabando, setGrabando] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🎤 iniciar grabación
  const iniciarGrabacion = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current.start();
    setGrabando(true);
  };

  // ⏹️ detener
  const detenerGrabacion = () => {
    mediaRecorderRef.current.stop();
    setGrabando(false);
  };

  // 📤 enviar al backend
  const enviarAudio = async () => {
    if (!audioBlob) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("audio", audioBlob, "feedback.webm");
    formData.append("id_contenido", idContenido);
    formData.append("tipo_origen", tipoOrigen); // HTML | ARCHIVO

    try {
      const res = await fetch("http://localhost:3001/contenido-audio", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();
      console.log("Audio guardado:", data);

      alert("🎉 Audio guardado correctamente");

      // limpiar
      setAudioBlob(null);
      setAudioURL(null);

    } catch (error) {
      console.error(error);
      alert("❌ Error al subir audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 6 }}>
      <h4>🎙️ Feedback por audio</h4>

      {!grabando ? (
        <button onClick={iniciarGrabacion}>
          🎤 Grabar
        </button>
      ) : (
        <button onClick={detenerGrabacion}>
          ⏹️ Detener
        </button>
      )}

      {audioURL && (
        <>
          <audio controls src={audioURL} style={{ display: "block", marginTop: 10 }} />
          <button onClick={enviarAudio} disabled={loading}>
            {loading ? "Enviando..." : "📤 Enviar audio"}
          </button>
        </>
      )}
    </div>
  );
};

export default AudioFeedback;
