import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function EntrenamientosTasaFinalizacion({ porcentaje }) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-2">Tasa de finalización de entrenamientos</h2>
      <CardContent>
        <div className="flex items-center gap-3">
          <Progress value={porcentaje} className="flex-1 h-3" />
          <span className="text-xl font-bold">{porcentaje}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
