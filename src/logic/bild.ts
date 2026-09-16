/** Maximale Kantenlänge für Baustellen-Fotos. */
export const MAX_KANTE = 1600;

export function zielMasse(
  breite: number,
  hoehe: number,
  maxKante: number = MAX_KANTE,
): { breite: number; hoehe: number } {
  if (breite <= 0 || hoehe <= 0) return { breite: 0, hoehe: 0 };
  const laengste = Math.max(breite, hoehe);
  if (laengste <= maxKante) return { breite, hoehe };
  const faktor = maxKante / laengste;
  return {
    breite: Math.round(breite * faktor),
    hoehe: Math.round(hoehe * faktor),
  };
}

/** Skaliert ein Foto im Browser herunter und liefert einen JPEG-Blob. */
export async function fotoVerkleinern(datei: Blob): Promise<Blob> {
  const url = URL.createObjectURL(datei);
  try {
    const bild = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error("Bild konnte nicht gelesen werden"));
      im.src = url;
    });
    const ziel = zielMasse(bild.naturalWidth, bild.naturalHeight);
    const cv = document.createElement("canvas");
    cv.width = ziel.breite;
    cv.height = ziel.hoehe;
    const ctx = cv.getContext("2d");
    if (!ctx) throw new Error("Canvas nicht verfügbar");
    ctx.drawImage(bild, 0, 0, ziel.breite, ziel.hoehe);
    const blob = await new Promise<Blob | null>((res) =>
      cv.toBlob(res, "image/jpeg", 0.8),
    );
    if (!blob) throw new Error("Foto konnte nicht verarbeitet werden");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobZuDataUrl(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(blob);
  });
}
