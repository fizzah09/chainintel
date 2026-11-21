#!/bin/sh
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Seeding database..."
python scripts/seed_db.py || echo "Seed skipped (already seeded or error)"

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
