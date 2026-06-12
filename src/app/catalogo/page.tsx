import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import prisma from "@/lib/prisma";
import CatalogoClient from "./CatalogoClient";

export const dynamic = 'force-dynamic';

export default async function CatalogoPage() {
  const vehiclesData = await prisma.vehiculo.findMany({
    where: { estado: "DISPONIBLE" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <PublicHeader />
      <CatalogoClient vehiclesData={vehiclesData} />
      <PublicFooter />
    </div>
  );
}
