import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY not found. Running with fallback content mode.");
}

// Fallback high-quality aviation questions in Dutch
const FALLBACK_QUESTIONS: Record<string, Array<{
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}>> = {
  helicopter: [
    {
      id: "h1",
      question: "Wat is 'retreating blade stall' bij een helikopter?",
      options: [
        "Het overtrekken van het teruglopende rotorblad bij hoge vliegsnelheid door een te grote invalshoek.",
        "Het stilvallen van de motor tijdens een snelle daling.",
        "Het verlies van lift in de gehele hoofdrotor tijdens het opstijgen.",
        "Het fenomeen waarbij de staartrotor stopt met draaien."
      ],
      correctIndex: 0,
      explanation: "Retreating blade stall treedt op bij hoge voorwaartse snelheden. Het teruglopende rotorblad ervaart een lagere relatieve windsneldheid en moet een grotere invalshoek aannemen om evenveel lift te produceren als het vooruitlopende blad, totdat het overtrekt (stallt)."
    },
    {
      id: "h2",
      question: "Wat is het voornaamste doel van de staartrotor bij een traditionele helikopter?",
      options: [
        "Het leveren van extra voorwaartse stuwkracht.",
        "Het tegengaan van het koppelmoment (torque) gecreëerd door de hoofdrotor.",
        "Het koelen van de hoofdmotor.",
        "Het verhogen van de maximale vlieghoogte."
      ],
      correctIndex: 1,
      explanation: "De hoofdrotor oefent een draaimoment uit op de helikopterromp. De staartrotor levert een tegengestelde kracht om te voorkomen dat de romp in tegengestelde richting gaat tollen (anti-torque)."
    },
    {
      id: "h3",
      question: "Wat is autorotatie?",
      options: [
        "Een automatische pilootstand voor helikopters.",
        "Een noodprocedure waarbij de rotor wordt aangedreven door de luchtstroom in plaats van de motor om veilig te landen.",
        "Het automatisch inklappen van de rotorbladen na de landing.",
        "Het constant draaien rondom de eigen as tijdens een freestyle manoeuvre."
      ],
      correctIndex: 2,
      explanation: "Bij motoruitval kan een helikopter daling inzetten waarbij de opwaartse luchtstroom de rotor laat draaien. Dit slaat kinetische energie op om vlak voor de grond af te vangen (flare) voor een veilige landing."
    }
  ],
  "small-plane": [
    {
      id: "s1",
      question: "Welk stuurvlak controleert de gierbeweging (yaw) van een klein vliegtuig?",
      options: [
        "Het hoogteroer (elevator)",
        "De rolroeren (ailerons)",
        "Het richtingroer (rudder)",
        "De welvingskleppen (flaps)"
      ],
      correctIndex: 2,
      explanation: "Het richtingroer (rudder) bevindt zich op het verticale staartvlak en regelt de gierbeweging (yaw) om de neus naar links of rechts te draaien over de verticale as."
    },
    {
      id: "s2",
      question: "Wat is het effect van het uitslaan van de welvingskleppen (flaps)?",
      options: [
        "Minder lift en minder luchtweerstand.",
        "Meer lift en meer luchtweerstand, wat een lagere overtreksnelheid mogelijk maakt.",
        "Alleen een hogere topsnelheid.",
        "Een verschuiving van het zwaartepunt naar achteren."
      ],
      correctIndex: 1,
      explanation: "Flaps vergroten de welving van de vleugel, waardoor deze bij lagere snelheden meer lift produceert. Dit gaat wel gepaard met extra luchtweerstand (drag), ideaal voor de landing."
    },
    {
      id: "s3",
      question: "Wat betekent de afkorting VFR in de vliegerij?",
      options: [
        "Velocity Flight Rules",
        "Visual Flight Rules (vliegen op zicht)",
        "Vertical Flight Range",
        "Variable Fuel Ratio"
      ],
      correctIndex: 1,
      explanation: "VFR staat voor Visual Flight Rules. Dit zijn de regels waaronder een piloot vliegt op basis van zicht op de grond, obstakels en ander vliegverkeer, zonder uitsluitend op instrumenten te vertrouwen."
    }
  ],
  "large-plane": [
    {
      id: "l1",
      question: "Wat is de primaire functie van de 'thrust reversers' op een straalvliegtuig?",
      options: [
        "Het versnellen van het vliegtuig tijdens de start.",
        "Het ombuigen van de motoruitlaatstroom naar voren om te helpen bij het afremmen na de landing.",
        "Het vliegen in achterwaartse richting in de lucht.",
        "Het verminderen van motorlawaai tijdens de kruisvlucht."
      ],
      correctIndex: 1,
      explanation: "Thrust reversers (straalomkeerders) leiden de uitstoot van de straalmotoren naar voren om de remmen van de wielen te ondersteunen, vooral nuttig op natte of gladde landingsbanen."
    },
    {
      id: "l2",
      question: "Wat is de betekenis van 'coffin corner' in de hoge-hoogte aerodynamica?",
      options: [
        "De hoek van de cockpit met de slechtste overlevingskansen.",
        "Het smalle snelheidsgebied op grote hoogte waar de overtreksnelheid zeer dicht bij de kritische Mach-snelheid ligt.",
        "De uiterste opslaglocatie voor brandstof in de vleugeltip.",
        "Een parkeerplaats voor afgedankte vliegtuigen in de woestijn."
      ],
      correctIndex: 1,
      explanation: "Op zeer grote hoogte is de ijle lucht een uitdaging. De marge tussen de minimale snelheid (low speed stall) en de maximale snelheid (high speed buffet / Mach limit) wordt extreem krap. Dit wordt de 'coffin corner' genoemd."
    },
    {
      id: "l3",
      question: "Op welke hoogte begint over het algemeen de 'RVSM' (Reduced Vertical Separation Minimum) luchtruimzone?",
      options: [
        "FL 180 (18.000 voet)",
        "FL 290 (29.000 voet)",
        "FL 410 (41.000 voet)",
        "FL 100 (10.000 voet)"
      ],
      correctIndex: 1,
      explanation: "RVSM reduceert de minimale verticale afstand tussen vliegtuigen van 2.000 voet naar 1.000 voet tussen Flight Level 290 en FL 410, waardoor de luchtruimcapaciteit aanzienlijk toeneemt."
    }
  ]
};

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// API Endpoint to fetch custom aviation quiz questions
app.get("/api/quiz-questions", async (req, res) => {
  const licenseType = (req.query.type as string) || "small-plane";
  
  // Validate request
  if (!["helicopter", "small-plane", "large-plane"].includes(licenseType)) {
    return res.status(400).json({ error: "Ongeldig brevet type gekozen." });
  }

  // If Gemini is not configured, send high-quality fallback questions instantly
  if (!ai) {
    console.log(`Using fallback questions for ${licenseType} due to missing Gemini API Client.`);
    return res.json({ questions: FALLBACK_QUESTIONS[licenseType] });
  }

  try {
    const licenseLabels: Record<string, string> = {
      helicopter: "Helikopter Brevet (PPL-H / Type Rating)",
      "small-plane": "Vliegtuig Klein Brevet (PPL-A / Light aircraft)",
      "large-plane": "Vliegtuig Groot Brevet (ATPL / Commercial jetliner)",
    };

    const prompt = `Genereer 4 unieke, professionele, uitdagende en educatieve examenvragen in het Nederlands (Dutch) voor een theoretisch luchtvaartexamen voor het volgende brevet: ${licenseLabels[licenseType]}. 
Zorg voor een mix van aerodynamica, meteorologie, regelgeving en instrumenten vliegen. 
De vragen moeten realistisch zijn en overeenkomen met echte EASA/FAA examenniveaus.
Retourneer het antwoord strikt volgens het gevraagde JSON-schema. Vul unieke UUID's of id's in voor de vragen.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Je bent een deskundige Nederlandse hoofdvlieginstructeur en examinator bij Luchtvaart Oranjestad in Aruba. Je stelt theorie-examens op die streng doch zeer leerzaam zijn.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unieke ID voor de examenvraag." },
                  question: { type: Type.STRING, description: "De examenvraag in het Nederlands." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Precies 4 meerkeuzeopties.",
                  },
                  correctIndex: { type: Type.INTEGER, description: "De 0-gebaseerde index van het juiste antwoord (0 t/m 3)." },
                  explanation: { type: Type.STRING, description: "Een gedetailleerde leerzame uitleg in het Nederlands waarom dit antwoord correct is en waarom de andere verkeerd zijn." }
                },
                required: ["id", "question", "options", "correctIndex", "explanation"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const textOutput = response.text || "";
    const parsedData = JSON.parse(textOutput.trim());
    
    if (parsedData.questions && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
      return res.json(parsedData);
    } else {
      throw new Error("Invalid format received from Gemini response.");
    }
  } catch (error) {
    console.error("Gemini API call failed, falling back to static questions:", error);
    return res.json({ questions: FALLBACK_QUESTIONS[licenseType] });
  }
});

// API Endpoint for the flight simulator interactive control session
app.post("/api/simulator/step", async (req, res) => {
  const { messages, brevetType, telemetry } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is vereist." });
  }

  const currentTelemetry = telemetry || {
    altitude: 2000,
    speed: 120,
    fuel: 85,
    heading: 110,
    wind: "Noreasterly 15 knots",
    status: "In Flight (Approach Queen Beatrix Airport AUA)"
  };

  const statusDescription = `
  Huidige Telemetrie:
  - Hoogte: ${currentTelemetry.altitude} voet
  - Snelheid: ${currentTelemetry.speed} knopen
  - Brandstof: ${currentTelemetry.fuel}%
  - Heading: ${currentTelemetry.heading}°
  - Wind: ${currentTelemetry.wind}
  - Status: ${currentTelemetry.status}
  `;

  if (!ai) {
    // Elegant fallback simulation response
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let responseText = "Oranjestad Tower hier. We horen u luid en duidelijk. Houd koers en hoogte aan voor de finale nadering op baan 11 (Runway 11).";
    let nextTelemetry = { ...currentTelemetry };

    if (lastUserMsg.includes("landing") || lastUserMsg.includes("landen") || lastUserMsg.includes("gear down")) {
      nextTelemetry.altitude = 500;
      nextTelemetry.speed = 90;
      nextTelemetry.status = "Final Landing Cleared";
      responseText = "Oranjestad Tower. Wind 090 op 12 knopen. Runway 11, cleared to land. Welvingskleppen uitslaan (flaps set) en landingsgestel controleren.";
    } else if (lastUserMsg.includes("flaps") || lastUserMsg.includes("kleppen") || lastUserMsg.includes("omlaag") || lastUserMsg.includes("down")) {
      nextTelemetry.speed = 100;
      responseText = "Oranjestad Tower. Bevestigd, snelheid neemt af. U nadert de glijhelling (glide slope). Daal naar 1000 voet.";
    } else if (lastUserMsg.includes("hoof") || lastUserMsg.includes("stijgen") || lastUserMsg.includes("stijg") || lastUserMsg.includes("climb")) {
      nextTelemetry.altitude = 3500;
      nextTelemetry.speed = 140;
      responseText = "Oranjestad Tower. Begrepen, stijg naar 3500 voet en voer wachtpatroon bravo uit (hold Bravo) wegens inkomend verkeer.";
    }

    return res.json({
      reply: responseText,
      telemetry: nextTelemetry,
      evaluation: {
        flightCompleted: nextTelemetry.altitude <= 0,
        success: nextTelemetry.altitude === 0 && nextTelemetry.speed < 90,
        feedback: "Let op uw snelheid en flaps bij de touchdown."
      }
    });
  }

  try {
    const formattedHistory = messages.map((m: any) => `${m.sender === "user" ? "Piloot" : "ATC / Co-pilot"}: ${m.content}`).join("\n");

    const prompt = `Je bent de Air Traffic Controller (ATC) van Reina Beatrix International Airport (AUA) in Oranjestad of de Co-pilot die de vliegende piloot helpt. 
De gebruiker doet momenteel hun Simulator Assessment voor een ${brevetType === "helicopter" ? "Helikopter" : brevetType === "small-plane" ? "Klein Vliegtuig" : "Groot Verkeersvliegtuig"} brevet.

Huidige vlucht-situatie:
${statusDescription}

Geschiedenis van het gesprek tot nu toe:
${formattedHistory}

Geef een professionele, realistische luchtvaart-respons in het Nederlands. 
Bepaal aan de hand van het gedrag en de laatste commandos van de piloot hoe we de telemetrie bijwerken (brandstof verbruikt altijd ~2-5% per stap. Hoogte en snelheid moeten reageren op de input van de piloot: bijv. 'landen' of 'flaps down' verlaagt snelheid/hoogte, 'stijgen' of 'power up' verhoogt ze).
Evalueer ook of de landing voltooid is (als de hoogte 0 voet bereikt met een veilige landingssnelheid onder 95 knopen, is het een succes. Als de hoogte 0 bereikt met een te hoge snelheid, is het gecrasht!).

Geef je reactie precies in het gevraagde JSON formaat.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Je bent de interactieve Flight Simulator ATC-controller en vlieginstructeur. Je praat in luchtvaart jargon (radio-telefonietaal), gebruikt Nederlandse en internationale termen (zoals Roger, Cleared to land, Wind check) en houdt de simulatie spannend en leerzaam.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING, description: "De radio-respons van de ATC of Co-pilot in het Nederlands." },
            telemetry: {
              type: Type.OBJECT,
              properties: {
                altitude: { type: Type.INTEGER, description: "Nieuwe hoogte in voet." },
                speed: { type: Type.INTEGER, description: "Nieuwe snelheid in knopen." },
                fuel: { type: Type.INTEGER, description: "Resterende brandstof percentage (0-100)." },
                heading: { type: Type.INTEGER, description: "Compass heading (0-359)." },
                wind: { type: Type.STRING, description: "Wind informatie (bijv. 'Easterly 12 knots')." },
                status: { type: Type.STRING, description: "Korte statuszin (bijv. 'On Final', 'Crashed', 'Landed Safely', 'In Flight')." }
              },
              required: ["altitude", "speed", "fuel", "heading", "wind", "status"]
            },
            evaluation: {
              type: Type.OBJECT,
              properties: {
                flightCompleted: { type: Type.BOOLEAN, description: "True als de simulatorvlucht voorbij is (geland of gecrasht)." },
                success: { type: Type.BOOLEAN, description: "True als de vlucht succesvol is beëindigd met een veilige landing." },
                feedback: { type: Type.STRING, description: "Opbouwende professionele feedback van de vlieginstructeur over het vlieggedrag." }
              },
              required: ["flightCompleted", "success", "feedback"]
            }
          },
          required: ["reply", "telemetry", "evaluation"]
        }
      }
    });

    const parsedData = JSON.parse((response.text || "").trim());
    return res.json(parsedData);
  } catch (error) {
    console.error("Failed to generate simulator response:", error);
    // Graceful fallback response
    return res.json({
      reply: "Oranjestad Tower. We hebben tijdelijk een lichte storing in de telemetrie, maar we horen u luid en duidelijk. Vervolg de nadering en zet flaps op stand 2.",
      telemetry: {
        altitude: Math.max(0, currentTelemetry.altitude - 400),
        speed: Math.max(60, currentTelemetry.speed - 10),
        fuel: Math.max(0, currentTelemetry.fuel - 3),
        heading: currentTelemetry.heading,
        wind: currentTelemetry.wind,
        status: currentTelemetry.altitude <= 400 ? "Landed Safely" : "Approaching Runway"
      },
      evaluation: {
        flightCompleted: currentTelemetry.altitude <= 400,
        success: currentTelemetry.altitude <= 400,
        feedback: "Goed koersgevoel getoond onder wisselende omstandigheden!"
      }
    });
  }
});


