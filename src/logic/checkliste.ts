import type { Checkliste } from "../model/types";

/** Die festen Schritte des Baustellen-Ablaufs, in dieser Reihenfolge. */
export const CHECK_SCHRITTE = [
  { id: "besichtigung", text: "Besichtigung / Absprache terminiert" },
  { id: "angebot", text: "Angebot erstellt" },
  // danach: Angebots-Entscheidung (angenommen/abgelehnt)
  { id: "material", text: "Material bestellt" },
  { id: "werkzeuge", text: "Werkzeuge zusammengestellt" },
  { id: "einrichtung", text: "Baustelle eingerichtet" },
  { id: "ausfuehrung", text: "Ausführungstermin festgelegt" },
  // danach: Arbeiten (Auflistung + alle erledigt)
  { id: "rechnung", text: "Rechnung gestellt" },
] as const;

export type CheckSchrittId = (typeof CHECK_SCHRITTE)[number]["id"];

export function leereCheckliste(): Checkliste {
  return {
    schritte: {
      besichtigung: false,
      angebot: false,
      material: false,
      werkzeuge: false,
      einrichtung: false,
      ausfuehrung: false,
      rechnung: false,
    },
    angebotsEntscheid: "offen",
    arbeitenErledigt: false,
    arbeiten: [],
  };
}

/** Fortschritt: 7 Häkchen + Angebots-Entscheidung + Arbeiten = 9 Schritte. */
export function fortschritt(c: Checkliste): { erledigt: number; gesamt: number } {
  let erledigt = 0;
  for (const s of CHECK_SCHRITTE) if (c.schritte[s.id]) erledigt++;
  if (c.angebotsEntscheid !== "offen") erledigt++;
  if (c.arbeitenErledigt) erledigt++;
  return { erledigt, gesamt: CHECK_SCHRITTE.length + 2 };
}
