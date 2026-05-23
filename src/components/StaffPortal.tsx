import React from "react";
import { 
  ShieldCheck, FileSpreadsheet, PlusCircle, Trash2, 
  Settings, UserCheck, HelpCircle, AlertCircle, FileText, CheckCircle, Plus, Image, Users, HelpCircle as HelpIcon,
  Coins, TrendingUp, Percent, Award, Calendar
} from "lucide-react";
import { IssuedLicense, AircraftInventory, Aircraft, StaffUser } from "../types";

interface StaffPortalProps {
  issuedLicenses: IssuedLicense[];
  onAddLicense: (lic: IssuedLicense) => void;
  onRemoveLicense: (id: string) => void;
  onUpdateLicense: (lic: IssuedLicense) => void;
  inventory: AircraftInventory[];
  onUpdateInventory: (updated: AircraftInventory[]) => void;
  aircraftList: Aircraft[];
  onUpdateAircraftList: (updated: Aircraft[]) => void;
}

// Default staff accounts
const DEFAULT_STAFF_ACCOUNTS: StaffUser[] = [];

const STAFF_ACCOUNTS_KEY = "@luchtvaart_oranjestad_staff_accounts";

interface AircraftStockRowProps {
  key?: React.Key;
  aircraft: Aircraft;
  inventoryItem: AircraftInventory;
  onUpdate: (id: string, stockCount: number, priceOverride?: number) => void;
  onDelete: (id: string) => void;
}

