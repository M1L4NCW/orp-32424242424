import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { IssuedLicense } from "../types";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider Configured with Google Sheets and Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

// In-Memory Token Cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize Google Sheets authentication state change listener
 */
export const initGoogleSheetsAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onSuccess) onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear cached token if session restored but token absent, force login setup
        cachedAccessToken = null;
        if (onFailure) onFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
};

/**
 * Standard Sign in with Google Popup
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Geen access token verkregen van Google Authentication.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Fout tijdens inloggen met Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retrieve cached token or request new login
 */
export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Log out and clear tokens
 */
export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

/**
 * LocalStorage Helpers for Spreadsheet Integration
 */
const GOOGLE_SPREADSHEET_ID_KEY = "@luchtvaart_oranjestad_spreadsheet_id";

export const getSavedSpreadsheetId = (): string => {
  return localStorage.getItem(GOOGLE_SPREADSHEET_ID_KEY) || "";
};

export const saveSpreadsheetId = (id: string) => {
  if (id) {
    localStorage.setItem(GOOGLE_SPREADSHEET_ID_KEY, id.trim());
  } else {
    localStorage.removeItem(GOOGLE_SPREADSHEET_ID_KEY);
  }
};

/**
 * Extractor Helper to get Sheet id from full URL or return clean ID
 */
export const extractSpreadsheetId = (urlOrId: string): string => {
  const trimmed = urlOrId.trim();
  if (trimmed.includes("docs.google.com/spreadsheets")) {
    const matches = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return matches ? matches[1] : trimmed;
  }
  return trimmed;
};

/**
 * Call Sheets API to check document and get its Title/Name as a connectivity check
 */
export const fetchSpreadsheetTitle = async (
  spreadsheetId: string, 
  token: string
): Promise<string> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) {
      throw new Error("Ongeldige machtigingen of deelsessie verlopen. Log opnieuw in met Google.");
    }
    throw new Error("Document niet gevonden of niet toegankelijk. Controleer de link / ID.");
  }

  const data = await response.ok ? await response.json() : null;
  return data?.properties?.title || "Naamloos Rekenblad";
};

/**
 * Append or replace record in a specific Google Sheet starting at Row 12
 * Zorg dat alle brevetten die ingevuld worden op de juiste volgorde: vanaf rij 12 kan je invullen.
 */
export const saveLicenseToSheet = async (
  spreadsheetId: string,
  token: string,
  license: IssuedLicense
): Promise<{ row: number }> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  
  // 1. Fetch current rows in range A12:I to identify how many records have been placed starting at row 12.
  const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/A12:I1000`;
  const getRes = await fetch(checkUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  let values: string[][] = [];
  if (getRes.ok) {
    const data = await getRes.json();
    values = data.values || [];
  } else {
    console.warn("Failed retrieving pre-existing rows inside A12:I1000 range. Defaulting empty.");
  }

  // The next available row is 12 + the number of existing rows.
  const targetRow = 12 + values.length;

  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/A${targetRow}:I${targetRow}?valueInputOption=USER_ENTERED`;
  
  const payload = {
    values: [
      [
        license.citizenId,
        license.citizenName,
        license.licenseType === "helicopter" ? "Helikopter" : license.licenseType === "small-plane" ? "Vliegtuig Klein" : "Vliegtuig Groot",
        license.issuedBy,
        license.issueDate,
        license.remarks || "-",
        license.employeeCommissionPaid ? "Ja" : "Nee",
        license.taxPaid ? "Ja" : "Nee",
        license.id
      ]
    ]
  };

  const putRes = await fetch(updateUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!putRes.ok) {
    throw new Error(`Google Sheets API Fout (${putRes.status}): Kon rij ${targetRow} niet vullen.`);
  }

  return { row: targetRow };
};

/**
 * Bulk syncing of existing licenses in chronological order starting at row 12
 */
export const syncLicensesToSheet = async (
  spreadsheetId: string,
  token: string,
  licenses: IssuedLicense[]
): Promise<number> => {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  
  // Sort licenses chronologically or as is (reversed is latest to oldest, but we should write oldest to newest sequence if needed)
  // Let's assume order should be from oldest to newest when appending
  const sorted = [...licenses].reverse();

  // Clear everything starting from A12 downwards
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/A12:I1000:clear`;
  await fetch(clearUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (sorted.length === 0) return 0;

  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/A12:I${12 + sorted.length - 1}?valueInputOption=USER_ENTERED`;
  
  const payloadRange = sorted.map(lic => [
    lic.citizenId,
    lic.citizenName,
    lic.licenseType === "helicopter" ? "Helikopter" : lic.licenseType === "small-plane" ? "Vliegtuig Klein" : "Vliegtuig Groot",
    lic.issuedBy,
    lic.issueDate,
    lic.remarks || "-",
    lic.employeeCommissionPaid ? "Ja" : "Nee",
    lic.taxPaid ? "Ja" : "Nee",
    lic.id
  ]);

  const putRes = await fetch(updateUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: payloadRange })
  });

  if (!putRes.ok) {
    throw new Error(`Bulk sync mislukt (${putRes.status}): Kon de rijen vanaf row 12 niet overschrijven.`);
  }

  return sorted.length;
};
