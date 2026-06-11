/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = params.id;

    // Delete sale
    const sale = await prisma.operacion.delete({
      where: { id },
      include: { vehiculo: true, cliente: true }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
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
