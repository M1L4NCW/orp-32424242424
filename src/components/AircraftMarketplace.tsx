import React from "react";
import { SlidersHorizontal, Check, Compass, ShoppingBag, Sparkles, CheckCircle2, ArrowLeft, Users, Zap, Eye } from "lucide-react";
import { AIRCRAFT_LIST } from "../data";
import { Aircraft, PilotLogbook, AircraftInventory } from "../types";

interface AircraftMarketplaceProps {
  logbook: PilotLogbook;
  onOrderAircraft: (aircraft: any) => void;
  inventory: AircraftInventory[];
  aircraftList: Aircraft[];
}

export default function AircraftMarketplace({ logbook, onOrderAircraft, inventory, aircraftList }: AircraftMarketplaceProps) {
  const [activeView, setActiveView] = React.useState<"grid" | "detail">("grid");
  const [selectedAircraftState, setSelectedAircraftState] = React.useState<Aircraft | null>(null);
  
  // Custom paint options
  const [selectedColor, setSelectedColor] = React.useState({ name: "Arctic Silver", hex: "#e2e8f0" });
  const [orderCompletePopup, setOrderCompletePopup] = React.useState<any | null>(null);

  const colors = [
    { name: "Arctic Silver", hex: "#e2e8f0" },
    { name: "Aruba Orange", hex: "#f97316" },
    { name: "Cobalt Blue", hex: "#1d4ed8" },
    { name: "Emerald Green", hex: "#047857" },
    { name: "Midnight Black", hex: "#0f172a" },
  ];

  const currentList = (aircraftList && aircraftList.length > 0 ? aircraftList : AIRCRAFT_LIST).filter(air => {
    const invItem = inventory?.find(i => i.aircraftId === air.id);
    return !invItem || invItem.isVisible !== false;
  });

  // Handle empty state gracefully to prevent crashes
  if (!currentList || currentList.length === 0) {
    return (
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#ea580c] font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-[#ea580c]/10 rounded-full border border-[#ea580c]/10">
              Showroom & Catalogus Oranjestad
            </span>
            <h1 className="font-display font-bold text-4xl mt-3 tracking-tight text-white font-sans">
              Exclusieve Catalogus
            </h1>
            <p className="text-slate-400 mt-4 leading-relaxed text-sm font-light">
              Welkom bij onze premium vloot showroom. Vind hier uw droomvliegtuig of de ideale helikopter voor uw vloot.
            </p>
          </div>

          <div className="text-center py-20 bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-[#ea580c] border border-slate-800 animate-pulse">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-sans">Catalogus Momenteel Leeg</h3>
              <p className="text-xs text-slate-400 font-light max-w-md mx-auto leading-relaxed font-sans">
                Er zijn op dit moment geen vliegtuigen beschikbaar in de catalogus. Voeg vliegtoestellen toe via het Vlootbeheer in het <strong>Personeelsportaal</strong> om deze hier te presenteren.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSelected = selectedAircraftState || currentList[0];

  // Selected aircraft inventory stats
  const specInventory = inventory?.find(i => i.aircraftId === currentSelected.id) || {
    aircraftId: currentSelected.id,
    stockCount: 1,
    status: "Op voorraad" as const,
    priceOverride: undefined as number | undefined
  };

  const currentBasePrice = specInventory.priceOverride || currentSelected.basePrice;

  // Surcharges: Custom paint choice costs 15000: "Kleur aanpassen kost 15k"
  const colorSurcharge = selectedColor.name !== "Arctic Silver" ? 15000 : 0;
  const totalPrice = currentBasePrice + colorSurcharge;

  const handleOrderSubmit = () => {
    if (specInventory.stockCount <= 0) {
      console.warn("Fout: Dit model is momenteel uitverkocht in de hangar.");
      return;
    }

    const orderData = {
      id: "ord-" + Date.now(),
      name: currentSelected.name,
      configuredColor: selectedColor.name,
      configuredAvionics: "Standaard Fabrieksuitvoering",
      totalPrice: totalPrice,
      orderDate: new Date().toLocaleDateString("nl-NL")
    };

    onOrderAircraft(orderData);
    setOrderCompletePopup(orderData);
  };

  return (
    <div className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#ea580c] font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-[#ea580c]/10 rounded-full border border-[#ea580c]/10">
            Showroom & Catalogus Oranjestad
          </span>
          <h1 className="font-display font-bold text-4xl mt-3 tracking-tight">
            Exclusieve Catalogus
          </h1>
          <p className="text-slate-400 mt-4 leading-relaxed text-sm font-light">
            Welkom bij onze premium luchtvaart catalogus! Vind hier uw droomvliegtuig of de ideale helikopter voor uw vloot. Of u nu op zoek bent naar ongeëvenaarde snelheid, ultieme luxe of de perfecte trainingstool — ontdek onze zorgvuldig geselecteerde vloot van wereldklasse.
          </p>
        </div>

        {/* 1. GRID CATALOG VIEW */}
        {activeView === "grid" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentList.map((air) => {
                const airInv: AircraftInventory = inventory?.find(i => i.aircraftId === air.id) || {
                  aircraftId: air.id,
                  stockCount: 1,
                  status: "Op voorraad" as const,
                  priceOverride: undefined
                };
                const hasStock = airInv.stockCount > 0;
                const priceToShow = airInv.priceOverride || air.basePrice;

                // Speed in km/h is knot value multiplied by 1.852, then rounded
                const speedKmh = Math.round(air.topSpeedKnots * 1.852);

                return (
                  <div
                    key={air.id}
                    onClick={() => {
                      setSelectedAircraftState(air);
                      setSelectedColor(colors[0]); // Reset paint to standard
                      setActiveView("detail");
                    }}
                    className="group bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl hover:border-[#ea580c]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Visual box showing aircraft brand gradient or photo */}
                    <div className="h-52 w-full relative flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden" 
                         style={!air.imageUrl ? { background: air.imageTheme } : undefined}>
                      
                      {air.imageUrl ? (
                        <img 
                          src={air.imageUrl} 
                          alt={air.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-radial-gradient from-slate-950/20 via-transparent pointer-events-none opacity-80" />
                      )}
                      <div className="absolute inset-0 bg-slate-950/30" />

                      <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight stroke-slate-900 drop-shadow-md mt-1 relative z-10">{air.name}</h3>

                      {/* Stock badge */}
                      <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border relative z-15 ${
                        hasStock 
                          ? "bg-emerald-500/80 border-emerald-500/25 text-emerald-100" 
                          : "bg-rose-500/80 border-rose-500/25 text-rose-100"
                      }`}>
                        {hasStock ? `${airInv.stockCount} Op Voorraad` : "Uitverkocht"}
                      </span>

                      {/* Hover eye icon */}
                      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <span className="bg-[#ea580c] text-slate-950 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#ea580c]/15">
                          <Eye className="h-4 w-4" />
                          <span>Klik voor Informatie</span>
                        </span>
                      </div>
                    </div>

                    {/* Specifications footer */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2">
                        {air.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-center text-[10.5px] font-mono text-slate-400">
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/50">
                          <span className="block text-slate-500 text-[8px] uppercase font-bold">Max Snelheid</span>
                          <span className="font-semibold text-slate-200">{speedKmh} km/h</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/50">
                          <span className="block text-slate-500 text-[8px] uppercase font-bold">Zitplaatsen</span>
                          <span className="font-semibold text-slate-200">{air.capacity} Personen</span>
                        </div>
                      </div>

                      {/* Price view */}
                      <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">PRIJS IN SHOWROOM</p>
                          <p className="text-lg font-bold font-mono text-white">€{priceToShow.toLocaleString("nl-NL")}</p>
                        </div>
                        <span className="text-xs text-[#ea580c] font-mono font-bold group-hover:underline flex items-center gap-1">
                          <span>Bekijk details</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. SPECIFIC DETAIL & CUSTOMIZER VIEW */}
        {activeView === "detail" && (
          <div>
            {/* Back to Catalog button */}
            <div className="mb-8 font-light">
              <button
                onClick={() => setActiveView("grid")}
                className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <ArrowLeft className="h-4 w-4 text-[#ea580c]" />
                <span>Terug naar Toestellen Overzicht</span>
              </button>
            </div>

            {/* Configurator workspace layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* LEFT: 3D-effect Visualizer Display (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Simulated glass overlay */}
                <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-transparent opacity-60 pointer-events-none"></div>

                <div className="h-64 sm:h-80 w-full rounded-2xl relative border-2 border-slate-900 border-dashed overflow-hidden flex flex-col justify-center items-center" 
                     style={!currentSelected.imageUrl ? { background: currentSelected.imageTheme } : undefined}>
                  
                  {currentSelected.imageUrl ? (
                    <img 
                      src={currentSelected.imageUrl} 
                      alt={currentSelected.name} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="absolute top-4 left-4 font-mono text-[9px] bg-slate-950/80 px-2.5 py-1 rounded text-slate-350 flex items-center gap-1.5 border border-slate-850 z-10">
                      <Compass className="h-3 w-3 text-[#ea580c] animate-spin" />
                      <span>Luchtvaart Centrum Oranjestad</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/40" />

                  {/* Central Aircraft Graphic */}
                  <div className="text-center z-15 text-white p-6 max-w-sm relative z-10">
                    <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none drop-shadow-md">{currentSelected.name}</h3>
                    
                    {/* Visual paint blob representation */}
                    <div className="mt-6 flex justify-center items-center gap-2">
                       <span className="text-xs font-mono text-white/80 uppercase">Kleur: </span>
                      <span className="h-5 w-5 rounded-full border-2 border-white shadow shadow-black" style={{ backgroundColor: selectedColor.hex }}></span>
                      <span className="text-xs font-mono font-semibold">{selectedColor.name}</span>
                    </div>
                  </div>

                  {/* Bottom specifications bar */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-[10px] font-mono grid grid-cols-2 gap-2 text-center text-slate-400 relative z-20">
                    <div>
                      <span className="block text-slate-500 text-[8px] font-bold">SNELHEID</span>
                      <span className="text-white font-bold">{Math.round(currentSelected.topSpeedKnots * 1.852)} km/h</span>
                    </div>
                    <div className="border-l border-slate-905">
                      <span className="block text-slate-500 text-[8px] font-bold">ZITPLAATSEN</span>
                      <span className="text-white font-bold">{currentSelected.capacity} pers.</span>
                    </div>
                  </div>
                </div>

                {/* Short text description of choice */}
                <div className="mt-6 space-y-4">
                  <h4 className="font-display font-bold text-lg text-white">Over het toestel</h4>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-light">{currentSelected.description}</p>
                  
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-900 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 uppercase block text-[9px]">Type Toestel</span>
                      <span className="text-slate-300 font-semibold capitalize">
                        {currentSelected.type === "helicopter" ? "Helikopter" : currentSelected.type === "small-plane" ? "Sportvliegtuig" : "Verkeersvliegtuig"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Customizer specs, color select, price calc (5 cols) */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-semibold text-base text-white flex items-center gap-1.5 uppercase font-mono tracking-wider mb-5">
                    <SlidersHorizontal className="h-4.5 w-4.5 text-[#ea580c]" />
                    <span>Opties & Hangar Prijs</span>
                  </h3>

                  {/* Paint selection: Arctic Silver is standard, custom is +15k */}
                  <div className="space-y-4">
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850/60">
                      <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block mb-1 font-bold">Kleur Kiezer</label>
                      <p className="text-[9px] text-slate-500 font-mono mb-4 leading-relaxed">
                        Arctic Silver is gratis. Een andere premium lakkleur kost eenmalig €15.000 om op maat te verven.
                      </p>
                      
                      <div className="flex flex-wrap gap-2.5">
                        {colors.map((c) => {
                          const isSelected = selectedColor.name === c.name;
                          return (
                            <button
                              key={c.name}
                              onClick={() => setSelectedColor(c)}
                              className={`h-9 w-9 rounded-full border-2 transition-all cursor-pointer relative ${
                                isSelected ? "border-[#ea580c] scale-110 shadow-lg shadow-[#ea580c]/15" : "border-slate-800 hover:border-slate-600"
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={`${c.name} ${c.name === "Arctic Silver" ? "(Standaard)" : "(+ €15.000)"}`}
                            >
                              {isSelected && (
                                <Check className="h-4 w-4 absolute top-2 text-slate-900 font-extrabold" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] font-mono text-slate-400 flex justify-between">
                        <span>Gekozen lak:</span>
                        <span className="text-white font-bold">{selectedColor.name} {selectedColor.name !== "Arctic Silver" && "(+ €15.000)"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recalculate price and checkout */}
                <div className="border-t border-slate-900 pt-5 space-y-4">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-400 space-y-2">
                    <div className="flex justify-between">
                      <span>Showroom Levering:</span>
                      <span className={`font-bold ${specInventory.stockCount > 0 ? "text-emerald-400" : "text-rose-400 animate-pulse"}`}>
                        {specInventory.stockCount > 0 ? `${specInventory.stockCount} stuks op voorraad` : "TIJDELIJK UITVERKOCHTE VOORRAAD"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Winkel Prijs Model:</span>
                      <span className="text-white">€{currentBasePrice.toLocaleString("nl-NL")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kleur spuiten:</span>
                      <span className={colorSurcharge > 0 ? "text-amber-400 font-bold" : "text-slate-500"}>
                        {colorSurcharge > 0 ? `+ €${colorSurcharge.toLocaleString("nl-NL")}` : "Inbegrepen"}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white">
                      <span>Totaalprijs:</span>
                      <span className="text-[#ea580c] text-base font-black">€{totalPrice.toLocaleString("nl-NL")}</span>
                    </div>
                  </div>

                  {specInventory.stockCount > 0 ? (
                    <button
                      onClick={handleOrderSubmit}
                      className="w-full bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 font-bold font-mono text-xs sm:text-sm py-4 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#ea580c]/15 cursor-pointer"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                      <span>Bestelling Plaatsen</span>
                    </button>
                  ) : (
                    <div className="w-full bg-slate-950 border border-slate-850/60 text-slate-500 font-mono text-center text-xs py-4 rounded-xl uppercase tracking-wider font-semibold">
                      Tijdelijk niet leverbaar in hangar
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Registered Fleet/Garage if they own any aircraft */}
        {logbook.ownedAircraft && logbook.ownedAircraft.length > 0 && (
          <div className="mt-16 bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl">
            <h3 className="font-display font-semibold text-xl text-white flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#ea580c]" />
              <span>Gekochte Toestellen & Gestaalde Vloot</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-light">Geregistreerde privé-vliegtuigen en helikopters in uw bezit:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logbook.ownedAircraft.map((own) => (
                <div key={own.id} className="bg-slate-900 border border-slate-850 p-4.5 rounded-2xl flex flex-col justify-between font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>ID: {own.id.substring(4, 10).toUpperCase()}</span>
                      <span>{own.orderDate}</span>
                    </div>
                    <h4 className="font-display font-bold text-sm text-white mt-1.5">{own.name}</h4>
                    <p className="text-[10px] text-slate-400 font-light mt-1 leading-relaxed">
                      Lakkleur: <strong className="text-slate-200">{own.configuredColor}</strong><br />
                      Uitvoering: <strong className="text-slate-200">{own.configuredAvionics ? "Standaard Fabrieksuitvoering" : "Standaard"}</strong>
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between items-center">
                    <span className="text-slate-500">Aankoopwaarde:</span>
                    <strong className="text-[#ea580c] font-bold">€{own.totalPrice.toLocaleString("nl-NL")}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success order popover modal overlay */}
      {orderCompletePopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl relative font-sans">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-4 animate-bounce">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>
            
            <h3 className="font-display font-bold text-xl text-white">Toestel Gereserveerd!</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Uw bestelling voor de <strong className="text-white">{orderCompletePopup.name}</strong> ({orderCompletePopup.configuredColor}) is succesvol geregistreerd onder uw naam.
            </p>

            <div className="bg-slate-950 rounded-xl p-4 my-4 font-mono text-[10px] text-left text-slate-400 space-y-1">
              <div>Model: <strong className="text-slate-200">{orderCompletePopup.name}</strong></div>
              <div>Exterieur: <strong className="text-slate-200">{orderCompletePopup.configuredColor}</strong></div>
              <div>Aflevering: <strong className="text-slate-200">Koningin Beatrix Luchthaven</strong></div>
              <div className="border-t border-slate-900 pt-1.5 text-xs text-[#ea580c] font-bold font-mono">
                Totaalbedrag: €{orderCompletePopup.totalPrice.toLocaleString("nl-NL")}
              </div>
            </div>

            <button
              onClick={() => {
                setOrderCompletePopup(null);
                setActiveView("grid");
              }}
              className="w-full bg-[#ea580c] text-slate-950 font-bold font-mono text-xs py-2.5 rounded-lg transition-all cursor-pointer hover:bg-[#ea580c]/90"
            >
              Terug naar Showroom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
