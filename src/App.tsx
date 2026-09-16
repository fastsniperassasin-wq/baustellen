import { useEffect, useState } from "react";
import { ladeAlles } from "./store/store";
import { geheZu, useRoute } from "./ui/router";
import Kalender from "./pages/Kalender";
import Liste from "./pages/Liste";
import BaustellePage from "./pages/Baustelle";
import Sicherung from "./pages/Sicherung";

const MENUE = [
  { titel: "Kalender", symbol: "📅", route: { name: "kalender" } as const },
  { titel: "Baustellen-Liste", symbol: "📋", route: { name: "liste" } as const },
  { titel: "Datensicherung", symbol: "💾", route: { name: "sicherung" } as const },
];

export default function App() {
  const route = useRoute();
  const [menueOffen, setMenueOffen] = useState(false);

  useEffect(() => {
    void ladeAlles();
  }, []);

  const titel =
    route.name === "liste"
      ? "Baustellen"
      : route.name === "sicherung"
        ? "Datensicherung"
        : route.name === "baustelle"
          ? "Baustelle"
          : "Kalender";

  return (
    <div className="mx-auto max-w-xl px-3 pb-8">
      <header className="mb-3 flex items-center gap-3 border-b-4 border-tinte py-3">
        <button
          type="button"
          aria-label="Menü öffnen"
          className="flex h-12 w-12 flex-none flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-linie bg-flaeche"
          onClick={() => setMenueOffen(true)}
        >
          <span className="h-0.5 w-6 bg-tinte" />
          <span className="h-0.5 w-6 bg-tinte" />
          <span className="h-0.5 w-6 bg-tinte" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-bold leading-tight">{titel}</div>
          <div className="text-[13px] text-dezent">
            Baustellen-Planung · Mette
          </div>
        </div>
        {route.name === "baustelle" ? (
          <button
            type="button"
            className="min-h-12 flex-none rounded-lg border-2 border-linie bg-flaeche px-4 text-[15px] font-bold"
            onClick={() => history.back()}
          >
            ‹ Zurück
          </button>
        ) : null}
      </header>

      {menueOffen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMenueOffen(false)}
        >
          <nav
            aria-label="Hauptmenü"
            className="h-full w-72 max-w-[85vw] bg-flaeche p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 border-b-2 border-linie pb-3">
              <div className="text-[17px] font-bold">Baustellen-Planung</div>
              <div className="text-[13px] text-dezent">
                Dachdecker Meisterbetrieb Mette
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {MENUE.map((m) => (
                <li key={m.titel}>
                  <button
                    type="button"
                    className={
                      "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[16px] font-bold " +
                      (route.name === m.route.name
                        ? "bg-akzent-hell text-akzent"
                        : "text-tinte active:bg-grund")
                    }
                    onClick={() => {
                      setMenueOffen(false);
                      geheZu(m.route);
                    }}
                  >
                    <span aria-hidden className="text-[20px]">
                      {m.symbol}
                    </span>
                    {m.titel}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] leading-relaxed text-dezent">
              Alle Daten bleiben auf diesem Gerät. Regelmäßig unter
              „Datensicherung“ sichern.
            </p>
          </nav>
        </div>
      ) : null}

      {route.name === "liste" ? (
        <Liste />
      ) : route.name === "sicherung" ? (
        <Sicherung />
      ) : route.name === "baustelle" ? (
        <BaustellePage id={route.id} />
      ) : (
        <Kalender />
      )}
    </div>
  );
}
