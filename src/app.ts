import express, { Express, Request, Response, NextFunction, Router } from 'express';
import { paymentRouter } from './features/payments/payment.routes';
import { logger } from './utils/logger';
import { AppError } from './errors';

export const app: Express = express();

app.use(express.json());

// src/app.ts
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Duck-typing status code with fallback
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 400;
    const message = err.message || 'Internal Server Error';

    if (statusCode < 500) {
        logger.warn('Operational Error', { statusCode, message });
    } else {
        logger.error('Unhandled Internal Error', { error: message, stack: err.stack });
    }

    res.status(statusCode).json({ error: message });
});

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

const v1Router = Router();
v1Router.use("/payments", paymentRouter);
app.use('/api/v1', v1Router);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Centralized Operational Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        logger.warn('Operational Error', { statusCode: err.statusCode, message: err.message });
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    logger.error('Unhandled Internal Error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
});