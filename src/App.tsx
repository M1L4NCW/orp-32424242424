import React from "react";
import { 
  Plane, Compass, Wind, Award, Clock, ArrowRight, Gauge, 
  MapPin, CheckCircle2, ShieldAlert, BookOpen, AlertCircle, Plus, Sparkles, Megaphone 
} from "lucide-react";

import { PilotLogbook, IssuedLicense, AircraftInventory, Aircraft } from "./types";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import BrevettenHub from "./components/BrevettenHub";
import AircraftMarketplace from "./components/AircraftMarketplace";
import StaffPortal from "./components/StaffPortal";
import { DEFAULT_ISSUED_LICENSES, DEFAULT_INVENTORY, AIRCRAFT_LIST } from "./data";
import LSIAFuturisticMap from "./components/LSIAFuturisticMap";

const STORAGE_KEY = "@luchtvaart_oranjestad_logbook";
const ENROLL_KEY = "@luchtvaart_oranjestad_enrolled";
const LICENSES_KEY = "@luchtvaart_oranjestad_issued_licenses";
const INVENTORY_KEY = "@luchtvaart_oranjestad_inventory";
const AIRCRAFT_LIST_KEY = "@luchtvaart_oranjestad_aircraft_list";

const DEFAULT_LOGBOOK: PilotLogbook = {
  totalHours: 12,
  helicopterHours: 4,
  smallPlaneHours: 8,
  largePlaneHours: 0,
  completedQuizzes: [],
  completedSimulators: [],
  unlockedLicenses: [],
  ownedAircraft: []
};

