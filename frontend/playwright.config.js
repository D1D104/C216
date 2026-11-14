import { defineConfig, devices } from "@playwright/test";

// Portas próprias para não colidir com o ambiente de desenvolvimento ou o Compose.
const backendPort = process.env.E2E_BACKEND_PORT ?? "8001";
const frontendPort = process.env.E2E_FRONTEND_PORT ?? "5174";
const backendURL = `http://127.0.0.1:${backendPort}`;
const frontendURL = `http://127.0.0.1:${frontendPort}`;

process.env.E2E_API_URL = backendURL;

export default defineConfig({
  testDir: "./e2e",
  // Todos os testes compartilham o mesmo banco, então rodam em sequência.
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: frontendURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node e2e/start-backend.mjs",
      url: `${backendURL}/health`,
      env: {
        E2E_BACKEND_PORT: backendPort,
        E2E_FRONTEND_ORIGIN: frontendURL,
      },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      url: frontendURL,
      env: { VITE_API_URL: backendURL },
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
