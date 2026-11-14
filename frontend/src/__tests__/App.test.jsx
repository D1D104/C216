import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.jsx";
import { createFakeApi } from "../test/fakeApi.js";

let api;

async function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  await waitFor(() => expect(screen.queryByText("Carregando itens...")).not.toBeInTheDocument());
  return user;
}

async function addItem(user, name, description = "") {
  await user.type(screen.getByLabelText(/Nome/), name);
  if (description) {
    await user.type(screen.getByLabelText(/Descrição/), description);
  }
  await user.click(screen.getByRole("button", { name: "Adicionar item" }));
  await screen.findByRole("heading", { name: name.trim() });
}

function requestsWith(method) {
  return api.fetch.mock.calls.filter(([, init = {}]) => (init.method ?? "GET") === method);
}

describe("item manager integration", () => {
  beforeEach(() => {
    api = createFakeApi();
    vi.stubGlobal("fetch", api.fetch);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads the items stored in the API, newest first", async () => {
    api = createFakeApi([
      { id: 1, name: "Atlas", description: null },
      { id: 2, name: "Caderno", description: "Capa azul" },
    ]);
    vi.stubGlobal("fetch", api.fetch);
    await renderApp();

    const headings = within(screen.getByRole("list", { name: "Itens cadastrados" }))
      .getAllByRole("heading")
      .map((heading) => heading.textContent);
    expect(headings).toEqual(["Caderno", "Atlas"]);
    expect(screen.getByTestId("item-count")).toHaveTextContent("02");
    expect(screen.getByTestId("described-count")).toHaveTextContent("01");
    expect(screen.getByText("Sem descrição")).toBeInTheDocument();
  });

  it("validates the name and sends trimmed fields when creating an item", async () => {
    const user = await renderApp();

    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    expect(screen.getByText("O nome precisa ter pelo menos 2 caracteres.")).toBeInTheDocument();
    expect(requestsWith("POST")).toHaveLength(0);

    await addItem(user, "  Caderno azul  ", "  Ideias de viagem  ");

    expect(screen.getByText("Ideias de viagem")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("foi adicionado");
    expect(screen.getByTestId("item-count")).toHaveTextContent("01");
    expect(screen.getByTestId("described-count")).toHaveTextContent("01");
    expect(JSON.parse(requestsWith("POST")[0][1].body)).toEqual({
      name: "Caderno azul",
      description: "Ideias de viagem",
    });
    expect([...api.items.values()]).toEqual([
      { id: 1, name: "Caderno azul", description: "Ideias de viagem" },
    ]);
  });

  it("edits an item through the API while keeping it as a single record", async () => {
    const user = await renderApp();
    await addItem(user, "Livro");
    await user.click(screen.getByRole("button", { name: "Editar Livro" }));
    await user.clear(screen.getByLabelText(/Nome/));
    await user.type(screen.getByLabelText(/Nome/), "Livro revisado");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("heading", { name: "Livro revisado" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Livro", exact: true })).not.toBeInTheDocument();
    expect(screen.getByTestId("item-count")).toHaveTextContent("01");
    expect(screen.getByRole("status")).toHaveTextContent("foi atualizado");
    expect(requestsWith("PUT")[0][0]).toMatch(/\/items\/1$/);
    expect(api.items.get(1).name).toBe("Livro revisado");
  });

  it("confirms deletion and removes only the selected item", async () => {
    const user = await renderApp();
    await addItem(user, "Item A");
    await addItem(user, "Item B");

    await user.click(screen.getByRole("button", { name: "Excluir Item B" }));
    expect(window.confirm).toHaveBeenCalledWith("Tem certeza que deseja excluir “Item B”?");
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Item B" })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Item A" })).toBeInTheDocument();
    expect(screen.getByTestId("item-count")).toHaveTextContent("01");
    expect([...api.items.keys()]).toEqual([1]);
  });

  it("filters by name and description and shows an empty search state", async () => {
    const user = await renderApp();
    await addItem(user, "Caderno", "Notas sobre botânica");
    await addItem(user, "Atlas", "Mapas antigos");

    const search = screen.getByRole("searchbox", { name: "Buscar itens" });
    await user.type(search, "BOTÂNICA");
    expect(screen.getByRole("heading", { name: "Caderno" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Atlas" })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "nada encontrado");
    expect(screen.getByText("Nenhum resultado por aqui")).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Resumo do acervo")).getByTestId("item-count"),
    ).toHaveTextContent("02");
  });

  it("keeps an item when deletion is cancelled", async () => {
    const user = await renderApp();
    vi.mocked(window.confirm).mockReturnValue(false);
    await addItem(user, "Registro");
    await user.click(screen.getByRole("button", { name: "Excluir Registro" }));

    expect(screen.getByRole("heading", { name: "Registro" })).toBeInTheDocument();
    expect(requestsWith("DELETE")).toHaveLength(0);
  });

  it("shows an error and retries when the API is unavailable", async () => {
    api.failNextRequest("network");
    const user = await renderApp();

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conectar à API");
    expect(screen.getByRole("button", { name: "Adicionar item" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByText("Seu acervo começa agora")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar item" })).toBeEnabled();
  });

  it("keeps the form filled when saving fails", async () => {
    const user = await renderApp();
    api.failNextRequest(500);

    await user.type(screen.getByLabelText(/Nome/), "Caderno");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("erro 500");
    expect(screen.getByLabelText(/Nome/)).toHaveValue("Caderno");
    expect(screen.getByTestId("item-count")).toHaveTextContent("00");
  });

  it("keeps the item listed when the API rejects its deletion", async () => {
    const user = await renderApp();
    await addItem(user, "Registro");
    api.failNextRequest(404);

    await user.click(screen.getByRole("button", { name: "Excluir Registro" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("não foi encontrado");
    expect(screen.getByRole("heading", { name: "Registro" })).toBeInTheDocument();
  });
});
