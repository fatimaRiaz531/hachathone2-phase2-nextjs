# Phase IV: Local Kubernetes Deployment (Minikube + Helm)

## 1. Overview

Phase IV validates cloud-readiness by deploying the full Task Management Application stack (Next.js Frontend, FastAPI Backend, PostgreSQL) to a local Kubernetes cluster using Minikube and Helm Charts. This phase demonstrates Infrastructure as Code (IaC) principles aligned with Constitution.md governance (Spec-Driven Development, Security-First, Clean Architecture).

**Deployment Target**: Local Minikube cluster (simulating production Kubernetes environment)
**Orchestration Tool**: Helm 3.x
**Container Runtime**: Docker
**Database**: Neon PostgreSQL (external)
**Image Registry**: Local Docker daemon (Minikube-managed)

## 2. User Stories

### US 4.1: Container Image Preparation

**As a** Developer  
**I want to** build production-ready Docker images for Frontend and Backend  
**So that** the application can be deployed to any Kubernetes-compatible container runtime

**Acceptance Criteria:**

- Frontend Dockerfile uses multi-stage build (deps → builder → runner)
- Frontend build output includes .next/standalone and public directories
- Backend Dockerfile uses Python 3.13 slim base image
- Backend health check endpoint responds to `/health` (HTTP 200)
- Both Dockerfiles define .dockerignore to exclude unnecessary files
- Image size: Backend < 200MB, Frontend < 150MB
- No hardcoded secrets in images
- Non-root user execution enforced (uid 1000-65534 range)

### US 4.2: Minikube Environment Setup

**As a** Developer  
**I want to** configure and start a local Minikube cluster with necessary resources  
**So that** I can deploy and test the application in an isolated Kubernetes environment

**Acceptance Criteria:**

- Minikube cluster starts with --cpus=4 and --memory=4096 minimum
- Minikube Docker daemon is accessible for image building
- Ingress addon is enabled for traffic routing
- DNS resolution works for in-cluster service discovery (todos-backend.todos-app.svc.cluster.local)
- kubectl commands execute successfully against Minikube cluster context
- Cluster health verified (all nodes Ready, system pods Running)

### US 4.3: Helm Chart Deployment

**As a** Developer  
**I want to** deploy the entire application stack using a single Helm install command  
**So that** application deployment is repeatable and version-controlled

**Acceptance Criteria:**

- `helm lint charts/todo-app` passes without warnings
- `helm install todos-app charts/todo-app` completes without errors
- Release status shows: 2 Frontend replicas Running, 1 Backend pod Running
- ConfigMap contains NEXT_PUBLIC_API_URL pointing to backend service
- Secret contains DATABASE_URL with Neon connection string
- Helm values.yaml supports image tags, replicas, resource limits overrides
- `helm upgrade` successfully updates running deployment
- `helm rollback` reverts to previous release version

### US 4.4: Application Access & Connectivity

**As a** Developer  
**I want to** access the deployed application from host machine browser  
**So that** I can verify frontend and backend integration in Kubernetes environment

**Acceptance Criteria:**

- Frontend accessible via `minikube service todos-frontend` or kubectl port-forward
- Frontend loads without CORS errors when backend is unreachable
- Frontend makes authenticated requests to backend service via NEXT_PUBLIC_API_URL
- Backend `/health` endpoint returns 200 OK with response body: `{"status": "healthy"}`
- Backend `/api/v1/docs` (Swagger) accessible from port-forward
- Inter-pod communication verified: Frontend pod can resolve backend DNS and receive responses
- Service discovery works: Frontend DNS query for todos-backend resolves to ClusterIP

### US 4.5: Environment & Secret Management

**As a** Developer  
**I want to** manage sensitive configuration (DB credentials, API keys) as Kubernetes Secrets  
**So that** secrets are not exposed in version control or logs

**Acceptance Criteria:**

