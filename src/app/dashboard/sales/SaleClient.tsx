"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeDollarSign, Plus, Search, Trash2, Edit, Wallet } from "lucide-react";
import Link from "next/link";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SaleClient({ sales, vehicles, customers, session }: { sales: any[], vehicles: any[], customers: any[], session: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    clienteId: "",
    vehiculoId: "",
    precioVehiculo: "",
    formaPago: "",
    total: "",
    saldoPendiente: "0",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      clienteId: s.clienteId,
      vehiculoId: s.vehiculoId,
      precioVehiculo: s.precioVehiculo.toString(),
      formaPago: s.formaPago || "",
      total: s.total.toString(),
      saldoPendiente: s.saldoPendiente.toString(),
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
        ...formData,
        vendedorId: session?.user?.id || "cl123", // Replace with actual session user id
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
        setFormData({ clienteId: "", vehiculoId: "", precioVehiculo: "", formaPago: "", total: "", saldoPendiente: "0" });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
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
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nueva Operación
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Venta" : "Registrar Venta"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingId ? "Modificá los detalles de la operación." : "Seleccioná el cliente, el vehículo y los detalles de pago."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Cliente</label>
                  <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={formData.clienteId} onChange={e => setFormData({...formData, clienteId: e.target.value})}>
                    <option value="">Seleccione un cliente...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.nombreCompleto} (DNI: {c.dni})</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Vehículo</label>
                  <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white" value={formData.vehiculoId} onChange={e => setFormData({...formData, vehiculoId: e.target.value})}>
                    <option value="">Seleccione un vehículo disponible...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.dominio} (${v.precioVenta})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Precio Acordado</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.precioVehiculo} onChange={e => setFormData({...formData, precioVehiculo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Forma de Pago</label>
                  <Input required className="bg-[#111] border-[#333]" placeholder="Ej: Efectivo + Transferencia" value={formData.formaPago} onChange={e => setFormData({...formData, formaPago: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Total a Pagar</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.total} onChange={e => setFormData({...formData, total: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Saldo Pendiente</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.saldoPendiente} onChange={e => setFormData({...formData, saldoPendiente: e.target.value})} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                {loading ? "Procesando..." : (editingId ? "Actualizar Venta" : "Confirmar Venta")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por cliente, vehículo o forma de pago..." 
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
              <TableHead className="text-zinc-400 text-right">Total</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.filter(s => 
              `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago}`.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              sales.filter(s => 
                `${s.cliente?.nombreCompleto} ${s.vehiculo?.marca} ${s.vehiculo?.modelo} ${s.formaPago}`.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((s) => (
                <TableRow key={s.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="text-zinc-300">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-white">{s.cliente?.nombreCompleto}</TableCell>
                  <TableCell className="text-zinc-300">{s.vehiculo?.marca} {s.vehiculo?.modelo}</TableCell>
                  <TableCell className="text-zinc-300">{s.formaPago}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold">${s.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
