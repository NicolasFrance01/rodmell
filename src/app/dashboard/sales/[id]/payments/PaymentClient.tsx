"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, CheckCircle2, Clock, XCircle, Plus, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PaymentClient({ sale, totalRecaudado }: { sale: any, totalRecaudado: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States for Modals
  const [openPago, setOpenPago] = useState(false);
  const [openCuotas, setOpenCuotas] = useState(false);

  const [pagoData, setPagoData] = useState({ importe: "", medioPago: "EFECTIVO", observaciones: "" });
  const [cuotaData, setCuotaData] = useState({ cantidad: "12", valor: "", fechaInicio: new Date().toISOString().split("T")[0] });

  const handleAddPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagoData),
      });
      if (res.ok) {
        setOpenPago(false);
        setPagoData({ importe: "", medioPago: "EFECTIVO", observaciones: "" });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleGenerateCuotas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${sale.id}/installments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuotaData),
      });
      if (res.ok) {
        setOpenCuotas(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const toggleCuotaStatus = async (cuotaId: string, currentStatus: string) => {
    if (!confirm(`¿Marcar cuota como ${currentStatus === "PAGADA" ? "PENDIENTE" : "PAGADA"}?`)) return;
    try {
      const newStatus = currentStatus === "PAGADA" ? "PENDIENTE" : "PAGADA";
      await fetch(`/api/installments/${cuotaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sales" className="p-2 bg-[#111] hover:bg-[#222] text-zinc-400 hover:text-white rounded-lg transition-colors border border-[#333]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Gestión de Pagos
          </h1>
          <p className="text-zinc-400 mt-1">
            {sale.vehiculo.marca} {sale.vehiculo.modelo} • Cliente: <span className="text-yellow-500 font-medium">{sale.cliente.nombreCompleto}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-24 h-24 text-white" />
          </div>
          <p className="text-zinc-400 font-medium mb-1">Total de la Operación</p>
          <p className="text-3xl font-bold text-white">${sale.total.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24 text-green-500" />
          </div>
          <p className="text-zinc-400 font-medium mb-1">Total Recaudado</p>
          <p className="text-3xl font-bold text-green-500">${totalRecaudado.toLocaleString()}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-zinc-400 font-medium mb-1">Saldo Pendiente</p>
          <p className="text-3xl font-bold text-red-500">${sale.saldoPendiente.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pagos Iniciales / Entregas */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex justify-between items-center bg-gradient-to-r from-[#111] to-transparent">
            <div>
              <h3 className="text-xl font-bold text-white">Pagos y Entregas</h3>
              <p className="text-zinc-500 text-sm mt-1">Registros de pagos sueltos o señas.</p>
            </div>
            
            <Dialog open={openPago} onOpenChange={setOpenPago}>
              <DialogTrigger asChild>
                <Button className="bg-[#222] hover:bg-[#333] text-white border border-[#444]">
                  <Plus className="w-4 h-4 mr-2" /> Añadir Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
                <DialogHeader>
                  <DialogTitle>Registrar Pago / Entrega</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPago} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Importe</label>
                    <Input required type="number" className="bg-[#111] border-[#333]" value={pagoData.importe} onChange={e => setPagoData({...pagoData, importe: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Medio de Pago</label>
                    <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={pagoData.medioPago} onChange={e => setPagoData({...pagoData, medioPago: e.target.value})}>
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                      <option value="SENA">Seña</option>
                      <option value="TARJETA">Tarjeta</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Observaciones</label>
                    <Input className="bg-[#111] border-[#333]" value={pagoData.observaciones} onChange={e => setPagoData({...pagoData, observaciones: e.target.value})} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                    {loading ? "Guardando..." : "Guardar Pago"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="p-0 flex-1">
            {sale.pagos.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No hay pagos iniciales registrados.</div>
            ) : (
              <div className="divide-y divide-[#222]">
                {sale.pagos.map((pago: any) => (
                  <div key={pago.id} className="p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{pago.medioPago}</p>
                        <p className="text-zinc-500 text-xs">{new Date(pago.fecha).toLocaleDateString()} {pago.observaciones ? `• ${pago.observaciones}` : ""}</p>
                      </div>
                    </div>
                    <span className="text-white font-bold">${pago.importe.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plan de Cuotas */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex justify-between items-center bg-gradient-to-r from-[#111] to-transparent">
            <div>
              <h3 className="text-xl font-bold text-white">Plan de Cuotas</h3>
              <p className="text-zinc-500 text-sm mt-1">Control mensual de pagos financiados.</p>
            </div>
            
            <Dialog open={openCuotas} onOpenChange={setOpenCuotas}>
              <DialogTrigger asChild>
                <Button className="bg-[#222] hover:bg-[#333] text-white border border-[#444]">
                  <Calendar className="w-4 h-4 mr-2" /> Generar Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
                <DialogHeader>
                  <DialogTitle>Generar Plan de Cuotas</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerateCuotas} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Cantidad</label>
                      <Input required type="number" min="1" className="bg-[#111] border-[#333]" value={cuotaData.cantidad} onChange={e => setCuotaData({...cuotaData, cantidad: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Valor de Cuota</label>
                      <Input required type="number" className="bg-[#111] border-[#333]" value={cuotaData.valor} onChange={e => setCuotaData({...cuotaData, valor: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Fecha 1ra Cuota</label>
                      <Input required type="date" className="bg-[#111] border-[#333]" value={cuotaData.fechaInicio} onChange={e => setCuotaData({...cuotaData, fechaInicio: e.target.value})} />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                    {loading ? "Generando..." : "Generar Cuotas"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="p-0 flex-1">
            {sale.cuotas.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No hay plan de cuotas generado.</div>
            ) : (
              <div className="divide-y divide-[#222]">
                {sale.cuotas.map((cuota: any) => (
                  <div key={cuota.id} className="p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#222] border border-[#333] flex flex-col items-center justify-center">
                        <span className="text-xs text-zinc-500">Cuota</span>
                        <span className="text-white font-bold leading-none">{cuota.numeroCuota}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">${cuota.valor.toLocaleString()}</p>
                        <p className="text-zinc-500 text-xs">Vence: {new Date(cuota.fechaVencimiento).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleCuotaStatus(cuota.id, cuota.estado)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        cuota.estado === "PAGADA" 
                          ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
                          : cuota.estado === "VENCIDA" 
                            ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                      }`}
                    >
                      {cuota.estado === "PAGADA" ? <CheckCircle2 className="w-3.5 h-3.5" /> : cuota.estado === "VENCIDA" ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {cuota.estado}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
