import sys
import io
import json
import base64
from generador_pdf import generar_PDF # este es tu script existente con toda la lógica

# 🔧 Leer correctamente stdin como UTF-8
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')


def main():
    try:
        data = json.load(sys.stdin)
        
        data_value = data.get("data_renglones")
        data_cliente = data.get("data_cliente")
        data_entrega = data.get("data_entrega")
        firmas_chequeadas = data.get("firmas_chequeadas")
        total = data.get("total_licitacion")

        if not data_cliente or not data_value:
            raise ValueError("Faltan datos obligatorios para generar el PDF")

        buffer = generar_PDF(data_value, data_cliente, data_entrega, firmas_chequeadas, total)

        # Convertir PDF a base64
        encoded_pdf = base64.b64encode(buffer.read()).decode("utf-8")

        print(json.dumps({
            "fileName": "documento.pdf",
            "contentBase64": encoded_pdf
        }))

    except Exception as e:
        print(json.dumps({ "error": str(e) }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
