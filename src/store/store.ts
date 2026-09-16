import { useSyncExternalStore } from "react";
import type { Baustelle } from "../model/types";
import * as db from "./db";

export interface AppZustand {
  geladen: boolean;
  baustellen: Baustelle[];
}

let zustand: AppZustand = { geladen: false, baustellen: [] };

const hoerer = new Set<() => void>();
const melde = () => {
  for (const h of hoerer) h();
};

function subscribe(cb: () => void): () => void {
  hoerer.add(cb);
  return () => hoerer.delete(cb);
}

export function useAppZustand(): AppZustand {
  return useSyncExternalStore(subscribe, () => zustand);
}

export async function ladeAlles(): Promise<void> {
  zustand = { geladen: true, baustellen: await db.alleBaustellen() };
  melde();
}

export function neueId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function neueBaustelle(beginnIso: string): Baustelle {
  const jetzt = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: neueId(),
    angelegtAm: jetzt,
    geaendertAm: jetzt,
    name: "",
    kunde: "",
    adresse: "",
    telefon: "",
    notizen: "",
    status: "geplant",
    beginn: beginnIso,
    ende: "",
    material: [],
    zeiten: [],
    fotoIds: [],
  };
}

/* ---------- Autosave (debounced) ---------- */

const wartend = new Map<string, ReturnType<typeof setTimeout>>();

function autosave(b: Baustelle): void {
  const alt = wartend.get(b.id);
  if (alt) clearTimeout(alt);
  wartend.set(
    b.id,
    setTimeout(() => {
      wartend.delete(b.id);
      void db.speichereBaustelle(b);
    }, 400),
  );
}

export function baustelle(id: string): Baustelle | undefined {
  return zustand.baustellen.find((b) => b.id === id);
}

export async function erstelleBaustelle(beginnIso: string): Promise<Baustelle> {
  const b = neueBaustelle(beginnIso);
  await db.speichereBaustelle(b);
  zustand = { ...zustand, baustellen: [b, ...zustand.baustellen] };
  melde();
  return b;
}

/** Einziger Schreibpfad für Änderungen (mit Autosave). */
export function aenderBaustelle(
  id: string,
  aenderung: (b: Baustelle) => Baustelle,
): void {
  const alt = zustand.baustellen.find((b) => b.id === id);
  if (!alt) return;
  const neu: Baustelle = {
    ...aenderung(structuredClone(alt)),
    id: alt.id,
    geaendertAm: new Date().toISOString(),
  };
  zustand = {
    ...zustand,
    baustellen: zustand.baustellen.map((b) => (b.id === id ? neu : b)),
  };
  melde();
  autosave(neu);
}

export async function loescheBaustelle(id: string): Promise<void> {
  await db.loescheBaustelle(id);
  zustand = {
    ...zustand,
    baustellen: zustand.baustellen.filter((b) => b.id !== id),
  };
  melde();
}
