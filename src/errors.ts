export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends AppError {
    public statusCode = 400;
    public name = 'ValidationError';
    constructor(message: string) {
        super(message, 400);
    }
}

export class PayloadMismatchError extends AppError {
    public statusCode = 422;
    public name = 'PayloadMismatchError';
    constructor(message: string) {
        super(message, 422);
    }
}

export class NotFoundError extends AppError {
    public statusCode = 404;
    public name = 'NotFoundError';
    constructor(message: string) {
        super(message, 404);
    }
}