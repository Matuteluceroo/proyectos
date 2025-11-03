export default function EntrenamientosTasaFinalizacion({ porcentaje = 0 }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-col justify-center">
      <h2 className="text-lg font-semibold mb-3 text-[#497b1a]">
        Tasa de finalización de entrenamientos
      </h2>
      <div className="flex items-center gap-3">
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="h-3 bg-[#7ab648]"
            style={{ width: `${porcentaje}%`, transition: "width 0.5s" }}
          ></div>
        </div>
        <span className="text-xl font-bold text-[#497b1a]">{porcentaje}%</span>
      </div>
    </div>
  );
}
