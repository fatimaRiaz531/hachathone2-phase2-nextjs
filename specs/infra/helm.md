# Infrastructure: Helm Chart Specifications (Phase IV)

# Infrastructure: Helm Chart Specifications (Phase IV)

## 1. Chart Directory Structure

**Location**: `charts/todo-app/`

```
charts/todo-app/
├── Chart.yaml
├── values.yaml
├── README.md
└── templates/
    ├── NOTES.txt
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── deployment-backend.yaml
    ├── deployment-frontend.yaml
    ├── service-backend.yaml
    └── service-frontend.yaml
```

## 2. Chart.yaml - Chart Metadata

```yaml
apiVersion: v2
name: todo-app
description: Task Management Application with FastAPI backend and Next.js frontend
type: application
version: 1.0.0
appVersion: '1.0'
keywords:
  - todo
  - fastapi
  - nextjs
  - kubernetes
maintainers:
  - name: Development Team
    email: dev@example.com
```

## 3. values.yaml - Complete Configuration Schema

```yaml
# Chart configuration defaults
namespace: todos-app

# Global environment
global:
  environment: development

# Frontend service configuration
frontend:
  name: todos-frontend
  replicaCount: 2
  image:
    repository: todos-frontend
    tag: latest
    pullPolicy: Never # Local Minikube
  port: 3000
  service:
    type: LoadBalancer
    port: 80
    targetPort: 3000
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 200m
      memory: 512Mi
  readinessProbe:
    httpGet:
      path: /
      port: 3000
    initialDelaySeconds: 15
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

# Backend service configuration
backend:
  name: todos-backend
  replicaCount: 1
  image:
    repository: todos-backend
    tag: latest
    pullPolicy: Never # Local Minikube
  port: 8000
  service:
    type: ClusterIP
    port: 8000
    targetPort: 8000
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 500m
      memory: 1Gi
  readinessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 10
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  livenessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 30
    periodSeconds: 30
    timeoutSeconds: 5
    failureThreshold: 3

# ConfigMap: non-sensitive configuration
configMap:
  NEXT_PUBLIC_API_URL: http://todos-backend:8000
  LOG_LEVEL: INFO

# Secrets: sensitive configuration (set via helm install --set)
secrets:
  DATABASE_URL: null
  JWT_SECRET: null
```

## 4. namespace.yaml - Kubernetes Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: { { .Values.namespace } }
  labels:
    name: { { .Values.namespace } }
    app: todo-app
```

## 5. configmap.yaml - Non-Sensitive Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todos-config
  namespace: { { .Values.namespace } }
  labels:
    app: todo-app
data:
  NEXT_PUBLIC_API_URL: { { .Values.configMap.NEXT_PUBLIC_API_URL } }
  LOG_LEVEL: { { .Values.configMap.LOG_LEVEL } }
```

## 6. secret.yaml - Sensitive Configuration

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todos-secrets
  namespace: { { .Values.namespace } }
  labels:
    app: todo-app
type: Opaque
stringData:
  DATABASE_URL: { { .Values.secrets.DATABASE_URL | quote } }
  JWT_SECRET: { { .Values.secrets.JWT_SECRET | quote } }
```

## 7. deployment-backend.yaml - Backend Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.backend.name }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.backend.name }}
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.backend.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.backend.name }}
    spec:
      containers:
      - name: {{ .Values.backend.name }}
        image: {{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.backend.port }}
          protocol: TCP
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todos-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: todos-secrets
              key: JWT_SECRET
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: todos-config
              key: LOG_LEVEL
        resources:
          requests:
            cpu: {{ .Values.backend.resources.requests.cpu }}
            memory: {{ .Values.backend.resources.requests.memory }}
          limits:
            cpu: {{ .Values.backend.resources.limits.cpu }}
            memory: {{ .Values.backend.resources.limits.memory }}
        readinessProbe:
          httpGet:
            path: {{ .Values.backend.readinessProbe.httpGet.path }}
            port: {{ .Values.backend.readinessProbe.httpGet.port }}
          initialDelaySeconds: {{ .Values.backend.readinessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.backend.readinessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.backend.readinessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.backend.readinessProbe.failureThreshold }}
        livenessProbe:
          httpGet:
            path: {{ .Values.backend.livenessProbe.httpGet.path }}
            port: {{ .Values.backend.livenessProbe.httpGet.port }}
          initialDelaySeconds: {{ .Values.backend.livenessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.backend.livenessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.backend.livenessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.backend.livenessProbe.failureThreshold }}
        securityContext:
          runAsNonRoot: true
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
```

## 8. service-backend.yaml - Backend Service (ClusterIP)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: { { .Values.backend.name } }
  namespace: { { .Values.namespace } }
  labels:
    app: { { .Values.backend.name } }
spec:
  type: { { .Values.backend.service.type } }
  selector:
    app: { { .Values.backend.name } }
  ports:
    - protocol: TCP
      port: { { .Values.backend.service.port } }
      targetPort: { { .Values.backend.service.targetPort } }
      name: http
