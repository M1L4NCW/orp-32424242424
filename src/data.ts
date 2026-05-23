import { License, Aircraft, TrainingCourse, IssuedLicense } from "./types";

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
    id: "cessna-172",
    name: "Cessna 172S Skyhawk",
    type: "small-plane",
    manufacturer: "Cessna Aircraft",
    basePrice: 380000,
    topSpeedKnots: 124,
    rangeKm: 1185,
    engineType: "Lycoming IO-360-L2A (180 PK)",
    capacity: 4,
    description: "Het meest succesvolle en betrouwbare sportvliegtuig ter wereld. Uitgerust met een moderne Garmin G1000 NXi glazen cockpit, uitstekend voor lessen en cross-country vluchten.",
    imageTheme: "linear-gradient(135deg, #38bdf8, #0369a1)"
  },
  {
    id: "cirrus-sr22",
    name: "Cirrus SR22T GTS",
    type: "small-plane",
    manufacturer: "Cirrus Aircraft",
    basePrice: 850000,
    topSpeedKnots: 213,
    rangeKm: 1943,
    engineType: "Continental TSIO-550-K (315 PK Turbo)",
    capacity: 5,
    description: "De belichaming van luxe en veiligheid. Voorzien van het beroemde CAPS parachutesysteem voor het hele vliegtuig en geavanceerde airconditioning - perfect voor het tropische klimaat van Aruba.",
    imageTheme: "linear-gradient(135deg, #10b981, #047857)"
  },
  {
    id: "robinson-r44",
    name: "Robinson R44 Raven II",
    type: "helicopter",
    manufacturer: "Robinson Helicopter Company",
    basePrice: 510000,
    topSpeedKnots: 110,
    rangeKm: 560,
    engineType: "Lycoming IO-540-AE1A5 (245 PK)",
    capacity: 4,
    description: "Een uiterst efficiënte en breed ingezette lichte helikopter. Biedt uitstekend panorama-zicht door de grote ramen en beschikt over een betrouwbare zuigermotor.",
    imageTheme: "linear-gradient(135deg, #f59e0b, #b45309)"
  },
  {
    id: "airbus-h135",
    name: "Airbus Helicopters H135",
    type: "helicopter",
    manufacturer: "Airbus Helicopters",
    basePrice: 3100000,
    topSpeedKnots: 137,
    rangeKm: 635,
    engineType: "2x Pratt & Whitney PW206B3 (Turbine)",
    capacity: 7,
    description: "De gouden standaard voor VIP transport, traumahelikopters en geavanceerde training. Biedt extreem lage geluidsniveaus dankzij de Fenestron gehulsde staartrotor.",
    imageTheme: "linear-gradient(135deg, #ec4899, #be185d)"
  },
  {
    id: "embraer-phenom",
    name: "Embraer Phenom 100EV",
    type: "large-plane",
    manufacturer: "Embraer",
    basePrice: 4850000,
    topSpeedKnots: 406,
    rangeKm: 2182,
    engineType: "2x Pratt & Whitney PW617F1-E (Turbofan)",
    capacity: 6,
    description: "Een verbluffend elegante en snelle lichte zakenjet. Vlieg in ultiem comfort op straalaandrijving met een ruime cabine ontworpen door BMW Designworks.",
    imageTheme: "linear-gradient(135deg, #6366f1, #4338ca)"
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

export const DEFAULT_ISSUED_LICENSES: IssuedLicense[] = [];

export const DEFAULT_INVENTORY = [
  {
    aircraftId: "cessna-172",
    stockCount: 5,
    status: "Op voorraad" as const
  },
  {
    aircraftId: "cirrus-sr22",
    stockCount: 3,
    status: "Op voorraad" as const
  },
  {
    aircraftId: "robinson-r44",
    stockCount: 2,
    status: "Op voorraad" as const
  },
  {
    aircraftId: "airbus-h135",
    stockCount: 1,
    status: "Op voorraad" as const
  },
  {
    aircraftId: "embraer-phenom",
    stockCount: 0,
    status: "Uitverkocht" as const
  }
];

