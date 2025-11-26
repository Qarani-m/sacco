.PHONY: help build up down restart logs shell db-shell clean seed dev prod tools

# Default target
help:
	@echo "SACCO Application - Docker Commands"
	@echo "===================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make up          - Start all services"
	@echo "  make dev         - Start in development mode (hot reload)"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make build       - Rebuild containers"
	@echo "  make logs        - View application logs"
	@echo "  make shell       - Open shell in app container"
	@echo "  make db-shell    - Open PostgreSQL shell"
	@echo "  make seed        - Seed database with test users"
	@echo "  make clean       - Stop and remove all containers and volumes"
	@echo "  make tools       - Start with pgAdmin"
	@echo "  make prod        - Start in production mode"
	@echo ""

# Start services in production mode
up:
	docker-compose up -d

# Start in development mode with hot reload
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start with database management tools
tools:
	docker-compose --profile tools up -d

# Production mode (same as up but explicit)
prod:
	docker-compose up -d --build

# Stop services
down:
	docker-compose down

# Restart services
restart:
	docker-compose restart

# Build/rebuild containers
build:
	docker-compose build --no-cache

# View application logs
logs:
	docker-compose logs -f app

# Open shell in application container
shell:
	docker-compose exec app sh

# Open PostgreSQL shell
db-shell:
	docker-compose exec postgres psql -U postgres -d sacco

# Seed database (opens browser)
seed:
	@echo "Opening browser to seed database..."
	@echo "Visit: http://localhost:3000/auth/seed"
	@(command -v xdg-open > /dev/null && xdg-open http://localhost:3000/auth/seed) || \
	(command -v open > /dev/null && open http://localhost:3000/auth/seed) || \
	echo "Please open http://localhost:3000/auth/seed in your browser"

# Clean everything (removes volumes!)
clean:
	@echo "WARNING: This will remove all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi local --remove-orphans; \
		echo "Cleanup complete!"; \
	fi

# Status of services
status:
	docker-compose ps

# Pull latest images
pull:
	docker-compose pull

# View disk usage
disk:
	@echo "Docker Disk Usage:"
	@docker system df
