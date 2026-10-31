import { describe, expect, it } from "vitest";
import { normalizeItem, searchItems, validateDescription, validateName } from "./items.js";

describe("validateName", () => {
  it("accepts a trimmed name between 2 and 80 characters", () => {
    expect(validateName("  Caderno  ")).toBe("");
    expect(validateName("a".repeat(80))).toBe("");
  });

  it.each(["", " ", "x"])("rejects a name that is too short: %j", (name) => {
    expect(validateName(name)).toMatch(/pelo menos 2/);
  });

  it("rejects a name longer than 80 characters", () => {
    expect(validateName("a".repeat(81))).toMatch(/no máximo 80/);
  });
});

describe("validateDescription", () => {
  it("allows an empty description and one with up to 280 characters", () => {
    expect(validateDescription("")).toBe("");
    expect(validateDescription("a".repeat(280))).toBe("");
  });

  it("rejects descriptions longer than 280 characters", () => {
    expect(validateDescription("a".repeat(281))).toMatch(/no máximo 280/);
  });
});

describe("normalizeItem", () => {
  it("trims leading and trailing spaces without changing the identifier", () => {
    expect(normalizeItem({ id: "fixed-id", name: "  Livro  ", description: "  Notas  " })).toEqual({
      id: "fixed-id",
      name: "Livro",
      description: "Notas",
    });
  });
});

describe("searchItems", () => {
  const items = [
    { id: "1", name: "Caderno Azul", description: "Ideias de viagem" },
    { id: "2", name: "Mapa", description: "lugares para visitar" },
  ];

  it("searches case-insensitively across name and description", () => {
    expect(searchItems(items, "CADERNO")).toEqual([items[0]]);
    expect(searchItems(items, "VIAGEM")).toEqual([items[0]]);
    expect(searchItems(items, "VISITAR")).toEqual([items[1]]);
  });

  it("returns all items for an empty or whitespace-only query", () => {
    expect(searchItems(items, "")).toEqual(items);
    expect(searchItems(items, "   ")).toEqual(items);
  });
});
