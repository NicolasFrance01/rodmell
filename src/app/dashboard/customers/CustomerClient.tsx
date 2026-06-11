"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
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

export default function CustomerClient({ customers }: { customers: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    dni: "",
    cuil: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({
      nombreCompleto: c.nombreCompleto,
      dni: c.dni || "",
      cuil: c.cuil || "",
      telefono: c.telefono || "",
      email: c.email || "",
      direccion: c.direccion || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
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
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        setEditingId(null);
        setFormData({ nombreCompleto: "", dni: "", cuil: "", telefono: "", email: "", direccion: "" });
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
            <Users className="h-8 w-8 text-yellow-500" />
            Clientes
          </h1>
          <p className="text-zinc-400 mt-1">Administrá la cartera de clientes de la concesionaria.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingId ? "Modificá los datos del cliente." : "Ingresá los datos del cliente para registrarlo en el sistema."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.nombreCompleto} onChange={e => setFormData({...formData, nombreCompleto: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">DNI</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">CUIL / CUIT</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.cuil} onChange={e => setFormData({...formData, cuil: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email</label>
                  <Input type="email" className="bg-[#111] border-[#333]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Dirección</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                {loading ? "Guardando..." : (editingId ? "Actualizar Cliente" : "Guardar Cliente")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por nombre, DNI, teléfono o email..." 
          className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Nombre Completo</TableHead>
              <TableHead className="text-zinc-400">DNI</TableHead>
              <TableHead className="text-zinc-400">Teléfono</TableHead>
              <TableHead className="text-zinc-400">Email</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.filter(c => 
              `${c.nombreCompleto} ${c.dni} ${c.telefono} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No hay clientes registrados
                </TableCell>
              </TableRow>
            ) : (
              customers.filter(c => 
                `${c.nombreCompleto} ${c.dni} ${c.telefono} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((c) => (
                <TableRow key={c.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="font-medium text-white">{c.nombreCompleto}</TableCell>
                  <TableCell className="text-zinc-300">{c.dni}</TableCell>
                  <TableCell className="text-zinc-300">{c.telefono}</TableCell>
                  <TableCell className="text-zinc-300">{c.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
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
