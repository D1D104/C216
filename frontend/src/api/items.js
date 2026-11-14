const DEFAULT_API_URL = "http://localhost:8000";

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function fromApiItem(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
  };
}

export function toApiPayload({ name, description }) {
  return {
    name,
    description: description ? description : null,
  };
}

function describeError(status, body) {
  if (status === 404) {
    return "O item não foi encontrado. Ele pode ter sido excluído.";
  }
  if (status === 422) {
    return "Os dados enviados não foram aceitos pela API.";
  }
  if (status < 500 && typeof body?.detail === "string") {
    return body.detail;
  }
  return `A API respondeu com erro ${status}.`;
}

async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Não foi possível conectar à API. Verifique se o backend está ativo.", 0);
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(describeError(response.status, data), response.status);
  }
  return data;
}

export async function listItems() {
  const items = await request("/items/");
  return items.map(fromApiItem);
}

export async function createItem(item) {
  return fromApiItem(await request("/items/", { method: "POST", body: toApiPayload(item) }));
}

export async function updateItem(id, item) {
  return fromApiItem(await request(`/items/${id}`, { method: "PUT", body: toApiPayload(item) }));
}

export async function deleteItem(id) {
  await request(`/items/${id}`, { method: "DELETE" });
}
