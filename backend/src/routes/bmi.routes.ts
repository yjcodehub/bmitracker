import { Router } from 'express';
import { bmiController } from '../controllers/bmi.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { auditLog } from '../middleware/audit';
import { createBMISchema, calculateBMISchema } from '../validators/bmi.validator';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('bmi:create'), validate(createBMISchema), auditLog('bmi.create', 'bmirecords'), bmiController.create);
router.post('/calculate', requirePermission('bmi:create'), validate(calculateBMISchema), bmiController.calculate);
router.get('/member/:memberId', requirePermission('bmi:read'), bmiController.getMemberHistory);
router.get('/:id', requirePermission('bmi:read'), bmiController.getById);
router.delete('/:id', requirePermission('bmi:delete'), auditLog('bmi.delete', 'bmirecords'), bmiController.delete);

export default router;
