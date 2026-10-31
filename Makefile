.PHONY: help install install-backend install-frontend test test-backend test-frontend test-e2e playwright-install lint lint-backend lint-frontend format format-check format-check-backend format-check-frontend check run frontend-dev frontend-build frontend-preview clean docker-build docker-up docker-down docker-logs compose-config db-shell db-upgrade db-migration db-current

BACKEND_DIR := backend
FRONTEND_DIR := frontend
POETRY := cd $(BACKEND_DIR) && poetry
PYTEST := $(POETRY) run python -m pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff
ALEMBIC := $(POETRY) run alembic
NPM := cd $(FRONTEND_DIR) && npm

help:
	@echo "Comandos disponíveis:"
	@echo "  make install           - instala dependências do backend e frontend"
	@echo "  make install-backend   - instala dependências Python com Poetry"
	@echo "  make install-frontend  - instala dependências Node com npm ci"
	@echo "  make test              - executa testes unitários/de integração de ambos"
	@echo "  make test-e2e          - executa testes E2E do frontend"
	@echo "  make playwright-install - instala o Chromium para os testes E2E"
	@echo "  make lint              - verifica backend e frontend"
	@echo "  make format            - formata backend e frontend"
	@echo "  make format-check      - verifica a formatação de ambos"
	@echo "  make check             - executa testes, E2E, lint e formatação"
	@echo "  make run               - inicia a API do backend"
	@echo "  make frontend-dev      - inicia o frontend em desenvolvimento"
	@echo "  make frontend-build    - gera o build de produção do frontend"
	@echo "  make frontend-preview  - serve o build de produção do frontend"
	@echo "  make clean             - remove caches Python"
	@echo "  make db-upgrade        - aplica migrations pendentes"
	@echo "  make db-migration msg=... - gera uma nova migration"
	@echo "  make db-current        - mostra a revisão atual do banco"
	@echo "  make docker-build      - cria a imagem do backend"
	@echo "  make docker-up         - inicia backend e banco de dados"
	@echo "  make docker-down       - para os containers"
	@echo "  make docker-logs       - acompanha os logs do backend"
	@echo "  make compose-config    - valida a configuração do Compose"
	@echo "  make db-shell          - abre o psql no banco"

install: install-backend install-frontend

install-backend:
	$(POETRY) install

install-frontend:
	$(NPM) ci

test: test-backend test-frontend

test-backend:
	$(PYTEST) tests/unit tests/integration

test-frontend:
	$(NPM) test

test-e2e:
	$(NPM) run test:e2e

playwright-install:
	$(NPM) exec -- playwright install chromium

lint: lint-backend lint-frontend

lint-backend:
	$(RUFF) check .

lint-frontend:
	$(NPM) run lint

format-check: format-check-backend format-check-frontend

format-check-backend:
	$(RUFF) format --check .

format-check-frontend:
	$(NPM) run format:check

check: test test-e2e lint format-check

format:
	$(RUFF) format .
	$(NPM) run format

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f backend

compose-config:
	docker compose config

db-shell:
	docker compose exec db psql -U c216 -d c216

db-upgrade:
	$(ALEMBIC) upgrade head

db-migration:
	$(ALEMBIC) revision --autogenerate -m "$(msg)"

db-current:
	$(ALEMBIC) current

run:
	$(UVICORN) app.main:app --reload --app-dir src

frontend-dev:
	$(NPM) run dev

frontend-build:
	$(NPM) run build

frontend-preview:
	$(NPM) run preview

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} 