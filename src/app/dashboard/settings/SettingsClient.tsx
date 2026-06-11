"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, UserPlus } from "lucide-react";
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

export default function SettingsClient({ users, logs }: { users: any[], logs: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "SELLER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ name: "", username: "", password: "", role: "SELLER" });
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Configuración</h1>
          <p className="text-zinc-400 mt-1">Gestión de usuarios y registro de actividad del sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* USERS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Usuarios del Sistema</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-[#111] border border-[#333] hover:bg-[#222] text-white font-medium">
                <UserPlus className="w-4 h-4 mr-2" /> Nuevo Usuario
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#222] text-white">
                <DialogHeader>
                  <DialogTitle>Crear Usuario</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Añadí un nuevo acceso al sistema Rodmell.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nombre Completo</label>
                    <Input required className="bg-[#111] border-[#333]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nombre de Usuario (Login)</label>
                    <Input required className="bg-[#111] border-[#333]" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Contraseña</label>
                    <Input required type="password" className="bg-[#111] border-[#333]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Rol</label>
                    <select required className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                      <option value="SELLER" className="bg-[#111] text-white">Vendedor</option>
                      <option value="ADMIN" className="bg-[#111] text-white">Administrador</option>
                      <option value="MANAGER" className="bg-[#111] text-white">Gerente</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black mt-6">
                    {loading ? "Creando..." : "Guardar Usuario"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] hover:bg-transparent">
                  <TableHead className="text-zinc-400">Usuario</TableHead>
                  <TableHead className="text-zinc-400">Rol</TableHead>
                  <TableHead className="text-zinc-400">Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-[#222] hover:bg-[#111]">
                    <TableCell className="font-medium text-white">
                      <div>{u.name}</div>
                      <div className="text-xs text-zinc-500">@{u.username}</div>
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <span className="bg-[#111] border border-[#333] px-2 py-1 rounded text-xs text-zinc-300">
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ACTIVITY LOGS SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Registro de Actividades</h2>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#222] hover:bg-transparent">
                    <TableHead className="text-zinc-400">Acción</TableHead>
                    <TableHead className="text-zinc-400">Usuario</TableHead>
                    <TableHead className="text-zinc-400">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow className="border-[#222] hover:bg-transparent">
                      <TableCell colSpan={3} className="text-center py-8 text-zinc-500">
                        No hay registros de actividad.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((l) => (
                      <TableRow key={l.id} className="border-[#222] hover:bg-[#111]">
                        <TableCell>
                          <div className="font-medium text-white text-sm">{l.action}</div>
                          <div className="text-xs text-zinc-400">{l.details}</div>
                        </TableCell>
                        <TableCell className="text-zinc-300 text-sm">{l.user?.name}</TableCell>
                        <TableCell className="text-zinc-500 text-xs">{new Date(l.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
