import type { Baustelle, FotoEintrag, Merker } from "../model/types";
import { blobZuDataUrl } from "./bild";
import * as db from "../store/db";

interface SicherungsDatei {
  formatVersion: 1;
  app: "baustellen";
  exportiertAm: string;
  baustellen: Baustelle[];
  merkliste?: Merker[];
  fotos: { id: string; baustelleId: string; jpegDataUrl: string }[];
}

export async function datenExportieren(): Promise<void> {
  const [baustellen, fotos, merkliste] = await Promise.all([
    db.alleBaustellen(),
    db.alleFotos(),
    db.alleMerker(),
  ]);
  const daten: SicherungsDatei = {
    formatVersion: 1,
    app: "baustellen",
    exportiertAm: new Date().toISOString(),
    baustellen,
    merkliste,
    fotos: await Promise.all(
      fotos.map(async (f) => ({
        id: f.id,
        baustelleId: f.baustelleId,
        jpegDataUrl: await blobZuDataUrl(f.blob),
      })),
    ),
  };
  const blob = new Blob([JSON.stringify(daten)], { type: "application/json" });
  const name = `baustellen-sicherung-${daten.exportiertAm.slice(0, 10)}.json`;
  const datei = new File([blob], name, { type: "application/json" });
  if (navigator.canShare?.({ files: [datei] })) {
    try {
      await navigator.share({ files: [datei], title: name });
      return;
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function dataUrlZuBlob(dataUrl: string): Blob {
  const [kopf, b64] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(kopf)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

export async function datenImportieren(datei: File): Promise<void> {
  const daten = JSON.parse(await datei.text()) as SicherungsDatei;
  if (daten.formatVersion !== 1 || !Array.isArray(daten.baustellen)) {
    throw new Error("Keine gültige Sicherungsdatei.");
  }
  const fotos: FotoEintrag[] = (daten.fotos ?? []).map((f) => ({
    id: f.id,
    baustelleId: f.baustelleId,
    blob: dataUrlZuBlob(f.jpegDataUrl),
  }));
  await db.ersetzeAlles({
    baustellen: daten.baustellen.map(db.migriere),
    fotos,
    merkliste: daten.merkliste ?? [],
  });
}
