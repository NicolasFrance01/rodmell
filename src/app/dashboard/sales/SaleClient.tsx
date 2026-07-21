"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  ChevronDown,
  BadgeDollarSign, 
  Edit,
  Wallet,
  Check
} from "lucide-react";
import Link from "next/link";
import { formatThousands, parseThousands } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function SearchableSelect({ options, value, onChange, placeholder }: any) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const selected = options.find((o: any) => o.value === value);
    if (selected) setSearch(selected.label);
    else setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // ONLY depend on value

  const handleInputChange = (val: string) => {
    setSearch(val);
    setOpen(true);
    if (val === "") {
      onChange("");
    }
  };

  const handleSelect = (optionVal: string, optionLabel: string) => {
    onChange(optionVal);
    setSearch(optionLabel);
    setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      const selected = options.find((o: any) => o.value === value);
      if (selected) {
        setSearch(selected.label);
      } else {
        setSearch("");
      }
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input 
          className="w-full bg-[#111] border-[#333] pr-10" 
          placeholder={placeholder} 
          value={search} 
          onChange={e => handleInputChange(e.target.value)}
          onClick={() => setOpen(true)}
          onBlur={handleBlur}
        />
        <ChevronDown 
          className="absolute right-3 w-4 h-4 text-zinc-500 cursor-pointer pointer-events-none" 
        />
      </div>
      {open && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl">
          {options.filter((o:any) => o.label.toLowerCase().includes(search.toLowerCase())).map((o:any) => (
            <li 
              key={o.value} 
              className="px-3 py-2 text-sm text-zinc-300 hover:bg-[#333] hover:text-white cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault(); 
                handleSelect(o.value, o.label);
              }}
            >
              {o.label}
            </li>
          ))}
          {options.filter((o:any) => o.label.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function SaleClient({ sales, vehicles, customers, session }: { sales: any[], vehicles: any[], customers: any[], session: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    clienteId: "",
    vehiculoId: "",
    precioVehiculo: "",

    hasEfectivo: false,
    efectivo: "",
    pagoInicialCobradoTotalmente: true,
    efectivoCobradoEnActo: "",

    hasCredito: false,
    credito: "",
    porcentajeQuebranto: "",
    quebranto: "0",

    hasAuto: false,
    autoPartePago: "",
    detalleAutoPartePago: "",

    gastosPatente: "",
    gastosTransferencia: "",
    gastosPrendarios: "",
    confirmado: false,

    formaPago: "",
    total: "",
    saldoPendiente: "0",
    observaciones: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // Recalculate calculations automatically when inputs change
  useEffect(() => {
    const precioVehiculo = parseThousands(formData.precioVehiculo);
    const credito = formData.hasCredito ? parseThousands(formData.credito) : 0;
    const porcentajeQuebranto = formData.hasCredito ? (parseFloat(formData.porcentajeQuebranto) || 0) : 0;
    
    // Calcular Quebranto (Crédito * (Porcentaje/100) * 1.21 de IVA)
    const calculadoQuebranto = credito * (porcentajeQuebranto / 100) * 1.21;
    const quebrantoStr = formatThousands(Math.round(calculadoQuebranto));

    const gastosPatente = parseThousands(formData.gastosPatente);
    const gastosTransferencia = parseThousands(formData.gastosTransferencia);
    const gastosPrendarios = parseThousands(formData.gastosPrendarios);

    // Total = Precio + Quebranto + Gastos
    const calculadoTotal = precioVehiculo + calculadoQuebranto + gastosPatente + gastosTransferencia + gastosPrendarios;

    // Pagos
    const pagoEfectivo = formData.hasEfectivo ? parseThousands(formData.efectivo) : 0;
    const cobradoEnElActo = formData.hasEfectivo
      ? (formData.pagoInicialCobradoTotalmente ? pagoEfectivo : parseThousands(formData.efectivoCobradoEnActo))
      : 0;
    const pagoAuto = formData.hasAuto ? parseThousands(formData.autoPartePago) : 0;
    const totalPagado = cobradoEnElActo + pagoAuto;

    // Saldo Pendiente
    const calculadoSaldo = calculadoTotal - totalPagado;

    // Generar string Forma de Pago
    const formas = [];
    if (formData.hasEfectivo) formas.push("Efectivo");
    if (formData.hasCredito) formas.push("Crédito");
    if (formData.hasAuto) formas.push("Auto en Parte de Pago");
    const calculadoFormaPago = formas.join(" + ");

    setFormData(prev => ({
      ...prev,
      quebranto: quebrantoStr,
      total: formatThousands(Math.round(calculadoTotal)),
      saldoPendiente: formatThousands(Math.round(calculadoSaldo)),
      formaPago: prev.formaPago || calculadoFormaPago
    }));
  }, [
    formData.precioVehiculo,
    formData.hasEfectivo, formData.efectivo, formData.pagoInicialCobradoTotalmente, formData.efectivoCobradoEnActo,
    formData.hasCredito, formData.credito, formData.porcentajeQuebranto,
    formData.hasAuto, formData.autoPartePago,
    formData.gastosPatente, formData.gastosTransferencia, formData.gastosPrendarios
  ]);

  const handleAmountChange = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: formatThousands(val) }));
  };

  const handleConfirmSale = async (sale: any) => {
    if (!confirm(`¿Confirmar el pago y registrar la venta ${sale.comprobante || sale.id.slice(-6).toUpperCase()} como pagada?`)) return;
    try {
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmado: true }),
      });
      if (res.ok) {
        router.refresh();
        const updatedSale = { ...sale, confirmado: true };
        handleDownloadPDF(updatedSale);
      } else {
        alert("Error al confirmar el pago");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      clienteId: "", vehiculoId: "", precioVehiculo: "", 
      hasEfectivo: false, efectivo: "",
      pagoInicialCobradoTotalmente: true, efectivoCobradoEnActo: "",
      hasCredito: false, credito: "", porcentajeQuebranto: "", quebranto: "0",
      hasAuto: false, autoPartePago: "", detalleAutoPartePago: "",
      gastosPatente: "", gastosTransferencia: "", gastosPrendarios: "", confirmado: false,
      formaPago: "", total: "", saldoPendiente: "0", observaciones: ""
    });
    setOpen(true);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      clienteId: s.clienteId,
      vehiculoId: s.vehiculoId,
      precioVehiculo: formatThousands(s.precioVehiculo),
      hasEfectivo: (s.efectivo && s.efectivo > 0) ? true : false,
      efectivo: s.efectivo ? formatThousands(s.efectivo) : "",
      pagoInicialCobradoTotalmente: true,
      efectivoCobradoEnActo: "",
      hasCredito: (s.credito && s.credito > 0) ? true : false,
      credito: s.credito ? formatThousands(s.credito) : "",
      porcentajeQuebranto: s.porcentajeQuebranto ? s.porcentajeQuebranto.toString() : "",
      quebranto: s.quebranto ? formatThousands(s.quebranto) : "0",
      hasAuto: (s.autoPartePago && s.autoPartePago > 0) ? true : false,
      autoPartePago: s.autoPartePago ? formatThousands(s.autoPartePago) : "",
      detalleAutoPartePago: s.detalleAutoPartePago || "",
      gastosPatente: s.gastosPatente ? formatThousands(s.gastosPatente) : "",
      gastosTransferencia: s.gastosTransferencia ? formatThousands(s.gastosTransferencia) : "",
      gastosPrendarios: s.gastosPrendarios ? formatThousands(s.gastosPrendarios) : "",
      confirmado: s.confirmado || false,
      formaPago: s.formaPago || "",
      total: formatThousands(s.total),
      saldoPendiente: formatThousands(s.saldoPendiente),
      observaciones: s.observaciones || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de anular esta venta? El vehículo y el cliente seguirán existiendo.")) return;
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al eliminar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        clienteId: formData.clienteId,
        vehiculoId: formData.vehiculoId,
        precioVehiculo: parseThousands(formData.precioVehiculo),
        formaPago: formData.formaPago,
        
        efectivo: formData.hasEfectivo ? parseThousands(formData.efectivo) : null,
        cobradoEnElActo: formData.hasEfectivo ? (formData.pagoInicialCobradoTotalmente ? parseThousands(formData.efectivo) : parseThousands(formData.efectivoCobradoEnActo)) : 0,
        credito: formData.hasCredito ? parseThousands(formData.credito) : null,
        porcentajeQuebranto: formData.hasCredito ? (parseFloat(formData.porcentajeQuebranto) || 0) : null,
        quebranto: formData.hasCredito ? parseThousands(formData.quebranto) : null,
        autoPartePago: formData.hasAuto ? parseThousands(formData.autoPartePago) : null,
        detalleAutoPartePago: formData.hasAuto ? formData.detalleAutoPartePago : null,
        
        gastosPatente: parseThousands(formData.gastosPatente),
        gastosTransferencia: parseThousands(formData.gastosTransferencia),
        gastosPrendarios: parseThousands(formData.gastosPrendarios),
        confirmado: formData.confirmado,
        
        observaciones: formData.observaciones,
        total: parseThousands(formData.total),
        saldoPendiente: parseThousands(formData.saldoPendiente),
        vendedorId: session?.user?.id || "cl123",
      };
      
      const url = editingId ? `/api/sales/${editingId}` : "/api/sales";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOpen(false);
        setEditingId(null);
        setFormData({ 
          clienteId: "", vehiculoId: "", precioVehiculo: "", 
          hasEfectivo: false, efectivo: "",
          pagoInicialCobradoTotalmente: true, efectivoCobradoEnActo: "",
          hasCredito: false, credito: "", porcentajeQuebranto: "", quebranto: "0",
          hasAuto: false, autoPartePago: "", detalleAutoPartePago: "",
          gastosPatente: "", gastosTransferencia: "", gastosPrendarios: "", confirmado: false,
          formaPago: "", total: "", saldoPendiente: "0", observaciones: ""
        });
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Error al procesar la venta");
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleDownloadPDF = async (sale: any) => {
    // Dynamic import to avoid SSR issues with window/document
    const { generateReceiptPDF } = await import('@/lib/generateReceipt');
    generateReceiptPDF(sale, "VENTA", null, session?.user?.ubicacion);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BadgeDollarSign className="h-8 w-8 text-yellow-500" />
            Ventas
          </h1>
          <p className="text-zinc-400 mt-1">Registrá y gestioná las operaciones concretadas.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={handleNew} className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nueva Operación
          </Button>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-3xl md:max-w-5xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Venta" : "Registrar Venta"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Completá los detalles de la venta. Los totales se calculan automáticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COLUMNA IZQUIERDA: Cliente y Vehículo */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Cliente</label>
                      <SearchableSelect 
                        placeholder="Escribí para buscar..."
                        value={formData.clienteId}
                        onChange={(val: string) => setFormData(prev => ({...prev, clienteId: val}))}
                        options={customers.map(c => ({ value: c.id, label: `${c.nombreCompleto} (DNI: ${c.dni || "-"})` }))}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Vehículo</label>
                      <SearchableSelect 
                        placeholder="Escribí para buscar..."
                        value={formData.vehiculoId}
                        onChange={(val: string) => {
                          setFormData(prev => ({...prev, vehiculoId: val}));
                          const combinedVehicles = [...vehicles];
                          if (editingId) {
                            const currentSale = sales.find(s => s.id === editingId);
                            if (currentSale?.vehiculo && !combinedVehicles.find(v => v.id === currentSale.vehiculo.id)) {
                              combinedVehicles.push(currentSale.vehiculo);
                            }
                          }
                          const v = combinedVehicles.find(v => v.id === val);
                          if (v && v.precioVenta) {
                            setFormData(prev => ({...prev, vehiculoId: val, precioVehiculo: formatThousands(v.precioVenta)}));
                          }
                        }}
                        options={[
                          ...vehicles,
                          ...(editingId && sales.find(s => s.id === editingId)?.vehiculo && !vehicles.find(v => v.id === sales.find(s => s.id === editingId)?.vehiculo.id) 
                            ? [sales.find(s => s.id === editingId)?.vehiculo] 
                            : [])
                        ].map(v => ({ 
                          value: v.id, 
                          label: `[${v.tipo || "AUTO"}] ${v.marca} ${v.modelo} | ${v.anio || "-"} | ${v.color || "-"} | Dom: ${v.dominio || "S/D"} ($${v.precioVenta})` 
                        }))}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-zinc-300">Precio del Vehículo Acordado</label>
                      <Input required type="text" className="bg-[#111] border-[#333] text-lg text-yellow-500 font-semibold" value={formData.precioVehiculo} onChange={e => handleAmountChange("precioVehiculo", e.target.value)} />
                    </div>
                    
                    <div className="space-y-2 col-span-2 mt-4">
                      <label className="text-sm font-medium text-zinc-300">String Forma de Pago (Editable)</label>
                      <Input required className="bg-[#111] border-[#333]" value={formData.formaPago} onChange={e => { const val = e.target.value; setFormData(prev => ({...prev, formaPago: val})); }} />
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Formas de Pago y Resumen */}
                <div className="space-y-6">
                  <div className="space-y-4 border border-[#333] p-4 rounded-lg bg-[#111]/50">
                    <h3 className="text-sm font-medium text-zinc-300 mb-2">Composición del Pago</h3>
                    
                    {/* EFECTIVO */}
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="chk-efectivo" checked={formData.hasEfectivo} onCheckedChange={(c) => setFormData({...formData, hasEfectivo: !!c})} className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" />
                        <Label htmlFor="chk-efectivo" className="text-zinc-300 cursor-pointer">Efectivo</Label>
                      </div>
                      {formData.hasEfectivo && (
                        <div className="pl-6 space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-zinc-400">Pago Inicial Pactado</Label>
                            <Input type="text" className="bg-[#0a0a0a] border-[#333]" placeholder="0" value={formData.efectivo} onChange={e => handleAmountChange("efectivo", e.target.value)} />
                          </div>
                          {!editingId && (
                            <div className="space-y-3 pt-2 border-t border-[#222]">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="chk-pago-cobrado-total" 
                                  checked={formData.pagoInicialCobradoTotalmente} 
                                  onCheckedChange={(c) => setFormData({...formData, pagoInicialCobradoTotalmente: !!c})} 
                                  className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" 
                                />
                                <Label htmlFor="chk-pago-cobrado-total" className="text-xs text-zinc-300 cursor-pointer">Cobrado totalmente en el acto</Label>
                              </div>
                              {!formData.pagoInicialCobradoTotalmente && (
                                <div className="space-y-1 pl-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <Label className="text-xs text-zinc-400">Monto Cobrado en el Acto</Label>
                                  <Input type="text" className="bg-[#0a0a0a] border-[#333]" placeholder="0" value={formData.efectivoCobradoEnActo} onChange={e => handleAmountChange("efectivoCobradoEnActo", e.target.value)} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CREDITO */}
                    <div className="flex flex-col space-y-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="chk-credito" checked={formData.hasCredito} onCheckedChange={(c) => setFormData({...formData, hasCredito: !!c})} className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" />
                        <Label htmlFor="chk-credito" className="text-zinc-300 cursor-pointer">Crédito</Label>
                      </div>
                      {formData.hasCredito && (
                        <div className="pl-6 grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-xs text-zinc-500">Monto del Crédito</Label>
                            <Input type="text" className="bg-[#0a0a0a] border-[#333]" placeholder="0" value={formData.credito} onChange={e => handleAmountChange("credito", e.target.value)} />
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-xs text-zinc-500">% Quebranto</Label>
                            <Input type="number" className="bg-[#0a0a0a] border-[#333]" placeholder="10" value={formData.porcentajeQuebranto} onChange={e => setFormData({...formData, porcentajeQuebranto: e.target.value})} />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label className="text-xs text-zinc-500">Costo de Quebranto Calculado (+21% IVA)</Label>
                            <Input readOnly type="text" className="bg-[#222] border-[#444] text-zinc-400" value={formData.quebranto} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AUTO PARTE DE PAGO */}
                    <div className="flex flex-col space-y-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="chk-auto" checked={formData.hasAuto} onCheckedChange={(c) => setFormData({...formData, hasAuto: !!c})} className="border-zinc-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black" />
                        <Label htmlFor="chk-auto" className="text-zinc-300 cursor-pointer">Auto en Parte de Pago</Label>
                      </div>
                      {formData.hasAuto && (
                        <div className="pl-6 grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-xs text-zinc-500">Valor Reconocido</Label>
                            <Input type="text" className="bg-[#0a0a0a] border-[#333]" placeholder="0" value={formData.autoPartePago} onChange={e => handleAmountChange("autoPartePago", e.target.value)} />
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="text-xs text-zinc-500">Detalles</Label>
                            <Input className="bg-[#0a0a0a] border-[#333]" placeholder="Ej: VW Gol Trend" value={formData.detalleAutoPartePago} onChange={e => setFormData({...formData, detalleAutoPartePago: e.target.value})} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GASTOS ADICIONALES */}
                  <div className="space-y-4 border border-[#333] p-4 rounded-lg bg-[#111]/50">
                    <h3 className="text-sm font-medium text-zinc-300 mb-2">Gastos Adicionales</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Patente</Label>
                        <Input type="text" className="bg-[#0a0a0a] border-[#333] text-sm" placeholder="0" value={formData.gastosPatente} onChange={e => handleAmountChange("gastosPatente", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Transferencia</Label>
                        <Input type="text" className="bg-[#0a0a0a] border-[#333] text-sm" placeholder="0" value={formData.gastosTransferencia} onChange={e => handleAmountChange("gastosTransferencia", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Prendarios</Label>
                        <Input type="text" className="bg-[#0a0a0a] border-[#333] text-sm" placeholder="0" value={formData.gastosPrendarios} onChange={e => handleAmountChange("gastosPrendarios", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Total a Pagar</label>
                      <Input required readOnly type="text" className="bg-[#222] border-[#333] text-lg text-yellow-500 font-semibold" value={formData.total} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Saldo Pendiente</label>
                      <Input required readOnly type="text" className="bg-[#222] border-[#333] text-lg text-red-400 font-semibold" value={formData.saldoPendiente} />
                    </div>
                  </div>
                </div>

              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-8 py-6 text-lg font-bold">
                {loading ? "Procesando..." : (editingId ? "Actualizar Venta" : "Confirmar Venta")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por cliente, vehículo, forma de pago o Nº comprobante..." 
          className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Fecha</TableHead>
              <TableHead className="text-zinc-400">Cliente</TableHead>
              <TableHead className="text-zinc-400">Vehículo</TableHead>
              <TableHead className="text-zinc-400">Forma Pago</TableHead>
              <TableHead className="text-zinc-400">Nº Comp.</TableHead>
              <TableHead className="text-zinc-400">Estado</TableHead>
              <TableHead className="text-zinc-400 text-right">Total</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.filter(s => {
              const innerIds = [
                ...(s.pagos?.map((p: any) => p.comprobante || p.id.slice(-6).toUpperCase()) || []),
                ...(s.cuotas?.map((cu: any) => cu.comprobante || cu.id.slice(-6).toUpperCase()) || [])
              ].join(" ");
              return `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago} ${s.comprobante || s.id.slice(-6).toUpperCase()} ${innerIds}`.toLowerCase().includes(searchTerm.toLowerCase());
            }).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              sales.filter(s => {
                const innerIds = [
                  ...(s.pagos?.map((p: any) => p.comprobante || p.id.slice(-6).toUpperCase()) || []),
                  ...(s.cuotas?.map((cu: any) => cu.comprobante || cu.id.slice(-6).toUpperCase()) || [])
                ].join(" ");
                return `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago} ${s.comprobante || s.id.slice(-6).toUpperCase()} ${innerIds}`.toLowerCase().includes(searchTerm.toLowerCase());
              }).map((s) => (
                <TableRow key={s.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="text-zinc-300">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-white">{s.cliente?.nombreCompleto}</TableCell>
                  <TableCell className="text-zinc-300">{s.vehiculo?.marca} {s.vehiculo?.modelo}</TableCell>
                  <TableCell className="text-zinc-300">{s.formaPago}</TableCell>
                  <TableCell className="text-yellow-500 font-mono text-xs">{s.comprobante || s.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>
                    {s.confirmado ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border text-green-400 border-green-500/30 bg-green-500/10">
                        Pagado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border text-yellow-400 border-yellow-500/30 bg-yellow-500/10">
                        A Confirmar
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold">${s.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.confirmado ? (
                        <button onClick={() => handleDownloadPDF(s)} className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors" title="Descargar Comprobante">
                          <FileText className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleConfirmSale(s)} className="p-1.5 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors" title="Confirmar Pago y Descargar Comprobante">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <Link href={`/dashboard/sales/${s.id}/payments`} className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors" title="Gestión de Pagos y Cuotas">
                        <Wallet className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleEdit(s)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
