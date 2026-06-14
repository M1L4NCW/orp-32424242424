import React from "react";
import { 
  ShieldCheck, FileSpreadsheet, PlusCircle, Trash2, Pencil,
  Settings, UserCheck, HelpCircle, AlertCircle, FileText, CheckCircle, Plus, Image, Users, HelpCircle as HelpIcon,
  Coins, TrendingUp, Percent, Award, Calendar, Megaphone, Shield, Plane, Navigation, AlertTriangle, CheckCircle2
} from "lucide-react";
import { IssuedLicense, AircraftInventory, Aircraft, StaffUser, FinancialConfig, Bonus } from "../types";
import { LICENSES } from "../data";
import { User } from "firebase/auth";
import { 
  initGoogleSheetsAuth, 
  signInWithGoogle, 
  getGoogleAccessToken, 
  logoutGoogle, 
  getSavedSpreadsheetId, 
  saveSpreadsheetId, 
  fetchSpreadsheetTitle, 
  saveLicenseToSheet, 
  syncLicensesToSheet,
  extractSpreadsheetId
} from "../lib/googleSheets";

interface StaffPortalProps {
  issuedLicenses: IssuedLicense[];
  onAddLicense: (lic: IssuedLicense) => void;
  onRemoveLicense: (id: string) => void;
  onUpdateLicense: (lic: IssuedLicense) => void;
  onClearAllLicenses?: () => void;
  inventory: AircraftInventory[];
  onUpdateInventory: (updated: AircraftInventory[]) => void;
  aircraftList: Aircraft[];
  onUpdateAircraftList: (updated: Aircraft[]) => void;
  announcement: string;
  onUpdateAnnouncement: (text: string) => void;
  licenseVisibility?: Record<string, boolean>;
  onUpdateLicenseVisibility?: (visibility: Record<string, boolean>) => void;
  propGoogleConnectionType?: "auth" | "webapp";
  onUpdateGoogleConnectionType?: (type: "auth" | "webapp") => void;
  propSheetsWebAppUrl?: string;
  onUpdateSheetsWebAppUrl?: (url: string) => void;
  propSavedSpreadsheetId?: string;
  onUpdateSavedSpreadsheetId?: (id: string) => void;
  financialConfig?: FinancialConfig;
  onUpdateFinancialConfig?: (config: FinancialConfig) => void;
  staffAccounts: StaffUser[];
  onUpdateStaffAccounts: (accounts: StaffUser[]) => void;
  // Shared Auth states
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  loggedInUser: StaffUser | null;
  setLoggedInUser: (user: StaffUser | null) => void;
  role: "owner" | "manager" | "medewerker" | "klu" | null;
  setRole: (role: "owner" | "manager" | "medewerker" | "klu" | null) => void;
  fullname: string;
  setFullname: (val: string) => void;
  bonuses: Bonus[];
  onUpdateBonuses: (bonuses: Bonus[]) => void;
  kickedOutMessage?: string | null;
  onClearKickedOut?: () => void;
}

// Default staff accounts
const DEFAULT_STAFF_ACCOUNTS: StaffUser[] = [];

const STAFF_ACCOUNTS_KEY = "@luchtvaart_oranjestad_staff_accounts";

interface AircraftStockRowProps {
  key?: React.Key;
  aircraft: Aircraft;
  inventoryItem: AircraftInventory;
  onUpdate: (id: string, stockCount: number, priceOverride?: number, isVisible?: boolean) => void;
  onDelete: (id: string) => void;
}