- DATABASE_URL stored in Secret, referenced by Backend pod via environment variable
- JWT_SECRET stored in Secret, referenced by Backend pod
- NEXT_PUBLIC_API_URL stored in ConfigMap (non-sensitive)
- Secrets passed to containers as environment variables (not mounted files)
- `kubectl get secrets -n todos-app` lists all application secrets
- `kubectl describe secret <secret-name> -n todos-app` does not expose secret values
- Migration: secrets updateable without pod restart (using secret rotation patterns)

### US 4.6: Verification & Health Checks

**As a** Developer  
**I want to** verify deployment health and application connectivity  
**So that** I can diagnose issues and confirm successful deployment

**Acceptance Criteria:**

- Deployment readiness probe checks `/health` endpoint (initial delay: 10s, timeout: 5s)
- Liveness probe restarts pod if backend unhealthy after 60s unresponsive
- Pod logs retrievable via `kubectl logs <pod-name> -n todos-app`
- Resource utilization observable via `kubectl top nodes` and `kubectl top pods`
- Events visible via `kubectl describe deployment <name> -n todos-app`
- kubectl-ai integration: `kubectl explain <resource>` returns documentation
- Deployment verification checklist completable in < 5 minutes

## 3. Deployment Architecture

### 3.1 Minikube Cluster Topology

```
┌─────────────────────────────────────────────────┐
│          Minikube Kubernetes Cluster             │
│                                                  │
│  Namespace: todos-app                            │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Deployment: todos-frontend               │   │
│  │ - Replicas: 2                            │   │
│  │ - Image: todos-frontend:latest           │   │
│  │ - Port: 3000                             │   │
│  │ - Resources: CPU 100m, Memory 256Mi       │   │
│  └──────────────────────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ Service: todos-frontend (LoadBalancer)   │   │
│  │ - Internal DNS: todos-frontend.todos-app │   │
│  │ - Port: 80 → 3000                        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Deployment: todos-backend                │   │
│  │ - Replicas: 1                            │   │
│  │ - Image: todos-backend:latest            │   │
│  │ - Port: 8000                             │   │
│  │ - Resources: CPU 200m, Memory 512Mi       │   │
│  └──────────────────────────────────────────┘   │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ Service: todos-backend (ClusterIP)       │   │
│  │ - Internal DNS: todos-backend.todos-app  │   │
│  │ - Port: 8000                             │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ ConfigMap: todos-config                  │   │
│  │ - NEXT_PUBLIC_API_URL                    │   │
│  │ - LOG_LEVEL                              │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Secret: todos-secrets                    │   │
│  │ - DATABASE_URL                           │   │
│  │ - JWT_SECRET                             │   │
│  │ - API_KEYS (if required)                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
        │
        │ (External Network)
        │
┌───────────────┐
│ Neon Database │
│ PostgreSQL    │
└───────────────┘
```

### 3.2 Pod Network Communication

Frontend Deployment (Replicas: 2):

- Pod 1: todos-frontend-xxxxxx-xxxxx
- Pod 2: todos-frontend-yyyyy-yyyyy

Backend Deployment (Replicas: 1):

- Pod 1: todos-backend-zzzzz-zzzz

**Internal DNS Resolution Flow:**

1. Frontend pods make HTTP requests to: `http://todos-backend:8000`
2. Kubernetes DNS resolves to ClusterIP: 10.x.x.x (todos-backend service)
3. Load balancing distributes traffic to backend pods
4. Backend pod responds with application data

### 3.3 External Access Methods

**Method 1: minikube service**

```bash
minikube service todos-frontend -n todos-app
```

Exposes frontend via NodePort on host machine

**Method 2: kubectl port-forward**

```bash
kubectl port-forward -n todos-app svc/todos-frontend 3000:80
```

Maps localhost:3000 to service:80

**Method 3: kubectl port-forward (backend)**

```bash
kubectl port-forward -n todos-app svc/todos-backend 8000:8000
```

Maps localhost:8000 to service:8000 for API testing

## 4. Deployment Workflow

