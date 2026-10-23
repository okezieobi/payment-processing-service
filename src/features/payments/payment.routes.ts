import { Router } from 'express';
import { paymentController } from './payment.controller';

export const paymentRouter = Router();

paymentRouter.post('/', (req, res, next) => paymentController.create(req, res, next));
paymentRouter.get('/:id', (req, res, next) => paymentController.getById(req, res, next));
paymentRouter.patch('/:id/status', (req, res, next) => paymentController.updateStatus(req, res, next));