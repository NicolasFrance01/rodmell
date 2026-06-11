import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, DollarSign, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Bienvenido de vuelta, {session?.user?.name || "Administrador"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Vehículos en Stock
            </CardTitle>
            <Car className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">124</div>
            <p className="text-xs text-slate-500 mt-1">
              +4 agregados este mes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Ventas del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$145,000</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Nuevos Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+48</div>
            <p className="text-xs text-slate-500 mt-1">
              +18% en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Actividad Reciente
            </CardTitle>
            <Activity className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Alta</div>
            <p className="text-xs text-slate-500 mt-1">
              12 acciones en la última hora
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Últimos Vehículos - Placeholder Table Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Últimos Vehículos Agregados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full rounded-md border border-slate-800 border-dashed flex items-center justify-center bg-slate-900/30">
              <span className="text-sm text-slate-500">Tabla de vehículos (Próximamente)</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Actividad del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-200">
                      Usuario admin se conectó
                    </p>
                    <p className="text-xs text-slate-500">
                      Hace {i * 10} minutos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