### 4.1 Prerequisites

**System Requirements:**

- Docker installed and running (recommended: Docker Desktop with Kubernetes disabled)
- Minikube installed (version 1.30+): `minikube --version`
- kubectl installed (version 1.26+): `kubectl version --client`
- Helm 3.x installed: `helm version`
- Git repository cloned locally
- Neon PostgreSQL database credentials available

**Environment Setup:**

```bash
# Verify all tools
docker --version
minikube version
kubectl version --client
helm version

# Start fresh (optional)
minikube delete
minikube start --cpus=4 --memory=4096 --driver=docker
```

### 4.2 Step 1: Build Docker Images

**Command Sequence:**

```bash
# Point kubectl to Minikube context
kubectl config use-context minikube

# Configure shell to use Minikube Docker daemon
eval $(minikube docker-env)

# Verify Docker daemon connection
docker ps

# Build backend image
cd backend
docker build -f ../Dockerfile.backend -t todos-backend:latest .
docker images | grep todos-backend

# Build frontend image
cd ../frontend
docker build -f ../Dockerfile.frontend -t todos-frontend:latest .
docker images | grep todos-frontend
```

**Verification:**

```bash
# Both images present
docker images | grep todos

# Image inspection
docker inspect todos-backend:latest
docker inspect todos-frontend:latest
```

### 4.3 Step 2: Create Namespace & Secrets

**Command Sequence:**

```bash
# Create namespace
kubectl create namespace todos-app

# Create database secret
kubectl create secret generic todos-secrets \
  --from-literal=DATABASE_URL='postgresql://user:password@host:5432/dbname' \
  --from-literal=JWT_SECRET='your-jwt-secret-key-min-32-chars' \
  -n todos-app

# Create ConfigMap for non-sensitive config
kubectl create configmap todos-config \
  --from-literal=NEXT_PUBLIC_API_URL='http://todos-backend:8000' \
  --from-literal=LOG_LEVEL='INFO' \
  -n todos-app

# Verify
kubectl get secrets -n todos-app
kubectl get configmaps -n todos-app
```

### 4.4 Step 3: Deploy via Helm

**Command Sequence:**

```bash
# Lint chart for syntax errors
helm lint charts/todo-app

# Install release (dry-run first for verification)
helm install todos-app charts/todo-app \
  --namespace todos-app \
  --dry-run \
  --values charts/todo-app/values.yaml

# Install actual release
helm install todos-app charts/todo-app \
  --namespace todos-app \
  --values charts/todo-app/values.yaml

# Verify installation
helm list -n todos-app
helm get values todos-app -n todos-app
helm get manifest todos-app -n todos-app | head -50
```

### 4.5 Step 4: Monitor Pod Startup

**Command Sequence:**

```bash
# Watch pod creation and readiness
kubectl get pods -n todos-app -w

# Example expected output:
# NAME                             READY   STATUS    RESTARTS   AGE
# todos-frontend-7d8c8b5c4d        1/1     Running   0          30s
# todos-frontend-8f9g9c6d5e        1/1     Running   0          25s
# todos-backend-4k5l6m7n8o         1/1     Running   0          35s

# Wait for all pods to be Ready (Ctrl+C to exit watch)

# Describe pod details for troubleshooting
kubectl describe pod todos-backend-4k5l6m7n8o -n todos-app

# View pod logs
kubectl logs -n todos-app todos-backend-4k5l6m7n8o
kubectl logs -n todos-app todos-frontend-7d8c8b5c4d
```

### 4.6 Step 5: Verify Pod Connectivity

**Command Sequence:**

```bash
# Test backend health from frontend pod
kubectl exec -it -n todos-app todos-frontend-7d8c8b5c4d -- \
  wget -O- http://todos-backend:8000/health

# Expected output: {"status": "healthy"}

# Test backend health from host
kubectl port-forward -n todos-app svc/todos-backend 8000:8000 &
curl http://localhost:8000/health
kill %1

# Check service endpoints
kubectl get endpoints -n todos-app todos-backend
```

