import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';

const router = Router();

router.use(authenticate);

router.post(
  '/generate',
  requirePermission('reports:create'),
  auditLog('reports.generate', 'reports'),
  reportController.generate
);

router.get(
  '/member/:memberId',
  requirePermission('reports:read'),
  reportController.listByMember
);

router.get(
  '/',
  requirePermission('reports:read'),
  reportController.listAll
);

router.get(
  '/:id',
  requirePermission('reports:read'),
  reportController.getById
);

router.get(
  '/:id/download',
  requirePermission('reports:read'),
  reportController.download
);

router.post(
  '/:id/email',
  requirePermission('reports:email'),
  auditLog('reports.email', 'reports'),
  reportController.email
);

export default router;
