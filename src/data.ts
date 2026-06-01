import { License, Aircraft, TrainingCourse, IssuedLicense, FinancialConfig } from "./types";

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
  largePlanePurchaseCost: 300000
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

export const AIRCRAFT_LIST: Aircraft[] = [];

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

export const DEFAULT_ISSUED_LICENSES: IssuedLicense[] = [];

export const DEFAULT_INVENTORY = [];