function AircraftStockRow({ aircraft, inventoryItem, onUpdate, onDelete }: AircraftStockRowProps) {
  const [stock, setStock] = React.useState(inventoryItem?.stockCount ?? 0);
  const [priceOverride, setPriceOverride] = React.useState(inventoryItem?.priceOverride ?? "");
  const [isVisible, setIsVisible] = React.useState(inventoryItem?.isVisible !== false);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    setStock(inventoryItem?.stockCount ?? 0);
    setPriceOverride(inventoryItem?.priceOverride ?? "");
    setIsVisible(inventoryItem?.isVisible !== false);
  }, [inventoryItem]);

  const handleSave = () => {
    onUpdate(aircraft.id, Number(stock), priceOverride !== "" ? Number(priceOverride) : undefined, isVisible);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isCustom = aircraft.id.startsWith("custom-");

  return (
    <tr className="border-b border-slate-850/60 hover:bg-slate-900/20 transition-all font-sans text-left">
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
      <td className="py-3 px-4 text-center">
        <input
          type="checkbox"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
          className="rounded border-slate-800 bg-slate-900 text-[#ea580c] focus:ring-[#ea580c] h-4.5 w-4.5 cursor-pointer accent-[#ea580c] mx-auto block"
          title="Vink aan om dit model zichtbaar te maken in de catalogus"
        />
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
  onClearAllLicenses,
  inventory, 
  onUpdateInventory,
  aircraftList,
  onUpdateAircraftList,
  announcement,
  onUpdateAnnouncement,
  licenseVisibility,
  onUpdateLicenseVisibility,
  propGoogleConnectionType,
  onUpdateGoogleConnectionType,
  propSheetsWebAppUrl,
  onUpdateSheetsWebAppUrl,
  propSavedSpreadsheetId,
  onUpdateSavedSpreadsheetId,
  financialConfig,
  onUpdateFinancialConfig,
  staffAccounts = [],
  onUpdateStaffAccounts,
  isLoggedIn,
  setIsLoggedIn,
  loggedInUser,
  setLoggedInUser,
  role,
  setRole,
  fullname,
  setFullname,
  bonuses = [],
  onUpdateBonuses,
  kickedOutMessage = null,
  onClearKickedOut
}: StaffPortalProps) {
  
  // Selection/Input states for Instructor selection via Discord ID
  const [selectedInstructorId, setSelectedInstructorId] = React.useState<string>("");
  const [useCustomInstructor, setUseCustomInstructor] = React.useState<boolean>(false);
  const [customInstructorName, setCustomInstructorName] = React.useState<string>("");
  const [customInstructorDiscordId, setCustomInstructorDiscordId] = React.useState<string>("");

  // Administration sub-tab & bonus states
  const [adminSubTab, setAdminSubTab] = React.useState<"overzicht" | "bonussen">("overzicht");
  const [bonusRecipient, setBonusRecipient] = React.useState<string>("");
  const [bonusAmount, setBonusAmount] = React.useState<string>("");
  const [bonusReason, setBonusReason] = React.useState<string>("");
  const [bonusSuccessMessage, setBonusSuccessMessage] = React.useState<string | null>(null);
  const [bonusErrorMessage, setBonusErrorMessage] = React.useState<string | null>(null);

  // Discord ID for manual employees creation
  const [newDiscordId, setNewDiscordId] = React.useState<string>("");

  // Editing license states
  const [editingLic, setEditingLic] = React.useState<IssuedLicense | null>(null);
  const [editCitizenName, setEditCitizenName] = React.useState("");
  const [editCitizenId, setEditCitizenId] = React.useState("");
  const [editLicenseType, setEditLicenseType] = React.useState<"helicopter" | "small-plane" | "large-plane">("small-plane");
  const [editUseCustomInstructor, setEditUseCustomInstructor] = React.useState(false);
  const [editSelectedInstructorId, setEditSelectedInstructorId] = React.useState("");
  const [editCustomInstructorName, setEditCustomInstructorName] = React.useState("");
  const [editCustomInstructorDiscordId, setEditCustomInstructorDiscordId] = React.useState("");
  const [editIssueDate, setEditIssueDate] = React.useState("");
  const [editRemarks, setEditRemarks] = React.useState("");
  const [editEmployeePaid, setEditEmployeePaid] = React.useState(false);
  const [editTaxPaid, setEditTaxPaid] = React.useState(false);
  const [editManagementFeePaid, setEditManagementFeePaid] = React.useState(false);

  // Custom tax countdown customization states
  const [isEditingTaxDueDate, setIsEditingTaxDueDate] = React.useState(false);
  const [customTaxDueDateInput, setCustomTaxDueDateInput] = React.useState("");

  const formatTimestampForInput = (timestamp: number) => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleOpenEditModal = (lic: IssuedLicense) => {
    setEditingLic(lic);
    setEditCitizenName(lic.citizenName);
    setEditCitizenId(lic.citizenId);
    setEditLicenseType(lic.licenseType);
    setEditIssueDate(lic.issueDate);
    setEditRemarks(lic.remarks || "");
    setEditEmployeePaid(!!lic.employeeCommissionPaid);
    setEditTaxPaid(!!lic.taxPaid);
    setEditManagementFeePaid(!!lic.managementFeePaid);

    const matchedStaff = staffAccounts.find(s => s.fullname === lic.issuedBy);
    if (matchedStaff) {
      setEditSelectedInstructorId(matchedStaff.id);
      setEditUseCustomInstructor(false);
    } else {
      setEditSelectedInstructorId("");
      setEditUseCustomInstructor(true);
      setEditCustomInstructorName(lic.issuedBy);
      setEditCustomInstructorDiscordId(lic.issuedByDiscordId || "");
    }
  };

  const handleSaveEditLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLic) return;

    let finalInstructorName = "Instructeur Oranjestad";
    let finalInstructorDiscordId = "";

    if (editUseCustomInstructor) {
      finalInstructorName = editCustomInstructorName.trim() || "Aangepaste Instructeur";
      finalInstructorDiscordId = editCustomInstructorDiscordId.trim();
    } else {
      const selectedStaff = staffAccounts.find(s => s.id === editSelectedInstructorId);
      if (selectedStaff) {
        finalInstructorName = selectedStaff.fullname;
        finalInstructorDiscordId = selectedStaff.discordId || "";
      } else {
        // Fallback
        const matchedActive = staffAccounts.find(u => u.fullname === editCustomInstructorName);
        if (matchedActive) {
          finalInstructorDiscordId = matchedActive.discordId || "";
        }
      }
    }

    const updated: IssuedLicense = {
      ...editingLic,
      citizenName: editCitizenName.trim(),
      citizenId: editCitizenId.trim(),
      licenseType: editLicenseType,
      issuedBy: finalInstructorName,
      issuedByDiscordId: finalInstructorDiscordId || undefined,
      issueDate: editIssueDate.trim(),
      remarks: editRemarks.trim() || undefined,
      employeeCommissionPaid: editEmployeePaid,
      taxPaid: editTaxPaid,
      managementFeePaid: editManagementFeePaid
    };

    onUpdateLicense(updated);
    setEditingLic(null);
  };

  React.useEffect(() => {
    if (staffAccounts.length > 0 && !selectedInstructorId) {
      const kevin = staffAccounts.find(u => u.username === "kevin_lco");
      if (kevin) {
        setSelectedInstructorId(kevin.id);
      } else {
        setSelectedInstructorId(staffAccounts[0].id);
      }
    }
  }, [staffAccounts, selectedInstructorId]);

  // Financial dynamic variables for customization
  const [helicopterPrice, setHelicopterPrice] = React.useState(financialConfig?.helicopterPrice ?? 250000);
  const [helicopterCommission, setHelicopterCommission] = React.useState(financialConfig?.helicopterCommission ?? 35000);
  const [helicopterStandardTax, setHelicopterStandardTax] = React.useState(financialConfig?.helicopterStandardTax ?? 15000);
  const [helicopterGrossTaxRate, setHelicopterGrossTaxRate] = React.useState(financialConfig?.helicopterGrossTaxRate ?? 7);
  const [helicopterManagementFee, setHelicopterManagementFee] = React.useState(financialConfig?.helicopterManagementFee ?? 30000);
  const [helicopterPurchaseCost, setHelicopterPurchaseCost] = React.useState(financialConfig?.helicopterPurchaseCost ?? 100000);

  const [smallPlanePrice, setSmallPlanePrice] = React.useState(financialConfig?.smallPlanePrice ?? 500000);
  const [smallPlaneCommission, setSmallPlaneCommission] = React.useState(financialConfig?.smallPlaneCommission ?? 60000);
  const [smallPlaneStandardTax, setSmallPlaneStandardTax] = React.useState(financialConfig?.smallPlaneStandardTax ?? 15000);
  const [smallPlaneGrossTaxRate, setSmallPlaneGrossTaxRate] = React.useState(financialConfig?.smallPlaneGrossTaxRate ?? 7);
  const [smallPlaneManagementFee, setSmallPlaneManagementFee] = React.useState(financialConfig?.smallPlaneManagementFee ?? 30000);
  const [smallPlanePurchaseCost, setSmallPlanePurchaseCost] = React.useState(financialConfig?.smallPlanePurchaseCost ?? 200000);

  const [largePlanePrice, setLargePlanePrice] = React.useState(financialConfig?.largePlanePrice ?? 750000);
  const [largePlaneCommission, setLargePlaneCommission] = React.useState(financialConfig?.largePlaneCommission ?? 80000);
  const [largePlaneStandardTax, setLargePlaneStandardTax] = React.useState(financialConfig?.largePlaneStandardTax ?? 15000);
  const [largePlaneGrossTaxRate, setLargePlaneGrossTaxRate] = React.useState(financialConfig?.largePlaneGrossTaxRate ?? 7);
  const [largePlaneManagementFee, setLargePlaneManagementFee] = React.useState(financialConfig?.largePlaneManagementFee ?? 30000);
  const [largePlanePurchaseCost, setLargePlanePurchaseCost] = React.useState(financialConfig?.largePlanePurchaseCost ?? 300000);

  const [financialSaveSuccess, setFinancialSaveSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (financialConfig) {
      setHelicopterPrice(financialConfig.helicopterPrice);
      setHelicopterCommission(financialConfig.helicopterCommission);
      setHelicopterStandardTax(financialConfig.helicopterStandardTax);
      setHelicopterGrossTaxRate(financialConfig.helicopterGrossTaxRate);
      setHelicopterManagementFee(financialConfig.helicopterManagementFee);
      setHelicopterPurchaseCost(financialConfig.helicopterPurchaseCost);

      setSmallPlanePrice(financialConfig.smallPlanePrice);
      setSmallPlaneCommission(financialConfig.smallPlaneCommission);
      setSmallPlaneStandardTax(financialConfig.smallPlaneStandardTax);
      setSmallPlaneGrossTaxRate(financialConfig.smallPlaneGrossTaxRate);
      setSmallPlaneManagementFee(financialConfig.smallPlaneManagementFee);
      setSmallPlanePurchaseCost(financialConfig.smallPlanePurchaseCost);

      setLargePlanePrice(financialConfig.largePlanePrice);
      setLargePlaneCommission(financialConfig.largePlaneCommission);
      setLargePlaneStandardTax(financialConfig.largePlaneStandardTax);
      setLargePlaneGrossTaxRate(financialConfig.largePlaneGrossTaxRate);
      setLargePlaneManagementFee(financialConfig.largePlaneManagementFee);
      setLargePlanePurchaseCost(financialConfig.largePlanePurchaseCost);
    }
  }, [financialConfig]);

  // Authentication states
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  // Clear existing saved session on load and do not restore it
  React.useEffect(() => {
    try {
      localStorage.removeItem("@luchtvaart_oranjestad_staff_session");
    } catch (e) {
      console.error("Failed to clean up session from localStorage:", e);
    }
  }, []);

  // Google Sheets integration states
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
  const [googleUser, setGoogleUser] = React.useState<User | null>(null);
  const [googleToken, setGoogleToken] = React.useState<string | null>(null);
  const [sheetIdInput, setSheetIdInput] = React.useState<string>(getSavedSpreadsheetId());
  const [connectedSheetTitle, setConnectedSheetTitle] = React.useState<string>("");
  const [isVerifyingSheet, setIsVerifyingSheet] = React.useState<boolean>(false);
  const [sheetError, setSheetError] = React.useState<string | null>(null);
  const [sheetSuccess, setSheetSuccess] = React.useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = React.useState<boolean>(false);

  // Registry Sub-Tabs & Strike / Revocation states
  const [registrySubTab, setRegistrySubTab] = React.useState<"active" | "revoked">("active");
  const [strikeModalLic, setStrikeModalLic] = React.useState<IssuedLicense | null>(null);
  const [newStrikeReason, setNewStrikeReason] = React.useState<string>("");
  const [revokeModalLic, setRevokeModalLic] = React.useState<IssuedLicense | null>(null);
  const [newRevokeReason, setNewRevokeReason] = React.useState<string>("");

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
      updatedLic.revokedBy = fullname || "Systeem";
      updatedLic.revokeDate = new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: '2-digit', minute: '2-digit' });
      updatedLic.revokeReason = `Automatisch ingenomen wegens het behalen van ${updatedStrikes} strikes. Redenen: ${updatedReasons.join("; ")}`;
    }
    
    onUpdateLicense(updatedLic);
    setStrikeModalLic(null);
    setNewStrikeReason("");
    
    if (updatedStrikes >= 2) {
      setPortalAlertMessage(`Brevet van ${lic.citizenName} is automatisch INGENOMEN omdat zij 2 of meer strikes hebben behaald!`);
    } else {
      setPortalAlertMessage(`Strike #${updatedStrikes} succesvol opgelegd aan ${lic.citizenName}.`);
    }
  };

  const handleRevokeLicense = (lic: IssuedLicense, reason: string) => {
    const updatedLic: IssuedLicense = {
      ...lic,
      revoked: true,
      revokedBy: fullname || "Staff",
      revokeDate: new Date().toLocaleDateString("nl-NL") + " " + new Date().toLocaleTimeString("nl-NL", { hour: '2-digit', minute: '2-digit' }),
      revokeReason: reason.trim() || "Onmiddellijk ingenomen door directie/management."
    };
    onUpdateLicense(updatedLic);
    setRevokeModalLic(null);
    setNewRevokeReason("");
    setPortalAlertMessage(`Brevet van ${lic.citizenName} is per direct INGENOMEN.`);
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
    onUpdateLicense(updatedLic);
    setPortalAlertMessage(`Brevet van ${lic.citizenName} is succesvol hersteld (strikes en intrekking gewist).`);
  };

  // Sync state with props loaded from the database
  React.useEffect(() => {
    if (propGoogleConnectionType !== undefined && propGoogleConnectionType !== googleConnectionType) {
      setGoogleConnectionType(propGoogleConnectionType);
    }
  }, [propGoogleConnectionType]);

  React.useEffect(() => {
    if (propSheetsWebAppUrl !== undefined && propSheetsWebAppUrl !== sheetsWebAppUrl) {
      setSheetsWebAppUrl(propSheetsWebAppUrl);
    }
  }, [propSheetsWebAppUrl]);

  React.useEffect(() => {
    if (propSavedSpreadsheetId !== undefined && propSavedSpreadsheetId !== sheetIdInput) {
      setSheetIdInput(propSavedSpreadsheetId);
    }
  }, [propSavedSpreadsheetId]);

  // Auto-connect on mount/poll if webapp type is configured
  React.useEffect(() => {
    if (googleConnectionType === "webapp" && sheetsWebAppUrl) {
      setIsVerifyingSheet(true);
      fetch("/api/sheets-web-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetsWebAppUrl, action: "ping" })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setConnectedSheetTitle(data.title || "Gekoppeld Rekenblad (Apps Script)");
          }
        })
        .catch(err => {
          console.warn("Silent check on webapp loading failed:", err);
        })
        .finally(() => {
          setIsVerifyingSheet(false);
        });
    } else if (googleConnectionType !== "webapp") {
      setConnectedSheetTitle("");
    }
  }, [googleConnectionType, sheetsWebAppUrl]);

  // Initialize and check Google authentication
  React.useEffect(() => {
    const unsubscribe = initGoogleSheetsAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        // Verify sheet if ID is saved and we use standard auth mode
        if (googleConnectionType === "auth") {
          const savedId = getSavedSpreadsheetId();
          if (savedId) {
            setIsVerifyingSheet(true);
            fetchSpreadsheetTitle(savedId, token)
              .then(title => {
                setConnectedSheetTitle(title);
                setSheetError(null);
              })
              .catch(err => {
                setSheetError(err.message || "Fout bij laden van rekenblad.");
              })
              .finally(() => {
                setIsVerifyingSheet(false);
              });
          }
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        if (googleConnectionType === "auth") {
          setConnectedSheetTitle("");
        }
      }
    );
    return () => unsubscribe();
  }, [googleConnectionType]);

  // Google Sheets sign-in trigger
  const handleGoogleSignIn = async () => {
    try {
      setSheetError(null);
      setSheetSuccess(null);
      const result = await signInWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSheetSuccess("Succesvol aangemeld met Google!");
        // If sheetId is already input, check its connectivity
        const extracted = extractSpreadsheetId(sheetIdInput);
        if (extracted) {
          saveSpreadsheetId(extracted);
          setIsVerifyingSheet(true);
          const title = await fetchSpreadsheetTitle(extracted, result.accessToken);
          setConnectedSheetTitle(title);
        }
      }
    } catch (err: any) {
      setSheetError(err.message || "Inloggen met Google mislukt. Probeer het opnieuw.");
    }
  };

  // Google Sheets sign-out trigger
  const handleGoogleSignOut = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setGoogleToken(null);
      setConnectedSheetTitle("");
      setSheetSuccess("Google sessie beëindigd.");
    } catch (err: any) {
      setSheetError(err.message || "Fout bij afmelden.");
    }
  };

  // Verify Web App url connectivity
  const handleVerifyWebApp = async (urlToTest: string) => {
    const trimmedUrl = urlToTest.trim();
    if (!trimmedUrl) {
      setSheetError("Voer een geldige Google Apps Script Web-app URL in.");
      return;
    }
    if (!trimmedUrl.startsWith("https://script.google.com/")) {
      setSheetError("De URL moet een geldige Google Apps Script macro URL zijn beginnend met https://script.google.com/");
      return;
    }

    setIsVerifyingSheet(true);
    setSheetError(null);
    setSheetSuccess(null);

    try {
      const res = await fetch("/api/sheets-web-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl, action: "ping" })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Fout bij verbinden met Apps Script.");
      }

      const data = await res.json();
      if (data.success) {
        setConnectedSheetTitle(data.title || "Gekoppeld Rekenblad (Apps Script)");
        localStorage.setItem("@luchtvaart_oranjestad_sheets_webapp_url", trimmedUrl);
        localStorage.setItem("@luchtvaart_oranjestad_sheets_conn_type", "webapp");
        setGoogleConnectionType("webapp");
        if (onUpdateSheetsWebAppUrl) onUpdateSheetsWebAppUrl(trimmedUrl);
        if (onUpdateGoogleConnectionType) onUpdateGoogleConnectionType("webapp");
        setSheetSuccess(`Succesvol gekoppeld aan de Google Sheet via Apps Script: "${data.title || "Rekenblad"}"!`);
      } else {
        throw new Error(data.error || "Onbekende fout van Google Apps Script.");
      }
    } catch (err: any) {
      setConnectedSheetTitle("");
      setSheetError(err.message || "Kon geen verbinding maken met het Google Apps Script. Controleer de URL en of de Web-app is geïmplementeerd voor 'Iedereen' (Anyone).");
    } finally {
      setIsVerifyingSheet(false);
    }
  };

  // Verify and Save Sheet ID trigger
  const handleVerifyAndSaveSheet = async () => {
    const extracted = extractSpreadsheetId(sheetIdInput);
    if (!extracted) {
      setSheetError("Controleer de Link of ID van het Google Sheets bestand!");
      return;
    }
    
    saveSpreadsheetId(extracted);
    
    if (!googleToken) {
      setSheetError("Meld eerst aan met een Google-account om de verbinding te controleren!");
      return;
    }

    setIsVerifyingSheet(true);
    setSheetError(null);
    setSheetSuccess(null);

    try {
      const title = await fetchSpreadsheetTitle(extracted, googleToken);
      setConnectedSheetTitle(title);
      setSheetSuccess(`Succesvol verbonden met spreadsheet: "${title}".`);
    } catch (err: any) {
      setConnectedSheetTitle("");
      setSheetError(err.message || "Kon geen verbinding maken. Verifieer de machtigingen van dit bestand.");
    } finally {
      setIsVerifyingSheet(false);
    }
  };

  // Sync all licenses starting at Row 12
  const handleSyncAllLicenses = async () => {
    if (googleConnectionType === "webapp") {
      const trimmedUrl = sheetsWebAppUrl.trim();
      if (!trimmedUrl) {
        setSheetError("Vul een geldige Google Apps Script Web-app URL in.");
        return;
      }
      
      const confirmSync = window.confirm(
        `Weet u zeker dat u alle ${issuedLicenses.length} brevetten wilt synchroniseren? Dit overschrijft alle bestaande rijen vanaf rij 12 via uw Google Apps Script.`
      );
      if (!confirmSync) return;

      setIsSyncingAll(true);
      setSheetError(null);
      setSheetSuccess(null);

      try {
        const res = await fetch("/api/sheets-web-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: trimmedUrl, 
            action: "sync", 
            payload: { licenses: issuedLicenses } 
          })
        });

        if (!res.ok) {
          const errJson = await res.json();
          throw new Error(errJson.error || "Fout bij verbinden met Apps Script.");
        }

        const data = await res.json();
        if (data.success) {
          setSheetSuccess(`Succesvol ${data.count} brevetten chronologisch gesynchroniseerd via Google Apps Script vanaf rij 12!`);
        } else {
          throw new Error(data.error || "Onbekende fout van Google Apps Script.");
        }
      } catch (err: any) {
        setSheetError(err.message || "Fout tijdens het exporteren met Google Apps Script.");
      } finally {
        setIsSyncingAll(false);
      }
      return;
    }

    // Standard Auth type fallback
    const extracted = extractSpreadsheetId(sheetIdInput);
    if (!extracted) {
      setSheetError("Vul een geldige Google Sheets ID of Link in.");
      return;
    }

    if (!googleToken) {
      setSheetError("U moet eerst inloggen met een Google-account.");
      return;
    }

    const confirmSync = window.confirm(
      `Weet u zeker dat u alle ${issuedLicenses.length} brevetten wilt synchroniseren? Dit overschrijft alle bestaande rijen vanaf rij 12 in het geselecteerde Google-rekenblad.`
    );
    if (!confirmSync) return;

    setIsSyncingAll(true);
    setSheetError(null);
    setSheetSuccess(null);

    try {
      const syncedCount = await syncLicensesToSheet(extracted, googleToken, issuedLicenses);
      setSheetSuccess(`Succesvol ${syncedCount} brevetten chronologisch weggeschreven vanaf rij 12!`);
    } catch (err: any) {
      setSheetError(err.message || "Fout tijdens het exporteren van alle brevetten.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const getDiscordRedirectUri = () => {
    const host = window.location.hostname;
    if (host.includes("luchtvaart-oranjestad.nl")) {
      return "https://www.luchtvaart-oranjestad.nl/";
    }
    return window.location.origin + "/";
  };

  // Active view in portal
  const [activeTab, setActiveTab] = React.useState<"registry" | "issue" | "administration" | "users" | "fleet" | "klu">("registry");

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
  const [newIsPreExisting, setNewIsPreExisting] = React.useState(false);
  const [newCustomIssueDate, setNewCustomIssueDate] = React.useState("");

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
    if (!fleetName.trim() || !fleetBasePrice) {
      setPortalAlertMessage("Vul alle verplichte velden in!");
      return;
    }

    const uniqueId = "custom-" + Date.now();
    const newAircraft: Aircraft = {
      id: uniqueId,
      name: fleetName.trim(),
      type: fleetType,
      manufacturer: "LCO Hangar",
      basePrice: Number(fleetBasePrice),
      topSpeedKnots: Math.round((Number(fleetTopSpeed) || 222) / 1.852),
      rangeKm: 1000,
      engineType: "Standaard",
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

  const handleUpdateSingleAircraftStock = (aircraftId: string, stock: number, priceOverride?: number, isVisible?: boolean) => {
    const exists = inventory.some(i => i.aircraftId === aircraftId);
    let nextInv: AircraftInventory[];
    if (exists) {
      nextInv = inventory.map(item => {
        if (item.aircraftId === aircraftId) {
          return {
            ...item,
            stockCount: stock,
            status: stock > 0 ? "Op voorraad" as const : "Uitverkocht" as const,
            priceOverride: priceOverride ? Number(priceOverride) : undefined,
            isVisible: isVisible !== undefined ? isVisible : item.isVisible
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
          priceOverride: priceOverride ? Number(priceOverride) : undefined,
          isVisible: isVisible !== undefined ? isVisible : true
        }
      ];
    }
    // Set appropriate status based on inventory stock
    const cleanedInv = nextInv.map(element => ({
      ...element,
      status: element.stockCount > 0 ? ("Op voorraad" as const) : ("Uitverkocht" as const),
      isVisible: element.isVisible !== false // preserve visibility
    }));
    onUpdateInventory(cleanedInv);
  };

  // Seed default staff accounts on server/state if completely empty
  React.useEffect(() => {
    if (staffAccounts.length === 0 && onUpdateStaffAccounts) {
      const initialUsers: StaffUser[] = [
        {
          id: "staff-owner",
          username: "directie",
          passwordHash: "oranjestad_directie",
          role: "owner",
          fullname: "Hoofddirectie Oranjestad",
          discordId: "304859039201928301"
        },
        {
          id: "staff-1",
          username: "kevin_lco",
          passwordHash: "oranjestad123",
          role: "manager",
          fullname: "Kevin Martens (Instructeur)",
          discordId: "948203910293049281"
        },
        {
          id: "staff-2",
          username: "john_doe",
          passwordHash: "oranjestad123",
          role: "medewerker",
          fullname: "John Doe (Instructeur)",
          discordId: "847293049203910293"
        }
      ];
      onUpdateStaffAccounts(initialUsers);
      localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(initialUsers));
    }
  }, [staffAccounts, onUpdateStaffAccounts]);

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
        
        const exists = staffAccounts.some(u => u.id === discordUser.id);
        if (!exists) {
          const next = [...staffAccounts, discordUser];
          localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(next));
          if (onUpdateStaffAccounts) {
            onUpdateStaffAccounts(next);
          }
        }

        if (data.user.role === "owner" || data.user.role === "manager") {
          setActiveTab("administration");
        } else if (data.user.role === "klu") {
          setActiveTab("registry");
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
    if (onClearKickedOut) {
      onClearKickedOut();
    }
    setDiscordLoginError(null);
    setIsDiscordLoggingIn(true);
    // Mark source as "staff" in localStorage so App.tsx knows to redirect back to Staff tab
    localStorage.setItem("@luchtvaart_oranjestad_discord_login_source", "staff");
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
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(newAccounts));
    if (onUpdateStaffAccounts) {
      onUpdateStaffAccounts(newAccounts);
    }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onClearKickedOut) {
      onClearKickedOut();
    }
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
      } else if (matchedUser.role === "klu") {
        setActiveTab("registry");
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
    if (isLoggedIn && loggedInUser && staffAccounts.length > 0) {
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

    let finalInstructorName = "Instructeur Oranjestad";
    let finalInstructorDiscordId = "";

    if (useCustomInstructor) {
      finalInstructorName = customInstructorName.trim() || "Aangepaste Instructeur";
      finalInstructorDiscordId = customInstructorDiscordId.trim();
    } else {
      const selectedStaff = staffAccounts.find(s => s.id === selectedInstructorId);
      if (selectedStaff) {
        finalInstructorName = selectedStaff.fullname;
        finalInstructorDiscordId = selectedStaff.discordId || "";
      } else {
        finalInstructorName = issuedByTeacher || fullname || "Instructeur Oranjestad";
        // Fallback to active logged-in user details if naming matches
        const matchedActive = staffAccounts.find(u => u.fullname === finalInstructorName);
        if (matchedActive) {
          finalInstructorDiscordId = matchedActive.discordId || "";
        }
      }
    }

    const newLic: IssuedLicense = {
      id: "lic-" + Math.floor(1000 + Math.random() * 9000),
      citizenName: newCitName.trim(),
      citizenId: finalCitId,
      licenseType: newLicType,
      issuedBy: finalInstructorName,
      issuedByDiscordId: finalInstructorDiscordId || undefined,
      issueDate: newIsPreExisting && newCustomIssueDate.trim() ? newCustomIssueDate.trim() : new Date().toLocaleDateString("nl-NL"),
      remarks: newRemarks.trim() || undefined,
      employeeCommissionPaid: newIsPreExisting ? true : false,
      taxPaid: newIsPreExisting ? true : false,
      managementFeePaid: newIsPreExisting ? true : false,
      isPreExisting: newIsPreExisting
    };

    onAddLicense(newLic);
    setFormSuccess(true);

    // Save to Google Sheets if connected and configured
    if (googleConnectionType === "webapp") {
      const trimmedUrl = sheetsWebAppUrl.trim();
      if (trimmedUrl) {
        setSheetError(null);
        fetch("/api/sheets-web-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: trimmedUrl, 
            action: "save", 
            payload: { license: newLic } 
          })
        })
          .then(async res => {
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || "Fout bij wegschrijven via Apps Script.");
            }
            return res.json();
          })
          .then(data => {
            if (data.success) {
              setSheetSuccess(`Brevet ${newLic.id} ook direct succesvol weggeschreven op rij ${data.row} via uw Google Apps Script!`);
            } else {
              throw new Error(data.error || "Google Apps Script gaf een foutmelding.");
            }
          })
          .catch(err => {
            console.error("Error saving to sheet on submit via webapp:", err);
            setSheetError(`Fout bij wegschrijven naar Sheets via Apps Script: ${err.message || "Onbekende fout"}`);
          });
      }
    } else {
      const savedSheetId = getSavedSpreadsheetId();
      if (savedSheetId && googleToken) {
        setSheetError(null);
        saveLicenseToSheet(savedSheetId, googleToken, newLic)
          .then(({ row }) => {
            setSheetSuccess(`Brevet ${newLic.id} ook direct succesvol weggeschreven op rij ${row} in Google Sheets!`);
          })
          .catch(err => {
            console.error("Error saving to sheet on submit:", err);
            setSheetError(`Fout bij wegschrijven naar Google Sheets: ${err.message || "Onbekende fout"}`);
          });
      }
    }
    
    // Reset form fields
    setNewCitName("");
    setNewCitId("BSN-");
    setNewRemarks("");
    setNewIsPreExisting(false);
    setNewCustomIssueDate("");

    setTimeout(() => {
      setFormSuccess(false);
    }, 4500);
  };

  // Add User handler (Owner feature)
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newFullname.trim();

    if (!cleanName) {
      setPortalAlertMessage("Vul de volledige naam van de medewerker in!");
      return;
    }

    // Auto-generate a safe, unique username for backward compatibility
    const baseUser = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    let cleanUser = baseUser;
    let counter = 1;
    while (staffAccounts.some(u => u.username.toLowerCase() === cleanUser)) {
      cleanUser = `${baseUser}_${counter}`;
      counter++;
    }

    const cleanPass = "oranjestad_staff";

    const newUser: StaffUser = {
      id: "u-" + Date.now(),
      username: cleanUser,
      passwordHash: cleanPass,
      role: newUserRole,
      fullname: cleanName,
      discordId: newDiscordId.trim() || undefined
    };

    const nextAccounts = [...staffAccounts, newUser];
    saveAccounts(nextAccounts);

    setUserCreatedMessage(`Medewerker '${cleanName}' met rol '${newUserRole}' is succesvol geregistreerd!`);
    setNewUsername("");
    setNewPassword("");
    setNewFullname("");
    setNewDiscordId("");

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
    const isRevoked = !!lic.revoked;
    const isMatchSubTab = registrySubTab === "active" ? !isRevoked : isRevoked;
    if (!isMatchSubTab) return false;

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
            <span className="text-slate-300 font-mono text-xs tracking-widest uppercase font-bold px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
              Uitsluitend voor Medewerkers & KLu Militairen
            </span>
            <h1 className="font-display font-bold text-3xl mt-4 text-white">Rijks- & Stadsportaal</h1>
            <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed font-sans">
              Log in op het stadsportaal van Luchtvaart Centrum of het Rijksportaal van de Koninklijke Luchtmacht (KLu) voor bevoegdhedencontrole.
            </p>
          </div>

          {/* Login box */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
            {kickedOutMessage && (
              <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs space-y-1 font-light">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-550" />
                  <span className="font-semibold text-amber-300 font-sans">Sessie Verbroken / Uitgelogd</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 font-sans">{kickedOutMessage}</p>
                <p className="text-[9px] text-slate-400 leading-normal pt-1 border-t border-amber-500/10 mt-1 font-sans">
                  Er is elders ingelogd op dit account. U bent omwille van de beveiliging automatisch uitgelogd om gelijktijdige sessies te voorkomen.
                </p>
              </div>
            )}
            {discordLoginError && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs space-y-1 font-light">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500" />
                  <span className="font-semibold text-rose-300 font-sans">Discord Authenticatie Mislukt</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 font-sans">{discordLoginError}</p>
                <p className="text-[9px] text-slate-400 leading-normal pt-1 border-t border-rose-500/10 mt-1 font-sans">
                  Inloggen via Discord is 100% veilig: het gebruikt uw Discord rollen om uw rechten te verifiëren zonder wachtwoorden bloot te stellen.
                </p>
              </div>
            )}

            <button
              type="button"
              disabled={isDiscordLoggingIn}
              onClick={handleStartDiscordLogin}
              className="w-full bg-slate-100 hover:bg-white disabled:opacity-50 text-slate-950 font-bold font-mono py-3 rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer shadow-lg shadow-white/5 flex items-center justify-center gap-2"
            >
              {isDiscordLoggingIn ? (
                <div className="h-4 w-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.93,54.47,1,77.06a107.4,107.4,0,0,0,32.24,16.3,80.7,80.7,0,0,0,6.84-11.15,68.7,68.7,0,0,1-10.85-5.18c.92-.67,1.8-1.37,2.65-2.1a77,77,0,0,0,70.9,0c.85.73,1.73,1.43,2.65,2.1a68.73,68.73,0,0,1-10.85,5.18,80.7,80.7,0,0,0,6.84,11.15,107.4,107.4,0,0,0,32.24-16.3C129.38,50.92,123.35,28.27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
              )}
              <span>{isDiscordLoggingIn ? "Bezig met verbinden..." : "Inloggen met Discord"}</span>
            </button>
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
          
          {(role === "owner" || role === "manager" || role === "medewerker" || role === "klu") && (
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
          )}

          {(role === "owner" || role === "manager" || role === "medewerker" || role === "klu") && (
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
          )}

          {(role === "owner" || role === "manager") && (
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
          )}

          {(role === "owner" || role === "manager") && (
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
          )}

          {(role === "owner" || role === "manager") && (
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

              {/* Table / Grid */}
              {filteredLicenses.length === 0 ? (
                <div className="p-12 text-center bg-slate-900/10 rounded-2xl border border-dashed border-slate-850/60 text-xs text-slate-500 space-y-2">
                  <AlertCircle className="h-8 w-8 text-slate-600 mx-auto" />
                  <p>Geen geregistreerde diploma's gevonden voor deze selectie.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase">
                        <th className="py-3 px-4">Diploma ID</th>
                        <th className="py-3 px-4">Klant (Piloot)</th>
                        <th className="py-3 px-4">Burger ID / BSN</th>
                        <th className="py-3 px-4">Categorie</th>
                        <th className="py-3 px-4">Docent (Staff)</th>
                        <th className="py-3 px-4">Strikes</th>
                        {registrySubTab === "revoked" ? (
                          <>
                            <th className="py-3 px-4">Ingetrokken door</th>
                            <th className="py-3 px-4">Datum / Reden</th>
                          </>
                        ) : (
                          <>
                            <th className="py-3 px-4">Datum</th>
                            <th className="py-3 px-4">Financiën Status</th>
                          </>
                        )}
                        <th className="py-3 px-4 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 text-slate-300">
                      {filteredLicenses.map((lic) => (
                        <tr key={lic.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 text-[#ea580c] font-bold">{lic.id}</td>
                          <td className="py-3.5 px-4 font-sans font-medium text-white">{lic.citizenName}</td>
                          <td className="py-3.5 px-4 font-bold text-amber-500">{lic.citizenId}</td>
                          <td className="py-3.5 px-4">
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
                          <td className="py-3.5 px-4 text-slate-400">{lic.issuedBy}</td>
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
                            <>
                              <td className="py-3.5 px-4 text-slate-400">{lic.issueDate}</td>
                              <td className="py-3.5 px-4">
                                {lic.isPreExisting ? (
                                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[10px] text-center font-bold">
                                    Bestaand (0 kosten)
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1 text-[9px]">
                                    <div className="flex items-center gap-1.5 justify-between">
                                      <span className="text-slate-500 uppercase">Comm:</span>
                                      <span className={`px-1.5 py-0.5 rounded font-extrabold ${lic.employeeCommissionPaid ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                                        {lic.employeeCommissionPaid ? "Voldaan" : "Openstaand"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-between">
                                      <span className="text-slate-500 uppercase">Belasting:</span>
                                      <span className={`px-1.5 py-0.5 rounded font-extrabold ${lic.taxPaid ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/15 text-rose-450"}`}>
                                        {lic.taxPaid ? "Afgedragen" : "Openstaand"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-between">
                                      <span className="text-slate-500 uppercase">Mgt fee:</span>
                                      <span className={`px-1.5 py-0.5 rounded font-extrabold ${lic.managementFeePaid ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                                        {lic.managementFeePaid ? "Voldaan" : "Openstaand"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </td>
                            </>
                          )}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {registrySubTab === "active" ? (
                                <>
                                  {/* Strike action button */}
                                  <button
                                    type="button"
                                    onClick={() => setStrikeModalLic(lic)}
                                    className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Strike opleggen (+1)"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold font-sans">+1</span>
                                  </button>

                                  {/* Manual revoke button */}
                                  <button
                                    type="button"
                                    onClick={() => setRevokeModalLic(lic)}
                                    className="p-1.5 bg-rose-600/10 border border-rose-600/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Brevet intrekken / afnemen"
                                  >
                                    <Shield className="h-3.5 w-3.5 text-rose-400" />
                                    <span className="text-[10px] font-bold font-sans">Innemen</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(lic)}
                                    className="p-1.5 text-slate-400 hover:text-[#ea580c] hover:bg-slate-800 rounded-lg border border-slate-900 transition-all cursor-pointer inline-flex items-center font-sans font-semibold text-xs"
                                    title="Brevet bewerken"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Restore action button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Weet u zeker dat u het vliegbrevet van ${lic.citizenName} wilt herstellen naar Actief?`)) {
                                        handleResetLicense(lic);
                                      }
                                    }}
                                    className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Brevet herstellen en status vrijgeven"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-bold font-sans">Activeren</span>
                                  </button>
                                </>
                              )}

                              {(role === "manager" || role === "owner") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Weet u zeker dat u brevet ${lic.id} permanent uit de database wilt wissen? Dit kan niet ongedaan worden gemaakt.`)) {
                                      onRemoveLicense(lic.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-slate-800 border border-slate-900 rounded-lg transition-all cursor-pointer inline-flex items-center"
                                  title="Permanent wissen uit administratie"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Custom Modals inside activeTab === registry to keep state local */}
            {strikeModalLic && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl relative animate-fade-in text-left">
                  <div className="flex items-center gap-3 text-amber-500 mb-4 font-sans font-semibold">
                    <AlertTriangle className="h-6 w-6 shrink-0" />
                    <h3 className="font-display font-semibold text-lg text-white">Strike Opleggen (Protocol)</h3>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-sans mb-4">
                    U staat op het punt strike <strong className="text-amber-500">#{(strikeModalLic.strikes || 0) + 1}</strong> op te leggen aan <strong className="text-white">{strikeModalLic.citizenName}</strong> (ID: {strikeModalLic.citizenId}).
                  </p>
                  
                  {((strikeModalLic.strikes || 0) + 1) >= 2 && (
                    <div className="mb-4 text-rose-450 font-bold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[11px] font-sans">
                      ⚠️ DIRECT INTREKKEN: Dit is de tweede strike! Het brevet zal na bevestiging automatisch en onmiddellijk worden ingenomen.
                    </div>
                  )}
                  
                  <div className="space-y-2 font-sans mb-6">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">Reden voor Strike</label>
                    <textarea
                      placeholder="Vul hier de specifieke reden en eventuele bewijslast in..."
                      value={newStrikeReason}
                      onChange={(e) => setNewStrikeReason(e.target.value)}
                      className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-500 outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 font-sans text-xs">
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
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl relative animate-fade-in text-left">
                  <div className="flex items-center gap-3 text-red-500 mb-4 font-sans font-semibold">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <h3 className="font-display font-semibold text-lg text-white">Brevet Handmatig Innemen</h3>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-sans mb-4">
                    U gaat het vliegbrevet van <strong className="text-white">{revokeModalLic.citizenName}</strong> (ID: {revokeModalLic.citizenId}) handmatig intrekken / afnemen.
                  </p>
                  
                  <div className="space-y-2 font-sans mb-6">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 font-mono">Reden voor Intrekking</label>
                    <textarea
                      placeholder="Bijv. Gevaarlijk vlieggedrag of herhaaldelijk schenden van de regels..."
                      value={newRevokeReason}
                      onChange={(e) => setNewRevokeReason(e.target.value)}
                      className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-red-500 outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 font-sans text-xs">
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
                      Direct Innemen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "issue" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-950 border border-slate-800/80 p-6 sm:p-8 rounded-3xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#ea580c]" />
                  <h3 className="font-display font-semibold text-lg text-white">
                    {newIsPreExisting ? "Bestaand Vliegbrevet Toevoegen" : "Zojuist Geslaagde Diploma Registreren"}
                  </h3>
                </div>
              </div>

              {/* Mode toggle button / banner */}
              <div className="grid grid-cols-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-850/80 mb-6 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setNewIsPreExisting(false)}
                  className={`py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !newIsPreExisting
                      ? "bg-[#ea580c] text-white"
                      : "text-slate-400 hover:text-slate-250"
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  Nieuw Brevet
                </button>
                <button
                  type="button"
                  onClick={() => setNewIsPreExisting(true)}
                  className={`py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    newIsPreExisting
                      ? "bg-amber-600 text-white"
                      : "text-slate-400 hover:text-slate-250"
                  }`}
                >
                  <Award className="h-4 w-4" />
                  Bestaand Brevet (0 kosten)
                </button>
              </div>

              <p className="text-xs text-slate-400 font-light mb-6">
                {newIsPreExisting 
                  ? "Voeg een bestaand vliegbrevet toe dat is uitgereikt vóór de ingebruikname van deze registratiesite. Er worden 0 kosten in rekening gebracht voor de administratie."
                  : "Schrijf direct een vliegdiploma uit voor de geslaagde leerling. De bijbehorende medewerkercommissies en belastingen worden automatisch geboekt in ons administratie panel."}
              </p>

              {formSuccess && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex gap-2 items-center animate-bounce font-mono">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>
                    {newIsPreExisting
                      ? "Het bestaande vliegbewijs is succesvol geregistreerd met €0 kosten!"
                      : "Vliegbewijs is succesvol geactiveerd en opgenomen in de computer!"}
                  </span>
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

                <div className="space-y-4">
                  <div className="space-y-1.5 text-left">
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

                  {newIsPreExisting && (
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold text-amber-500">Oorspronkelijke Uitgiftedatum (Optioneel)</label>
                      <input
                        type="text"
                        value={newCustomIssueDate}
                        onChange={(e) => setNewCustomIssueDate(e.target.value)}
                        placeholder={`bijv: 14-04-2024 (laat leeg voor vandaag: ${new Date().toLocaleDateString("nl-NL")})`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-[#ea580c] text-xs text-slate-200"
                      />
                    </div>
                  )}

                  <div className="space-y-3 text-left">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold text-[#ea580c]">
                      👨‍✈️ Vink de Instructeur Aan (voorzien van Discord ID)
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {staffAccounts.map((acc) => {
                        const isSelected = selectedInstructorId === acc.id && !useCustomInstructor;
                        return (
                          <div
                            key={acc.id}
                            onClick={() => {
                              setSelectedInstructorId(acc.id);
                              setUseCustomInstructor(false);
                            }}
                            className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "bg-[#ea580c]/15 border-[#ea580c] shadow-lg shadow-[#ea580c]/10"
                                : "bg-slate-900/60 border-slate-850 hover:border-slate-750 hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-display font-bold text-white text-xs block truncate leading-snug">{acc.fullname}</span>
                              <input
                                type="radio"
                                name="instructor-picker-radio"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedInstructorId(acc.id);
                                  setUseCustomInstructor(false);
                                }}
                                className="h-4.5 w-4.5 accent-[#ea580c] shrink-0 cursor-pointer"
                              />
                            </div>
                            <div className="mt-3 font-mono text-[10px] space-y-1 text-slate-400">
                              <div className="truncate">Discord ID: <span className={acc.discordId ? "text-cyan-400 font-bold" : "text-amber-500/80 italic font-medium"}>{acc.discordId || "Geen Discord ID"}</span></div>
                              <div className="capitalize text-[9px] text-slate-500 font-sans">Rol: {acc.role}</div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Manual / Custom Instructor trigger option card */}
                      <div
                        onClick={() => setUseCustomInstructor(true)}
                        className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                          useCustomInstructor
                            ? "bg-[#ea580c]/15 border-[#ea580c] shadow-lg shadow-[#ea580c]/10"
                            : "bg-slate-900/60 border-slate-850 hover:border-slate-750 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-display font-bold text-white text-xs block leading-snug">Handmatig Invullen</span>
                          <input
                            type="radio"
                            name="instructor-picker-radio"
                            checked={useCustomInstructor}
                            onChange={() => setUseCustomInstructor(true)}
                            className="h-4.5 w-4.5 accent-[#ea580c] shrink-0 cursor-pointer"
                          />
                        </div>
                        <p className="mt-3 text-[10px] text-slate-450 font-sans leading-relaxed">
                          Ander personeelslid of tijdelijke instructeur wegschrijven.
                        </p>
                      </div>
                    </div>

                    {useCustomInstructor && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-slate-950/45 p-4.5 rounded-2xl border border-slate-800/90 animate-fade-in text-left">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-widest block font-medium">Instructeur Naam</label>
                          <input
                            type="text"
                            required={useCustomInstructor}
                            value={customInstructorName}
                            onChange={(e) => setCustomInstructorName(e.target.value)}
                            placeholder="Bijv: Mike Lapose"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 outline-none focus:border-[#ea580c] text-xs text-slate-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-widest block font-medium">Discord ID (Cijfers)</label>
                          <input
                            type="text"
                            required={useCustomInstructor}
                            value={customInstructorDiscordId}
                            onChange={(e) => setCustomInstructorDiscordId(e.target.value)}
                            placeholder="Bijv: 304859039201928301"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 outline-none focus:border-[#ea580c] text-xs text-slate-200"
                          />
                        </div>
                      </div>
                    )}
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
        {activeTab === "administration" && (role === "owner" || role === "manager") && (() => {
          // Financial settings based on requirements
          const getFinancialDetails = (licenseType: "helicopter" | "small-plane" | "large-plane", isPreExisting?: boolean) => {
            if (isPreExisting) {
              return { price: 0, commission: 0, standardTax: 0, grossTax: 0, managementFee: 0, purchaseCost: 0 };
            }
            const hPrice = financialConfig?.helicopterPrice ?? 250000;
            const hComm = financialConfig?.helicopterCommission ?? 35000;
            const hTaxStd = financialConfig?.helicopterStandardTax ?? 15000;
            const hTaxRate = financialConfig?.helicopterGrossTaxRate ?? 7;
            const hFee = financialConfig?.helicopterManagementFee ?? 30000;
            const hPch = financialConfig?.helicopterPurchaseCost ?? 100000;

            const sPrice = financialConfig?.smallPlanePrice ?? 500000;
            const sComm = financialConfig?.smallPlaneCommission ?? 60000;
            const sTaxStd = financialConfig?.smallPlaneStandardTax ?? 15000;
            const sTaxRate = financialConfig?.smallPlaneGrossTaxRate ?? 7;
            const sFee = financialConfig?.smallPlaneManagementFee ?? 30000;
            const sPch = financialConfig?.smallPlanePurchaseCost ?? 200000;

            const lPrice = financialConfig?.largePlanePrice ?? 750000;
            const lComm = financialConfig?.largePlaneCommission ?? 80000;
            const lTaxStd = financialConfig?.largePlaneStandardTax ?? 15000;
            const lTaxRate = financialConfig?.largePlaneGrossTaxRate ?? 7;
            const lFee = financialConfig?.largePlaneManagementFee ?? 30000;
            const lPch = financialConfig?.largePlanePurchaseCost ?? 300000;

            switch (licenseType) {
              case "helicopter":
                return {
                  price: hPrice,
                  commission: hComm,
                  standardTax: hTaxStd,
                  grossTax: hPrice * (hTaxRate / 100),
                  managementFee: hFee,
                  purchaseCost: hPch
                };
              case "small-plane":
                return {
                  price: sPrice,
                  commission: sComm,
                  standardTax: sTaxStd,
                  grossTax: sPrice * (sTaxRate / 100),
                  managementFee: sFee,
                  purchaseCost: sPch
                };
              case "large-plane":
                return {
                  price: lPrice,
                  commission: lComm,
                  standardTax: lTaxStd,
                  grossTax: lPrice * (lTaxRate / 100),
                  managementFee: lFee,
                  purchaseCost: lPch
                };
              default:
                return { price: 0, commission: 0, standardTax: 0, grossTax: 0, managementFee: 0, purchaseCost: 0 };
            }
          };

          // Aggregate metrics across ALL issued licenses, calculating taxes based on the cumulative period-based profit rather than individual licenses
          let paidGrossRevenue = 0;
          let paidCommissions = 0;
          let paidManagementFees = 0;
          let paidPurchaseCosts = 0;
          let numPaid = 0;

          let unpaidGrossRevenue = 0;
          let unpaidCommissions = 0;
          let unpaidManagementFees = 0;
          let unpaidPurchaseCosts = 0;
          let numUnpaid = 0;

          // Commissions paid to employees, independent of tax status
          let employeePaidCommissionTotal = 0;
          let employeeUnpaidCommissionTotal = 0;
          let employeeTotalCommissionTotal = 0;

          // Management fees paid to Ron and Mike, independent of tax status
          let paidManagementFeesTotal = 0;
          let unpaidManagementFeesTotal = 0;

          issuedLicenses.forEach(lic => {
            const details = getFinancialDetails(lic.licenseType, lic.isPreExisting);

            // Employee commission status
            if (lic.employeeCommissionPaid === true) {
              employeePaidCommissionTotal += details.commission;
            } else {
              employeeUnpaidCommissionTotal += details.commission;
            }
            employeeTotalCommissionTotal += details.commission;

            // Management fee status
            if (lic.managementFeePaid === true) {
              paidManagementFeesTotal += details.managementFee;
            } else {
              unpaidManagementFeesTotal += details.managementFee;
            }

            // Group by taxPaid status
            if (lic.taxPaid === true) {
              numPaid++;
              paidGrossRevenue += details.price;
              paidCommissions += details.commission;
              paidManagementFees += details.managementFee;
              paidPurchaseCosts += details.purchaseCost;
            } else {
              numUnpaid++;
              unpaidGrossRevenue += details.price;
              unpaidCommissions += details.commission;
              unpaidManagementFees += details.managementFee;
              unpaidPurchaseCosts += details.purchaseCost;
            }
          });

          // Calculate period-based taxes (7% of total period-based profit & a flat standard 15k contribution)
          const unpaidProfitBeforeTax = Math.max(0, unpaidGrossRevenue - (unpaidCommissions + unpaidManagementFees + unpaidPurchaseCosts));
          const unpaidGrossTax = Math.max(0, unpaidProfitBeforeTax * 0.07);
          const unpaidStandardTax = numUnpaid > 0 ? 15000 : 0;
          const unpaidTaxes = unpaidGrossTax + unpaidStandardTax;

          const paidProfitBeforeTax = Math.max(0, paidGrossRevenue - (paidCommissions + paidManagementFees + paidPurchaseCosts));
          const paidGrossTax = Math.max(0, paidProfitBeforeTax * 0.07);
          const paidStandardTax = numPaid > 0 ? 15000 : 0;
          const paidTaxes = paidGrossTax + paidStandardTax;

          const totalTaxes = paidTaxes + unpaidTaxes;

          const totals = {
            grossRevenue: paidGrossRevenue + unpaidGrossRevenue,
            paidCommission: employeePaidCommissionTotal,
            unpaidCommission: employeeUnpaidCommissionTotal,
            totalCommission: employeeTotalCommissionTotal,
            paidTaxes: paidTaxes,
            unpaidTaxes: unpaidTaxes,
            unpaidStandardTax: unpaidStandardTax,
            unpaidGrossTax: unpaidGrossTax,
            totalTaxes: totalTaxes,
            managementFees: paidManagementFeesTotal + unpaidManagementFeesTotal,
            paidManagementFees: paidManagementFeesTotal,
            unpaidManagementFees: unpaidManagementFeesTotal,
            purchaseCosts: paidPurchaseCosts + unpaidPurchaseCosts
          };

          // Bonus calculations
          const totalPaidBonuses = bonuses.filter(b => b.paid).reduce((sum, b) => sum + b.amount, 0);
          const totalUnpaidBonuses = bonuses.filter(b => !b.paid).reduce((sum, b) => sum + b.amount, 0);
          const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);

          const totalBusinessExpenses = totals.totalCommission + totals.totalTaxes + totals.managementFees + totals.purchaseCosts + totalPaidBonuses;
          // Winstpotje = Totaal Brutowinst - Alle kosten (Werknemers, Belastingen, Management, Inkoopkosten + Uitbetaalde Bonussen)
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
              const details = getFinancialDetails(lic.licenseType, lic.isPreExisting);
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

          // Toggle management fee payout status in state for specific license
          const handleToggleManagementPaid = (lic: IssuedLicense) => {
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie (Eigenaar / Manager) mag management fees fiatteren!");
              return;
            }
            const nextPaidState = !lic.managementFeePaid;
            onUpdateLicense({
              ...lic,
              managementFeePaid: nextPaidState
            });
          };

          // Pay director management fees (marks managementFeePaid as true for all open management fees)
          const handlePayManagementFeesSubmit = () => {
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie mag de management fees overboeken!");
              return;
            }
            if (totals.unpaidManagementFees <= 0) {
              setPortalAlertMessage("Er zijn geen openstaande management fees om over te boeken!");
              return;
            }

            const executeManagementPayment = () => {
              // Set managementFeePaid = true for all licenses and trigger update
              issuedLicenses.forEach(lic => {
                if (!lic.managementFeePaid) {
                  onUpdateLicense({
                    ...lic,
                    managementFeePaid: true
                  });
                }
              });

              setPortalAlertMessage("De openstaande management fees zijn met succes overgeboekt naar Mike (€" + ((totals.unpaidManagementFees / 2).toLocaleString("nl-NL")) + ") en Ron (€" + ((totals.unpaidManagementFees / 2).toLocaleString("nl-NL")) + ")!");
            };

            const confirmPayment = window.confirm(
              `Weet u zeker dat u de openstaande management fees van €${totals.unpaidManagementFees.toLocaleString("nl-NL")} wilt uitbetalen aan de directie? Dit splitst in €${(totals.unpaidManagementFees / 2).toLocaleString("nl-NL")} voor Mike en €${(totals.unpaidManagementFees / 2).toLocaleString("nl-NL")} voor Ron. Dit reset de openstaande teller naar €0.`
            );
            if (confirmPayment) {
              executeManagementPayment();
            }
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

          // Clear all licenses / reset bookkeeping
          const handleClearBookkeeping = () => {
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie (Eigenaar / Manager) mag de boekhouding wissen!");
              return;
            }
            const confirmFirst = window.confirm(
              "GEVAAR: Weet u zeker dat u de volledige boekhouding wilt wissen? Hiermee worden alle geregistreerde diploma's/vliegbrevetten permanent uit de lokale database verwijderd en alle winsten op €0 gezet."
            );
            if (!confirmFirst) return;

            const confirmSecond = window.confirm(
              "LAATSTE WAARSCHUWING: Dit kan niet ongedaan worden gemaakt. Alle rekeningen, commissie-uitbetalingen, belastingen en winstpotjes worden gereset. Wilt u doorgaan?"
            );
            if (confirmSecond) {
              if (onClearAllLicenses) {
                onClearAllLicenses();
                setPortalAlertMessage("De boekhouding is met succes volledig gewist en gereset naar €0!");
              }
            }
          };

          // Save the financial configuration to parent handler (Firestore and local storage)
          const handleSaveFinancialConfig = (e: React.FormEvent) => {
            e.preventDefault();
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie (Eigenaar / Manager) mag tarieven en salarissen overschrijven!");
              return;
            }
            if (onUpdateFinancialConfig) {
              onUpdateFinancialConfig({
                helicopterPrice: Number(helicopterPrice),
                helicopterCommission: Number(helicopterCommission),
                helicopterStandardTax: Number(helicopterStandardTax),
                helicopterGrossTaxRate: Number(helicopterGrossTaxRate),
                helicopterManagementFee: Number(helicopterManagementFee),
                helicopterPurchaseCost: Number(helicopterPurchaseCost),

                smallPlanePrice: Number(smallPlanePrice),
                smallPlaneCommission: Number(smallPlaneCommission),
                smallPlaneStandardTax: Number(smallPlaneStandardTax),
                smallPlaneGrossTaxRate: Number(smallPlaneGrossTaxRate),
                smallPlaneManagementFee: Number(smallPlaneManagementFee),
                smallPlanePurchaseCost: Number(smallPlanePurchaseCost),

                largePlanePrice: Number(largePlanePrice),
                largePlaneCommission: Number(largePlaneCommission),
                largePlaneStandardTax: Number(largePlaneStandardTax),
                largePlaneGrossTaxRate: Number(largePlaneGrossTaxRate),
                largePlaneManagementFee: Number(largePlaneManagementFee),
                largePlanePurchaseCost: Number(largePlanePurchaseCost)
              });
              setFinancialSaveSuccess("Financiële tarieven en medewerkerslonen succesvol opgeslagen en gesynchroniseerd!");
              setTimeout(() => setFinancialSaveSuccess(null), 6000);
            }
          };

          const handleResetFinancialDefaults = () => {
            if (role !== "owner" && role !== "manager") {
              setPortalAlertMessage("Alleen de directie mag tarieven en salarissen terugzetten!");
              return;
            }
            const confirmReset = window.confirm(
              "Wilt u alle tarieven, belastingen, loonschalen en inkoopkosten terugzetten naar de originele vliegschool standaarden?"
            );
            if (!confirmReset) return;

            if (onUpdateFinancialConfig) {
              const defaults = {
                helicopterPrice: 250000,
                helicopterCommission: 35000,
                helicopterStandardTax: 15000,
                helicopterGrossTaxRate: 7,
                helicopterManagementFee: 30000,
                helicopterPurchaseCost: 100000,

                smallPlanePrice: 500000,
                smallPlaneCommission: 60000,
                smallPlaneStandardTax: 15000,
                smallPlaneGrossTaxRate: 7,
                smallPlaneManagementFee: 30000,
                smallPlanePurchaseCost: 200000,

                largePlanePrice: 750000,
                largePlaneCommission: 80000,
                largePlaneStandardTax: 15000,
                largePlaneGrossTaxRate: 7,
                largePlaneManagementFee: 30000,
                largePlanePurchaseCost: 300000
              };
              onUpdateFinancialConfig(defaults);
              setPortalAlertMessage("De tarieven en loonsystemen zijn teruggezet naar de vliegschool standaarden!");
            }
          };

          return (
            <div className="space-y-8 animate-fade-in font-mono text-xs text-slate-300">
              
              {/* Administration Sub-Tabs */}
              <div className="flex border-b border-slate-905 pb-0 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAdminSubTab("overzicht")}
                  className={`px-5 py-3 border-b-2 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminSubTab === "overzicht"
                      ? "border-amber-500 text-amber-500"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Boekhouding & Tarieven Overzicht
                </button>
                <button
                  type="button"
                  onClick={() => setAdminSubTab("bonussen")}
                  className={`px-5 py-3 border-b-2 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    adminSubTab === "bonussen"
                      ? "border-amber-500 text-amber-500"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Persoonlijke Bonussen Uitschrijven
                </button>
              </div>

              {adminSubTab === "bonussen" ? (
                <div className="space-y-6">
                  {/* Row 1: Bonus KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* KPI 1: Totaal Uitgeschreven */}
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                      <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500">
                        <Coins className="h-24 w-24" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-widest font-sans font-bold">Totaal Toegewezen Bonussen</span>
                        <h4 className="text-2xl font-black text-white mt-2">€{totalBonuses.toLocaleString("nl-NL")}</h4>
                      </div>
                      <span className="text-[9px] text-slate-500 font-sans mt-2 block">{bonuses.length} bonussen geregistreerd</span>
                    </div>

                    {/* KPI 2: Uitbetaald */}
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                      <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-500">
                        <CheckCircle className="h-24 w-24" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-widest font-sans font-bold">Uitbetaalde Bonussen</span>
                        <h4 className="text-2xl font-black text-emerald-450 mt-2">€{totalPaidBonuses.toLocaleString("nl-NL")}</h4>
                      </div>
                      <span className="text-[9px] text-emerald-500/80 font-sans mt-2 block">{bonuses.filter(b => b.paid).length} voldaan</span>
                    </div>

                    {/* KPI 3: Openstaand */}
                    <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
                      <div className="absolute -right-4 -bottom-4 opacity-5 text-rose-500">
                        <AlertCircle className="h-24 w-24" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-450 uppercase tracking-widest font-sans font-bold">Openstaande Bonussen</span>
                        <h4 className="text-2xl font-black text-amber-500 mt-2">€{totalUnpaidBonuses.toLocaleString("nl-NL")}</h4>
                      </div>
                      <span className="text-[9px] text-amber-550 font-sans mt-2 block">{bonuses.filter(b => !b.paid).length} in afwachting</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left side: Add Bonus Form */}
                    <div className="lg:col-span-4 bg-slate-950 border border-slate-850 p-6 rounded-3xl space-y-4">
                      <div className="border-b border-slate-900 pb-3">
                        <h3 className="font-display font-semibold text-base text-white text-left">Bonus Toekennen</h3>
                        <p className="text-[10px] text-slate-450 mt-1 font-sans text-left">Stel handmatig een prestatiebonus of premie in voor een werknemer.</p>
                      </div>

                      {bonusSuccessMessage && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-[11px] font-sans flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{bonusSuccessMessage}</span>
                        </div>
                      )}

                      {bonusErrorMessage && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-[11px] font-sans flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                          <span>{bonusErrorMessage}</span>
                        </div>
                      )}

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!bonusRecipient) {
                          setBonusErrorMessage("Selecteer een geldige medewerker.");
                          return;
                        }
                        const amt = parseFloat(bonusAmount);
                        if (isNaN(amt) || amt <= 0) {
                          setBonusErrorMessage("Voer een positief bonusbedrag in.");
                          return;
                        }
                        if (!bonusReason.trim()) {
                          setBonusErrorMessage("Voer a.u.b. een reden of verantwoording in.");
                          return;
                        }

                        const newBonus: Bonus = {
                          id: `BON-${Date.now().toString().slice(-6)}`,
                          recipientName: bonusRecipient,
                          amount: amt,
                          reason: bonusReason,
                          issuedBy: fullname || loggedInUser?.fullname || "Directie",
                          issuedAt: new Date().toISOString(),
                          paid: false
                        };

                        const updated = [newBonus, ...bonuses];
                        onUpdateBonuses(updated);

                        setBonusSuccessMessage(`€${amt.toLocaleString("nl-NL")} bonus succesvol uitgeschreven voor ${bonusRecipient}!`);
                        setBonusErrorMessage(null);
                        setBonusRecipient("");
                        setBonusAmount("");
                        setBonusReason("");
                        if (typeof setPortalAlertMessage === "function") {
                          setPortalAlertMessage(`Bonus ${newBonus.id} succesvol aangemaakt!`);
                        }
                      }} className="space-y-4 text-left">
                        {/* Selector */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Kies Medewerker:</label>
                          <select
                            value={bonusRecipient}
                            onChange={(e) => setBonusRecipient(e.target.value)}
                            className="w-full bg-[#020617] border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-sans"
                            required
                          >
                            <option value="">-- Kies Medewerker --</option>
                            {uniqueTeachersList.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Bonus Bedrag (€):</label>
                          <input
                            type="number"
                            placeholder="bijv: 25000"
                            value={bonusAmount}
                            onChange={(e) => setBonusAmount(e.target.value)}
                            className="w-full bg-[#020617] border border-slate-850 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                            required
                          />
                        </div>

                        {/* Reason */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Reden / Omschrijving:</label>
                          <textarea
                            rows={3}
                            placeholder="Reden voor de bonus..."
                            value={bonusReason}
                            onChange={(e) => setBonusReason(e.target.value)}
                            className="w-full bg-[#020617] border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-sans text-xs"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans font-bold uppercase tracking-wider text-xs py-3 rounded-xl cursor-pointer transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Schrijf Bonus Uit</span>
                        </button>
                      </form>
                    </div>

                    {/* Right side: Bonuses list */}
                    <div className="lg:col-span-8 bg-slate-950 border border-slate-850 p-6 rounded-3xl">
                      <div className="border-b border-slate-900 pb-3 mb-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-display font-semibold text-base text-white text-left">Geregistreerde Bonussen</h3>
                          <p className="text-[10px] text-slate-450 font-sans mt-0.5 text-left">Overzicht van handmatige bonussen.</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Totaal: {bonuses.length}</span>
                      </div>

                      {bonuses.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 font-sans">
                          Er zijn nog geen handmatige bonussen of premies uitgeschreven in de database.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase font-bold">
                                <th className="py-2.5 px-3">BonID</th>
                                <th className="py-2.5 px-3 font-sans">Medewerker</th>
                                <th className="py-2.5 px-3 font-sans">Verantwoording</th>
                                <th className="py-2.5 px-3">Bedrag</th>
                                <th className="py-2.5 px-3 font-sans">Aangemaakt Door</th>
                                <th className="py-2.5 px-3 text-center">Status & Actie</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/60 text-slate-350">
                              {bonuses.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-900/20 font-mono transition-all text-[11px]">
                                  <td className="py-3 px-3 font-bold text-amber-500">{b.id}</td>
                                  <td className="py-3 px-3 font-sans font-semibold text-white">{b.recipientName}</td>
                                  <td className="py-3 px-3 font-sans text-slate-400 text-left whitespace-normal max-w-[200px] break-words">
                                    {b.reason}
                                    <div className="text-[9px] text-slate-500 mt-0.5">
                                      {new Date(b.issuedAt).toLocaleDateString("nl-NL", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                      })}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-bold text-white">€{b.amount.toLocaleString("nl-NL")}</td>
                                  <td className="py-3 px-3 font-sans text-slate-400">{b.issuedBy}</td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = bonuses.map(item => {
                                            if (item.id === b.id) {
                                              return { ...item, paid: !item.paid };
                                            }
                                            return item;
                                          });
                                          onUpdateBonuses(updated);
                                          if (typeof setPortalAlertMessage === "function") {
                                            setPortalAlertMessage("Bonus status veranderd!");
                                          }
                                        }}
                                        className={`px-2.5 py-1 rounded text-[9px] font-bold font-sans uppercase transition-all cursor-pointer ${
                                          b.paid
                                            ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950"
                                        }`}
                                      >
                                        {b.paid ? "✓ Betaald" : "Uitbetalen"}
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`Weet u zeker dat u bonus ${b.id} voor ${b.recipientName} wilt verwijderen?`)) {
                                            const updated = bonuses.filter(item => item.id !== b.id);
                                            onUpdateBonuses(updated);
                                            if (typeof setPortalAlertMessage === "function") {
                                              setPortalAlertMessage("Bonus verwijderd.");
                                            }
                                          }
                                        }}
                                        className="text-slate-500 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                                        title="Verwijderen"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Row 1: Big KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
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
                    <p className="text-[10px] font-sans text-slate-400 font-light block leading-relaxed mb-3">
                      Alle netto winst na aftrek van inkoopkosten, belasting (7% over totale winst + 15k vast), management fees en medewerker premies.
                    </p>
                    {(role === "owner" || role === "manager") && (
                      <button
                        type="button"
                        onClick={handleClearBookkeeping}
                        className="w-full bg-rose-500 hover:bg-rose-650 text-white font-sans font-bold tracking-wider text-[10px] uppercase rounded-xl py-2 cursor-pointer transition-all hover:scale-[1.01] shadow-lg shadow-rose-500/10 flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Boekhouding Resetten</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Belastingen Card with countdown */}
                <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#ea580c] uppercase tracking-widest font-bold font-sans bg-[#ea580c]/10 px-2.5 py-1 rounded-full border border-[#ea580c]/10">
                        Corporate Belastingen
                      </span>
                      <span className="text-[10px] text-slate-400">7% over winst + 15k vast</span>
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
                      <span className="text-slate-400 block font-light">Aftelklok (Betalingstermijn):</span>
                      <span className="text-rose-450 font-bold block bg-rose-500/10 px-1.5 py-0.5 rounded font-mono">{timeLeftStr}</span>
                    </div>

                    <div className="mt-2 text-[10px] flex items-center justify-between text-slate-400 font-sans">
                      <span>Vervaldatum:</span>
                      <strong className="text-slate-200 font-mono">
                        {new Date(taxDueDate).toLocaleString("nl-NL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </strong>
                    </div>

                    {(role === "owner" || role === "manager") && (
                      <div className="mt-3 text-right">
                        {!isEditingTaxDueDate ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomTaxDueDateInput(formatTimestampForInput(taxDueDate));
                              setIsEditingTaxDueDate(true);
                            }}
                            className="text-[#ea580c] hover:text-orange-400 font-sans text-[10px] font-bold underline cursor-pointer"
                          >
                            Datum zelf instellen
                          </button>
                        ) : (
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-2 mt-2 text-left">
                            <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                              Nieuwe vervaldatum:
                            </label>
                            <input
                              type="datetime-local"
                              value={customTaxDueDateInput}
                              onChange={(e) => setCustomTaxDueDateInput(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-[#ea580c]"
                            />
                            
                            {/* Fast-click Presets */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const target = Date.now() + 14 * 24 * 60 * 60 * 1000;
                                  setCustomTaxDueDateInput(formatTimestampForInput(target));
                                }}
                                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans text-[9px] px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                +2 Weken
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const target = Date.now() + 7 * 24 * 60 * 60 * 1000;
                                  setCustomTaxDueDateInput(formatTimestampForInput(target));
                                }}
                                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans text-[9px] px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                +1 Week
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const target = Date.now() + 3 * 24 * 60 * 60 * 1000;
                                  setCustomTaxDueDateInput(formatTimestampForInput(target));
                                }}
                                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans text-[9px] px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                +3 Dagen
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const target = Date.now() + 24 * 60 * 60 * 1000;
                                  setCustomTaxDueDateInput(formatTimestampForInput(target));
                                }}
                                className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-sans text-[9px] px-2 py-1 rounded cursor-pointer transition-colors"
                              >
                                +24 Uur
                              </button>
                            </div>

                            <div className="flex justify-end gap-2 pt-1 border-t border-slate-850/60">
                              <button
                                type="button"
                                onClick={() => setIsEditingTaxDueDate(false)}
                                className="bg-slate-950 hover:bg-slate-850 text-slate-400 font-sans text-[9px] font-bold px-2.5 py-1 rounded cursor-pointer"
                              >
                                Annuleren
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (customTaxDueDateInput) {
                                    const parsed = new Date(customTaxDueDateInput).getTime();
                                    if (!isNaN(parsed)) {
                                      setTaxDueDate(parsed);
                                      localStorage.setItem("@luchtvaart_oranjestad_tax_due_date", parsed.toString());
                                      setIsEditingTaxDueDate(false);
                                    }
                                  }
                                }}
                                className="bg-[#ea580c] hover:bg-orange-600 text-slate-950 font-sans font-bold text-[9px] px-3 py-1 rounded cursor-pointer transition-colors"
                              >
                                Opslaan
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

                {/* Management Fees (Mike & Ron) Card */}
                <div className="bg-slate-950 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold font-sans bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/10">
                        Management Fees
                      </span>
                      <span className="text-[10px] text-slate-400">15k Mike + 15k Ron p.b.</span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-slate-500 text-[10px] uppercase">OPENSTAANDE DIRECTIE FEES</div>
                      <h4 className="text-2xl font-bold text-amber-500 mt-1">
                        €{totals.unpaidManagementFees.toLocaleString("nl-NL")}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-450">
                      <span>Mike (Openstaand):</span>
                      <strong className="text-slate-200">
                        €{(totals.unpaidManagementFees / 2).toLocaleString("nl-NL")}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-450">
                      <span>Ron (Openstaand):</span>
                      <strong className="text-slate-200">
                        €{(totals.unpaidManagementFees / 2).toLocaleString("nl-NL")}
                      </strong>
                    </div>

                    {(role === "owner" || role === "manager") && totals.unpaidManagementFees > 0 ? (
                      <button
                        onClick={handlePayManagementFeesSubmit}
                        type="button"
                        className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold font-mono tracking-wider text-[10px] uppercase rounded-lg py-2 cursor-pointer shadow-lg shadow-amber-500/15"
                      >
                        Voldoe Directie Fees
                      </button>
                    ) : (
                      <div className="text-center text-[10px] text-emerald-400 mt-2 border border-emerald-500/10 bg-emerald-500/5 p-1 rounded font-bold uppercase">
                        ✓ Fees overgeboekt
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
                    <div className="flex justify-between py-1.5 border-t border-slate-900">
                      <span>Uitbetaalde bonussen:</span>
                      <strong className="text-amber-500">€{totalPaidBonuses.toLocaleString("nl-NL")}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* INTERACTIVE FORM FOR ADJUSTABLE TARIFFS AND SALARIES */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base text-white text-left">Financiële Tarieven & Loon Instellingen (Aanpasbaar)</h3>
                      <p className="text-[10px] text-slate-450 font-light mt-0.5 text-left">
                        Overschrijf de vliegbrevet prijzen, staff-bonussen / commissies, inkoopkosten en belastingtarieven voor alle 3 klassen.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFinancialDefaults}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all font-sans text-[10px] uppercase font-bold self-start sm:self-center cursor-pointer"
                  >
                    Herstel Standaardwaarden
                  </button>
                </div>

                {financialSaveSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl flex items-center gap-2 text-[11px] animate-pulse">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{financialSaveSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveFinancialConfig} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Column 1: Helicopter Brevet */}
                    <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Helikopter Brevet</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Verkoopprijs Brevet (€):</label>
                          <input
                            type="number"
                            value={helicopterPrice}
                            onChange={(e) => setHelicopterPrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Instructeursloon / Commissie (€):</label>
                          <input
                            type="number"
                            value={helicopterCommission}
                            onChange={(e) => setHelicopterCommission(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Inkoopkosten Brevet (€):</label>
                          <input
                            type="number"
                            value={helicopterPurchaseCost}
                            onChange={(e) => setHelicopterPurchaseCost(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-1">Winstbelasting (%):</label>
                            <input
                              type="number"
                              value={helicopterGrossTaxRate}
                              onChange={(e) => setHelicopterGrossTaxRate(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-1">Vast Belast (€):</label>
                            <input
                              type="number"
                              value={helicopterStandardTax}
                              onChange={(e) => setHelicopterStandardTax(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Management Fee (€):</label>
                          <input
                            type="number"
                            value={helicopterManagementFee}
                            onChange={(e) => setHelicopterManagementFee(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Vliegtuig Klein */}
                    <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Vliegtuig Klein</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Verkoopprijs Brevet (€):</label>
                          <input
                            type="number"
                            value={smallPlanePrice}
                            onChange={(e) => setSmallPlanePrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Instructeursloon / Commissie (€):</label>
                          <input
                            type="number"
                            value={smallPlaneCommission}
                            onChange={(e) => setSmallPlaneCommission(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Inkoopkosten Brevet (€):</label>
                          <input
                            type="number"
                            value={smallPlanePurchaseCost}
                            onChange={(e) => setSmallPlanePurchaseCost(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-1">Winstbelasting (%):</label>
                            <input
                              type="number"
                              value={smallPlaneGrossTaxRate}
                              onChange={(e) => setSmallPlaneGrossTaxRate(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-1">Vast Belast (€):</label>
                            <input
                              type="number"
                              value={smallPlaneStandardTax}
                              onChange={(e) => setSmallPlaneStandardTax(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Management Fee (€):</label>
                          <input
                            type="number"
                            value={smallPlaneManagementFee}
                            onChange={(e) => setSmallPlaneManagementFee(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Vliegtuig Groot */}
                    <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider">Vliegtuig Groot</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Verkoopprijs Brevet (€):</label>
                          <input
                            type="number"
                            value={largePlanePrice}
                            onChange={(e) => setLargePlanePrice(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Instructeursloon / Commissie (€):</label>
                          <input
                            type="number"
                            value={largePlaneCommission}
                            onChange={(e) => setLargePlaneCommission(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Inkoopkosten Brevet (€):</label>
                          <input
                            type="number"
                            value={largePlanePurchaseCost}
                            onChange={(e) => setLargePlanePurchaseCost(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-1">Winstbelasting (%):</label>
                            <input
                              type="number"
                              value={largePlaneGrossTaxRate}
                              onChange={(e) => setLargePlaneGrossTaxRate(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-400 block mb-1">Vast Belast (€):</label>
                            <input
                              type="number"
                              value={largePlaneStandardTax}
                              onChange={(e) => setLargePlaneStandardTax(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Management Fee (€):</label>
                          <input
                            type="number"
                            value={largePlaneManagementFee}
                            onChange={(e) => setLargePlaneManagementFee(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-900/30">
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-sans font-bold tracking-wider text-xs uppercase px-8 py-3 rounded-xl cursor-pointer shadow-lg shadow-amber-500/10 transition-all font-sans"
                    >
                      ✓ Financiële Tarieven & Wijzigingen Opslaan
                    </button>
                  </div>
                </form>
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
                <p className="text-xs text-slate-400 font-light mb-6 text-left">
                  Uitsplitsing van het aantal examens en verdiende premies per instructeur (Heli = €{(financialConfig?.helicopterCommission ?? 35000).toLocaleString("nl-NL")}, Vliegtuig Klein = €{(financialConfig?.smallPlaneCommission ?? 60000).toLocaleString("nl-NL")}, Vliegtuig Groot = €{(financialConfig?.largePlaneCommission ?? 80000).toLocaleString("nl-NL")}).
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
                          const details = getFinancialDetails(lic.licenseType, lic.isPreExisting);
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
                                {lic.isPreExisting ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 text-[10px] uppercase font-bold inline-block">
                                    N.v.t. (Bestaand)
                                  </span>
                                ) : (
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
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Google Sheets Synchronization Panel */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl text-left font-sans">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-display font-semibold text-base text-white font-sans text-left">Google Sheets Koppeling & Synchronisatie</h3>
                </div>

                <p className="text-xs text-slate-400 font-light mb-6 font-sans">
                  Koppel een Google Spreadsheet om alle uitgeschreven vliegbrevetten direct en automatisch door te sturen. 
                  Volgens uw richtlijn worden de brevetten chronologisch ingevuld <strong>vanaf rij 12</strong>.
                </p>

                {sheetSuccess && (
                  <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex gap-1.5 items-start font-sans">
                    <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                      <span className="font-semibold block text-emerald-300">Succes!</span>
                      <p className="text-emerald-400 font-light mt-0.5">{sheetSuccess}</p>
                    </div>
                  </div>
                )}

                {sheetError && (
                  <div className="mb-4 space-y-3 font-sans">
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex gap-1.5 items-start">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-rose-500" />
                      <div>
                        <span className="font-semibold block text-rose-300">Fout opgetreden</span>
                        <p className="text-rose-400 font-light mt-0.5">{sheetError}</p>
                      </div>
                    </div>

                    {(sheetError.toLowerCase().includes("unauthorized-domain") || 
                      sheetError.toLowerCase().includes("unauthorised-domain") ||
                      sheetError.toLowerCase().includes("unauthorized domain") ||
                      sheetError.toLowerCase().includes("domein is niet geautoriseerd")) && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-slate-350 text-xs rounded-2xl space-y-3.5 text-left">
                        <div className="flex gap-2 items-start">
                          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-400 block text-sm">Domein niet Geautoriseerd in Firebase Auth</span>
                            <p className="text-slate-300 font-light mt-1 leading-relaxed">
                              Google weigert inlogpogingen vanaf dit testdomein omdat het nog niet is geautoriseerd in uw Firebase-project <strong>project-80143359-a411-4e87-a08</strong>.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3 text-left">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Stappen om dit direct op lossen:</span>
                          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 pl-0.5 leading-relaxed">
                            <li>
                              Bezoek uw Firebase-instellingen via deze link:{" "}
                              <a 
                                href="https://console.firebase.google.com/project/project-80143359-a411-4e87-a08/authentication/settings" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-amber-400 font-semibold underline hover:text-amber-300 inline-flex items-center gap-0.5"
                              >
                                Firebase Panel settings openen ↗
                              </a>
                            </li>
                            <li>Klik op het tabblad <strong>"Authorized domains"</strong> (Geautoriseerde domeinen).</li>
                            <li>Klik op de knop <strong>"Add domain"</strong> (Domein toevoegen).</li>
                            <li>
                              Voeg dit exacte domein toe: <code className="bg-slate-950 px-2 py-1 text-amber-300 rounded font-mono font-bold select-all inline-block border border-slate-800">{window.location.hostname}</code>
                            </li>
                            <li>
                              Klik op <strong>Opslaan</strong> (Save). Herlaad daarna deze pagina en log direct succesvol in!
                            </li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Switcher tabs for choosing Connection Type */}
                <div className="flex flex-wrap gap-2.5 p-1 bg-slate-1000 border border-slate-900 rounded-2xl mb-6 max-w-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleConnectionType("webapp");
                      localStorage.setItem("@luchtvaart_oranjestad_sheets_conn_type", "webapp");
                      setConnectedSheetTitle("");
                      setSheetError(null);
                      setSheetSuccess(null);
                      if (onUpdateGoogleConnectionType) onUpdateGoogleConnectionType("webapp");
                    }}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      googleConnectionType === "webapp"
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🚀 Type A: Google Apps Script Web-App
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleConnectionType("auth");
                      localStorage.setItem("@luchtvaart_oranjestad_sheets_conn_type", "auth");
                      setConnectedSheetTitle("");
                      setSheetError(null);
                      setSheetSuccess(null);
                      if (onUpdateGoogleConnectionType) onUpdateGoogleConnectionType("auth");
                    }}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      googleConnectionType === "auth"
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🔑 Type B: Google Login (Firebase Auth)
                  </button>
                </div>

                {googleConnectionType === "webapp" ? (
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start font-sans">
                    
                    {/* Left/Main Column: Apps Script explanation and URL entry */}
                    <div className="xl:col-span-7 bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                          Google Apps Script Web-App Koppeling (Aanbevolen)
                        </h4>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                        De Apps Script-methode maakt direct verbinding met uw Google Spreadsheet via een server-to-server verbinding. 
                        Dit <strong>omzeilt alle browserblokkades, pop-up- en iframe-beperkingen</strong> in AI Studio en blijft permanent actief zonder na een uur te verlopen!
                      </p>

                      <div className="space-y-2 text-left pt-2">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold leading-normal">
                          Google Apps Script Web-app URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://script.google.com/macros/s/..."
                          value={sheetsWebAppUrl}
                          onChange={(e) => {
                            setSheetsWebAppUrl(e.target.value);
                            localStorage.setItem("@luchtvaart_oranjestad_sheets_webapp_url", e.target.value);
                            if (onUpdateSheetsWebAppUrl) onUpdateSheetsWebAppUrl(e.target.value);
                          }}
                          className="w-full bg-slate-1000 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                        />
                      </div>

                      <div className="pt-2">
                        {connectedSheetTitle ? (
                          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-left mb-4">
                            <span className="text-[10px] text-slate-500 block font-mono font-bold leading-none uppercase">GECOUPLEERD REKENBLAD</span>
                            <span className="text-xs text-white font-bold block mt-1 leading-normal truncate font-sans">
                              {connectedSheetTitle}
                            </span>
                            <span className="text-[9px] text-emerald-400 font-mono block mt-1">
                              Rij 12 start • Auto-append actief! (Apps Script)
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-left text-[11px] text-slate-500 leading-relaxed font-light mb-4">
                            Nog geen verbinding geverifieerd. Voer hierboven uw Web-app URL in en klik hieronder op 'Koppeling Controleren'.
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleVerifyWebApp(sheetsWebAppUrl)}
                            disabled={isVerifyingSheet || !sheetsWebAppUrl}
                            className={`px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/20 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5`}
                          >
                            {isVerifyingSheet ? "Verbinden..." : "Koppeling Controleren"}
                          </button>

                          <button
                            type="button"
                            onClick={handleSyncAllLicenses}
                            disabled={isSyncingAll || !sheetsWebAppUrl}
                            className={`px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 text-slate-950 font-bold font-mono text-xs rounded-xl uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                              !sheetsWebAppUrl ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]"
                            }`}
                          >
                            {isSyncingAll ? "Exporteren..." : "Sync alle brevetten"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Code instructions */}
                    <div className="xl:col-span-5 bg-slate-950 border border-slate-900 p-5 rounded-2xl text-left space-y-4">
                      <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Instructies (1 minuut instellen):
                      </h5>
                      
                      <ol className="list-decimal list-outside space-y-2 text-xs text-slate-350 pl-4 font-light leading-relaxed">
                        <li>Open uw Google Spreadsheet.</li>
                        <li>Klik op <strong>Extensies</strong> &gt; <strong>Apps Script</strong>.</li>
                        <li>Plak de code hieronder erin (verwijder eventuele bestaande code).</li>
                        <li>Klik rechtsboven op <strong>Implementeren</strong> &gt; <strong>Nieuwe implementatie</strong>.</li>
                        <li>Klik op het tandwiel en selecteer <strong>Web-app</strong>.</li>
                        <li>Uitvoeren als: <strong>Mij</strong> (u), Toegang: <strong>Iedereen</strong> (Anyone).</li>
                        <li>Klik op Implementeren, machtig uw script & kopieer de Web-app URL hiernaast!</li>
                      </ol>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 block uppercase">Apps Script Code Template</span>
                        <div className="relative">
                          <textarea
                            readOnly
                            rows={6}
                            value={`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    if (data.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        title: ss.getName() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'save') {
      var lic = data.license;
      var targetRow = 12;
      
      // Zoek de eerste vrije rij beginnend bij rij 12 door kolom B (Citizen ID) te scannen
      var values = sheet.getRange("B12:B2000").getValues();
      for (var i = 0; i < values.length; i++) {
        if (!values[i][0] || values[i][0].toString().trim() === "") {
          targetRow = 12 + i;
          break;
        }
      }
      
      sheet.getRange(targetRow, 1, 1, 9).setValues([[
        "",
        lic.citizenId,
        lic.citizenName,
        lic.licenseType === "helicopter" ? "Helikopter" : lic.licenseType === "small-plane" ? "Vliegtuig Klein" : "Vliegtuig Groot",
        lic.issuedBy,
        "",
        "Actief",
        lic.issueDate,
        "Ja"
      ]]);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        row: targetRow 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'sync') {
      var sorted = data.licenses || [];
      var lastRow = sheet.getLastRow();
      if (lastRow >= 12) {
        sheet.getRange(12, 1, Math.max(1, lastRow - 11), 9).clearContent();
      }
      
      if (sorted.length === 0) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, count: 0 }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var rows = sorted.map(function(lic) {
        return [
          "",
          lic.citizenId,
          lic.citizenName,
          lic.licenseType === "helicopter" ? "Helikopter" : lic.licenseType === "small-plane" ? "Vliegtuig Klein" : "Vliegtuig Groot",
          lic.issuedBy,
          "",
          "Actief",
          lic.issueDate,
          "Ja"
        ];
      });
      
      sheet.getRange(12, 1, rows.length, 9).setValues(rows);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        count: rows.length 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: "Onbekende actie." }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                            className="w-full bg-slate-1000 border border-slate-900 rounded-lg p-3 text-[10px] font-mono text-slate-350 focus:outline-none select-all"
                          />
                          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900 pointer-events-none">
                            Klik om te selecteren
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
                    
                    {/* Left Column: Account Connection state */}
                    <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        1. Google Account Verbinding
                      </h4>
                      
                      {googleUser ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-900">
                            {googleUser.photoURL ? (
                              <img 
                                src={googleUser.photoURL} 
                                alt="Avatar" 
                                className="w-8 h-8 rounded-full"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                                {googleUser.displayName?.charAt(0) || "G"}
                              </div>
                            )}
                            <div className="text-left">
                              <div className="text-xs font-bold text-white leading-tight">
                                {googleUser.displayName || "Google Gebruiker"}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {googleUser.email}
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-emerald-400 font-light flex items-center gap-1.5 bg-emerald-500/5 py-1 px-2.5 rounded border border-emerald-500/10">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            <span>Gezond verbonden met Google APIs</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleGoogleSignOut}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-mono uppercase bg-rose-500/5 hover:bg-rose-500/10 border border-slate-800 px-3 py-1.5 rounded-lg cursor-pointer block"
                          >
                            Google Account Afmelden
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 text-left">
                          {typeof window !== "undefined" && window.self !== window.top && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 rounded-xl space-y-1.5 leading-relaxed font-sans shadow-lg shadow-amber-500/5">
                              <div className="flex gap-1.5 items-center font-bold">
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                                <span>AI Studio Preview Melding</span>
                              </div>
                              <p className="text-slate-300 font-light text-[10px]">
                                Google blokkeert authenticatie-popups binnen de AI Studio voorbeeldweergave (iframe). Klik rechtsboven op <strong className="text-white">"Open in new tab"</strong> of open de ontwikkelings-URL in een nieuw tabblad om succesvol met Google in te loggen!
                              </p>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                            Meld aan met uw Google-account om de app schrijfrechten te geven in uw spreadsheetbestanden. 
                            Dit is 100% beveiligd via Google OAuth.
                          </p>

                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="gsi-material-button w-full flex items-center justify-center cursor-pointer transition-all hover:scale-[1.01]"
                            style={{
                              background: "white",
                              border: "1px solid #747775",
                              borderRadius: "12px",
                              color: "#1f1f1f",
                              fontFamily: "Inter, sans-serif",
                              fontSize: "12px",
                              fontWeight: "500",
                              height: "38px",
                              padding: "0 16px",
                              position: "relative",
                              textAlign: "center"
                            }}
                          >
                            <div className="gsi-material-button-icon" style={{ marginRight: "12px", display: "flex", alignItems: "center" }}>
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block", width: "18px", height: "18px" }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                              </svg>
                            </div>
                            <span>Meld aan met Google</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Spreadsheet ID Setup */}
                    <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4 text-left">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        2. Rekenblad Koppelen & Sync
                      </h4>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold leading-normal">
                          Rekenblad ID of Volledige URL
                        </label>
                        <input
                          type="text"
                          placeholder="Plak URL of ID (bijv: https://docs.google.com/spreadsheets/d/...)"
                          value={sheetIdInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSheetIdInput(val);
                            saveSpreadsheetId(val);
                            if (onUpdateSavedSpreadsheetId) onUpdateSavedSpreadsheetId(val);
                          }}
                          className="w-full bg-slate-1000 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                        />
                      </div>

                      <div className="space-y-3">
                        {connectedSheetTitle ? (
                          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-left">
                            <span className="text-[10px] text-slate-500 block font-mono font-bold leading-none uppercase">GEKOPPELD DOCUMENT</span>
                            <span className="text-xs text-white font-bold block mt-1 leading-normal truncate font-sans">
                              {connectedSheetTitle}
                            </span>
                            <span className="text-[9px] text-emerald-400 font-mono block mt-1">
                              Rij 12 start • Auto-append actief!
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-left text-[11px] text-slate-500 font-light leading-relaxed">
                            Nog geen Google Sheets bestand geverifieerd. Geef hierboven een ID op en druk op 'Koppeling Verharden'.
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={handleVerifyAndSaveSheet}
                            disabled={isVerifyingSheet}
                            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/20 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                          >
                            {isVerifyingSheet ? "Controleren..." : "Koppeling Verharden"}
                          </button>

                          <button
                            type="button"
                            onClick={handleSyncAllLicenses}
                            disabled={isSyncingAll || !googleToken || !sheetIdInput}
                            className={`px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 text-slate-950 font-bold font-mono text-xs rounded-xl uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                              (!googleToken || !sheetIdInput) ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02]"
                            }`}
                          >
                            {isSyncingAll ? "Exporteren..." : "Sync alle brevetten"}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Row 4: Homepage Announcement Management for management */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                  <Megaphone className="h-5 w-5 text-[#ea580c]" />
                  <h3 className="font-display font-semibold text-base text-white font-sans text-left">Homepagina Mededeling Beheer</h3>
                </div>
                <p className="text-xs text-slate-400 font-light mb-6">
                  Stel hier een belangrijk bericht of mededeling in die direct bovenaan de startpagina (Home) wordt getoond aan alle piloten en bezoekers. Laat het veld leeg of klik op 'Wissen' om de mededeling te verbergen.
                </p>
                <div className="space-y-4">
                  <textarea
                    rows={3}
                    placeholder="bijv: ✈️ OPEN DAG: Komende zondag vlieglessen met 50% korting! Bezoek onze Discord voor meer info."
                    value={announcement}
                    onChange={(e) => onUpdateAnnouncement(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 focus:border-[#ea580c] rounded-3xl p-4 text-xs text-slate-200 outline-none font-sans leading-relaxed transition-all"
                  />
                  {announcement.trim() && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onUpdateAnnouncement("")}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Mededeling Wissen
                      </button>
                    </div>
                  )}
                </div>
              </div>

                </>
              )}
            </div>
          );
        })()}

        {/* VLOOT & VOORRAAD BEHEER TAB */}
        {activeTab === "fleet" && (role === "owner" || role === "manager") && (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest block">Type Categorie</label>
                      <select
                        value={fleetType}
                        onChange={(e) => setFleetType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      >
                        <option value="small-plane">Vliegtuig Klein</option>
                        <option value="large-plane">Vliegtuig Groot</option>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase block font-bold">Capaciteit</label>
                      <input
                        type="number"
                        placeholder="Zitplaatsen"
                        value={fleetCapacity}
                        onChange={(e) => setFleetCapacity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase block font-bold">Max Snelheid (km/h)</label>
                      <input
                        type="number"
                        placeholder="bijv: 250"
                        value={fleetTopSpeed}
                        onChange={(e) => setFleetTopSpeed(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 focus:border-[#ea580c] outline-none text-xs text-slate-200"
                      />
                    </div>
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
                      <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold text-left">
                        <th className="py-3 px-4">Model ID</th>
                        <th className="py-3 px-4">Toestelnaam</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Basisprijs</th>
                        <th className="py-3 px-4 text-center">Zichtbaar</th>
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

            {/* Vliegbrevetten Zichtbaarheid (Zorg dat beheer ook kan aanvinken welke brevetten je wel en niet kan kopen) */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl mt-8">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <Award className="h-5 w-5 text-[#ea580c]" />
                <h3 className="font-display font-semibold text-base text-white">Vliegbrevetten Zichtbaarheid</h3>
              </div>
              <p className="text-xs text-slate-400 font-light mb-6">
                Vink aan welke pilotenbrevetten beschikbaar zijn voor aankoop/aanvraag door leerling-piloten in de <strong>Vliegbrevetten & Licenties</strong> hub. Uitgevinkte brevetten worden daar direct verborgen.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-left">
                {LICENSES.map((lic) => {
                  const isVisible = licenseVisibility ? licenseVisibility[lic.id] !== false : true;
                  return (
                    <div 
                      key={lic.id} 
                      className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-800 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono text-[#ea580c] font-bold tracking-wider">{lic.category}</span>
                        <h4 className="font-display font-semibold text-sm text-white">{lic.name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">€{lic.price.toLocaleString("nl-NL")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) => {
                            if (onUpdateLicenseVisibility) {
                              onUpdateLicenseVisibility({
                                ...(licenseVisibility || {}),
                                [lic.id]: e.target.checked
                              });
                            }
                          }}
                          className="rounded border-slate-800 bg-slate-900 text-[#ea580c] h-5.5 w-5.5 cursor-pointer accent-[#ea580c]"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* OWNER USER ACCOUNTS MANAGEMENTS */}
        {activeTab === "users" && (role === "owner" || role === "manager") && (
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
            
            {/* ADD A NEW EMPLOYEE FOR WAGES/PAYROLL */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl text-left font-sans">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <Plus className="h-5 w-5 text-emerald-400" />
                <h3 className="font-display font-semibold text-base text-white font-sans text-left">Nieuwe Medewerker Toevoegen</h3>
              </div>

              <p className="text-xs text-slate-400 font-light mb-6">
                Registreer hier een nieuwe medewerker. Deze naam wordt direct opgenomen in de selectielijsten voor brevetuitgave, commissies en loonregisters.
              </p>

              {userCreatedMessage && (
                <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-sans font-light">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                  <span>{userCreatedMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Volledige Naam van de Medewerker
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullname}
                    onChange={(e) => setNewFullname(e.target.value)}
                    placeholder="Bijv: Jan de Vries"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:border-emerald-500 focus:outline-none transition-all focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Discord ID (Optioneel)
                  </label>
                  <input
                    type="text"
                    value={newDiscordId}
                    onChange={(e) => setNewDiscordId(e.target.value)}
                    placeholder="Bijv: 304859039201928301"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:border-emerald-500 focus:outline-none transition-all focus:ring-1 focus:ring-emerald-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase tracking-wider mb-1.5">
                    Functie / Rol binnen het Portaal
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 outline-none text-xs text-slate-300 font-sans focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="medewerker">Medewerker (Instructeur / Grondpersoneel)</option>
                    <option value="manager">Manager (Mede-Directie)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/20 text-white font-bold font-mono py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4 text-emerald-400" />
                  <span>Medewerker Registreren</span>
                </button>
              </form>
            </div>

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
                        {user.discordId && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>Discord ID:</span>
                            <strong className="text-cyan-400 bg-slate-950/50 px-2 py-0.5 rounded border border-slate-850/60 font-mono font-bold select-all">
                              {user.discordId}
                            </strong>
                          </div>
                        )}
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

        {/* KLU PORTAL TAB AREA / REDIRECT */}
        {activeTab === "klu" && (role === "owner" || role === "manager" || role === "medewerker" || role === "klu") && (
          <div className="p-12 border border-dashed border-slate-800 bg-slate-950 rounded-3xl text-center space-y-3 font-sans w-full max-w-2xl mx-auto my-6 text-left">
            <Shield className="h-8 w-8 text-slate-300 mx-auto animate-pulse" />
            <h4 className="font-semibold text-white text-center text-sm">KLu Rijksportaal is verplaatst</h4>
            <p className="text-slate-400 text-xs text-center max-w-md mx-auto leading-relaxed">
              Het MLC Militaire Rijksportaal bevindt zich nu in zijn eigen, onafhankelijke hoofd-segment bovenaan de navigatiebalk. Klik op <strong className="text-slate-200">"KLu Rijksportaal"</strong> in het hoofdmenu om het portaal te betreden.
            </p>
          </div>
        )}
        {(() => {
          // Dummy stubs for compilation of deactivated legacy block
          const kluSearch = "";
          const setKluSearch = (v: any) => {};
          const kluFilter = "all";
          const setKluFilter = (v: any) => {};
          const filteredKluLicenses: any[] = [];
          const activeHandbookTab = "missions" as any;
          const setActiveHandbookTab = (v: any) => {};
          return false && (() => {
            return (
            <div className="space-y-8 animate-fade-in font-mono text-xs text-slate-300">
               {/* Glowing Hero Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/40 border-2 border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                 {/* Glowing target effect */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-800/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="space-y-3 max-w-2xl text-left font-sans">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-900 text-slate-300 font-sans font-bold uppercase tracking-widest text-[9px] rounded-full border border-slate-805">
                       Rijksportaal Actief
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500/15 text-amber-500 font-sans font-bold uppercase tracking-widest text-[9px] rounded-full border border-amber-500/25 animate-pulse">
                      DEFCON 4 // NORMAL OPS
                    </span>
                  </div>
                  <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight flex items-center gap-3">
                    <Shield className="h-7 w-7 text-slate-300 shrink-0" />
                    Koninklijke Luchtmacht
                  </h2>
                  <p className="text-xs text-slate-400 font-light leading-relaxed max-w-xl">
                    Welkom bij het gecertificeerde Rijksportaal van het Militair Luchtvaart Commando (MLC). Hier worden militaire bevoegdheden beheerd, vlieguren bijgehouden, en tactische procedures gemonitord.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center md:items-end gap-1.5 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl min-w-[200px] text-center md:text-right font-sans">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">Ingelogde Rijksambtenaar</div>
                  <div className="text-white font-bold text-sm">{fullname}</div>
                  <div className="text-[9px] text-[#5865F2] font-semibold uppercase flex items-center gap-1 mt-1 justify-center md:justify-end font-mono">
                    <span>Inlog via Discord</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-ping"></span>
                  </div>
                  <div className="text-[10px] text-slate-350 font-bold border border-slate-800 bg-slate-900 px-2 py-0.5 rounded uppercase mt-2 font-mono">
                    Rol: {role === "klu" ? "KLu Piloot / Officier" : `LCO Directie (${role})`}
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: Brevetten & Handbook */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Column LEFT: Brevetten Register (7 columns) */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-6 text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                    <div>
                      <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-400" />
                        Militaire & Civiele Brevettenlijst
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans font-light mt-0.5">Overzicht van actieve piloten in het LCO & KLu Rijksregister.</p>
                    </div>
                  </div>

                  {/* Filter and Search controls */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-7">
                      <input
                        type="text"
                        placeholder="Zoek piloot op naam, ID of instructeur..."
                        value={kluSearch}
                        onChange={(e) => setKluSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 focus:border-emerald-500 outline-none text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div className="md:col-span-5">
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

                  {/* High Quality Pilot List */}
                  {filteredKluLicenses.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-850 bg-slate-950/40 rounded-2xl text-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-slate-650 mx-auto" />
                      <p className="text-slate-500 text-xs">Geen piloten of brevetten gevonden...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-900/60 rounded-2xl">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-850 font-mono text-[9px] uppercase tracking-wider text-slate-450">
                            <th className="py-3 px-4 md:w-1/3">Piloot & BSN/CID</th>
                            <th className="py-3 px-4">Behaald Brevet</th>
                            <th className="py-3 px-4 font-bold text-slate-500">Militair Equivalent</th>
                            <th className="py-3 px-4 text-right">Datum</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/50">
                          {filteredKluLicenses.map((lic) => {
                            let milEquivalent = "SAR Reserve Pilot";
                            let iconColor = "text-amber-500";
                            
                            if (lic.licenseType === "helicopter") {
                              milEquivalent = "NH90 Copter Command";
                              iconColor = "text-teal-400";
                            } else if (lic.licenseType === "large-plane") {
                              milEquivalent = "C-130 Hercules Commander";
                              iconColor = "text-sky-400";
                            } else {
                              milEquivalent = "F-16 Combat Interceptor";
                              iconColor = "text-rose-400";
                            }

                            return (
                              <tr key={lic.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3.5 px-4">
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
                                <td className="py-3.5 px-4 font-mono">
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border border-emerald-500/20 bg-emerald-500/5 ${iconColor}`}>
                                    ⚡ {milEquivalent}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 text-right">
                                  {lic.issueDate}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Direct connection banner */}
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-semibold text-white text-xs font-sans">Behaalde brevetten omruilen voor KLu-status?</h4>
                      <p className="text-[10px] text-slate-400 font-sans">Nieuwe rekruten worden getoetst door MLC instructeurs en geaccrediteerd via onze Discord.</p>
                    </div>
                    <a
                      href="https://discord.gg/FACgeTSrAR"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#ea580c] hover:bg-[#ea580c]/90 text-slate-950 font-bold font-mono tracking-wide text-[10px] uppercase rounded-xl transition-all shadow-lg shadow-[#ea580c]/10 cursor-pointer text-center whitespace-nowrap"
                    >
                      Militair Verzoek Indienen
                    </a>
                  </div>
                </div>

                {/* Column RIGHT: Interactive Operational Handbook (5 columns) */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-6 text-left">
                  <div>
                    <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5 text-amber-500" />
                      KLu Handboek & Protocollen
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans font-light mt-0.5">Officiële instructies en operatie-protocollen van de Luchtmacht.</p>
                  </div>

                  {/* Handbook tabs */}
                  <div className="grid grid-cols-4 gap-1.5 border-b border-slate-900 pb-3">
                    <button
                      type="button"
                      onClick={() => setActiveHandbookTab("missions")}
                      className={`py-1.5 text-[9px] uppercase font-bold rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                        activeHandbookTab === "missions"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Missies
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveHandbookTab("atc")}
                      className={`py-1.5 text-[9px] uppercase font-bold rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                        activeHandbookTab === "atc"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      ATC & RT
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveHandbookTab("ranks")}
                      className={`py-1.5 text-[9px] uppercase font-bold rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                        activeHandbookTab === "ranks"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Rangen
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveHandbookTab("fleet")}
                      className={`py-1.5 text-[9px] uppercase font-bold rounded-lg tracking-wider text-center cursor-pointer transition-all ${
                        activeHandbookTab === "fleet"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      KLu Vloot
                    </button>
                  </div>

                  {/* Handbook tab contents */}
                  <div className="space-y-4 font-sans text-xs leading-relaxed text-slate-300 min-h-[300px]">
                    
                    {activeHandbookTab === "missions" && (
                      <div className="space-y-3 animate-fade-in font-sans text-[11.5px] leading-relaxed">
                        <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs uppercase text-emerald-300">
                          <Navigation className="h-4 w-4 shrink-0" />
                          <span>Militair Search & Rescue (SAR) & Ops</span>
                        </div>
                        <p className="font-light">
                          De Koninklijke Luchtmacht (KLu) opereert permanent vanuit de strategische uitvalshavens van de Caraïben. Onze primaire militaire taken omvatten:
                        </p>
                        <ul className="space-y-2 relative border-l border-emerald-500/20 ml-2 pl-4">
                          <li>
                            <strong className="text-white font-medium">Maritime Search and Rescue (SAR):</strong> Het direct opsporen en evacueren van opvarenden of neergekomen toestellen rondom de Arubaanse wateren met tactical hoist maneuvers.
                          </li>
                          <li>
                            <strong className="text-white font-medium">Luchtruimbeveiliging & Interceptie:</strong> Het handhaven van soevereiniteit door verdachte ongeïdentificeerde VFR/IFR contacten op te vangen en te begeleiden via interceptie protocollen.
                          </li>
                          <li>
                            <strong className="text-white font-medium">Tactisch Transport & VIP:</strong> Het overbrengen van rijksambtenaren, defensiematerieel of speciaal commando-personeel namens het Koninkrijk.
                          </li>
                        </ul>
                        <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl font-mono text-[10px] text-amber-500 leading-normal">
                          ⚠️ INSTRUCTIE: SAR helicopters hebben ten allen tijde absolute voorrang in het control-area (CTR) van Beatrix Airport na melding via de noodfrequentie 121.50 MHz.
                        </div>
                      </div>
                    )}

                    {activeHandbookTab === "atc" && (
                      <div className="space-y-3 animate-fade-in font-sans text-[11.5px] leading-relaxed">
                        <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs uppercase text-emerald-300">
                          <Plane className="h-4 w-4 shrink-0" />
                          <span>ATC Samenwerking & Noodoproepen</span>
                        </div>
                        <p className="font-light">
                          Alle militaire missies en formatievluchten dienen nauwkeurig gecoördineerd te worden met de plaatselijke Air Traffic Controller (ATC).
                        </p>
                        <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 text-slate-300 font-mono text-[10.5px] leading-relaxed">
                          <div className="text-white font-bold mb-1 font-sans">Standard Radio Telecom (RT-taal):</div>
                          <div>• <span className="text-emerald-400 font-bold">"Raptor Flight"</span> - Callsign prefix voor jachtvliegtuigen.</div>
                          <div>• <span className="text-emerald-400 font-bold">"Albatross"</span> - Callsign prefix voor tactisch luchttransport (C-130).</div>
                          <div>• <span className="text-red-400 font-bold">"PAN-PAN / MAYDAY"</span> - Onmiddellijke status noodprioriteit. Nooit onnodig zenden.</div>
                          <div>• <span className="text-emerald-400 font-bold">"Roger"</span> - Begrepen en akkoord met de instructie.</div>
                        </div>
                        <p className="font-light">
                          Wanneer u formatievliegen of gevechtstraining overweegt, dient u een defensie-ticket te openen in de Discord server om airspace reserveringen vast te leggen.
                        </p>
                      </div>
                    )}

                    {activeHandbookTab === "ranks" && (
                      <div className="space-y-3 animate-fade-in font-sans text-[11.5px] leading-relaxed">
                        <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs uppercase text-emerald-300">
                          <Shield className="h-4 w-4 shrink-0" />
                          <span>Rangen en Bevoegdheden</span>
                        </div>
                        <p className="font-light">
                          Binnen het Luchtmacht Commando (MLC) wordt een strakke hiërarchie gehanteerd om operationele paraatheid en discipline te borgen. Handhaving hiervan is de verantwoordelijkheid van de Officieren.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                            <span className="font-semibold text-white font-sans text-xs">1. Generaal / Kolonel (Directie)</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">Beherend Officier</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                            <span className="font-semibold text-white font-sans text-xs">2. Majoor / Kapitein (Instructeurs)</span>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">Toetsingsbevoegd</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                            <span className="font-semibold text-white font-sans text-xs">3. Luitenant / Sergeant (Piloten)</span>
                            <span className="text-[10px] text-teal-400 font-mono font-bold">Gecertificeerd Vlieger</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                            <span className="font-semibold text-white font-sans text-xs">4. Korporaal / Soldaat (Leden)</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">Rekruut / Aspirant</span>
                          </div>
                        </div>
                        <p className="text-[10px] italic text-slate-400 font-sans mt-2">
                          Accreditatie en promoties worden toegekend op basis van actieve vlieguren en theorievoldoendes.
                        </p>
                      </div>
                    )}

                    {activeHandbookTab === "fleet" && (
                      <div className="space-y-3 animate-fade-in font-sans text-[11.5px] leading-relaxed">
                        <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs uppercase text-emerald-300">
                          <Plane className="h-4 w-4 shrink-0" />
                          <span>Militaire Vliegtuigmodellen</span>
                        </div>
                        <p className="font-light">
                          De operationele vloot van de Caraïbische KLu-divisie bestaat uit de volgende hoogwaardige tactische platforms:
                        </p>
                        <div className="space-y-3">
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850/80">
                            <div className="flex justify-between font-mono text-[10.5px] text-white font-bold uppercase">
                              <span>🚁 NH90 SAR Tactische Copter</span>
                              <span className="text-teal-400">Tactical</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal font-sans mt-1">
                              Ideaal voor opsporing op zee, drenkelingen redden en spoedeisend medisch vervoer tussen de eilanden.
                            </p>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850/80">
                            <div className="flex justify-between font-mono text-[10.5px] text-white font-bold uppercase">
                              <span>✈️ F-16 Fighting Falcon</span>
                              <span className="text-rose-400">Gevechtsjager</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal font-sans mt-1">
                              Extreem wendbare onderscheppingsvliegtuigen belast met de Arubaanse luchtruimbeveiliging en escortes.
                            </p>
                          </div>
                          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850/80">
                            <div className="flex justify-between font-mono text-[10.5px] text-white font-bold uppercase">
                              <span>🛫 C-130 Hercules Cruiser</span>
                              <span className="text-sky-400">Zwaar Transport</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal font-sans mt-1">
                              Vrachtgigant ontworpen om gigantische contingenten troepen, voertuigen en hulpmiddelen droppen.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          );
        })()
        })()}

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
                    <span>- 7% Belasting op totale winst:</span>
                    <span>€{taxConfirmationData.unpaidGrossTax.toLocaleString("nl-NL")}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>- Vast periodiek tarief (15k):</span>
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

        {/* Custom Edit License Modal */}
        {editingLic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-2xl w-full mx-4 my-8 shadow-2xl relative text-left">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
                <Pencil className="h-5 w-5 text-[#ea580c]" />
                <h3 className="font-display font-semibold text-lg text-white">Brevet Aanpassen</h3>
                <span className="ml-auto text-xs text-slate-500 font-mono font-bold uppercase bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">ID: {editingLic.id}</span>
              </div>

              <form onSubmit={handleSaveEditLicense} className="space-y-4 font-mono text-xs text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Klant (Piloot)</label>
                    <input
                      type="text"
                      required
                      value={editCitizenName}
                      onChange={(e) => setEditCitizenName(e.target.value)}
                      placeholder="Bijv. John Doe"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Burger ID / BSN</label>
                    <input
                      type="text"
                      required
                      value={editCitizenId}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val && !val.toUpperCase().startsWith("BSN-")) {
                          val = "BSN-" + val.replace(/^BSN-?/i, "");
                        }
                        setEditCitizenId(val);
                      }}
                      placeholder="Bijv. BSN-12345678"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Diploma Categorie</label>
                    <select
                      value={editLicenseType}
                      onChange={(e) => setEditLicenseType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-slate-300"
                    >
                      <option value="helicopter">Helikopter brevet</option>
                      <option value="small-plane">Vliegtuig Klein</option>
                      <option value="large-plane">Vliegtuig Groot</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Datum Uitgegeven</label>
                    <input
                      type="text"
                      required
                      value={editIssueDate}
                      onChange={(e) => setEditIssueDate(e.target.value)}
                      placeholder="Bijv: 1-6-2026"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 focus:border-[#ea580c] outline-none text-slate-200"
                    />
                  </div>
                </div>

                {/* Instructor Selection Inside Edit Modal */}
                <div className="space-y-3 pt-2 text-left">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold text-[#ea580c]">
                    👨‍✈️ Selecteer Instructeur (voorzien van Discord ID)
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {staffAccounts.map((acc) => {
                      const isSelected = editSelectedInstructorId === acc.id && !editUseCustomInstructor;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            setEditSelectedInstructorId(acc.id);
                            setEditUseCustomInstructor(false);
                          }}
                          className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-[#ea580c]/15 border-[#ea580c] shadow-lg shadow-[#ea580c]/5"
                              : "bg-slate-900/60 border-slate-850 hover:border-slate-750 hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-display font-semibold text-white text-xs block truncate">{acc.fullname}</span>
                            <div className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center">
                              {isSelected && <div className="h-2 w-2 rounded-full bg-[#ea580c]"></div>}
                            </div>
                          </div>
                          <div className="mt-1 font-mono text-[9px] text-slate-400 leading-tight">
                            Discord ID: <span className={acc.discordId ? "text-cyan-400 font-bold" : "text-amber-500/80 italic font-medium"}>{acc.discordId || "Geen Discord ID"}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div
                      onClick={() => setEditUseCustomInstructor(true)}
                      className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                        editUseCustomInstructor
                          ? "bg-[#ea580c]/15 border-[#ea580c] shadow-lg shadow-[#ea580c]/5"
                          : "bg-slate-900/60 border-slate-850 hover:border-slate-750 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display font-semibold text-white text-xs block">Handmatig Invullen</span>
                        <div className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center">
                          {editUseCustomInstructor && <div className="h-2 w-2 rounded-full bg-[#ea580c]"></div>}
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-500 font-sans leading-tight mt-1">
                        Ander personeelslid of handmatige invoer gebruiken.
                      </p>
                    </div>
                  </div>

                  {editUseCustomInstructor && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-slate-950/45 p-3.5 rounded-xl border border-slate-800/80 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block font-medium">Instructeur Naam</label>
                        <input
                          type="text"
                          required={editUseCustomInstructor}
                          value={editCustomInstructorName}
                          onChange={(e) => setEditCustomInstructorName(e.target.value)}
                          placeholder="Bijv: Mike Lapose"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 outline-none focus:border-[#ea580c] text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 uppercase block font-medium">Discord ID (Cijfers)</label>
                        <input
                          type="text"
                          required={editUseCustomInstructor}
                          value={editCustomInstructorDiscordId}
                          onChange={(e) => setEditCustomInstructorDiscordId(e.target.value)}
                          placeholder="Bijv: 304859039201928301"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 outline-none focus:border-[#ea580c] text-slate-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Opmerkingen / Boekingsinformatie</label>
                  <textarea
                    value={editRemarks}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    placeholder="Opmerkingen omtrent de examenvlucht..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 focus:border-[#ea580c] outline-none text-slate-200 text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block text-[11px]">Medewerkerscommissie</span>
                      <span className="text-[9px] text-slate-500">Is de commissie al uitbetaald?</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editEmployeePaid}
                      onChange={(e) => setEditEmployeePaid(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-[#ea580c] focus:ring-[#ea580c] border-slate-850 bg-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block text-[11px]">Vliegbelasting afgedragen</span>
                      <span className="text-[9px] text-slate-500">Is de belasting afgedragen?</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editTaxPaid}
                      onChange={(e) => setEditTaxPaid(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-[#ea580c] focus:ring-[#ea580c] border-slate-850 bg-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl flex items-center justify-between col-span-1 md:col-span-2">
                    <div>
                      <span className="font-semibold text-white block text-[11px]">Management Fee voldaan</span>
                      <span className="text-[9px] text-slate-500">Zijn de Directie fees (€15k Mike + €15k Ron) voldaan?</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editManagementFeePaid}
                      onChange={(e) => setEditManagementFeePaid(e.target.checked)}
                      className="w-4.5 h-4.5 rounded text-[#ea580c] focus:ring-[#ea580c] border-slate-850 bg-slate-950 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setEditingLic(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/80 font-bold py-3 px-5 rounded-xl cursor-pointer transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-bold py-3 px-6 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Opslaan & Opslaan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