export default function App() {
  const [currentTab, setCurrentTab] = React.useState<string>("home");
  const [logbook, setLogbook] = React.useState<PilotLogbook>(DEFAULT_LOGBOOK);
  const [enrolledCourses, setEnrolledCourses] = React.useState<string[]>([]);
  
  // Direct and manager control states
  const [issuedLicenses, setIssuedLicenses] = React.useState<IssuedLicense[]>([]);
  const [inventory, setInventory] = React.useState<AircraftInventory[]>([]);
  const [aircraftList, setAircraftList] = React.useState<Aircraft[]>([]);

  // Success notifications
  const [transactionSuccess, setTransactionSuccess] = React.useState<string | null>(null);

  // Home announcement message for management+
  const [announcement, setAnnouncement] = React.useState<string>(() => {
    return localStorage.getItem("@luchtvaart_oranjestad_announcement") || "";
  });

  const [googleConnectionType, setGoogleConnectionType] = React.useState<"auth" | "webapp">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("@luchtvaart_oranjestad_sheets_conn_type") as "auth" | "webapp") || "webapp";
    }
    return "webapp";
  });
  const [sheetsWebAppUrl, setSheetsWebAppUrl] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("@luchtvaart_oranjestad_sheets_webapp_url") || "";
    }
    return "";
  });
  const [savedSpreadsheetId, setSavedSpreadsheetId] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("@luchtvaart_oranjestad_spreadsheet_id") || "";
    }
    return "";
  });

  const handleUpdateGoogleConnectionType = (type: "auth" | "webapp") => {
    setGoogleConnectionType(type);
    localStorage.setItem("@luchtvaart_oranjestad_sheets_conn_type", type);
    saveSharedPortalData({ googleConnectionType: type });
  };

  const handleUpdateSheetsWebAppUrl = (url: string) => {
    setSheetsWebAppUrl(url);
    localStorage.setItem("@luchtvaart_oranjestad_sheets_webapp_url", url);
    saveSharedPortalData({ sheetsWebAppUrl: url });
  };

  const handleUpdateSavedSpreadsheetId = (id: string) => {
    setSavedSpreadsheetId(id);
    localStorage.setItem("@luchtvaart_oranjestad_spreadsheet_id", id);
    saveSharedPortalData({ savedSpreadsheetId: id });
  };

  const handleUpdateAnnouncement = (text: string) => {
    setAnnouncement(text);
    localStorage.setItem("@luchtvaart_oranjestad_announcement", text);
    saveSharedPortalData({ announcement: text });
  };

  // Pilot licenses visibility settings (for displaying in BrevettenHub)
  const [licenseVisibility, setLicenseVisibility] = React.useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem("@luchtvaart_oranjestad_license_visibility");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse license visibility:", e);
    }
    return {
      "helicopter": true,
      "small-plane": true,
      "large-plane": true
    };
  });

  const handleUpdateLicenseVisibility = (visibility: Record<string, boolean>) => {
    setLicenseVisibility(visibility);
    localStorage.setItem("@luchtvaart_oranjestad_license_visibility", JSON.stringify(visibility));
  };

  // Auto-switch to staff tab if redirecting back from Discord with code parameter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("code")) {
      setCurrentTab("staff");
    }
  }, []);

  // Load state from local storage on mount (personal logbook & enrolled courses)
  React.useEffect(() => {
    try {
      const storedLogbook = localStorage.getItem(STORAGE_KEY);
      if (storedLogbook) {
        setLogbook(JSON.parse(storedLogbook));
      }
      const storedCourses = localStorage.getItem(ENROLL_KEY);
      if (storedCourses) {
        setEnrolledCourses(JSON.parse(storedCourses));
      }
    } catch (e) {
      console.error("Local storage personal cache fail:", e);
    }
  }, []);

  // Shared portal data loader and real-time poller (everyone sees the same data)
  React.useEffect(() => {
    let isMounted = true;
    let initialLoad = true;

    const fetchSharedData = async () => {
      try {
        const response = await fetch("/api/portal-data");
        if (response.ok && isMounted) {
          const data = await response.json();

          // Fallback and self-healing: if the server is freshly started (length === 0)
          // but the client has actual records in localstorage, upload them to heal/restore the database.
          if (initialLoad) {
            initialLoad = false;
            
            const localLicsStr = localStorage.getItem(LICENSES_KEY);
            let localLics: IssuedLicense[] = [];
            if (localLicsStr) {
              try {
                localLics = JSON.parse(localLicsStr);
              } catch (e) {
                console.error("Error parsing local licenses:", e);
              }
            }

            const serverLics = data.issuedLicenses || [];
            if (serverLics.length === 0 && localLics.length > 0) {
              console.log("Restoring empty server with non-empty local storage data, healing system...", localLics);
              saveSharedPortalData({
                issuedLicenses: localLics,
                inventory: data.inventory && data.inventory.length > 0 ? undefined : (JSON.parse(localStorage.getItem(INVENTORY_KEY) || "[]")),
                aircraftList: data.aircraftList && data.aircraftList.length > 0 ? undefined : (JSON.parse(localStorage.getItem(AIRCRAFT_LIST_KEY) || "[]")),
                announcement: data.announcement || localStorage.getItem("@luchtvaart_oranjestad_announcement") || "",
                googleConnectionType: data.googleConnectionType || localStorage.getItem("@luchtvaart_oranjestad_sheets_conn_type") || "webapp",
                sheetsWebAppUrl: data.sheetsWebAppUrl || localStorage.getItem("@luchtvaart_oranjestad_sheets_webapp_url") || "",
                savedSpreadsheetId: data.savedSpreadsheetId || localStorage.getItem("@luchtvaart_oranjestad_spreadsheet_id") || ""
              });
              setIssuedLicenses(localLics);
              return; // wait for subsequent intervals to catch up
            }
          }

          if (data.issuedLicenses !== undefined) {
            setIssuedLicenses(data.issuedLicenses);
            localStorage.setItem(LICENSES_KEY, JSON.stringify(data.issuedLicenses));
          }
          if (data.inventory !== undefined && data.inventory.length > 0) {
            setInventory(data.inventory);
            localStorage.setItem(INVENTORY_KEY, JSON.stringify(data.inventory));
          }
          if (data.aircraftList !== undefined && data.aircraftList.length > 0) {
            setAircraftList(data.aircraftList);
            localStorage.setItem(AIRCRAFT_LIST_KEY, JSON.stringify(data.aircraftList));
          }
          if (data.announcement !== undefined) {
            setAnnouncement(data.announcement);
            localStorage.setItem("@luchtvaart_oranjestad_announcement", data.announcement);
          }
          if (data.googleConnectionType !== undefined) {
            setGoogleConnectionType(data.googleConnectionType);
            localStorage.setItem("@luchtvaart_oranjestad_sheets_conn_type", data.googleConnectionType);
          }
          if (data.sheetsWebAppUrl !== undefined) {
            setSheetsWebAppUrl(data.sheetsWebAppUrl);
            localStorage.setItem("@luchtvaart_oranjestad_sheets_webapp_url", data.sheetsWebAppUrl);
          }
          if (data.savedSpreadsheetId !== undefined) {
            setSavedSpreadsheetId(data.savedSpreadsheetId);
            localStorage.setItem("@luchtvaart_oranjestad_spreadsheet_id", data.savedSpreadsheetId);
          }
        }
      } catch (error) {
        console.error("Mislukt om gedeelde portaalgegevens op te halen:", error);
      }
    };

    fetchSharedData();

    // Poll values from the server every 5 seconds so they sync in real-time for all active clients
    const interval = setInterval(fetchSharedData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Helper to save shared data server-side
  const saveSharedPortalData = async (payload: {
    issuedLicenses?: IssuedLicense[];
    inventory?: AircraftInventory[];
    aircraftList?: Aircraft[];
    announcement?: string;
    googleConnectionType?: "auth" | "webapp";
    sheetsWebAppUrl?: string;
    savedSpreadsheetId?: string;
  }) => {
    try {
      await fetch("/api/portal-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Fout met opslaan van gedeelde portaalgegevens op server:", e);
    }
  };

  // Save logbook state Changes
  const saveLogbook = (updated: PilotLogbook) => {
    setLogbook(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving logbook:", e);
    }
  };

  const handleUpdateInventory = (updatedInv: AircraftInventory[]) => {
    setInventory(updatedInv);
    try {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInv));
    } catch (e) {
      console.error("Error saving inventory:", e);
    }
    saveSharedPortalData({ inventory: updatedInv });
  };

  const handleUpdateAircraftList = (updatedList: Aircraft[]) => {
    setAircraftList(updatedList);
    try {
      localStorage.setItem(AIRCRAFT_LIST_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error("Error saving aircraft list:", e);
    }
    saveSharedPortalData({ aircraftList: updatedList });
  };

  const handleAddLicense = (newLic: IssuedLicense) => {
    const updatedLics = [newLic, ...issuedLicenses];
    setIssuedLicenses(updatedLics);
    try {
      localStorage.setItem(LICENSES_KEY, JSON.stringify(updatedLics));
    } catch (e) {
      console.error("Error saving licenses:", e);
    }
    saveSharedPortalData({ issuedLicenses: updatedLics });
  };

  const handleRemoveLicense = (licId: string) => {
    const updatedLics = issuedLicenses.filter(l => l.id !== licId);
    setIssuedLicenses(updatedLics);
    try {
      localStorage.setItem(LICENSES_KEY, JSON.stringify(updatedLics));
    } catch (e) {
      console.error("Error saving licenses:", e);
    }
    saveSharedPortalData({ issuedLicenses: updatedLics });
  };

  const handleUpdateLicense = (updatedLic: IssuedLicense) => {
    const updatedLics = issuedLicenses.map(l => l.id === updatedLic.id ? updatedLic : l);
    setIssuedLicenses(updatedLics);
    try {
      localStorage.setItem(LICENSES_KEY, JSON.stringify(updatedLics));
    } catch (e) {
      console.error("Error saving licenses:", e);
    }
    saveSharedPortalData({ issuedLicenses: updatedLics });
  };

  const handleClearAllLicenses = () => {
    setIssuedLicenses([]);
    try {
      localStorage.setItem(LICENSES_KEY, JSON.stringify([]));
    } catch (e) {
      console.error("Error clearing licenses:", e);
    }
    saveSharedPortalData({ issuedLicenses: [] });
  };

  // State mutators
  const handleBuyLicense = (licenseId: string, price: number) => {
    if (logbook.unlockedLicenses.includes(licenseId)) return;
    
    const updated = {
      ...logbook,
      unlockedLicenses: [...logbook.unlockedLicenses, licenseId]
    };
    saveLogbook(updated);
    
    setTransactionSuccess(`Inschrijving voldaan! U bent nu officieel ingeschreven voor het ${
      licenseId === "helicopter" ? "Helikopter brevet" : licenseId === "small-plane" ? "Vliegtuig Klein brevet" : "Vliegtuig Groot brevet"
    } vliegprogramma.`);
    
    // Auto-scroll to top to see notification
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    setTimeout(() => {
      setTransactionSuccess(null);
    }, 6000);
  };

  const handleEnrollCourse = (courseId: string) => {
    if (enrolledCourses.includes(courseId)) return;
    const updated = [...enrolledCourses, courseId];
    setEnrolledCourses(updated);
    try {
      localStorage.setItem(ENROLL_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving courses:", e);
    }
  };

  const handleOrderAircraft = (aircraftOrder: any) => {
    const updated = {
      ...logbook,
      ownedAircraft: [aircraftOrder, ...(logbook.ownedAircraft || [])]
    };
    saveLogbook(updated);
  };

  // Aruba Airport Toren & Funny Radio Chatter simulation
  const [chatterIndex, setChatterIndex] = React.useState(0);
  const radioChatterQuotes = [
    { text: "Toren TNCA: Cessna-172, wiebelt u met uw vleugels ter begroeting of door de passaatwind? Cessna: Geen van beide toren, een tropische vlieg zat op mijn neus!", speaker: "Toren TNCA & Cessna 172" },
    { text: "Aruba Departure: Welkom VIP Phenom Jet, vlieg naar 5000 voet en geniet van de Caribische zon. Onthoud altijd: Jouw reis Begint in de lucht!", speaker: "Aruba Control & VIP Jet" },
    { text: "Toren TNCA: Robinson-Heli-44, gelieve niet te lang stil te hangen boven de churros-kraam op Palm Beach. U blaast alle suiker van de gasten weg!", speaker: "Toren TNCA & Heli-99" },
    { text: "Toren TNCA: Cessna-150, u bent nummer 2 voor landing achter de roze flamingo. Cessna: Begrepen toren, we houden veilige afstand van de vogel.", speaker: "TNCA Tower" },
    { text: "Instructeur Kevin: Trevor! Gelieve niet WEER onder de Koningin Julianabrug door te vliegen tijdens je testvlucht vandaag!", speaker: "LCO Instructeur (Kevin)" },
    { text: "LCO Hangar: Heeft iemand de contactsleutels van de Phenom Jet meegenomen? Kevin heeft ze nu nodig voor een VIP rondvlucht over Aruba!", speaker: "Showroom Hoofd (Maria)" }
  ];

  const currentChatter = radioChatterQuotes[chatterIndex];



  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between">
      {/* Dynamic Navigation */}
      <Navigation 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Main Dynamic Workspace Area */}
      <main className="flex-grow">
        {transactionSuccess && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-5 rounded-2xl flex items-center space-x-4 animate-fade-in text-emerald-400">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Betaling Geaccepteerd</h4>
                <p className="text-xs text-slate-300 mt-1">{transactionSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === "home" && (
          <div>
            {/* Elegant Hero Section */}
            <header className="relative bg-slate-950/70 border-b border-slate-900 overflow-hidden py-24 sm:py-32">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-90"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero brand texts (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-[#ea580c]/10 border border-[#ea580c]/15 px-3.5 py-1.5 rounded-full text-[#ea580c] text-xs font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Luchtvaartschool & Vliegtuigverkoop</span>
                  </div>
                                    <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-none text-white uppercase">
                    Jouw reis <span className="text-[#ea580c] block mt-2">Begint in de lucht.</span>
                  </h1>
                  
                  <p className="text-slate-400 text-sm sm:text-lg leading-relaxed max-w-2xl font-light">
                    Behaal uw vliegbrevet voor Helikopter of Vliegtuig door simpelweg een ticket te maken in onze Discord.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => setCurrentTab("brevetten")}
                      className="bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 font-bold font-mono text-center tracking-wider uppercase text-xs sm:text-sm px-8 py-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#ea580c]/15 animate-pulse"
                    >
                      Behaal Vliegbrevet
                    </button>
                  </div>
                </div>

                {/* Futuristic movable map of GTA airport LSIA with standard dark luxurious styling */}
                <div className="lg:col-span-5">
                  <LSIAFuturisticMap />
                </div>
              </div>
            </header>

            {/* Management Announcement Banner */}
            {announcement && announcement.trim() !== "" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="bg-[#ea580c]/5 border border-[#ea580c]/15 p-6 sm:p-8 rounded-3xl flex items-start gap-4 shadow-xl shadow-[#ea580c]/5 relative overflow-hidden group hover:border-[#ea580c]/35 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-12 bg-gradient-to-bl from-[#ea580c]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="p-3.5 bg-[#ea580c]/15 border border-[#ea580c]/10 rounded-2xl text-[#ea580c] shrink-0 mt-0.5 animate-bounce">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 text-left z-10">
                    <span className="text-[9px] text-[#ea580c] font-mono tracking-widest uppercase font-bold bg-[#ea580c]/10 px-2.5 py-1 rounded-full border border-[#ea580c]/10">
                      📢 Belangrijke Mededeling van Directie
                    </span>
                    <p className="text-white text-sm sm:text-base leading-relaxed font-sans font-medium pt-2 whitespace-pre-line">
                      {announcement}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Aviation Academy Pillars section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Pillar 1 */}
                <div className="bg-slate-950/50 p-8 rounded-2xl border border-slate-850/85 hover:border-slate-800 transition-all hover:-translate-y-1">
                  <div className="p-3.5 bg-brand-500/10 border border-brand-500/10 rounded-xl h-12 w-12 flex items-center justify-center text-brand-500 mb-6 font-bold">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-white">Vliegbrevetten</h3>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed font-light">
                    Kies uw gewenste categorie en open een ticket in onze Discord. Onze instructeurs plannen een theorie- en praktijkbeoordeling met u in.
                  </p>
                  <button onClick={() => setCurrentTab("brevetten")} className="mt-5 text-xs font-mono font-bold text-[#ea580c] flex items-center gap-1 hover:underline cursor-pointer uppercase">
                    <span>Bekijk Brevetten</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* Pillar 2 (Vliegtuig & Heli Catalogus) */}
                <div className="bg-slate-950/50 p-8 rounded-2xl border border-slate-850/85 hover:border-slate-800 transition-all hover:-translate-y-1">
                  <div className="p-3.5 bg-[#ea580c]/10 border border-[#ea580c]/10 rounded-xl h-12 w-12 flex items-center justify-center text-[#ea580c] mb-6 font-bold">
                    <Plane className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-white">Vliegtuig & Helikopter Catalogus</h3>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed font-light">
                    Ontdek uw ultieme vrijheid! Bekijk onze exclusieve catalogus met perfect onderhouden helikopters, premium propellervliegtuigen en snelle privéjets. Direct klaar om de lucht mee te veroveren.
                  </p>
                  <button onClick={() => setCurrentTab("marketplace")} className="mt-5 text-xs font-mono font-bold text-[#ea580c] flex items-center gap-1 hover:underline cursor-pointer uppercase">
                    <span>Bekijk de Catalogus</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) }

        {/* Tab 2: Vliegbrevetten portfolio & purchasing */}
        {currentTab === "brevetten" && (
          <BrevettenHub licenseVisibility={licenseVisibility} />
        )}

        {/* Tab 3: Airplanes/Helicopters Marketplace */}
        {currentTab === "marketplace" && (
          <AircraftMarketplace 
            logbook={logbook}
            onOrderAircraft={handleOrderAircraft}
            inventory={inventory}
            aircraftList={aircraftList}
          />
        )}

        {/* Tab 6: FiveM Staff & Manager portal */}
        {currentTab === "staff" && (
          <StaffPortal 
            issuedLicenses={issuedLicenses}
            onAddLicense={handleAddLicense}
            onRemoveLicense={handleRemoveLicense}
            onUpdateLicense={handleUpdateLicense}
            onClearAllLicenses={handleClearAllLicenses}
            inventory={inventory}
            onUpdateInventory={handleUpdateInventory}
            aircraftList={aircraftList}
            onUpdateAircraftList={handleUpdateAircraftList}
            announcement={announcement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            licenseVisibility={licenseVisibility}
            onUpdateLicenseVisibility={handleUpdateLicenseVisibility}
            propGoogleConnectionType={googleConnectionType}
            onUpdateGoogleConnectionType={handleUpdateGoogleConnectionType}
            propSheetsWebAppUrl={sheetsWebAppUrl}
            onUpdateSheetsWebAppUrl={handleUpdateSheetsWebAppUrl}
            propSavedSpreadsheetId={savedSpreadsheetId}
            onUpdateSavedSpreadsheetId={handleUpdateSavedSpreadsheetId}
          />
        )}
      </main>

      {/* Corporate Aviation Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}
