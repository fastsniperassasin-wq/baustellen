export type BaustellenStatus = "geplant" | "laufend" | "abgeschlossen";

export interface MaterialPosten {
  id: string;
  bezeichnung: string;
  menge?: number;
  einzelpreis?: number; // Euro
}

export interface ZeitEintrag {
  id: string;
  datum: string; // ISO-Datum
  stunden?: number;
  notiz: string; // z. B. Mitarbeiter oder Tätigkeit
}

export interface Baustelle {
  schemaVersion: 1;
  id: string;
  angelegtAm: string; // ISO
  geaendertAm: string; // ISO

  name: string;
  kunde: string;
  adresse: string;
  telefon: string;
  notizen: string;
  status: BaustellenStatus;

  beginn: string; // ISO-Datum (Pflicht)
  ende: string; // ISO-Datum oder "" = eintägig

  angebotspreis?: number; // Euro
  umsatz?: number; // Euro

  material: MaterialPosten[];
  zeiten: ZeitEintrag[];
  fotoIds: string[];
}

export interface FotoEintrag {
  id: string;
  baustelleId: string;
  blob: Blob;
}

export const AKTUELLE_SCHEMA_VERSION = 1 as const;

export const STATUS_TEXT: Record<BaustellenStatus, string> = {
  geplant: "Geplant",
  laufend: "Laufend",
  abgeschlossen: "Abgeschlossen",
};
