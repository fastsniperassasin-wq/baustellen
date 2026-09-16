import { describe, expect, it } from "vitest";
import {
  formatZeitraum,
  liegtImZeitraum,
  monatDanach,
  monatDavor,
  monatsRaster,
  tageImMonat,
} from "./kalender";

describe("monatsRaster", () => {
  it("liefert immer 42 Zellen mit Wochenstart Montag", () => {
    const r = monatsRaster(2026, 9, "2026-09-16");
    expect(r).toHaveLength(42);
    // 1. September 2026 ist ein Dienstag → Montag, 31.08. ist die erste Zelle
    expect(r[0].iso).toBe("2026-08-31");
    expect(r[0].imMonat).toBe(false);
    expect(r[1].iso).toBe("2026-09-01");
    expect(r[1].imMonat).toBe(true);
  });
  it("markiert heute", () => {
    const r = monatsRaster(2026, 9, "2026-09-16");
    const heute = r.find((z) => z.istHeute);
    expect(heute?.iso).toBe("2026-09-16");
  });
  it("Monat, der an einem Montag beginnt, startet mit dem 1.", () => {
    // Juni 2026 beginnt an einem Montag
    const r = monatsRaster(2026, 6, "2026-06-15");
    expect(r[0].iso).toBe("2026-06-01");
  });
  it("Schaltjahr-Februar hat 29 Tage", () => {
    expect(tageImMonat(2028, 2)).toBe(29);
    expect(tageImMonat(2026, 2)).toBe(28);
  });
});

describe("liegtImZeitraum", () => {
  const b = { beginn: "2026-09-10", ende: "2026-09-14" };
  it("einschließlich Anfang und Ende", () => {
    expect(liegtImZeitraum(b, "2026-09-10")).toBe(true);
    expect(liegtImZeitraum(b, "2026-09-12")).toBe(true);
    expect(liegtImZeitraum(b, "2026-09-14")).toBe(true);
    expect(liegtImZeitraum(b, "2026-09-09")).toBe(false);
    expect(liegtImZeitraum(b, "2026-09-15")).toBe(false);
  });
  it("ohne Ende zählt nur der Beginn", () => {
    expect(liegtImZeitraum({ beginn: "2026-09-10", ende: "" }, "2026-09-10")).toBe(true);
    expect(liegtImZeitraum({ beginn: "2026-09-10", ende: "" }, "2026-09-11")).toBe(false);
  });
  it("vertauschte Daten werden toleriert", () => {
    expect(
      liegtImZeitraum({ beginn: "2026-09-14", ende: "2026-09-10" }, "2026-09-12"),
    ).toBe(true);
  });
});

describe("Monatsnavigation", () => {
  it("über den Jahreswechsel", () => {
    expect(monatDavor(2026, 1)).toEqual([2025, 12]);
    expect(monatDanach(2026, 12)).toEqual([2027, 1]);
    expect(monatDanach(2026, 9)).toEqual([2026, 10]);
  });
});

describe("formatZeitraum", () => {
  it("eintägig und mehrtägig", () => {
    expect(formatZeitraum({ beginn: "2026-09-10", ende: "" })).toBe("10.09.2026");
    expect(formatZeitraum({ beginn: "2026-09-10", ende: "2026-09-14" })).toBe(
      "10.09.2026 – 14.09.2026",
    );
  });
});
