export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    NGN = 'NGN',
}

export interface Payment {
    id: string;
    idempotencyKey: string;
    amount: number;
    currency: Currency;
    status: PaymentStatus;
    description?: string;
    payloadHash?: string;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
}