import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { bmiService } from '../services/bmi.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export class BMIController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await bmiService.create({
        ...req.body,
        gymId: req.user!.gymId,
        staffId: req.user!.userId,
      });
      sendSuccess(res, record, 'BMI analysis created', 201);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await bmiService.getById(String(req.params.id));
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  }

  async getMemberHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { records, pagination } = await bmiService.getMemberHistory(
        String(req.params.memberId),
        Number(req.query.page) || 1,
        Number(req.query.limit) || 20
      );
      sendPaginated(res, records, pagination);
    } catch (err) {
      next(err);
    }
  }

  async calculate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await bmiService.calculate(
        req.body.weight,
        req.body.height,
        req.user!.gymId
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await bmiService.delete(String(req.params.id));
      sendSuccess(res, record, 'BMI record deleted');
    } catch (err) {
      next(err);
    }
  }

  async assignDietPlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const record = await bmiService.assignDietPlan(
        String(req.params.id),
        req.body.dietPlanId
      );
      sendSuccess(res, record, 'Diet plan assigned');
    } catch (err) {
      next(err);
    }
  }
}

export const bmiController = new BMIController();
