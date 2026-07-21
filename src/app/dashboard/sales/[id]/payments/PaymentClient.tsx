"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, CheckCircle2, Clock, XCircle, Plus, Calendar, DollarSign, FileText, Edit, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PaymentClient({ sale, totalRecaudado, session }: { sale: any, totalRecaudado: number, session?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States for Modals
  const [openPago, setOpenPago] = useState(false);
  const [openCuotas, setOpenCuotas] = useState(false);

  const [pagoData, setPagoData] = useState({ importe: "", medioPago: "EFECTIVO", observaciones: "", file: null as File | null });
  const [cuotaData, setCuotaData] = useState({ cantidad: "12", valor: "", fechaInicio: new Date().toISOString().split("T")[0] });

  const [openCuotaPay, setOpenCuotaPay] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<any>(null);
  const [cuotaPayData, setCuotaPayData] = useState({ medioPago: "EFECTIVO", file: null as File | null });

  // New States for Search and Edit
  const [searchTerm, setSearchTerm] = useState("");
  const [openEditPago, setOpenEditPago] = useState(false);
  const [selectedPago, setSelectedPago] = useState<any>(null);
  const [editPagoData, setEditPagoData] = useState({ medioPago: "", observaciones: "", file: null as File | null });

  const handleAddPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let comprobanteUrl = null;
      if (pagoData.file) {
        const formData = new FormData();
        formData.append("file", pagoData.file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const blob = await uploadRes.json();
          comprobanteUrl = blob.url;
        } else {
          toast.error("Error al subir el adjunto");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/sales/${sale.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importe: pagoData.importe,
          medioPago: pagoData.medioPago,
          observaciones: pagoData.observaciones,
          comprobanteUrl,
        }),
      });
      if (res.ok) {
        setOpenPago(false);
        setPagoData({ importe: "", medioPago: "EFECTIVO", observaciones: "", file: null });
        toast.success("Pago registrado correctamente");
        router.refresh();
      } else {
        toast.error("Error al registrar el pago");
      }
    } catch {
      toast.error("Error de conexión");
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
        toast.success("Plan de cuotas generado");
        router.refresh();
      } else {
        toast.error("Error al generar las cuotas");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handlePayCuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCuota) return;
    setLoading(true);
    try {
      let comprobanteUrl = null;
      if (cuotaPayData.file) {
        const formData = new FormData();
        formData.append("file", cuotaPayData.file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const blob = await uploadRes.json();
          comprobanteUrl = blob.url;
        } else {
          toast.error("Error al subir el adjunto");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/installments/${selectedCuota.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          estado: "PAGADA",
          medioPago: cuotaPayData.medioPago,
          comprobanteUrl,
        }),
      });
      if (res.ok) {
        toast.success(`Cuota marcada como PAGADA`);
        setOpenCuotaPay(false);
        setSelectedCuota(null);
        setCuotaPayData({ medioPago: "EFECTIVO", file: null });
        router.refresh();
      } else {
        toast.error("No se pudo actualizar la cuota");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const toggleCuotaStatus = async (cuotaId: string, currentStatus: string) => {
    if (currentStatus !== "PAGADA") {
      const cuota = sale.cuotas.find((c: any) => c.id === cuotaId);
      setSelectedCuota(cuota);
      setOpenCuotaPay(true);
      return;
    }

    try {
      const res = await fetch(`/api/installments/${cuotaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "PENDIENTE" }),
      });
      if (res.ok) {
        toast.success(`Cuota marcada como PENDIENTE`);
        router.refresh();
      } else {
        toast.error("No se pudo actualizar la cuota");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleDownloadPagoReceipt = async (pago: any) => {
    const { generateReceiptPDF } = await import('@/lib/generateReceipt');
    generateReceiptPDF(sale, "PAGO", pago, session?.user?.ubicacion);
  };

  const handleDownloadCuotaReceipt = async (cuota: any) => {
    const { generateReceiptPDF } = await import('@/lib/generateReceipt');
    generateReceiptPDF(sale, "CUOTA", cuota, session?.user?.ubicacion);
  };

  const handleUpdatePago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPago) return;
    setLoading(true);
    try {
      let comprobanteUrl = selectedPago.comprobanteUrl;
      if (editPagoData.file) {
        const formData = new FormData();
        formData.append("file", editPagoData.file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const blob = await uploadRes.json();
          comprobanteUrl = blob.url;
        } else {
          toast.error("Error al subir el adjunto");
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/payments/${selectedPago.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medioPago: editPagoData.medioPago,
          observaciones: editPagoData.observaciones,
          comprobanteUrl,
        }),
      });

      if (res.ok) {
        toast.success("Pago actualizado");
        setOpenEditPago(false);
        setSelectedPago(null);
        router.refresh();
      } else {
        toast.error("Error al actualizar pago");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handleDeletePago = async (pagoId: string) => {
    if (!confirm("¿Estás seguro de eliminar este pago? El saldo pendiente se incrementará automáticamente.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/${pagoId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pago eliminado correctamente");
        router.refresh();
      } else {
        toast.error("Error al eliminar el pago");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
  };

  const handleDeleteCuota = async (cuotaId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta cuota? El saldo pendiente se actualizará automáticamente.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/installments/${cuotaId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Cuota eliminada correctamente");
        router.refresh();
      } else {
        toast.error("Error al eliminar la cuota");
      }
    } catch {
      toast.error("Error de conexión");
    }
    setLoading(false);
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
          <p className="text-3xl font-bold text-red-500">${(sale.total - totalRecaudado).toLocaleString()}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
        <Search className="w-5 h-5 text-zinc-500" />
        <Input 
          placeholder="Buscar por Nº de Comprobante o Medio de Pago..." 
          className="bg-[#111] border-[#333] text-white flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
              <Button 
                onClick={() => {
                  setPagoData({ importe: "", medioPago: "EFECTIVO", observaciones: "", file: null });
                  setOpenPago(true);
                }}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-[#222] hover:bg-[#333] text-white border border-[#444]"
              >
                <Plus className="w-4 h-4 mr-2" /> Añadir Pago
              </Button>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Archivo Adjunto (Opcional)</label>
                    <Input type="file" className="bg-[#111] border-[#333] text-zinc-400" onChange={e => setPagoData({...pagoData, file: e.target.files?.[0] || null})} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                    {loading ? "Guardando..." : "Guardar Pago"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="p-0 flex-1">
            {(() => {
              // Calculate Pago Inicial tracking
              const totalPagoInicialAcordado = sale.efectivo || 0;
              const pagosInicialesCobrados = sale.pagos.filter((p: any) => 
                p.observaciones?.trim() === "Pago Inicial" || p.observaciones?.trim().startsWith("Pago Inicial -")
              );
              const totalPagoInicialCobrado = pagosInicialesCobrados.reduce((acc: number, p: any) => acc + p.importe, 0);
              const pagoInicialPendiente = Math.max(0, totalPagoInicialAcordado - totalPagoInicialCobrado);

              const iniciales = [];
              if (sale.autoPartePago > 0) {
                iniciales.push({
                  id: `autopago-${sale.id}`,
                  isInitial: true,
                  medioPago: "AUTO PARTE PAGO",
                  fecha: sale.createdAt,
                  observaciones: sale.detalleAutoPartePago || "Entrega de vehículo",
                  importe: sale.autoPartePago,
                  comprobante: sale.comprobante || sale.id
                });
              }
              
              const allPagos = [...iniciales, ...sale.pagos].filter((p: any) => 
                `${p.comprobante || p.id.slice(-6).toUpperCase()} ${p.medioPago} ${p.observaciones || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                <div className="flex flex-col divide-y divide-[#222]">
                  {/* Tracking de Pago Inicial */}
                  {totalPagoInicialAcordado > 0 && (
                    <div className="p-4 bg-[#111]/30 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div>
                        <span className="text-zinc-500 text-xs font-semibold block uppercase">Pago Inicial Pactado</span>
                        <span className="text-white font-bold text-lg">${totalPagoInicialAcordado.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-xs font-semibold block uppercase">Total Cobrado</span>
                        <span className="text-green-400 font-bold text-lg">${totalPagoInicialCobrado.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-xs font-semibold block uppercase">Pendiente</span>
                        <span className={`${pagoInicialPendiente > 0 ? "text-red-400" : "text-zinc-400"} font-bold text-lg`}>
                          ${pagoInicialPendiente.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        {pagoInicialPendiente > 0 && (
                          <Button 
                            onClick={() => {
                              setPagoData({ 
                                importe: pagoInicialPendiente.toString(), 
                                medioPago: "EFECTIVO", 
                                observaciones: "Pago Inicial", 
                                file: null 
                              });
                              setOpenPago(true);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-xs px-3 py-1.5 h-auto rounded-md shadow"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Cobrar Pendiente
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {allPagos.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">No hay pagos iniciales ni entregas registradas.</div>
                  ) : (
                    <div className="divide-y divide-[#222]">
                      {allPagos.map((pago: any) => (
                        <div key={pago.id} className="p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                              <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{pago.medioPago === "SENA" ? "SEÑA" : pago.medioPago}</p>
                              <p className="text-zinc-500 text-xs">{new Date(pago.fecha).toLocaleDateString()} {pago.observaciones ? `• ${pago.observaciones}` : ""}</p>
                              <div className="flex gap-2 mt-1">
                                {pago.comprobanteUrl && (
                                  <a href={pago.comprobanteUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Ver adjunto</a>
                                )}
                                <span className="text-xs text-yellow-500 font-mono">Nº {pago.comprobante || pago.id.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-bold">${pago.importe.toLocaleString()}</span>
                            {!pago.isInitial && (
                              <>
                                <button onClick={() => {
                                  setSelectedPago(pago);
                                  setEditPagoData({ medioPago: pago.medioPago, observaciones: pago.observaciones || "", file: null });
                                  setOpenEditPago(true);
                                }} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors" title="Editar Pago">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDownloadPagoReceipt(pago)} className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors" title="Descargar Comprobante">
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeletePago(pago.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Eliminar Pago">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
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
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-[#222] hover:bg-[#333] text-white border border-[#444]">
                <Calendar className="w-4 h-4 mr-2" /> Generar Plan
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
            {sale.cuotas.filter((c: any) => 
              `${c.comprobante || c.id.slice(-6).toUpperCase()} ${c.estado}`.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No hay plan de cuotas generado.</div>
            ) : (
              <div className="divide-y divide-[#222]">
                {sale.cuotas.filter((c: any) => 
                  `${c.comprobante || c.id.slice(-6).toUpperCase()} ${c.estado}`.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((cuota: any) => (
                  <div key={cuota.id} className="p-4 flex items-center justify-between hover:bg-[#111] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#222] border border-[#333] flex flex-col items-center justify-center">
                        <span className="text-xs text-zinc-500">Cuota</span>
                        <span className="text-white font-bold leading-none">{cuota.numeroCuota}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">${cuota.valor.toLocaleString()}</p>
                        <p className="text-zinc-500 text-xs">Vence: {new Date(cuota.fechaVencimiento).toLocaleDateString()}</p>
                        {cuota.estado === "PAGADA" && (
                          <div className="flex gap-2 mt-1">
                            {cuota.comprobanteUrl && (
                              <a href={cuota.comprobanteUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">Ver adjunto</a>
                            )}
                            <span className="text-xs text-yellow-500 font-mono">Nº {cuota.comprobante || cuota.id.slice(-6).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
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
                      
                      {cuota.estado === "PAGADA" && (
                        <>
                          <button onClick={() => {
                            setSelectedCuota(cuota);
                            setCuotaPayData({ medioPago: cuota.medioPago || "EFECTIVO", file: null });
                            setOpenCuotaPay(true);
                          }} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors" title="Editar Cuota">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDownloadCuotaReceipt(cuota)} className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors" title="Descargar Comprobante">
                            <FileText className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteCuota(cuota.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Eliminar Cuota">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <Dialog open={openCuotaPay} onOpenChange={setOpenCuotaPay}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader>
            <DialogTitle>Marcar Cuota como Pagada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayCuota} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Medio de Pago</label>
              <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={cuotaPayData.medioPago} onChange={e => setCuotaPayData({...cuotaPayData, medioPago: e.target.value})}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="SENA">Seña</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Comprobante del cliente (Opcional)</label>
              {selectedCuota?.comprobanteUrl && (
                <div className="mb-2">
                  <a href={selectedCuota.comprobanteUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                    Ver comprobante actual adjunto
                  </a>
                </div>
              )}
              <Input type="file" className="bg-[#111] border-[#333] text-zinc-400" onChange={e => setCuotaPayData({...cuotaPayData, file: e.target.files?.[0] || null})} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white mt-6">
              {loading ? "Guardando..." : "Confirmar Pago"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditPago} onOpenChange={setOpenEditPago}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
          <DialogHeader>
            <DialogTitle>Editar Pago / Entrega</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePago} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Medio de Pago</label>
              <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={editPagoData.medioPago} onChange={e => setEditPagoData({...editPagoData, medioPago: e.target.value})}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="SENA">Seña</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Observaciones</label>
              <Input className="bg-[#111] border-[#333]" value={editPagoData.observaciones} onChange={e => setEditPagoData({...editPagoData, observaciones: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Archivo Adjunto (Opcional - Reemplazar)</label>
              {selectedPago?.comprobanteUrl && (
                <div className="mb-2">
                  <a href={selectedPago.comprobanteUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                    Ver comprobante actual adjunto
                  </a>
                </div>
              )}
              <Input type="file" className="bg-[#111] border-[#333] text-zinc-400" onChange={e => setEditPagoData({...editPagoData, file: e.target.files?.[0] || null})} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
