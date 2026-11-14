# C216 — Sistemas Distribuídos

Repositório da disciplina C216. O projeto contém uma API Python com PostgreSQL
e um frontend React independente para gerenciamento de itens.

## Requisitos

- Python e Poetry para o backend.
- Node.js 22 e npm para o frontend.
- Docker Compose e Docker para executar o PostgreSQL localmente.
- GNU Make para usar os comandos agregados da raiz.

## Executando tudo com Docker Compose

A aplicação roda em três containers: `frontend` (build do Vite servido pelo
Nginx), `backend` (FastAPI) e `db` (PostgreSQL).

```bash
make docker-up      # cria o .env a partir do .env.example, se necessário
```

| Serviço | Endereço |
| --- | --- |
| Frontend | `http://localhost:5173` |
| API e documentação | `http://localhost:8000` e `http://localhost:8000/docs` |
| PostgreSQL | `localhost:5432` |

Use `make docker-logs` para acompanhar os logs e `make docker-down` para parar
os containers. Os dados ficam no volume `postgres_data`.

### Variáveis de ambiente

| Variável | Uso |
| --- | --- |
| `FRONTEND_PORT` | Porta publicada do frontend |
| `VITE_API_URL` | Endereço da API acessado pelo navegador; embutido no build do frontend |
| `BACKEND_PORT` | Porta publicada da API |
| `CORS_ORIGINS` | Origens explícitas aceitas pela API, separadas por vírgula |
| `POSTGRES_*` / `DATABASE_URL` | Configuração do banco |

O CORS aceita apenas as origens listadas em `CORS_ORIGINS` (o padrão é
`http://localhost:5173,http://127.0.0.1:5173`); `*` é recusado na
inicialização. Ao trocar `FRONTEND_PORT` ou `BACKEND_PORT`, atualize também
`CORS_ORIGINS` e `VITE_API_URL` e recrie as imagens com `make docker-up`.

## Frontend — gerenciador de itens

O frontend fica em `frontend/` e consome a API em `/items/`: a listagem é
carregada ao abrir a página e criar, editar e excluir são enviados ao backend.
Os itens persistem no banco entre recarregamentos. Se a API estiver
indisponível, a página mostra o erro e um botão para tentar novamente.

Para desenvolver fora do Docker, inicie a API (seção Backend) e depois:

```bash
make install-frontend
make frontend-dev
```

O frontend usa `VITE_API_URL` para encontrar a API (padrão:
`http://localhost:8000`).

## Testes

Um único comando executa todos os testes do projeto:

```bash
make install
make playwright-install   # apenas na primeira vez
make test-all
```

| Camada | Local | Ferramenta |
| --- | --- | --- |
| Unitários do backend | `backend/tests/unit/` | pytest |
| Integração do backend (HTTP, CORS, persistência) | `backend/tests/integration/` | pytest + `TestClient` |
| Unitários do frontend (validação, cliente da API) | `frontend/src/utils/`, `frontend/src/api/` | Vitest |
| Integração do frontend (tela + API simulada) | `frontend/src/__tests__/` | Vitest + Testing Library |
| E2E (navegador + API real) | `frontend/e2e/` | Playwright |

Os testes E2E sobem automaticamente a API real (portas `8001` e `5174`, com um
SQLite temporário) e o frontend em modo desenvolvimento, então não dependem do
Docker nem alteram o banco do Compose. `make check` executa todos os testes e
também lint e formatação.

## Teste manual

1. Execute `make docker-up` e abra `http://localhost:5173`.
2. Tente adicionar um item sem nome e depois com um único caractere. Confirme
   que o formulário apresenta a validação e não cria o registro.
3. Adicione um item com espaços antes e depois do nome e da descrição. Confirme
   que os espaços são removidos e que o item aparece em
   `http://localhost:8000/items/`.
4. Pesquise parte do nome e uma palavra da descrição, com maiúsculas e
   minúsculas misturadas, e um termo inexistente.
5. Edite e exclua um item (aceitando e cancelando a confirmação).
6. Recarregue a página e confirme que os itens continuam lá.
7. Pare apenas a API com `docker compose stop backend`, recarregue a página e
   confira a mensagem de erro. Inicie-a com `docker compose start backend` e
   clique em "Tentar novamente".

Os limites são 2–80 caracteres para o nome e até 280 para a descrição, validados
no frontend e também na API.

## Backend

O backend oferece operações de criação, consulta, substituição, atualização
parcial e exclusão em `/items/`. A listagem aceita o parâmetro de consulta
`name` para filtrar itens pelo nome. Os itens são armazenados no PostgreSQL,
com os modelos ORM separados dos schemas Pydantic e acesso ao banco encapsulado
no repository.

Para instalar as dependências Python e executar os testes do backend:

```bash
make install-backend
make test-backend
```

### Banco de dados e migrations

Copie `.env.example` para `.env` e inicie o PostgreSQL pelo Compose:

```bash
docker compose up -d db
```

Configure `DATABASE_URL` para apontar para o banco local antes de aplicar as
migrations e iniciar a API. No PowerShell:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://c216:senha@localhost:5432/c216"
make db-upgrade
make run
```

No Bash, configure a mesma variável com `export DATABASE_URL='...'`. No Compose,
a variável é configurada para o serviço `db`. O Compose publica a porta do
banco para conexões locais e mantém os dados em um volume persistente.

O Alembic controla a estrutura do banco. Para gerar uma migration após alterar
os modelos, aplicá-la e conferir a revisão:

```bash
make db-migration msg="descricao da alteracao"
make db-upgrade
make db-current
```

Os testes do backend usam um SQLite temporário isolado por teste. A cobertura de
integração inclui a persistência dos itens entre instâncias da API. A
documentação interativa fica disponível em `/docs` ao iniciar o backend com
`make run`.

## Comandos da raiz

| Comando | Ação |
| --- | --- |
| `make install` | Instala dependências do backend e do frontend |
| `make test-all` | Executa todos os testes: backend, frontend e E2E |
| `make test` | Executa testes unitários/de integração do backend e frontend |
| `make test-e2e` | Executa os testes E2E (frontend + API real) |
| `make lint` | Executa Ruff e Biome |
| `make format` | Formata backend e frontend |
| `make format-check` | Verifica a formatação com Ruff e Biome |
| `make check` | Executa todos os testes, lint e verificações de formatação |
| `make docker-up` | Sobe frontend, backend e banco com o Compose |
| `make docker-down` | Para os containers |
| `make run` | Inicia a API do backend |
| `make frontend-dev` | Inicia o servidor de desenvolvimento frontend |
| `make frontend-build` | Gera o build de produção do frontend |

O CI possui três workflows executados em `push` e `pull_request`: backend
(Ruff e pytest), frontend (Biome, Vitest, build e E2E com a API real) e Compose
(sobe os três containers e verifica frontend, API e CORS).
