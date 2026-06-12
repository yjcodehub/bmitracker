import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/gym', requirePermission('settings:read'), settingsController.getGymSettings);
router.put('/gym', requirePermission('settings:update'), settingsController.updateGymSettings);

export default router;
