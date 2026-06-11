import Image from "next/image";
import Link from "next/link";
import { Car, Fuel, Gauge, Settings2, CalendarDays } from "lucide-react";

// Mock Data para el Catálogo
const vehicles = [
  {
    id: 1,
    make: "Audi",
    model: "A5 Sportback S-Line",
    year: 2022,
    price: 65000,
    mileage: "12.000",
    transmission: "Automática",
    fuel: "Nafta",
    image: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    make: "BMW",
    model: "X4 M Competition",
    year: 2023,
    price: 135000,
    mileage: "5.500",
    transmission: "Automática",
    fuel: "Nafta",
    image: "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    make: "Mercedes-Benz",
    model: "Clase C 300 AMG",
    year: 2021,
    price: 58000,
    mileage: "24.000",
    transmission: "Automática",
    fuel: "Nafta / Híbrido",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    make: "Porsche",
    model: "Macan GTS",
    year: 2022,
    price: 145000,
    mileage: "18.000",
    transmission: "PDK",
    fuel: "Nafta",
    image: "https://images.unsplash.com/photo-1503376712341-ea7825b4104a?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    make: "Volkswagen",
    model: "Amarok V6 Extreme",
    year: 2023,
    price: 48000,
    mileage: "0 (Km)",
    transmission: "Automática 8v",
    fuel: "Diésel",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    make: "Ford",
    model: "Mustang GT 5.0",
    year: 2020,
    price: 72000,
    mileage: "15.000",
    transmission: "Automática",
    fuel: "Nafta",
    image: "https://images.unsplash.com/photo-1584345611127-8fb37cb5b520?q=80&w=800&auto=format&fit=crop",
  },
];

export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      {/* Header Público */}
      <header className="sticky top-0 z-50 w-full border-b border-[#222] bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Rodmell Logo" width={140} height={45} className="object-contain" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Inicio</Link>
            <Link href="/catalogo" className="text-yellow-500">Catálogo</Link>
            <Link href="/nosotros" className="text-zinc-400 hover:text-white transition-colors">Nosotros</Link>
            <Link href="/contacto" className="text-zinc-400 hover:text-white transition-colors">Contacto</Link>
          </nav>
          <Link href="/login" className="text-sm font-medium bg-[#111] hover:bg-[#222] border border-[#333] px-4 py-2 rounded-md transition-all text-white">
            Portal Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/15 via-black to-black -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Descubrí tu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Vehículo</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Catálogo exclusivo de unidades premium seleccionadas rigurosamente. Calidad, diseño y potencia a tu alcance.
          </p>
          
          {/* Futuristic Search/Filter Bar */}
          <div className="max-w-4xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] rounded-full p-2 flex items-center shadow-[0_0_30px_rgba(234,179,8,0.05)]">
            <div className="flex-1 px-6 border-r border-[#222] hidden md:block">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Marca</p>
              <select className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer appearance-none">
                <option value="">Todas las marcas</option>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="mercedes">Mercedes-Benz</option>
              </select>
            </div>
            <div className="flex-1 px-6 border-r border-[#222] hidden md:block">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Precio Max</p>
              <select className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer appearance-none">
                <option value="">Sin Límite</option>
                <option value="50000">Hasta $50,000</option>
                <option value="100000">Hasta $100,000</option>
              </select>
            </div>
            <div className="px-2 w-full md:w-auto">
              <button className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="h-6 w-6 text-yellow-500" />
            Stock Disponible
          </h2>
          <span className="text-zinc-400 text-sm font-medium">{vehicles.length} vehículos encontrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((car) => (
            <div key={car.id} className="group relative bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:border-yellow-500/50 hover:shadow-[0_10px_40px_-10px_rgba(234,179,8,0.15)]">
              {/* Image Container */}
              <div className="relative h-64 w-full overflow-hidden bg-[#111]">
                <Image 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                  <span className="text-yellow-500 font-bold text-sm">{car.year}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-zinc-400 text-sm uppercase tracking-wider font-semibold mb-1">{car.make}</h3>
                    <h2 className="text-xl font-bold text-white leading-tight">{car.model}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-500">${car.price.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">USD</p>
                  </div>
                </div>

                {/* Badges/Specs */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm bg-[#111] px-3 py-2 rounded-md border border-[#222]">
                    <Gauge className="h-4 w-4 text-yellow-500/70" />
                    <span>{car.mileage} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm bg-[#111] px-3 py-2 rounded-md border border-[#222]">
                    <Settings2 className="h-4 w-4 text-yellow-500/70" />
                    <span className="truncate">{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm bg-[#111] px-3 py-2 rounded-md border border-[#222]">
                    <Fuel className="h-4 w-4 text-yellow-500/70" />
                    <span>{car.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-sm bg-[#111] px-3 py-2 rounded-md border border-[#222]">
                    <CalendarDays className="h-4 w-4 text-yellow-500/70" />
                    <span>Modelo {car.year}</span>
                  </div>
                </div>

                <button className="w-full bg-[#111] hover:bg-yellow-500 text-white hover:text-black font-semibold py-3 rounded-xl border border-[#333] hover:border-transparent transition-all">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Público */}
      <footer className="border-t border-[#222] bg-black py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <Image src="/logo.png" alt="Rodmell Logo" width={120} height={40} className="object-contain opacity-50 hover:opacity-100 transition-opacity" />
          <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} Rodmell Automotores. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
