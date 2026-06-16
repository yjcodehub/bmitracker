import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dietService } from '../services/diet.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export class DietController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await dietService.create(req.user!.gymId, req.body);
      sendSuccess(res, plan, 'Diet plan created', 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isTemplate = req.query.isTemplate !== undefined 
        ? req.query.isTemplate === 'true' 
        : undefined;
      const isActive = req.query.isActive !== undefined 
        ? req.query.isActive === 'true' 
        : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const isVegetarian = req.query.isVegetarian !== undefined 
        ? req.query.isVegetarian === 'true' 
        : undefined;
      const isNonVegetarian = req.query.isNonVegetarian !== undefined 
        ? req.query.isNonVegetarian === 'true' 
        : undefined;

      const { plans, pagination } = await dietService.list(req.user!.gymId, {
        isTemplate,
        isActive,
        search,
        page,
        limit,
        isVegetarian,
        isNonVegetarian,
      });
      sendPaginated(res, plans, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await dietService.getById(String(req.params.id), req.user!.gymId);
      sendSuccess(res, plan);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await dietService.update(String(req.params.id), req.user!.gymId, req.body);
      sendSuccess(res, plan, 'Diet plan updated');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await dietService.delete(String(req.params.id), req.user!.gymId);
      sendSuccess(res, plan, 'Diet plan deleted');
    } catch (err) {
      next(err);
    }
  }
}

export const dietController = new DietController();