function AircraftStockRow({ aircraft, inventoryItem, onUpdate, onDelete }: AircraftStockRowProps) {
  const [stock, setStock] = React.useState(inventoryItem?.stockCount ?? 0);
  const [priceOverride, setPriceOverride] = React.useState(inventoryItem?.priceOverride ?? "");
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    setStock(inventoryItem?.stockCount ?? 0);
    setPriceOverride(inventoryItem?.priceOverride ?? "");
  }, [inventoryItem]);

  const handleSave = () => {
    onUpdate(aircraft.id, Number(stock), priceOverride !== "" ? Number(priceOverride) : undefined);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isCustom = aircraft.id.startsWith("custom-");

  return (
    <tr className="border-b border-slate-850/60 hover:bg-slate-900/20 transition-all">
      <td className="py-3 px-4 font-bold text-[#ea580c] select-all max-w-[120px] truncate" title={aircraft.id}>
        {aircraft.id}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {aircraft.imageUrl && (
            <img src={aircraft.imageUrl} alt={aircraft.name} className="h-7 w-12 object-cover rounded border border-slate-800 shrink-0" referrerPolicy="no-referrer" />
          )}
          <div>
            <div className="font-sans font-medium text-white text-xs">{aircraft.name}</div>
            <div className="text-[10px] text-slate-500 font-sans">{aircraft.manufacturer}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 capitalize font-sans text-slate-400">
        <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold text-slate-950 ${
          aircraft.type === "helicopter" 
            ? "bg-cyan-400" 
            : aircraft.type === "small-plane" 
            ? "bg-orange-400" 
            : "bg-purple-400"
        }`}>
          {aircraft.type === "helicopter" ? "Helikopter" : aircraft.type === "small-plane" ? "Vliegtuig Klein" : "Vliegtuig Groot"}
        </span>
      </td>
      <td className="py-3 px-4 text-slate-400">
        €{aircraft.basePrice.toLocaleString("nl-NL")}
      </td>
      <td className="py-3 px-4">
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center font-bold text-white focus:border-[#ea580c] outline-none"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[10px]">€</span>
          <input
            type="number"
            placeholder="Origineel"
            value={priceOverride}
            onChange={(e) => setPriceOverride(e.target.value)}
            className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-[#ea580c] outline-none font-bold"
          />
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
              isSaved 
                ? "bg-emerald-500 text-slate-950" 
                : "bg-slate-850 hover:bg-[#ea580c]/20 text-slate-300 hover:text-[#ea580c]"
            }`}
          >
            {isSaved ? "Bewaard!" : "Sla op"}
          </button>
          
          {isCustom && (
            <button
              onClick={() => onDelete(aircraft.id)}
              type="button"
              className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded transition-all cursor-pointer"
              title="Vliegtuig verwijderen uit showroom"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function StaffPortal({ 
  issuedLicenses, 
  onAddLicense, 
  onRemoveLicense,
  onUpdateLicense,
  inventory, 
  onUpdateInventory,
  aircraftList,
  onUpdateAircraftList
}: StaffPortalProps) {
  
  // Accounts management
  const [staffAccounts, setStaffAccounts] = React.useState<StaffUser[]>([]);

  const getDiscordRedirectUri = () => {
    const host = window.location.hostname;
    if (host.includes("luchtvaart-oranjestad.nl")) {
      return "https://www.luchtvaart-oranjestad.nl/";
    }
    return window.location.origin + "/";
  };

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState<StaffUser | null>(null);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"owner" | "manager" | "medewerker" | null>(null);
  const [fullname, setFullname] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  // Active view in portal
  const [activeTab, setActiveTab] = React.useState<"registry" | "issue" | "administration" | "users" | "fleet">("registry");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("all");

  // License / Diploma form states
  const [newCitName, setNewCitName] = React.useState("");
  const [newCitId, setNewCitId] = React.useState("BSN-");
  const [newLicType, setNewLicType] = React.useState<"helicopter" | "small-plane" | "large-plane">("small-plane");
  const [newRemarks, setNewRemarks] = React.useState("");
  const [issuedByTeacher, setIssuedByTeacher] = React.useState("");
  const [formSuccess, setFormSuccess] = React.useState(false);

  // Dynamic plane parameters are retired to focus purely on the Administration
  const [userCreatedMessage, setUserCreatedMessage] = React.useState<string | null>(null);

  // Add user form states (owner feature)
  const [newUsername, setNewUsername] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newFullname, setNewFullname] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState<"manager" | "medewerker">("medewerker");

  // Modern states to bypass standard browser alert/confirm iframe blockers
  const [deleteConfirmationUser, setDeleteConfirmationUser] = React.useState<StaffUser | null>(null);
  const [taxConfirmationData, setTaxConfirmationData] = React.useState<{ unpaidTaxes: number; unpaidGrossTax: number; unpaidStandardTax: number; callback: () => void } | null>(null);
  const [portalAlertMessage, setPortalAlertMessage] = React.useState<string | null>(null);

  // Discord active states
  const [isDiscordLoggingIn, setIsDiscordLoggingIn] = React.useState(false);
  const [discordLoginError, setDiscordLoginError] = React.useState<string | null>(null);

  // New Aircraft and fleet/stock form states
  const [fleetName, setFleetName] = React.useState("");
  const [fleetType, setFleetType] = React.useState<"helicopter" | "small-plane" | "large-plane">("small-plane");
  const [fleetManufacturer, setFleetManufacturer] = React.useState("");
  const [fleetBasePrice, setFleetBasePrice] = React.useState("");
  const [fleetTopSpeed, setFleetTopSpeed] = React.useState("");
  const [fleetRange, setFleetRange] = React.useState("");
  const [fleetEngine, setFleetEngine] = React.useState("");
  const [fleetCapacity, setFleetCapacity] = React.useState("");
  const [fleetDescription, setFleetDescription] = React.useState("");
  const [fleetImageUrl, setFleetImageUrl] = React.useState("");
  const [fleetInitialStock, setFleetInitialStock] = React.useState("5");
  const [fleetSuccessMessage, setFleetSuccessMessage] = React.useState<string | null>(null);

  // New aircraft handlers
  const handleAddCustomAircraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fleetName.trim() || !fleetManufacturer.trim() || !fleetBasePrice) {
      setPortalAlertMessage("Vul alle verplichte velden in!");
      return;
    }

    const uniqueId = "custom-" + Date.now();
    const newAircraft: Aircraft = {
      id: uniqueId,
      name: fleetName.trim(),
      type: fleetType,
      manufacturer: fleetManufacturer.trim(),
      basePrice: Number(fleetBasePrice),
      topSpeedKnots: Number(fleetTopSpeed) || 120,
      rangeKm: Number(fleetRange) || 800,
      engineType: fleetEngine.trim() || "Standaardzuigermotor",
      capacity: Number(fleetCapacity) || 4,
      description: fleetDescription.trim() || "Een prachtig custom vliegtoestel, direct leverbaar uit de showroom.",
      imageTheme: "linear-gradient(135deg, #1e293b, #0f172a)",
      imageUrl: fleetImageUrl.trim() || undefined
    };

    const nextList = [...(aircraftList || []), newAircraft];
    onUpdateAircraftList(nextList);

    const newInv: AircraftInventory = {
      aircraftId: uniqueId,
      stockCount: Number(fleetInitialStock) || 0,
      status: (Number(fleetInitialStock) || 0) > 0 ? "Op voorraad" : "Uitverkocht"
    };
    const nextInv = [...(inventory || []), newInv];
    onUpdateInventory(nextInv);

    setFleetSuccessMessage(`Vliegtuig '${fleetName}' is succesvol toegevoegd aan de catalogus met voorraad!`);
    
    // Reset form fields
    setFleetName("");
    setFleetType("small-plane");
    setFleetManufacturer("");
    setFleetBasePrice("");
    setFleetTopSpeed("");
    setFleetRange("");
    setFleetEngine("");
    setFleetCapacity("");
    setFleetDescription("");
    setFleetImageUrl("");
    setFleetInitialStock("5");

    setTimeout(() => {
      setFleetSuccessMessage(null);
    }, 5000);
  };

  const handleDeleteCustomAircraft = (aircraftId: string) => {
    const nextList = aircraftList.filter(a => a.id !== aircraftId);
    onUpdateAircraftList(nextList);

    const nextInv = inventory.filter(i => i.aircraftId !== aircraftId);
    onUpdateInventory(nextInv);

    setPortalAlertMessage("Vliegtuig is succesvol uit de catalogus verwijderd.");
  };

  const handleUpdateSingleAircraftStock = (aircraftId: string, stock: number, priceOverride?: number) => {
    const exists = inventory.some(i => i.aircraftId === aircraftId);
    let nextInv: AircraftInventory[];
    if (exists) {
      nextInv = inventory.map(item => {
        if (item.aircraftId === aircraftId) {
          return {
            ...item,
            stockCount: stock,
            status: stock > 0 ? "Op voorraad" as const : "Uitverkocht" as const,
            priceOverride: priceOverride ? Number(priceOverride) : undefined
          };
        }
        return item;
      });
    } else {
      nextInv = [
        ...inventory,
        {
          aircraftId,
          stockCount: stock,
          status: stock > 0 ? "Op voorraad" as const : "Uitverkocht" as const,
          priceOverride: priceOverride ? Number(priceOverride) : undefined
        }
      ];
    }
    // Set appropriate status based on inventory stock
    const cleanedInv = nextInv.map(element => ({
      ...element,
      status: element.stockCount > 0 ? ("Op voorraad" as const) : ("Uitverkocht" as const)
    }));
    onUpdateInventory(cleanedInv);
  };

  // Load and sync accounts from local storage
  React.useEffect(() => {
    const stored = localStorage.getItem(STAFF_ACCOUNTS_KEY);
    let accounts: StaffUser[] = [];
    if (stored) {
      try {
        accounts = JSON.parse(stored);
      } catch (e) {
        accounts = [...DEFAULT_STAFF_ACCOUNTS];
      }
    } else {
      accounts = [...DEFAULT_STAFF_ACCOUNTS];
    }

    // Clean up old default test users to prepare for live operation
    accounts = accounts.filter(u => {
      if (u.username === "owner" && u.passwordHash === "oranjestad_owner") return false;
      if (u.username === "manager" && u.passwordHash === "oranjestad123") return false;
      if (u.username === "medewerker" && u.passwordHash === "vliegen456") return false;
      if (u.username === "MikeL" || u.fullname === "Mike Lapose") return false;
      return true;
    });

    setStaffAccounts(accounts);
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, []);

  // Check only for fresh Discord auth code in URL on mount and clear persistent session
  React.useEffect(() => {
    // Explicitly delete any legacy saved session so a refresh always starts logged out
    localStorage.removeItem("@luchtvaart_oranjestad_discord_session");

    // Check for a fresh login callback code in URL search params from Discord OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      // Clear code from URL to keep URI pristine and prevent reload looping
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      handleDiscordLogin(code);
    }
  }, []);

  const handleDiscordLogin = async (authorizationCode: string) => {
    setIsDiscordLoggingIn(true);
    setDiscordLoginError(null);
    setLoginError(null);
    try {
      const redirectUri = getDiscordRedirectUri();
      const response = await fetch("/api/discord/exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authorizationCode, redirectUri }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Mislukt om in te loggen met Discord.");
      }
      
      if (data.success && data.user) {
        setIsLoggedIn(true);
        setRole(data.user.role);
        setFullname(data.user.fullname);
        setIssuedByTeacher(data.user.fullname);
        
        // Push user details into Staff accounts database so we keep them persistent
        const discordUser: StaffUser = {
          id: `discord-${data.user.discordId}`,
          username: data.user.username,
          passwordHash: "LOGGED_IN_VIA_DISCORD",
          role: data.user.role,
          fullname: data.user.fullname
        };

        setLoggedInUser(discordUser);
        
        setStaffAccounts(prev => {
          const exists = prev.some(u => u.id === discordUser.id);
          if (!exists) {
            const next = [...prev, discordUser];
            localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(next));
            return next;
          }
          return prev;
        });

        if (data.user.role === "owner" || data.user.role === "manager") {
          setActiveTab("administration");
        } else {
          setActiveTab("issue");
        }
      }
    } catch (err: any) {
      console.error("Discord login error:", err);
      setDiscordLoginError(err.message || "Authenticatie mislukt.");
    } finally {
      setIsDiscordLoggingIn(false);
    }
  };

  const handleStartDiscordLogin = async () => {
    setDiscordLoginError(null);
    setIsDiscordLoggingIn(true);
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
      console.error("Error starting Discord login:", err);
      setDiscordLoginError(err.message || "Kon geen verbinding maken met de Discord inlogservice.");
      setIsDiscordLoggingIn(false);
    }
  };

  // Bi-weekly tax cycle countdown setup
  const [taxDueDate, setTaxDueDate] = React.useState<number>(() => {
    const saved = localStorage.getItem("@luchtvaart_oranjestad_tax_due_date");
    if (saved) return parseInt(saved, 10);
    const initial = Date.now() + 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem("@luchtvaart_oranjestad_tax_due_date", initial.toString());
    return initial;
  });

  const [timeLeftStr, setTimeLeftStr] = React.useState("");

  React.useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = taxDueDate - now;
      if (diff <= 0) {
        setTimeLeftStr("Belastingafdracht is NU vereist!");
      } else {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const secs = Math.floor((diff % (60 * 1000)) / 1000);
        setTimeLeftStr(`${days}d, ${hours}u, ${mins}m, ${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [taxDueDate]);

  const saveAccounts = (newAccounts: StaffUser[]) => {
    setStaffAccounts(newAccounts);
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(newAccounts));
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const matchedUser = staffAccounts.find(
      u => u.username.toLowerCase() === cleanUser && u.passwordHash === cleanPass
    );

    if (matchedUser) {
      setIsLoggedIn(true);
      setRole(matchedUser.role);
      setFullname(matchedUser.fullname);
      setIssuedByTeacher(matchedUser.fullname); // Pre-set in forms
      setLoggedInUser(matchedUser);
      setLoginError(null);
      // Auto tabs based on role
      if (matchedUser.role === "owner" || matchedUser.role === "manager") {
        setActiveTab("administration");
      } else {
        setActiveTab("issue");
      }
    } else {
      setLoginError("Ongeldige inloggegevens. Vul het correcte wachtwoord in.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setLoggedInUser(null);
    setUsername("");
    setPassword("");
    setFullname("");
    localStorage.removeItem("@luchtvaart_oranjestad_discord_session");
  };

  // Automatically log out if the current logged-in user is deleted or altered in local staff accounts
  React.useEffect(() => {
    if (isLoggedIn && loggedInUser) {
      // Find matches on either ID or username
      const stillExists = staffAccounts.find(
        u => u.id === loggedInUser.id || u.username.toLowerCase() === loggedInUser.username.toLowerCase()
      );
      if (!stillExists) {
        handleLogout();
        setPortalAlertMessage("Jouw medewerkersaccount is ingetrokken of verwijderd door de eigenaar. Je bent direct uitgelogd.");
      } else if (stillExists.role !== role) {
        setRole(stillExists.role);
        setLoggedInUser(stillExists);
      }
    }
  }, [staffAccounts, isLoggedIn, loggedInUser]);

  // Issue License/Diploma handler with financial defaults
  const handleIssueLicenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitName.trim() || !newCitId.trim()) {
      setPortalAlertMessage("Naam en Burger ID zijn verplichte velden!");
      return;
    }

    let finalCitId = newCitId.trim().toUpperCase();
    if (!finalCitId.startsWith("BSN-")) {
      finalCitId = "BSN-" + finalCitId.replace(/^BSN-?/i, "");
    }

    const newLic: IssuedLicense = {
      id: "lic-" + Math.floor(1000 + Math.random() * 9000),
      citizenName: newCitName.trim(),
      citizenId: finalCitId,
      licenseType: newLicType,
      issuedBy: issuedByTeacher || fullname || "Instructeur Oranjestad",
      issueDate: new Date().toLocaleDateString("nl-NL"),
      remarks: newRemarks.trim() || undefined,
      employeeCommissionPaid: false,
      taxPaid: false
    };

    onAddLicense(newLic);
    setFormSuccess(true);
    
    // Reset form fields
    setNewCitName("");
    setNewCitId("BSN-");
    setNewRemarks("");

    setTimeout(() => {
      setFormSuccess(false);
    }, 4500);
  };

  // Add User handler (Owner feature)
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = newUsername.trim().toLowerCase();
    const cleanPass = newPassword.trim();
    const cleanName = newFullname.trim();

    if (!cleanUser || !cleanPass || !cleanName) {
      setPortalAlertMessage("Vul alle velden in!");
      return;
    }

    const usernameExists = staffAccounts.some(u => u.username.toLowerCase() === cleanUser);
    if (usernameExists) {
      setPortalAlertMessage("Gebruikersnaam bestaat al!");
      return;
    }

    const newUser: StaffUser = {
      id: "u-" + Date.now(),
      username: cleanUser,
      passwordHash: cleanPass,
      role: newUserRole,
      fullname: cleanName
    };

    const nextAccounts = [...staffAccounts, newUser];
    saveAccounts(nextAccounts);

    setUserCreatedMessage(`Account voor '${cleanName}' met rol '${newUserRole}' is succesvol aangemaakt!`);
    setNewUsername("");
    setNewPassword("");
    setNewFullname("");

    setTimeout(() => {
      setUserCreatedMessage(null);
    }, 5000);
  };

  // Delete User (Owner feature)
  const handleDeleteUser = (userId: string) => {
    const matched = staffAccounts.find(u => u.id === userId);
    if (!matched) return;
    if (matched.role === "owner") {
      setPortalAlertMessage("U kunt de eigenaar niet verwijderen!");
      return;
    }
    setDeleteConfirmationUser(matched);
  };

  const confirmDeleteUser = () => {
    if (!deleteConfirmationUser) return;
    const nextAccounts = staffAccounts.filter(u => u.id !== deleteConfirmationUser.id);
    saveAccounts(nextAccounts);
    setDeleteConfirmationUser(null);
  };

  // Filtering license list
  const filteredLicenses = issuedLicenses.filter(lic => {
    const matchesSearch = 
      lic.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.citizenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.issuedBy.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || lic.licenseType === filterType;
    return matchesSearch && matchesType;
  });

  const getLicenseTypeLabel = (type: string) => {
    switch(type) {
      case "helicopter": return "Helikopter brevet";
      case "small-plane": return "Vliegtuig Klein brevet";
      case "large-plane": return "Vliegtuig Groot brevet";
      default: return type;
    }
  };

  // Render Login state
  if (!isLoggedIn) {
    return (
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Logo and Greeting */}
          <div className="text-center mb-8">
            <span className="text-[#ea580c] font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-[#ea580c]/10 rounded-full border border-[#ea580c]/10">
              Uitsluitend voor Bevoegde Medewerkers
            </span>
            <h1 className="font-display font-bold text-3xl mt-4 text-white">Medewerkers Login</h1>
            <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
              Log in op het stadsportaal van Luchtvaart Centrum Oranjestad. Maak vliegbewijzen aan en controleer de vloot.
            </p>
          </div>

          {/* Login box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#ea580c]"></div>
            
            {discordLoginError && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs space-y-1 font-light">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500" />
                  <span className="font-semibold text-rose-300">Discord Authenticatie Mislukt</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">{discordLoginError}</p>
                <p className="text-[9px] text-slate-400 leading-normal pt-1 border-t border-rose-500/10 mt-1">
                  Inloggen via Discord is 100% veilig: het portaal gebruikt server-side code om uw Discord rollen uit te lezen zonder uw bot-token of client-secrets bloot te stellen aan inspecteurs.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={isDiscordLoggingIn}
              onClick={handleStartDiscordLogin}
              className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 disabled:bg-[#5865F2]/40 text-white font-bold font-mono py-3 rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-[#5865F2]/10 flex items-center justify-center gap-2"
            >
              {isDiscordLoggingIn ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.93,54.47,1,77.06a107.4,107.4,0,0,0,32.24,16.3,80.7,80.7,0,0,0,6.84-11.15,68.7,68.7,0,0,1-10.85-5.18c.92-.67,1.8-1.37,2.65-2.1a77,77,0,0,0,70.9,0c.85.73,1.73,1.43,2.65,2.1a68.73,68.73,0,0,1-10.85,5.18,80.7,80.7,0,0,0,6.84,11.15,107.4,107.4,0,0,0,32.24-16.3C129.38,50.92,123.35,28.27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
              )}
              <span>{isDiscordLoggingIn ? "Bezig met verbinden..." : "Inloggen met Discord"}</span>
            </button>

            {/* Admin setup instruction helper */}
            <div className="mt-6 pt-5 border-t border-slate-900 text-center">
              <details className="group cursor-pointer select-none">
                <summary className="list-none text-[10px] text-slate-500 hover:text-[#ea580c] transition-colors font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                  <span>ℹ️ Discord Rollen-Koppeling Configureren</span>
                  <span className="text-[8px] group-open:rotate-180 transition-transform block">▼</span>
                </summary>
                <div className="mt-3 text-left bg-slate-900 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-400 space-y-2 leading-relaxed font-light">
                  <p className="font-semibold text-slate-300">Hoe werkt Discord Rollen verificatie?</p>
                  <p>In plaats van onveilige wachtwoorden in de browser te verbergen, gebruikt dit portaal een veilige OAuth2-verbinding in combinatie met een Discord Bot-token op de server.</p>
                  
                  <div className="space-y-1 font-mono text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="text-amber-500 font-bold mb-1">// Server Omgevingsvariabelen (.env)</div>
                    <div>DISCORD_CLIENT_ID=jouw_client_id</div>
                    <div>DISCORD_CLIENT_SECRET=jouw_client_secret</div>
                    <div>DISCORD_BOT_TOKEN=jouw_bot_token_hier</div>
                    <div>DISCORD_GUILD_ID=jouw_server_id</div>
                    <div>DISCORD_ROLE_OWNER=rol_id_eigenaar</div>
                    <div>DISCORD_ROLE_MANAGER=rol_id_manager</div>
                    <div>DISCORD_ROLE_MEDEWERKER=rol_id_medewerker</div>
                  </div>

                  <p className="font-semibold text-slate-300 pt-1">Belangrijk bij Strato Basic Webhosting:</p>
                  <p>Strato Basic Webhosting ondersteunt alleen statische bestanden (HTML/JS/CSS) in de map <code className="text-amber-500 text-xs">dist/</code>. De veilige Discord server endpoints draaien in een Node.js-omgeving op een VPS of Cloud Run container.</p>
                  <p className="text-[10px] text-slate-500">Om Discord login werkend te krijgen op uw Strato-domein, start u de NodeJS server (<code className="text-[#ea580c]">server.ts</code>) op een VPS of backend host, en configureert u daar de Redirect URI naar uw gewenste domein.</p>
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-950 border border-slate-800/80 p-5 rounded-3xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#ea580c]/10 border border-[#ea580c]/20 rounded-xl flex items-center justify-center text-[#ea580c]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Intranet Portaal</h2>
              <p className="text-xs text-slate-400 font-light font-mono">
                Ingelogd als: <strong className="text-[#ea580c] capitalize">{role}</strong> | {fullname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] rounded-lg transition-all cursor-pointer uppercase"
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Tab Navigation inside staff pane */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-900 pb-4">
          
          <button
            onClick={() => setActiveTab("registry")}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "registry"
                ? "bg-slate-950 text-white border border-[#ea580c]"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Klanten & Piloten Register</span>
          </button>

          <button
            onClick={() => setActiveTab("issue")}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "issue"
                ? "bg-slate-950 text-white border border-[#ea580c]"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Diploma Maken</span>
          </button>

          <button
            onClick={() => setActiveTab("administration")}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "administration"
                ? "bg-slate-950 text-white border border-[#ea580c]"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Financiën & Administratie</span>
          </button>

          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "fleet"
                ? "bg-slate-950 text-white border border-[#ea580c]"
                : "bg-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Vloot & Voorraad Beheer</span>
          </button>

          {role === "owner" && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-slate-950 text-white border border-[#ea580c]"
                  : "bg-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Personeel & Accounts ({staffAccounts.length})</span>
            </button>
          )}
        </div>

        {/* Content Tabs Area */}
        {activeTab === "registry" && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-semibold text-base text-white">Uitgegeven Vliegbrevetten</h3>
                  <p className="text-xs text-slate-400 font-light mt-0.5">Overzicht van alle burgers die geslaagd zijn en een bevoegdheid bezitten.</p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Zoek burger, ID of staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg px-3.5 py-1.5 text-xs outline-none focus:border-[#ea580c] w-48 font-mono text-slate-200"
                  />
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#ea580c] font-mono text-slate-300"
                  >
                    <option value="all">Alle Diploma's</option>
                    <option value="helicopter">Helikopter</option>
                    <option value="small-plane">Vliegtuig Klein</option>
                    <option value="large-plane">Vliegtuig Groot</option>
                  </select>
                </div>
              </div>

              {/* Table / Grid */}
              {filteredLicenses.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-850 text-xs text-slate-500">
                  Geen geregistreerde diploma's gevonden voor deze selectie.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase">
                        <th className="py-3 px-4 animate-fade-in">Diploma ID</th>
                        <th className="py-3 px-4">Klant (Piloot)</th>
                        <th className="py-3 px-4">Burger ID / BSN</th>
                        <th className="py-3 px-4">Categorie</th>
                        <th className="py-3 px-4">Docent (Staff)</th>
                        <th className="py-3 px-4">Datum</th>
                        <th className="py-3 px-4">Commissie status</th>
                        <th className="py-3 px-4">Belasting afgedregen</th>
                        {(role === "manager" || role === "owner") && <th className="py-3 px-4 text-right">Intrekken</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 text-slate-300">
                      {filteredLicenses.map((lic) => (
                        <tr key={lic.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4 text-[#ea580c] font-bold">{lic.id}</td>
                          <td className="py-3 px-4 font-sans font-medium text-white">{lic.citizenName}</td>
                          <td className="py-3 px-4 font-bold text-amber-500">{lic.citizenId}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold text-slate-950 ${
                              lic.licenseType === "helicopter" 
                                ? "bg-cyan-400" 
                                : lic.licenseType === "small-plane" 
                                ? "bg-orange-400" 
                                : "bg-purple-400"
                            }`}>
                              {getLicenseTypeLabel(lic.licenseType)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">{lic.issuedBy}</td>
                          <td className="py-3 px-4 text-slate-400">{lic.issueDate}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold ${
                              lic.employeeCommissionPaid 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/25" 
                                : "bg-amber-500/15 text-amber-500 border border-amber-500/20 animate-pulse"
                            }`}>
                              {lic.employeeCommissionPaid ? "Voldaan" : "Openstaand"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold ${
                              lic.taxPaid 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/25" 
                                : "bg-rose-500/20 text-rose-450 border border-rose-500/30"
                            }`}>
                              {lic.taxPaid ? "Afgedragen" : "Openstaand"}
                            </span>
                          </td>
                          {(role === "manager" || role === "owner") && (
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => onRemoveLicense(lic.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded transition-all cursor-pointer"
                                title="Brevet intrekken"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "issue" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-950 border border-slate-800/80 p-6 sm:p-8 rounded-3xl relative">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <UserCheck className="h-5 w-5 text-[#ea580c]" />
                <h3 className="font-display font-semibold text-lg text-white">Zojuist Geslaagde Diploma Registreren</h3>
              </div>
              <p className="text-xs text-slate-400 font-light mb-6">
                Schrijf direct een vliegdiploma uit voor de geslaagde leerling. De bijbehorende medewerkercommissies en belastingen worden automatisch geboekt in ons administratie panel.
              </p>

              {formSuccess && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex gap-2 items-center animate-bounce font-mono">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>Vliegbewijs is succesvol geactiveerd en opgenomen in de computer!</span>
                </div>
              )}

              <form onSubmit={handleIssueLicenseSubmit} className="space-y-4 font-mono text-xs text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Volledige Naam Klant</label>
                    <input
                      type="text"
                      required
                      value={newCitName}
                      onChange={(e) => setNewCitName(e.target.value)}
                      placeholder="bijv: Trevor Philips"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-[#ea580c] font-sans text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold text-amber-500">Burger ID / CID / BSN (Vereist BSN-)</label>
                    <input
                      type="text"
                      required
                      value={newCitId}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (val.startsWith("BSN-")) {
                          setNewCitId(val);
                        } else if (val.length < 4) {
                          setNewCitId("BSN-");
                        } else {
                          setNewCitId("BSN-" + val.replace(/^BSN-?/i, ""));
                        }
                      }}
                      placeholder="BSN-1234"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Soort Diploma</label>
                    <select
                      value={newLicType}
                      onChange={(e) => setNewLicType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-xs text-slate-300 font-sans"
                    >
                      <option value="helicopter">Helikopter brevet</option>
                      <option value="small-plane">Vliegtuig Klein brevet</option>
                      <option value="large-plane">Vliegtuig Groot brevet</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Uitschrijvende Medewerker</label>
                    <select
                      value={issuedByTeacher}
                      onChange={(e) => setIssuedByTeacher(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-xs text-slate-350 font-sans font-bold"
                    >
                      {staffAccounts.map((acc) => (
                        <option key={acc.id} value={acc.fullname}>
                          {acc.fullname} ({acc.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Beoordeling / Examenverslag</label>
                  <textarea
                    rows={3}
                    value={newRemarks}
                    onChange={(e) => setNewRemarks(e.target.value)}
                    placeholder="bijv: Uitstekende vaardigheden met theorie en testvluchten. Geslaagd."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-[#ea580c] outline-none text-xs font-sans text-slate-200"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 font-bold font-mono py-3.5 rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-[#ea580c]/10 flex items-center justify-center gap-1.5"
                >
                  <FileText className="h-4.5 w-4.5" />
                  <span>Registreer Diploma in Database</span>
                </button>
              </form>
            </div>
          </div>
        )}
        {/* CORE ADMINISTRATION & FINANCES TAB (The bookkeeping system) */}
        {activeTab === "administration" && (() => {
          // Financial settings based on requirements
          const getFinancialDetails = (licenseType: "helicopter" | "small-plane" | "large-plane") => {
            switch (licenseType) {
              case "helicopter":
                return {
                  price: 250000,
                  commission: 35000,
                  standardTax: 15000,
                  grossTax: 250000 * 0.07, // €17,500
                  managementFee: 30000, // 2x 15k
                  purchaseCost: 100000 // Inkoop helicopter = 100k
                };
              case "small-plane":
                return {
                  price: 500000,
                  commission: 60000,
                  standardTax: 15000,
                  grossTax: 500000 * 0.07, // €35,000
                  managementFee: 30000, // 2x 15k
                  purchaseCost: 200000 // Inkoop klein vliegtuig = 200k
                };
              case "large-plane":
                return {
                  price: 750000,
                  commission: 80000,
                  standardTax: 15000,
                  grossTax: 750000 * 0.07, // €52,500
                  managementFee: 30000, // 2x 15k
                  purchaseCost: 300000 // Inkoop groot vliegtuig = 300k
                };
              default:
                return { price: 0, commission: 0, standardTax: 0, grossTax: 0, managementFee: 0, purchaseCost: 0 };
            }
          };

          // Aggregate metrics across ALL issued licenses
          const totals = issuedLicenses.reduce((acc, lic) => {
            const details = getFinancialDetails(lic.licenseType);
            
            // Revenue
            acc.grossRevenue += details.price;
            
            // Employee Commissions
            const empPaid = lic.employeeCommissionPaid === true;
            if (empPaid) {
              acc.paidCommission += details.commission;
            } else {
              acc.unpaidCommission += details.commission;
            }
            acc.totalCommission += details.commission;

            // Taxes (7% of gross profit + standard 15k)
            const taxSettle = lic.taxPaid === true;
            const fullTaxForLic = details.standardTax + details.grossTax;
            if (taxSettle) {
              acc.paidTaxes += fullTaxForLic;
            } else {
              acc.unpaidTaxes += fullTaxForLic;
              acc.unpaidStandardTax += details.standardTax;
              acc.unpaidGrossTax += details.grossTax;
            }
            acc.totalTaxes += fullTaxForLic;

            // Management distribution (2x 15k = 30k)
            acc.managementFees += details.managementFee;

            // Licensing material procurement costs (Inkoopkosten)
            acc.purchaseCosts += details.purchaseCost;

            return acc;
          }, {
            grossRevenue: 0,
            paidCommission: 0,
            unpaidCommission: 0,
            totalCommission: 0,
            paidTaxes: 0,
            unpaidTaxes: 0,
            unpaidStandardTax: 0,
            unpaidGrossTax: 0,
            totalTaxes: 0,
            managementFees: 0,
            purchaseCosts: 0
          });

          const totalBusinessExpenses = totals.totalCommission + totals.totalTaxes + totals.managementFees + totals.purchaseCosts;
          // Winstpotje = Totaal Brutowinst - Alle kosten (Werknemers, Belastingen, Management & Inkoopkosten)
          const winstPotjeBalance = totals.grossRevenue - totalBusinessExpenses;

          // Compute individual employee statistics
          const uniqueTeachersList = Array.from(new Set([
            ...staffAccounts.map(u => u.fullname),
            ...issuedLicenses.map(l => l.issuedBy)
          ]));

          const employeeStats = uniqueTeachersList.map(teacherName => {
            const matchesOfTeacher = issuedLicenses.filter(lic => lic.issuedBy === teacherName);
            
            const typeCounts = matchesOfTeacher.reduce((acc, lic) => {
              if (lic.licenseType === "helicopter") acc.helicopter += 1;
              else if (lic.licenseType === "small-plane") acc.smallPlane += 1;
              else if (lic.licenseType === "large-plane") acc.largePlane += 1;
              return acc;
            }, { helicopter: 0, smallPlane: 0, largePlane: 0 });

            const commissionFinances = matchesOfTeacher.reduce((acc, lic) => {
              const details = getFinancialDetails(lic.licenseType);
              if (lic.employeeCommissionPaid) {
                acc.paid += details.commission;
              } else {
                acc.unpaid += details.commission;
              }
              acc.total += details.commission;
              return acc;
            }, { paid: 0, unpaid: 0, total: 0 });

            const staffAccountObject = staffAccounts.find(s => s.fullname === teacherName);

            return {
              fullname: teacherName,
              role: staffAccountObject?.role || "Instructeur",
              totalLicensesCount: matchesOfTeacher.length,
              counts: typeCounts,
              commissions: commissionFinances
            };
          }).filter(e => e.totalLicensesCount > 0 || staffAccounts.some(s => s.fullname === e.fullname));

          // Toggle employee payout status in state
          const handleToggleEmployeePaid = (lic: IssuedLicense) => {
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie (Eigenaar / Manager) mag medewerkers uitbetalingen fiatteren!");
              return;
            }
            const nextPaidState = !lic.employeeCommissionPaid;
            onUpdateLicense({
              ...lic,
              employeeCommissionPaid: nextPaidState
            });
          };

          // Pay corporate taxes (resets countdown and clears taxPaid to true)
          const handlePayTaxesSubmit = () => {
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie mag de twee-wekelijkse belastingen afdragen!");
              return;
            }
            if (totals.unpaidTaxes <= 0) {
              setPortalAlertMessage("Er is geen openstaande belasting om af te dragen!");
              return;
            }

            const executeTaxPayment = () => {
              // Set taxPaid = true for all licenses and trigger update
              issuedLicenses.forEach(lic => {
                if (!lic.taxPaid) {
                  onUpdateLicense({
                    ...lic,
                    taxPaid: true
                  });
                }
              });

              // Reset tax countdown to 14 days from now
              const nextDueDate = Date.now() + 14 * 24 * 60 * 60 * 1000;
              setTaxDueDate(nextDueDate);
              localStorage.setItem("@luchtvaart_oranjestad_tax_due_date", nextDueDate.toString());

              setPortalAlertMessage("De twee-wekelijkse belastingverplichting is met succes afgedragen aan de overheid!");
            };

            setTaxConfirmationData({
              unpaidTaxes: totals.unpaidTaxes,
              unpaidGrossTax: totals.unpaidGrossTax,
              unpaidStandardTax: totals.unpaidStandardTax,
              callback: executeTaxPayment
            });
          };

          return (
            <div className="space-y-8 animate-fade-in font-mono text-xs text-slate-300">
              
              {/* Row 1: Big KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Winstpotje Glowing Bank Vault */}
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[180px]">
                  <div className="absolute -right-6 -bottom-6 opacity-5 text-amber-500">
                    <Coins className="h-32 w-32" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold font-sans bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/15">
                      ★ Zakelijk Winstpotje
                    </span>
                    <h3 className="text-3xl font-black font-display text-white mt-4 tracking-tight">
                      €{winstPotjeBalance.toLocaleString("nl-NL")}
                    </h3>
                  </div>
                  <div className="pt-4 border-t border-slate-900">
                    <p className="text-[10px] font-sans text-slate-400 font-light block leading-relaxed">
                      Alle netto winst na aftrek van inkoopkosten, belasting (7% + 15k), management fees en medewerker premies.
                    </p>
                  </div>
                </div>

                {/* Belastingen Card with countdown */}
                <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#ea580c] uppercase tracking-widest font-bold font-sans bg-[#ea580c]/10 px-2.5 py-1 rounded-full border border-[#ea580c]/10">
                        Corporate Belastingen
                      </span>
                      <span className="text-[10px] text-slate-400">7% + 15k standaard</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-slate-500 text-[10px] uppercase">OPENSTAANDE AFGAVE</div>
                      <h4 className="text-2xl font-bold text-orange-500 mt-1">
                        €{totals.unpaidTaxes.toLocaleString("nl-NL")}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900/40">
                    <div className="flex items-center justify-between text-[10px] space-y-0.5 font-sans">
                      <span className="text-slate-400 block font-light">Betalingstermijn (2 weken):</span>
                      <span className="text-rose-450 font-bold block bg-rose-500/10 px-1.5 py-0.5 rounded font-mono">{timeLeftStr}</span>
                    </div>
                    {(role === "owner" || role === "manager") && totals.unpaidTaxes > 0 ? (
                      <button
                        onClick={handlePayTaxesSubmit}
                        className="w-full mt-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-bold font-mono tracking-wider text-[10px] uppercase rounded-lg py-2 cursor-pointer shadow-lg shadow-orange-500/15"
                      >
                        Voldoe Afdracht Nu
                      </button>
                    ) : (
                      <div className="text-center text-[10px] text-emerald-400 mt-3 border border-emerald-500/10 bg-emerald-500/5 p-1 rounded font-bold uppercase">
                        ✓ Belastingen voldaan
                      </div>
                    )}
                  </div>
                </div>

                {/* Expenditures Card (Kosten overzicht) */}
                <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold font-sans bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/10">
                      Totaal Gelaste Kosten
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-4 font-display">
                      €{totalBusinessExpenses.toLocaleString("nl-NL")}
                    </h3>
                  </div>

                  <div className="pt-3 divide-y divide-slate-900 font-sans text-[10px] text-slate-400">
                    <div className="flex justify-between py-1.5">
                      <span>Inkoopkosten brevetten:</span>
                      <strong className="text-amber-500 font-bold">€{totals.purchaseCosts.toLocaleString("nl-NL")}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Werknemervergoedingen:</span>
                      <strong className="text-slate-200">€{totals.totalCommission.toLocaleString("nl-NL")}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Management fee (2x 15k):</span>
                      <strong className="text-slate-200">€{totals.managementFees.toLocaleString("nl-NL")}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span>Belastingen gedragen:</span>
                      <strong className="text-emerald-400">€{totals.paidTaxes.toLocaleString("nl-NL")}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Performance Statistics for all Employees */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    <h3 className="font-display font-semibold text-base text-white">Prestaties per Werknemer</h3>
                  </div>
                  <span className="text-[10px] text-slate-500">Volledig geautomatiseerd</span>
                </div>
                <p className="text-xs text-slate-400 font-light mb-6">
                  Uitsplitsing van het aantal examens en verdiende premies per instructeur (Heli = €35.000, Vliegtuig Klein = €60.000, Vliegtuig Groot = €80.000).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employeeStats.map((emp) => (
                    <div key={emp.fullname} className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        {/* Name & Role */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-white text-sm">{emp.fullname}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            emp.role === "owner" 
                              ? "bg-rose-500/20 text-rose-450 border border-rose-500/20" 
                              : emp.role === "manager" 
                              ? "bg-amber-500/20 text-amber-450 border border-amber-500/20" 
                              : "bg-blue-500/20 text-blue-450 border border-blue-500/20"
                          }`}>
                            {emp.role}
                          </span>
                        </div>

                        {/* Counts grid */}
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-mono leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                          <div>
                            <div className="text-slate-500 text-[9px] uppercase">HELI</div>
                            <div className="font-bold text-white">{emp.counts.helicopter}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[9px] uppercase">KLEIN</div>
                            <div className="font-bold text-white">{emp.counts.smallPlane}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[9px] uppercase">GROOT</div>
                            <div className="font-bold text-white">{emp.counts.largePlane}</div>
                          </div>
                        </div>
                      </div>

                      {/* Finances section */}
                      <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-sans text-[11px]">Uitschrijvingen:</span>
                          <span className="font-bold text-[#ea580c] text-sm">{emp.totalLicensesCount}</span>
                        </div>
                        <div className="flex justify-between items-center font-sans text-[11px]">
                          <span className="text-slate-400">Totaal verdiend:</span>
                          <strong className="text-white">€{emp.commissions.total.toLocaleString("nl-NL")}</strong>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900/50 text-[10px]">
                          <div className="bg-emerald-500/5 border border-emerald-500/10 p-1.5 rounded text-center">
                            <span className="text-slate-450 block font-sans text-[9px]">UITBETAALD</span>
                            <strong className="text-emerald-400 font-bold">€{emp.commissions.paid.toLocaleString("nl-NL")}</strong>
                          </div>

                          <div className="bg-amber-500/5 border border-amber-500/10 p-1.5 rounded text-center">
                            <span className="text-slate-450 block font-sans text-[9px]">OPENSTAAND</span>
                            <strong className="text-amber-500 font-bold">€{emp.commissions.unpaid.toLocaleString("nl-NL")}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Employee payout checks and switches */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-[#ea580c]" />
                    <h3 className="font-display font-semibold text-base text-white">Uitbetalingsregister & Accordering</h3>
                  </div>
                  <span className="text-[10px] text-slate-500">Openstaande vergoedingen: €{totals.unpaidCommission.toLocaleString("nl-NL")}</span>
                </div>
                <p className="text-xs text-slate-400 font-light mb-6">
                  Vink aan welke werknemer zijn commissie is uitbetaald naar aanleiding van hun uitgegeven diploma.
                  {(role !== "owner" && role !== "manager") && (
                    <span className="text-amber-500 font-bold block mt-1.5">⚠️ U bent ingelogd als Medewerker. Alleen directieleden mogen uitbetalingen fiatteren.</span>
                  )}
                </p>

                {issuedLicenses.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-850 text-xs text-slate-500">
                    Er zijn nog geen vliegbrevetten uitgeschreven om medewerkerscommissies over te berekenen.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase font-bold">
                          <th className="py-3 px-4">Diplomacode</th>
                          <th className="py-3 px-4">Instructeur</th>
                          <th className="py-3 px-4">Klant (Piloot)</th>
                          <th className="py-3 px-4">Diploma type</th>
                          <th className="py-3 px-4">Zijn Commissie</th>
                          <th className="py-3 px-4 text-center">Status Uitbetaald</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60 text-slate-300 font-mono">
                        {issuedLicenses.map((lic) => {
                          const details = getFinancialDetails(lic.licenseType);
                          const isDirectie = role === "owner" || role === "manager";
                          return (
                            <tr key={lic.id} className="hover:bg-slate-900/30 transition-all font-mono">
                              <td className="py-3.5 px-4 font-bold text-amber-500">{lic.id}</td>
                              <td className="py-3.5 px-4 font-bold text-white font-sans">{lic.issuedBy}</td>
                              <td className="py-3.5 px-4 font-sans text-slate-400">{lic.citizenName}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-slate-950 ${
                                  lic.licenseType === "helicopter" 
                                    ? "bg-cyan-400" 
                                    : lic.licenseType === "small-plane" 
                                    ? "bg-orange-400" 
                                    : "bg-purple-400"
                                }`}>
                                  {getLicenseTypeLabel(lic.licenseType)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white font-mono">€{details.commission.toLocaleString("nl-NL")}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={lic.employeeCommissionPaid === true}
                                    disabled={!isDirectie}
                                    onChange={() => handleToggleEmployeePaid(lic)}
                                    className={`w-4.5 h-4.5 rounded text-[#ea580c] focus:ring-[#ea580c] border-slate-850 bg-slate-950 cursor-pointer ${
                                      !isDirectie ? "cursor-not-allowed opacity-60" : ""
                                    }`}
                                  />
                                  <span className={`text-[10px] font-bold uppercase font-sans ${
                                    lic.employeeCommissionPaid ? "text-emerald-400" : "text-amber-500 animate-pulse"
                                  }`}>
                                    {lic.employeeCommissionPaid ? "Betaald" : "Openstaand"}
                                  </span>
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
          );
        })()}

        {/* VLOOT & VOORRAAD BEHEER TAB */}
        {activeTab === "fleet" && (role === "owner" || role === "manager" || role === "medewerker") && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form to ADD aircraft */}
              <div className="lg:col-span-5 bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                  <PlusCircle className="h-5 w-5 text-[#ea580c]" />
                  <h3 className="font-display font-semibold text-base text-white">Nieuw Vliegtuig Toevoegen</h3>
                </div>

                {fleetSuccessMessage && (
                  <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-xs rounded-xl flex gap-2 items-center">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{fleetSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleAddCustomAircraft} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Vliegtuignaam *</label>
                      <input
                        type="text"
                        required
                        placeholder="bijv: Cessna Skyhawk 172"
                        value={fleetName}
                        onChange={(e) => setFleetName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Fabrikant *</label>
                      <input
                        type="text"
                        required
                        placeholder="bijv: Cessna"
                        value={fleetManufacturer}
                        onChange={(e) => setFleetManufacturer(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Type Categorie</label>
                      <select
                        value={fleetType}
                        onChange={(e) => setFleetType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      >
                        <option value="small-plane">Vliegtuig Klein (Single-Engine)</option>
                        <option value="large-plane">Vliegtuig Groot (Multi-Engine/Jet)</option>
                        <option value="helicopter">Helikopter</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Basisprijs (€) *</label>
                      <input
                        type="number"
                        required
                        placeholder="bijv: 350000"
                        value={fleetBasePrice}
                        onChange={(e) => setFleetBasePrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase block">Capaciteit</label>
                      <input
                        type="number"
                        placeholder="Zitplaatsen"
                        value={fleetCapacity}
                        onChange={(e) => setFleetCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase block">Bereik (km)</label>
                      <input
                        type="number"
                        placeholder="Bereik"
                        value={fleetRange}
                        onChange={(e) => setFleetRange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase block">Specs Knopen</label>
                      <input
                        type="number"
                        placeholder="Knopen"
                        value={fleetTopSpeed}
                        onChange={(e) => setFleetTopSpeed(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Motortype & Aandrijving</label>
                    <input
                      type="text"
                      placeholder="bijv: Lycoming O-360 (180 PK)"
                      value={fleetEngine}
                      onChange={(e) => setFleetEngine(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Afbeelding URL</label>
                    <input
                      type="text"
                      placeholder="HTTPS link naar afbeelding"
                      value={fleetImageUrl}
                      onChange={(e) => setFleetImageUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                    />
                    
                    {/* Presets help list */}
                    <div className="mt-2 space-y-1">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Gebruik een van de sample afbeeldingen:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFleetImageUrl("https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80")}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-850 hover:text-white rounded border border-slate-850 text-[9px] text-slate-400 font-sans cursor-pointer transition-colors"
                        >
                          🛩️ Sport Cessna
                        </button>
                        <button
                          type="button"
                          onClick={() => setFleetImageUrl("https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?auto=format&fit=crop&w=800&q=80")}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-850 hover:text-white rounded border border-slate-850 text-[9px] text-slate-400 font-sans cursor-pointer transition-colors"
                        >
                          ✈️ Small Jet
                        </button>
                        <button
                          type="button"
                          onClick={() => setFleetImageUrl("https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80")}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-850 hover:text-white rounded border border-slate-850 text-[9px] text-slate-400 font-sans cursor-pointer transition-colors"
                        >
                          ** Heli
                        </button>
                        <button
                          type="button"
                          onClick={() => setFleetImageUrl("https://images.unsplash.com/photo-1473830394358-91588751b241?auto=format&fit=crop&w=800&q=80")}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-850 hover:text-white rounded border border-slate-850 text-[9px] text-slate-400 font-sans cursor-pointer transition-colors"
                        >
                          🛬 Luxury Jet
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Initiële Voorraad</label>
                      <input
                        type="number"
                        min="0"
                        value={fleetInitialStock}
                        onChange={(e) => setFleetInitialStock(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase block">Korte Beschrijving</label>
                    <textarea
                      rows={2}
                      placeholder="bijv: Luxe zakenvliegtuig met premium interieur en state-of-the-art avionics."
                      value={fleetDescription}
                      onChange={(e) => setFleetDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 font-bold font-mono py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Hangar Catalogus Toevoegen</span>
                  </button>
                </form>
              </div>

              {/* Grid / Table of Hangar Stock */}
              <div className="lg:col-span-12 lg:col-span-7 bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                  <ShieldCheck className="h-5 w-5 text-[#ea580c]" />
                  <h3 className="font-display font-semibold text-base text-white">Winkel Hangar & Catalogus Voorraad</h3>
                </div>

                <p className="text-xs text-slate-400 font-light mb-6">
                  Wijzig hier direct de actuele winkelvoorraad (stock count) of stel een handmatige actie/verkoopprijs (price override) in.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                        <th className="py-3 px-4">Model ID</th>
                        <th className="py-3 px-4">Toestelnaam</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Basisprijs</th>
                        <th className="py-3 px-4">Voorraad</th>
                        <th className="py-3 px-4">Verkoopprijs Actie (€)</th>
                        <th className="py-3 px-4 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aircraftList.map((air) => {
                        const invItem = inventory.find(i => i.aircraftId === air.id) || {
                          aircraftId: air.id,
                          stockCount: 0,
                          status: "Uitverkocht" as const
                        };
                        return (
                          <AircraftStockRow
                            key={air.id}
                            aircraft={air}
                            inventoryItem={invItem}
                            onUpdate={handleUpdateSingleAircraftStock}
                            onDelete={handleDeleteCustomAircraft}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* OWNER USER ACCOUNTS MANAGEMENTS */}
        {activeTab === "users" && role === "owner" && (
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
            {/* LIST of active registered users accounts */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <Users className="h-5 w-5 text-[#ea580c]" />
                <h3 className="font-display font-semibold text-base text-white font-sans text-left">Geregistreerde Medewerkers & Wachtwoorden</h3>
              </div>

              <p className="text-xs text-slate-400 font-light mb-6">
                Hieronder is de volledige lijst van bevoegde medewerkers. U kunt wachtwoorden inzien of medewerkers onmiddellijk ontslaan (wissen).
              </p>

              <div className="space-y-3">
                {staffAccounts.map((user) => (
                  <div key={user.id} className="group/credential bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center justify-between gap-4 font-mono text-xs hover:border-[#ea580c]/40 transition-all duration-300">
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-white font-sans">{user.fullname}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          user.role === "owner" 
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" 
                            : user.role === "manager" 
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" 
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 space-y-1.5 font-mono">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>Gebruikersnaam:</span>
                          <strong className="text-slate-200 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-850/60 select-all transition-all duration-300 blur-sm group-hover/credential:blur-none font-bold">
                            {user.username}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>Wachtwoord:</span>
                          {role === "owner" ? (
                            <strong className="text-amber-500 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-850/60 select-all transition-all duration-300 blur-sm group-hover/credential:blur-none font-bold">
                              {user.passwordHash}
                            </strong>
                          ) : (
                            <span className="text-slate-500 italic font-sans text-[10px] select-none">[Enkel zichtbaar voor Eigenaar]</span>
                          )}
                        </div>
                      </div>
                      {role === "owner" && (
                        <div className="mt-2 text-[9px] text-[#ea580c] opacity-60 group-hover/credential:opacity-0 transition-opacity duration-300 font-sans font-light">
                          (Houd de muis hier over om inloggegevens te tonen)
                        </div>
                      )}
                    </div>

                    {user.role !== "owner" && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        title="Medewerker ontslaan"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Alert Modal */}
        {portalAlertMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl relative">
              <div className="flex items-center gap-3 text-[#ea580c] mb-4">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <h3 className="font-display font-semibold text-lg text-white">Systeembericht</h3>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-mono">
                {portalAlertMessage}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setPortalAlertMessage(null)}
                  className="bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold font-mono py-2 px-5 rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {deleteConfirmationUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl relative">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <Trash2 className="h-6 w-6 shrink-0" />
                <h3 className="font-display font-semibold text-lg text-white">Medewerker Ontslaan?</h3>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed font-mono">
                Weet u zeker dat u de medewerker <strong className="text-white">'{deleteConfirmationUser.fullname}'</strong> wilt ontslaan en zijn account wilt wissen? Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="mt-6 flex justify-end gap-3 font-mono text-xs">
                <button
                  onClick={() => setDeleteConfirmationUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl cursor-pointer border border-slate-800/80 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="bg-red-500 hover:bg-red-700 text-slate-950 font-bold py-2.5 px-5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Ontslaan & Wissen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Tax Confirmation Modal */}
        {taxConfirmationData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full mx-4 shadow-2xl relative">
              <div className="flex items-center gap-3 text-amber-500 mb-4">
                <Coins className="h-6 w-6 shrink-0" />
                <h3 className="font-display font-semibold text-lg text-white">Belastingen Afdragen</h3>
              </div>
              <div className="space-y-3 text-slate-300 text-xs font-mono leading-relaxed">
                <p>Weet u zeker dat u de openstaande belastingen wilt afdragen aan de overheid?</p>
                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span>Totaal openstaand:</span>
                    <strong className="text-amber-500">€{taxConfirmationData.unpaidTaxes.toLocaleString("nl-NL")}</strong>
                  </div>
                  <div className="border-t border-slate-850 my-1 pt-1 opacity-60" />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>- 7% Brutowinst belasting:</span>
                    <span>€{taxConfirmationData.unpaidGrossTax.toLocaleString("nl-NL")}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>- Vast brevet-tarief (15k p.p.):</span>
                    <span>€{taxConfirmationData.unpaidStandardTax.toLocaleString("nl-NL")}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 font-mono text-xs">
                <button
                  onClick={() => setTaxConfirmationData(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/80 font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => {
                    taxConfirmationData.callback();
                    setTaxConfirmationData(null);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 px-5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Voldoen & Afdragen
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
