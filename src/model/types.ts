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

export type AngebotsEntscheid = "offen" | "angenommen" | "abgelehnt";

export interface ArbeitsPosten {
  id: string;
  text: string;
  erledigt: boolean;
}

/** Ablauf-Checkliste einer Baustelle (Schritt-IDs siehe logic/checkliste.ts). */
export interface Checkliste {
  schritte: {
    besichtigung: boolean;
    angebot: boolean;
    material: boolean;
    werkzeuge: boolean;
    einrichtung: boolean;
    ausfuehrung: boolean;
    rechnung: boolean;
  };
  angebotsEntscheid: AngebotsEntscheid;
  arbeitenErledigt: boolean;
  arbeiten: ArbeitsPosten[]; // Auflistung aller getanen Arbeiten
}

export interface Baustelle {
  schemaVersion: 2;
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

  checkliste: Checkliste;
  material: MaterialPosten[];
  zeiten: ZeitEintrag[];
  fotoIds: string[];
}

export interface FotoEintrag {
  id: string;
  baustelleId: string;
  blob: Blob;
}

export const AKTUELLE_SCHEMA_VERSION = 2 as const;

export const STATUS_TEXT: Record<BaustellenStatus, string> = {
  geplant: "Geplant",
  laufend: "Laufend",
  abgeschlossen: "Abgeschlossen",
};
