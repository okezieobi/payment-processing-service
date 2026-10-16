import { Payment, PaymentStatus, Currency } from './payment.model';
import { IPaymentRepository } from './payment.repository.interface';
import { logger } from '../../utils/logger';

interface CreatePaymentInput {
    amount: number;
    currency: Currency;
    idempotencyKey: string;
    description?: string;
}

export class CreatePaymentsService {
    constructor(private paymentRepo: IPaymentRepository) { }

    async execute(input: CreatePaymentInput): Promise<{ payment: Payment; isDuplicate: boolean }> {
        const existing = await this.paymentRepo.findByIdempotencyKey(input.idempotencyKey);
        if (existing) {
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
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const saved = await this.paymentRepo.save(payment);
        logger.info('Payment created successfully', { paymentId: saved.id });

        this.simulateGatewayProcessing(saved.id);

        return { payment: saved, isDuplicate: false };
    }

    private simulateGatewayProcessing(paymentId: string): void {
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