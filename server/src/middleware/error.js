import { AppError, ErrorCodes } from '../utils/errors.js';
import pino from 'pino';

const logger = pino();

export const errorHandler = (err, req, res, next) => {
  // If error is from zod validation
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid request data',
        details: err.errors
      }
    });
  }

  // If custom AppError
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  // Unhandled server error
  logger.error(err);
  return res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong on the server.',
    }
  });
};
