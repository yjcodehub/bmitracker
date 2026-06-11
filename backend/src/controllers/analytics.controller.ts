import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/apiResponse';

export class AnalyticsController {
  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getOwnerDashboard(req.user!.gymId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  async bmiDistribution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getBMIDistribution(req.user!.gymId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  async weightTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getWeightTrends(
        req.user!.gymId,
        Number(req.query.days) || 30
      );
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  async memberGrowth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getMemberGrowth(req.user!.gymId);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
