import { useState } from "react";
import type { BaustellenStatus } from "../model/types";
import { STATUS_TEXT } from "../model/types";
import { erstelleBaustelle, useAppZustand } from "../store/store";
import { geheZu } from "../ui/router";
import { GrosserKnopf, StatusChip, eingabeKlasse } from "../ui/bausteine";
import { formatZeitraum, heuteIso } from "../logic/kalender";
import { formatEuro } from "../logic/geld";

type Sortierung = "neueste" | "aelteste" | "name" | "umsatz";

const SORTIERUNGEN: { wert: Sortierung; text: string }[] = [
  { wert: "neueste", text: "Neueste zuerst" },
  { wert: "aelteste", text: "Älteste zuerst" },
  { wert: "name", text: "Name A–Z" },
  { wert: "umsatz", text: "Umsatz (höchste zuerst)" },
];

export default function Liste() {
  const { baustellen } = useAppZustand();
  const [suche, setSuche] = useState("");
  const [sortierung, setSortierung] = useState<Sortierung>("neueste");
  const [statusFilter, setStatusFilter] = useState<BaustellenStatus | "alle">(
    "alle",
  );

  const s = suche.trim().toLowerCase();
  let gefiltert = baustellen.filter(
    (b) =>
      (statusFilter === "alle" || b.status === statusFilter) &&
      (!s ||
        b.name.toLowerCase().includes(s) ||
        b.kunde.toLowerCase().includes(s) ||
        b.adresse.toLowerCase().includes(s)),
  );
  gefiltert = [...gefiltert].sort((a, b) => {
    switch (sortierung) {
      case "aelteste":
        return a.beginn.localeCompare(b.beginn);
      case "name":
        return (a.name || "Ω").localeCompare(b.name || "Ω", "de");
      case "umsatz":
        return (b.umsatz ?? -1) - (a.umsatz ?? -1);
      default:
        return b.beginn.localeCompare(a.beginn);
    }
  });

  const umsatzSumme = gefiltert.reduce((s2, b) => s2 + (b.umsatz ?? 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <GrosserKnopf
        volleBreite
        aufKlick={() => {
          void erstelleBaustelle(heuteIso()).then((b) =>
            geheZu({ name: "baustelle", id: b.id }),
          );
        }}
      >
        + Neue Baustelle
      </GrosserKnopf>

      <input
        type="search"
        className={eingabeKlasse}
        placeholder="Suche: Name, Kunde oder Adresse"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
      />

      <div className="flex gap-2">
        <select
          aria-label="Sortierung"
          className={eingabeKlasse + " flex-1"}
          value={sortierung}
          onChange={(e) => setSortierung(e.target.value as Sortierung)}
        >
          {SORTIERUNGEN.map((o) => (
            <option key={o.wert} value={o.wert}>
              {o.text}
            </option>
          ))}
        </select>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["alle", "geplant", "laufend", "abgeschlossen"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={
              "min-h-11 flex-none rounded-full border-2 px-4 text-[14px] font-bold " +
              (statusFilter === f
                ? "border-akzent bg-akzent-hell text-akzent"
                : "border-linie bg-flaeche text-dezent")
            }
            onClick={() => setStatusFilter(f)}
          >
            {f === "alle" ? "Alle" : STATUS_TEXT[f]}
          </button>
        ))}
      </div>

      {gefiltert.length === 0 ? (
        <p className="py-8 text-center text-[15px] text-dezent">
          {baustellen.length === 0
            ? "Noch keine Baustellen. Leg mit „+ Neue Baustelle“ los oder tippe im Kalender auf einen Tag."
            : "Nichts gefunden."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {gefiltert.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border-2 border-linie bg-flaeche p-4 text-left active:border-akzent"
                  onClick={() => geheZu({ name: "baustelle", id: b.id })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[17px] font-bold">
                        {b.name || "Ohne Namen"}
                      </div>
                      <div className="truncate text-[15px] text-dezent">
                        {[b.kunde, b.adresse].filter(Boolean).join(" · ") ||
                          "Keine Angaben"}
                      </div>
                      <div className="mt-1 text-[14px] text-dezent">
                        {formatZeitraum(b)}
                        {b.umsatz !== undefined
                          ? ` · Umsatz ${formatEuro(b.umsatz)}`
                          : ""}
                      </div>
                    </div>
                    <StatusChip status={b.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {umsatzSumme > 0 ? (
            <p className="rounded-lg bg-akzent-hell p-3 text-center text-[15px] font-bold text-akzent">
              Umsatz der angezeigten Baustellen: {formatEuro(umsatzSumme)}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
