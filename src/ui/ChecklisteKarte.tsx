import { useState } from "react";
import type { Baustelle } from "../model/types";
import { aenderBaustelle, neueId } from "../store/store";
import { CHECK_SCHRITTE, fortschritt, type CheckSchrittId } from "../logic/checkliste";
import { GrosserKnopf, eingabeKlasse } from "./bausteine";

/** Aufklappbare Ablauf-Checkliste: Besichtigung bis Rechnung. */
export default function ChecklisteKarte(props: { b: Baustelle }) {
  const { b } = props;
  const [offen, setOffen] = useState(false);
  const { erledigt, gesamt } = fortschritt(b.checkliste);
  const fertig = erledigt === gesamt;

  function setze(aenderung: (x: Baustelle) => Baustelle) {
    aenderBaustelle(b.id, aenderung);
  }

  function schaltSchritt(id: CheckSchrittId) {
    setze((x) => ({
      ...x,
      checkliste: {
        ...x.checkliste,
        schritte: {
          ...x.checkliste.schritte,
          [id]: !x.checkliste.schritte[id],
        },
      },
    }));
  }

  function Haken(props2: { an: boolean }) {
    return (
      <span
        aria-hidden
        className={
          "flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 text-[15px] font-bold " +
          (props2.an
            ? "border-fertig bg-fertig text-white"
            : "border-dezent bg-flaeche text-transparent")
        }
      >
        ✓
      </span>
    );
  }

  const zeilenKlasse =
    "flex min-h-12 w-full items-center gap-3 rounded-lg border-2 px-3 py-2 text-left text-[16px]";

  return (
    <section className="rounded-xl border-2 border-linie bg-flaeche">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left"
        aria-expanded={offen}
        onClick={() => setOffen(!offen)}
      >
        <span
          className={
            "flex h-10 w-10 flex-none items-center justify-center rounded-full text-[14px] font-bold " +
            (fertig ? "bg-fertig text-white" : "bg-akzent-hell text-akzent")
          }
        >
          {fertig ? "✓" : `${erledigt}/${gesamt}`}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold">Checkliste Ablauf</span>
          <span className="block text-[13px] text-dezent">
            Besichtigung bis Rechnung – {erledigt} von {gesamt} erledigt
          </span>
        </span>
        <span className="text-dezent">{offen ? "▴" : "▾"}</span>
      </button>
      {/* Fortschrittsbalken */}
      <div className="mx-3 mb-1 h-2 overflow-hidden rounded-full bg-grund">
        <div
          className={"h-full rounded-full " + (fertig ? "bg-fertig" : "bg-akzent")}
          style={{ width: `${(erledigt / gesamt) * 100}%` }}
        />
      </div>

      {offen ? (
        <div className="flex flex-col gap-2 p-3">
          {CHECK_SCHRITTE.map((schritt) => (
            <div key={schritt.id} className="flex flex-col gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={b.checkliste.schritte[schritt.id]}
                className={
                  zeilenKlasse +
                  (b.checkliste.schritte[schritt.id]
                    ? " border-fertig bg-fertig-hell"
                    : " border-linie bg-flaeche")
                }
                onClick={() => schaltSchritt(schritt.id)}
              >
                <Haken an={b.checkliste.schritte[schritt.id]} />
                <span
                  className={
                    b.checkliste.schritte[schritt.id]
                      ? "font-semibold"
                      : undefined
                  }
                >
                  {schritt.text}
                </span>
              </button>

              {/* Nach „Angebot erstellt“: die Entscheidung */}
              {schritt.id === "angebot" ? (
                <div className="ml-6 flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-dezent">
                    Angebot:
                  </span>
                  {(["angenommen", "abgelehnt"] as const).map((e) => (
                    <button
                      key={e}
                      type="button"
                      role="radio"
                      aria-checked={b.checkliste.angebotsEntscheid === e}
                      className={
                        "min-h-11 flex-1 rounded-full border-2 px-3 text-[14px] font-bold " +
                        (b.checkliste.angebotsEntscheid === e
                          ? e === "angenommen"
                            ? "border-fertig bg-fertig text-white"
                            : "border-fehler bg-fehler text-white"
                          : "border-linie bg-flaeche text-dezent")
                      }
                      onClick={() =>
                        setze((x) => ({
                          ...x,
                          checkliste: {
                            ...x.checkliste,
                            angebotsEntscheid:
                              x.checkliste.angebotsEntscheid === e ? "offen" : e,
                          },
                        }))
                      }
                    >
                      {e === "angenommen" ? "Angenommen" : "Abgelehnt"}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Nach dem Ausführungstermin: die Arbeiten */}
              {schritt.id === "ausfuehrung" ? (
                <div className="ml-6 flex flex-col gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={b.checkliste.arbeitenErledigt}
                    className={
                      zeilenKlasse +
                      (b.checkliste.arbeitenErledigt
                        ? " border-fertig bg-fertig-hell"
                        : " border-linie bg-flaeche")
                    }
                    onClick={() =>
                      setze((x) => ({
                        ...x,
                        checkliste: {
                          ...x.checkliste,
                          arbeitenErledigt: !x.checkliste.arbeitenErledigt,
                        },
                      }))
                    }
                  >
                    <Haken an={b.checkliste.arbeitenErledigt} />
                    <span
                      className={
                        b.checkliste.arbeitenErledigt ? "font-semibold" : undefined
                      }
                    >
                      Alle Arbeiten erledigt
                    </span>
                  </button>
                  {b.checkliste.arbeiten.map((a) => (
                    <div key={a.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={a.erledigt}
                        aria-label="Arbeit erledigt"
                        className="flex-none"
                        onClick={() =>
                          setze((x) => ({
                            ...x,
                            checkliste: {
                              ...x.checkliste,
                              arbeiten: x.checkliste.arbeiten.map((y) =>
                                y.id === a.id
                                  ? { ...y, erledigt: !y.erledigt }
                                  : y,
                              ),
                            },
                          }))
                        }
                      >
                        <Haken an={a.erledigt} />
                      </button>
                      <input
                        className={
                          eingabeKlasse +
                          " px-2 py-2 text-[15px] min-h-11" +
                          (a.erledigt ? " line-through text-dezent" : "")
                        }
                        placeholder="Ausgeführte Arbeit"
                        value={a.text}
                        onChange={(e) =>
                          setze((x) => ({
                            ...x,
                            checkliste: {
                              ...x.checkliste,
                              arbeiten: x.checkliste.arbeiten.map((y) =>
                                y.id === a.id ? { ...y, text: e.target.value } : y,
                              ),
                            },
                          }))
                        }
                      />
                      <button
                        type="button"
                        aria-label="Arbeit löschen"
                        className="min-h-11 min-w-11 flex-none rounded-lg border-2 border-linie text-[17px] font-bold text-fehler"
                        onClick={() =>
                          setze((x) => ({
                            ...x,
                            checkliste: {
                              ...x.checkliste,
                              arbeiten: x.checkliste.arbeiten.filter(
                                (y) => y.id !== a.id,
                              ),
                            },
                          }))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <GrosserKnopf
                    art="sekundaer"
                    aufKlick={() =>
                      setze((x) => ({
                        ...x,
                        checkliste: {
                          ...x.checkliste,
                          arbeiten: [
                            ...x.checkliste.arbeiten,
                            { id: neueId(), text: "", erledigt: false },
                          ],
                        },
                      }))
                    }
                  >
                    + Arbeit auflisten
                  </GrosserKnopf>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
