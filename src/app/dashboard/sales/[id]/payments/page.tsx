import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PaymentClient from "./PaymentClient";

export default async function PaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const sale = await prisma.operacion.findUnique({
    where: { id },
    include: {
      cliente: true,
      vehiculo: true,
      pagos: { orderBy: { fecha: "desc" } },
      cuotas: { orderBy: { numeroCuota: "asc" } },
    }
  });

  if (!sale) {
    return <div className="text-white p-8">Venta no encontrada.</div>;
  }

  // Calculate totals
  const totalPagadoSuelto = sale.pagos.reduce((acc, p) => acc + p.importe, 0);
  const totalCuotasPagadas = sale.cuotas.filter(c => c.estado === "PAGADA").reduce((acc, c) => acc + c.valor, 0);
  const totalRecaudado = totalPagadoSuelto + totalCuotasPagadas;

  return (
    <PaymentClient 
      sale={sale} 
      totalRecaudado={totalRecaudado} 
    />
  );
}
