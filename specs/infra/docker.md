# Infrastructure: Docker Specifications (Phase IV)

## 1. Overview

Docker containerization specifications for Task Management Application (Next.js Frontend + FastAPI Backend). Production-ready specifications with security-first approach per Constitution.md.

**Container Runtime**: Docker (Kubernetes-compatible)
**Base Images**: python:3.13-slim (backend), node:18-alpine (frontend)
**Image Sizes**: Backend <200MB, Frontend <150MB

## 2. Backend Container Specification (FastAPI)

### 2.1 Dockerfile.backend - Production Multi-Stage Build

```dockerfile
# Stage 1: Builder
FROM python:3.13-slim AS builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# Stage 2: Runtime
FROM python:3.13-slim
LABEL maintainer="your-org" version="1.0" description="FastAPI Todo Backend"
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/app PORT=8000
RUN groupadd -r appuser && useradd -r -g appuser appuser
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH
COPY backend/ /app/
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.2 Backend Health Check

Add to `backend/main.py`:

```python
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}
```

### 2.3 Backend .dockerignore

```
__pycache__/ *.py[cod] .Python env/ venv/ build/ dist/
.env .env.local *.log node_modules/ .next/ .git .vscode/ .idea/
tests/ test_*.py *_test.py *.md README.md coverage/ .pytest_cache/
```

## 3. Frontend Container Specification (Next.js)

### 3.1 Dockerfile.frontend - Production Multi-Stage Build

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1
CMD ["node", "server.js"]
```

### 3.2 Frontend next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  telemetry: false,
  compress: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],
};

export default nextConfig;
```

### 3.3 Frontend .dockerignore

```
node_modules/ npm-debug.log .next/ out/ build/ dist/
.env .env.local .git .gitignore .vscode/ .idea/
tests/ coverage/ *.md README.md .github/ .cache/
```

## 4. Docker Build Commands

**Backend:**

```bash
docker build -f Dockerfile.backend -t todos-backend:latest -t todos-backend:v1.0.0 .
```

**Frontend:**

```bash
docker build -f Dockerfile.frontend -t todos-frontend:latest -t todos-frontend:v1.0.0 .
```

## 5. Docker Compose (Local Development)

```yaml
version: '3.9'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - '8000:8000'
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8000/health']
      interval: 30s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - '3000:3000'
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--quiet',
          '--tries=1',
          '--spider',
          'http://localhost:3000',
        ]
      interval: 30s
      timeout: 5s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todos
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  default:
    name: todos-network
```

## 6. Image Verification

```bash
# Inspect metadata
docker inspect todos-backend:latest
docker inspect -f '{{.Config.User}}' todos-backend:latest
docker inspect -f '{{json .Config.Healthcheck}}' todos-backend:latest

# Image size
docker images todos-backend:latest

# History
docker history todos-backend:latest
```

## 7. Kubernetes Integration

**Image Pull Policy:**

- **Minikube**: `imagePullPolicy: Never` (local images)
- **Production**: `imagePullPolicy: IfNotPresent` (registry)

**Usage in Helm:**

```yaml
image:
  repository: todos-backend
  tag: latest
  pullPolicy: Never
```

## 8. Security Specifications

**User Execution**: Non-root user (appuser/nextjs)
**Secrets**: Injected as environment variables, never in build args
**Base Images**: Official slim/alpine distributions, regularly updated
**Health Checks**: HEALTHCHECK instruction for container orchestration
**Private Registry**: ImagePullSecret for authenticated registries

## X. OLD CONTENT (for reference)

- **Working Directory**: `/app`
- **Dependencies**: Install from `requirements.txt`
- **Optimization**: Use multi-stage build if necessary to reduce size (e.g., compile deps in builder).
- **Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Expose**: Port 8000

## 2. Frontend Container

- **Base Image**: `node:18-alpine` or `node:20-alpine`
- **Working Directory**: `/app`
- **Build Strategy**: Multi-stage build
  1.  **Deps**: Install dependencies (`npm ci`).
  2.  **Builder**: Copy source and run `npm run build`.
  3.  **Runner**: Production image, copy `.next/standalone` and `public`.
- **Environment**: passing `NEXT_PUBLIC_API_URL` at build/runtime.
- **Command**: `node server.js`
- **Expose**: Port 3000

## 3. Best Practices

- `.dockerignore` to exclude `node_modules`, `venv`, `.git`.
- Non-root user execution where possible.