// -------------------------------------------------------------
// GOOGLE SHEETS APPS SCRIPT PROXY ENDPOINT (ALTERNATIVE COUPLING)
// -------------------------------------------------------------

app.post("/api/sheets-web-app", async (req, res) => {
  const { url, action, payload } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: "Web-app URL van Google Apps Script ontbreekt." });
  }

  if (!url.startsWith("https://script.google.com/")) {
    return res.status(400).json({ error: "De ingevoerde URL is geen geldige Google Apps Script URL. Deze moet beginnen met https://script.google.com/" });
  }

  try {
    // Send request server-to-server to bypass all browser-side CORS and frame restrictions
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action, ...payload })
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script reageerde met status ${response.status}`);
    }

    const text = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      throw new Error("Ongeldig antwoord van Google Apps Script. Server-uitvoer was geen geldige JSON.");
    }
    
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("Fout in Google Apps Script Web App proxy:", error);
    return res.status(500).json({ error: `Koppeling mislukt: ${error.message || error}` });
  }
});


// -------------------------------------------------------------
// SECURE DISCORD OAUTH2 ENDPOINTS (OPTION 2)
// -------------------------------------------------------------

app.get("/api/discord/auth-url", (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const rawRedirectUri = req.query.redirectUri as string;
  
  if (!clientId) {
    return res.status(400).json({ 
      error: "Discord inloggen is momenteel niet geconfigureerd op de server. De omgevingsvariabele DISCORD_CLIENT_ID ontbreekt." 
    });
  }

  // Use the provided redirectUri from client, or fallback to the env, or construct default
  const redirectUri = rawRedirectUri || process.env.DISCORD_REDIRECT_URI || `${req.protocol}://${req.get('host')}/staff-portal`;
  const scope = "identify";
  
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
  
  return res.json({ url: authUrl });
});

