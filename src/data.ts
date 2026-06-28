import { License, Aircraft, TrainingCourse, IssuedLicense, FinancialConfig, AircraftInventory } from "./types";

export const DEFAULT_FINANCIAL_CONFIG: FinancialConfig = {
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
  largePlanePurchaseCost: 300000,
  
  managementReceivers: ["Mike"]
};


export const LICENSES: License[] = [
  {
    id: "helicopter",
    name: "Helikopter Brevet",
    type: "helicopter",
    price: 250000,
    description: "Beheers de kunst van het helikoptervliegen over Oranjestad. Uw ticket naar ultieme mobiliteit en landing op de meest exclusieve helipads.",
    category: "Helikopter",
    difficulty: "Gemiddeld",
    requirements: [],
    specs: {
      duration: "",
      hoursRequired: 0,
      maxAltitude: ""
    }
  },
  {
    id: "small-plane",
    name: "Vliegtuig Klein Brevet",
    type: "small-plane",
    price: 500000,
    description: "Leer vliegen in eenmotorige sportvliegtuigen zoals de Cessna 172 of Cirrus SR22. Uitermate geschikt voor privévluchten en verkenningstochten.",
    category: "Vliegtuig Klein",
    difficulty: "Beginner",
    requirements: [],
    specs: {
      duration: "",
      hoursRequired: 0,
      maxAltitude: ""
    }
  },
  {
    id: "large-plane",
    name: "Vliegtuig Groot Brevet",
    type: "large-plane",
    price: 750000,
    description: "Het ultieme brevet voor de zware luchtvaart. Word gezagvoerder op legendarische meermotorige straalvliegtuigen en commerciële liners.",
    category: "Vliegtuig Groot",
    difficulty: "Gevorderd",
    requirements: [],
    specs: {
      duration: "",
      hoursRequired: 0,
      maxAltitude: ""
    }
  }
];

export const AIRCRAFT_LIST: Aircraft[] = [
  {
    id: "heli-r44",
    name: "Robinson R44 Clipper II",
    type: "helicopter",
    manufacturer: "Robinson Helicopter Company",
    basePrice: 250000,
    topSpeedKnots: 110,
    rangeKm: 560,
    engineType: "Lycoming IO-540-AE1A5 (Zuiger)",
    capacity: 4,
    description: "Een uiterst betrouwbare, vierzits lichte helikopter. Ideaal voor trainingsvluchten, luchtfotografie en snelle verplaatsingen rondom Aruba's exclusieve resorts.",
    imageTheme: "orange-sky"
  },
  {
    id: "plane-c172",
    name: "Cessna Skyhawk 172",
    type: "small-plane",
    manufacturer: "Cessna Aircraft Company",
    basePrice: 500000,
    topSpeedKnots: 124,
    rangeKm: 1185,
    engineType: "Lycoming IO-360-L2A (Glass Cockpit)",
    capacity: 4,
    description: "De legendarische klassieker. Wereldwijd de absolute nummer één voor pilotenopleidingen, gekenmerkt door ultieme vergevingsgezindheid en fantastisch zicht rondom.",
    imageTheme: "clear-sky"
  },
  {
    id: "plane-c560",
    name: "Cessna Citation Sovereign+",
    type: "large-plane",
    manufacturer: "Textron Aviation",
    basePrice: 750000,
    topSpeedKnots: 460,
    rangeKm: 5900,
    engineType: "Pratt & Whitney PW306D (Twin-Jet)",
    capacity: 12,
    description: "De ultieme luxe in de Caribische stratosfeer. Deze executive jet brengt u in recordtijd en in alle rust, comfort en stijl direct naar Miami, New York of Bogota.",
    imageTheme: "sunset-clouds"
  }
];

export const COURSES: TrainingCourse[] = [
  {
    id: "rt-radio",
    title: "Radiotelefonie (VFR & IFR)",
    instructor: "Kapt. Henk van der Meer",
    description: "Leer foutloos communiceren met luchtverkeersleidingen (ATC) in het Engels en Nederlands volgens officiële ICAO spelling en standaarden. Essentieel voor veilig en gecontroleerd vliegen.",
    durationWeeks: 4,
    price: 450,
    topics: ["ICAO alfabet & standaardzinnen", "Noodprocedures & Mayday", "ATC klaringen interpreteren", "Luchtruim classificaties"],
    rating: 4.9
  },
  {
    id: "meteo-carib",
    title: "Tropische Meteorologie",
    instructor: "Dr. Evelyn Croes",
    description: "Begrijp windpatronen, passaatwinden, tropische stormsystemen en de unieke aerodynamische effecten in het Caribisch gebied. Cruciaal voor veilige vluchten rondom Aruba.",
    durationWeeks: 3,
    price: 380,
    topics: ["Wolkenherkenning & Beaufort", "Passaatwinden & thermiek", "Microbursts & windschering", "Decoderen van METAR & TAF"],
    rating: 4.8
  },
  {
    id: "glass-cockpit",
    title: "Garmin G1000 Transitie",
    instructor: "Instructeur Ryan Peterson",
    description: "Stap over van analoge klokken naar de modernste 'glass cockpit'. Beheers de Primary Flight Display (PFD) en Multi-Function Display (MFD) inclusief autopiloot integraties.",
    durationWeeks: 5,
    price: 950,
    topics: ["Synthetisch zicht navigatie", "Vluchtplannen programmeren", "Motor management pagina's", "Systeemstoringen simuleren"],
    rating: 5.0
  }
];

export const DEFAULT_ISSUED_LICENSES: IssuedLicense[] = [
  {
    id: "lic-001",
    citizenName: "Jan de Vries",
    citizenId: "CID-49302",
    licenseType: "helicopter",
    issuedBy: "Eigenaar",
    issueDate: "2026-05-12",
    remarks: "Uitstekende autorotatie landing gedemonstreerd.",
    employeeCommissionPaid: true,
    taxPaid: true,
    managementFeePaid: true
  },
  {
    id: "lic-002",
    citizenName: "Sanne Keizer",
    citizenId: "CID-18304",
    licenseType: "small-plane",
    issuedBy: "Ryan Peterson",
    issueDate: "2026-05-18",
    remarks: "Perfecte radio-procedures getoond in dichte bewolking.",
    employeeCommissionPaid: false,
    taxPaid: false,
    managementFeePaid: false
  },
  {
    id: "lic-003",
    citizenName: "Daan van Dijk",
    citizenId: "CID-92041",
    licenseType: "large-plane",
    issuedBy: "Henk van der Meer",
    issueDate: "2026-05-27",
    remarks: "Voldoet ruim aan de IFR (Instrument Flight Rules) standaarden.",
    employeeCommissionPaid: false,
    taxPaid: false,
    managementFeePaid: false
  }
];

export const DEFAULT_INVENTORY: AircraftInventory[] = [
  {
    aircraftId: "heli-r44",
    stockCount: 3,
    status: "Op voorraad",
    isVisible: true
  },
  {
    aircraftId: "plane-c172",
    stockCount: 5,
    status: "Op voorraad",
    isVisible: true
  },
  {
    aircraftId: "plane-c560",
    stockCount: 2,
    status: "Op voorraad",
    isVisible: true
  }
];

