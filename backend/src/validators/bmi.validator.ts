import { z } from 'zod';

export const createBMISchema = z.object({
  memberId: z.string(),
  weight: z.number().min(20).max(500),
  bodyFatPercent: z.number().min(0).max(100),
  visceralFat: z.number().min(0),
  bmr: z.number().min(0),
  bodyAge: z.number().min(0),
  totalBodyFat: z.number().min(0),
  trunkFat: z.number().min(0),
  armFat: z.number().min(0),
  legFat: z.number().min(0),
  muscleMass: z.number().min(0),
  trunkMuscleMass: z.number().min(0).optional(),
  armMuscleMass: z.number().min(0).optional(),
  legMuscleMass: z.number().min(0).optional(),
  dietPlanId: z.string().optional(),
  trainerNotes: z.string().optional(),
  analysisDate: z.coerce.date().optional(),
});

export const calculateBMISchema = z.object({
  weight: z.number().min(20).max(500),
  height: z.number().min(50).max(300),
});
