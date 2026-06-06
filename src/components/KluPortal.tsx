import React from "react";
import { 
  Shield, FileSpreadsheet, Plane, Navigation, Search, 
  HelpCircle, AlertCircle, RefreshCw, LogOut, CheckCircle2, AlertTriangle,
  BookOpen, Plus, Edit2, Trash2, Image, Save, FileText
} from "lucide-react";
import { IssuedLicense, StaffUser, KluHandbookChapter } from "../types";

interface KluPortalProps {
  issuedLicenses: IssuedLicense[];
  staffAccounts: StaffUser[];
  onUpdateStaffAccounts: (accounts: StaffUser[]) => void;
  onUpdateLicense?: (lic: IssuedLicense) => void;
  // Shared Auth props from App.tsx
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  loggedInUser: StaffUser | null;
  setLoggedInUser: (user: StaffUser | null) => void;
  role: "owner" | "manager" | "medewerker" | "klu" | null;
  setRole: (role: "owner" | "manager" | "medewerker" | "klu" | null) => void;
  fullname: string;
  setFullname: (val: string) => void;
  kluHandbook?: KluHandbookChapter[];
  onUpdateKluHandbook?: (handbook: KluHandbookChapter[]) => void;
}

export default function KluPortal({
  issuedLicenses,
  staffAccounts,
  onUpdateStaffAccounts,
  onUpdateLicense,
  isLoggedIn,
  setIsLoggedIn,
  loggedInUser,
  setLoggedInUser,
  role,
  setRole,
  fullname,
  setFullname,
  kluHandbook,
  onUpdateKluHandbook
}: KluPortalProps) {
  // Top-level hooks for KLu search & filter
  const [kluSearch, setKluSearch] = React.useState("");
  const [kluFilter, setKluFilter] = React.useState<"all" | "helicopter" | "small-plane" | "large-plane">("all");
  const [registrySubTab, setRegistrySubTab] = React.useState<"active" | "revoked">("active");

  // Operational Handbook state variables
  const [activeKluView, setActiveKluView] = React.useState<"registry" | "handbook">("registry");
  const [selectedChapterId, setSelectedChapterId] = React.useState<string | null>(null);
  const [isEditingChapter, setIsEditingChapter] = React.useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = React.useState(false);

  // Form states for adding/editing a chapter
  const [chapterTitle, setChapterTitle] = React.useState("");
  const [chapterContent, setChapterContent] = React.useState("");
  const [chapterImageUrl, setChapterImageUrl] = React.useState("");

  // Operational Handbook seed and actions
  const defaultChapters: KluHandbookChapter[] = [
    {
      id: "ch-1",
      title: "Militair Vliegbereik (SAR)",
      content: "### MLC Search & Rescue (SAR) Procedures\n\nOnze Search & Rescue helikopters vliegen spoedeisende en levensreddende missies boven zowel land als zee. Bij noodgevallen is de reactietijd cruciaal.\n\n#### Directe Richtlijnen:\n1. **Gereedheid:** Alle SAR-vliegers dienen binnen 15 minuten na alarmering in de cockpit te zitten.\n2. **Kustwacht Directie:** MLC helikopters coördineren direct met de nationale kustwacht op maritiem VHF Kanaal 16.\n3. **Zoekpatronen:** Gebruik bij voorkeur het 'Expanding Square' of 'Creeping Line' zoekpatroon.\n\nHet dragen van goedgekeurde MLC Night Vision Goggles (NVGs) is te allen tijde verplicht bij nachtelijke SAR-vluchten onder de 500 voet.",
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop",
      createdBy: "MLC Directie",
      createdAt: "06-06-2026 10:00"
    },
    {
      id: "ch-2",
      title: "Radiotelefonie & Tactical Comms",
      content: "### Radiocommunications & Call-signs\n\nStrikte handhaving van radiodiscipline is vereist in alle militaire sectoren van het luchtruim. Wees helder, bondig en zakelijk.\n\n#### Richtlijnen voor Militaire Vliegers:\n* **Aanspreekvorm:** Gebruik altijd uw toegewezen KLu tactische call-sign (bijv. 'Airforce One', 'Eagle-2').\n* **Klankalfabet:** Gebruik uitsluitend de officiële NAVO-spelling van letters en losse cijferuitspraak (bijv. 'drie-nul-nul' voor 300).\n* **ATC-Rapportering:** Meld positie en vlieghoogte onmiddellijk bij het naderen van de Oranjestad CTR boundary.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
      createdBy: "KLu Commandant",
      createdAt: "06-06-2026 10:15"
    }
  ];

  // Auto-seed empty handbook on server
  React.useEffect(() => {
    if (onUpdateKluHandbook && (!kluHandbook || kluHandbook.length === 0)) {
      onUpdateKluHandbook(defaultChapters);
    }
  }, [kluHandbook, onUpdateKluHandbook]);

  // Handle first chapter selection on load
  React.useEffect(() => {
    if ((kluHandbook || []).length > 0 && !selectedChapterId) {
      setSelectedChapterId(kluHandbook![0].id);
    }
  }, [kluHandbook, selectedChapterId]);

  const handleSaveChapter = () => {
    if (!chapterTitle.trim() || !chapterContent.trim()) return;

    const chapters = kluHandbook || [];
    if (isCreatingChapter) {
      const newCh: KluHandbookChapter = {
        id: "ch-" + Date.now(),
        title: chapterTitle.trim(),
        content: chapterContent.trim(),
        imageUrl: chapterImageUrl.trim() || undefined,
        createdBy: fullname || "KLu Officier",
        createdAt: new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
      };
      onUpdateKluHandbook?.([...chapters, newCh]);
      setSelectedChapterId(newCh.id);
    } else if (isEditingChapter && selectedChapterId) {
      const updated = chapters.map(ch => {
        if (ch.id === selectedChapterId) {
          return {
            ...ch,
            title: chapterTitle.trim(),
            content: chapterContent.trim(),
            imageUrl: chapterImageUrl.trim() || undefined
          };
        }
        return ch;
      });
      onUpdateKluHandbook?.(updated);
    }

    setChapterTitle("");
    setChapterContent("");
    setChapterImageUrl("");
    setIsCreatingChapter(false);
    setIsEditingChapter(false);
  };

  const handleDeleteChapter = (id: string) => {
    if (!window.confirm("Weet u zeker dat u deze handboek-sectie wilt verwijderen?")) return;
    const chapters = kluHandbook || [];
    const updated = chapters.filter(ch => ch.id !== id);
    onUpdateKluHandbook?.(updated);
    if (selectedChapterId === id) {
      setSelectedChapterId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleStartEdit = (ch: KluHandbookChapter) => {
    setChapterTitle(ch.title);
    setChapterContent(ch.content);
    setChapterImageUrl(ch.imageUrl || "");
    setIsEditingChapter(true);
    setIsCreatingChapter(false);
  };

  const handleStartCreate = () => {
    setChapterTitle("");
    setChapterContent("");
    setChapterImageUrl("");
    setIsCreatingChapter(true);
    setIsEditingChapter(false);
  };

  // Strike & Revocation Modal states
  const [strikeModalLic, setStrikeModalLic] = React.useState<IssuedLicense | null>(null);
  const [newStrikeReason, setNewStrikeReason] = React.useState<string>("");
  const [revokeModalLic, setRevokeModalLic] = React.useState<IssuedLicense | null>(null);
  const [newRevokeReason, setNewRevokeReason] = React.useState<string>("");

  // Discord Login States
  const [isDiscordLoggingIn, setIsDiscordLoggingIn] = React.useState(false);
  const [discordLoginError, setDiscordLoginError] = React.useState<string | null>(null);

  const getDiscordRedirectUri = () => {
    const host = window.location.hostname;
    if (host.includes("luchtvaart-oranjestad.nl")) {
      return "https://www.luchtvaart-oranjestad.nl/";
    }
    return window.location.origin + "/";
  };

  const handleStartDiscordLogin = async () => {
    setDiscordLoginError(null);
    setIsDiscordLoggingIn(true);
    // Mark source as "klu" in localStorage so App.tsx knows to redirect back to KLu tab
    localStorage.setItem("@luchtvaart_oranjestad_discord_login_source", "klu");
    
    try {
      const redirectUri = getDiscordRedirectUri();
      const res = await fetch(`/api/discord/auth-url?redirectUri=${encodeURIComponent(redirectUri)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Kan Discord inlogprocedure niet starten.");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Geen autorisatie-URL ontvangen van de server.");
      }
    } catch (err: any) {
      console.error("Error starting KLu Discord login:", err);
      setDiscordLoginError(err.message || "Kon geen verbinding maken met de Discord inlogservice.");
      setIsDiscordLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setRole(null);
    setFullname("");
    localStorage.removeItem("@luchtvaart_oranjestad_discord_session");
  };

  const getLicenseTypeLabel = (type: string) => {
    switch (type) {
      case "helicopter": return "Helikopter Brevet";
      case "large-plane": return "Vliegtuig Groot";
      case "small-plane": return "Vliegtuig Klein";
      default: return type;
    }
  };

  const handleAddStrike = (lic: IssuedLicense, reason: string) => {
    const currentStrikes = lic.strikes || 0;
    const currentReasons = lic.strikeReasons || [];
    const updatedStrikes = currentStrikes + 1;
    const updatedReasons = [...currentReasons, reason.trim() || `Regelovertreding #${updatedStrikes}`];
    
    const updatedLic: IssuedLicense = {
      ...lic,
      strikes: updatedStrikes,
      strikeReasons: updatedReasons,
    };
    
    // Auto-revoke if strikes reach 2
    if (updatedStrikes >= 2) {
      updatedLic.revoked = true;
      updatedLic.revokedBy = fullname || "KLu Officier";
      updatedLic.revokeDate = new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: '2-digit', minute: '2-digit' });
      updatedLic.revokeReason = `Automatisch ingenomen wegens het behalen van ${updatedStrikes} strikes. Redenen: ${updatedReasons.join("; ")}`;
    }
    
    if (onUpdateLicense) {
      onUpdateLicense(updatedLic);
    }
    setStrikeModalLic(null);
    setNewStrikeReason("");
  };

  const handleRevokeLicense = (lic: IssuedLicense, reason: string) => {
    const updatedLic: IssuedLicense = {
      ...lic,
      revoked: true,
      revokedBy: fullname || "KLu Officier",
      revokeDate: new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: '2-digit', minute: '2-digit' }),
      revokeReason: reason.trim() || "Ingetrokken door KLu commandanten."
    };
    if (onUpdateLicense) {
      onUpdateLicense(updatedLic);
    }
    setRevokeModalLic(null);
    setNewRevokeReason("");
  };

  const handleResetLicense = (lic: IssuedLicense) => {
    const updatedLic: IssuedLicense = {
      ...lic,
      strikes: 0,
      strikeReasons: [],
      revoked: false,
      revokedBy: undefined,
      revokeDate: undefined,
      revokeReason: undefined
    };
    if (onUpdateLicense) {
      onUpdateLicense(updatedLic);
    }
  };

  // Filter the military/civil licenses based on search, filter, and active/revoked tab
  const filteredKluLicenses = issuedLicenses.filter(lic => {
    const isRevoked = !!lic.revoked;
    const isMatchSubTab = registrySubTab === "active" ? !isRevoked : isRevoked;
    if (!isMatchSubTab) return false;

    const query = kluSearch.toLowerCase().trim();
    const matchesSearch = 
      lic.citizenName.toLowerCase().includes(query) ||
      lic.citizenId.toLowerCase().includes(query) ||
      lic.issuedBy.toLowerCase().includes(query);
    
    const matchesType = kluFilter === "all" || lic.licenseType === kluFilter;
    return matchesSearch && matchesType;
  });

  // Geverifieerde KLu piloten en bevoegde stadsdirectie mogen hierin
  const isAuthorized = isLoggedIn && (role === "owner" || role === "manager" || role === "medewerker" || role === "klu");

  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 text-white py-16 px-4 font-sans text-left">
        <div className="max-w-md mx-auto">
          {/* Logo and Greeting */}
          <div className="text-center mb-8">
            <span className="text-emerald-400 font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/10 animate-pulse">
              Militair Luchtvaart Commando (MLC)
            </span>
            <h1 className="font-display font-black text-3xl mt-4 text-white tracking-tight uppercase flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-emerald-400 animate-pulse" />
              KLu Rijksportaal
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
              Dit segment is uitsluitend bestemd voor piloten van de Koninklijke Luchtmacht en bevoegde stadsdirectie. Log in via Discord om te verifiëren.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none"></div>

            <div className="space-y-4">
              {discordLoginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-300 block font-sans">Verificatie Mislukt</span>
                    <p className="text-[10px] leading-relaxed text-slate-300 font-mono mt-1">{discordLoginError}</p>
                  </div>
                </div>
              )}

              {isLoggedIn && !isAuthorized && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300 block font-sans font-bold">RECHTEN GEWEIGERD</span>
                    <p className="text-[10px] leading-relaxed text-slate-300 font-sans mt-1">
                      U bent ingelogd als <strong className="text-amber-200">"{fullname}"</strong>, maar uw account ({role || "geen rol"}) beschikt niet over de KLu Militaire status of Directie rechten. Neem contact op met MLC commandanten.
                    </p>
                    <button 
                      onClick={handleLogout}
                      className="mt-3.5 px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold tracking-wider text-[9px] uppercase font-mono rounded border border-amber-500/30 cursor-pointer"
                    >
                      Ander Account Log-in
                    </button>
                  </div>
                </div>
              )}



              <button
                type="button"
                disabled={isDiscordLoggingIn}
                onClick={handleStartDiscordLogin}
                className="w-full flex items-center justify-center gap-3.5 px-5 py-4 bg-emerald-500 text-slate-950 font-black tracking-wide text-xs uppercase rounded-xl hover:bg-emerald-400 transition-all font-mono shadow-xl shadow-emerald-500/15 cursor-pointer disabled:opacity-50"
              >
                {isDiscordLoggingIn ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                ) : (
                  <Shield className="h-4 w-4 text-slate-950" />
                )}
                <span>{isDiscordLoggingIn ? "Bezig met verbinden..." : "Militair Inloggen met Discord"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Authenticated KLu Dashboard
  return (
    <div className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Glow Hero Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#022c22]/40 border-2 border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-3 max-w-2xl text-left font-sans">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-sans font-bold uppercase tracking-widest text-[9px] rounded-full border border-emerald-500/30">
                Rijksportaal Geverifieerd
              </span>
              <span className="px-2.5 py-1 bg-amber-500/15 text-amber-500 font-sans font-bold uppercase tracking-widest text-[9px] rounded-full border border-amber-500/25 animate-pulse">
                DEFCON 4 // ACTIVE MILITARY SESSIONS
              </span>
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight flex items-center gap-3">
              <Shield className="h-7 w-7 text-emerald-400 shrink-0" />
              Koninklijke Luchtmacht (KLu)
            </h2>
            <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xl">
              Welkom bij het gecertificeerde Rijksportaal van het Militair Luchtvaart Commando (MLC). Hier beheert u militaire kwalificaties en examineert u tactische vliegoperaties.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center md:items-end gap-1.5 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl min-w-[220px] text-center md:text-right font-sans">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">Ingelogde Vlieger</div>
            <div className="text-white font-bold text-sm">{fullname || "Gast_Vlieger (Testmodus)"}</div>
            <div className="text-[9px] text-[#5865F2] font-semibold uppercase flex items-center gap-1 mt-1 justify-center md:justify-end font-mono">
              <span>Discord Gekoppeld</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded uppercase mt-2 font-mono">
              Rol: {role === "klu" ? "KLu Piloot / Officier" : role ? `LCO Directie (${role})` : "KLu Gastvlieger (Test)"}
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[9px] uppercase font-mono rounded border border-rose-500/20 cursor-pointer w-full justify-center transition-all"
            >
              <LogOut className="h-3 w-3" />
              <span>Sessie Beëindigen</span>
            </button>
          </div>
        </div>

        {/* Main View Navigation Tabs */}
        <div className="flex bg-slate-950 border border-slate-850 p-1.5 rounded-2xl max-w-sm shadow-xl font-sans text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveKluView("registry");
              setIsCreatingChapter(false);
              setIsEditingChapter(false);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer font-mono ${
              activeKluView === "registry"
                ? "bg-emerald-500 text-slate-950 font-black shadow-md border-emerald-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Register</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveKluView("handbook");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer font-mono ${
              activeKluView === "handbook"
                ? "bg-emerald-500 text-slate-950 font-black shadow-md border-emerald-400"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Handboek</span>
          </button>
        </div>

        {activeKluView === "registry" ? (
          <div className="grid grid-cols-1 gap-8 items-start">
            
            <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-6 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
                    Militair & Civiel Register
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans font-light mt-0.5">Overzicht van alle goedgekeurde vliegbewijzen die momenteel actief of ingetrokken zijn.</p>
                </div>
              </div>

              {/* Segmented subtabs for Registry: Actieve vs Afgenomen */}
              <div className="flex bg-slate-900/60 border border-slate-900 p-1 rounded-xl max-w-sm mb-6">
                <button
                  type="button"
                  onClick={() => setRegistrySubTab("active")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    registrySubTab === "active"
                      ? "bg-[#ea580c] text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Actieve Brevetten ({issuedLicenses.filter(l => !l.revoked).length})
                </button>
                <button
                  type="button"
                  onClick={() => setRegistrySubTab("revoked")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    registrySubTab === "revoked"
                      ? "bg-rose-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Afgenomen Brevetten ({issuedLicenses.filter(l => l.revoked).length})
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8">
                  <input
                    type="text"
                    placeholder="Zoek piloot op naam, ID of instructeur..."
                    value={kluSearch}
                    onChange={(e) => setKluSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 outline-none text-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="md:col-span-4">
                  <select
                    value={kluFilter}
                    onChange={(e) => setKluFilter(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 focus:border-emerald-500 outline-none text-slate-200 text-xs font-mono cursor-pointer"
                  >
                    <option value="all">Alle Bevoegdheden</option>
                    <option value="helicopter">Helikopter Brevetten</option>
                    <option value="small-plane">Kleine Vliegtuigen (Tactisch)</option>
                    <option value="large-plane">Grote Vliegtuigen (Transport)</option>
                  </select>
                </div>
              </div>

              {/* License Table */}
              {filteredKluLicenses.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-850 bg-slate-950/40 rounded-2xl text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-slate-650 mx-auto" />
                  <p className="text-slate-500 text-xs font-mono">Geen piloten of brevetten gevonden...</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-900/60 rounded-2xl">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4 md:w-1/4">Piloot & BSN/CID</th>
                        <th className="py-3 px-4">Brevet Categorie</th>
                        <th className="py-3 px-4">Strikes</th>
                        {registrySubTab === "revoked" ? (
                          <>
                            <th className="py-3 px-4">Ingetrokken door</th>
                            <th className="py-3 px-4">Datum / Reden</th>
                          </>
                        ) : (
                          <th className="py-3 px-4">Registratiedatum</th>
                        )}
                        <th className="py-3 px-4 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {filteredKluLicenses.map((lic) => {
                        return (
                          <tr key={lic.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3.5 px-4 w-1/4">
                              <div className="font-semibold text-white font-sans">{lic.citizenName}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{lic.citizenId}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  lic.licenseType === "helicopter" ? "bg-teal-400" : lic.licenseType === "large-plane" ? "bg-sky-400" : "bg-rose-400"
                                }`}></span>
                                <span className="text-slate-200">{getLicenseTypeLabel(lic.licenseType)}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5" title={`${lic.strikes || 0} van de 2 strikes opgelopen`}>
                                {Array.from({ length: 2 }).map((_, i) => {
                                  const hasStrike = (lic.strikes || 0) > i;
                                  return (
                                    <span
                                      key={i}
                                      className={`h-2.5 w-2.5 rounded-full border transition-all ${
                                        hasStrike
                                          ? "bg-rose-500 border-rose-600 shadow shadow-rose-500 animate-pulse"
                                          : "bg-slate-850 border-slate-700"
                                      }`}
                                      title={hasStrike ? `Strike ${i + 1}: ${lic.strikeReasons?.[i] || "Niet nader gespecificeerd"}` : "Geen strike"}
                                    />
                                  );
                                })}
                                <span className="text-[11px] font-bold text-slate-400 pl-1">
                                  {(lic.strikes || 0)}
                                </span>
                              </div>
                            </td>
                            {registrySubTab === "revoked" ? (
                              <>
                                <td className="py-3.5 px-4 text-slate-300 font-sans font-medium">
                                  <span className="bg-rose-500/10 text-rose-450 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                    🚫 {lic.revokedBy || "Beheerder"}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 font-sans max-w-xs">
                                  <div className="text-[10px] text-slate-500 font-mono mb-1">{lic.revokeDate}</div>
                                  <div className="text-slate-300 text-xs italic break-words leading-relaxed">
                                    "{lic.revokeReason || "Geen reden ingevoerd"}"
                                  </div>
                                </td>
                              </>
                            ) : (
                              <td className="py-3.5 px-4 font-mono text-[10px] text-slate-450">
                                {lic.issueDate}
                              </td>
                            )}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {registrySubTab === "active" ? (
                                  <>
                                    {/* Strike button */}
                                    <button
                                      type="button"
                                      onClick={() => setStrikeModalLic(lic)}
                                      className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                                      title="Strike opleggen (+1)"
                                    >
                                      <AlertTriangle className="h-3.5 w-3.5" />
                                      <span className="text-[10px] font-bold font-sans">+1 Strike</span>
                                    </button>

                                    {/* Revoke button */}
                                    <button
                                      type="button"
                                      onClick={() => setRevokeModalLic(lic)}
                                      className="p-1.5 bg-rose-650/10 border border-rose-650/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-semibold"
                                      title="Brevet intrekken"
                                    >
                                      <Shield className="h-3.5 w-3.5" />
                                      <span className="text-[10px] font-bold font-sans">Innemen</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Weet u zeker dat u het vliegbrevet van ${lic.citizenName} wilt activeren?`)) {
                                        handleResetLicense(lic);
                                      }
                                    }}
                                    className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-semibold font-sans text-[10px]"
                                    title="Brevet herstellen"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Activeren</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* HANDBOOK SECTION */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar (Chapters navigation list) */}
            <div className="md:col-span-4 bg-slate-950 border border-slate-850 rounded-3xl p-5 space-y-4 text-left shadow-xl">
              <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                <div className="font-display font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  Secties ({ (kluHandbook || []).length })
                </div>
                {/* Add Chapter / Heading Button - visible to leaders */}
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="px-2.5 py-1 text-[10px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold uppercase tracking-wider rounded-lg border border-emerald-500/20 flex items-center gap-1 cursor-pointer transition-all font-mono"
                  title="Nieuw Handboekkopje Aanmaken"
                >
                  <Plus className="h-3 w-3" />
                  <span>Nieuw</span>
                </button>
              </div>

              {/* Chapters list */}
              {(!kluHandbook || kluHandbook.length === 0) ? (
                <div className="p-4 border border-dashed border-slate-850 rounded-2xl text-center text-xs text-slate-500 font-mono">
                  Geen hoofdstukken gevonden...
                </div>
              ) : (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {kluHandbook.map((ch) => {
                    const isSelected = selectedChapterId === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setSelectedChapterId(ch.id);
                          setIsCreatingChapter(false);
                          setIsEditingChapter(false);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer block relative overflow-hidden group ${
                          isSelected
                            ? "bg-slate-900 border-emerald-500/30 text-white shadow-md shadow-emerald-500/5"
                            : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/10 hover:border-slate-850"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500 rounded-r"></div>
                        )}
                        <div className="font-bold font-sans truncate">{ch.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between mt-1 pt-1 border-t border-slate-900/30">
                          <span>Door: {ch.createdBy.split(" ")[0]}</span>
                          <span>{ch.createdAt.split(" ")[0]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Main Pane (Chapter View, Creator/Editor) */}
            <div className="md:col-span-8 bg-slate-950 border border-slate-850 rounded-3xl p-6 md:p-8 text-left shadow-xl space-y-6">
              {isCreatingChapter || isEditingChapter ? (
                /* CREATE / EDIT CHAPTER FORM */
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                    <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-emerald-400" />
                      {isCreatingChapter ? "Nieuw Handboekkopje Aanmaken" : "Sectie Bewerken"}
                    </h3>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                      KLu Leiding Beheer
                    </div>
                  </div>

                  <div className="space-y-4 font-sans">
                    {/* Chapter Title input */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono block">
                        Kopje / Hoofdstuk Titel
                      </label>
                      <input
                        type="text"
                        placeholder="bijv. SAR Communicatie & Tactiek"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 outline-none text-slate-200 text-xs font-mono"
                      />
                    </div>

                    {/* Image URL input */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono block flex items-center gap-1">
                        <Image className="h-3.5 w-3.5 text-slate-400" />
                        Afbeelding URL (Foto)
                      </label>
                      <input
                        type="text"
                        placeholder="Voer een Unsplash of openbare foto URL in..."
                        value={chapterImageUrl}
                        onChange={(e) => setChapterImageUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 outline-none text-slate-200 text-xs font-mono"
                      />
                      <p className="text-[9px] text-slate-500 leading-normal font-sans pt-0.5">
                        Tip: Laat dit leeg om de standaard militaire sfeerafbeelding te gebruiken of voer een openbare .jpg/.png URL in.
                      </p>
                    </div>

                    {/* Chapter Content textarea */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono block">
                        Richtlijnen & Voorschriften Inhoud
                      </label>
                      <textarea
                        placeholder="Schrijf hier alle operationele procedures, codes en regels uit onder dit kopje..."
                        value={chapterContent}
                        onChange={(e) => setChapterContent(e.target.value)}
                        className="w-full h-80 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 outline-none resize-none font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Form Action Controls */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-900 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingChapter(false);
                        setIsEditingChapter(false);
                        setChapterTitle("");
                        setChapterContent("");
                        setChapterImageUrl("");
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer"
                    >
                      Annuleren
                    </button>
                    <button
                      type="button"
                      disabled={!chapterTitle.trim() || !chapterContent.trim()}
                      onClick={handleSaveChapter}
                      className="bg-emerald-500 hover:bg-emerald-450 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black py-2.5 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      <span>Sectie Opslaan</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* READ ACTIVE CHAPTER MODE */
                (() => {
                  const activeChapter = (kluHandbook || []).find(ch => ch.id === selectedChapterId);
                  if (!activeChapter) {
                    return (
                      <div className="p-12 text-center text-slate-400 space-y-2 font-sans font-light">
                        <AlertCircle className="h-8 w-8 text-slate-600 mx-auto" />
                        <div>Geen geselecteerde handboek-sectie gevonden of de boeken zijn leeg.</div>
                        <p className="text-[10px] text-slate-600 font-mono">Klik op 'Nieuw' om direct een nieuw MLC-kopje aan te maken.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Operational Banner Picture */}
                      <div className="relative h-44 md:h-52 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                        <img 
                          src={activeChapter.imageUrl || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop"} 
                          alt={activeChapter.title}
                          className="w-full h-full object-cover filter brightness-[0.4]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-left">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono border border-emerald-500/20 rounded-md uppercase tracking-wider">
                            MLC REGELGEVING // CHAPTER {activeChapter.id.slice(-4).toUpperCase()}
                          </span>
                          <h1 className="font-display font-black text-xl md:text-2xl text-white mt-1 leading-tight uppercase tracking-tight">
                            {activeChapter.title}
                          </h1>
                        </div>
                      </div>

                      {/* Meta information row */}
                      <div className="flex flex-wrap items-center justify-between border-y border-slate-900 py-3 text-[10px] text-slate-500 font-mono">
                        <div className="flex items-center gap-1">
                          <span>Gepubliceerd door:</span>
                          <span className="text-slate-350 font-bold">{activeChapter.createdBy}</span>
                        </div>
                        <div>
                          <span>Laatst gewijzigd: {activeChapter.createdAt}</span>
                        </div>
                      </div>

                      {/* Content block with beautiful paragraphing */}
                      <div className="text-slate-300 text-xs md:text-sm leading-relaxed space-y-4 whitespace-pre-wrap font-sans text-left min-h-[160px]">
                        {activeChapter.content}
                      </div>

                      {/* Management actions (Bewerken / Verwijderen) - visible to leaders */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-900">
                        <div className="text-[10px] text-slate-500 italic font-medium font-sans">
                          * MLC handboekvoorschrift is juridisch bindend voor alle actieve vliegers.
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(activeChapter)}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors font-mono"
                            title="Sectie aanpassen"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Bewerken</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(activeChapter.id)}
                            className="bg-slate-900 border border-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors font-mono"
                            title="Sectie wissen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Wissen</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

      </div>

      {/* Modal containers for locally triggered strikes / revokes inside KluPortal */}
      {strikeModalLic && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 text-amber-500 mb-4 font-semibold">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-display font-semibold text-lg text-white">Strike Opleggen (KLu Protocol)</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-sans mb-4">
              U staat op het punt strike <strong className="text-amber-500">#{(strikeModalLic.strikes || 0) + 1}</strong> op te leggen aan <strong className="text-white">{strikeModalLic.citizenName}</strong>.
            </p>
            
            {((strikeModalLic.strikes || 0) + 1) >= 2 && (
              <div className="mb-4 text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[11px]">
                ⚠️ DIRECT INTREKKEN: Dit is de tweede strike voor deze piloot. Het brevet zal automatisch worden ingenomen.
              </div>
            )}
            
            <div className="space-y-2 mb-6">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">Reden voor Strike</label>
              <textarea
                placeholder="Geef hier de reden op..."
                value={newStrikeReason}
                onChange={(e) => setNewStrikeReason(e.target.value)}
                className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStrikeModalLic(null);
                  setNewStrikeReason("");
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                disabled={!newStrikeReason.trim()}
                onClick={() => handleAddStrike(strikeModalLic, newStrikeReason)}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black py-2 px-5 rounded-xl transition-colors cursor-pointer"
              >
                Opleggen
              </button>
            </div>
          </div>
        </div>
      )}

      {revokeModalLic && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-500 mb-4 font-semibold">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-display font-semibold text-lg text-white">Brevet Militaire Innemen</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-sans mb-4">
              U gaat het vliegbrevet van <strong className="text-white">{revokeModalLic.citizenName}</strong> direct en handmatig intrekken.
            </p>
            
            <div className="space-y-2 mb-6">
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">Reden voor Intrekking</label>
              <textarea
                placeholder="Bijv. Gevaarlijk vlieggedrag of regelbreuken..."
                value={newRevokeReason}
                onChange={(e) => setNewRevokeReason(e.target.value)}
                className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-red-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setRevokeModalLic(null);
                  setNewRevokeReason("");
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold py-2 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                disabled={!newRevokeReason.trim()}
                onClick={() => handleRevokeLicense(revokeModalLic, newRevokeReason)}
                className="bg-red-500 hover:bg-red-650 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-2 px-5 rounded-xl transition-colors cursor-pointer"
              >
                Ingetrokken Verklaren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