```

## 9. deployment-frontend.yaml - Frontend Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.frontend.name }}
  namespace: {{ .Values.namespace }}
  labels:
    app: {{ .Values.frontend.name }}
spec:
  replicas: {{ .Values.frontend.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.frontend.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.frontend.name }}
    spec:
      containers:
      - name: {{ .Values.frontend.name }}
        image: {{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}
        imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.frontend.port }}
          protocol: TCP
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: todos-config
              key: NEXT_PUBLIC_API_URL
        - name: NODE_ENV
          value: production
        resources:
          requests:
            cpu: {{ .Values.frontend.resources.requests.cpu }}
            memory: {{ .Values.frontend.resources.requests.memory }}
          limits:
            cpu: {{ .Values.frontend.resources.limits.cpu }}
            memory: {{ .Values.frontend.resources.limits.memory }}
        readinessProbe:
          httpGet:
            path: {{ .Values.frontend.readinessProbe.httpGet.path }}
            port: {{ .Values.frontend.readinessProbe.httpGet.port }}
          initialDelaySeconds: {{ .Values.frontend.readinessProbe.initialDelaySeconds }}
          periodSeconds: {{ .Values.frontend.readinessProbe.periodSeconds }}
          timeoutSeconds: {{ .Values.frontend.readinessProbe.timeoutSeconds }}
          failureThreshold: {{ .Values.frontend.readinessProbe.failureThreshold }}
        securityContext:
          runAsNonRoot: true
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
```

## 10. service-frontend.yaml - Frontend Service (LoadBalancer)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: { { .Values.frontend.name } }
  namespace: { { .Values.namespace } }
  labels:
    app: { { .Values.frontend.name } }
spec:
  type: { { .Values.frontend.service.type } }
  selector:
    app: { { .Values.frontend.name } }
  ports:
    - protocol: TCP
      port: { { .Values.frontend.service.port } }
      targetPort: { { .Values.frontend.service.targetPort } }
      name: http
```

## 11. Helm Commands

**Lint Chart:**

```bash
helm lint charts/todo-app
```

**Install Release:**

```bash
helm install todos-app charts/todo-app \
  --namespace todos-app \
  --set secrets.DATABASE_URL='postgresql://user:pass@host:5432/db' \
  --set secrets.JWT_SECRET='your-32-char-minimum-secret-key'
```

**Install (Dry-Run):**

```bash
helm install todos-app charts/todo-app \
  --namespace todos-app \
  --dry-run \
  --debug
```

**Verify Release:**

```bash
helm list -n todos-app
helm status todos-app -n todos-app
helm get values todos-app -n todos-app
```

**Upgrade Release:**

```bash
helm upgrade todos-app charts/todo-app \
  --namespace todos-app \
  --set frontend.replicaCount=3
```

**Rollback Release:**

```bash
helm rollback todos-app -n todos-app
```

## 12. Resource Specifications

**Frontend Pod:**

- Replicas: 2
- CPU Request: 100m, Limit: 200m
- Memory Request: 256Mi, Limit: 512Mi
- Service Type: LoadBalancer
- Port: 80 → 3000

**Backend Pod:**

- Replicas: 1
- CPU Request: 200m, Limit: 500m
- Memory Request: 512Mi, Limit: 1Gi
- Service Type: ClusterIP
- Port: 8000

## 13. Environment Variables

**Backend (from Secret):**

- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: JWT signing key (32+ chars)

**Backend (from ConfigMap):**

- LOG_LEVEL: INFO, DEBUG, etc.

**Frontend (from ConfigMap):**

- NEXT_PUBLIC_API_URL: http://todos-backend:8000
- NODE_ENV: production

## 14. Health Checks & Probes

**Backend Readiness:**

- Path: /health
- Interval: 10s
- Initial Delay: 10s
- Timeout: 5s
- Fail Threshold: 3

**Backend Liveness:**

- Path: /health
- Interval: 30s
- Initial Delay: 30s
- Timeout: 5s
- Fail Threshold: 3

**Frontend Readiness:**

- Path: /
- Interval: 10s
- Initial Delay: 15s
- Timeout: 5s
- Fail Threshold: 3

## X. OLD CONTENT (for reference)

- **Files**:
  - `Chart.yaml`: Metadata
  - `values.yaml`: Default configuration
  - `templates/`
    - `frontend-deployment.yaml`
    - `frontend-service.yaml`
    - `backend-deployment.yaml`
    - `backend-service.yaml`
    - `secret.yaml` (for API Keys and DB URL)
    - `configmap.yaml` (for non-sensitive config)

## 2. Configuration (`values.yaml`)

- **Image Repository**: Configurable (default to local tags).
- **Replicas**: Default to 1.
- **Services**:
  - Frontend: `NodePort` or `LoadBalancer`.
  - Backend: `ClusterIP`.
- **Resources**: CPU/Memory limits requests.

## 3. Deployment Logic

- Backend should start before Frontend (or Frontend handles wait).
- Secrets should be injected as Environment Variables.

## 4. Verification

- `helm lint .` passes.
- `helm install todo-app .` deploys all components.
