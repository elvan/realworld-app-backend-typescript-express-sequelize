import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  public statusCode: number;
  public errors: any;

  constructor(statusCode: number, message: string, errors = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors = {}) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized', errors = {}) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Forbidden', errors = {}) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Not found', errors = {}) {
    return new ApiError(404, message, errors);
  }

  static validationError(errors = {}) {
    return new ApiError(422, 'Validation error', errors);
  }

  static internal(message = 'Internal server error', errors = {}) {
    return new ApiError(500, message, errors);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      errors: err.errors.errors || { message: err.message }
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const validationErrors: Record<string, string> = {};
    const errors = (err as any)['errors'];
    
    if (errors && Array.isArray(errors)) {
      errors.forEach((error: { path: string; message: string }) => {
        validationErrors[error.path] = error.message;
      });
    }

    return res.status(422).json({
      errors: validationErrors
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    errors: {
      message: 'Internal server error'
    }
  });
};
