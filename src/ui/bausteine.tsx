import { useEffect, useState, type ReactNode } from "react";
import type { BaustellenStatus } from "../model/types";
import { STATUS_TEXT } from "../model/types";
import { parseDezimal, formatZahl } from "../logic/geld";

export function Feld(props: {
  label: string;
  children: ReactNode;
  hinweis?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold uppercase tracking-wide text-dezent">
        {props.label}
      </span>
      {props.children}
      {props.hinweis ? (
        <span className="mt-1 block text-sm text-dezent">{props.hinweis}</span>
      ) : null}
    </label>
  );
}

export const eingabeKlasse =
  "w-full rounded-lg border-2 border-linie bg-flaeche px-3 py-3 text-[17px] " +
  "text-tinte focus:border-akzent focus:outline-none min-h-12";

export function TextEingabe(props: {
  wert: string;
  aufAenderung: (v: string) => void;
  platzhalter?: string;
  typ?: string;
}) {
  return (
    <input
      type={props.typ ?? "text"}
      className={eingabeKlasse}
      value={props.wert}
      placeholder={props.platzhalter}
      onChange={(e) => props.aufAenderung(e.target.value)}
    />
  );
}

/**
 * Zahleneingabe mit deutschem Komma. Hält den Text lokal und schreibt die
 * geparste Zahl in den Store; externer Wertwechsel setzt den Text neu.
 */
export function ZahlEingabe(props: {
  wert: number | undefined;
  aufAenderung: (n: number | undefined) => void;
  platzhalter?: string;
  suffix?: string;
  klein?: boolean;
}) {
  const [text, setText] = useState(formatZahl(props.wert));
  useEffect(() => {
    const extern = props.wert;
    const lokal = parseDezimal(text);
    if (extern !== lokal) setText(formatZahl(extern));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.wert]);
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        className={
          eingabeKlasse +
          (props.klein ? " px-2 py-2 text-[16px] min-h-11" : "") +
          (props.suffix ? " pr-10" : "")
        }
        value={text}
        placeholder={props.platzhalter}
        onChange={(e) => {
          setText(e.target.value);
          props.aufAenderung(parseDezimal(e.target.value));
        }}
      />
      {props.suffix ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[15px] text-dezent">
          {props.suffix}
        </span>
      ) : null}
    </div>
  );
}

export function GrosserKnopf(props: {
  children: ReactNode;
  aufKlick: () => void;
  art?: "primaer" | "sekundaer" | "gefahr";
  deaktiviert?: boolean;
  volleBreite?: boolean;
}) {
  const art = props.art ?? "primaer";
  const basis =
    "min-h-12 rounded-lg px-4 py-3 text-[16px] font-bold disabled:opacity-40 " +
    (props.volleBreite ? "w-full " : "");
  const farben =
    art === "primaer"
      ? "bg-akzent text-white active:bg-tinte"
      : art === "gefahr"
        ? "bg-flaeche text-fehler border-2 border-fehler"
        : "bg-flaeche text-tinte border-2 border-linie active:border-akzent";
  return (
    <button
      type="button"
      className={basis + farben}
      onClick={props.aufKlick}
      disabled={props.deaktiviert}
    >
      {props.children}
    </button>
  );
}

export const STATUS_FARBEN: Record<
  BaustellenStatus,
  { voll: string; weich: string }
> = {
  geplant: { voll: "bg-geplant text-white", weich: "bg-geplant-hell text-geplant" },
  laufend: { voll: "bg-akzent text-white", weich: "bg-akzent-hell text-akzent" },
  abgeschlossen: { voll: "bg-fertig text-white", weich: "bg-fertig-hell text-fertig" },
};

export function StatusChip(props: { status: BaustellenStatus }) {
  return (
    <span
      className={
        "inline-block rounded-full px-3 py-1 text-[13px] font-bold " +
        STATUS_FARBEN[props.status].weich
      }
    >
      {STATUS_TEXT[props.status]}
    </span>
  );
}