### 4.7 Step 6: Access Application from Browser

**Command Sequence:**

```bash
# Option A: Using minikube service (opens browser automatically)
minikube service todos-frontend -n todos-app

# Option B: Using port-forward (manual access)
kubectl port-forward -n todos-app svc/todos-frontend 3000:80

# Then open: http://localhost:3000 in browser

# Option C: Get NodePort and access via Minikube IP
kubectl get svc todos-frontend -n todos-app
minikube ip
# Access: http://<MINIKUBE_IP>:<NODEPORT>
```

### 4.8 Step 7: Deployment Verification Checklist

**Complete Verification Suite:**

```bash
#!/bin/bash
# Verification script

echo "=== Cluster Status ==="
kubectl cluster-info
kubectl get nodes

echo "=== Namespace ==="
kubectl get ns | grep todos-app

echo "=== Deployments ==="
kubectl get deployments -n todos-app
kubectl get deployment todos-frontend -n todos-app -o yaml | grep replicas

echo "=== Pods Status ==="
kubectl get pods -n todos-app
kubectl get pods -n todos-app -o wide

echo "=== Services ==="
kubectl get svc -n todos-app
kubectl get endpoints -n todos-app

echo "=== ConfigMaps & Secrets ==="
kubectl get configmaps -n todos-app
kubectl get secrets -n todos-app

echo "=== Helm Release ==="
helm list -n todos-app
helm status todos-app -n todos-app

echo "=== Backend Health Check ==="
kubectl port-forward -n todos-app svc/todos-backend 8000:8000 &
PF_PID=$!
sleep 2
curl -s http://localhost:8000/health
kill $PF_PID 2>/dev/null

echo "=== Frontend Connectivity Test ==="
kubectl exec -n todos-app -it $(kubectl get pods -n todos-app -l app=todos-frontend -o jsonpath='{.items[0].metadata.name}') -- \
  wget -O- -q http://todos-backend:8000/health

echo "=== Pod Resource Usage ==="
kubectl top nodes
kubectl top pods -n todos-app

echo "=== Recent Events ==="
kubectl get events -n todos-app --sort-by='.lastTimestamp' | tail -10

echo "=== Verification Complete ==="
```

## 5. Kubernetes Resource Specifications

### 5.1 Pod Resource Requests & Limits

**Frontend Pod:**

```
Requests:
  CPU: 100m (0.1 cores)
  Memory: 256Mi

Limits:
  CPU: 200m (0.2 cores)
  Memory: 512Mi
```

**Backend Pod:**

```
Requests:
  CPU: 200m (0.2 cores)
  Memory: 512Mi

Limits:
  CPU: 500m (0.5 cores)
  Memory: 1Gi
```

**Total Minikube Minimum Requirements:**

- CPUs: 4 cores (to host all pods + system pods)
- Memory: 4Gi (distributed across deployments)

### 5.2 Probe Configurations

**Backend Readiness Probe:**

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3
```

**Backend Liveness Probe:**

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 30
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3
```

**Frontend Readiness Probe:**

```yaml
readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3
```

## 6. kubectl-ai Integration

### 6.1 kubectl Plugin Enhancement

**Usage Patterns:**

Query resource documentation:

```bash
kubectl explain deployment.spec.template.spec.containers
kubectl explain service.spec
kubectl explain configmap
```

Get AI-assisted diagnostics:

```bash
kubectl describe pod todos-backend-xxxx -n todos-app
# Review output for error indicators, then use kubectl explain for clarification

kubectl get events -n todos-app
# Review events for pod failures, image pull errors, etc.
```

### 6.2 Troubleshooting Workflow

