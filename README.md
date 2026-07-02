# ToolKompass — KI-Kompass für Lehrpersonen

Interaktives Vergleichs-Dashboard: Welches KI-Tool eignet sich für welche
Unterrichtsaufgabe? **Perplexity, ChatGPT, Claude und NotebookLM** im Vergleich
für die Schweizer Berufsbildung.

Statische Single-Page-App (React + Vite + Tailwind CSS), deployt auf Vercel.
Alle Vergleichsdaten liegen in `client/src/data/comparisons.ts`.

## Entwicklung

```bash
npm install     # Abhängigkeiten installieren
npm run dev     # Dev-Server (Vite) auf http://localhost:5173
npm run build   # Produktions-Build nach dist/public
npm run preview # Produktions-Build lokal ansehen
npm run check   # TypeScript-Typprüfung
```

## Projektstruktur

```
client/
  index.html            # HTML-Einstieg (Titel, Meta, Favicon)
  src/
    main.tsx            # React-Einstiegspunkt
    App.tsx             # Router (wouter, Hash-Routing)
    pages/Dashboard.tsx # Das gesamte Dashboard inkl. SVG-Radar-Charts
    data/comparisons.ts # Tools, Kategorien, Bewertungen — hier Inhalte pflegen
    index.css           # Tailwind + Design-Tokens
```

## Deployment

Vercel baut mit `vite build` und liefert `dist/public` als statische Seite aus.
Ein Push auf `main` löst automatisch ein Deployment aus.
