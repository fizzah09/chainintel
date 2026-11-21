FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e . 2>/dev/null || true

# Copy rest of the app
COPY . .

# Re-install in case pyproject.toml changed
RUN pip install --no-cache-dir -e .

# Create model_store directory (needed by config)
RUN mkdir -p model_store

EXPOSE 8000

CMD ["sh", "start.sh"]
