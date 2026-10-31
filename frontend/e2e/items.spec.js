import { expect, test } from "@playwright/test";

test("supports creating, editing, searching, validation, and deleting an item", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("O nome precisa ter pelo menos 2 caracteres.")).toBeVisible();
  await page.getByLabel("Nome").fill("  Caderno de viagem  ");
  await page.getByLabel("Descrição").fill("  Lugares para conhecer no litoral  ");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByRole("heading", { name: "Caderno de viagem" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("foi adicionado");
  await expect(page.getByTestId("item-count")).toHaveText("01");

  await page.getByRole("searchbox", { name: "Buscar itens" }).fill("cADERNO");
  await expect(page.getByRole("heading", { name: "Caderno de viagem" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar itens" }).fill("LITORAL");
  await expect(page.getByRole("heading", { name: "Caderno de viagem" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Buscar itens" }).clear();
  await page.getByRole("button", { name: "Editar Caderno de viagem" }).click();
  await page.getByLabel("Nome").fill("Caderno de destinos");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("heading", { name: "Caderno de destinos" })).toBeVisible();
  await expect(page.getByTestId("item-count")).toHaveText("01");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Excluir Caderno de destinos" }).click();
  await expect(page.getByText("Seu acervo começa agora")).toBeVisible();
  await expect(page.getByTestId("item-count")).toHaveText("00");
});

test("explains when a search has no matches", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Buscar itens" }).fill("sem correspondência");
  await expect(page.getByText("Nenhum resultado por aqui")).toBeVisible();
});
