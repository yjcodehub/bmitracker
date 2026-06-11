import { Router } from 'express';
import { memberController } from '../controllers/member.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { createMemberSchema, updateMemberSchema, memberQuerySchema } from '../validators/member.validator';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('members:read'), validate(memberQuerySchema, 'query'), memberController.list);
router.get('/:id', requirePermission('members:read'), memberController.getById);
router.post('/', requirePermission('members:create'), validate(createMemberSchema), auditLog('member.create', 'members'), memberController.create);
router.put('/:id', requirePermission('members:update'), validate(updateMemberSchema), auditLog('member.update', 'members'), memberController.update);
router.post('/:id/approve', requirePermission('members:approve'), auditLog('member.approve', 'members'), memberController.approve);
router.delete('/:id', requirePermission('members:delete'), auditLog('member.delete', 'members'), memberController.delete);

export default router;