app.post("/api/discord/exchange", async (req, res) => {
  const { code, redirectUri } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Authorisatiecode ontbreekt." });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  // Role IDs mapped from env
  const roleOwnerId = process.env.DISCORD_ROLE_OWNER;
  const roleManagerId = process.env.DISCORD_ROLE_MANAGER;
  const roleMedewerkerId = process.env.DISCORD_ROLE_MEDEWERKER;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ 
      error: "Discord Client ID of Client Secret is niet ingevuld op de server (.env-configuratie)." 
    });
  }

  try {
    // 1. Wissel de authorisatiecode in voor een access token
    const tokenParams = new URLSearchParams();
    tokenParams.append("client_id", clientId);
    tokenParams.append("client_secret", clientSecret);
    tokenParams.append("grant_type", "authorization_code");
    tokenParams.append("code", code);
    tokenParams.append("redirect_uri", redirectUri);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Discord token wissel is mislukt:", errText);
      return res.status(400).json({ 
        error: `Fout bij wisselen van Discord code: ${errText}` 
      });
    }

    const tokenData = (await tokenResponse.json()) as any;
    const accessToken = tokenData.access_token;

    // 2. Haal het Discord profiel van de gebruiker op (@me)
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errText = await userResponse.text();
      console.error("Discord user fetch is mislukt:", errText);
      return res.status(400).json({ 
        error: `Fout bij opvragen van Discord profiel: ${errText}` 
      });
    }

    const userData = (await userResponse.json()) as any;
    const userId = userData.id;
    const userTag = userData.global_name || userData.username;

    // 3. Indien bot-token en guild-id zijn ingesteld, controleer rollen.
    if (!botToken || !guildId) {
      console.log("Discord login test-modus (Bot token of Guild ID ontbreekt).");
      return res.status(400).json({ 
        error: "Server configuratie incompleet voor rollencontrole", 
        details: "De server mist DISCORD_BOT_TOKEN of DISCORD_GUILD_ID om uw rollen in de server te kunnen verifiëren."
      });
    }

    // Haal serverlidmaatschap en bijbehorende rollen op via de Bot client
    const memberResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });

    if (memberResponse.status === 404) {
      return res.status(403).json({ 
        error: `Inloggen geannuleerd: U bent geen lid van onze Discord server. Word eerst lid om toegang te krijgen.` 
      });
    }

    if (!memberResponse.ok) {
      const errText = await memberResponse.text();
      console.error("Lidmaatschap controle via Bot mislukt:", errText);
      return res.status(500).json({ 
        error: "Kan uw lidmaatschap of rollen op de server niet verifiëren. Controleer de Discord Bot status en rechten." 
      });
    }

    const memberData = (await memberResponse.json()) as any;
    const memberRoles = memberData.roles as string[];

    // 4. Bepaal rol-niveau op basis van Discord rollen
    let appRole: "owner" | "manager" | "medewerker" | null = null;

    if (roleOwnerId && memberRoles.includes(roleOwnerId)) {
      appRole = "owner";
    } else if (roleManagerId && memberRoles.includes(roleManagerId)) {
      appRole = "manager";
    } else if (roleMedewerkerId && memberRoles.includes(roleMedewerkerId)) {
      appRole = "medewerker";
    }

    if (!appRole) {
      return res.status(403).json({ 
        error: "Mislukt om in te loggen: Geen geautoriseerde Discord rol gevonden.",
        details: `U heeft niet de benodigde Discord rollen om toegang te krijgen tot het portaal. Uw Discord rollen-lijst: [${memberRoles.join(", ")}]`
      });
    }

    // Gelukt! Geef de rol en gegevens terug aan de cliënt
    return res.json({
      success: true,
      user: {
        username: userData.username,
        fullname: userTag,
        role: appRole,
        discordId: userId,
        avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png` : null
      }
    });

  } catch (err: any) {
    console.error("Error in Discord OAuth exchange:", err);
    return res.status(500).json({ 
      error: `Interne fout bij koppeling met Discord: ${err.message}` 
    });
  }
});


// Serve Vite or static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static file server active in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
