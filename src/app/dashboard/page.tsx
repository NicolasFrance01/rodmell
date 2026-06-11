import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Car, Users, DollarSign, Activity, TrendingUp, TrendingDown, Clock } from "lucide-react";
import Image from "next/image";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Fetch real data
  const vehiclesCount = await prisma.vehiculo.count({ where: { estado: "DISPONIBLE" } });
  const customersCount = await prisma.cliente.count();
  
  // Calculate total sales this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0,0,0,0);
  
  const salesThisMonth = await prisma.operacion.findMany({
    where: { createdAt: { gte: thisMonth } }
  });
  const salesTotal = salesThisMonth.reduce((acc, sale) => acc + sale.total, 0);

  // Fetch recent data
  const recentVehicles = await prisma.vehiculo.findMany({
    take: 4,
    orderBy: { createdAt: "desc" }
  });

  const recentActivity = await prisma.activityLog.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
          Dashboard
        </h1>
        <p className="text-zinc-400 text-lg">
          Bienvenido de vuelta, <span className="text-yellow-500 font-semibold">{session?.user?.name || "Administrador"}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Vehicles */}
        <div className="group relative bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 overflow-hidden transition-all hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Vehículos en Stock</h3>
            <div className="p-3 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#333] rounded-xl group-hover:border-yellow-500/30 transition-all">
              <Car className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{vehiclesCount}</p>
          <div className="flex items-center text-xs font-medium text-emerald-500">
            <TrendingUp className="w-3 h-3 mr-1" />
            Actualizado en tiempo real
          </div>
        </div>
        
        {/* Sales */}
        <div className="group relative bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 overflow-hidden transition-all hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Ventas del Mes</h3>
            <div className="p-3 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#333] rounded-xl group-hover:border-yellow-500/30 transition-all">
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">${salesTotal.toLocaleString()}</p>
          <div className="flex items-center text-xs font-medium text-emerald-500">
            <TrendingUp className="w-3 h-3 mr-1" />
            {salesThisMonth.length} operaciones este mes
          </div>
        </div>

        {/* Customers */}
        <div className="group relative bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 overflow-hidden transition-all hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Nuevos Clientes</h3>
            <div className="p-3 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#333] rounded-xl group-hover:border-yellow-500/30 transition-all">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{customersCount}</p>
          <div className="flex items-center text-xs font-medium text-zinc-500">
            En la base de datos
          </div>
        </div>

        {/* Activity */}
        <div className="group relative bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 overflow-hidden transition-all hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-yellow-500/5 blur-3xl group-hover:bg-yellow-500/10 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Actividad Reciente</h3>
            <div className="p-3 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#333] rounded-xl group-hover:border-yellow-500/30 transition-all">
              <Activity className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{recentActivity.length > 0 ? "Alta" : "Baja"}</p>
          <div className="flex items-center text-xs font-medium text-zinc-500">
            <Clock className="w-3 h-3 mr-1" />
            Monitoreo constante
          </div>
        </div>
      </div>
      
      {/* Lower Grids */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Recent Vehicles */}
        <div className="col-span-4 bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#222] bg-gradient-to-r from-[#111] to-transparent">
            <h3 className="text-xl font-bold text-white">Últimos Vehículos Agregados</h3>
            <p className="text-zinc-500 text-sm mt-1">Nuevos ingresos al inventario.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentVehicles.length === 0 ? (
                <div className="col-span-full h-32 flex items-center justify-center border border-[#222] border-dashed rounded-xl bg-[#111]">
                  <p className="text-zinc-500">No hay vehículos recientes.</p>
                </div>
              ) : (
                recentVehicles.map(vehiculo => (
                  <div key={vehiculo.id} className="flex gap-4 p-3 rounded-xl border border-[#222] bg-[#111] hover:border-[#444] transition-colors">
                    <div className="relative w-20 h-16 rounded-md overflow-hidden bg-black flex-shrink-0">
                      {vehiculo.fotos && vehiculo.fotos.length > 0 ? (
                        <Image src={vehiculo.fotos[0]} alt={vehiculo.modelo} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight">{vehiculo.marca} {vehiculo.modelo}</h4>
                      <p className="text-zinc-400 text-xs mt-1">{vehiculo.dominio} • {vehiculo.anio}</p>
                      <p className="text-yellow-500 font-semibold text-sm mt-1">${vehiculo.precioVenta.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Activity Logs */}
        <div className="col-span-3 bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#222] bg-gradient-to-r from-[#111] to-transparent">
            <h3 className="text-xl font-bold text-white">Actividad del Sistema</h3>
            <p className="text-zinc-500 text-sm mt-1">Acciones recientes del equipo.</p>
          </div>
          <div className="p-6">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-yellow-500 before:via-[#333] before:to-transparent">
              {recentActivity.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No hay actividad registrada.</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-6 h-6 bg-[#111] border-2 border-yellow-500 rounded-full z-10 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    </div>
                    <div className="ml-10">
                      <p className="text-sm font-semibold text-white">
                        {log.action}
                      </p>
                      <p className="text-sm text-zinc-400 mt-0.5">
                        <span className="text-zinc-300 font-medium">@{log.user?.name}</span> {log.details ? `- ${log.details}` : ''}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
