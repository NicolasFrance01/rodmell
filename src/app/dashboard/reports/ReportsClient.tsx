"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { BarChart3, TrendingUp, Users, Car, CheckCircle2, Search } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function ReportsClient({ sales, vehicles, customers }: { sales: any[], vehicles: any[], customers: any[] }) {
  const [historySearch, setHistorySearch] = useState("");
  
  const calculateRecaudado = (sale: any) => {
    const autoPartePago = sale.autoPartePago || 0;
    const pagos = sale.pagos?.reduce((sum: number, p: any) => sum + p.importe, 0) || 0;
    const cuotas = sale.cuotas?.filter((c: any) => c.estado === "PAGADA").reduce((sum: number, c: any) => sum + c.valor, 0) || 0;
    return autoPartePago + pagos + cuotas;
  };

  const totalRevenue = sales.reduce((acc, sale) => acc + calculateRecaudado(sale), 0);
  
  // Group sales by month
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthSales = sales.filter(s => new Date(s.createdAt).getMonth() === i);
    return {
      name: new Date(0, i).toLocaleString('es', { month: 'short' }).toUpperCase(),
      total: monthSales.reduce((acc, s) => acc + calculateRecaudado(s), 0),
      operaciones: monthSales.length
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reportes y Estadísticas</h1>
          <p className="text-zinc-400 mt-1">Métricas de rendimiento y ventas de la concesionaria.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Ingresos Totales</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Ventas Concretadas</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{sales.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Vehículos en Stock</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Car className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{vehicles.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Clientes Registrados</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{customers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Ingresos Mensuales</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip cursor={{fill: '#111'}} contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Volumen de Operaciones</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', color: '#fff'}} />
                <Line type="monotone" dataKey="operaciones" stroke="#eab308" strokeWidth={3} dot={{fill: '#eab308', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos Diarios */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#111] rounded-lg border border-[#333]">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Historial de Movimientos</h3>
              <p className="text-zinc-400 text-sm">Registro detallado de ingresos (pagos iniciales y cuotas).</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              placeholder="Buscar por fecha, cliente, concepto..." 
              className="w-full pl-10 pr-4 py-2 bg-[#111] border border-[#333] rounded-md text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#222] text-zinc-400">
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Concepto</th>
                <th className="pb-3 font-medium">Detalle Venta</th>
                <th className="pb-3 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {(() => {
                const allMovements = sales.flatMap(sale => {
                  const movs = [];

                  if (sale.autoPartePago && sale.autoPartePago > 0) {
                    movs.push({
                      id: `autopago-${sale.id}`,
                      fecha: new Date(sale.createdAt),
                      tipo: "Auto en Parte de Pago",
                      monto: sale.autoPartePago,
                      descripcion: sale.detalleAutoPartePago || "Entrega de vehículo",
                      cliente: sale.cliente?.nombreCompleto || 'Cliente Eliminado'
                    });
                  }

                  const pagos = sale.pagos?.map((p: any) => ({
                    id: `pago-${p.id}`,
                    fecha: new Date(p.fecha),
                    tipo: p.observaciones === "Pago Inicial" ? "Efectivo (Pago Inicial)" : (p.medioPago === "SENA" ? "SEÑA" : "Abono"),
                    monto: p.importe,
                    descripcion: `${sale.vehiculo?.marca || ''} ${sale.vehiculo?.modelo || ''}`,
                    cliente: sale.cliente?.nombreCompleto || 'Cliente Eliminado'
                  })) || [];
              
                  const cuotasPagadas = sale.cuotas?.filter((c: any) => c.estado === "PAGADA").map((c: any) => ({
                    id: `cuota-${c.id}`,
                    fecha: new Date(c.updatedAt || c.fechaVencimiento),
                    tipo: `Cuota ${c.numeroCuota}`,
                    monto: c.valor,
                    descripcion: `${sale.vehiculo?.marca || ''} ${sale.vehiculo?.modelo || ''}`,
                    cliente: sale.cliente?.nombreCompleto || 'Cliente Eliminado'
                  })) || [];
              
                  return [...movs, ...pagos, ...cuotasPagadas];
                }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                .filter((mov) => {
                  if (!historySearch.trim()) return true;
                  const term = historySearch.toLowerCase();
                  return (
                    mov.fecha.toLocaleDateString().includes(term) ||
                    mov.cliente.toLowerCase().includes(term) ||
                    mov.tipo.toLowerCase().includes(term) ||
                    mov.descripcion.toLowerCase().includes(term) ||
                    mov.monto.toString().includes(term)
                  );
                });

                if (allMovements.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        {historySearch ? "No hay resultados para la búsqueda" : "No hay movimientos registrados"}
                      </td>
                    </tr>
                  );
                }

                return allMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-[#111] transition-colors group">
                    <td className="py-4 text-zinc-300">
                      {mov.fecha.toLocaleDateString()}
                    </td>
                    <td className="py-4 font-medium text-white">
                      {mov.cliente}
                    </td>
                    <td className="py-4 text-zinc-300">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-400">
                      {mov.descripcion}
                    </td>
                    <td className="py-4 text-right font-bold text-green-500">
                      +${mov.monto.toLocaleString()}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
