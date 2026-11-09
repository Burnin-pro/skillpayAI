import { AppError, ErrorCodes } from '../utils/errors.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Requires one of roles: ${roles.join(', ')}`, 403, ErrorCodes.FORBIDDEN));
    }
    next();
  };
};
