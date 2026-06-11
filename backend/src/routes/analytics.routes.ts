import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(requirePermission('analytics:read'));

router.get('/dashboard', analyticsController.dashboard);
router.get('/bmi-distribution', analyticsController.bmiDistribution);
router.get('/weight-trends', analyticsController.weightTrends);
router.get('/member-growth', analyticsController.memberGrowth);

export default router;
