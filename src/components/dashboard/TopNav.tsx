"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import Link from "next/link";

export function TopNav() {
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name.substring(0, 2).toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#222] bg-[#0a0a0a]/90 px-4 shadow-sm backdrop-blur md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Sheet>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-[#111] hover:text-white h-10 w-10 text-zinc-400">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[#0a0a0a] border-r border-[#222]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-9 w-9 border border-yellow-500/50 bg-[#111] transition-opacity hover:opacity-80">
              <AvatarFallback className="bg-yellow-500 text-black text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-[#222] text-zinc-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">
                  {session?.user?.name || "Usuario"}
                </p>
                <p className="text-xs leading-none text-zinc-400">
                  Rol: {(session?.user as { role?: string })?.role || "ADMIN"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#222]" />
            <DropdownMenuItem asChild>
              <Link 
                href="/dashboard/settings" 
                className="cursor-pointer hover:bg-[#111] hover:text-white focus:bg-[#111] focus:text-white w-full flex items-center"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#222]" />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 hover:bg-[#111] hover:text-red-400 focus:bg-[#111] focus:text-red-400"
              onSelect={(e) => {
                e.preventDefault();
                signOut({ callbackUrl: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
