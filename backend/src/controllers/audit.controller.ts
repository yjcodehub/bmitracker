import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuditLog } from '../models';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';

export class AuditController {
  async listLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { userId, action, resource, startDate, endDate } = req.query;

      const query: any = { gymId };

      if (userId) query.userId = userId;
      if (action) query.action = action;
      if (resource) query.resource = resource;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate as string);
        }
      }

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .populate({
          path: 'userId',
          select: 'email phone memberId',
          populate: {
            path: 'memberId',
            select: 'fullName'
          }
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      sendPaginated(res, logs, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      });
    } catch (err) {
      next(err);
    }
  }
}

export const auditController = new AuditController();
