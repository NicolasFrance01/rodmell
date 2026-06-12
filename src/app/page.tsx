import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Gem, Gauge, MessageCircle, Flag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/10 via-black to-black -z-10" />
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
              El Estándar <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Premium</span>
              <br /> en Automotores
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              Bienvenido a Rodmell Automotores. Unidades seleccionadas de alta gama con garantía de confianza y excelencia.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link href="/catalogo" className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 rounded-full transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2">
                Explorar Catálogo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contacto" className="w-full md:w-auto bg-[#111] hover:bg-[#222] border border-[#333] text-white font-bold py-4 px-8 rounded-full transition-all">
                Contactar Asesor
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-[#111]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Por qué elegir Rodmell</h2>
              <p className="text-zinc-400">Nuestra reputación se basa en tres pilares fundamentales.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-2xl text-center hover:border-yellow-500/50 transition-colors">
                <div className="w-16 h-16 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Seguridad Total</h3>
                <p className="text-zinc-400 text-sm">
                  Todos nuestros vehículos pasan por un riguroso control de 150 puntos antes de ingresar a nuestro catálogo.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-2xl text-center hover:border-yellow-500/50 transition-colors">
                <div className="w-16 h-16 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gem className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Selección Premium</h3>
                <p className="text-zinc-400 text-sm">
                  Nos especializamos en unidades de alta gama, ediciones limitadas y vehículos de colección en estado impecable.
                </p>
              </div>

              <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-2xl text-center hover:border-yellow-500/50 transition-colors">
                <div className="w-16 h-16 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gauge className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Performance</h3>
                <p className="text-zinc-400 text-sm">
                  Garantizamos que el rendimiento de su próximo vehículo sea exactamente igual que el día que salió de fábrica.
                </p>
              </div>
            </div>
            
            {/* Redes y Contacto (Boxes) */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center justify-center p-8 bg-[#050505] border border-[#222] rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(234,179,8,0.05)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-pan_3s_linear_infinite]" />
                <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2 uppercase tracking-widest text-zinc-300">
                  <Flag className="w-5 h-5 text-yellow-500" />
                  Conectá en Boxes
                  <Flag className="w-5 h-5 text-yellow-500" />
                </h3>
                <div className="flex items-center gap-6 relative z-10">
                  <a href="https://wa.me/5493513843463" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-black rounded-full hover:scale-110 hover:-rotate-12 transition-all duration-300 shadow-[0_0_15px_rgba(37,211,102,0.3)]">
                    <MessageCircle className="w-7 h-7" />
                  </a>
                  <a href="https://www.instagram.com/rodmellautomotores?igsh=MWRteGdiazhndHVteA==" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-full hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-[0_0_15px_rgba(220,39,67,0.3)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
