import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app';
import { paymentRepository } from '../src/features/payments/in-memory-payment.repository';


describe('Payment API Feature Tests', () => {
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

    test('POST /api/v1/payments - Idempotency', async () => {
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
});