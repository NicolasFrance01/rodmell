"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const userInitials = session?.user?.name
    ? session.user.name.substring(0, 2).toUpperCase()
    : "AD";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#222] bg-black px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Sheet>
          <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-[#111] hover:text-white h-10 w-10 text-zinc-400">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-black border-r border-[#222]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 items-center justify-end">
        <div className="relative" ref={profileRef}>
          <button 
            className="focus:outline-none transition-transform hover:scale-105"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <Avatar className="h-9 w-9 border border-yellow-500/50 bg-[#111] transition-opacity hover:opacity-80">
              <AvatarFallback className="bg-yellow-500 text-black text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#0a0a0a] border border-[#222] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-[#222]">
                <p className="text-sm font-medium leading-none text-white">
                  {session?.user?.name || "Usuario"}
                </p>
                <p className="text-xs leading-none text-zinc-400 mt-1">
                  Rol: {(session?.user as { role?: string })?.role || "ADMIN"}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-zinc-200 hover:bg-[#111] hover:text-white transition-colors"
                >
                  <UserIcon className="mr-3 h-4 w-4 text-zinc-400" />
                  Mi Perfil
                </button>
              </div>
              <div className="py-1 border-t border-[#222]">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 hover:bg-[#111] hover:text-red-400 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-500" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
