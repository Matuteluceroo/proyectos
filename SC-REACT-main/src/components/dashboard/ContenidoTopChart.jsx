import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ContenidoTopChart({ data }) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-2">Contenidos más consultados</h2>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={data}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="titulo" width={200} />
            <Tooltip />
            <Bar dataKey="consultas" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
