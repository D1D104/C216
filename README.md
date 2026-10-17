# C216-L1

Repositório da disciplina C216 (Sistemas Distribuídos)

## Testes do backend

Com o Poetry instalado, execute na raiz do repositório:

```bash
make install
make test
```

O comando `make test` executa todos os testes do backend com Pytest. Os testes
de serviço ficam em `backend/tests/unit/` e os testes HTTP com `TestClient` em
`backend/tests/integration/`; ambos são executados pelo CI.

## API de itens

A API oferece operações de criação, consulta, substituição, atualização parcial
e exclusão em `/items/`. A listagem aceita o parâmetro de consulta `name` para
filtrar itens pelo nome. Os itens são armazenados no PostgreSQL, com os modelos
ORM separados dos schemas Pydantic e acesso ao banco encapsulado no repository.

## Banco de dados e migrations

Copie `.env.example` para `.env` e inicie o PostgreSQL pelo Compose:

```bash
docker compose up -d db
```

Para executar a API e as migrations localmente, configure `DATABASE_URL` para
apontar para `localhost`. No PowerShell:

```powershell
$env:DATABASE_URL = "postgresql+psycopg://c216:c216@localhost:5432/c216"
make db-upgrade
make run
```

No Bash, use `export DATABASE_URL='postgresql+psycopg://c216:c216@localhost:5432/c216'`
antes dos mesmos comandos. A API usa uma sessão SQLAlchemy por requisição e
requer `DATABASE_URL`; no Compose, essa variável aponta automaticamente para o
serviço `db`. O Compose publica a porta do banco para conexões locais e mantém os
dados em um volume persistente.

O Alembic controla a estrutura do banco. Para gerar uma migration após alterar os
modelos, aplicá-la e conferir a revisão:

```bash
make db-migration msg="descricao da alteracao"
make db-upgrade
make db-current
```

Os testes usam um SQLite temporário isolado por teste. A cobertura de integração
inclui a persistência dos itens entre instâncias da API. A documentação
interativa fica disponível em `/docs` ao iniciar o backend com `make run`.
