"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Car, Fuel, Gauge, Settings2, CalendarDays, X, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function CatalogoClient({ vehiclesData }: { vehiclesData: any[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string>("");

  const defaultImages = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503376760367-1b61b4fa0323?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80"
  ];

  const handleOpenDetails = (vehiculo: any, index: number) => {
    setSelectedVehicle(vehiculo);
    setMainImage(vehiculo.fotos?.length > 0 ? vehiculo.fotos[0] : defaultImages[index % defaultImages.length]);
    setOpen(true);
  };

  const getWhatsAppLink = (v: any) => {
    const message = `¡Hola! Quiero más info sobre el ${v.marca} ${v.modelo} (Año ${v.anio}) que vi en el catálogo.`;
    return `https://wa.me/5493513843463?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/15 via-black to-black -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Descubrí tu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Vehículo</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Catálogo exclusivo de unidades premium seleccionadas rigurosamente. Calidad, diseño y potencia a tu alcance.
          </p>
          
          <div className="max-w-4xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] rounded-full p-2 flex items-center shadow-[0_0_30px_rgba(234,179,8,0.05)]">
            <div className="flex-1 px-6 border-r border-[#222] hidden md:block">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Marca</p>
              <select className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer appearance-none">
                <option value="" className="bg-[#111] text-white">Todas las marcas</option>
                <option value="audi" className="bg-[#111] text-white">Audi</option>
                <option value="bmw" className="bg-[#111] text-white">BMW</option>
                <option value="mercedes" className="bg-[#111] text-white">Mercedes-Benz</option>
              </select>
            </div>
            <div className="flex-1 px-6 border-r border-[#222] hidden md:block">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Precio Max</p>
              <select className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer appearance-none">
                <option value="" className="bg-[#111] text-white">Sin Límite</option>
                <option value="50000" className="bg-[#111] text-white">Hasta $50,000</option>
                <option value="100000" className="bg-[#111] text-white">Hasta $100,000</option>
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

      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="h-6 w-6 text-yellow-500" />
            Stock Disponible
          </h2>
          <span className="text-zinc-400 text-sm font-medium">{vehiclesData.length} vehículos encontrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehiclesData.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-zinc-500 text-xl font-medium">No hay vehículos disponibles en este momento.</p>
            </div>
          ) : (
            vehiclesData.map((vehiculo, index) => (
              <div key={vehiculo.id} className="group bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#222] hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10">
                <div className="relative h-64 overflow-hidden bg-[#111]">
                  <div className="absolute top-4 right-4 z-10">
                    {index < 2 && (
                      <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Destacado
                      </span>
                    )}
                  </div>
                  <img
                    src={(vehiculo.fotos && vehiculo.fotos.length > 0) ? vehiculo.fotos[0] : defaultImages[index % defaultImages.length]}
                    alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                </div>
                
                <div className="p-6 relative">
                  <div className="absolute -top-6 right-6 bg-[#0a0a0a] p-3 rounded-xl border border-[#222] shadow-lg">
                    <Car className="h-6 w-6 text-yellow-500" />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-yellow-500 transition-colors">
                      {vehiculo.marca} {vehiculo.modelo}
                    </h3>
                    <p className="text-zinc-400 font-medium">{vehiculo.dominio}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-yellow-500/70" />
                      <span>{vehiculo.anio}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-yellow-500/70" />
                      <span>{vehiculo.kilometros?.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-yellow-500/70" />
                      <span>Nafta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-yellow-500/70" />
                      <span>Automática</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#222] flex justify-between items-end">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Precio</p>
                      <p className="text-2xl font-bold text-white">${vehiculo.precioVenta.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleOpenDetails(vehiculo, index)} className="bg-transparent hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Popup Detalle */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0a0a0a] border-[#222] text-white w-[95vw] sm:max-w-4xl lg:max-w-5xl p-0 overflow-hidden" showCloseButton={false}>
          {selectedVehicle && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Left Column: Image Gallery */}
              <div className="w-full md:w-3/5 bg-[#050505] flex flex-col relative">
                <button onClick={() => setOpen(false)} className="absolute top-4 left-4 z-20 md:hidden bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition">
                  <X className="w-5 h-5" />
                </button>
                
                <div className="relative flex-1 min-h-[300px] md:min-h-0 bg-black flex items-center justify-center">
                  <img src={mainImage} alt="Main" className="object-contain w-full h-full max-h-[500px]" />
                </div>
                
                {selectedVehicle.fotos && selectedVehicle.fotos.length > 1 && (
                  <div className="h-24 bg-[#111] border-t border-[#222] p-2 flex gap-2 overflow-x-auto">
                    {selectedVehicle.fotos.map((foto: string, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setMainImage(foto)}
                        className={`relative w-20 h-full flex-shrink-0 rounded overflow-hidden border-2 transition-all ${mainImage === foto ? 'border-yellow-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={foto} alt={`Gallery ${i}`} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Info & CTA */}
              <div className="w-full md:w-2/5 flex flex-col h-full bg-[#0a0a0a] border-l border-[#222] overflow-y-auto">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4 hidden md:flex">
                    <DialogTitle className="sr-only">{selectedVehicle.marca} {selectedVehicle.modelo}</DialogTitle>
                    <div />
                    <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition bg-[#111] hover:bg-[#222] p-2 rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-white leading-tight">
                      {selectedVehicle.marca} <br />
                      <span className="text-yellow-500">{selectedVehicle.modelo}</span>
                    </h2>
                    <p className="text-2xl font-medium text-white mt-4 border-b border-[#222] pb-4">
                      ${selectedVehicle.precioVenta.toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-zinc-300 mb-6">
                    <div className="flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-[#222]">
                      <CalendarDays className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Año</p>
                        <p className="font-semibold text-white">{selectedVehicle.anio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-[#222]">
                      <Gauge className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Kilometraje</p>
                        <p className="font-semibold text-white">{selectedVehicle.kilometros?.toLocaleString() || 0} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-[#222]">
                      <Fuel className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Combustible</p>
                        <p className="font-semibold text-white">Nafta</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-[#111] p-3 rounded-lg border border-[#222]">
                      <Settings2 className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-xs text-zinc-500">Transmisión</p>
                        <p className="font-semibold text-white">Automática</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-white font-bold mb-2">Descripción del Vehículo</h4>
                    <DialogDescription className="text-zinc-400 text-sm leading-relaxed max-h-[150px] overflow-y-auto pr-2">
                      {selectedVehicle.descripcion || "Unidad en excelente estado. Único dueño, papeles al día, listo para transferir. Se acepta vehículo de menor valor como parte de pago."}
                    </DialogDescription>
                  </div>

                  <div className="mt-auto pt-6 border-t border-[#222]">
                    <a 
                      href={getWhatsAppLink(selectedVehicle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transform hover:-translate-y-1"
                    >
                      <Navigation className="w-5 h-5 fill-black" />
                      Consultar por WhatsApp
                    </a>
                    <p className="text-center text-xs text-zinc-500 mt-4">Respuesta inmediata por nuestros asesores.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
