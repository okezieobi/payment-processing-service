import { Request, Response, NextFunction } from 'express';
import { GetPaymentService } from './get-payment.service';
import { paymentRepository } from './in-memory-payment.repository';
import { validateCreatePayment, validateUpdateStatus } from './payment.validator';
import { UpdatePaymentStatusService } from './update-payment.service';
import { CreatePaymentsService } from './create-payment.service';

const createService = new CreatePaymentsService(paymentRepository);
const getService = new GetPaymentService(paymentRepository);
const updateService = new UpdatePaymentStatusService(paymentRepository);

export class PaymentController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validation = validateCreatePayment(req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const { payment, isDuplicate } = await createService.execute(validation.data!);
            res.status(isDuplicate ? 200 : 201).json({ data: payment });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payment = await getService.execute(req.params.id);
            if (!payment) {
                res.status(404).json({ error: 'Payment not found' });
                return;
            }
            res.status(200).json({ data: payment });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validation = validateUpdateStatus(req.body);
            if (!validation.success) {
                res.status(400).json({ error: validation.error });
                return;
            }

            const updated = await updateService.execute(
                req.params.id,
                validation.data!.status,
                validation.data!.failureReason
            );

            if (!updated) {
                res.status(404).json({ error: 'Payment not found' });
                return;
            }
            res.status(200).json({ data: updated });
        } catch (error) {
            next(error);
        }
    }
}

export const paymentController = new PaymentController();