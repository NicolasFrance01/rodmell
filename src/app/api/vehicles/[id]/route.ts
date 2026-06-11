/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const id = params.id;

    // Remove any fields that aren't part of Vehiculo update
    const { id: _, createdAt, updatedAt, ...updateData } = body;

    const vehicle = await prisma.vehiculo.update({
      where: { id },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_VEHICLE",
        details: `Actualizó vehículo: ${vehicle.marca} ${vehicle.modelo} (${vehicle.dominio})`
      }
    });

    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = params.id;

    // Check if it has sales
    const sales = await prisma.operacion.count({ where: { vehiculoId: id } });
    if (sales > 0) {
      return NextResponse.json({ error: "No se puede eliminar porque tiene ventas asociadas" }, { status: 400 });
    }

    const vehicle = await prisma.vehiculo.delete({
      where: { id }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_VEHICLE",
        details: `Eliminó vehículo: ${vehicle.marca} ${vehicle.modelo} (${vehicle.dominio})`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
