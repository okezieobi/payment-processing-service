# AI Assistance & Prompt Log

This document serves as the mandatory, audit-ready transcript log of all AI-assisted engineering prompts and architectural iterations used during the development of the **Payment Processing Microservice**.

---

## 1. Governance & AI Guidelines Compliance

* **Ownership & Responsibility:** All AI-generated outputs were critically reviewed, refactored, and verified against functional and non-functional requirements. Final code correctness, architectural integrity, failure resilience, and test coverage remain the sole responsibility of the author.
* **Scope of AI Usage:** AI was utilized for boilerplate scaffolding, test matrix generation, architectural trade-off sanity checks, and edge-case discovery.
* **Sanitization:** No production secrets, private keys, or proprietary data were exposed during AI interactions.

---

## 2. Iterative Prompt History

### Phase 1: Architecture & Project Scaffolding
* **Prompt:**
  > "Design a clean, modular TypeScript + Express microservice architecture for a Payment Processing Simulation. The service must enforce a strict Repository pattern to allow swapping between in-memory and persistent storage (PostgreSQL/Prisma), handle idempotency, enforce state machine transitions, and include robust error handling with Winston logging."
* **Rationale & Refinements:**
  > Used the AI output to structure modular boundaries (`controllers`, `services`, `repositories`, `middlewares`). Ensured strict separation between controller DTO parsing (Zod) and core domain logic.

---

### Phase 2: Domain Modeling & Idempotency Design
* **Prompt:**
  > "Provide a Zod schema and TypeScript interfaces for a payment model with statuses `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`, `CANCELLED`. Include idempotency support where repeated POST requests with the same idempotency key return the cached result rather than re-executing state creation."
* **Rationale & Refinements:**
  > Enhanced the schema to handle state-transition validation explicitly. Ensured that attempted invalid transitions (e.g., `SUCCESS` -> `PENDING`) throw domain-specific business exceptions.

---

### Phase 3: Failure Handling, Async Simulation, & Edge Cases
* **Prompt:**
  > "Design an asynchronous simulation strategy for gateway processing in Node.js. How should state transitions handle simulated network delays and random gateway failures without blocking the main event loop or risking unhandled promise rejections?"
* **Rationale & Refinements:**
  > Adopted an event-driven background processor pattern. Used `setImmediate` / asynchronous worker queues to decouple the immediate HTTP request acknowledgement (`202 Accepted` / `201 Created`) from the asynchronous state transition to `SUCCESS` or `FAILED`.

---

### Phase 4: Test Suite & Edge-Case Coverage
* **Prompt:**
  > "Generate a list of critical edge cases to test for a payment API endpoint using Jest and Supertest. Include tests for duplicate idempotency keys, invalid currency codes, rate-limiting, and state transition violations."
* **Rationale & Refinements:**
  > Integrated unit tests for the repository and service layers, along with integration tests covering HTTP status codes (`200`, `201`, `400`, `404`, `409`, `422`, `429`).

---

## 3. Engineering Decisions & Code Validation

| Topic | AI Suggestion | Human/Engineer Refinement | Reason |
| :--- | :--- | :--- | :--- |
| **Storage** | Single combined JSON file persistence. | Decoupled Interface (`IPaymentRepository`) + Thread-safe In-Memory Store. | Enables zero-dependency execution for reviewers while maintaining instant extensibility for SQL DBs. |
| **Idempotency** | Simple in-memory Map lookup. | Lock-backed Idempotency Registry with request payload hash comparison. | Prevents payload mutation under identical keys and prevents race conditions. |
| **Errors** | Generic `Error` middleware. | Custom `AppError` taxonomy (`NotFoundError`, `ConflictError`, `ValidationError`). | Guarantees consistent RFC-7807 compliant error responses across all APIs. |