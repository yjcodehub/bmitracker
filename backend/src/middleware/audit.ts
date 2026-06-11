import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AuditLog } from '../models';

export function auditLog(action: string, resource: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      if (req.user && res.statusCode < 400) {
        AuditLog.create({
          gymId: req.user.gymId,
          userId: req.user.userId,
          action,
          resource,
          resourceId: req.params.id,
          metadata: { method: req.method, path: req.path },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }).catch(console.error);
      }
      return originalJson(body);
    };

    next();
  };
}
