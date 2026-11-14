import { vi } from "vitest";

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
  });
}

/**
 * Simula a API de itens em memória, com o mesmo contrato do backend FastAPI.
 */
export function createFakeApi(initialItems = []) {
  let nextId = initialItems.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
  const items = new Map(initialItems.map((item) => [item.id, { ...item }]));
  const state = { failNext: null };

  const fetchMock = vi.fn(async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url);
    const method = (init.method ?? "GET").toUpperCase();

    if (state.failNext) {
      const failure = state.failNext;
      state.failNext = null;
      if (failure === "network") {
        throw new TypeError("Failed to fetch");
      }
      return jsonResponse(failure, { detail: "Falha simulada" });
    }

    const body = init.body ? JSON.parse(init.body) : undefined;
    const match = url.pathname.match(/^\/items\/(\d+)?$/);
    if (!match) {
      return jsonResponse(404, { detail: "Not Found" });
    }
    const id = match[1] ? Number(match[1]) : null;

    if (id === null && method === "GET") {
      return jsonResponse(
        200,
        [...items.values()].sort((first, second) => first.id - second.id),
      );
    }
    if (id === null && method === "POST") {
      const item = { id: nextId++, name: body.name, description: body.description ?? null };
      items.set(item.id, item);
      return jsonResponse(201, item);
    }
    if (!items.has(id)) {
      return jsonResponse(404, { detail: "Item não encontrado" });
    }
    if (method === "PUT") {
      const item = { id, name: body.name, description: body.description ?? null };
      items.set(id, item);
      return jsonResponse(200, item);
    }
    if (method === "DELETE") {
      items.delete(id);
      return jsonResponse(204);
    }
    return jsonResponse(405, { detail: "Method Not Allowed" });
  });

  return {
    fetch: fetchMock,
    items,
    failNextRequest(failure) {
      state.failNext = failure;
    },
  };
}
