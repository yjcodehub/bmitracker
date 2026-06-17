import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { AppError } from '../middleware/errorHandler';
import { createMemberSchema, updateMemberSchema, memberQuerySchema } from '../validators/member.validator';

const router = Router();

router.use(authenticate);

// Middleware to prevent members from reading or updating other members
function restrictMemberAccess(req: AuthRequest, _res: any, next: any) {
  if (req.user?.roleSlug === 'member') {
    const isSelfGetOrPut =
      (req.method === 'GET' || req.method === 'PUT') &&
      req.params.id &&
      req.user.memberId === req.params.id;

    if (!isSelfGetOrPut) {
      return next(new AppError('Forbidden: Access denied to other member profiles', 403));
    }
  }
  next();
}

router.get('/', requirePermission('members:read'), validate(memberQuerySchema, 'query'), memberController.list);
router.get('/:id', requirePermission('members:read'), restrictMemberAccess, memberController.getById);
router.post('/', requirePermission('members:create'), validate(createMemberSchema), auditLog('member.create', 'members'), memberController.create);
router.put('/:id', requirePermission('members:update'), restrictMemberAccess, validate(updateMemberSchema), auditLog('member.update', 'members'), memberController.update);
router.post('/:id/approve', requirePermission('members:approve'), restrictMemberAccess, auditLog('member.approve', 'members'), memberController.approve);
router.delete('/:id', requirePermission('members:delete'), restrictMemberAccess, auditLog('member.delete', 'members'), memberController.delete);

export default router;

