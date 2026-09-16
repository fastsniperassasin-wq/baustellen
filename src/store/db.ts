import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Baustelle, FotoEintrag } from "../model/types";
import { AKTUELLE_SCHEMA_VERSION } from "../model/types";
import { leereCheckliste } from "../logic/checkliste";

interface BaustellenDb extends DBSchema {
  baustellen: { key: string; value: Baustelle };
  fotos: {
    key: string;
    value: FotoEintrag;
    indexes: { nachBaustelle: string };
  };
}

let dbPromise: Promise<IDBPDatabase<BaustellenDb>> | null = null;

function db(): Promise<IDBPDatabase<BaustellenDb>> {
  dbPromise ??= openDB<BaustellenDb>("baustellen-app", 1, {
    upgrade(d) {
      d.createObjectStore("baustellen", { keyPath: "id" });
      const fotos = d.createObjectStore("fotos", { keyPath: "id" });
      fotos.createIndex("nachBaustelle", "baustelleId");
    },
  });
  return dbPromise;
}

/** Migrationskette für ältere Schema-Versionen. */
type AlteBaustelle = Omit<Baustelle, "schemaVersion" | "checkliste"> & {
  schemaVersion: number;
  checkliste?: Baustelle["checkliste"];
};

export function migriere(b: Baustelle): Baustelle {
  let x: AlteBaustelle = b;
  if (x.schemaVersion === 1) {
    // Version 2: Ablauf-Checkliste ergänzt
    x = { ...x, schemaVersion: 2, checkliste: leereCheckliste() };
  }
  if (x.schemaVersion !== AKTUELLE_SCHEMA_VERSION || !x.checkliste) {
    throw new Error(`Unbekannte Schema-Version ${String(x.schemaVersion)}`);
  }
  return x as Baustelle;
}

export async function alleBaustellen(): Promise<Baustelle[]> {
  const alle = await (await db()).getAll("baustellen");
  return alle.map(migriere).sort((a, b) => b.beginn.localeCompare(a.beginn));
}

export async function speichereBaustelle(b: Baustelle): Promise<void> {
  await (await db()).put("baustellen", b);
}

export async function loescheBaustelle(id: string): Promise<void> {
  const d = await db();
  const tx = d.transaction(["baustellen", "fotos"], "readwrite");
  await tx.objectStore("baustellen").delete(id);
  const fotoStore = tx.objectStore("fotos");
  for (const key of await fotoStore.index("nachBaustelle").getAllKeys(id)) {
    await fotoStore.delete(key);
  }
  await tx.done;
}

export async function speichereFoto(f: FotoEintrag): Promise<void> {
  await (await db()).put("fotos", f);
}

export async function ladeFotosZuBaustelle(
  baustelleId: string,
): Promise<FotoEintrag[]> {
  return (await db()).getAllFromIndex("fotos", "nachBaustelle", baustelleId);
}

export async function loescheFoto(id: string): Promise<void> {
  await (await db()).delete("fotos", id);
}

export async function alleFotos(): Promise<FotoEintrag[]> {
  return (await db()).getAll("fotos");
}

export async function ersetzeAlles(daten: {
  baustellen: Baustelle[];
  fotos: FotoEintrag[];
}): Promise<void> {
  const d = await db();
  const tx = d.transaction(["baustellen", "fotos"], "readwrite");
  await tx.objectStore("baustellen").clear();
  await tx.objectStore("fotos").clear();
  for (const b of daten.baustellen) await tx.objectStore("baustellen").put(b);
  for (const f of daten.fotos) await tx.objectStore("fotos").put(f);
  await tx.done;
}
