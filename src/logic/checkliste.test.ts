import { describe, expect, it } from "vitest";
import { CHECK_SCHRITTE, fortschritt, leereCheckliste } from "./checkliste";
import { migriere } from "../store/db";
import type { Baustelle } from "../model/types";

describe("fortschritt", () => {
  it("leere Checkliste: 0 von 9", () => {
    expect(fortschritt(leereCheckliste())).toEqual({ erledigt: 0, gesamt: 9 });
  });
  it("zählt Häkchen, Angebots-Entscheidung und Arbeiten", () => {
    const c = leereCheckliste();
    c.schritte.besichtigung = true;
    c.schritte.angebot = true;
    c.angebotsEntscheid = "angenommen";
    c.arbeitenErledigt = true;
    expect(fortschritt(c)).toEqual({ erledigt: 4, gesamt: 9 });
  });
  it("alles erledigt: 9 von 9", () => {
    const c = leereCheckliste();
    for (const s of CHECK_SCHRITTE) c.schritte[s.id] = true;
    c.angebotsEntscheid = "abgelehnt";
    c.arbeitenErledigt = true;
    expect(fortschritt(c)).toEqual({ erledigt: 9, gesamt: 9 });
  });
});

describe("Migration v1 → v2", () => {
  it("ergänzt bestehende Baustellen um eine leere Checkliste", () => {
    const alt = {
      schemaVersion: 1,
      id: "x",
      angelegtAm: "a",
      geaendertAm: "g",
      name: "Test",
      kunde: "",
      adresse: "",
      telefon: "",
      notizen: "",
      status: "geplant",
      beginn: "2026-09-01",
      ende: "",
      material: [],
      zeiten: [],
      fotoIds: [],
    } as unknown as Baustelle;
    const neu = migriere(alt);
    expect(neu.schemaVersion).toBe(2);
    expect(neu.checkliste).toEqual(leereCheckliste());
    expect(neu.name).toBe("Test");
  });
  it("lehnt unbekannte Versionen ab", () => {
    expect(() =>
      migriere({ schemaVersion: 99 } as unknown as Baustelle),
    ).toThrow(/Schema-Version/);
  });
});
