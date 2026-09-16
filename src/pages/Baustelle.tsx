import { useEffect, useRef, useState } from "react";
import type { Baustelle, BaustellenStatus } from "../model/types";
import { STATUS_TEXT } from "../model/types";
import {
  aenderBaustelle,
  loescheBaustelle,
  neueId,
  useAppZustand,
} from "../store/store";
import * as db from "../store/db";
import { fotoVerkleinern } from "../logic/bild";
import { geheZu } from "../ui/router";
import {
  Feld,
  GrosserKnopf,
  TextEingabe,
  ZahlEingabe,
  eingabeKlasse,
} from "../ui/bausteine";
import { formatEuro, materialSumme, rohertrag, stundenSumme } from "../logic/geld";
import { formatDatumDe, heuteIso } from "../logic/kalender";

export default function BaustellePage(props: { id: string }) {
  const { baustellen } = useAppZustand();
  const b = baustellen.find((x) => x.id === props.id);
  const [fotoUrls, setFotoUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef<Record<string, string>>({});
  const [grossFoto, setGrossFoto] = useState<string | null>(null);

  useEffect(() => {
    if (!b) return;
    let aktiv = true;
    void db.ladeFotosZuBaustelle(b.id).then((fotos) => {
      if (!aktiv) return;
      const neu: Record<string, string> = {};
      for (const f of fotos) {
        neu[f.id] = urlsRef.current[f.id] ?? URL.createObjectURL(f.blob);
      }
      for (const [id, url] of Object.entries(urlsRef.current)) {
        if (!neu[id]) URL.revokeObjectURL(url);
      }
      urlsRef.current = neu;
      setFotoUrls(neu);
    });
    return () => {
      aktiv = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.id, b?.fotoIds.length]);

  useEffect(
    () => () => {
      for (const url of Object.values(urlsRef.current)) URL.revokeObjectURL(url);
      urlsRef.current = {};
    },
    [],
  );

  if (!b) {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-dezent">Baustelle nicht gefunden.</p>
        <GrosserKnopf aufKlick={() => geheZu({ name: "kalender" })}>
          Zum Kalender
        </GrosserKnopf>
      </div>
    );
  }

  function setze(aenderung: (x: Baustelle) => Baustelle) {
    aenderBaustelle(props.id, aenderung);
  }

  async function fotosHinzufuegen(dateien: FileList) {
    for (const datei of Array.from(dateien)) {
      const blob = await fotoVerkleinern(datei);
      const fotoId = neueId();
      await db.speichereFoto({ id: fotoId, baustelleId: props.id, blob });
      setze((x) => ({ ...x, fotoIds: [...x.fotoIds, fotoId] }));
    }
  }

  const matSumme = materialSumme(b.material);
  const stdSumme = stundenSumme(b.zeiten);
  const ertrag = rohertrag(b);

  return (
    <div className="flex flex-col gap-5">
      {/* ---------- Stammdaten ---------- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[16px] font-bold uppercase tracking-wide text-dezent">
          Baustelle
        </h2>
        <Feld label="Name der Baustelle">
          <TextEingabe
            wert={b.name}
            platzhalter="z. B. Dachsanierung Musterweg"
            aufAenderung={(v) => setze((x) => ({ ...x, name: v }))}
          />
        </Feld>
        <Feld label="Kunde">
          <TextEingabe
            wert={b.kunde}
            aufAenderung={(v) => setze((x) => ({ ...x, kunde: v }))}
          />
        </Feld>
        <Feld label="Adresse">
          <TextEingabe
            wert={b.adresse}
            platzhalter="Straße Nr., PLZ Ort"
            aufAenderung={(v) => setze((x) => ({ ...x, adresse: v }))}
          />
        </Feld>
        <Feld label="Telefon">
          <TextEingabe
            wert={b.telefon}
            typ="tel"
            aufAenderung={(v) => setze((x) => ({ ...x, telefon: v }))}
          />
        </Feld>
        <div className="grid grid-cols-2 gap-3">
          <Feld label="Beginn">
            <TextEingabe
              typ="date"
              wert={b.beginn}
              aufAenderung={(v) => setze((x) => ({ ...x, beginn: v }))}
            />
          </Feld>
          <Feld label="Ende (leer = 1 Tag)">
            <TextEingabe
              typ="date"
              wert={b.ende}
              aufAenderung={(v) => setze((x) => ({ ...x, ende: v }))}
            />
          </Feld>
        </div>
        <Feld label="Status">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STATUS_TEXT) as BaustellenStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={b.status === s}
                className={
                  "min-h-12 rounded-lg border-2 text-[14px] font-bold " +
                  (b.status === s
                    ? s === "geplant"
                      ? "border-geplant bg-geplant text-white"
                      : s === "laufend"
                        ? "border-akzent bg-akzent text-white"
                        : "border-fertig bg-fertig text-white"
                    : "border-linie bg-flaeche text-tinte")
                }
                onClick={() => setze((x) => ({ ...x, status: s }))}
              >
                {STATUS_TEXT[s]}
              </button>
            ))}
          </div>
        </Feld>
        <Feld label="Notizen">
          <textarea
            className="min-h-20 w-full rounded-lg border-2 border-linie bg-flaeche px-3 py-3 text-[17px] focus:border-akzent focus:outline-none"
            value={b.notizen}
            onChange={(e) => setze((x) => ({ ...x, notizen: e.target.value }))}
          />
        </Feld>
      </section>

      {/* ---------- Geld ---------- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[16px] font-bold uppercase tracking-wide text-dezent">
          Angebot & Umsatz
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Feld label="Angebotspreis">
            <ZahlEingabe
              wert={b.angebotspreis}
              suffix="€"
              aufAenderung={(n) => setze((x) => ({ ...x, angebotspreis: n }))}
            />
          </Feld>
          <Feld label="Umsatz (Rechnungsbetrag)">
            <ZahlEingabe
              wert={b.umsatz}
              suffix="€"
              aufAenderung={(n) => setze((x) => ({ ...x, umsatz: n }))}
            />
          </Feld>
        </div>
        <div className="rounded-xl border-2 border-tinte bg-flaeche p-3 text-[15px]">
          <div className="flex justify-between py-0.5">
            <span className="text-dezent">Angebotspreis</span>
            <b>{formatEuro(b.angebotspreis)}</b>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-dezent">Umsatz</span>
            <b>{formatEuro(b.umsatz)}</b>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-dezent">Materialkosten</span>
            <b>− {formatEuro(matSumme)}</b>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-dezent">Arbeitszeit gesamt</span>
            <b>{stdSumme.toLocaleString("de-DE")} Std.</b>
          </div>
          <div className="mt-1 flex justify-between border-t-2 border-linie pt-2 text-[16px]">
            <span className="font-bold">Umsatz − Material</span>
            <b className={ertrag !== undefined && ertrag < 0 ? "text-fehler" : "text-fertig"}>
              {formatEuro(ertrag)}
            </b>
          </div>
        </div>
      </section>

      {/* ---------- Material ---------- */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[16px] font-bold uppercase tracking-wide text-dezent">
          Material ({formatEuro(matSumme)})
        </h2>
        {b.material.map((m) => (
          <div key={m.id} className="rounded-xl border-2 border-linie bg-flaeche p-3">
            <div className="mb-2 flex gap-2">
              <input
                className={eingabeKlasse + " flex-1"}
                placeholder="Material / Position"
                value={m.bezeichnung}
                onChange={(e) =>
                  setze((x) => ({
                    ...x,
                    material: x.material.map((y) =>
                      y.id === m.id ? { ...y, bezeichnung: e.target.value } : y,
                    ),
                  }))
                }
              />
              <button
                type="button"
                aria-label="Position löschen"
                className="min-h-12 min-w-12 rounded-lg border-2 border-linie text-[18px] font-bold text-fehler"
                onClick={() =>
                  setze((x) => ({
                    ...x,
                    material: x.material.filter((y) => y.id !== m.id),
                  }))
                }
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <ZahlEingabe
                klein
                wert={m.menge}
                platzhalter="Menge"
                aufAenderung={(n) =>
                  setze((x) => ({
                    ...x,
                    material: x.material.map((y) =>
                      y.id === m.id ? { ...y, menge: n } : y,
                    ),
                  }))
                }
              />
              <ZahlEingabe
                klein
                wert={m.einzelpreis}
                platzhalter="Einzelpreis"
                suffix="€"
                aufAenderung={(n) =>
                  setze((x) => ({
                    ...x,
                    material: x.material.map((y) =>
                      y.id === m.id ? { ...y, einzelpreis: n } : y,
                    ),
                  }))
                }
              />
              <span className="min-w-20 text-right text-[15px] font-bold">
                {formatEuro((m.menge ?? 1) * (m.einzelpreis ?? 0))}
              </span>
            </div>
          </div>
        ))}
        <GrosserKnopf
          art="sekundaer"
          aufKlick={() =>
            setze((x) => ({
              ...x,
              material: [
                ...x.material,
                { id: neueId(), bezeichnung: "" },
              ],
            }))
          }
        >
          + Material hinzufügen
        </GrosserKnopf>
      </section>

      {/* ---------- Zeiterfassung ---------- */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[16px] font-bold uppercase tracking-wide text-dezent">
          Zeiterfassung ({stdSumme.toLocaleString("de-DE")} Std.)
        </h2>
        {b.zeiten.map((z) => (
          <div key={z.id} className="rounded-xl border-2 border-linie bg-flaeche p-3">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <input
                type="date"
                className={eingabeKlasse + " px-2 py-2 text-[15px] min-h-11"}
                value={z.datum}
                onChange={(e) =>
                  setze((x) => ({
                    ...x,
                    zeiten: x.zeiten.map((y) =>
                      y.id === z.id ? { ...y, datum: e.target.value } : y,
                    ),
                  }))
                }
              />
              <div className="w-28">
                <ZahlEingabe
                  klein
                  wert={z.stunden}
                  platzhalter="Std."
                  suffix="h"
                  aufAenderung={(n) =>
                    setze((x) => ({
                      ...x,
                      zeiten: x.zeiten.map((y) =>
                        y.id === z.id ? { ...y, stunden: n } : y,
                      ),
                    }))
                  }
                />
              </div>
              <button
                type="button"
                aria-label="Zeiteintrag löschen"
                className="min-h-11 min-w-11 rounded-lg border-2 border-linie text-[18px] font-bold text-fehler"
                onClick={() =>
                  setze((x) => ({
                    ...x,
                    zeiten: x.zeiten.filter((y) => y.id !== z.id),
                  }))
                }
              >
                ×
              </button>
            </div>
            <input
              className={eingabeKlasse + " mt-2 px-2 py-2 text-[15px] min-h-11"}
              placeholder="Wer / was (optional)"
              value={z.notiz}
              onChange={(e) =>
                setze((x) => ({
                  ...x,
                  zeiten: x.zeiten.map((y) =>
                    y.id === z.id ? { ...y, notiz: e.target.value } : y,
                  ),
                }))
              }
            />
          </div>
        ))}
        <GrosserKnopf
          art="sekundaer"
          aufKlick={() =>
            setze((x) => ({
              ...x,
              zeiten: [
                ...x.zeiten,
                { id: neueId(), datum: heuteIso(), notiz: "" },
              ],
            }))
          }
        >
          + Zeit erfassen
        </GrosserKnopf>
      </section>

      {/* ---------- Fotos ---------- */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[16px] font-bold uppercase tracking-wide text-dezent">
          Fotos ({b.fotoIds.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {b.fotoIds.map((fotoId) => (
            <div key={fotoId} className="relative">
              {fotoUrls[fotoId] ? (
                <img
                  src={fotoUrls[fotoId]}
                  alt="Baustellen-Foto"
                  className="h-24 w-24 rounded-lg border-2 border-linie object-cover"
                  onClick={() => setGrossFoto(fotoUrls[fotoId])}
                />
              ) : (
                <div className="h-24 w-24 animate-pulse rounded-lg bg-grund" />
              )}
              <button
                type="button"
                aria-label="Foto löschen"
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-fehler text-white"
                onClick={() => {
                  if (!window.confirm("Foto löschen?")) return;
                  void db.loescheFoto(fotoId);
                  setze((x) => ({
                    ...x,
                    fotoIds: x.fotoIds.filter((f) => f !== fotoId),
                  }));
                }}
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-dezent text-center text-[13px] font-bold text-dezent">
            📷
            <span>Foto</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void fotosHinzufuegen(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </section>

      {grossFoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3"
          onClick={() => setGrossFoto(null)}
        >
          <img src={grossFoto} alt="Foto groß" className="max-h-full max-w-full rounded-lg" />
        </div>
      ) : null}

      <hr className="border-linie" />
      <p className="text-[13px] text-dezent">
        Angelegt am {formatDatumDe(b.angelegtAm.slice(0, 10))} · Änderungen
        werden automatisch gespeichert.
      </p>
      <GrosserKnopf
        art="gefahr"
        aufKlick={() => {
          if (
            window.confirm(
              "Diese Baustelle mit allen Fotos, Zeiten und Materialdaten endgültig löschen?",
            )
          ) {
            void loescheBaustelle(props.id).then(() => geheZu({ name: "kalender" }));
          }
        }}
      >
        Baustelle löschen
      </GrosserKnopf>
    </div>
  );
}
