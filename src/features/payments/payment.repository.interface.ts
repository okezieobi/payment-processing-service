import { Payment } from './payment.model';

export interface IPaymentRepository {
    save(payment: Payment): Promise<Payment>;
    findById(id: string): Promise<Payment | null>;
    findByIdempotencyKey(key: string): Promise<Payment | null>;
    update(id: string, updates: Partial<Payment>): Promise<Payment | null>;
    clear(): Promise<void>;
}