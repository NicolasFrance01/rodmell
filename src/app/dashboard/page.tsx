import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-yellow-500">Dashboard</h1>
      <p className="text-slate-300">Bienvenido, {session?.user?.name || "Usuario"}</p>
      <p className="text-sm text-slate-500 mt-2">Rol: {(session?.user as { role?: string })?.role}</p>
    </div>
  );
}
