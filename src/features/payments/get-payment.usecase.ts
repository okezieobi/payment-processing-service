import { Payment } from './payment.model';
import { IPaymentRepository } from './payment.repository.interface';

export class GetPaymentUseCase {
    constructor(private paymentRepo: IPaymentRepository) { }

    async execute(id: string): Promise<Payment | null> {
        return this.paymentRepo.findById(id);
    }
}