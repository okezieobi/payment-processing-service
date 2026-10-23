import crypto from 'node:crypto';
import { Payment, PaymentStatus, Currency } from './payment.model';
import { IPaymentRepository } from './payment.repository.interface';
import { logger } from '../../utils/logger';
import { PayloadMismatchError } from '../../errors';

interface CreatePaymentInput {
    amount: number;
    currency: Currency;
    idempotencyKey: string;
    description?: string;
}

export class CreatePaymentsService {
    constructor(private paymentRepo: IPaymentRepository) { }

    private hashPayload(input: CreatePaymentInput): string {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify({
                amount: input.amount,
                currency: input.currency,
                description: input.description
            }))
            .digest('hex');
    }

    async execute(input: CreatePaymentInput): Promise<{ payment: Payment; isDuplicate: boolean }> {
        const existing = await this.paymentRepo.findByIdempotencyKey(input.idempotencyKey);
        const currentHash = this.hashPayload(input);

        if (existing) {
            // Directly compare request fields to detect payload mismatches
            if (
                existing.amount !== input.amount ||
                existing.currency !== input.currency ||
                existing.description !== input.description
            ) {
                logger.warn('Idempotency key reused with mismatched payload', { key: input.idempotencyKey });
                throw new PayloadMismatchError('Idempotency key already used with a different request payload');
            }

            logger.info('Idempotent request matched existing payment', { paymentId: existing.id, key: input.idempotencyKey });
            return { payment: existing, isDuplicate: true };
        }

        const payment: Payment = {
            id: crypto.randomUUID(),
            idempotencyKey: input.idempotencyKey,
            amount: input.amount,
            currency: input.currency,
            status: PaymentStatus.PENDING,
            description: input.description,
            payloadHash: currentHash,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const saved = await this.paymentRepo.save(payment);
        logger.info('Payment created successfully', { paymentId: saved.id });

        this.simulateGatewayProcessing(saved.id);

        return { payment: saved, isDuplicate: false };
    }

    private simulateGatewayProcessing(paymentId: string): void {
        // Completely bypass background timers during test execution to allow instant process exit
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        setTimeout(async () => {
            try {
                await this.paymentRepo.update(paymentId, { status: PaymentStatus.PROCESSING });
                logger.info('Payment processing initiated', { paymentId });

                setTimeout(async () => {
                    const isSuccess = Math.random() < 0.9;
                    const status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
                    const failureReason = isSuccess ? undefined : 'Simulated gateway network timeout';

                    await this.paymentRepo.update(paymentId, { status, failureReason });
                    logger.info(`Payment status finalized: ${status}`, { paymentId, failureReason });
                }, 3000);
            } catch (err: any) {
                logger.error('Failed processing async gateway simulation', { paymentId, error: err.message });
            }
        }, 1000);
    }
}