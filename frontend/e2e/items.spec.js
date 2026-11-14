import { expect, test } from "@playwright/test";

const apiURL = process.env.E2E_API_URL ?? "http://127.0.0.1:8001";

test.beforeEach(async ({ request }) => {
  const response = await request.get(`${apiURL}/items/`);
  for (const item of await response.json()) {
    await request.delete(`${apiURL}/items/${item.id}`);
  }
});

test("supports creating, editing, searching, validation, and deleting an item", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.getByText("Seu acervo começa agora")).toBeVisible();

  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByText("O nome precisa ter pelo menos 2 caracteres.")).toBeVisible();
  await page.getByLabel("Nome").fill("  Caderno de viagem  ");
  await page.getByLabel("Descrição").fill("  Lugares para conhecer no litoral  ");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByRole("heading", { name: "Caderno de viagem" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("foi adicionado");
  await expect(page.getByTestId("item-count")).toHaveText("01");

  const stored = await (await request.get(`${apiURL}/items/`)).json();
  expect(stored).toEqual([
    {
      id: expect.any(Number),
      name: "Caderno de viagem",
      description: "Lugares para conhecer no litoral",
    },
  ]);

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
  expect(await (await request.get(`${apiURL}/items/`)).json()).toEqual([]);
});

test("keeps items saved in the backend after reloading the page", async ({ page, request }) => {
  await request.post(`${apiURL}/items/`, { data: { name: "Criado pela API", description: null } });

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Criado pela API" })).toBeVisible();

  await page.getByLabel("Nome").fill("Criado pela tela");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("heading", { name: "Criado pela tela" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Criado pela API" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Criado pela tela" })).toBeVisible();
  await expect(page.getByTestId("item-count")).toHaveText("02");
});

test("explains when a search has no matches", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Seu acervo começa agora")).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar itens" }).fill("sem correspondência");
  await expect(page.getByText("Nenhum resultado por aqui")).toBeVisible();
});
