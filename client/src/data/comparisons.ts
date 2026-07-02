export type Tool = "perplexity" | "chatgpt" | "claude" | "notebooklm";
export type CategoryId = "recherche" | "unterrichtsentwurf" | "feedback" | "aufgaben" | "dokumente";

export interface WorkflowStep {
  tool: Tool;
  role: string;
  action: string;
}

export interface OrchestrationData {
  title: string;
  description: string;
  steps: WorkflowStep[];
  proTipp: string;
  zeitvorteil: string;
}

export interface ToolMeta {
  id: Tool;
  label: string;
  tagline: string;
}

/** Markenfarbe pro Tool — zentral, damit sie nicht mehrfach im Code dupliziert wird. */
export const TOOL_COLORS: Record<Tool, string> = {
  perplexity: "#20808D",
  chatgpt: "#10a37f",
  claude: "#c96442",
  notebooklm: "#4285F4",
};

export interface ScoreSet {
  zeitersparnis: number;
  faktenpruefung: number; // Bedarf: 1=niedrig, 5=hoch
  direkteinsatz: number;
  qualitaet: number;
  einfachheit: number;
}

export interface ToolEntry {
  scores: ScoreSet;
  staerken: string[];
  schwaechen: string[];
  empfehlung: string;
  tipp: string;
  zeitNote: string;
  faktenpruefungNote: string;
  direkteinsatzNote: string;
}

export interface CategoryData {
  id: CategoryId;
  label: string;
  icon: string;
  scenario: string;
  tools: Record<Tool, ToolEntry>;
  orchestration: OrchestrationData;
}

export const TOOLS: ToolMeta[] = [
  { id: "perplexity",  label: "Perplexity",  tagline: "KI-Suchmaschine mit Quellen" },
  { id: "chatgpt",     label: "ChatGPT",     tagline: "Vielseitiger KI-Assistent" },
  { id: "claude",      label: "Claude",      tagline: "Präziser Analyse-Assistent" },
  { id: "notebooklm",  label: "NotebookLM",  tagline: "Google Dokument-Analyse & Audio" },
];

export const SCORE_LABELS: Record<keyof ScoreSet, { label: string; inverted?: boolean }> = {
  zeitersparnis:  { label: "Zeitersparnis" },
  faktenpruefung: { label: "Zuverlässigkeit", inverted: true },
  direkteinsatz:  { label: "Sofort verwendbar" },
  qualitaet:      { label: "Qualität" },
  einfachheit:    { label: "Einstieg" },
};

/**
 * Anzeigewert einer Bewertung. Für invertierte Achsen (z. B. faktenpruefung =
 * "Prüfaufwand") wird gedreht, sodass ein hoher Wert immer "besser" bedeutet.
 * Wird von Balken UND Radar genutzt, damit beide dasselbe zeigen.
 */
export function displayScore(key: keyof ScoreSet, value: number, max = 5): number {
  return SCORE_LABELS[key].inverted ? max - value + 1 : value;
}

/** Gesamtnutzen eines Tools in einer Kategorie — Grundlage der "Empfohlen"-Markierung. */
export function toolScore(entry: ToolEntry): number {
  const s = entry.scores;
  return s.direkteinsatz + s.qualitaet + s.zeitersparnis + (5 - s.faktenpruefung);
}

/** Tool-IDs mit dem höchsten Gesamtnutzen in einer Kategorie (kann mehrere geben). */
export function winnersFor(cat: CategoryData): Tool[] {
  const scored = TOOLS.map((t) => ({ id: t.id, val: toolScore(cat.tools[t.id]) }));
  const best = Math.max(...scored.map((s) => s.val));
  return scored.filter((s) => s.val === best).map((s) => s.id);
}

