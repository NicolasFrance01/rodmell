"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatThousands, parseThousands } from "@/lib/utils";

const TIPOS_SERVICIO = [
  { value: "ACCESORIO", label: "🔧 Accesorio" },
  { value: "POLARIZADO", label: "🪟 Polarizado" },
  { value: "GNC", label: "⛽ GNC" },
  { value: "ALARMA", label: "🔔 Alarma" },
  { value: "SERVICE", label: "🛠 Service" },
  { value: "OTROS", label: "📦 Otros" },
];

const TIPO_LABELS: Record<string, string> = {
  ACCESORIO: "🔧 Accesorio",
  POLARIZADO: "🪟 Polarizado",
  GNC: "⛽ GNC",
  ALARMA: "🔔 Alarma",
  SERVICE: "🛠 Service",
  OTROS: "📦 Otros",
};

function SearchableSelect({ options, value, onChange, placeholder }: any) {
  const [search, setSearch] = useState(() => {
    const found = options.find((o: any) => o.value === value);
    return found ? found.label : "";
  });
  const [open, setOpen] = useState(false);

  const handleSelect = (optionVal: string, optionLabel: string) => {
    onChange(optionVal);
    setSearch(optionLabel);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Input
          className="w-full bg-[#111] border-[#333] pr-10"
          placeholder={placeholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); if (!e.target.value) onChange(""); }}
          onClick={() => setOpen(true)}
          onBlur={() => setTimeout(() => {
            setOpen(false);
            const found = options.find((o: any) => o.value === value);
            setSearch(found ? found.label : "");
          }, 200)}
        />
        <ChevronDown className="absolute right-3 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
      {open && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-[#1a1a1a] border border-[#333] rounded-sm shadow-xl">
          {options
            .filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))
            .map((o: any) => (
              <li
                key={o.value}
                className="px-3 py-2 text-sm text-zinc-300 hover:bg-[#333] hover:text-white cursor-pointer"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(o.value, o.label); }}
              >
                {o.label}
              </li>
            ))}
          {options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">No hay resultados</li>
          )}
        </ul>
      )}
    </div>
  );
}

const emptyForm = {
  clienteId: "",
  operacionId: "",
  tipo: "ACCESORIO",
  descripcion: "",
  monto: "",
  pagado: false,
  fecha: new Date().toISOString().split("T")[0],
  observaciones: "",
};

