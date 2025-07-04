import { useNavigate } from "react-router-dom"
import BotonVolver from "../../components/Button/BotonVolver"

export const HeaderSugerencias = () => {
  const navigate = useNavigate()
  return (
    <div className="row w-100 align-items-center py-2 px-3">
      <div className="col-2 d-flex justify-content-start align-items-center">
        <BotonVolver onClick={() => navigate("/administracion")} />
      </div>

      <div className="col-8 d-flex justify-content-center align-items-center">
        <h1 className="headerTitle text-center m-0">SUGERENCIAS</h1>
      </div>

      <div className="col-2" />
    </div>
  )
}
