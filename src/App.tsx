import React from "react";
import { 
  Plane, Compass, Wind, Award, Clock, ArrowRight, Gauge, 
  MapPin, CheckCircle2, ShieldAlert, BookOpen, AlertCircle, Plus, Sparkles, Megaphone 
} from "lucide-react";

import { PilotLogbook, IssuedLicense, AircraftInventory, Aircraft, FinancialConfig, StaffUser, KluHandbookChapter, LicenseLog, Bonus } from "./types";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import BrevettenHub from "./components/BrevettenHub";
import AircraftMarketplace from "./components/AircraftMarketplace";
import StaffPortal from "./components/StaffPortal";
import KluPortal from "./components/KluPortal";
import { DEFAULT_ISSUED_LICENSES, DEFAULT_INVENTORY, AIRCRAFT_LIST, DEFAULT_FINANCIAL_CONFIG } from "./data";
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
  const [currentTab, setCurrentTab] = React.useState<string>("staff");
  const [logbook, setLogbook] = React.useState<PilotLogbook>(DEFAULT_LOGBOOK);
  const [enrolledCourses, setEnrolledCourses] = React.useState<string[]>([]);

  // Shared Authentication states across portals
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState<StaffUser | null>(null);
  const [role, setRole] = React.useState<"owner" | "manager" | "medewerker" | "klu" | null>(null);
  const [fullname, setFullname] = React.useState("");
  
  // Session collision & dynamic kick-out states
  const [kickedOutMessage, setKickedOutMessage] = React.useState<string | null>(null);
  const currentSessionToken = React.useMemo(() => {
    return Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString().slice(-4);
  }, []);
  const isLoggedInRef = React.useRef(isLoggedIn);
  React.useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);
  
  // Direct and manager control states
  const [issuedLicenses, setIssuedLicenses] = React.useState<IssuedLicense[]>([]);
  const [inventory, setInventory] = React.useState<AircraftInventory[]>([]);
  const [aircraftList, setAircraftList] = React.useState<Aircraft[]>([]);
  const [staffAccounts, setStaffAccounts] = React.useState<StaffUser[]>([]);
  const [kluHandbook, setKluHandbook] = React.useState<KluHandbookChapter[]>([]);
  const [logs, setLogs] = React.useState<LicenseLog[]>([]);
  const [bonuses, setBonuses] = React.useState<Bonus[]>([]);

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

  const [financialConfig, setFinancialConfig] = React.useState<FinancialConfig>(() => {
    try {
      const stored = localStorage.getItem("@luchtvaart_oranjestad_financial_config");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse financial config:", e);
    }
    return DEFAULT_FINANCIAL_CONFIG;
  });

  const handleUpdateFinancialConfig = (updated: FinancialConfig) => {
    setFinancialConfig(updated);
    localStorage.setItem("@luchtvaart_oranjestad_financial_config", JSON.stringify(updated));
    saveSharedPortalData({ financialConfig: updated });
  };

  // Auto-switch to staff or klu tab if redirecting back from Discord with code parameter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("code")) {
      const source = localStorage.getItem("@luchtvaart_oranjestad_discord_login_source") || "staff";
      setCurrentTab(source);
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

          // KICK STATE MONITORING: If someone else logged in on another device or tab
          if (isLoggedInRef.current && data.activeSessionId && data.activeSessionId !== currentSessionToken) {
            console.warn("Kicked out! Someone else logged in:", data.activeSessionUser);
            setIsLoggedIn(false);
            setRole(null);
            setLoggedInUser(null);
            setFullname("");
            setKickedOutMessage(
              `U bent automatisch uitgelogd omdat een andere gebruiker (${data.activeSessionUser || "onbekend"}) zojuist elders heeft ingelogd.`
            );
            return;
          }

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
            } else if (serverLics.length === 0 && localLics.length === 0) {
              console.log("Both server and client database are brand new or empty, seeding standard default flying school dataset...");
              const initialData = {
                issuedLicenses: DEFAULT_ISSUED_LICENSES,
                inventory: DEFAULT_INVENTORY,
                aircraftList: AIRCRAFT_LIST,
                announcement: "Welkom bij de vernieuwde directie-omgeving van Vliegschool Oranjestad! De vliegveld database is succesvol gezeed met test-brevetten en vlootvoorraad.",
                googleConnectionType: "webapp" as const,
                sheetsWebAppUrl: "",
                savedSpreadsheetId: "",
                financialConfig: DEFAULT_FINANCIAL_CONFIG
              };
              saveSharedPortalData(initialData);
              setIssuedLicenses(DEFAULT_ISSUED_LICENSES);
              setInventory(DEFAULT_INVENTORY);
              setAircraftList(AIRCRAFT_LIST);
              setAnnouncement(initialData.announcement);
              setFinancialConfig(DEFAULT_FINANCIAL_CONFIG);
              localStorage.setItem(LICENSES_KEY, JSON.stringify(DEFAULT_ISSUED_LICENSES));
              localStorage.setItem(INVENTORY_KEY, JSON.stringify(DEFAULT_INVENTORY));
              localStorage.setItem(AIRCRAFT_LIST_KEY, JSON.stringify(AIRCRAFT_LIST));
              localStorage.setItem("@luchtvaart_oranjestad_financial_config", JSON.stringify(DEFAULT_FINANCIAL_CONFIG));
              return;
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
          if (data.staffAccounts !== undefined) {
            setStaffAccounts(data.staffAccounts);
          }
          if (data.kluHandbook !== undefined) {
            setKluHandbook(data.kluHandbook);
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
          if (data.financialConfig !== undefined && data.financialConfig !== null) {
            setFinancialConfig(data.financialConfig);
            localStorage.setItem("@luchtvaart_oranjestad_financial_config", JSON.stringify(data.financialConfig));
          }
          if (data.logs !== undefined) {
            setLogs(data.logs);
          }
          if (data.bonuses !== undefined) {
            setBonuses(data.bonuses);
            localStorage.setItem("@luchtvaart_oranjestad_bonuses", JSON.stringify(data.bonuses));
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
    logs?: LicenseLog[];
    inventory?: AircraftInventory[];
    aircraftList?: Aircraft[];
    announcement?: string;
    googleConnectionType?: "auth" | "webapp";
    sheetsWebAppUrl?: string;
    savedSpreadsheetId?: string;
    financialConfig?: FinancialConfig;
    staffAccounts?: StaffUser[];
    kluHandbook?: KluHandbookChapter[];
    bonuses?: Bonus[];
    activeSessionId?: string | null;
    activeSessionUser?: string | null;
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

  // Register session when locally logging in
  React.useEffect(() => {
    if (isLoggedIn && loggedInUser) {
      console.log("Registering active session validation id:", currentSessionToken);
      saveSharedPortalData({
        activeSessionId: currentSessionToken,
        activeSessionUser: fullname || loggedInUser.fullname || loggedInUser.username || "Gast"
      });
    }
  }, [isLoggedIn, loggedInUser, currentSessionToken]);

  const handleUpdateStaffAccounts = (updatedAccounts: StaffUser[]) => {
    setStaffAccounts(updatedAccounts);
    saveSharedPortalData({ staffAccounts: updatedAccounts });
  };

  const handleUpdateKluHandbook = (updatedHandbook: KluHandbookChapter[]) => {
    setKluHandbook(updatedHandbook);
    saveSharedPortalData({ kluHandbook: updatedHandbook });
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

    // Capture log details
    const logDetails = newLic.isPreExisting
      ? `Bestaand vliegbrevet handmatig toegevoegd door ${fullname || newLic.issuedBy || "Systeem"} (0 kosten, oorspronkelijke uitgiftedatum: ${newLic.issueDate || "onbekend"}).`
      : `Nieuw vliegbrevet officieel geregistreerd door ${fullname || newLic.issuedBy || "Systeem"} na theorie- en praktijktraject.`;

    const newLog: LicenseLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      action: "Aangemaakt",
      performedBy: fullname || newLic.issuedBy || "Systeem",
      performedByRole: role || "medewerker",
      citizenName: newLic.citizenName,
      citizenId: newLic.citizenId,
      licenseType: newLic.licenseType,
      details: logDetails
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    saveSharedPortalData({ issuedLicenses: updatedLics, logs: updatedLogs });
  };

  const handleRemoveLicense = (licId: string) => {
    const previousLic = issuedLicenses.find(l => l.id === licId);
    const updatedLics = issuedLicenses.filter(l => l.id !== licId);
    setIssuedLicenses(updatedLics);
    try {
      localStorage.setItem(LICENSES_KEY, JSON.stringify(updatedLics));
    } catch (e) {
      console.error("Error saving licenses:", e);
    }

    if (previousLic) {
      const newLog: LicenseLog = {
        id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
        action: "Ingetrokken",
        performedBy: fullname || "Systeem",
        performedByRole: role || "manager",
        citizenName: previousLic.citizenName,
        citizenId: previousLic.citizenId,
        licenseType: previousLic.licenseType,
        details: `Verwijderd uit registratiesysteem (database-cleanup).`
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      saveSharedPortalData({ issuedLicenses: updatedLics, logs: updatedLogs });
    } else {
      saveSharedPortalData({ issuedLicenses: updatedLics });
    }
  };

  const handleUpdateLicense = (updatedLic: IssuedLicense) => {
    const previousLic = issuedLicenses.find(l => l.id === updatedLic.id);
    const updatedLics = issuedLicenses.map(l => l.id === updatedLic.id ? updatedLic : l);
    setIssuedLicenses(updatedLics);
    try {
      localStorage.setItem(LICENSES_KEY, JSON.stringify(updatedLics));
    } catch (e) {
      console.error("Error saving licenses:", e);
    }

    // Log the difference
    let actionType: "Ingetrokken" | "Strike Toegevoegd" | "Hersteld" | "Gewijzigd" = "Gewijzigd";
    let details = `Brevetgegevens bijgewerkt.`;

    if (previousLic) {
      if (!previousLic.revoked && updatedLic.revoked) {
        actionType = "Ingetrokken";
        details = `Brevet ingenomen wegens: ${updatedLic.revokeReason || "Geen reden opgegeven"}`;
      } else if (previousLic.revoked && !updatedLic.revoked) {
        actionType = "Hersteld";
        details = `Brevet succesvol hersteld en geactiveerd door ${fullname}.`;
      } else if ((updatedLic.strikes || 0) > (previousLic.strikes || 0)) {
        actionType = "Strike Toegevoegd";
        const latestStrikeReason = updatedLic.strikeReasons?.[updatedLic.strikeReasons.length - 1] || "Overige overtreding";
        details = `Strike #${updatedLic.strikes} opgelegd wegens: ${latestStrikeReason}`;
      }
    }

    const newLog: LicenseLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
      action: actionType,
      performedBy: fullname || updatedLic.revokedBy || "Beheerder",
      performedByRole: role || "medewerker",
      citizenName: updatedLic.citizenName,
      citizenId: updatedLic.citizenId,
      licenseType: updatedLic.licenseType,
      details
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    saveSharedPortalData({ issuedLicenses: updatedLics, logs: updatedLogs });
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
    <div className="min-h-screen bg-[#02050f] text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-slate-500/30 selection:text-white">
      {/* Absolute High-End Background Decoration Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,_rgba(148,163,184,0.06)_0%,_rgba(148,163,184,0)_70%)] pointer-events-none z-0"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(148,163,184,0.02)_0%,_transparent_70%)] pointer-events-none rounded-full blur-[100px] z-0"></div>
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-[radial-gradient(ellipse_at_center,_rgba(148,163,184,0.02)_0%,_transparent_70%)] pointer-events-none rounded-full blur-[100px] z-0"></div>

      {/* Tactical Grid Background Line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b1329_1px,transparent_1px),linear-gradient(to_bottom,#0b1329_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-[0.25] pointer-events-none z-0" />

      {/* Dynamic Navigation */}
      <Navigation 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* Main Dynamic Workspace Area */}
      <main className="flex-grow z-10 relative">
        {transactionSuccess && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4 animate-fade-in text-slate-200 backdrop-blur-md">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-white" />
              <div>
                <h4 className="font-bold text-sm">Betaling Geaccepteerd</h4>
                <p className="text-xs text-slate-350 mt-1">{transactionSuccess}</p>
              </div>
            </div>
          </div>
        )}

        {currentTab === "home" && (
          <div className="space-y-12">
            {/* Elegant Floating Hero Cockpit Section */}
            <header className="relative bg-slate-950/60 border border-slate-900/80 rounded-[32px] overflow-hidden py-16 sm:py-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 shadow-3xl hover:border-slate-500/10 transition-colors duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 opacity-90 z-0"></div>
              <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-slate-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                {/* Hero brand texts (7 cols) */}
                <div className="lg:col-span-7 space-y-7">
                  <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-slate-350 text-[10px] font-mono font-black uppercase tracking-widest shadow-md">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-slate-400" />
                    <span>Luchtvaartschool & Vliegtuigverkoop Oranjestad</span>
                  </div>
                  
                  <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-none text-white uppercase select-none">
                    Jouw reis <span className="bg-gradient-to-r from-slate-100 via-slate-200 to-white bg-clip-text text-transparent block mt-2 font-extrabold">Begint in de lucht.</span>
                  </h1>
                  
                  <p className="text-slate-405 text-sm sm:text-base leading-relaxed max-w-xl font-light">
                    Behaal uw vliegbrevet voor Helikopter of Vliegtuig door simpelweg een ticket te maken in onze Discord. Wij verzorgen professionele theorie- en praktijkbegeleiding.
                  </p>
                  
                  <div className="pt-2 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => setCurrentTab("brevetten")}
                      className="bg-slate-100 hover:bg-white text-slate-950 font-black font-mono text-center tracking-widest uppercase text-xs sm:text-sm px-8 py-4.5 rounded-2xl transition-all cursor-pointer shadow-xl shadow-white/5 hover:scale-105"
                    >
                      Behaal Vliegbrevet
                    </button>
                    <button
                      onClick={() => setCurrentTab("marketplace")}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white font-black font-mono text-center tracking-widest uppercase text-xs sm:text-sm px-8 py-4.5 rounded-2xl transition-all cursor-pointer"
                    >
                      Showroom Catalogus
                    </button>
                  </div>
                </div>

                {/* Futuristic movable map of GTA airport LSIA with standard dark luxurious styling */}
                <div className="lg:col-span-5 w-full">
                  <LSIAFuturisticMap />
                </div>
              </div>
            </header>

            {/* Management Announcement Banner */}
            {announcement && announcement.trim() !== "" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-8 rounded-[24px] flex items-start gap-4 shadow-xl shadow-white/5 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-12 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-200 shrink-0 mt-0.5 animate-bounce">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-left z-10">
                    <span className="text-[9px] text-slate-300 font-mono tracking-widest uppercase font-black bg-slate-800 px-3 py-1 rounded-full border border-slate-705">
                      📢 Belangrijke Mededeling van Directie
                    </span>
                    <p className="text-white text-sm sm:text-base leading-relaxed font-sans font-medium pt-3 whitespace-pre-line select-none">
                      {announcement}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Aviation Academy Pillars section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Pillar 1 */}
                <div className="bg-slate-950/70 p-8 rounded-[24px] border border-slate-900/80 hover:border-slate-500/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-white/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl h-12 w-12 flex items-center justify-center text-slate-300 mb-6 font-bold group-hover:scale-110 transition-transform">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight">Vliegbrevetten</h3>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed font-light">
                    Kies uw gewenste categorie en open een ticket in onze Discord. Onze instructeurs plannen een theorie- en praktijkbeoordeling met u in.
                  </p>
                  <button onClick={() => setCurrentTab("brevetten")} className="mt-6 text-[10px] font-mono font-black text-slate-300 flex items-center gap-1 hover:text-white cursor-pointer uppercase tracking-wider">
                    <span>Bekijk Brevetten</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Pillar 2 (Vliegtuig & Heli Catalogus) */}
                <div className="bg-slate-950/70 p-8 rounded-[24px] border border-slate-900/80 hover:border-slate-500/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-white/5 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl h-12 w-12 flex items-center justify-center text-slate-300 mb-6 font-bold group-hover:scale-110 transition-transform">
                    <Plane className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white uppercase tracking-tight">Vliegtuig & Helikopter Catalogus</h3>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed font-light">
                    Ontdek uw ultieme vrijheid! Bekijk onze exclusieve catalogus met perfect onderhouden helikopters, premium propellervliegtuigen en snelle privéjets. Direct klaar om de lucht mee te veroveren.
                  </p>
                  <button onClick={() => setCurrentTab("marketplace")} className="mt-6 text-[10px] font-mono font-black text-slate-300 flex items-center gap-1 hover:text-white cursor-pointer uppercase tracking-wider">
                    <span>Bekijk de Catalogus</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) }

        {/* Tab 2: Vliegbrevetten portfolio & purchasing */}
        {currentTab === "brevetten" && (
          <BrevettenHub licenseVisibility={licenseVisibility} financialConfig={financialConfig} />
        )}

        {/* Tab 3: Airplanes/Helicopters Marketplace */}
        {currentTab === "marketplace" && (
          <AircraftMarketplace 
            logbook={logbook}
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
            financialConfig={financialConfig}
            onUpdateFinancialConfig={handleUpdateFinancialConfig}
            staffAccounts={staffAccounts}
            onUpdateStaffAccounts={handleUpdateStaffAccounts}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            loggedInUser={loggedInUser}
            setLoggedInUser={setLoggedInUser}
            role={role}
            setRole={setRole}
            fullname={fullname}
            setFullname={setFullname}
            bonuses={bonuses}
            onUpdateBonuses={(updatedBonuses) => {
              setBonuses(updatedBonuses);
              saveSharedPortalData({ bonuses: updatedBonuses });
            }}
            kickedOutMessage={kickedOutMessage}
            onClearKickedOut={() => setKickedOutMessage(null)}
          />
        )}

        {/* Tab 7: KLu Rijksportaal - Dedicated top-level tab */}
        {currentTab === "klu" && (
          <KluPortal 
            issuedLicenses={issuedLicenses}
            onAddLicense={handleAddLicense}
            logs={logs}
            staffAccounts={staffAccounts}
            onUpdateStaffAccounts={handleUpdateStaffAccounts}
            onUpdateLicense={handleUpdateLicense}
            kluHandbook={kluHandbook}
            onUpdateKluHandbook={handleUpdateKluHandbook}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            loggedInUser={loggedInUser}
            setLoggedInUser={setLoggedInUser}
            role={role}
            setRole={setRole}
            fullname={fullname}
            setFullname={setFullname}
          />
        )}
      </main>

      {/* Corporate Aviation Footer */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}
