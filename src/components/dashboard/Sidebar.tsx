"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  BadgeDollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vehículos", href: "/dashboard/vehicles", icon: Car },
  { name: "Clientes", href: "/dashboard/customers", icon: Users },
  { name: "Ventas", href: "/dashboard/sales", icon: BadgeDollarSign },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold tracking-tight text-yellow-500">
          Rodmell
        </h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-yellow-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="rounded-lg bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400 mb-2">Rodmell Automotores</p>
          <p className="text-[10px] text-slate-500">SaaS Versión 1.0</p>
        </div>
      </div>
    </div>
  );
}
