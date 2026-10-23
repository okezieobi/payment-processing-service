import express, { Express, Request, Response, NextFunction, Router } from 'express';
import { paymentRouter } from './features/payments/payment.routes';
import { logger } from './utils/logger';
import { AppError } from './errors';

export const app: Express = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        logger.info('HTTP Request', {
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
        });
    });
    next();
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