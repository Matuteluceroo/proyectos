import sys
import json
import base64
import io
from io import BytesIO
from generador_parte import generar_parte_entregas_pdf # Debe estar en el mismo folder o en PYTHONPATH

def main():
    try:
        sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
        data = json.load(sys.stdin)
        json_data = data.get("json_data")
        entregas = data.get("entregas")

        if not json_data or not entregas:
            raise ValueError("Faltan json_data o entregas")

        buffer = generar_parte_entregas_pdf(json_data, entregas)
        encoded_pdf = base64.b64encode(buffer.read()).decode('utf-8')
        print(json.dumps({
            "fileName": "parte_entregas.pdf",
            "contentBase64": encoded_pdf
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
