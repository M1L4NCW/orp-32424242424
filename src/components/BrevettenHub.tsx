import React from "react";
import { Award, CheckCircle2, MessageSquare } from "lucide-react";
import { LICENSES } from "../data";
import { License, PilotLogbook, FinancialConfig } from "../types";

interface BrevettenHubProps {
  licenseVisibility?: Record<string, boolean>;
  financialConfig?: FinancialConfig;
}

export default function BrevettenHub({ licenseVisibility, financialConfig }: BrevettenHubProps) {
  const getLicensePrice = (id: string, defaultPrice: number) => {
    if (!financialConfig) return defaultPrice;
    if (id === "helicopter") return financialConfig.helicopterPrice;
    if (id === "small-plane") return financialConfig.smallPlanePrice;
    if (id === "large-plane") return financialConfig.largePlanePrice;
    return defaultPrice;
  };

  const filteredLicenses = LICENSES.filter(lic => {
    return !licenseVisibility || licenseVisibility[lic.id] !== false;
  });

  const [selectedLicense, setSelectedLicense] = React.useState<License | null>(
    filteredLicenses.length > 0 ? filteredLicenses[0] : null
  );

  // If selectedLicense is not in filteredLicenses, select the first visible one
  React.useEffect(() => {
    if (selectedLicense && !filteredLicenses.some(l => l.id === selectedLicense.id)) {
      setSelectedLicense(filteredLicenses.length > 0 ? filteredLicenses[0] : null);
    } else if (!selectedLicense && filteredLicenses.length > 0) {
      setSelectedLicense(filteredLicenses[0]);
    }
  }, [licenseVisibility, filteredLicenses, selectedLicense]);

  if (filteredLicenses.length === 0) {
    return (
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-slate-300 font-mono text-xs tracking-widest uppercase font-black px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800">
              Aviation Academy Oranjestad
            </span>
            <h1 className="font-display font-medium text-4xl mt-4 tracking-tight text-white uppercase">
              Vliegbrevetten & Licenties
            </h1>
            <p className="text-slate-400 mt-2 font-light text-sm">
              Behaal uw officiële bevoegdheden voor Helikopters, Vliegtuig Klein of Vliegtuig Groot via onze vliegschool.
            </p>
          </div>

          <div className="text-center py-20 bg-slate-950/80 border border-slate-900 rounded-3xl p-8 max-w-xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-300 border border-slate-800 animate-pulse">
              <Award className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-sans">Geen Brevetten Beschikbaar</h3>
              <p className="text-xs text-slate-400 font-light max-w-md mx-auto leading-relaxed font-sans">
                Er zijn momenteel geen vliegbrevetten beschikbaar voor aanvraag in de vliegschool. Beheer kan de zichtbaarheid activeren in het Personeelsportaal.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/30 text-white py-12 mr-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-slate-300 font-mono text-xs tracking-widest uppercase font-black px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800 shadow-md">
            Aviation Academy Oranjestad
          </span>
          <h1 className="font-display font-black text-4xl mt-4 tracking-tight text-white uppercase">
            Vliegbrevetten & Licenties
          </h1>
          <p className="text-slate-400 mt-2 font-light text-sm">
            Behaal uw officiële bevoegdheden voor Helikopters, Vliegtuig Klein of Vliegtuig Groot via onze vliegschool.
          </p>
        </div>

        {/* Discord Ticket Callout Banner */}
        <div className="mb-12 bg-slate-950/80 border border-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-slate-200" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-200 animate-ping" />
                <h3 className="font-display font-bold text-sm text-slate-250 uppercase tracking-widest font-mono">HOE BEHAALT U UW VLIEGBREVET?</h3>
              </div>
              <p className="text-sm text-slate-300 font-light leading-relaxed max-w-4xl">
                U kunt uw gewenste vliegbrevetten direct behalen door een <strong className="text-white font-bold">ticket aan te maken in onze Discord server</strong>. Onze gecertificeerde vlieginstructeurs plannen dan een afspraak met u in. Na goedkeuring wordt uw brevet geautoriseerd.
              </p>
            </div>
            <a
              href="https://discord.gg/FACgeTSrAR" 
              target="_blank" 
              rel="noreferrer"
              className="bg-slate-100 hover:bg-white text-slate-950 px-6 py-4 rounded-xl font-mono text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 self-start md:self-center cursor-pointer shadow-lg shadow-white/5 text-decoration-none hover:scale-105"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Maak Discord Ticket</span>
            </a>
          </div>
        </div>

        {/* Dynamic Dual-Column: License Selector vs Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Licenses list selector */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-mono text-slate-400 tracking-widest font-bold uppercase mb-2 block">BESCHIKBARE CATEGORIEËN</h3>
            {filteredLicenses.map((lic) => {
              const isSelected = selectedLicense?.id === lic.id;

              return (
                <div
                  key={lic.id}
                  onClick={() => setSelectedLicense(lic)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-slate-950 border-slate-700 border-l-8 border-l-slate-200 shadow-2xl shadow-white/5 translate-x-2"
                      : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 tracking-widest font-mono uppercase">{lic.category}</span>
                      <h4 className="font-display font-bold text-md mt-0.5 text-white">{lic.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 font-mono text-[9px] uppercase font-bold tracking-wider">PRIJS</p>
                      <p className="text-white font-mono font-bold text-sm">€{getLicensePrice(lic.id, lic.price).toLocaleString("nl-NL")}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed font-light">{lic.description}</p>
                </div>
              );
            })}
          </div>

          {/* Right Column: In-depth Detail and Action Area */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
            {selectedLicense ? (
              <div>
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 mb-6">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight">{selectedLicense.name}</h2>
                    <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed max-w-md">{selectedLicense.description}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/60 text-center sm:text-right shrink-0">
                    <p className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">BREVET PRIJS</p>
                    <p className="text-xl font-black text-white font-mono">€{getLicensePrice(selectedLicense.id, selectedLicense.price).toLocaleString("nl-NL")}</p>
                  </div>
                </div>

                {/* Steps to Obtain */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest mb-4">Stappenplan voor Behalen</h4>
                  
                  <div className="space-y-4">
                    {/* Step 1: Discord contact */}
                    <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-800 transition-all">
                      <div className="max-w-md">
                        <div className="flex items-center space-x-2.5">
                          <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-mono text-xs font-bold">1</span>
                          <h5 className="font-semibold text-sm text-white">Discord Ticket Openen (Afspraak maken)</h5>
                        </div>
                        <p className="text-xs text-slate-450 mt-1.5 pl-8.5 font-light">
                          Meld u aan bij de instructeurs door een ticket te openen in onze Discord om uw afspraak en vliegles in te plannen.
                        </p>
                      </div>
                      <a
                        href="https://discord.gg/FACgeTSrAR"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-950 border border-slate-900 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase shrink-0 transition-all text-center w-full sm:w-auto hover:bg-slate-800"
                      >
                        Maak Ticket
                      </a>
                    </div>

                    {/* Step 2: Theory review */}
                    <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 hover:border-slate-800 transition-all">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold">2</span>
                        <h5 className="font-semibold text-sm text-white">Theorie Uitleg</h5>
                      </div>
                      <p className="text-xs text-slate-450 mt-1.5 pl-8.5 font-light">
                        Een erkend vlieginstructeur geeft u een gedegen en overzichtelijke uitleg over de theorie van de gekozen luchtvaarttak.
                      </p>
                    </div>

                    {/* Step 3: Practical test flight */}
                    <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 hover:border-slate-800 transition-all">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold">3</span>
                        <h5 className="font-semibold text-sm text-white">Test Vliegen (of je het kan)</h5>
                      </div>
                      <p className="text-xs text-slate-450 mt-1.5 pl-8.5 font-light">
                        U voert samen met een instructeur een praktijktoets uit om te demonstreren dat u het luchtvoertuig onder controle heeft.
                      </p>
                    </div>

                    {/* Step 4: Theory exam */}
                    <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 hover:border-slate-800 transition-all">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold">4</span>
                        <h5 className="font-semibold text-sm text-white">Theorie Toets</h5>
                      </div>
                      <p className="text-xs text-slate-450 mt-1.5 pl-8.5 font-light">
                        Een eindexamen over de theoretische beginselen om vliegvaardigheid officieel te bezegelen en te registreren.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call Action Button */}
                <div className="mt-8 pt-6 border-t border-slate-900">
                  <a
                    href="https://discord.gg/FACgeTSrAR"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black font-mono text-xs sm:text-sm py-4 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 text-decoration-none hover:scale-[1.01]"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    <span>Direct Examen Aanvragen via Discord</span>
                  </a>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-500 py-12">
                <Award className="h-12 w-12 text-slate-700 animate-pulse mb-4" />
                <p className="text-sm">Selecteer een vliegbrevet aan de linkerkant om details weer te geven.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
