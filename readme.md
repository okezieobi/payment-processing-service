# Payment Processing Microservice

A production-grade, asynchronous payment processing microservice built with **Node.js (v22)**, **TypeScript**, and **Express**. Designed with database-first architecture principles, strict idempotency enforcement, state-machine transaction integrity, and structured failure handling.

---

## Key Features

* **Layered Architecture:** Strict separation of concerns (Controller $\rightarrow$ Service $\rightarrow$ Repository pattern) for high maintainability and testability.
* **Idempotent Payment Engine:** Built-in protection against duplicate charge attempts using client-provided idempotency keys.
* **State Machine Validation:** Rigid state machine preventing illegal payment state mutations (e.g., transitioning from `SUCCESS` to `PENDING`).
* **Asynchronous Gateway Simulation:** Non-blocking background worker simulation for payment settlement, failure state handling, and retry flows.
* **Comprehensive Error Handling:** Centralized RFC-7807 compliant error handler with structured JSON logging (`Winston`).
* **API Security & Rate Limiting:** Equipped with `Helmet` header security, CORS controls, input sanitization (`Zod`), and configurable endpoint rate limiting.
* **OpenAPI / Swagger Documentation:** Self-documenting API interactive endpoints.

---

## System Architecture

```text
               ┌────────────────────────┐
               │    HTTP Client / App   │
               └───────────┬────────────┘
                           │
                           ▼
          ┌──────────────────────────────────┐
          │  Middlewares (RateLimit, Zod)   │
          └────────────────┬─────────────────┘
                           │
                           ▼
          ┌──────────────────────────────────┐
          │        Payment Controller        │
          └────────────────┬─────────────────┘
                           │
                           ▼
          ┌──────────────────────────────────┐
          │         Payment Service          │
          │  (State Machine & Idempotency)   │
          └────────┬─────────────────┬───────┘
                   │                 │
                   ▼                 ▼
 ┌────────────────────────┐   ┌───────────────────────────────┐
 │   Payment Repository   │   │ Async Background Payment      │
 │ (In-Memory / Database) │   │ Worker / Gateway Simulation   │
 └────────────────────────┘   └───────────────────────────────┘
```

---

## State Machine Workflow

```text
    ┌──────────┐
    │ PENDING  │
    └────┬─────┘
         │
         ▼
  ┌─────────────┐
  │ PROCESSING  │
  └──────┬──────┘
         ├────────────────────────┐
         ▼                        ▼
  ┌─────────────┐          ┌─────────────┐
  │   SUCCESS   │          │   FAILED    │
  └─────────────┘          └─────────────┘
```

---

## Prerequisites

* **Node.js:** `v22.x` or higher
* **npm:** `v10.x` or higher
* **Docker & Docker Compose:** Required for containerized deployment

---

## Local Development Setup

### Option 1: Native Node.js Environment

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/payment-processing-service.git
   cd payment-processing-service
   ```

2. **Environment Configuration:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   The service will start at `http://localhost:3000`.

---

### Option 2: Docker Deployment

1. **Build and Run Containers:**
   ```bash
   docker-compose up --build -d
   ```

2. **Verify Container Status:**
   ```bash
   docker-compose ps
   ```

3. **View Logs:**
   ```bash
   docker-compose logs -f app
   ```

---

## API Documentation & Endpoints

Interactive Swagger UI documentation is available locally at:
`http://localhost:3000/api-docs`

### Summary of Core Endpoints

| Method | Endpoint | Description | Idempotent |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments` | Create a new payment simulation | **Yes** (via `X-Idempotency-Key` or body key) |
| `GET` | `/api/v1/payments/:id` | Retrieve payment details by ID | **Yes** |
| `PATCH` | `/api/v1/payments/:id/status` | Update payment status explicitly | **No** |
| `GET` | `/health` | Service health & uptime status | **Yes** |

---

## Error Handling & Response Structure

All error responses return standard HTTP status codes and structured JSON outputs:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot transition payment from SUCCESS to PENDING",
    "details": [],
    "timestamp": "2026-10-15T19:00:00.000Z"
  }
}
```

---

## Testing

The project includes unit, integration, and failure-scenario test suites written using **Jest** and **Supertest**.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

---

## Security & Resilience Controls

* **Idempotency Keys:** Protects payment submission endpoints from double-charge vulnerabilities due to network retries.
* **Graceful Shutdown:** Intercepts `SIGTERM`/`SIGINT` signals to finish pending background database writes before termination.
* **Rate Limiting:** Prevents Denial of Service (DoS) and brute-force abuse.
* **Input Validation:** Strict type-checking using `Zod` schemas before payload reaches business logic.

---

## License

This project is licensed under the MIT License.