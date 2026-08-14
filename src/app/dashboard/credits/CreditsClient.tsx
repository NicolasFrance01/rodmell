"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Plus,
  Search,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
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

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  PAGADA: "text-green-400 border-green-500/30 bg-green-500/10",
  VENCIDA: "text-red-400 border-red-500/30 bg-red-500/10",
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

type EstadoFiltro = "TODOS" | "PENDIENTE" | "PAGADA" | "VENCIDA";

export default function CreditsClient({
  operacionesConCuotas,
  creditosHistoricos,
  clientes,
}: {
  operacionesConCuotas: any[];
  creditosHistoricos: any[];
  clientes: any[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<EstadoFiltro>("TODOS");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payingCuota, setPayingCuota] = useState<any>(null);

  const [form, setForm] = useState({
    clienteId: "",
    descripcion: "",
    totalFinanciado: "",
    cantidadCuotas: "",
    valorCuota: "",
    intereses: "",
    fechaInicio: "",
    observaciones: "",
  });

  // ── Derived stats ──────────────────────────────────────────────────────────
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const allCuotasSistema = operacionesConCuotas.flatMap((op: any) =>
    op.cuotas.map((c: any) => ({ ...c, _operacion: op }))
  );
  const allCuotasHistoricas = creditosHistoricos.flatMap((cr: any) =>
    cr.cuotas.map((c: any) => ({ ...c, _credito: cr }))
  );

  const totalPendiente =
    allCuotasSistema.filter((c) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0) +
    allCuotasHistoricas.filter((c) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0);

  const totalVencidas =
    allCuotasSistema.filter((c) => c.estado === "VENCIDA").length +
    allCuotasHistoricas.filter((c) => c.estado === "VENCIDA").length;

  const cobradoEsteMes =
    allCuotasSistema
      .filter((c) => c.estado === "PAGADA" && c.fechaPago && new Date(c.fechaPago) >= startOfMonth && new Date(c.fechaPago) <= endOfMonth)
      .reduce((s: number, c: any) => s + c.valor, 0) +
    allCuotasHistoricas
      .filter((c) => c.estado === "PAGADA" && c.fechaPago && new Date(c.fechaPago) >= startOfMonth && new Date(c.fechaPago) <= endOfMonth)
      .reduce((s: number, c: any) => s + (c.montoPagado || c.valor), 0);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.toLowerCase());

  const filteredOperaciones = operacionesConCuotas.filter((op: any) => {
    const hayMatch = matchesSearch(`${op.cliente?.nombreCompleto} ${op.vehiculo?.marca} ${op.vehiculo?.modelo}`);
    if (!hayMatch) return false;
    if (filtro === "TODOS") return true;
    return op.cuotas.some((c: any) => c.estado === filtro);
  });

  const filteredHistoricos = creditosHistoricos.filter((cr: any) => {
    const hayMatch = matchesSearch(`${cr.cliente?.nombreCompleto} ${cr.descripcion}`);
    if (!hayMatch) return false;
    if (filtro === "TODOS") return true;
    return cr.cuotas.some((c: any) => c.estado === filtro);
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNewCredit = () => {
    setForm({ clienteId: "", descripcion: "", totalFinanciado: "", cantidadCuotas: "", valorCuota: "", intereses: "", fechaInicio: "", observaciones: "" });
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalFinanciado: parseThousands(form.totalFinanciado),
          valorCuota: parseThousands(form.valorCuota),
          intereses: parseThousands(form.intereses) || 0,
          cantidadCuotas: parseInt(form.cantidadCuotas),
        }),
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

  const handleDeleteCredito = async (id: string) => {
    if (!confirm("¿Eliminar este crédito histórico y todas sus cuotas?")) return;
    const res = await fetch(`/api/credits/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Error al eliminar");
  };

  const handleMarkCuotaHistorica = async (cuota: any, creditoId: string) => {
    const fechaPago = new Date().toISOString().split("T")[0];
    const res = await fetch(`/api/credits/${cuota.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cuota-historica",
        estado: "PAGADA",
        fechaPago,
        montoPagado: cuota.valor,
      }),
    });
    if (res.ok) router.refresh();
    else alert("Error al marcar cuota");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-yellow-500" />
            Créditos
          </h1>
          <p className="text-zinc-400 mt-1">Seguimiento centralizado de cuotas y planes de pago.</p>
        </div>
        <Button
          onClick={handleNewCredit}
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-sm px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Cargar Crédito Histórico
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-md bg-yellow-500/10">
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Total Adeudado</p>
            <p className="text-xl font-bold text-yellow-500">${totalPendiente.toLocaleString("es-AR")}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-md bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Cuotas Vencidas</p>
            <p className="text-xl font-bold text-red-400">{totalVencidas}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 flex items-center gap-4">
          <div className="p-2 rounded-md bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Cobrado Este Mes</p>
            <p className="text-xl font-bold text-green-400">${cobradoEsteMes.toLocaleString("es-AR")}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por cliente o vehículo..."
            className="pl-10 bg-[#0a0a0a] border-[#222] text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["TODOS", "PENDIENTE", "VENCIDA", "PAGADA"] as EstadoFiltro[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors ${
                filtro === f
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "bg-transparent text-zinc-400 border-[#333] hover:border-zinc-500"
              }`}
            >
              {f === "TODOS" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Créditos del Sistema (Operaciones con Cuotas) ── */}
      {filteredOperaciones.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            Planes de Cuotas del Sistema
          </h2>
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-8" />
                  <TableHead className="text-zinc-400">Cliente</TableHead>
                  <TableHead className="text-zinc-400">Vehículo</TableHead>
                  <TableHead className="text-zinc-400 text-center">Cuotas</TableHead>
                  <TableHead className="text-zinc-400 text-right">Total Financiado</TableHead>
                  <TableHead className="text-zinc-400 text-right">Pendiente</TableHead>
                  <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperaciones.map((op: any) => {
                  const isOpen = expanded.has(op.id);
                  const cuotas = filtro === "TODOS" ? op.cuotas : op.cuotas.filter((c: any) => c.estado === filtro);
                  const pendiente = op.cuotas.filter((c: any) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0);
                  const pagadas = op.cuotas.filter((c: any) => c.estado === "PAGADA").length;
                  return (
                    <>
                      <TableRow key={op.id} className="border-[#222] hover:bg-[#111] cursor-pointer" onClick={() => toggleExpand(op.id)}>
                        <TableCell>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                        </TableCell>
                        <TableCell className="font-medium text-white">{op.cliente?.nombreCompleto}</TableCell>
                        <TableCell className="text-zinc-300">{op.vehiculo?.marca} {op.vehiculo?.modelo} {op.vehiculo?.anio}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-zinc-300 text-sm">{pagadas}/{op.cuotas.length}</span>
                        </TableCell>
                        <TableCell className="text-right text-yellow-500 font-mono">${op.credito?.toLocaleString("es-AR") ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono text-sm ${pendiente > 0 ? "text-red-400" : "text-green-400"}`}>
                            ${pendiente.toLocaleString("es-AR")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/sales/${op.id}/payments`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded transition-colors inline-block"
                            title="Ir a la billetera"
                          >
                            <Wallet className="w-4 h-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                      {isOpen && cuotas.map((c: any) => (
                        <TableRow key={c.id} className="border-[#222] bg-[#050505] hover:bg-[#0d0d0d]">
                          <TableCell />
                          <TableCell colSpan={2} className="pl-6 text-xs text-zinc-500">
                            Cuota #{c.numeroCuota} — Vence: {new Date(c.fechaVencimiento).toLocaleDateString("es-AR")}
                            {c.fechaPago && <span className="ml-2 text-green-500">Pagada: {new Date(c.fechaPago).toLocaleDateString("es-AR")}</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ESTADO_COLORS[c.estado]}`}>
                              {c.estado}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-zinc-300 font-mono text-xs">${c.valor.toLocaleString("es-AR")}</TableCell>
                          <TableCell />
                          <TableCell />
                        </TableRow>
                      ))}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Créditos Históricos ── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          Créditos Históricos Cargados Manualmente
        </h2>

        {filteredHistoricos.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center">
            <CreditCard className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No hay créditos históricos cargados todavía.</p>
            <p className="text-zinc-600 text-xs mt-1">Usá el botón &quot;Cargar Crédito Histórico&quot; para ingresar los que tenés en papel.</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-8" />
                  <TableHead className="text-zinc-400">Cliente</TableHead>
                  <TableHead className="text-zinc-400">Descripción / Vehículo</TableHead>
                  <TableHead className="text-zinc-400 text-center">Cuotas</TableHead>
                  <TableHead className="text-zinc-400 text-right">Total Financiado</TableHead>
                  <TableHead className="text-zinc-400 text-right">Pendiente</TableHead>
                  <TableHead className="text-zinc-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoricos.map((cr: any) => {
                  const isOpen = expanded.has(cr.id);
                  const cuotas = filtro === "TODOS" ? cr.cuotas : cr.cuotas.filter((c: any) => c.estado === filtro);
                  const pendiente = cr.cuotas.filter((c: any) => c.estado !== "PAGADA").reduce((s: number, c: any) => s + c.valor, 0);
                  const pagadas = cr.cuotas.filter((c: any) => c.estado === "PAGADA").length;
                  return (
                    <>
                      <TableRow key={cr.id} className="border-[#222] hover:bg-[#111] cursor-pointer" onClick={() => toggleExpand(cr.id)}>
                        <TableCell>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                        </TableCell>
                        <TableCell className="font-medium text-white">{cr.cliente?.nombreCompleto}</TableCell>
                        <TableCell className="text-zinc-300">{cr.descripcion}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-zinc-300 text-sm">{pagadas}/{cr.cuotas.length}</span>
                        </TableCell>
                        <TableCell className="text-right text-yellow-500 font-mono">${cr.totalFinanciado.toLocaleString("es-AR")}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono text-sm ${pendiente > 0 ? "text-red-400" : "text-green-400"}`}>
                            ${pendiente.toLocaleString("es-AR")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCredito(cr.id); }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Eliminar crédito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                      {isOpen && cuotas.map((c: any) => (
                        <TableRow key={c.id} className="border-[#222] bg-[#050505] hover:bg-[#0d0d0d]">
                          <TableCell />
                          <TableCell colSpan={2} className="pl-6 text-xs text-zinc-500">
                            Cuota #{c.numeroCuota} — Vence: {new Date(c.fechaVencimiento).toLocaleDateString("es-AR")}
                            {c.fechaPago && <span className="ml-2 text-green-500">Pagada: {new Date(c.fechaPago).toLocaleDateString("es-AR")}</span>}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ESTADO_COLORS[c.estado]}`}>
                              {c.estado}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-zinc-300 font-mono text-xs">${c.valor.toLocaleString("es-AR")}</TableCell>
                          <TableCell />
                          <TableCell className="text-right">
                            {c.estado !== "PAGADA" && (
                              <button
                                onClick={() => handleMarkCuotaHistorica(c, cr.id)}
                                className="px-2 py-0.5 text-xs text-green-400 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 rounded transition-colors"
                              >
                                Marcar Pagada
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Dialog Nuevo Crédito Histórico ── */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-lg rounded-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-500" /> Cargar Crédito Histórico
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Ingresá los datos de un crédito que ya tenés vigente (de antes del sistema).
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
              <Label className="text-zinc-300 text-sm">Descripción / Vehículo *</Label>
              <Input
                required
                className="bg-[#111] border-[#333]"
                placeholder="Ej: Toyota Corolla 2019, Spark, etc."
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Total Financiado *</Label>
                <Input
                  required
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.totalFinanciado}
                  onChange={(e) => setForm((p) => ({ ...p, totalFinanciado: formatThousands(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Intereses ($)</Label>
                <Input
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.intereses}
                  onChange={(e) => setForm((p) => ({ ...p, intereses: formatThousands(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Cant. de Cuotas *</Label>
                <Input
                  required
                  type="number"
                  min={1}
                  className="bg-[#111] border-[#333]"
                  placeholder="12"
                  value={form.cantidadCuotas}
                  onChange={(e) => setForm((p) => ({ ...p, cantidadCuotas: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 text-sm">Valor por Cuota *</Label>
                <Input
                  required
                  type="text"
                  className="bg-[#111] border-[#333]"
                  placeholder="0"
                  value={form.valorCuota}
                  onChange={(e) => setForm((p) => ({ ...p, valorCuota: formatThousands(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300 text-sm">Fecha de Inicio (1° cuota) *</Label>
              <Input
                required
                type="date"
                className="bg-[#111] border-[#333] text-white"
                value={form.fechaInicio}
                onChange={(e) => setForm((p) => ({ ...p, fechaInicio: e.target.value }))}
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
            <Button
              type="submit"
              disabled={loading || !form.clienteId}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-5"
            >
              {loading ? "Guardando..." : "Cargar Crédito"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
