.PHONY: setup dev build docker-up docker-down

setup:
	@echo "Installing monorepo dependencies..."
	npm install
	@echo "Setting up backend virtual environment..."
	python -m venv apps/api/venv
	. apps/api/venv/bin/activate && pip install -r apps/api/requirements.txt

dev:
	@echo "Starting development environment..."
	npx concurrently \
		"npm run dev --workspace=apps/web" \
		"cd apps/api && uvicorn main:app --reload --port 8000"

build:
	@echo "Building frontend and backend..."
	npm run build --workspace=apps/web

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down\n