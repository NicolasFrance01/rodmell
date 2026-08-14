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

    const servicio = await prisma.servicio.update({
      where: { id },
      data: {
        tipo: body.tipo,
        descripcion: body.descripcion,
        monto: body.monto !== undefined ? Number(body.monto) : undefined,
        pagado: body.pagado,
        observaciones: body.observaciones,
        ...(body.clienteId  && { cliente:  { connect: { id: body.clienteId  } } }),
        ...(body.operacionId && { operacion: { connect: { id: body.operacionId } } }),
      },
      include: { cliente: true, operacion: { include: { vehiculo: true } } },
    });

    return NextResponse.json(servicio);
  } catch (error: any) {
    console.error("Error updating service:", error);
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
    await prisma.servicio.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
