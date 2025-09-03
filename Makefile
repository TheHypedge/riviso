.PHONY: help install dev build test lint clean docker-up docker-down

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install
	cd services/audit-api && pip install -e .

dev: ## Start development servers
	docker-compose -f infra/docker-compose.yml up -d
	pnpm dev

build: ## Build all packages
	pnpm build

test: ## Run all tests
	pnpm test
	cd services/audit-api && python -m pytest

lint: ## Run linting
	pnpm lint
	cd services/audit-api && ruff check . && black --check .

format: ## Format code
	pnpm format
	cd services/audit-api && black . && ruff --fix .

clean: ## Clean build artifacts
	pnpm clean
	cd services/audit-api && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	cd services/audit-api && find . -type f -name "*.pyc" -delete 2>/dev/null || true

docker-up: ## Start local development infrastructure
	docker-compose -f infra/docker-compose.yml up -d

docker-down: ## Stop local development infrastructure
	docker-compose -f infra/docker-compose.yml down

migrate: ## Run database migrations
	cd services/audit-api && alembic upgrade head

migrate-create: ## Create new migration (usage: make migrate-create MESSAGE="description")
	cd services/audit-api && alembic revision --autogenerate -m "$(MESSAGE)"

type-check: ## Run type checking
	pnpm type-check
	cd services/audit-api && mypy .

