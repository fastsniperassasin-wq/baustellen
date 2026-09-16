/** Kalenderlogik – reine Funktionen, per Vitest getestet. */

export interface MonatsTag {
  iso: string; // JJJJ-MM-TT
  tag: number; // 1..31
  imMonat: boolean;
  istHeute: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function isoVon(jahr: number, monat: number, tag: number): string {
  return `${jahr}-${pad(monat)}-${pad(tag)}`;
}

export function heuteIso(): string {
  const d = new Date();
  return isoVon(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** Wochentag 0=Montag … 6=Sonntag (deutscher Wochenstart). */
function wochentagMo(jahr: number, monat: number, tag: number): number {
  return (new Date(Date.UTC(jahr, monat - 1, tag)).getUTCDay() + 6) % 7;
}

export function tageImMonat(jahr: number, monat: number): number {
  return new Date(Date.UTC(jahr, monat, 0)).getUTCDate();
}

/**
 * 6 Wochen × 7 Tage rund um den Monat (Wochenstart Montag), damit das
 * Raster immer gleich hoch ist und Nachbartage sichtbar bleiben.
 */
export function monatsRaster(
  jahr: number,
  monat: number,
  heute: string = heuteIso(),
): MonatsTag[] {
  const erster = wochentagMo(jahr, monat, 1);
  const zellen: MonatsTag[] = [];
  const start = new Date(Date.UTC(jahr, monat - 1, 1 - erster));
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = isoVon(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    zellen.push({
      iso,
      tag: d.getUTCDate(),
      imMonat: d.getUTCMonth() + 1 === monat && d.getUTCFullYear() === jahr,
      istHeute: iso === heute,
    });
  }
  return zellen;
}

export const MONATSNAMEN = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export const WOCHENTAGE_KURZ = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Liegt der Tag im Zeitraum der Baustelle? Ohne Ende zählt nur der Beginn. */
export function liegtImZeitraum(
  b: { beginn: string; ende: string },
  iso: string,
): boolean {
  if (!b.beginn) return false;
  const ende = b.ende || b.beginn;
  const [von, bis] = b.beginn <= ende ? [b.beginn, ende] : [ende, b.beginn];
  return von <= iso && iso <= bis;
}

export function monatDavor(jahr: number, monat: number): [number, number] {
  return monat === 1 ? [jahr - 1, 12] : [jahr, monat - 1];
}

export function monatDanach(jahr: number, monat: number): [number, number] {
  return monat === 12 ? [jahr + 1, 1] : [jahr, monat + 1];
}

export function formatDatumDe(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

export function formatZeitraum(b: { beginn: string; ende: string }): string {
  if (!b.beginn) return "ohne Termin";
  if (!b.ende || b.ende === b.beginn) return formatDatumDe(b.beginn);
  return `${formatDatumDe(b.beginn)} – ${formatDatumDe(b.ende)}`;
}
