export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class IdempotencyConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class PayloadMismatchError extends AppError {
    constructor(message: string) {
        super(message, 422);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class GatewayError extends AppError {
    constructor(message: string) {
        super(message, 502);
    }
}