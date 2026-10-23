import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app';
import { paymentRepository } from '../src/features/payments/in-memory-payment.repository';

describe('Payment API Feature & Failure Tests', () => {
    beforeEach(async () => {
        await paymentRepository.clear();
    });

    test('POST /api/v1/payments - Success', async () => {
        const res = await request(app).post('/api/v1/payments').send({
            amount: 250.0,
            currency: 'USD',
            idempotencyKey: 'feature-test-key-12345',
            description: 'Vertical slice test',
        });

        assert.equal(res.status, 201);
        assert.equal(res.body.data.amount, 250.0);
        assert.equal(res.body.data.status, 'PENDING');
    });

    test('POST /api/v1/payments - Idempotency Success (Duplicate)', async () => {
        const payload = {
            amount: 500,
            currency: 'EUR',
            idempotencyKey: 'idempotent-slice-key-99',
        };

        const first = await request(app).post('/api/v1/payments').send(payload);
        assert.equal(first.status, 201);

        const second = await request(app).post('/api/v1/payments').send(payload);
        assert.equal(second.status, 200);
        assert.equal(second.body.data.id, first.body.data.id);
    });

    test('POST /api/v1/payments - Idempotency Payload Mismatch (422)', async () => {
        const payload1 = {
            amount: 500,
            currency: 'USD',
            idempotencyKey: 'mismatch-key-12345',
        };

        const first = await request(app).post('/api/v1/payments').send(payload1);
        assert.equal(first.status, 201);

        // Reusing the same key with a different amount should trigger PayloadMismatchError -> 422
        const payload2 = {
            amount: 750,
            currency: 'USD',
            idempotencyKey: 'mismatch-key-12345',
        };

        const second = await request(app).post('/api/v1/payments').send(payload2);
        assert.equal(second.status, 422);
        assert.equal(second.body.error, 'Idempotency key already used with a different request payload');
    });

    test('POST /api/v1/payments - Validation Failure (400)', async () => {
        const res = await request(app).post('/api/v1/payments').send({
            amount: -10,
            currency: 'INVALID',
            idempotencyKey: 'short',
        });

        assert.equal(res.status, 400);
        assert.ok(res.body.error);
    });

    test('GET /api/v1/payments/:id - Retrieval & NotFound (404)', async () => {
        const createRes = await request(app).post('/api/v1/payments').send({
            amount: 1000,
            currency: 'NGN',
            idempotencyKey: 'retrieval-test-key-001',
        });

        const paymentId = createRes.body.data.id;

        const getRes = await request(app).get(`/api/v1/payments/${paymentId}`);
        assert.equal(getRes.status, 200);
        assert.equal(getRes.body.data.id, paymentId);

        const notFoundRes = await request(app).get('/api/v1/payments/non-existent-uuid');
        assert.equal(notFoundRes.status, 404);
        assert.equal(notFoundRes.body.error, 'Payment not found');
    });
});