import { useState } from "react";
import {
  merkerEinplanen,
  merkerHinzufuegen,
  merkerLoeschen,
  useAppZustand,
} from "../store/store";
import { geheZu } from "../ui/router";
import { GrosserKnopf, eingabeKlasse } from "../ui/bausteine";
import { formatDatumDe, heuteIso } from "../logic/kalender";

/** „Noch zu planen“: Baustellen kurz notieren, später richtig einplanen. */
export default function Merkliste() {
  const { merkliste } = useAppZustand();
  const [text, setText] = useState("");

  function hinzufuegen() {
    if (!text.trim()) return;
    void merkerHinzufuegen(text).then(() => setText(""));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-relaxed text-dezent">
        Hier schnell notieren, was noch ansteht – ohne Termin, ohne Details.
        Mit „Einplanen“ wird daraus später eine richtige Baustelle.
      </p>

      <div className="flex gap-2">
        <input
          className={eingabeKlasse + " flex-1"}
          placeholder="z. B. Dach Müller, Voerde – Rinne tropft"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") hinzufuegen();
          }}
        />
        <button
          type="button"
          aria-label="Notieren"
          className="min-h-12 min-w-14 rounded-lg bg-akzent text-[22px] font-bold text-white disabled:opacity-40"
          disabled={!text.trim()}
          onClick={hinzufuegen}
        >
          +
        </button>
      </div>

      {merkliste.length === 0 ? (
        <p className="py-8 text-center text-[15px] text-dezent">
          Nichts vorgemerkt – alles eingeplant. 👍
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {merkliste.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border-2 border-linie bg-flaeche p-3"
            >
              <div className="text-[16px] font-semibold leading-snug">
                {m.text}
              </div>
              <div className="mb-2 text-[13px] text-dezent">
                notiert am {formatDatumDe(m.notiertAm.slice(0, 10))}
              </div>
              <div className="flex gap-2">
                <GrosserKnopf
                  aufKlick={() => {
                    void merkerEinplanen(m.id, heuteIso()).then((b) => {
                      if (b) geheZu({ name: "baustelle", id: b.id });
                    });
                  }}
                >
                  📅 Einplanen
                </GrosserKnopf>
                <GrosserKnopf
                  art="gefahr"
                  aufKlick={() => {
                    if (window.confirm("Diese Notiz löschen?"))
                      void merkerLoeschen(m.id);
                  }}
                >
                  Löschen
                </GrosserKnopf>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[13px] text-dezent">
        „Einplanen“ legt die Baustelle mit dem heutigen Datum an – Beginn und
        Ende passt du danach direkt auf der Baustellen-Seite an.
      </p>
    </div>
  );
}
