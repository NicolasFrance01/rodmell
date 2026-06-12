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

    const body = await req.json();
    const { id } = await params;

    const { id: _, createdAt, updatedAt, cliente, vehiculo, ...updateData } = body;

    // Convert strings to floats where necessary
    if (updateData.precioVehiculo) updateData.precioVehiculo = parseFloat(updateData.precioVehiculo);
    if (updateData.total) updateData.total = parseFloat(updateData.total);
    if (updateData.saldoPendiente) updateData.saldoPendiente = parseFloat(updateData.saldoPendiente);

    const sale = await prisma.operacion.update({
      where: { id },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "UPDATE_SALE",
        details: `Actualizó venta ID: ${sale.id}`
      }
    });

    return NextResponse.json(sale);
  } catch (error: any) {
    console.error("Error updating sale:", error);
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

    // Delete sale
    const sale = await prisma.operacion.delete({
      where: { id },
      include: { vehiculo: true, cliente: true }
    });

    await prisma.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "DELETE_SALE",
        details: `Eliminó venta de ${sale.vehiculo.marca} ${sale.vehiculo.modelo} a ${sale.cliente.nombreCompleto}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting sale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
