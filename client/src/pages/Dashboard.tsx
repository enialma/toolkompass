import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CATEGORIES,
  TOOLS,
  SCORE_LABELS,
  TOOL_COLORS,
  displayScore,
  winnersFor,
  type Tool,
  type CategoryId,
  type ScoreSet,
} from "../data/comparisons";

// Short labels for radar chart axes (to avoid clipping)
const RADAR_LABELS: Record<keyof ScoreSet, string> = {
  zeitersparnis:  "Zeit",
  faktenpruefung: "Zuverl.",
  direkteinsatz:  "Einsatz",
  qualitaet:      "Qualität",
  einfachheit:    "Einstieg",
};

// ── Radar / Spider chart using pure SVG ────────────────────────────────────
function RadarChart({ scores, tool }: { scores: ScoreSet; tool: Tool }) {
  const keys = Object.keys(SCORE_LABELS) as (keyof ScoreSet)[];
  const n = keys.length;
  const cx = 120, cy = 120, r = 72;
  const color = TOOL_COLORS[tool];

  const angleOf = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, val: number) => {
    const a = angleOf(i);
    const rr = (val / 5) * r;
    return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as [number, number];
  };

  // background rings
  const rings = [1, 2, 3, 4, 5].map((v) => {
    const pts = keys.map((_, i) => pt(i, v));
    return pts.map(([x, y], j) => (j === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ") + "Z";
  });

  // axes
  const axes = keys.map((_, i) => {
    const [x, y] = pt(i, 5);
    return `M${cx},${cy}L${x},${y}`;
  });

  // data polygon — same display value as the score bars (inverted axes flipped)
  const dataPts = keys.map((k, i) => pt(i, displayScore(k, scores[k])));
  const dataPath = dataPts.map(([x, y], j) => (j === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ") + "Z";

  // labels
  const labels = keys.map((k, i) => {
    const a = angleOf(i);
    const lx = cx + (r + 28) * Math.cos(a);
    const ly = cy + (r + 28) * Math.sin(a);
    const anchor: "end" | "start" | "middle" = lx < cx - 5 ? "end" : lx > cx + 5 ? "start" : "middle";
    return { x: lx, y: ly, anchor, label: RADAR_LABELS[k] };
  });

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
      {rings.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
      ))}
      {axes.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
      ))}
      <path d={dataPath} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} />
      {dataPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={color} />
      ))}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          dominantBaseline="middle"
          fontSize={9}
          fill="currentColor"
          fillOpacity={0.7}
          className="font-medium"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// ── Score bar ───────────────────────────────────────────────────────────────
function ScoreBar({ value, max = 5, color, inverted }: { value: number; max?: number; color: string; inverted?: boolean }) {
  const display = inverted ? max - value + 1 : value;
  const pct = (display / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold w-6 text-right opacity-70">{display}/5</span>
    </div>
  );
}

