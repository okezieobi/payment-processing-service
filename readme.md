# Payment Processing Microservice

A production-grade, asynchronous payment processing microservice built with Node.js, TypeScript, and Express. Designed with a strict vertical feature-sliced architecture, zero non-essential dependencies to mitigate supply chain risks, bulletproof idempotency enforcement, and native Node test runner execution.

---

## Key Features

- **Zero-Vulnerability Toolchain:** Stripped out legacy tooling (`jest`, `ts-jest`, `ts-node-dev`, `zod`, `winston`) in favor of native Node primitives (`crypto.randomUUID()`, `node --test`, native structured logger, and pure TypeScript validation guards).
- **Vertical Feature-Sliced Architecture:** Self-contained domain modules (`src/features/payments`) housing models, repository contracts, use cases, controllers, and routes in a single cohesive unit.
- **Idempotent Payment Engine:** Built-in protection against duplicate charge attempts using client-provided idempotency keys mapped securely in memory, with explicit payload mismatch detection (`422 Unprocessable Entity`).
- **Robust Operational Error Handling:** Custom operational error hierarchy (`AppError`, `ValidationError` [400], `PayloadMismatchError` [422], `NotFoundError` [404]) mapped via centralized Express error middleware.
- **Asynchronous Gateway Simulation:** Non-blocking background worker simulation handling state transitions (`PENDING` -> `PROCESSING` -> `SUCCESS` or `FAILED`) without blocking the main event loop.
- **Native Test Suite Integration:** Fast, zero-warning integration tests utilizing Supertest and Node.js's built-in test runner (`node --test`).

---

## Prerequisites

- **Node.js:** v20.x or v22.x recommended
- **npm:** v10.x or higher

---

## Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/okezieobi/payment-processing-service.git
   cd payment-processing-service
   ```

2. **Install Dependencies (Zero Vulnerabilities):**
   ```bash
   npm install
   ```

3. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   *(The service will start at `http://localhost:3000`)*

---

## API Documentation & Endpoints

### Summary of Core Endpoints

| Method | Endpoint | Description | Idempotent / Status Codes |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/payments` | Create a new payment simulation | Yes (`201 Created`, `200 OK` on duplicate, `400` validation error, `422` payload mismatch) |
| **GET** | `/api/v1/payments/:id` | Retrieve payment details by ID | Yes (`200 OK`, `404 Not Found`) |
| **PATCH** | `/api/v1/payments/:id/status` | Update payment status explicitly | No (`200 OK`, `400 Bad Request`, `404 Not Found`) |
| **GET** | `/health` | Service health & uptime status | Yes (`200 OK`) |

---

## Testing

The project uses Node.js's native test runner (`node --test`) paired with `tsx` and `supertest` for zero-warning integration testing with clean process lifecycle management.

Run the test suite:
```bash
npm test
```

---

## AI-Assisted Development & Governance Log

In compliance with engineering assessment transparency guidelines, the complete, verbatim record of all prompts, architectural trade-offs, debugging iterations, and AI collaboration logs is fully documented and maintained in:  
👉 **[`ai_prompt_and_response_log.md`](./ai_prompt_and_response_log.md)**

---

## Security & Supply Chain Resilience

- **Zero Non-Essential Dependencies:** Eliminates transitive supply chain vulnerabilities by avoiding heavy validation, logging, and testing libraries.
- **Graceful Shutdown:** Intercepts `SIGTERM`/`SIGINT` signals to close the HTTP server cleanly before process termination.
- **Runtime Validation:** Strict pure TypeScript guard functions validate payloads before execution, preventing malformed inputs.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.