import { useState } from "react";
import { erstelleBaustelle, useAppZustand } from "../store/store";
import { geheZu } from "../ui/router";
import { GrosserKnopf, STATUS_FARBEN, StatusChip } from "../ui/bausteine";
import {
  MONATSNAMEN,
  WOCHENTAGE_KURZ,
  formatDatumDe,
  formatZeitraum,
  heuteIso,
  liegtImZeitraum,
  monatDanach,
  monatDavor,
  monatsRaster,
} from "../logic/kalender";

// Merkt sich den zuletzt angesehenen Monat über Seitenwechsel hinweg
let gemerkterMonat: { jahr: number; monat: number } | null = null;

export default function Kalender() {
  const { baustellen } = useAppZustand();
  const heute = heuteIso();
  const [ansicht, setAnsicht] = useState(() => {
    if (gemerkterMonat) return gemerkterMonat;
    const d = new Date();
    return { jahr: d.getFullYear(), monat: d.getMonth() + 1 };
  });
  const [gewaehlterTag, setGewaehlterTag] = useState<string | null>(null);

  function wechsle(zu: [number, number]) {
    const neu = { jahr: zu[0], monat: zu[1] };
    gemerkterMonat = neu;
    setAnsicht(neu);
  }

  const raster = monatsRaster(ansicht.jahr, ansicht.monat, heute);
  const proTag = new Map<string, typeof baustellen>();
  for (const zelle of raster) {
    proTag.set(
      zelle.iso,
      baustellen.filter((b) => liegtImZeitraum(b, zelle.iso)),
    );
  }
  const tagesListe = gewaehlterTag ? (proTag.get(gewaehlterTag) ?? []) : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Voriger Monat"
          className="flex h-12 w-12 flex-none items-center justify-center rounded-lg border-2 border-linie bg-flaeche text-[20px] font-bold"
          onClick={() => wechsle(monatDavor(ansicht.jahr, ansicht.monat))}
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          <div className="text-[18px] font-bold">
            {MONATSNAMEN[ansicht.monat - 1]} {ansicht.jahr}
          </div>
          <button
            type="button"
            className="text-[13px] font-bold text-akzent"
            onClick={() => {
              const d = new Date();
              wechsle([d.getFullYear(), d.getMonth() + 1]);
              setGewaehlterTag(heute);
            }}
          >
            Heute
          </button>
        </div>
        <button
          type="button"
          aria-label="Nächster Monat"
          className="flex h-12 w-12 flex-none items-center justify-center rounded-lg border-2 border-linie bg-flaeche text-[20px] font-bold"
          onClick={() => wechsle(monatDanach(ansicht.jahr, ansicht.monat))}
        >
          ›
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-linie bg-flaeche">
        <div className="grid grid-cols-7 border-b-2 border-linie bg-grund">
          {WOCHENTAGE_KURZ.map((w) => (
            <div
              key={w}
              className="py-1.5 text-center text-[12px] font-bold uppercase text-dezent"
            >
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {raster.map((zelle) => {
            const eintraege = proTag.get(zelle.iso) ?? [];
            const gewaehlt = gewaehlterTag === zelle.iso;
            return (
              <button
                key={zelle.iso}
                type="button"
                onClick={() => setGewaehlterTag(gewaehlt ? null : zelle.iso)}
                className={
                  "flex min-h-[72px] flex-col items-stretch gap-0.5 border-b border-r border-linie p-1 text-left last:border-r-0 " +
                  (zelle.imMonat ? "bg-flaeche" : "bg-grund") +
                  (gewaehlt ? " outline outline-2 -outline-offset-2 outline-akzent" : "")
                }
              >
                <span
                  className={
                    "self-start rounded-full px-1.5 text-[13px] leading-6 " +
                    (zelle.istHeute
                      ? "bg-akzent font-bold text-white"
                      : zelle.imMonat
                        ? "font-semibold text-tinte"
                        : "text-dezent")
                  }
                >
                  {zelle.tag}
                </span>
                {eintraege.slice(0, 2).map((b) => (
                  <span
                    key={b.id}
                    className={
                      "truncate rounded px-1 text-[10px] font-bold leading-4 " +
                      STATUS_FARBEN[b.status].voll
                    }
                  >
                    {b.name || b.kunde || "Baustelle"}
                  </span>
                ))}
                {eintraege.length > 2 ? (
                  <span className="text-[10px] font-bold text-dezent">
                    +{eintraege.length - 2} weitere
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {gewaehlterTag ? (
        <div className="rounded-xl border-2 border-linie bg-flaeche p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[16px] font-bold">
              {formatDatumDe(gewaehlterTag)}
            </span>
            <button
              type="button"
              className="text-[14px] font-bold text-dezent"
              onClick={() => setGewaehlterTag(null)}
            >
              Schließen ×
            </button>
          </div>
          {tagesListe.length === 0 ? (
            <p className="mb-3 text-[15px] text-dezent">
              An diesem Tag ist nichts eingeplant.
            </p>
          ) : (
            <ul className="mb-3 flex flex-col gap-2">
              {tagesListe.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border-2 border-linie p-3 text-left active:border-akzent"
                    onClick={() => geheZu({ name: "baustelle", id: b.id })}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[16px] font-bold">
                        {b.name || "Ohne Namen"}
                      </span>
                      <span className="block truncate text-[14px] text-dezent">
                        {[b.kunde, formatZeitraum(b)].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <StatusChip status={b.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <GrosserKnopf
            volleBreite
            aufKlick={() => {
              void erstelleBaustelle(gewaehlterTag).then((b) =>
                geheZu({ name: "baustelle", id: b.id }),
              );
            }}
          >
            + Baustelle am {formatDatumDe(gewaehlterTag)}
          </GrosserKnopf>
        </div>
      ) : (
        <p className="text-center text-[14px] text-dezent">
          Tag antippen, um Baustellen zu sehen oder neu einzuplanen.
        </p>
      )}
    </div>
  );
}
