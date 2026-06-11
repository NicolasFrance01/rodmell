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
    <div className="flex h-full w-64 flex-col bg-[#0a0a0a] border-r border-[#222]">
      <div className="flex h-16 items-center px-6 border-b border-[#222]">
        <Image src="/logo.png" alt="Rodmell Logo" width={120} height={40} className="object-contain" priority />
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
                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                  : "text-zinc-400 hover:bg-[#111] hover:text-white"
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
