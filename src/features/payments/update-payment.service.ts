import { Payment, PaymentStatus } from './payment.model';
import { IPaymentRepository } from './payment.repository.interface';
import { logger } from '../../utils/logger';

export class UpdatePaymentStatusService {
    constructor(private paymentRepo: IPaymentRepository) { }

    async execute(id: string, status: PaymentStatus, failureReason?: string): Promise<Payment | null> {
        const payment = await this.paymentRepo.findById(id);
        if (!payment) return null;

        const updated = await this.paymentRepo.update(id, { status, failureReason });
        logger.info('Payment status updated manually', { paymentId: id, status, failureReason });
        return updated;
    }
}