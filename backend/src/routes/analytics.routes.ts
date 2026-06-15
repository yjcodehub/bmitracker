import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/dashboard', requirePermission('analytics:read'), analyticsController.dashboard);
router.get('/staff-dashboard', requirePermission('members:read'), analyticsController.staffDashboard);
router.get('/bmi-distribution', requirePermission('analytics:read'), analyticsController.bmiDistribution);
router.get('/weight-trends', requirePermission('analytics:read'), analyticsController.weightTrends);
router.get('/member-growth', requirePermission('analytics:read'), analyticsController.memberGrowth);

export default router;
