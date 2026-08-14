/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Operaciones con cuotas (créditos del sistema)
    const operacionesConCuotas = await prisma.operacion.findMany({
      where: { cuotas: { some: {} } },
      include: {
        cliente: true,
        vehiculo: true,
        cuotas: { orderBy: { numeroCuota: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Créditos históricos cargados manualmente
    const creditosHistoricos = await prisma.creditoHistorico.findMany({
      include: {
        cliente: true,
        cuotas: { orderBy: { numeroCuota: "asc" } },
      },
      orderBy: { fechaInicio: "desc" },
    });

    return NextResponse.json({ operacionesConCuotas, creditosHistoricos });
  } catch (error: any) {
    console.error("Error fetching credits:", error);
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
    const {
      clienteId,
      descripcion,
      totalFinanciado,
      cantidadCuotas,
      valorCuota,
      intereses,
      fechaInicio,
      observaciones,
    } = body;

    if (!clienteId || !descripcion || !totalFinanciado || !cantidadCuotas || !valorCuota || !fechaInicio) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const inicio = new Date(fechaInicio);

    // Generar cuotas automáticamente
    const cuotasData = Array.from({ length: Number(cantidadCuotas) }, (_, i) => ({
      numeroCuota: i + 1,
      valor: Number(valorCuota),
      fechaVencimiento: addMonths(inicio, i),
      estado: "PENDIENTE" as const,
    }));

    const credito = await prisma.creditoHistorico.create({
      data: {
        clienteId,
        descripcion,
        totalFinanciado: Number(totalFinanciado),
        cantidadCuotas: Number(cantidadCuotas),
        valorCuota: Number(valorCuota),
        intereses: intereses ? Number(intereses) : 0,
        fechaInicio: inicio,
        observaciones: observaciones || null,
        cuotas: { createMany: { data: cuotasData } },
      },
      include: { cliente: true, cuotas: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATE_CREDITO_HISTORICO",
        details: `Cargó crédito histórico para ${credito.cliente.nombreCompleto}: ${descripcion}`,
      },
    });

    return NextResponse.json(credito, { status: 201 });
  } catch (error: any) {
    console.error("Error creating credit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
