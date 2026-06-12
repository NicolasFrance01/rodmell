/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

    const { id } = await params;
    const body = await req.json();
    const { estado } = body;

    const cuota = await prisma.cuota.update({
      where: { id },
      data: { estado }
    });

    // If it's marked as PAGADA, we should decrement the saldoPendiente from Operacion
    if (estado === "PAGADA") {
      await prisma.operacion.update({
        where: { id: cuota.operacionId },
        data: {
          saldoPendiente: { decrement: cuota.valor }
        }
      });
    }

    return NextResponse.json(cuota);
  } catch (error: any) {
    console.error("Error updating installment:", error);
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

    const cuota = await prisma.cuota.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting installment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
