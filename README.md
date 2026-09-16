# Baustellen – Planung & Erfassung

Offline-fähige PWA für den Dachdecker Meisterbetrieb Mette: Baustellen im
Kalender planen (Vergangenheit bleibt erhalten, Zukunft vorplanbar) und je
Baustelle Material mit Preisen, Arbeitszeiten, Fotos, Angebotspreis und
Umsatz erfassen. Alle Daten bleiben im Gerätespeicher (IndexedDB).

## Am Handy nutzen

1. `https://fastsniperassasin-wq.github.io/baustellen/` in Chrome öffnen
2. Menü ⋮ → „App installieren“
3. Im Kalender einen Tag antippen → „+ Baustelle“ → ausfüllen (Autosave)

Menü (☰): Kalender · Baustellen-Liste (Suche, Sortierung, Statusfilter)
· Datensicherung (JSON-Export/-Import für den Gerätewechsel).

## Entwicklung

```
npm install
npm run dev
npm test
npm run build
```

Deployment: GitHub Action baut und veröffentlicht bei jedem Push auf `main`
(GitHub Pages, Quelle „GitHub Actions“).
