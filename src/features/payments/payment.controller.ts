import { Request, Response } from 'express';
import { CreatePaymentUseCase } from './create-payment.usecase';
import { GetPaymentUseCase } from './get-payment.usecase';
import { paymentRepository } from './in-memory-payment.repository';
import { validateCreatePayment, validateUpdateStatus } from './payment.validator';
import { UpdatePaymentStatusUseCase } from './update-payment-usecase';


const createUseCase = new CreatePaymentUseCase(paymentRepository);
const getUseCase = new GetPaymentUseCase(paymentRepository);
const updateUseCase = new UpdatePaymentStatusUseCase(paymentRepository);

export class PaymentController {
    async create(req: Request, res: Response): Promise<void> {
        const validation = validateCreatePayment(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error });
            return;
        }

        const { payment, isDuplicate } = await createUseCase.execute(validation.data!);
        res.status(isDuplicate ? 200 : 201).json({ data: payment });
    }

    async getById(req: Request, res: Response): Promise<void> {
        const payment = await getUseCase.execute(req.params.id);
        if (!payment) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }
        res.status(200).json({ data: payment });
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        const validation = validateUpdateStatus(req.body);
        if (!validation.success) {
            res.status(400).json({ error: validation.error });
            return;
        }

        const updated = await updateUseCase.execute(
            req.params.id,
            validation.data!.status,
            validation.data!.failureReason
        );

        if (!updated) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }
        res.status(200).json({ data: updated });
    }
}

export const paymentController = new PaymentController();