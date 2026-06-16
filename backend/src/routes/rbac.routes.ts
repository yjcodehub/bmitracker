import { Router } from 'express';
import { rbacController } from '../controllers/rbac.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.get('/roles', requirePermission('rbac:read'), rbacController.listRoles);
router.post('/roles', requirePermission('rbac:create'), auditLog('create', 'role'), rbacController.createRole);
router.get('/roles/:id', requirePermission('rbac:read'), rbacController.getRoleDetail);
router.put('/roles/:id', requirePermission('rbac:update'), auditLog('update', 'role'), rbacController.updateRole);
router.delete('/roles/:id', requirePermission('rbac:delete'), auditLog('delete', 'role'), rbacController.deleteRole);

router.get('/permissions', requirePermission('rbac:read'), rbacController.listPermissions);

export default router;
