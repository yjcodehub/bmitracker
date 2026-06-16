import { Router } from 'express';
import { dietController } from '../controllers/diet.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { createDietSchema, updateDietSchema } from '../validators/diet.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requirePermission('diet:create'),
  validate(createDietSchema),
  auditLog('diet.create', 'dietplans'),
  dietController.create
);

router.get('/', requirePermission('diet:read'), dietController.list);

router.get('/:id', requirePermission('diet:read'), dietController.getById);

router.put(
  '/:id',
  requirePermission('diet:update'),
  validate(updateDietSchema),
  auditLog('diet.update', 'dietplans'),
  dietController.update
);

router.delete(
  '/:id',
  requirePermission('diet:delete'),
  auditLog('diet.delete', 'dietplans'),
  dietController.delete
);

export default router;
