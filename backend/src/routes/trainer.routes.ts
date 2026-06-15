import { Router } from 'express';
import { trainerController } from '../controllers/trainer.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { createTrainerSchema, updateTrainerSchema, trainerQuerySchema } from '../validators/trainer.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('trainers:read'),
  validate(trainerQuerySchema, 'query'),
  trainerController.list
);

router.get(
  '/:id',
  requirePermission('trainers:read'),
  trainerController.getById
);

router.post(
  '/',
  requirePermission('trainers:create'),
  validate(createTrainerSchema),
  auditLog('trainer.create', 'trainers'),
  trainerController.create
);

router.put(
  '/:id',
  requirePermission('trainers:update'),
  validate(updateTrainerSchema),
  auditLog('trainer.update', 'trainers'),
  trainerController.update
);

router.delete(
  '/:id',
  requirePermission('trainers:delete'),
  auditLog('trainer.delete', 'trainers'),
  trainerController.delete
);

export default router;
