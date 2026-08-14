/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;
    const { type, ...data } = body;

    if (type === "cuota-historica") {
      // Actualizar cuota de crédito histórico
      const cuota = await prisma.cuotaHistorica.update({
        where: { id },
        data: {
          estado: data.estado,
          fechaPago: data.fechaPago ? new Date(data.fechaPago) : null,
          montoPagado: data.montoPagado ? Number(data.montoPagado) : null,
        },
      });
      return NextResponse.json(cuota);
    }

    if (type === "credito-historico") {
      // Actualizar datos del crédito histórico
      const credito = await prisma.creditoHistorico.update({
        where: { id },
        data: {
          descripcion: data.descripcion,
          observaciones: data.observaciones,
          intereses: data.intereses !== undefined ? Number(data.intereses) : undefined,
        },
        include: { cliente: true, cuotas: true },
      });
      return NextResponse.json(credito);
    }

    return NextResponse.json({ error: "Tipo no válido" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating credit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Borrar cuotas históricas primero, luego el crédito
    await prisma.cuotaHistorica.deleteMany({ where: { creditoId: id } });
    const credito = await prisma.creditoHistorico.delete({
      where: { id },
      include: { cliente: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "DELETE_CREDITO_HISTORICO",
        details: `Eliminó crédito histórico de ${credito.cliente.nombreCompleto}: ${credito.descripcion}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting credit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
