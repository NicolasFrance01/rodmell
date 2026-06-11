"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Usuario o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-600/10 via-black to-black z-0" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-30" />
      
      <Card className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-md text-white border-[#222] shadow-2xl shadow-yellow-500/5 relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex justify-center mb-6 mt-2">
            <Image src="/logo.png" alt="Rodmell Logo" width={180} height={60} className="object-contain" priority />
          </div>
          <CardTitle className="text-2xl text-center font-bold tracking-tight">Acceso Exclusivo</CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Ingresá tus credenciales para acceder a la gestión SaaS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Usuario</Label>
              <Input
                id="username"
                placeholder="Ingresá tu usuario"
                className="bg-[#111] border-[#333] text-white focus-visible:ring-yellow-500 h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-[#111] border-[#333] text-white focus-visible:ring-yellow-500 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold h-11 transition-colors mt-2"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Ingresar al Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-10 flex flex-col items-center opacity-30">
        <Car className="h-6 w-6 text-yellow-500 mb-2" />
        <span className="text-xs text-zinc-500 tracking-widest uppercase">Rodmell Automotores</span>
      </div>
    </div>
  );
}