// ── Tool card — nur allgemeine Bewertung (Radar + Balken + Stärken/Schwächen) ─
function ToolCard({ tool, entry }: {
  tool: typeof TOOLS[number];
  entry: import("../data/comparisons").ToolEntry;
}) {
  const color = TOOL_COLORS[tool.id];

  return (
    <div
      className="rounded-2xl border border-black/10 dark:border-white/10 transition-all duration-200 overflow-hidden"
      data-testid={`tool-card-${tool.id}`}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: `${color}18` }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: color }}
        >
          {tool.label[0]}
        </div>
        <div>
          <div className="font-bold text-sm">{tool.label}</div>
          <div className="text-xs opacity-60">{tool.tagline}</div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 bg-white dark:bg-gray-900">
        {/* Radar */}
        <RadarChart scores={entry.scores} tool={tool.id} />

        {/* Scores */}
        <div className="space-y-2">
          {(Object.keys(SCORE_LABELS) as (keyof ScoreSet)[]).map((k) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1 opacity-70">
                <span>{SCORE_LABELS[k].label}</span>
              </div>
              <ScoreBar value={entry.scores[k]} color={color} inverted={SCORE_LABELS[k].inverted} />
            </div>
          ))}
        </div>

        {/* Stärken / Schwächen — untereinander, volle Breite */}
        <div className="space-y-3 border-t border-black/8 dark:border-white/8 pt-3">
          <div>
            <div className="text-xs font-semibold mb-1.5 flex items-center gap-1">
              <span style={{ color }}>✓</span> Stärken
            </div>
            <ul className="space-y-1">
              {entry.staerken.map((s, i) => (
                <li key={i} className="text-xs opacity-75 flex gap-1.5">
                  <span className="opacity-40 shrink-0">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-black/8 dark:border-white/8 pt-3">
            <div className="text-xs font-semibold mb-1.5 flex items-center gap-1">
              <span className="opacity-50">✗</span> Schwächen
            </div>
            <ul className="space-y-1">
              {entry.schwaechen.map((s, i) => (
                <li key={i} className="text-xs opacity-75 flex gap-1.5">
                  <span className="opacity-40 shrink-0">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



// ── Orchestration view (shown when Orchestrierung tab is active) ─────────────
function OrchestrationView() {
  const toolColors = TOOL_COLORS;
  const toolIcons: Record<Tool, string> = {
    perplexity: "P",
    chatgpt: "C",
    claude: "A",
    notebooklm: "N",
  };
  const toolLabels: Record<Tool, string> = {
    perplexity: "Perplexity",
    chatgpt: "ChatGPT",
    claude: "Claude",
    notebooklm: "NotebookLM",
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl p-5 border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shrink-0"
            style={{ background: "linear-gradient(135deg, #20808D, #4285F4)" }}
          >
            ⚡
          </div>
          <div>
            <h2 className="font-bold text-base">Orchestrierung: Tools kombinieren</h2>
            <p className="text-sm opacity-60 mt-0.5">
              Kein Tool macht alles gleich gut. Der stärkste Workflow entsteht, wenn Sie die Stärken jedes Tools gezielt kombinieren.
            </p>
          </div>
        </div>
        {/* Tool legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-black/8 dark:border-white/8">
          {(Object.keys(toolColors) as Tool[]).map((t) => (
            <div key={t} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ backgroundColor: toolColors[t] }}
              >
                {toolIcons[t]}
              </div>
              <span className="text-sm font-medium" style={{ color: toolColors[t] }}>{toolLabels[t]}</span>
              <span className="text-sm opacity-50">·</span>
              <span className="text-sm opacity-60">
                {t === "perplexity" ? "Aktuelle CH-Quellen" :
                 t === "chatgpt" ? "Schnelle Varianten" :
                 t === "claude" ? "Hohe Qualität & Präzision" :
                 "Dokument-Analyse"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* One workflow card per scenario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden"
          >
            {/* Card header */}
            <div
              className="px-5 py-3 flex items-center gap-3 border-b border-black/8 dark:border-white/8"
              style={{ backgroundColor: "#20808D10" }}
            >
              <span className="text-lg">{cat.icon}</span>
              <div>
                <div className="font-semibold text-sm">{cat.orchestration.title}</div>
                <div className="text-sm opacity-55">{cat.label}</div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Description */}
              <p className="text-sm opacity-65 leading-relaxed">{cat.orchestration.description}</p>

              {/* Steps */}
              <div className="space-y-3">
                {cat.orchestration.steps.map((step, i) => {
                  const color = toolColors[step.tool];
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {toolIcons[step.tool]}
                        </div>
                        {i < cat.orchestration.steps.length - 1 && (
                          <div className="w-px h-3 mt-1" style={{ backgroundColor: `${color}40` }} />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <div className="text-sm font-semibold" style={{ color }}>{step.role}</div>
                        <div className="text-sm opacity-65 leading-snug mt-0.5">{step.action}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Zeitvorteil */}
              <div
                className="text-sm rounded-xl px-3 py-2 leading-relaxed font-medium"
                style={{ backgroundColor: "#20808D10", borderLeft: "3px solid #20808D" }}
              >
                ⏱ {cat.orchestration.zeitvorteil}
              </div>

              {/* Pro-Tipp */}
              <div
                className="text-sm rounded-xl px-3 py-2 leading-relaxed"
                style={{ backgroundColor: "#4285F410", borderLeft: "3px solid #4285F4" }}
              >
                <span className="font-semibold" style={{ color: "#4285F4" }}>💡 Tipp: </span>
                {cat.orchestration.proTipp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="shrink-0 font-medium opacity-60 w-28">{label}</span>
      <span className="opacity-75">{value}</span>
    </div>
  );
}

// ── Summary table ───────────────────────────────────────────────────────────
function SummaryTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10 bg-black/3 dark:bg-white/3">
            <th className="text-left px-4 py-3 font-semibold opacity-70">Aufgabe</th>
            {TOOLS.map((t) => (
              <th key={t.id} className="px-4 py-3 font-semibold text-center" style={{ color: TOOL_COLORS[t.id] }}>
                {t.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((cat, ci) => {
            const winners = winnersFor(cat);
            return (
            <tr key={cat.id} className={ci % 2 === 0 ? "bg-black/2 dark:bg-white/2" : ""}>
              <td className="px-4 py-3 font-medium">
                {cat.icon} {cat.label}
              </td>
              {TOOLS.map((t) => {
                const w = winners.includes(t.id);
                const entry = cat.tools[t.id];
                return (
                  <td key={t.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          w ? "text-white" : "opacity-60 bg-black/8 dark:bg-white/8"
                        }`}
                        style={w ? { backgroundColor: TOOL_COLORS[t.id] } : {}}
                      >
                        {entry.empfehlung}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Routing: der sichtbare Bereich steckt in der URL, damit Links teilbar sind ─
type View = CategoryId | "orchestrierung";

function parseLocation(loc: string): { view: View; summary: boolean } {
  const seg = loc.replace(/^\//, "");
  if (seg === "uebersicht") return { view: "recherche", summary: true };
  if (seg === "orchestrierung") return { view: "orchestrierung", summary: false };
  const cat = CATEGORIES.find((c) => c.id === seg);
  return { view: cat ? cat.id : "recherche", summary: false };
}

// ── Main dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { view: activeCategory, summary: showSummary } = parseLocation(location);

  const [darkMode, setDarkMode] = useState(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("tk-theme") : null;
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Dark mode auf <html> anwenden und Wahl merken
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("tk-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const currentCat = activeCategory !== "orchestrierung" ? CATEGORIES.find((c) => c.id === activeCategory)! : CATEGORIES[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0" aria-label="KI Kompass">
              <circle cx="16" cy="16" r="14" fill="#20808D" fillOpacity="0.15" />
              <circle cx="16" cy="16" r="10" fill="none" stroke="#20808D" strokeWidth="1.5" />
              <polygon points="16,4 18,14 16,16 14,14" fill="#20808D" />
              <polygon points="16,28 14,18 16,16 18,18" fill="#20808D" fillOpacity="0.4" />
              <polygon points="4,16 14,14 16,16 14,18" fill="#20808D" fillOpacity="0.6" />
              <polygon points="28,16 18,18 16,16 18,14" fill="#20808D" fillOpacity="0.3" />
              <circle cx="16" cy="16" r="2.5" fill="#20808D" />
            </svg>
            <div>
              <div className="font-bold text-base leading-tight">KI-Kompass</div>
              <div className="text-xs opacity-50 leading-tight">für Lehrpersonen</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation(showSummary ? "/recherche" : "/uebersicht")}
              aria-pressed={showSummary}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                showSummary
                  ? "bg-black/8 dark:bg-white/8 border-black/15 dark:border-white/15"
                  : "border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              data-testid="toggle-summary"
            >
              {showSummary ? "Detailansicht" : "Übersichtstabelle"}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-lg border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center text-sm"
              aria-label={darkMode ? "Zu hellem Design wechseln" : "Zu dunklem Design wechseln"}
              title={darkMode ? "Helles Design" : "Dunkles Design"}
              data-testid="dark-mode-toggle"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2 py-2">
          <h1 className="text-2xl font-bold">Welches KI-Tool passt zu meiner Aufgabe?</h1>
          <p className="text-sm opacity-60 max-w-2xl mx-auto">
            Finde in Sekunden das richtige Tool für deine Unterrichtsaufgabe — Perplexity, ChatGPT, Claude und NotebookLM im direkten Vergleich anhand realer Szenarien aus der Schweizer Berufsbildung.
          </p>
        </div>

        {/* Summary or detail */}
        {showSummary ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Empfehlungsübersicht auf einen Blick</h2>
            <SummaryTable />
            <p className="text-xs opacity-50 text-center">
              Grün hinterlegt = Empfehlung für dieses Szenario. Für Details: Detailansicht wählen.
            </p>
          </div>
        ) : (
          <>
            {/* Category tabs — desktop */}
            <div className="hidden sm:flex flex-wrap gap-2 pb-1" role="tablist">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id && !showSummary}
                  onClick={() => setLocation("/" + cat.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                    activeCategory === cat.id && !showSummary
                      ? "bg-[#20808D] text-white border-[#20808D] shadow-md"
                      : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  data-testid={`tab-${cat.id}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
              <button
                role="tab"
                aria-selected={activeCategory === "orchestrierung" && !showSummary}
                onClick={() => setLocation("/orchestrierung")}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  activeCategory === "orchestrierung" && !showSummary
                    ? "bg-[#20808D] text-white border-[#20808D] shadow-md"
                    : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                data-testid="tab-orchestrierung"
              >
                <span>⚡</span>
                <span>Tools kombinieren</span>
              </button>
            </div>

            {/* Category select — mobile */}
            <div className="sm:hidden">
              <select
                value={activeCategory}
                onChange={(e) => setLocation("/" + e.target.value)}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#20808D]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
                <option value="orchestrierung">⚡ Tools kombinieren</option>
              </select>
            </div>

            {/* Orchestrierung view */}
            {activeCategory === "orchestrierung" ? (
              <OrchestrationView />
            ) : (
              <>
                {/* Scenario box */}
                <div className="rounded-2xl bg-[#20808D]/8 dark:bg-[#20808D]/12 border border-[#20808D]/20 px-5 py-4">
                  <div className="text-xs font-semibold text-[#20808D] mb-1 uppercase tracking-wide">Szenario</div>
                  <p className="text-sm opacity-80 leading-relaxed">{currentCat.scenario}</p>
                </div>

                {/* Tool cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {TOOLS.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      entry={currentCat.tools[tool.id]}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-xs opacity-40 py-4 border-t border-black/8 dark:border-white/8">
          KI-Kompass für Lehrpersonen · Perplexity, ChatGPT, Claude & NotebookLM · Bewertungen basieren auf pädagogischen Praxiserfahrungen · Stand: 2026
        </footer>
      </main>
    </div>
  );
}
