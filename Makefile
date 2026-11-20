.PHONY: help env install test lint format format-check check run db-upgrade db-migration db-current

BACKEND_DIR := backend
POETRY := cd $(BACKEND_DIR) && poetry

help:
	@echo "make env                 - cria o .env a partir do .env.example"
	@echo "make install             - instala as dependencias"
	@echo "make test                - executa os testes"
	@echo "make lint                - verifica o codigo com o Ruff"
	@echo "make format              - formata o codigo"
	@echo "make format-check        - verifica a formatacao"
	@echo "make check               - testes + lint + formatacao"
	@echo "make run                 - inicia a API em modo desenvolvimento"
	@echo "make db-upgrade          - aplica as migracoes"
	@echo "make db-migration msg=.. - gera uma migracao"
	@echo "make db-current          - mostra a revisao atual do banco"

env:
	@test -f .env || (cp .env.example .env && echo ".env criado")

install:
	$(POETRY) install

test:
	$(POETRY) run python -m pytest tests/unit tests/integration

lint:
	$(POETRY) run ruff check .

format:
	$(POETRY) run ruff format .

format-check:
	$(POETRY) run ruff format --check .

check: test lint format-check

run:
	$(POETRY) run uvicorn app.main:app --reload --app-dir src

db-upgrade:
	$(POETRY) run alembic upgrade head

db-migration:
	$(POETRY) run alembic revision --autogenerate -m "$(msg)"

db-current:
	$(POETRY) run alembic current