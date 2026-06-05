export interface License {
  id: string;
  name: string;
  type: "helicopter" | "small-plane" | "large-plane";
  price: number;
  description: string;
  category: string;
  difficulty: "Gemiddeld" | "Beginner" | "Gevorderd";
  requirements: string[];
  specs: {
    duration: string;
    hoursRequired: number;
    maxAltitude: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Aircraft {
  id: string;
  name: string;
  type: "helicopter" | "small-plane" | "large-plane";
  manufacturer: string;
  basePrice: number;
  topSpeedKnots: number;
  rangeKm: number;
  engineType: string;
  capacity: number;
  description: string;
  imageTheme: string;
  imageUrl?: string;
}

export interface StaffUser {
  id: string;
  username: string;
  passwordHash: string; // clear text password for simple storage
  role: "owner" | "manager" | "medewerker" | "klu";
  fullname: string;
  discordId?: string; // stored discord ID
}

export interface TrainingCourse {
  id: string;
  title: string;
  instructor: string;
  description: string;
  durationWeeks: number;
  price: number;
  topics: string[];
  rating: number;
}

export interface Message {
  id: string;
  sender: "user" | "atc";
  content: string;
  timestamp: string;
}

export interface Telemetry {
  altitude: number;
  speed: number;
  fuel: number;
  heading: number;
  wind: string;
  status: string;
}

export interface PilotLogbook {
  totalHours: number;
  helicopterHours: number;
  smallPlaneHours: number;
  largePlaneHours: number;
  completedQuizzes: string[]; // ids of licensed types
  completedSimulators: string[]; // ids of licensed types
  unlockedLicenses: string[]; //ids of licensed types
  ownedAircraft: Array<{
    id: string;
    name: string;
    configuredColor: string;
    configuredAvionics: string;
    totalPrice: number;
    orderDate: string;
  }>;
}

export interface IssuedLicense {
  id: string;
  citizenName: string;
  citizenId: string; // CID / BSN
  licenseType: "helicopter" | "small-plane" | "large-plane";
  issuedBy: string; // Staff member who signed it off
  issuedByDiscordId?: string; // Discord ID of the instructor who signed it off
  issueDate: string;
  remarks?: string;
  employeeCommissionPaid?: boolean;
  taxPaid?: boolean;
  managementFeePaid?: boolean;
}

export interface AircraftInventory {
  aircraftId: string;
  stockCount: number;
  status: "Op voorraad" | "Gereserveerd" | "Uitverkocht";
  priceOverride?: number;
  isVisible?: boolean;
}

export interface FinancialConfig {
  helicopterPrice: number;
  helicopterCommission: number;
  helicopterStandardTax: number;
  helicopterGrossTaxRate: number; // percentage (e.g. 7 for 7%)
  helicopterManagementFee: number;
  helicopterPurchaseCost: number;

  smallPlanePrice: number;
  smallPlaneCommission: number;
  smallPlaneStandardTax: number;
  smallPlaneGrossTaxRate: number; // percentage (e.g. 7 for 7%)
  smallPlaneManagementFee: number;
  smallPlanePurchaseCost: number;

  largePlanePrice: number;
  largePlaneCommission: number;
  largePlaneStandardTax: number;
  largePlaneGrossTaxRate: number; // percentage (e.g. 7 for 7%)
  largePlaneManagementFee: number;
  largePlanePurchaseCost: number;
}


