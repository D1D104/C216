// Sobe a API real para os testes E2E com um banco SQLite descartável.
import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend");
const databasePath = join(tmpdir(), "c216-e2e.db").replaceAll("\\", "/");
const port = process.env.E2E_BACKEND_PORT ?? "8001";
const env = {
  ...process.env,
  DATABASE_URL: `sqlite:///${databasePath}`,
  CORS_ORIGINS: process.env.E2E_FRONTEND_ORIGIN ?? "http://127.0.0.1:5174",
};
const options = { cwd: backendDir, env, stdio: "inherit", shell: process.platform === "win32" };

rmSync(databasePath, { force: true });

const migration = spawnSync(
  "poetry",
  ["run", "python", "-m", "alembic", "upgrade", "head"],
  options,
);
if (migration.status !== 0) {
  process.exit(migration.status ?? 1);
}

const server = spawn(
  "poetry",
  [
    "run",
    "python",
    "-m",
    "uvicorn",
    "app.main:app",
    "--host",
    "127.0.0.1",
    "--port",
    port,
    "--app-dir",
    "src",
  ],
  options,
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
server.on("exit", (code) => {
  rmSync(databasePath, { force: true });
  process.exit(code ?? 0);
});
