
import Estructura from "../../components/Estructura/Estructura";
import EditorTexto from "../../components/EditorTexto/EditorTexto"; // o donde lo guardes

const Contenido = () => {
    return (
        <Estructura>

            <div
                className="d-flex flex-column contenido-stock"
                style={{ height: "100vh", padding: "1rem" }}
            >
                <div className="w-100 text-center mb-3">
                    <h1 className="headerTitle m-0">CREAR CONTENIDO</h1>
                </div>

                <div style={{ height: "calc(100vh - 100px)" }}>
                    <EditorTexto />
                </div>

            </div>
        </Estructura>
    );
};

export default Contenido;
