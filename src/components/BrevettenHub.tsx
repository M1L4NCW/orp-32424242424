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
            <span className="text-[#ea580c] font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-[#ea580c]/10 rounded-full border border-[#ea580c]/10">
              Aviation Academy Oranjestad
            </span>
            <h1 className="font-display font-bold text-4xl mt-3 tracking-tight text-white">
              Vliegbrevetten & Licenties
            </h1>
            <p className="text-slate-400 mt-4 leading-relaxed text-sm">
              Behaal uw officiële bevoegdheden voor Helikopters, Vliegtuig Klein of Vliegtuig Groot via onze vliegschool.
            </p>
          </div>

          <div className="text-center py-20 bg-slate-950 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto space-y-6">
            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-[#ea580c] border border-slate-800 animate-pulse">
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
    <div className="bg-slate-900 text-white py-12 mr-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#ea580c] font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-[#ea580c]/10 rounded-full border border-[#ea580c]/10">
            Aviation Academy Oranjestad
          </span>
          <h1 className="font-display font-bold text-4xl mt-3 tracking-tight text-white">
            Vliegbrevetten & Licenties
          </h1>
          <p className="text-slate-400 mt-4 leading-relaxed text-sm">
            Behaal uw officiële bevoegdheden voor Helikopters, Vliegtuig Klein of Vliegtuig Groot via onze vliegschool.
          </p>
        </div>

        {/* Discord Ticket Callout Banner */}
        <div className="mb-12 bg-slate-950 border border-[#ea580c]/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#ea580c]" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ea580c] animate-pulse" />
                <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">Hoe behaalt u uw vliegbrevet?</h3>
              </div>
              <p className="text-sm text-slate-300 font-light leading-relaxed max-w-4xl">
                U kunt uw gewenste vliegbrevetten direct behalen door een <strong className="text-[#ea580c] font-semibold">ticket aan te maken in onze Discord server</strong>. Onze gecertificeerde vlieginstructeurs plannen dan een afspraak met u in. Na goedkeuring wordt uw brevet geautoriseerd.
              </p>
            </div>
            <a
              href="https://discord.gg/FACgeTSrAR" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 px-6 py-3.5 rounded-xl font-mono text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 shrink-0 self-start md:self-center cursor-pointer shadow-lg shadow-[#ea580c]/10 text-decoration-none"
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
            <h3 className="text-xs font-mono text-slate-400 tracking-wider font-bold uppercase mb-2 block">Beschikbare Categorieën</h3>
            {filteredLicenses.map((lic) => {
              const isSelected = selectedLicense?.id === lic.id;

              return (
                <div
                  key={lic.id}
                  onClick={() => setSelectedLicense(lic)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-slate-950 border-[#ea580c] shadow-xl shadow-[#ea580c]/5 translate-x-1"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#ea580c] tracking-wider font-mono uppercase">{lic.category}</span>
                      <h4 className="font-display font-semibold text-base mt-0.5 text-white">{lic.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 font-mono text-xs uppercase font-medium">PRIJS</p>
                      <p className="text-white font-mono font-bold text-sm">€{getLicensePrice(lic.id, lic.price).toLocaleString("nl-NL")}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">{lic.description}</p>
                </div>
              );
            })}
          </div>

          {/* Right Column: In-depth Detail and Action Area */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
            {selectedLicense ? (
              <div>
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-905 pb-6 mb-6">
                  <div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">{selectedLicense.name}</h2>
                    <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">{selectedLicense.description}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center sm:text-right shrink-0">
                    <p className="text-[10px] text-slate-400 font-mono">BREVET PRIJS</p>
                    <p className="text-xl font-bold text-[#ea580c] font-mono">€{getLicensePrice(selectedLicense.id, selectedLicense.price).toLocaleString("nl-NL")}</p>
                  </div>
                </div>

                {/* Steps to Obtain */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-4">Stappenplan voor Behalen</h4>
                  
                  <div className="space-y-4">
                    {/* Step 1: Discord contact */}
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="max-w-md">
                        <div className="flex items-center space-x-2.5">
                          <span className="h-6 w-6 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/20 text-[#ea580c] flex items-center justify-center font-mono text-xs font-bold">1</span>
                          <h5 className="font-semibold text-sm text-white">Discord Ticket Openen (Afspraak maken)</h5>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 pl-8.5">
                          Meld u aan bij de instructeurs door een ticket te openen in onze Discord om uw afspraak en vliegles in te plannen.
                        </p>
                      </div>
                      <a
                        href="https://discord.gg/FACgeTSrAR"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-950 border border-slate-800 hover:border-[#ea580c] text-indigo-300 hover:text-white px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase shrink-0 transition-all text-center w-full sm:w-auto"
                      >
                        Maak Ticket
                      </a>
                    </div>

                    {/* Step 2: Theory review */}
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800/60">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs font-bold">2</span>
                        <h5 className="font-semibold text-sm text-white">Theorie Uitleg</h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 pl-8.5">
                        Een erkend vlieginstructeur geeft u een gedegen en overzichtelijke uitleg over de theorie van de gekozen luchtvaarttak.
                      </p>
                    </div>

                    {/* Step 3: Practical test flight */}
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800/60">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs font-bold">3</span>
                        <h5 className="font-semibold text-sm text-white">Test Vliegen (of je het kan)</h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 pl-8.5">
                        U voert samen met een instructeur een praktijktoets uit om te demonstreren dat u het luchtvoertuig onder controle heeft.
                      </p>
                    </div>

                    {/* Step 4: Theory exam */}
                    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800/60">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs font-bold">4</span>
                        <h5 className="font-semibold text-sm text-white">Theorie Toets</h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 pl-8.5">
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
                    className="w-full bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 font-bold font-mono text-xs sm:text-sm py-4 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ea580c]/10 text-decoration-none"
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