```bash
# 1. Check pod status
kubectl get pods -n todos-app

# 2. If pod is Pending or ImagePullBackOff:
kubectl describe pod <pod-name> -n todos-app
# Look for Events section for detailed error messages

# 3. Get resource definition
kubectl explain deployment.spec.containers
# Understand expected structure of container specs

# 4. View logs for application errors
kubectl logs <pod-name> -n todos-app --tail=50

# 5. Check resource limits
kubectl top pods -n todos-app
# Compare with resource requests/limits defined in spec

# 6. Validate chart before deployment
helm lint charts/todo-app
# Identifies YAML syntax issues early
```

## 7. Verification Steps & Acceptance Criteria

### 7.1 Pods Running Verification

**Command:**

```bash
kubectl get pods -n todos-app -o wide
```

**Success Criteria:**

```
NAME                            READY   STATUS    RESTARTS   AGE   IP          NODE
todos-frontend-5c8d7f9b2a      1/1     Running   0          5m    10.244.0.x  minikube
todos-frontend-9k3l5m7n8p      1/1     Running   0          5m    10.244.0.y  minikube
todos-backend-4d6e8f9a1b       1/1     Running   0          5m    10.244.0.z  minikube
```

Expected:

- All pods show STATUS: Running
- All pods show READY: 1/1
- RESTARTS: 0 (no crashes)
- AGE: consistent (started around same time)

### 7.2 Services Ready Verification

**Command:**

```bash
kubectl get svc -n todos-app
```

**Success Criteria:**

```
NAME              TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)        AGE
todos-frontend    LoadBalancer 10.x.x.x    <pending>     80:30xxx/TCP   5m
todos-backend     ClusterIP    10.x.x.y    <none>        8000/TCP       5m
```

Expected:

- todos-frontend: LoadBalancer type (or NodePort for Minikube)
- todos-backend: ClusterIP type
- All ports routing correctly (80 for frontend, 8000 for backend)

### 7.3 Health Check Verification

**Command:**

```bash
kubectl port-forward -n todos-app svc/todos-backend 8000:8000 &
sleep 2
curl -v http://localhost:8000/health
kill %1
```

**Success Response:**

```
HTTP/1.1 200 OK
content-type: application/json
content-length: 23

{"status":"healthy"}
```

### 7.4 DNS Resolution Verification

**Command:**

```bash
kubectl exec -it -n todos-app <frontend-pod-name> -- sh
```

Inside pod:

```bash
nslookup todos-backend
# or
wget -O- http://todos-backend:8000/health
```

**Expected Output:**

```
Name: todos-backend
Address: 10.x.x.x (ClusterIP)

HTTP/1.1 200 OK
{"status":"healthy"}
```

### 7.5 Frontend Access Verification

**Command:**

```bash
minikube service todos-frontend -n todos-app
# Browser opens to frontend

# OR manually:
kubectl port-forward -n todos-app svc/todos-frontend 3000:80
# Open http://localhost:3000 in browser
```

**Success Criteria:**

- Page loads without errors
- Browser console shows no CORS errors
- Frontend can communicate with backend (network requests succeed)
- DOM renders correctly (not blank or error page)

### 7.6 Helm Release Verification

**Command:**

```bash
helm status todos-app -n todos-app
```

**Expected Output:**

```
NAME: todos-app
LAST DEPLOYED: 2026-02-08 ...
NAMESPACE: todos-app
STATUS: deployed
REVISION: 1

NOTES:
[release notes from chart]
```

### 7.7 Config & Secrets Verification

**Command:**

```bash
kubectl get configmaps -n todos-app -o yaml
kubectl get secrets -n todos-app -o yaml
```

**Expected:**

- todos-config ConfigMap contains NEXT_PUBLIC_API_URL and LOG_LEVEL
- todos-secrets Secret contains DATABASE_URL and JWT_SECRET (encrypted in etcd)
- No secrets logged to stdout
- Environment variables mounted correctly in pods

## 8. Rollback & Upgrade Procedures

### 8.1 Helm Upgrade Workflow

**Scenario: Update backend image to new version**

