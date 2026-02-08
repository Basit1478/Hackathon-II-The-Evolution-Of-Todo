# Research: Enhanced Task Features & Event-Driven Architecture

**Feature**: 002-enhanced-task-features-event-driven
**Date**: 2026-02-07

## R1: PostgreSQL ARRAY Columns for Tags and Reminders

**Decision**: Use PostgreSQL `ARRAY` type via SQLAlchemy `ARRAY(String)` and `ARRAY(DateTime)` for `tags` and `reminders` fields respectively.

**Rationale**: PostgreSQL natively supports array columns with GIN indexing for efficient containment queries (`@>` operator). This avoids the complexity of separate join tables for a simple string/datetime list. SQLModel supports this via `sa_column=Column(ARRAY(String))`.

**Alternatives considered**:
- **JSON column**: More flexible but loses type safety and requires manual parsing. GIN index on JSON is possible but less performant for simple array containment.
- **Separate Tag table with M:N relationship**: Better normalization but over-engineered for user-scoped tags with no shared taxonomy. Adds join overhead for every task query.

## R2: Enum Storage for Priority and Recurring

**Decision**: Use PostgreSQL `VARCHAR` with Python `Enum` validation at the Pydantic/SQLModel layer. Store as string values ("high", "medium", "low" for priority; "daily", "weekly", "monthly" for recurring).

**Rationale**: String storage is simpler for migrations and debugging. Pydantic enum validation catches invalid values at the API boundary. SQLAlchemy `Enum` type requires DB-level type changes for new values which complicates migrations.

**Alternatives considered**:
- **PostgreSQL ENUM type**: Requires `ALTER TYPE` for changes, complicating schema evolution.
- **Integer mapping**: Compact but opaque; debugging requires lookup tables.

## R3: Dapr Pub/Sub with Kafka

**Decision**: Use Dapr's pub/sub building block with the Kafka component. Backend publishes events via Dapr HTTP API (`POST /v1.0/publish/{pubsubname}/{topic}`). Consumer services subscribe via Dapr subscription configuration.

**Rationale**: Dapr abstracts Kafka client complexity (connection pooling, serialization, retries) behind a simple HTTP API. Services remain transport-agnostic — swapping Kafka for Redis Streams or RabbitMQ requires only a component YAML change. Dapr sidecar handles mTLS between services.

**Alternatives considered**:
- **Direct kafka-python / aiokafka client**: Lower latency but tighter coupling. Each service needs Kafka connection config, SSL certs, and consumer group management.
- **Dapr with Redis Streams**: Simpler for dev but lacks Kafka's durability guarantees and partition-based scaling for production.

## R4: CloudEvents v1.0 Envelope Format

**Decision**: All events MUST use CloudEvents v1.0 spec. Dapr natively wraps published messages in CloudEvents format when content-type is `application/cloudevents+json`.

**Rationale**: CloudEvents is the CNCF standard for event metadata. Dapr uses it natively, so no custom envelope code is needed. Consumer services can rely on consistent `type`, `source`, `id`, `time`, and `data` fields.

**Event schema**:
```json
{
  "specversion": "1.0",
  "type": "tasks.created",
  "source": "/api/tasks",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": { "task_id": 1, "user_id": "abc", "title": "...", ... }
}
```

## R5: Recurring Service Architecture

**Decision**: Implement as a standalone FastAPI microservice subscribed to `task-events` topic. On `task-completed` events where `recurring != null`, it calls the main API's `POST /{user_id}/tasks` endpoint (via Dapr service invocation) to create the next task instance.

**Rationale**: Using Dapr service invocation for task creation means the recurring-service doesn't need direct DB access — it reuses the existing API. This keeps the service stateless and simple.

**Alternatives considered**:
- **Direct DB access from recurring-service**: Faster but duplicates task creation logic and bypasses API validation.
- **Cron job polling DB for completed recurring tasks**: Simpler but adds polling delay and doesn't leverage the event-driven architecture.

## R6: Notification Service Architecture

**Decision**: Implement as a standalone FastAPI microservice with a scheduled background task (60-second interval) that queries the main API for tasks with approaching reminders. When a reminder is due, it publishes a `reminder.due` event to a `reminder-events` topic. The main backend subscribes to this topic and inserts a system message into the user's conversation.

**Rationale**: Polling on a 60-second interval matches the SC-005 requirement (delivered within 60 seconds). Using the API for queries keeps the service stateless. Idempotency is achieved by tracking delivered reminder hashes in-memory (acceptable since missed reminders on restart are re-evaluated on recovery).

**Alternatives considered**:
- **Kafka Streams windowed aggregation**: Over-engineered for reminder checking. Adds KStreams dependency.
- **Database trigger + pg_notify**: Tight DB coupling, hard to scale, not portable.

## R7: Minikube + Dapr Local Development

**Decision**: Use Minikube with Dapr CLI (`dapr init -k`) for local development. Kafka runs as a Helm chart (Bitnami/kafka) in the Minikube cluster. All services have Dapr sidecar annotations.

**Rationale**: Minikube + Dapr closely mirrors the DOKS production environment. Dapr CLI simplifies sidecar injection and component deployment. Bitnami Kafka Helm chart provides a production-like single-broker setup with KRaft (no ZooKeeper).

**Setup sequence**:
1. `minikube start --memory=4096 --cpus=4`
2. `dapr init -k` (installs Dapr control plane)
3. `helm install kafka bitnami/kafka --set kraft.enabled=true`
4. `kubectl apply -f dapr/components/` (pub/sub config)
5. `kubectl apply -f k8s/` (all services)

## R8: DigitalOcean DOKS Production Deployment

**Decision**: Deploy to DOKS with Dapr installed via Helm. Kafka provisioned via Bitnami Helm chart (or DigitalOcean Managed Kafka if available). Container images pushed to DigitalOcean Container Registry (DOCR).

**Rationale**: DOKS is a managed Kubernetes service that handles control plane, node upgrades, and scaling. DOCR provides private container registry co-located with the cluster for fast pulls.

**CI/CD pipeline**:
1. GitHub Actions: build → test → push to DOCR
2. `doctl kubernetes cluster kubeconfig save`
3. `helm upgrade --install` for Kafka + Dapr + services

## R9: Frontend Calendar Picker

**Decision**: Use `react-day-picker` (lightweight, accessible, no heavy dependencies) with shadcn/ui Popover for the date picker component. For relative time display, use `date-fns` `formatDistanceToNow`.

**Rationale**: `react-day-picker` is the recommended calendar component in shadcn/ui ecosystem. `date-fns` is tree-shakeable and already a peer dependency of `react-day-picker`. No need for heavy libraries like moment.js.

**Alternatives considered**:
- **@radix-ui/react-calendar**: Does not exist as a Radix primitive.
- **react-datepicker**: Heavier, requires CSS import, less consistent with shadcn/ui style.

## R10: Search Implementation

**Decision**: Use PostgreSQL `ILIKE` for keyword search on `title` and `description` columns. For priority/tag filtering, use standard `WHERE` clauses with `ARRAY @>` operator for tags.

**Rationale**: `ILIKE` is simple and sufficient for the expected data volume (< 10K tasks per user). Full-text search (tsvector) is unnecessary at this scale and adds indexing complexity.

**Alternatives considered**:
- **PostgreSQL full-text search (tsvector/tsquery)**: More powerful but requires GIN index and tsvector column maintenance.
- **Elasticsearch**: Over-engineered for per-user task search.
