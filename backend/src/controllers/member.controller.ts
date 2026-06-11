import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { memberService } from '../services/member.service';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';

export class MemberController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await memberService.create(
        req.user!.gymId,
        req.body,
        req.user!.userId
      );
      sendSuccess(res, member, 'Member created', 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { members, pagination } = await memberService.list(req.user!.gymId, req.query);
      sendPaginated(res, members, pagination);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await memberService.getById(String(req.params.id), req.user!.gymId);
      sendSuccess(res, member);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await memberService.update(String(req.params.id), req.user!.gymId, req.body);
      sendSuccess(res, member);
    } catch (err) {
      next(err);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await memberService.approve(String(req.params.id), req.user!.gymId);
      sendSuccess(res, member, 'Member approved');
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await memberService.delete(String(req.params.id), req.user!.gymId);
      sendSuccess(res, member, 'Member archived');
    } catch (err) {
      next(err);
    }
  }
}

export const memberController = new MemberController();
