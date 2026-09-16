import { useRef, useState } from "react";
import { ladeAlles } from "../store/store";
import { GrosserKnopf } from "../ui/bausteine";
import { datenExportieren, datenImportieren } from "../logic/sicherung";

export default function Sicherung() {
  const [meldung, setMeldung] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] leading-relaxed text-dezent">
        Alle Baustellen samt Fotos, Zeiten und Preisen liegen nur auf diesem
        Gerät. Sichere sie regelmäßig als Datei (z. B. per E-Mail an dich
        selbst) – beim Gerätewechsel spielst du die Sicherung einfach wieder
        ein.
      </p>
      <GrosserKnopf
        volleBreite
        aufKlick={() => {
          void datenExportieren().then(
            () => setMeldung("Sicherung erstellt ✓"),
            (e: unknown) => setMeldung("Fehler: " + String(e)),
          );
        }}
      >
        💾 Daten sichern
      </GrosserKnopf>
      <GrosserKnopf
        volleBreite
        art="sekundaer"
        aufKlick={() => importRef.current?.click()}
      >
        Sicherung einspielen
      </GrosserKnopf>
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          if (
            !window.confirm(
              "Sicherung einspielen? Alle vorhandenen Daten auf diesem Gerät werden ersetzt.",
            )
          )
            return;
          void datenImportieren(f)
            .then(async () => {
              await ladeAlles();
              setMeldung("Sicherung eingespielt ✓");
            })
            .catch((err: unknown) => setMeldung("Fehler: " + String(err)));
        }}
      />
      {meldung ? (
        <p className="text-center text-[15px] font-bold text-akzent">{meldung}</p>
      ) : null}
    </div>
  );
}
