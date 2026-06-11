import { Router } from 'express';
import authRoutes from './auth.routes';
import memberRoutes from './member.routes';
import bmiRoutes from './bmi.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/bmi', bmiRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'BMI Tracker Pro API is running' });
});

export default router;
