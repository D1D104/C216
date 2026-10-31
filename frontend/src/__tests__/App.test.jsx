import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.jsx";

describe("item manager integration", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("validates the name and trims fields when creating an item", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    expect(screen.getByText("O nome precisa ter pelo menos 2 caracteres.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Nome/), "  Caderno azul  ");
    await user.type(screen.getByLabelText(/Descrição/), "  Ideias de viagem  ");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    expect(screen.getByRole("heading", { name: "Caderno azul" })).toBeInTheDocument();
    expect(screen.getByText("Ideias de viagem")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("foi adicionado");
    expect(screen.getByTestId("item-count")).toHaveTextContent("01");
    expect(screen.getByTestId("described-count")).toHaveTextContent("01");
  });

  it("edits an item while keeping it as a single record", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/Nome/), "Livro");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    await user.click(screen.getByRole("button", { name: "Editar Livro" }));
    await user.clear(screen.getByLabelText(/Nome/));
    await user.type(screen.getByLabelText(/Nome/), "Livro revisado");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(screen.getByRole("heading", { name: "Livro revisado" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Livro", exact: true })).not.toBeInTheDocument();
    expect(screen.getByTestId("item-count")).toHaveTextContent("01");
    expect(screen.getByRole("status")).toHaveTextContent("foi atualizado");
  });

  it("confirms deletion and removes only the selected item", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/Nome/), "Item A");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    await user.type(screen.getByLabelText(/Nome/), "Item B");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    await user.click(screen.getByRole("button", { name: "Excluir Item B" }));
    expect(window.confirm).toHaveBeenCalledWith("Tem certeza que deseja excluir “Item B”?");
    expect(screen.queryByRole("heading", { name: "Item B" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Item A" })).toBeInTheDocument();
    expect(screen.getByTestId("item-count")).toHaveTextContent("01");
  });

  it("filters by name and description and shows an empty search state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/Nome/), "Caderno");
    await user.type(screen.getByLabelText(/Descrição/), "Notas sobre botânica");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    await user.type(screen.getByLabelText(/Nome/), "Atlas");
    await user.type(screen.getByLabelText(/Descrição/), "Mapas antigos");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

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
    const user = userEvent.setup();
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<App />);
    await user.type(screen.getByLabelText(/Nome/), "Registro");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    await user.click(screen.getByRole("button", { name: "Excluir Registro" }));

    expect(screen.getByRole("heading", { name: "Registro" })).toBeInTheDocument();
  });
});
