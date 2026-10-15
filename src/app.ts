import express, { Express, Request, Response, NextFunction } from 'express';
import { paymentRouter } from './features/payments/payment.routes';
import { logger } from './utils/logger';

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

app.use('/api/v1/payments', paymentRouter);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled Error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
});