```bash
# 1. Update values
helm upgrade todos-app charts/todo-app \
  --namespace todos-app \
  --set image.backend.tag=v1.1.0 \
  --values charts/todo-app/values.yaml

# 2. Monitor rollout
kubectl rollout status deployment/todos-backend -n todos-app

# 3. Verify new pods
kubectl get pods -n todos-app

# 4. Check logs
kubectl logs -n todos-app -l app=todos-backend --tail=20
```

### 8.2 Rollback Workflow

**Scenario: New version has issues, revert to previous release**

```bash
# 1. Get release history
helm history todos-app -n todos-app

# 2. Rollback to previous
helm rollback todos-app 1 -n todos-app

# 3. Verify rollback
kubectl rollout status deployment/todos-backend -n todos-app

# 4. Confirm functionality
curl http://localhost:8000/health
```

### 8.3 Manual Patch Workflow

**Scenario: Update ConfigMap value without full Helm upgrade**

```bash
# 1. Edit ConfigMap
kubectl edit configmap todos-config -n todos-app
# Edit NEXT_PUBLIC_API_URL value in editor

# 2. Restart pods to pick up new config
kubectl rollout restart deployment/todos-frontend -n todos-app

# 3. Verify pods restarted
kubectl get pods -n todos-app -w
```

## 9. Cleanup Procedures

### 9.1 Complete Uninstall

```bash
# 1. Delete Helm release
helm uninstall todos-app -n todos-app

# 2. Delete namespace (removes all resources within)
kubectl delete namespace todos-app

# 3. Verify cleanup
kubectl get ns
kubectl get pods -n todos-app  # Should show "No resources found"

# 4. Stop Minikube (optional)
minikube stop

# 5. Delete Minikube cluster (full cleanup)
minikube delete
```

### 9.2 Partial Cleanup (Keep Release, Remove Pods)

```bash
# Scale deployments to 0 (pause without deleting)
kubectl scale deployment todos-frontend --replicas=0 -n todos-app
kubectl scale deployment todos-backend --replicas=0 -n todos-app

# Scale back when ready
kubectl scale deployment todos-frontend --replicas=2 -n todos-app
kubectl scale deployment todos-backend --replicas=1 -n todos-app
```

## 10. Security Specifications (Constitution.md Alignment)

### 10.1 Secret Management

- All sensitive data stored in Kubernetes Secrets, never in ConfigMaps
- Secrets mounted as environment variables, not files
- JWT_SECRET minimum 32 characters, cryptographically secure
- DATABASE_URL connections use encrypted TLS channels
- Secrets rotation implementable without pod restarts

### 10.2 Pod Security

- Non-root user execution (runAsNonRoot: true)
- Read-only root filesystem where possible (readOnlyRootFilesystem: true)
- Network policies restrict inter-pod communication if needed
- Service account tokens use minimal permissions

### 10.3 Image Security

- Images scanned for vulnerabilities in build process
- Base images updated regularly (python:3.13, node:18+)
- Multi-stage builds minimize attack surface
- .dockerignore excludes sensitive files

## 11. Monitoring & Observability

### 11.1 Pod Logs Access

```bash
# Current container logs
kubectl logs <pod-name> -n todos-app

# Last 50 lines
kubectl logs <pod-name> -n todos-app --tail=50

# Follow logs (tail -f equivalent)
kubectl logs <pod-name> -n todos-app -f

# All containers in pod
kubectl logs <pod-name> -n todos-app --all-containers

# Previous container logs (if pod restarted)
kubectl logs <pod-name> -n todos-app --previous
```

### 11.2 Resource Monitoring

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -n todos-app

# Detailed pod metrics
kubectl describe pod <pod-name> -n todos-app
# Shows Requests, Limits, Current usage
```

### 11.3 Event Tracking

```bash
# All events in namespace
kubectl get events -n todos-app --sort-by='.lastTimestamp'

# Events for specific pod
kubectl describe pod <pod-name> -n todos-app | grep -A 20 "Events:"

# Watch real-time events
kubectl get events -n todos-app -w
```
