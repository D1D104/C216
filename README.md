# C216 — Sistemas Distribuídos

Repositório da disciplina C216. O projeto contém uma API Python com PostgreSQL
e um frontend React independente para gerenciamento de itens.

## Requisitos

- Python e Poetry para o backend.
- Node.js 22 e npm para o frontend.
- Docker Compose e Docker para executar o PostgreSQL localmente.
- GNU Make para usar os comandos agregados da raiz.

## Frontend — gerenciador de itens

O frontend da Prática 6 fica em `frontend/`. Ele funciona sem iniciar a API ou o
banco: os registros são guardados apenas no estado React e reiniciam ao
recarregar a página.

Para instalar as dependências do frontend e iniciar o servidor de
desenvolvimento:

```bash
cd frontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite (por padrão, `http://localhost:5173`). Também
é possível iniciar o frontend a partir da raiz com `make frontend-dev`.

### Testes e verificações do frontend

Na raiz do repositório, os comandos `make test`, `make lint` e
`make format-check` incluem o frontend e o backend. Para executar apenas os
testes unitários e de integração do frontend:

```bash
cd frontend
npm test
```

Os testes E2E usam Playwright e Chromium. Instale o navegador uma vez e execute
a suíte:

```bash
make playwright-install
make test-e2e
```

Para verificar as duas aplicações de uma vez — testes unitários/de integração,
E2E, lint e formatação — execute `make check` depois de instalar as dependências
e o Chromium. O build do frontend pode ser verificado com `make frontend-build`.

## Teste manual do frontend

1. Inicie o frontend com `make frontend-dev` ou `cd frontend; npm run dev` e
   abra o endereço local do Vite.
2. Tente adicionar um item sem nome e depois com um único caractere. Confirme
   que o formulário apresenta a validação e não cria o registro.
3. Adicione um item usando espaços antes e depois do nome e da descrição.
   Confirme que os espaços externos são removidos, o item aparece na lista e os
   totais são atualizados.
4. Adicione outro item sem descrição e confira a contagem de itens e a contagem
   de itens com descrição.
5. Pesquise parte do nome usando outra combinação de maiúsculas/minúsculas.
   Limpe a busca e pesquise uma palavra que apareça somente na descrição.
   Pesquise também um termo inexistente e confirme o estado sem resultados.
6. Edite um item e salve. Confirme que o conteúdo é atualizado e que a
   contagem não aumenta.
7. Exclua um item e confirme a exclusão no diálogo. Repita e cancele a
   confirmação para verificar que o item permanece.
8. Recarregue a página e confirme que os registros foram reiniciados.

Os limites são 2–80 caracteres para o nome e até 280 caracteres para a
descrição. Não há integração entre este frontend e a API nesta prática.

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

Os testes de serviço ficam em `backend/tests/unit/` e os testes HTTP com
`TestClient` em `backend/tests/integration/`. `make test` executa estes testes e
também os testes unitários/de integração do frontend.

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
| `make test` | Executa testes unitários/de integração do backend e frontend |
| `make test-e2e` | Executa os testes E2E do frontend |
| `make lint` | Executa Ruff e Biome |
| `make format` | Formata backend e frontend |
| `make format-check` | Verifica a formatação com Ruff e Biome |
| `make check` | Executa testes, E2E, lint e verificações de formatação |
| `make run` | Inicia a API do backend |
| `make frontend-dev` | Inicia o servidor de desenvolvimento frontend |
| `make frontend-build` | Gera o build de produção do frontend |
| `make frontend-preview` | Serve localmente o build de produção |

O CI também possui workflows separados: backend e frontend executam suas
respectivas verificações em `push` e `pull_request`.
