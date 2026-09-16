import { describe, expect, it } from "vitest";
import {
  formatEuro,
  materialSumme,
  parseDezimal,
  rohertrag,
  stundenSumme,
} from "./geld";
import type { Baustelle } from "../model/types";

describe("parseDezimal", () => {
  it("versteht deutsches Komma und Punkt", () => {
    expect(parseDezimal("12,5")).toBe(12.5);
    expect(parseDezimal("12.5")).toBe(12.5);
    expect(parseDezimal("1 250,75")).toBe(1250.75);
    expect(parseDezimal("")).toBeUndefined();
    expect(parseDezimal("abc")).toBeUndefined();
  });
  it("versteht Tausendertrennzeichen", () => {
    expect(parseDezimal("13.100,50")).toBe(13100.5);
    expect(parseDezimal("12.500")).toBe(12500);
    expect(parseDezimal("1.250.000")).toBe(1250000);
    expect(parseDezimal("1,234.56")).toBe(1234.56);
  });
});

describe("Summen", () => {
  it("Materialsumme: Menge × Einzelpreis, fehlende Menge = 1", () => {
    expect(
      materialSumme([
        { id: "1", bezeichnung: "Ziegel", menge: 100, einzelpreis: 1.2 },
        { id: "2", bezeichnung: "Anfahrt", einzelpreis: 50 },
        { id: "3", bezeichnung: "ohne Preis", menge: 5 },
      ]),
    ).toBeCloseTo(170);
  });
  it("Stundensumme", () => {
    expect(
      stundenSumme([
        { id: "1", datum: "2026-09-01", stunden: 8, notiz: "" },
        { id: "2", datum: "2026-09-02", stunden: 6.5, notiz: "" },
        { id: "3", datum: "2026-09-03", notiz: "" },
      ]),
    ).toBe(14.5);
  });
});

describe("rohertrag", () => {
  const basis = {
    material: [{ id: "1", bezeichnung: "M", menge: 2, einzelpreis: 100 }],
  } as unknown as Baustelle;
  it("Umsatz minus Materialkosten", () => {
    expect(rohertrag({ ...basis, umsatz: 1000 } as Baustelle)).toBe(800);
  });
  it("ohne Umsatz undefined", () => {
    expect(rohertrag({ ...basis, umsatz: undefined } as Baustelle)).toBeUndefined();
  });
});

describe("formatEuro", () => {
  it("deutsches Format", () => {
    expect(formatEuro(1234.5)).toMatch(/1\.234,50/);
    expect(formatEuro(undefined)).toBe("–");
  });
});
