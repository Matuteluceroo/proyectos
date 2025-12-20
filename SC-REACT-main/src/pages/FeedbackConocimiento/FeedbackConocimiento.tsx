import Estructura from "../../components/Estructura/Estructura"
import { useObtenerFeedbackAudio } from "./useObtenerFeedbackAudio"
import "./FeedbackConocimiento.css"
import { url2 } from "../../services/connections/consts"

export default function FeedbackConocimiento() {
  const { data, loading } = useObtenerFeedbackAudio()

  return (
    <Estructura>
      <div className="feedback-container">
        <h1 className="feedback-title">
          🧠 Feedback para la creación de conocimiento
        </h1>

        {loading ? (
          <p>Cargando audios...</p>
        ) : (
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Audio</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id_contenido_audio}>
                  <td>{item.titulo_contenido}</td>
                  <td>{item.tipo_origen}</td>
                  <td>{item.usuario}</td>
                  <td>{new Date(item.fecha_creacion).toLocaleString()}</td>
                  <td>
                    <audio controls src={`${url2}/${item.url_audio}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Estructura>
  )
}
