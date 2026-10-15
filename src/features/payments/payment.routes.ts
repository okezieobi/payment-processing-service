import { Router } from 'express';
import { paymentController } from './payment.controller';

export const paymentRouter = Router();

paymentRouter.post('/', (req, res) => paymentController.create(req, res));
paymentRouter.get('/:id', (req, res) => paymentController.getById(req, res));
paymentRouter.patch('/:id/status', (req, res) => paymentController.updateStatus(req, res));