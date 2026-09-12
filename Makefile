.PHONY: help install test lint format run clean docker-build docker-up docker-down docker-logs compose-config db-shell

BACKEND_DIR := backend
POETRY := cd $(BACKEND_DIR) && poetry
PYTEST := $(POETRY) run pytest
UVICORN := $(POETRY) run uvicorn
RUFF := $(POETRY) run ruff

help:
	@echo "Comandos disponíveis:"
	@echo "	 make install  - instala dependências"
	@echo "  make test     - executa testes"
	@echo "  make lint     - verifica o código"
	@echo "  make format   - formata o código"
	@echo "  make run      - inicia o servidor"
	@echo "  make clean    - remove arquivos temporários"
	@echo "  make docker-build - cria a imagem do backend"
	@echo "  make docker-up - inicia backend e banco de dados"
	@echo "  make docker-down - para os containers"
	@echo "  make docker-logs - acompanha os logs do backend"
	@echo "  make compose-config - valida a configuração do Compose"
	@echo "  make db-shell - abre o psql no banco"

install:
	$(POETRY) install

test:
	$(PYTEST)

lint:
	$(RUFF) check .

format:
	$(RUFF) format .


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

run:
	$(UVICORN) app.main:app --reload --app-dir src

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} 