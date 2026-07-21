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
    if (updateData.precioVehiculo !== undefined) updateData.precioVehiculo = parseFloat(updateData.precioVehiculo);
    if (updateData.total !== undefined) updateData.total = parseFloat(updateData.total);
    
    if (updateData.efectivo !== undefined && updateData.efectivo !== null) updateData.efectivo = parseFloat(updateData.efectivo);
    if (updateData.credito !== undefined && updateData.credito !== null) updateData.credito = parseFloat(updateData.credito);
    if (updateData.porcentajeQuebranto !== undefined && updateData.porcentajeQuebranto !== null) updateData.porcentajeQuebranto = parseFloat(updateData.porcentajeQuebranto);
    if (updateData.quebranto !== undefined && updateData.quebranto !== null) updateData.quebranto = parseFloat(updateData.quebranto);
    if (updateData.autoPartePago !== undefined && updateData.autoPartePago !== null) updateData.autoPartePago = parseFloat(updateData.autoPartePago);
    if (updateData.gastosPatente !== undefined && updateData.gastosPatente !== null) updateData.gastosPatente = parseFloat(updateData.gastosPatente);
    if (updateData.gastosTransferencia !== undefined && updateData.gastosTransferencia !== null) updateData.gastosTransferencia = parseFloat(updateData.gastosTransferencia);
    if (updateData.gastosPrendarios !== undefined && updateData.gastosPrendarios !== null) updateData.gastosPrendarios = parseFloat(updateData.gastosPrendarios);

    const currentSale = await prisma.operacion.findUnique({
      where: { id },
      include: { pagos: true, cuotas: true }
    });

    if (currentSale) {
      const total = updateData.total !== undefined ? updateData.total : currentSale.total;
      const autoPartePago = updateData.autoPartePago !== undefined ? updateData.autoPartePago : (currentSale.autoPartePago || 0);
      const totalPagos = currentSale.pagos.reduce((sum, p) => sum + p.importe, 0);
      const totalCuotas = currentSale.cuotas.filter(c => c.estado === "PAGADA").reduce((sum, c) => sum + c.valor, 0);
      
      updateData.saldoPendiente = total - (autoPartePago || 0) - totalPagos - totalCuotas;
    }

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

    // Delete related pagos and cuotas first to avoid foreign key constraints
    await prisma.pago.deleteMany({ where: { operacionId: id } });
    await prisma.cuota.deleteMany({ where: { operacionId: id } });

    // Delete sale
    const sale = await prisma.operacion.delete({
      where: { id },
      include: { vehiculo: true, cliente: true }
    });

    // Revert vehicle status to DISPONIBLE
    if (sale.vehiculoId) {
      await prisma.vehiculo.update({
        where: { id: sale.vehiculoId },
        data: { estado: "DISPONIBLE" }
      });
    }

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