export const CATEGORIES: CategoryData[] = [
  // ── 1. Recherche ──────────────────────────────────────────────────────────
  {
    id: "recherche",
    label: "Aktuelle Rechercheaufgaben",
    icon: "🔍",
    scenario: "Sie bereiten eine Unterrichtseinheit zur KV-Reform 2023 oder zum neuen Schweizer Datenschutzgesetz (DSG, in Kraft seit Sept. 2023) vor und brauchen aktuelle, korrekte Grundlagen — z.B. für eine Fallstudie im HKB-D- oder HKB-E-Unterricht, für den BM-Kurs oder für eine Schulhausdiskussion zum Thema KI-Governance.",
    orchestration: {
      title: "Optimaler Workflow: Recherche",
      description: "Kombinieren Sie die Tools für maximale Quellenqualität und didaktische Tiefe — von der Livesuche bis zur unterrichtsfertigen Fallstudie.",
      steps: [
        { tool: "perplexity",  role: "Schritt 1 · Quellen finden",      action: "Aktuelle CH-Quellen suchen: KV-Reform, DSG, SBFI/admin.ch mit klickbaren Quellenbelegen" },
        { tool: "notebooklm", role: "Schritt 2 · Quellen strukturieren", action: "admin.ch-PDFs hochladen → Mindmap und FAQ automatisch generieren lassen" },
        { tool: "claude",     role: "Schritt 3 · Didaktisieren",         action: "Strukturierte Inhalte in Fallstudie für HKB D/E umwandeln, Lernziele formulieren" },
        { tool: "chatgpt",    role: "Schritt 4 · Variieren",             action: "Weitere Aufgabenvarianten und Differenzierungen für verschiedene Niveaus erstellen" },
      ],
      proTipp: "Starten Sie immer mit Perplexity für aktuelle CH-Quellen — so vermeiden Sie veraltete Gesetzesangaben in Ihrem Unterrichtsmaterial.",
      zeitvorteil: "Gesamter Workflow: ca. 20 Min. statt 2–3 Stunden manueller Recherche und Aufbereitung.",
    },
    tools: {
      perplexity: {
        scores: { zeitersparnis: 5, faktenpruefung: 2, direkteinsatz: 5, qualitaet: 5, einfachheit: 5 },
        staerken: [
          "Echtzeit-Zugriff auf admin.ch, SBFI, Bundesrat und Kantonsquellen",
          "Jede Aussage mit klickbarem Quellenlink belegt",
          "Aktuelle Gesetzesänderungen (DSG, KV-Reform) sofort abrufbar",
          "Mehrere Quellen werden automatisch zusammengefasst",
          "Akademischer Modus für wissenschaftliche Literatur (PHZH, ZHAW)",
        ],
        schwaechen: [
          "Texte sind kürzer und weniger ausführlich",
          "Weniger kreative didaktische Aufbereitung",
          "Kontextumfang begrenzt bei sehr langen Dokumenten",
        ],
        empfehlung: "Erste Wahl für aktuelle CH-Recherchen",
        tipp: "Suchen Sie gezielt: 'KV-Reform 2023 Schweiz Umsetzung Kaufleute' oder 'DSG Schweiz 2023 Pflichten Unternehmen'. Perplexity liefert direkte Links zu SBFI.admin.ch und Bundesgesetzgebung — ideal für Fallstudien in HKB D (Prozesse und Technologien) oder HKB E (Wirtschaft und Gesellschaft).",
        zeitNote: "Spart bis zu 80% Recherchezeit — direkte Links zu admin.ch, SBFI, Eduqua-Quellen, keine manuelle Suche nötig.",
        faktenpruefungNote: "Sehr gering — alle Aussagen sind mit klickbaren CH-Quellen belegt. Bei Gesetzestexten kurze Stichprobe auf admin.ch empfohlen.",
        direkteinsatzNote: "Sehr hoch — Quellenangaben und Zusammenfassungen direkt für Arbeitsblätter und Lernaufgaben im Schweizer Kontext verwendbar.",
      },
      chatgpt: {
        scores: { zeitersparnis: 3, faktenpruefung: 4, direkteinsatz: 3, qualitaet: 3, einfachheit: 4 },
        staerken: [
          "Gute Strukturierung von Hintergrundinformationen",
          "Erklärt komplexe Themen verständlich (z.B. Handlungskompetenzen aus dem Bildungsplan KV)",
          "Flexibel bei Nachfragen und Vertiefungen",
          "Kann Schweizer Kontext auf Anfrage einbeziehen",
        ],
        schwaechen: [
          "Wissen endet mit Trainings-Stichtag — keine aktuellen SBFI-Dokumente",
          "Keine automatischen Quellenangaben",
          "Verwechselt CH-Recht gelegentlich mit EU-/DE-Recht",
          "KV-Reform-Details oft unvollständig oder veraltet",
        ],
        empfehlung: "Für Hintergrundwissen, nicht aktuelle CH-Gesetze",
        tipp: "Explizit nach Schweizer Quellen fragen: 'Erkläre die KV-Reform 2023 gemäss SBFI für eine KV-Abschlussklasse.' Alle Zahlen und Gesetzesangaben danach auf admin.ch oder SBFI.admin.ch gegenprüfen — Verwechslungen mit deutschem/EU-Recht sind möglich.",
        zeitNote: "Mittlere Zeitersparnis — gut für Hintergrunderklärungen, Aktualität muss manuell auf admin.ch sichergestellt werden.",
        faktenpruefungNote: "Hoch — kein Zugriff auf aktuelle SBFI- oder Bundesratsdokumente, CH-spezifische Fakten immer prüfen.",
        direkteinsatzNote: "Mittel — konzeptionelle Erklärungen nützlich, Rechtslage und Reformen immer mit offiziellen CH-Quellen verifizieren.",
      },
      claude: {
        scores: { zeitersparnis: 3, faktenpruefung: 4, direkteinsatz: 3, qualitaet: 4, einfachheit: 4 },
        staerken: [
          "Sehr präzise und differenzierte Analyse von Schweizer Themen",
          "Gibt Wissensgrenzen und Unsicherheiten transparent an",
          "Exzellente didaktische Aufbereitung von Gesetzestexten",
          "Gute Strukturierung komplexer BiVo/Bildungsplan- und BM-Themen",
        ],
        schwaechen: [
          "Kein Internetzugang — kein Zugriff auf aktuelle CH-Gesetze",
          "KV-Reform 2023 und DSG-Details können veraltet sein",
          "Keine direkten Links zu admin.ch oder SBFI",
        ],
        empfehlung: "Für Didaktisierung, nicht Live-Suche",
        tipp: "Ideale Kombination: Perplexity für aktuelle CH-Gesetzestexte beschaffen, dann Claude für die didaktische Aufbereitung (z.B. 'Erkläre das neue DSG für eine KV-Klasse B2, mit drei konkreten Praxisbeispielen aus dem Büroalltag').",
        zeitNote: "Gut für Analyse und Didaktisierung, aber aktuelle CH-Rechtsgrundlagen müssen zuerst über Perplexity oder admin.ch beschafft werden.",
        faktenpruefungNote: "Hoch — Claude weist korrekt auf Wissensgrenzen hin; bei Schweizer Recht und KV-Reform immer externe CH-Quellen hinzuziehen.",
        direkteinsatzNote: "Mittel — für didaktische Erklärungen sehr stark, nicht für aktuelle Rechtslage ohne zusätzliche CH-Quellenprüfung.",
      },
      notebooklm: {
        scores: { zeitersparnis: 3, faktenpruefung: 1, direkteinsatz: 4, qualitaet: 4, einfachheit: 4 },
        staerken: [
          "Analysiert hochgeladene CH-Dokumente (admin.ch-PDFs, SBFI-Berichte, BiVo)",
          "Erstellt Mindmaps und Zusammenfassungen aus eigenen Unterlagen",
          "Quellenverweise beziehen sich direkt auf hochgeladene Dokumente",
          "Kein Halluzinieren ausserhalb der Quellen — bleibt bei den Fakten",
          "Podcast-/Audio-Format für eigene Dokumente — gut für Selbststudium",
        ],
        schwaechen: [
          "Kein Internetzugang — nur Analyse hochgeladener Dokumente möglich",
          "Erst nützlich nach manuellem Upload aktueller CH-Quellen",
          "Weniger geeignet für freie Recherche oder Themenauswahl",
          "Deutsche Sprachqualität verbessert, aber noch nicht perfekt",
        ],
        empfehlung: "Nach Upload von CH-Quellen sehr stark",
        tipp: "Laden Sie aktuelle admin.ch- oder SBFI-PDFs hoch (KV-Reform, DSG-Leitfaden). NotebookLM erstellt dann eine präzise Zusammenfassung, Mindmap und FAQ — ideal als Vorbereitung für eine Fallstudie in HKB D/E.",
        zeitNote: "Mittlere Zeitersparnis — Vorbereitung durch Dokument-Upload nötig, danach sehr schnelle Strukturierung.",
        faktenpruefungNote: "Sehr gering — NotebookLM bleibt strikt bei den hochgeladenen Quellen, keine eigenen Ergänzungen.",
        direkteinsatzNote: "Hoch — Zusammenfassungen und FAQs aus eigenen CH-Dokumenten direkt als Unterrichtsmaterial verwendbar.",
      },
    },
  },

  // ── 2. Unterrichtsentwurf ─────────────────────────────────────────────────
  {
    id: "unterrichtsentwurf",
    label: "Unterrichtsentwürfe erstellen",
    icon: "📋",
    scenario: "Sie planen eine 90-minütige Unterrichtseinheit im KV-Grundbildungskurs (HKB D, 2. Lehrjahr) zum Thema 'Datenschutz im betrieblichen Alltag gemäss DSG' — mit konkreten Lernzielen nach Handlungskompetenzen aus dem Bildungsplan KV, aktivierenden Methoden und einem kurzen Leistungsnachweis.",
    orchestration: {
      title: "Optimaler Workflow: Unterrichtsentwurf",
      description: "Verknüpfen Sie Quellenrecherche, Dokumentenanalyse und Entwurfserstellung für einen professionellen KV-Unterrichtsentwurf in unter 30 Minuten.",
      steps: [
        { tool: "perplexity",  role: "Schritt 1 · Inhaltsbasis",       action: "Aktuelle Handlungskompetenzen aus dem Bildungsplan KV (SBFI) recherchieren und HKB-Felder prüfen" },
        { tool: "notebooklm", role: "Schritt 2 · Dokument auswerten",   action: "BiVo- oder Rahmenlehrplan-PDF hochladen → HKB-A-bis-E-Struktur als Mindmap anzeigen lassen" },
        { tool: "claude",     role: "Schritt 3 · Entwurf erstellen",    action: "Vollständigen 90-Min-Entwurf mit Lernzielen, Methoden und Leistungsnachweis nach HKB-Struktur erstellen" },
        { tool: "chatgpt",    role: "Schritt 4 · Material ergänzen",    action: "Begleitmaterial, Fallstudien und Differenzierungen für EFZ/BM-Niveaus generieren" },
      ],
      proTipp: "Claude für den Hauptentwurf, ChatGPT für schnelle Materialvarianten — so kombinieren Sie Präzision mit Geschwindigkeit.",
      zeitvorteil: "Vollständiger KV-Unterrichtsentwurf inkl. Material: ca. 25 Min. statt 3–4 Stunden Planungsarbeit.",
    },
    tools: {
      perplexity: {
        scores: { zeitersparnis: 3, faktenpruefung: 2, direkteinsatz: 3, qualitaet: 3, einfachheit: 4 },
        staerken: [
          "Kann auf aktuelle Bildungsplan-KV- und HKB-Dokumente verweisen",
          "Findet aktuelle Fachliteratur zur Schweizer Berufsbildung",
          "Quellenbelegt für inhaltliche Grundlagen",
        ],
        schwaechen: [
          "Pädagogische Strukturierung nach CH-Kompetenzmodell schwach",
          "Kennt HKB-A-bis-E-Struktur kaum aus eigenem Wissen",
          "Kürzere, weniger didaktisch ausgearbeitete Entwürfe",
        ],
        empfehlung: "Als inhaltliche Vorbereitung, nicht Hauptwerkzeug",
        tipp: "Nutzen Sie Perplexity zuerst, um aktuelle Handlungskompetenzfelder aus dem Bildungsplan KV (SBFI) zu recherchieren — dann ChatGPT oder Claude für die eigentliche Unterrichtsplanung nach HKB-Struktur.",
        zeitNote: "Mittlere Zeitersparnis — sinnvoll als erste Inhaltsrecherche, nicht als vollständiger Planungsersatz.",
        faktenpruefungNote: "Gering bis mittel — Fachinhalte sind quellenbelegbar; pädagogische Strukturierung eigenständig prüfen.",
        direkteinsatzNote: "Mittel — gute inhaltliche Basis, pädagogische Ausarbeitung nach CH-Standards braucht Nacharbeit.",
      },
      chatgpt: {
        scores: { zeitersparnis: 5, faktenpruefung: 2, direkteinsatz: 5, qualitaet: 4, einfachheit: 5 },
        staerken: [
          "Erstellt vollständige KV-Unterrichtsentwürfe in 5–10 Minuten",
          "Kennt Handlungskompetenzen, Lernziele nach Bloom-Taxonomie",
          "Differenzierung für verschiedene Niveaus (EFZ/BM)",
          "Auf Wunsch: Bezug zum Bildungsplan KV und HKB-A-bis-E-Struktur",
          "Begleitmaterial (Fallstudien, Arbeitsblätter) auf Wunsch",
        ],
        schwaechen: [
          "HKB-Spezifika (A–E) müssen explizit im Prompt angegeben werden",
          "Ohne genauen Prompt eher generisch (nicht CH-spezifisch)",
          "Schweizer Fachterminologie manchmal ungenau",
        ],
        empfehlung: "Beste Wahl für schnelle KV-Unterrichtsentwürfe",
        tipp: "Spezifizieren Sie: 'KV-Grundbildung HKB D, 2. Lehrjahr, EFZ-Niveau, Thema DSG Schweiz, 90 Minuten, aktivierende Methoden, Lernziele nach Handlungskompetenzen.' ChatGPT liefert dann einen unterrichtsfertigen Entwurf.",
        zeitNote: "Spart 60–70% Planungszeit — ein vollständiger KV-Unterrichtsentwurf in Minuten statt Stunden.",
        faktenpruefungNote: "Gering — pädagogische Struktur korrekt; Schweizer Fachbegriffe und Gesetzesdetails einmalig prüfen.",
        direkteinsatzNote: "Sehr hoch — Entwürfe sind mit kleinen CH-spezifischen Anpassungen direkt verwendbar.",
      },
      claude: {
        scores: { zeitersparnis: 5, faktenpruefung: 1, direkteinsatz: 5, qualitaet: 5, einfachheit: 4 },
        staerken: [
          "Aussergewöhnlich kohärente Unterrichtsentwürfe mit klarem Kompetenzaufbau",
          "Sehr präzise Lernzielformulierungen (Handlungskompetenzen, Bloom)",
          "Exzellente Methodenwahl — aktivierend und altersgerecht",
          "Versteht KV-Kontext und Berufsfeldnähe gut",
          "Konsistente Qualität auch bei mehreren Entwürfen hintereinander",
        ],
        schwaechen: [
          "Eher konservative Methodenwahl, weniger gamifiziert",
          "Schweizer HKB-Terminologie (HKB A–E) explizit im Prompt angeben",
          "Kann sehr ausführlich werden — Länge steuern nötig",
        ],
        empfehlung: "Beste Wahl für qualitativ hochwertige Entwürfe",
        tipp: "Angeben: 'KV-Grundbildung, 2. Lehrjahr, HKB D (Prozesse und Technologien), CH-Kontext, Lernziele nach Handlungskompetenzen, aktivierende Methoden mit Schweizer Fallbeispielen (z.B. Post AG, SBB, Migros).' Sehr präzise Ergebnisse.",
        zeitNote: "Gleiche Zeitersparnis wie ChatGPT, aber höhere Ausgangsqualität — Entwürfe brauchen weniger Nachbearbeitung.",
        faktenpruefungNote: "Sehr gering — Claude ist präzise und kennzeichnet Unsicherheiten; HKB-Handlungskompetenzfelder (A–E) und Lehrjahr explizit im Prompt angeben.",
        direkteinsatzNote: "Sehr hoch — Unterrichtsentwürfe sind professionell, pädagogisch durchdacht und direkt einsetzbar.",
      },
      notebooklm: {
        scores: { zeitersparnis: 2, faktenpruefung: 1, direkteinsatz: 2, qualitaet: 2, einfachheit: 3 },
        staerken: [
          "Kann aus hochgeladenen Bildungsplan-KV-PDFs Struktur und Inhalte extrahieren",
          "Erstellt automatisch eine Mindmap der Handlungskompetenzfelder",
          "Sehr gut für das Durcharbeiten von BiVo- oder Rahmenlehrplan-Dokumenten",
          "Keine Halluzinationen — bleibt bei hochgeladenen Inhalten",
        ],
        schwaechen: [
          "Erstellt keine eigenständigen Unterrichtsentwürfe von Grund auf",
          "Kein Wissen über didaktische Methoden oder Bloom-Taxonomie",
          "Kein Internetzugang — kann keine aktuellen Entwurfs-Vorlagen finden",
          "Für Unterrichtsplanung deutlich schwächer als ChatGPT/Claude",
        ],
        empfehlung: "Nur für Dokumentenanalyse, nicht Entwurf",
        tipp: "Laden Sie den Bildungsplan KV (SBFI-PDF) hoch — NotebookLM erstellt eine übersichtliche Mindmap der HKB-Felder A–E. Diese Übersicht können Sie dann als Grundlage für einen Unterrichtsentwurf mit ChatGPT oder Claude verwenden.",
        zeitNote: "Geringe Zeitersparnis für Entwurf — nützlich nur als Vorbereitungsschritt für die Dokumentenanalyse.",
        faktenpruefungNote: "Sehr gering — bleibt bei hochgeladenen Quellen, keine freien Ergänzungen.",
        direkteinsatzNote: "Gering — liefert keine fertigen Unterrichtsentwürfe, nur Strukturübersichten aus Dokumenten.",
      },
    },
  },

  // ── 3. Feedback ───────────────────────────────────────────────────────────
  {
    id: "feedback",
    label: "Feedback für Schülertexte",
    icon: "✍️",
    scenario: "Ihre KV-Klasse (3. Lehrjahr, EFZ-Abschlussjahr) hat eine schriftliche Standortbestimmung (Reflexionsbericht) als Teil des E-Portfolios eingereicht — je 400–500 Wörter. Sie möchten allen 24 Lernenden konstruktives, individuelles Feedback zur Reflexionstiefe und Sprachqualität geben.",
    orchestration: {
      title: "Optimaler Workflow: Portfolio-Feedback",
      description: "Nutzen Sie die Stärken aller Tools für ein effizientes, qualitativ hochwertiges Feedback-System für Ihre gesamte Klasse.",
      steps: [
        { tool: "perplexity",  role: "Schritt 1 · Kriterien recherchieren", action: "Aktuelle Portfolio-Standards und Reflexionskompetenz-Kriterien (PHZH, BiVo) suchen" },
        { tool: "notebooklm", role: "Schritt 2 · Raster bereitstellen",      action: "Bewertungsraster als PDF hochladen → konsequente, transparente Kriterienanwendung sicherstellen" },
        { tool: "claude",     role: "Schritt 3 · Tiefes Feedback",           action: "Anspruchsvolle Texte mit tiefem Reflexionsfeedback versehen — präzise und wertschätzend" },
        { tool: "chatgpt",    role: "Schritt 4 · Skalieren",                 action: "Restliche Texte effizient und konsistent mit Sandwich-Feedback verarbeiten (20+ Texte)" },
      ],
      proTipp: "Teilen Sie die Klasse auf: Claude für Texte mit komplexer Reflexion — ChatGPT für die restlichen Texte mit klarer Struktur.",
      zeitvorteil: "Feedback für 24 Lernende: ca. 45 Min. statt 6–8 Stunden individueller Korrekturarbeit.",
    },
    tools: {
      perplexity: {
        scores: { zeitersparnis: 2, faktenpruefung: 1, direkteinsatz: 2, qualitaet: 2, einfachheit: 3 },
        staerken: [
          "Kann Bewertungsraster und Feedback-Kriterien für Portfolios recherchieren",
          "Hilfreich für Recherche zu Reflexionskompetenz-Standards",
        ],
        schwaechen: [
          "Nicht für direktes Textfeedback konzipiert",
          "Keine Verarbeitung von Schülertexten",
          "Für E-Portfolio-Feedback deutlich unterlegen",
          "Kurze, oberflächliche Rückmeldungen",
        ],
        empfehlung: "Nicht für direktes Feedback geeignet",
        tipp: "Nutzen Sie Perplexity besser zur Recherche von Bewertungsrastern (z.B. Schweizer Portfolio-Standards, PHZH-Literatur zur Reflexionskompetenz) — das eigentliche Feedback dann mit Claude oder ChatGPT generieren.",
        zeitNote: "Geringe Zeitersparnis für Textfeedback — sinnvoll nur für Vorbereitung von Bewertungsrastern.",
        faktenpruefungNote: "Sehr gering — Feedback zu Schülertexten braucht keine Faktenprüfung.",
        direkteinsatzNote: "Gering — für direktes Portfolio-Feedback nicht geeignet.",
      },
      chatgpt: {
        scores: { zeitersparnis: 4, faktenpruefung: 2, direkteinsatz: 4, qualitaet: 4, einfachheit: 5 },
        staerken: [
          "Strukturiertes Feedback nach vorgegebenen Kriterien (Reflexionstiefe, Sprache)",
          "Adaptiert Ton — wertschätzend, konstruktiv, motivierend",
          "Kann Portfolio-Bewertungsraster direkt anwenden",
          "Schnell und konsistent bei 20+ Texten",
          "Deutsch B2-Niveau gut erkannt und kommentiert",
        ],
        schwaechen: [
          "Kann oberflächlich bei tiefem Reflexionsfeedback wirken",
          "Braucht klare Kriterien und Kontext im Prompt",
          "Kennt E-Portfolio-Spezifika nur auf Anfrage",
        ],
        empfehlung: "Sehr gut für strukturiertes Massenfeedback",
        tipp: "Prompt: 'Gib konstruktives Feedback zu diesem KV-Reflexionsbericht (3. Lehrjahr, E-Portfolio-Abgabe). Kriterien: Reflexionstiefe (Selbstwahrnehmung, Konsequenzen), Sprachqualität (B2 Schrift), Struktur. Max. 150 Wörter, ermutigender Ton.' — Sandwich-Feedback (Stärke–Entwicklung–Stärke) explizit verlangen.",
        zeitNote: "Spart 50–60% Korrekturzeit — besonders wertvoll bei 20+ E-Portfolio-Abgaben vor Semesterende.",
        faktenpruefungNote: "Gering — Sprachfeedback ist zuverlässig; inhaltliche Reflexionskompetenz-Einschätzung einmal stichprobenartig prüfen.",
        direkteinsatzNote: "Hoch — Feedback mit kleinen persönlichen Ergänzungen direkt an Lernende weitergeben.",
      },
      claude: {
        scores: { zeitersparnis: 4, faktenpruefung: 1, direkteinsatz: 5, qualitaet: 5, einfachheit: 4 },
        staerken: [
          "Aussergewöhnlich tiefes Feedback zur Reflexionsqualität",
          "Erkennt oberflächliche vs. echte Reflexion präzise",
          "Wertschätzend-professioneller Ton — passend für Berufsschule",
          "Konkrete Verbesserungsvorschläge mit Beispielformulierungen",
          "Versteht den E-Portfolio-Kontext gut",
        ],
        schwaechen: [
          "Sehr ausführliche Rückmeldungen — Länge steuern nötig",
          "Prompt-Setup braucht mehr Sorgfalt",
          "Kann für schwächere Texte zu detailliert werden",
        ],
        empfehlung: "Beste Wahl für qualitativ hochwertiges Portfolio-Feedback",
        tipp: "Prompt: 'Du bewertest Reflexionsberichte von KV-Lernenden (3. Lehrjahr, E-Portfolio). Feedback auf Deutsch, max. 130 Wörter, Fokus: Reflexionstiefe (zeigt Lernende echte Selbstreflexion oder beschreibt sie nur?), Sprachqualität B2, je ein konkreter Entwicklungshinweis. Ton: wertschätzend und klar.' Exzellente Ergebnisse.",
        zeitNote: "Gleiche Zeitersparnis wie ChatGPT, aber weniger Nachbearbeitungsbedarf durch höhere Feedback-Qualität.",
        faktenpruefungNote: "Sehr gering — Claude ist sehr präzise im Sprachfeedback und im Einschätzen von Reflexionskompetenz.",
        direkteinsatzNote: "Sehr hoch — Feedback ist empathisch, fachlich präzise und direkt weiterzugeben.",
      },
      notebooklm: {
        scores: { zeitersparnis: 3, faktenpruefung: 1, direkteinsatz: 3, qualitaet: 3, einfachheit: 3 },
        staerken: [
          "Kann Bewertungsraster als Dokument hochladen und konsequent anwenden",
          "Feedback bleibt strikt bei den hochgeladenen Kriterien — kein Abdriften",
          "Kann mehrere Texte als Dokumente verarbeiten und vergleichen",
          "Transparent: zeigt an, woher die Bewertungskriterien stammen",
        ],
        schwaechen: [
          "Kein Chat-Interface für direktes, interaktives Feedback",
          "Workflow umständlicher als ChatGPT/Claude (Upload für jeden Text)",
          "Kein tiefes Verständnis von Reflexionskompetenz ohne Vorlage",
          "Tonfeinheiten (wertschätzend, motivierend) weniger ausgeprägt",
        ],
        empfehlung: "Sinnvoll wenn Bewertungsraster vorhanden ist",
        tipp: "Laden Sie Ihr Bewertungsraster als PDF hoch und fügen Sie den Schülertext als weiteres Dokument ein. NotebookLM analysiert den Text strikt anhand der Kriterien — gut für transparente, rastergebundene Rückmeldungen.",
        zeitNote: "Mittlere Zeitersparnis — Upload-Workflow dauert, danach aber schnelle rasterbasierte Auswertung.",
        faktenpruefungNote: "Sehr gering — bleibt bei hochgeladenen Bewertungskriterien, keine freien Ergänzungen.",
        direkteinsatzNote: "Mittel — gut strukturiert, aber Tonfeinheiten manuell ergänzen.",
      },
    },
  },

  // ── 4. Übungsaufgaben ─────────────────────────────────────────────────────
  {
    id: "aufgaben",
    label: "Übungsaufgaben erstellen",
    icon: "📝",
    scenario: "Sie brauchen differenzierte Aufgaben für die BM-Vorbereitung oder eine formative Lernkontrolle im KV-Kurs (z.B. HKB E: Wirtschaft, Gesellschaft und Technologie) — drei Niveaus (Grundanforderungen, erweiterte Anforderungen, Transferaufgabe) zum Thema 'Digitalisierung und Arbeitsmarkt Schweiz' — mit Musterlösungen.",
    orchestration: {
      title: "Optimaler Workflow: BM/KV-Aufgaben",
      description: "Kombinieren Sie aktuelle CH-Daten, Dokumentenstruktur und präzises Aufgabendesign für differenzierte BM-/KV-Aufgabensätze mit Musterlösungen.",
      steps: [
        { tool: "perplexity",  role: "Schritt 1 · Datenbasis",             action: "Aktuelle BFS/SECO-Statistiken zur Digitalisierung und zum Schweizer Arbeitsmarkt abrufen" },
        { tool: "notebooklm", role: "Schritt 2 · Quellen aufbereiten",      action: "BFS-Berichte hochladen → Kernzahlen und Fakten als strukturierte Übersicht extrahieren" },
        { tool: "claude",     role: "Schritt 3 · Anspruchsvolle Aufgaben",  action: "Bloom-Niveaus A/B/C mit IDAF-Transferaufgabe und Musterlösung mit Erwartungshorizont" },
        { tool: "chatgpt",    role: "Schritt 4 · Schnell variieren",        action: "Zusätzliche MC-Fragen, Grundanforderungsaufgaben und alternative Formate ergänzen" },
      ],
      proTipp: "Übergeben Sie die Perplexity-Statistiken direkt als Kontext an Claude: 'Verwende folgende BFS-Daten für eine IDAF-Transferaufgabe...' — faktisch korrekte, anspruchsvolle Aufgaben.",
      zeitvorteil: "Vollständiges differenziertes BM-Aufgabenset: ca. 30 Min. statt 2–3 Stunden Aufgabendesign und Recherche.",
    },
    tools: {
      perplexity: {
        scores: { zeitersparnis: 3, faktenpruefung: 3, direkteinsatz: 3, qualitaet: 3, einfachheit: 4 },
        staerken: [
          "Aktuelle Schweizer Statistiken (BFS, SECO) als Aufgabenbasis",
          "Reale Fallbeispiele aus CH-Unternehmen abrufbar",
          "Quellenbelegt für Zahlen und Fakten in Aufgaben",
        ],
        schwaechen: [
          "Keine Differenzierung nach BM-Prüfungsniveaus",
          "Musterlösungen weniger ausführlich",
          "Schwächer bei Aufgabenformaten (IDAF-Typologien)",
        ],
        empfehlung: "Für aktuelle CH-Statistiken als Aufgabenbasis",
        tipp: "Nutzen Sie Perplexity für aktuelle BFS- oder SECO-Daten als Aufgabengrundlage (z.B. aktuelle Erwerbslosenquote CH, Zahlen zur Digitalisierung), dann ChatGPT/Claude für die eigentliche Aufgabengestaltung im BM/KV-Format.",
        zeitNote: "Mittlere Zeitersparnis — gut für Recherche aktueller CH-Daten, weniger für Aufgabendesign nach BM-Kriterien.",
        faktenpruefungNote: "Mittel — Quellenangaben vorhanden; Zahlen aus BFS und SECO kurz auf Aktualität prüfen.",
        direkteinsatzNote: "Mittel — als Datenbasis für Aufgaben stark, pädagogische BM-Aufbereitung braucht zusätzliche Tools.",
      },
      chatgpt: {
        scores: { zeitersparnis: 5, faktenpruefung: 2, direkteinsatz: 5, qualitaet: 4, einfachheit: 5 },
        staerken: [
          "Vollständige BM-/KV-Aufgabensets in wenigen Minuten",
          "Kennt BM-Prüfungsformate und HKB-E-Aufgabentypen auf Anfrage",
          "Gute Niveaudifferenzierung nach Bloom-Taxonomie",
          "Verschiedene Formate: Analyse, Fallstudie, Stellungnahme, MC",
          "Musterlösungen und Bewertungshinweise auf Wunsch",
        ],
        schwaechen: [
          "BM-Spezifika müssen explizit angegeben werden",
          "CH-Zahlen und Statistiken können veraltet sein",
          "Ohne klaren Prompt eher generische Aufgaben",
        ],
        empfehlung: "Beste Wahl für schnelle BM-/KV-Aufgabenerstellung",
        tipp: "Prompt: 'Erstelle 3 Aufgaben zum Thema Digitalisierung und Arbeitsmarkt Schweiz für BM-Vorbereitung: Niveau 1 (Wissen/Verstehen), Niveau 2 (Anwenden), Niveau 3 (Transferaufgabe IDAF-Format). Mit Musterlösung und Bewertungshinweisen. Schweizer Kontext (BFS-Daten, CH-Unternehmen).'",
        zeitNote: "Spart 70–80% Zeit — vollständiges differenziertes BM-Aufgabenset in 5–8 Minuten statt 1–2 Stunden.",
        faktenpruefungNote: "Gering bis mittel — Aufgabenstruktur und Didaktik korrekt; Schweizer Statistiken mit BFS/SECO-Daten abgleichen.",
        direkteinsatzNote: "Sehr hoch — Aufgabensets sind direkt druckfertig für KV-/BM-Unterricht einsetzbar.",
      },
      claude: {
        scores: { zeitersparnis: 5, faktenpruefung: 1, direkteinsatz: 5, qualitaet: 5, einfachheit: 4 },
        staerken: [
          "Sehr durchdachte, kognitiv anspruchsvolle BM-Aufgaben",
          "Exzellente Differenzierung mit klaren Niveauunterschieden",
          "Kohärente Musterlösungen mit Bewertungskriterien",
          "Versteht IDAF-Transferaufgaben-Logik gut",
          "Schweizer Arbeitsmarkt-Kontext wird gut eingebaut",
        ],
        schwaechen: [
          "Schweizer Statistiken müssen extern beschafft werden",
          "Ausführliche Aufgaben — Länge steuern nötig",
          "Prompt-Präzision wichtiger als bei ChatGPT",
        ],
        empfehlung: "Beste Wahl für qualitativ anspruchsvolle BM-Aufgaben",
        tipp: "Prompt: 'Erstelle BM-Aufgaben nach Bloom-Taxonomie (Niveaus A/B/C), Schweizer Kontext, Thema Digitalisierung und Arbeitsmarkt. Niveau C als IDAF-ähnliche Transferaufgabe mit Quellentext. Musterlösung mit Erwartungshorizont.' Exakte Resultate, kaum Nacharbeit nötig.",
        zeitNote: "Gleiche Zeitersparnis wie ChatGPT — Aufgaben brauchen dank hoher Ausgangsqualität selten Überarbeitung.",
        faktenpruefungNote: "Sehr gering — Claude ist sehr präzise und weist auf fehlende aktuelle Daten transparent hin.",
        direkteinsatzNote: "Sehr hoch — Aufgaben sind pädagogisch fundiert, BM-tauglich und direkt einsetzbar.",
      },
      notebooklm: {
        scores: { zeitersparnis: 3, faktenpruefung: 1, direkteinsatz: 3, qualitaet: 3, einfachheit: 3 },
        staerken: [
          "Kann aus hochgeladenen BFS-/SECO-Berichten Aufgaben-Datenbasis erzeugen",
          "Erstellt FAQ und Zusammenfassungen aus BM-Lernmaterial",
          "Quellentreue: keine erfundenen Statistiken, alles belegbar",
          "Gut für Mindmaps über Digitalisierung und Arbeitsmarkt aus Dokumenten",
        ],
        schwaechen: [
          "Erstellt keine differenzierten Aufgabensätze mit Musterlösungen",
          "Kein Wissen über BM-Prüfungsformat oder IDAF-Logik",
          "Kein Internetzugang — aktuelle BFS-Daten müssen zuerst hochgeladen werden",
          "Für Aufgabendesign deutlich schwächer als ChatGPT/Claude",
        ],
        empfehlung: "Als Daten-Vorarbeit, nicht für Aufgabengestaltung",
        tipp: "Laden Sie aktuelle BFS-Berichte zur Digitalisierung und zum Schweizer Arbeitsmarkt hoch. NotebookLM erstellt eine strukturierte Übersicht der Zahlen und Fakten — diese können Sie dann ChatGPT/Claude als Grundlage für differenzierte BM-Aufgaben übergeben.",
        zeitNote: "Mittlere Zeitersparnis — gut als Datenvorbereitung, aber Aufgabenerstellung braucht zusätzliches Tool.",
        faktenpruefungNote: "Sehr gering — bleibt strikt bei hochgeladenen Dokumenten, keine eigenen Daten.",
        direkteinsatzNote: "Mittel — als Quellenübersicht nutzbar, komplette Aufgabensets nicht möglich.",
      },
    },
  },
  // ── 5. Dokumente analysieren ──────────────────────────────────────────────
  {
    id: "dokumente",
    label: "Dokumente analysieren",
    icon: "📂",
    scenario: "Sie haben mehrere PDF-Dokumente zur Hand: den Bildungsplan KV (SBFI), die BiVo 2023, einen SECO-Bericht zur Digitalisierung und Ihren eigenen Schulinternen Lehrplan. Sie möchten gezielt Informationen extrahieren, Strukturen verstehen und Querverweise zwischen den Dokumenten finden — ohne alles manuell durchzulesen.",
    orchestration: {
      title: "Optimaler Workflow: Dokumente analysieren",
      description: "NotebookLM als Kern — mit Perplexity für fehlende Aktualität und Claude für die didaktische Weiterverarbeitung der extrahierten Inhalte.",
      steps: [
        { tool: "notebooklm", role: "Schritt 1 · Dokumente hochladen",    action: "BiVo, Bildungsplan KV, SECO-Bericht hochladen → automatische Mindmap und FAQ generieren" },
        { tool: "perplexity",  role: "Schritt 2 · Lücken schliessen",     action: "Fehlende aktuelle Ergänzungen (z.B. neueste SBFI-Mitteilungen) über CH-Quellen abrufen" },
        { tool: "claude",     role: "Schritt 3 · Inhalte aufbereiten",    action: "Extrahierte Strukturen in Lernziele, Kompetenzraster oder Unterrichtssequenzen umwandeln" },
        { tool: "chatgpt",    role: "Schritt 4 · Material erstellen",     action: "Schnelle Zusammenfassungen, Glossare und Lernhilfen aus den aufbereiteten Inhalten generieren" },
      ],
      proTipp: "Laden Sie immer mehrere Dokumente gleichzeitig hoch — NotebookLM erkennt dann Querverweise zwischen BiVo und Bildungsplan KV automatisch.",
      zeitvorteil: "Manuelle Dokumentenanalyse: 3–5 Stunden. Mit NotebookLM als Kern: ca. 30–40 Minuten.",
    },
    tools: {
      perplexity: {
        scores: { zeitersparnis: 3, faktenpruefung: 2, direkteinsatz: 3, qualitaet: 3, einfachheit: 4 },
        staerken: [
          "Kann öffentlich zugängliche Dokumente (admin.ch, SBFI) direkt verlinken und zusammenfassen",
          "Gut für aktuelle Ergänzungen zu hochgeladenen Dokumenten",
          "Quellenbelegt — alle Aussagen mit Links belegbar",
          "Hilfreich wenn Dokumente nicht als PDF verfügbar sind",
        ],
        schwaechen: [
          "Kann keine eigenen, internen Dokumente hochladen und analysieren",
          "Kein Dokumenten-Upload — nur öffentliche Quellen",
          "Querverweise zwischen eigenen Dokumenten nicht möglich",
          "Für schulinterne Lehrpläne ungeeignet",
        ],
        empfehlung: "Für öffentliche CH-Dokumente, nicht eigene PDFs",
        tipp: "Nutzen Sie Perplexity parallel zu NotebookLM: Während NotebookLM Ihre hochgeladenen PDFs analysiert, holen Sie mit Perplexity aktuelle Ergänzungen von SBFI.admin.ch — z.B. neueste Änderungen am Bildungsplan KV.",
        zeitNote: "Mittlere Zeitersparnis — nützlich für öffentliche Dokumente, nicht für eigene Schulunterlagen.",
        faktenpruefungNote: "Gering — alle Angaben mit klickbaren Links zu admin.ch oder SBFI belegt.",
        direkteinsatzNote: "Mittel — Zusammenfassungen öffentlicher Dokumente direkt verwendbar, keine eigenen Uploads möglich.",
      },
      chatgpt: {
        scores: { zeitersparnis: 3, faktenpruefung: 3, direkteinsatz: 3, qualitaet: 3, einfachheit: 4 },
        staerken: [
          "Kann eingefügte Textpassagen aus Dokumenten gut strukturieren",
          "Erstellt Zusammenfassungen und Glossare aus kopierten Inhalten",
          "Flexibel bei Nachfragen zu Dokumentinhalten",
          "Gute Sprachqualität für Zusammenfassungen",
        ],
        schwaechen: [
          "Kein direkter PDF-Upload in der Basisversion",
          "Keine Querverweise zwischen mehreren Dokumenten",
          "Kann bei langen Texten den Kontext verlieren",
          "Keine transparente Quellenangabe innerhalb der Dokumente",
        ],
        empfehlung: "Für eingefügte Textpassagen, nicht Dokumentenstruktur",
        tipp: "Kopieren Sie gezielt Abschnitte aus Ihren PDFs und fügen Sie diese in ChatGPT ein: 'Fasse diesen Abschnitt aus dem Bildungsplan KV zusammen und erstelle 5 Lernziele daraus.' Für vollständige Dokumentenanalyse NotebookLM bevorzugen.",
        zeitNote: "Mittlere Zeitersparnis — nur sinnvoll für einzelne kopierte Textabschnitte, nicht für strukturierte Dokumentenanalyse.",
        faktenpruefungNote: "Mittel — keine Quellenangaben innerhalb des Dokuments; Aussagen gegen Original prüfen.",
        direkteinsatzNote: "Mittel — gute Textverarbeitung, aber fehlende Dokumentstruktur und Querverweise.",
      },
      claude: {
        scores: { zeitersparnis: 4, faktenpruefung: 2, direkteinsatz: 4, qualitaet: 4, einfachheit: 4 },
        staerken: [
          "Sehr langer Kontextumfang — kann grosse Dokumente vollständig verarbeiten",
          "Präzise Extraktion und Strukturierung von Dokumentinhalten",
          "Kann Querverweise zwischen eingefügten Texten erkennen",
          "Exzellent für didaktische Weiterverarbeitung von extrahierten Inhalten",
          "Transparente Einschränkungshinweise bei unklaren Passagen",
        ],
        schwaechen: [
          "Kein direkter PDF-Upload — Text muss eingefügt werden",
          "Keine automatische Mindmap-Erstellung",
          "Kein Audio-Format für Dokumente",
          "Weniger spezialisiert auf Dokumentenanalyse als NotebookLM",
        ],
        empfehlung: "Stark für grosse Texte, aber kein PDF-Upload",
        tipp: "Claude eignet sich hervorragend als zweiter Schritt nach NotebookLM: Exportieren Sie die NotebookLM-Zusammenfassung und bitten Sie Claude, daraus einen strukturierten Kompetenzraster oder eine Unterrichtssequenz nach HKB-Struktur zu erstellen.",
        zeitNote: "Gute Zeitersparnis bei grossen eingefügten Texten — langer Kontextumfang ist ein echter Vorteil.",
        faktenpruefungNote: "Gering — Claude bleibt sehr nah am eingereichten Text und weist transparent auf Unsicherheiten hin.",
        direkteinsatzNote: "Hoch — besonders stark für Weiterverarbeitung extrahierter Inhalte in didaktische Materialien.",
      },
      notebooklm: {
        scores: { zeitersparnis: 5, faktenpruefung: 1, direkteinsatz: 5, qualitaet: 5, einfachheit: 5 },
        staerken: [
          "Direkter Upload von bis zu 50 PDFs gleichzeitig (BiVo, Bildungsplan KV, SECO-Berichte)",
          "Automatische Mindmap, FAQ und Zusammenfassung aus hochgeladenen Dokumenten",
          "Erkennt Querverweise zwischen mehreren Dokumenten automatisch",
          "Kein Halluzinieren — antwortet nur auf Basis der hochgeladenen Quellen",
          "Audio-Podcast aus eigenen Dokumenten — ideal für Selbststudium",
          "Zeigt exakte Textstellen als Quellennachweis an",
        ],
        schwaechen: [
          "Kein Internetzugang — nur hochgeladene Dokumente werden analysiert",
          "Dokumente müssen zuerst manuell heruntergeladen und hochgeladen werden",
          "Deutsche Sprachqualität gut, aber noch nicht perfekt",
          "Kein Exportformat für Mindmaps (nur Screenshot)",
        ],
        empfehlung: "Erste Wahl für eigene Dokumente — klarer Sieger",
        tipp: "Laden Sie BiVo, Bildungsplan KV und Ihren schulinternen Lehrplan gleichzeitig hoch. Fragen Sie dann: 'Welche Handlungskompetenzfelder aus dem Bildungsplan KV entsprechen den Lernzielen in unserem Lehrplan?' — NotebookLM erkennt die Querverweise automatisch.",
        zeitNote: "Spart 70–80% der Zeit — statt stundenlangem manuellen Durchlesen liefert NotebookLM in Minuten eine strukturierte Übersicht mit exakten Quellenverweisen.",
        faktenpruefungNote: "Minimaler Prüfaufwand — NotebookLM bleibt strikt bei den hochgeladenen Dokumenten, erfindet nichts dazu.",
        direkteinsatzNote: "Sehr hoch — Mindmaps, FAQs und Zusammenfassungen aus eigenen CH-Dokumenten direkt als Unterrichtsmaterial verwendbar.",
      },
    },
  },
];
