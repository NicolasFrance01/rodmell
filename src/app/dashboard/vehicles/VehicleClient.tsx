"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Plus, Search } from "lucide-react";
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

export default function VehicleClient({ vehicles }: { vehicles: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    anio: "",
    dominio: "",
    chasis: "",
    color: "",
    kilometros: "",
    precioVenta: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedPhotos: string[] = [];
      
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const fileData = new FormData();
          fileData.append("file", files[i]);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: fileData,
          });
          
          if (uploadRes.ok) {
            const blob = await uploadRes.json();
            uploadedPhotos.push(blob.url);
          }
        }
      }

      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, fotos: uploadedPhotos }),
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ marca: "", modelo: "", anio: "", dominio: "", chasis: "", color: "", kilometros: "", precioVenta: "" });
        setFiles(null);
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
            <Car className="h-8 w-8 text-yellow-500" />
            Vehículos
          </h1>
          <p className="text-zinc-400 mt-1">Gestioná el inventario de Rodmell Automotores.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <Plus className="w-4 h-4 mr-2" /> Agregar Vehículo
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
            <DialogHeader>
              <DialogTitle>Nuevo Vehículo</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Ingresá los datos del vehículo para agregarlo al stock.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Marca</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Modelo</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Año</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.anio} onChange={e => setFormData({...formData, anio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Patente (Dominio)</label>
                  <Input required className="bg-[#111] border-[#333]" value={formData.dominio} onChange={e => setFormData({...formData, dominio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Kilómetros</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.kilometros} onChange={e => setFormData({...formData, kilometros: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Precio de Venta</label>
                  <Input required type="number" className="bg-[#111] border-[#333]" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Color</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Chasis</label>
                  <Input className="bg-[#111] border-[#333]" value={formData.chasis} onChange={e => setFormData({...formData, chasis: e.target.value})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Galería de Imágenes</label>
                  <Input type="file" multiple accept="image/*" className="bg-[#111] border-[#333] cursor-pointer text-zinc-400 file:bg-[#222] file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2" onChange={e => setFiles(e.target.files)} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                {loading ? "Guardando..." : "Guardar Vehículo"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          placeholder="Buscar por marca, modelo o patente..." 
          className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Marca / Modelo</TableHead>
              <TableHead className="text-zinc-400">Año</TableHead>
              <TableHead className="text-zinc-400">Patente</TableHead>
              <TableHead className="text-zinc-400 text-right">Precio</TableHead>
              <TableHead className="text-zinc-400 text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.filter(v => 
              `${v.marca} ${v.modelo} ${v.dominio}`.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No hay vehículos registrados
                </TableCell>
              </TableRow>
            ) : (
              vehicles.filter(v => 
                `${v.marca} ${v.modelo} ${v.dominio}`.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((v) => (
                <TableRow key={v.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="font-medium text-white">{v.marca} {v.modelo}</TableCell>
                  <TableCell className="text-zinc-300">{v.anio}</TableCell>
                  <TableCell className="text-zinc-300 uppercase">{v.dominio}</TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold">${v.precioVenta.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="bg-[#111] border border-[#333] px-2 py-1 rounded text-xs text-zinc-300">
                      {v.estado}
                    </span>
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
