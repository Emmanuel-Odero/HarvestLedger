FROM python:3.12-slim

WORKDIR /app

# Install system dependencies including Java 17 for Hedera SDK
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    build-essential \
    libpq-dev \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME for Hedera SDK
ENV JAVA_HOME=/usr/lib/jvm/default-java

# Upgrade pip and install wheel
RUN pip install --upgrade pip setuptools wheel

# Copy requirements files
COPY requirements*.txt ./

# Try to install full requirements, fall back to minimal if needed
RUN pip install --no-cache-dir -r requirements.txt || \
    (echo "Full requirements failed, trying minimal..." && \
     pip install --no-cache-dir -r requirements-minimal.txt)

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]