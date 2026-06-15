import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { trainerService } from '../services/trainer.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export class TrainerController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.create(req.user!.gymId, req.body);
      sendSuccess(res, trainer, 'Trainer created', 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { trainers, pagination } = await trainerService.list(req.user!.gymId, {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search ? String(req.query.search) : undefined,
        isActive: req.query.isActive !== undefined ? (req.query.isActive as unknown as boolean) : undefined,
      });
      sendPaginated(res, trainers, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.getById(String(req.params.id), req.user!.gymId);
      sendSuccess(res, trainer);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.update(String(req.params.id), req.user!.gymId, req.body);
      sendSuccess(res, trainer, 'Trainer updated');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trainer = await trainerService.delete(String(req.params.id), req.user!.gymId);
      sendSuccess(res, trainer, 'Trainer deleted');
    } catch (err) {
      next(err);
    }
  }
}

export const trainerController = new TrainerController();
