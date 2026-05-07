.PHONY: test lint validate-factory install-service install-web dev-service dev-web

test:
	cd apps/service && python -m pytest -q || true

lint:
	cd apps/service && ruff check . || true
	cd apps/web && npm run lint --silent || true

validate-factory:
	python scripts/validate_factory.py

install-service:
	cd apps/service && pip install -r requirements.txt

install-web:
	cd apps/web && npm install

dev-service:
	cd apps/service && uvicorn main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev
