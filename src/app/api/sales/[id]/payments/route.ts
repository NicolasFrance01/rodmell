/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all payments for a sale
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const pagos = await prisma.pago.findMany({
      where: { operacionId: id },
      orderBy: { fecha: "desc" }
    });

    return NextResponse.json(pagos);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST a new payment
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { importe, medioPago, observaciones, fecha } = body;

    const pago = await prisma.pago.create({
      data: {
        operacionId: id,
        importe: parseFloat(importe),
        medioPago: medioPago,
        observaciones: observaciones,
        fecha: new Date(fecha || new Date())
      }
    });

    // Automatically deduct from saldoPendiente
    await prisma.operacion.update({
      where: { id },
      data: {
        saldoPendiente: {
          decrement: parseFloat(importe)
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_PAYMENT",
        details: `Registró pago de $${importe} en operación ID: ${id}`
      }
    });

    return NextResponse.json(pago);
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
