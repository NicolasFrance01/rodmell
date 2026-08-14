/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const servicios = await prisma.servicio.findMany({
      include: {
        cliente: true,
        operacion: {
          include: { vehiculo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(servicios);
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { clienteId, operacionId, tipo, descripcion, monto, pagado, fecha, observaciones } = body;

    if (!clienteId || !tipo || !descripcion || !monto) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const servicio = await prisma.servicio.create({
      data: {
        clienteId,
        operacionId: operacionId || null,
        tipo,
        descripcion,
        monto: Number(monto),
        pagado: pagado || false,
        fecha: fecha ? new Date(fecha) : new Date(),
        observaciones: observaciones || null,
      },
      include: { cliente: true, operacion: { include: { vehiculo: true } } },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_SERVICIO",
        details: `Registró servicio "${tipo}" para ${servicio.cliente.nombreCompleto}: ${descripcion}`,
      },
    });

    return NextResponse.json(servicio, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
