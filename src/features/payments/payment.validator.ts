import { Currency, PaymentStatus } from './payment.model';

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export function validateCreatePayment(body: unknown): ValidationResult<{
    amount: number;
    currency: Currency;
    idempotencyKey: string;
    description?: string;
}> {
    if (!body || typeof body !== 'object') {
        return { success: false, error: 'Invalid JSON payload' };
    }

    const { amount, currency, idempotencyKey, description } = body as Record<string, unknown>;

    if (typeof amount !== 'number' || amount <= 0 || Number.isNaN(amount)) {
        return { success: false, error: 'Field "amount" must be a positive number.' };
    }

    if (!currency || typeof currency !== 'string' || !Object.values(Currency).includes(currency as Currency)) {
        return { success: false, error: `Field "currency" must be one of: ${Object.values(Currency).join(', ')}.` };
    }

    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim().length < 8) {
        return { success: false, error: 'Field "idempotencyKey" must be a string of at least 8 characters.' };
    }

    if (description !== undefined && typeof description !== 'string') {
        return { success: false, error: 'Field "description" must be a string.' };
    }

    return {
        success: true,
        data: {
            amount,
            currency: currency as Currency,
            idempotencyKey: idempotencyKey.trim(),
            description: description?.trim(),
        },
    };
}

export function validateUpdateStatus(body: unknown): ValidationResult<{
    status: PaymentStatus;
    failureReason?: string;
}> {
    if (!body || typeof body !== 'object') {
        return { success: false, error: 'Invalid JSON payload' };
    }

    const { status, failureReason } = body as Record<string, unknown>;

    if (!status || typeof status !== 'string' || !Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        return { success: false, error: 'Field "status" must be a valid payment status.' };
    }

    if (failureReason !== undefined && typeof failureReason !== 'string') {
        return { success: false, error: 'Field "failureReason" must be a string.' };
    }

    return {
        success: true,
        data: {
            status: status as PaymentStatus,
            failureReason: failureReason?.trim(),
        },
    };
}