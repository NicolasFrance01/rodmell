"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  BadgeDollarSign,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vehículos", href: "/dashboard/vehicles", icon: Car },
  { name: "Clientes", href: "/dashboard/customers", icon: Users },
  { name: "Ventas", href: "/dashboard/sales", icon: BadgeDollarSign },
  { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-[#0a0a0a] border-r border-[#222]">
      <div className="flex h-24 items-center justify-center px-4 border-b border-[#222] bg-gradient-to-b from-[#111] to-[#0a0a0a]">
        <Image src="/logo.png" alt="Rodmell Logo" width={180} height={70} className="object-contain" priority />
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
                  ? "bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-500 border-l-4 border-yellow-500"
                  : "text-zinc-400 hover:bg-[#111] hover:text-white border-l-4 border-transparent"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#222]">
        <div className="rounded-lg bg-[#111] border border-[#222] p-4">
          <p className="text-xs font-semibold text-white mb-1">Rodmell Automotores</p>
          <p className="text-[10px] text-zinc-500">SaaS Versión 1.0</p>
        </div>
      </div>
    </div>
  );
}
