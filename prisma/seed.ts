import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create an Admin User if it doesn't exist
  let admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Administrador Rodmell',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log("Admin user created.");
  }

  // Create 5 Customers
  const customer1 = await prisma.cliente.create({
    data: { nombreCompleto: 'Juan Pérez', dni: '30123456', telefono: '1145678912', email: 'juan.perez@email.com', direccion: 'Av. Cabildo 1234, CABA' }
  });
  const customer2 = await prisma.cliente.create({
    data: { nombreCompleto: 'María Gómez', dni: '35123456', telefono: '1156789123', email: 'maria.gomez@email.com', direccion: 'Av. Santa Fe 4321, CABA' }
  });
  const customer3 = await prisma.cliente.create({
    data: { nombreCompleto: 'Carlos Rodríguez', dni: '28123456', telefono: '1167891234', email: 'carlos.rod@email.com', direccion: 'Belgrano 123, Martínez' }
  });

  // Create 5 Vehicles (With real images)
  const v1 = await prisma.vehiculo.create({
    data: {
      marca: 'Audi', modelo: 'A4 2.0 TFSI', anio: 2021, dominio: 'AB123CD', color: 'Gris', kilometros: 35000, precioVenta: 45000, estado: 'DISPONIBLE',
      fotos: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80']
    }
  });
  const v2 = await prisma.vehiculo.create({
    data: {
      marca: 'BMW', modelo: 'Serie 3 330i', anio: 2022, dominio: 'AF456GH', color: 'Azul', kilometros: 15000, precioVenta: 52000, estado: 'DISPONIBLE',
      fotos: ['https://images.unsplash.com/photo-1503376760367-1b61b4fa0323?auto=format&fit=crop&q=80']
    }
  });
  const v3 = await prisma.vehiculo.create({
    data: {
      marca: 'Mercedes-Benz', modelo: 'Clase C 300', anio: 2020, dominio: 'AA789IJ', color: 'Blanco', kilometros: 42000, precioVenta: 48500, estado: 'DISPONIBLE',
      fotos: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80']
    }
  });
  const v4 = await prisma.vehiculo.create({
    data: {
      marca: 'Volkswagen', modelo: 'Taos Highline', anio: 2023, dominio: 'AG012KL', color: 'Plata', kilometros: 5000, precioVenta: 38000, estado: 'DISPONIBLE',
      fotos: ['https://images.unsplash.com/photo-1620914611591-628fcc4eb961?auto=format&fit=crop&q=80']
    }
  });

  // Create Sales (Operaciones)
  await prisma.operacion.create({
    data: {
      vendedorId: admin.id,
      vehiculoId: v1.id,
      clienteId: customer1.id,
      precioVehiculo: 45000,
      total: 45000,
      saldoPendiente: 0,
      formaPago: 'TRANSFERENCIA',
    }
  });

  await prisma.operacion.create({
    data: {
      vendedorId: admin.id,
      vehiculoId: v2.id,
      clienteId: customer2.id,
      precioVehiculo: 52000,
      total: 52000,
      saldoPendiente: 0,
      formaPago: 'EFECTIVO',
    }
  });

  // Create Activity Logs
  await prisma.activityLog.create({
    data: { userId: admin.id, action: 'CREATE_VEHICLE', details: `Ingresó Audi A4 (AB123CD)` }
  });
  await prisma.activityLog.create({
    data: { userId: admin.id, action: 'CREATE_SALE', details: `Vendió BMW Serie 3 a María Gómez` }
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
