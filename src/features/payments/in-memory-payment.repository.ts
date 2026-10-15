import { Payment } from './payment.model';
import { IPaymentRepository } from './payment.repository.interface';

export class InMemoryPaymentRepository implements IPaymentRepository {
    private payments: Map<string, Payment> = new Map();
    private idempotencyIndex: Map<string, string> = new Map();

    async save(payment: Payment): Promise<Payment> {
        this.payments.set(payment.id, payment);
        this.idempotencyIndex.set(payment.idempotencyKey, payment.id);
        return payment;
    }

    async findById(id: string): Promise<Payment | null> {
        return this.payments.get(id) || null;
    }

    async findByIdempotencyKey(key: string): Promise<Payment | null> {
        const paymentId = this.idempotencyIndex.get(key);
        if (!paymentId) return null;
        return this.payments.get(paymentId) || null;
    }

    async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
        const payment = this.payments.get(id);
        if (!payment) return null;

        const updatedPayment: Payment = {
            ...payment,
            ...updates,
            updatedAt: new Date(),
        };

        this.payments.set(id, updatedPayment);
        return updatedPayment;
    }

    async clear(): Promise<void> {
        this.payments.clear();
        this.idempotencyIndex.clear();
    }
}

export const paymentRepository = new InMemoryPaymentRepository();