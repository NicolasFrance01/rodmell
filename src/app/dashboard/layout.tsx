import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

// Define which roles can access which routes
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard":           ["ADMIN", "MANAGER"],
  "/dashboard/vehicles":  ["SELLER", "ADMIN", "MANAGER"],
  "/dashboard/customers": ["SELLER", "ADMIN", "MANAGER"],
  "/dashboard/sales":     ["SELLER", "ADMIN", "MANAGER"],
  "/dashboard/credits":   ["SELLER", "ADMIN", "MANAGER"],
  "/dashboard/services":  ["SELLER", "ADMIN", "MANAGER"],
  "/dashboard/reports":   ["ADMIN", "MANAGER"],
  "/dashboard/settings":  ["MANAGER"],
};

function getFirstAllowedRoute(role: string): string {
  if (role === "SELLER") return "/dashboard/vehicles";
  if (role === "ADMIN")  return "/dashboard";
  return "/dashboard";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col md:pl-64 h-full relative">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute inset-0 bg-yellow-500/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/10 via-black to-black -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}

// Export for use in individual pages that need route-level protection
export { ROUTE_PERMISSIONS, getFirstAllowedRoute };
