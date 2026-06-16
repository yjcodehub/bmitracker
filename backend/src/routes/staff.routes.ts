import { Router } from 'express';
import { staffController } from '../controllers/staff.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('staff:read'), staffController.listStaff);
router.post('/', requirePermission('staff:create'), auditLog('create', 'staff'), staffController.createStaff);
router.get('/:id', requirePermission('staff:read'), staffController.getStaffDetail);
router.put('/:id', requirePermission('staff:update'), auditLog('update', 'staff'), staffController.updateStaff);
router.delete('/:id', requirePermission('staff:delete'), auditLog('delete', 'staff'), staffController.deleteStaff);

export default router;
