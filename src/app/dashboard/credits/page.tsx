import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CreditsClient from "./CreditsClient";

export const dynamic = "force-dynamic";

export default async function CreditsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const [operacionesConCuotas, creditosHistoricos, clientes] = await Promise.all([
    prisma.operacion.findMany({
      where: { cuotas: { some: {} } },
      include: {
        cliente: true,
        vehiculo: true,
        cuotas: { orderBy: { numeroCuota: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.creditoHistorico.findMany({
      include: {
        cliente: true,
        cuotas: { orderBy: { numeroCuota: "asc" } },
      },
      orderBy: { fechaInicio: "desc" },
    }),
    prisma.cliente.findMany({ orderBy: { nombreCompleto: "asc" } }),
  ]);

  return (
    <CreditsClient
      operacionesConCuotas={operacionesConCuotas}
      creditosHistoricos={creditosHistoricos}
      clientes={clientes}
    />
  );
}
