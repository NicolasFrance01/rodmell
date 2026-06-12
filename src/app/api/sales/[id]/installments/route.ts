/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all installments for a sale
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const cuotas = await prisma.cuota.findMany({
      where: { operacionId: id },
      orderBy: { numeroCuota: "asc" }
    });

    return NextResponse.json(cuotas);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST mass generate installments
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { cantidad, valor, fechaInicio } = body;

    const startDate = new Date(fechaInicio || new Date());
    const cuotasToCreate = [];

    for (let i = 1; i <= cantidad; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (i - 1));
      
      cuotasToCreate.push({
        operacionId: id,
        numeroCuota: i,
        valor: parseFloat(valor),
        fechaVencimiento: dueDate,
        estado: "PENDIENTE" as const
      });
    }

    // First delete any existing pending installments to regenerate, or just append?
    // Let's assume this generates the definitive plan and deletes previous ones? 
    // It's safer to just create them. If they want to reset, they have to delete individually or we provide a clear endpoint.
    // For now, we just append.
    
    await prisma.cuota.createMany({
      data: cuotasToCreate
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "GENERATE_INSTALLMENTS",
        details: `Generó plan de ${cantidad} cuotas para operación ID: ${id}`
      }
    });

    return NextResponse.json({ success: true, count: cantidad });
  } catch (error: any) {
    console.error("Error creating installments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
