import { Router } from 'express';
import authRoutes from './auth.routes';
import memberRoutes from './member.routes';
import bmiRoutes from './bmi.routes';
import trainerRoutes from './trainer.routes';
import analyticsRoutes from './analytics.routes';
import settingsRoutes from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/bmi', bmiRoutes);
router.use('/trainers', trainerRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'BMI Tracker Pro API is running' });
});

export default router;
