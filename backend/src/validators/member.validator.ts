import { z } from 'zod';

export const createMemberSchema = z.object({
  fullName: z.string().min(2),
  contactNumber: z.string().min(10),
  email: z.string().email(),
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(50).max(300),
  currentWeight: z.number().min(20).max(500),
  idealWeight: z.number().min(20).max(500).optional(),
  weightLossGoal: z.number().min(0).optional(),
  trainerId: z.string().optional(),
  trainerName: z.string().optional(),
  membershipNumber: z.string().optional(),
  status: z.enum(['pending_approval', 'active', 'inactive', 'archived']).optional(),
  password: z.string().min(8).optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  status: z.enum(['pending_approval', 'active', 'inactive', 'archived']).optional(),
  trainerId: z.string().optional(),
  role: z.enum(['member', 'staff', 'owner']).optional(),
});
