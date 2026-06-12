import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehiculo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vehicles);
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const vehicle = await prisma.vehiculo.create({
      data: {
        marca: body.marca,
        modelo: body.modelo,
        anio: parseInt(body.anio),
        dominio: body.dominio,
        chasis: body.chasis,
        color: body.color,
        kilometros: parseInt(body.kilometros),
        precioVenta: parseFloat(body.precioVenta),
        estado: body.estado || "DISPONIBLE",
        descripcion: body.descripcion || null,
        fotos: body.fotos || [],
      },
    });
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