export default function ServicesClient({
  servicios,
  clientes,
  operaciones,
}: {
  servicios: any[];
  clientes: any[];
  operaciones: any[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalFacturado = servicios.reduce((s, sv) => s + sv.monto, 0);
  const pendientePago = servicios.filter((sv) => !sv.pagado).reduce((s, sv) => s + sv.monto, 0);
  const cantPagados = servicios.filter((sv) => sv.pagado).length;

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = servicios.filter((sv) =>
    `${sv.cliente?.nombreCompleto} ${sv.tipo} ${sv.descripcion} ${sv.operacion?.vehiculo?.marca} ${sv.operacion?.vehiculo?.modelo}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, fecha: new Date().toISOString().split("T")[0] });
    setOpenDialog(true);
  };

  const handleEdit = (sv: any) => {
    setEditingId(sv.id);
    setForm({
      clienteId: sv.clienteId,
      operacionId: sv.operacionId || "",
      tipo: sv.tipo,
      descripcion: sv.descripcion,
      monto: formatThousands(sv.monto),
      pagado: sv.pagado,
      fecha: sv.fecha ? new Date(sv.fecha).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      observaciones: sv.observaciones || "",
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        monto: parseThousands(form.monto),
        operacionId: form.operacionId || null,
      };
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOpenDialog(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Error al guardar");
      }
    } catch {
      alert("Error de conexión");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Error al eliminar");
  };

  const handleTogglePagado = async (sv: any) => {
    const res = await fetch(`/api/services/${sv.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pagado: !sv.pagado }),
    });
    if (res.ok) router.refresh();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="h-8 w-8 text-yellow-500" />
            Servicios & Agregados
          </h1>
          <p className="text-zinc-400 mt-1">Accesorios, polarizados, GNC, alarmas y más.</p>
        </div>
        <Button
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-sm px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-md bg-yellow-500/10">
            <DollarSign className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Facturado</p>
            <p className="text-xl font-bold text-yellow-500">${totalFacturado.toLocaleString("es-AR")}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-md bg-red-500/10">
            <Clock className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Pendiente de Cobro</p>
            <p className="text-xl font-bold text-red-400">${pendientePago.toLocaleString("es-AR")}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-md bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Servicios Cobrados</p>
            <p className="text-xl font-bold text-green-400">{cantPagados}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Buscar por cliente, tipo, descripción..."
          className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-zinc-400">Fecha</TableHead>
              <TableHead className="text-zinc-400">Cliente</TableHead>
              <TableHead className="text-zinc-400">Tipo</TableHead>
              <TableHead className="text-zinc-400">Descripción</TableHead>
              <TableHead className="text-zinc-400">Venta Vinculada</TableHead>
              <TableHead className="text-zinc-400 text-center">Estado</TableHead>
              <TableHead className="text-zinc-400 text-right">Monto</TableHead>
              <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableCell colSpan={8} className="text-center py-10 text-zinc-500">
                  <Wrench className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sv) => (
                <TableRow key={sv.id} className="border-[#222] hover:bg-[#111]">
                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(sv.fecha).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell className="font-medium text-white">{sv.cliente?.nombreCompleto}</TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-300">{TIPO_LABELS[sv.tipo] || sv.tipo}</span>
                  </TableCell>
                  <TableCell className="text-zinc-300 max-w-xs truncate">{sv.descripcion}</TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {sv.operacion ? `${sv.operacion.vehiculo?.marca} ${sv.operacion.vehiculo?.modelo}` : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleTogglePagado(sv)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        sv.pagado
                          ? "text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
                          : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
                      }`}
                    >
                      {sv.pagado ? "Cobrado" : "Pendiente"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right text-yellow-500 font-bold font-mono">
                    ${sv.monto.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(sv)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sv.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Eliminar"
                      >
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

      {/* ── Dialog Nuevo / Editar Servicio ── */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-lg rounded-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-yellow-500" />
              {editingId ? "Editar Servicio" : "Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Registrá accesorios, servicios y agregados para un cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Cliente *</Label>
              <SearchableSelect
                placeholder="Buscá el cliente..."
                value={form.clienteId}
                onChange={(val: string) => setForm((p) => ({ ...p, clienteId: val }))}
                options={clientes.map((c: any) => ({ value: c.id, label: `${c.nombreCompleto} (DNI: ${c.dni || "-"})` }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Tipo de Servicio *</Label>
              <div className="relative">
                <select
                  required
                  className="w-full bg-[#111] border border-[#333] text-white rounded-sm px-3 py-2 text-sm appearance-none"
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                >
                  {TIPOS_SERVICIO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Descripción *</Label>
              <Input
                required
                className="bg-[#111] border-[#333]"
                placeholder="Ej: Polarizado 20%, Alarma Positron..."
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Monto *</Label>
                <Input
                  required
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.monto}
                  onChange={(e) => setForm((p) => ({ ...p, monto: formatThousands(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Fecha</Label>
                <Input
                  type="date"
                  className="bg-[#111] border-[#333] text-white"
                  value={form.fecha}
                  onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Venta Vinculada (opcional)</Label>
              <SearchableSelect
                placeholder="Vinculá a una venta existente..."
                value={form.operacionId}
                onChange={(val: string) => setForm((p) => ({ ...p, operacionId: val }))}
                options={[
                  { value: "", label: "— Sin vincular —" },
                  ...operaciones.map((op: any) => ({
                    value: op.id,
                    label: `${op.cliente?.nombreCompleto} — ${op.vehiculo?.marca} ${op.vehiculo?.modelo} (${new Date(op.createdAt).toLocaleDateString("es-AR")})`,
                  })),
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Observaciones</Label>
              <Input
                className="bg-[#111] border-[#333]"
                placeholder="Opcional..."
                value={form.observaciones}
                onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, pagado: !p.pagado }))}
                className={`w-10 h-6 rounded-full transition-colors ${form.pagado ? "bg-green-500" : "bg-zinc-700"} relative`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.pagado ? "left-5" : "left-1"}`} />
              </button>
              <Label className="text-zinc-300 text-sm cursor-pointer" onClick={() => setForm((p) => ({ ...p, pagado: !p.pagado }))}>
                {form.pagado ? "Cobrado" : "Pendiente de cobro"}
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading || !form.clienteId}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-5"
            >
              {loading ? "Guardando..." : editingId ? "Actualizar Servicio" : "Guardar Servicio"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
