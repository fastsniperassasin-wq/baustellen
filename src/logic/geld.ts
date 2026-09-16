import type { Baustelle, MaterialPosten, ZeitEintrag } from "../model/types";

/** Dezimal-Eingabe mit deutschem Komma/Tausenderpunkt tolerant wandeln. */
export function parseDezimal(text: string): number | undefined {
  let t = text.trim().replace(/\s/g, "");
  if (t === "") return undefined;
  const komma = t.lastIndexOf(",");
  const punkt = t.lastIndexOf(".");
  if (komma >= 0 && punkt >= 0) {
    // Beide vorhanden: das spätere Zeichen ist das Dezimaltrennzeichen
    t = komma > punkt ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if (komma >= 0) {
    t = t.replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) {
    // Nur Punkte im deutschen Tausendermuster (12.500 / 1.250.000)
    t = t.replace(/\./g, "");
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

export function materialSumme(material: MaterialPosten[]): number {
  return material.reduce(
    (summe, m) => summe + (m.menge ?? 1) * (m.einzelpreis ?? 0),
    0,
  );
}

export function stundenSumme(zeiten: ZeitEintrag[]): number {
  return zeiten.reduce((summe, z) => summe + (z.stunden ?? 0), 0);
}

/** Umsatz minus Materialkosten; undefined, solange kein Umsatz erfasst ist. */
export function rohertrag(b: Baustelle): number | undefined {
  if (b.umsatz === undefined) return undefined;
  return b.umsatz - materialSumme(b.material);
}

export function formatEuro(n: number | undefined): string {
  if (n === undefined) return "–";
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatZahl(n: number | undefined): string {
  if (n === undefined) return "";
  return n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
}
