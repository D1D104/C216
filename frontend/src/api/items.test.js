import { afterEach, describe, expect, it, vi } from "vitest";
import {
  API_URL,
  ApiError,
  createItem,
  deleteItem,
  fromApiItem,
  listItems,
  toApiPayload,
  updateItem,
} from "./items.js";

function mockFetch(status, body) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("item mapping", () => {
  it("converts a null description from the API into an empty string", () => {
    expect(fromApiItem({ id: 1, name: "Livro", description: null })).toEqual({
      id: 1,
      name: "Livro",
      description: "",
    });
  });

  it("sends an empty description as null and drops local-only fields", () => {
    expect(toApiPayload({ id: 3, name: "Livro", description: "" })).toEqual({
      name: "Livro",
      description: null,
    });
  });
});

describe("items API client", () => {
  it("lists items from the configured API URL", async () => {
    const fetchMock = mockFetch(200, [{ id: 1, name: "Livro", description: null }]);

    await expect(listItems()).resolves.toEqual([{ id: 1, name: "Livro", description: "" }]);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/items/`, expect.objectContaining({}));
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
  });

  it("creates an item with a JSON body", async () => {
    const fetchMock = mockFetch(201, { id: 7, name: "Mapa", description: "Antigo" });

    await expect(createItem({ name: "Mapa", description: "Antigo" })).resolves.toEqual({
      id: 7,
      name: "Mapa",
      description: "Antigo",
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/items/`);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ name: "Mapa", description: "Antigo" });
  });

  it("replaces an item with PUT", async () => {
    const fetchMock = mockFetch(200, { id: 7, name: "Atlas", description: null });

    await updateItem(7, { name: "Atlas", description: "" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/items/7`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ name: "Atlas", description: null });
  });

  it("deletes an item and accepts an empty 204 response", async () => {
    const fetchMock = mockFetch(204);

    await expect(deleteItem(7)).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/items/7`);
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });

  it.each([
    [404, /não foi encontrado/],
    [422, /não foram aceitos/],
    [500, /erro 500/],
  ])("turns HTTP %i into a readable ApiError", async (status, message) => {
    mockFetch(status, { detail: "erro" });

    const request = listItems();
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toThrow(message);
  });

  it("reports when the API cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(listItems()).rejects.toMatchObject({
      status: 0,
      message: expect.stringMatching(/Não foi possível conectar/),
    });
  });
});
