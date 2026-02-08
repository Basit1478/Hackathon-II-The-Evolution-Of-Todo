# Quickstart: Enhanced Task Features & Event-Driven Architecture

## Prerequisites

- Docker Desktop (with Kubernetes enabled) or Minikube
- kubectl CLI
- Dapr CLI (`dapr init -k` after cluster is ready)
- Helm 3.x
- Node.js 18+ and Python 3.11+
- PostgreSQL (Neon or local)

## Local Development (Without Kubernetes)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Copy and configure environment
cp .env.docker .env
# Edit .env: DATABASE_URL, GROQ_API_KEY, etc.

# Run database migrations (after model changes)
alembic upgrade head

# Start backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Add new dependencies for date picker
npm install react-day-picker date-fns

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start frontend
npm run dev
```

### 3. Kafka (Local Docker for Development)

```bash
# Quick single-node Kafka with KRaft (no ZooKeeper)
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093 \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  bitnami/kafka:latest
```

### 4. Dapr (Standalone Mode for Local Dev)

```bash
# Initialize Dapr
dapr init

# Place component config
mkdir -p ~/.dapr/components
# Copy dapr/components/pubsub.yaml to ~/.dapr/components/

# Run backend with Dapr sidecar
dapr run --app-id taskmaster-backend --app-port 8000 \
  -- uvicorn app.main:app --port 8000
```

## Minikube Deployment

### 1. Start Cluster

```bash
minikube start --memory=4096 --cpus=4
eval $(minikube docker-env)  # Use Minikube's Docker daemon
```

### 2. Install Dapr

```bash
dapr init -k --wait
```

### 3. Install Kafka

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install kafka bitnami/kafka \
  --set kraft.enabled=true \
  --set controller.replicaCount=1 \
  --set listeners.client.protocol=PLAINTEXT
```

### 4. Deploy Dapr Components

```bash
kubectl apply -f dapr/components/pubsub.yaml
```

### 5. Build and Deploy Services

```bash
# Build images (using Minikube Docker)
docker build -t taskmaster-backend:latest ./backend
docker build -t taskmaster-frontend:latest ./frontend
docker build -t recurring-service:latest ./services/recurring-service
docker build -t notification-service:latest ./services/notification-service

# Deploy all services
kubectl apply -f k8s/
```

### 6. Access Services

```bash
minikube service taskmaster-frontend --url
minikube service taskmaster-backend --url
```

## Verify Features

### Task with Priority and Tags
```bash
curl -X POST http://localhost:8000/api/user1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy hotfix", "priority": "high", "tags": ["work", "urgent"]}'
```

### Task with Due Date and Recurring
```bash
curl -X POST http://localhost:8000/api/user1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Standup meeting", "priority": "medium", "due_date": "2026-02-08T09:00:00Z", "recurring": "daily"}'
```

### Search and Sort
```bash
curl "http://localhost:8000/api/user1/tasks?search=deploy&sort_by=priority&sort_order=desc"
```

### Filter by Tag
```bash
curl "http://localhost:8000/api/user1/tasks?tag=work"
```

## Verify Events (Kafka)

```bash
# Check topic exists
kubectl exec -it kafka-0 -- kafka-topics.sh --list --bootstrap-server localhost:9092

# Consume events
kubectl exec -it kafka-0 -- kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic task-events --from-beginning
```

## DigitalOcean DOKS Deployment

```bash
# 1. Create cluster
doctl kubernetes cluster create taskmaster --region nyc1 --size s-2vcpu-4gb --count 2

# 2. Configure kubectl
doctl kubernetes cluster kubeconfig save taskmaster

# 3. Install Dapr + Kafka (same as Minikube steps 2-4)

# 4. Push images to DOCR
doctl registry create taskmaster-registry
docker tag taskmaster-backend:latest registry.digitalocean.com/taskmaster-registry/backend:latest
docker push registry.digitalocean.com/taskmaster-registry/backend:latest
# Repeat for frontend, recurring-service, notification-service

# 5. Update k8s manifests with DOCR image paths and apply
kubectl apply -f k8s/
```
