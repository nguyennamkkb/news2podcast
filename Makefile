.PHONY: dev docker-up docker-down db-migrate install clean

dev:
	docker-compose up -d postgres redis minio
	@echo "Waiting for services..."
	@sleep 5
	cd backend && alembic upgrade head
	@echo "Starting all services..."
	concurrently "make dev-frontend" "make dev-backend" "make dev-remotion"

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-remotion:
	cd remotion && npm run dev

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

db-migrate:
	cd backend && alembic upgrade head

install:
	npm install
	cd frontend && npm install
	cd remotion && npm install
	cd backend && pip install -r requirements.txt

clean:
	rm -rf node_modules frontend/node_modules remotion/node_modules
	rm -rf temp/ output/