import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-*\/[\]\\`~';])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(50).max(300),
  currentWeight: z.number().min(20).max(500),
  weightLossGoal: z.number().min(0).optional(),
  role: z.enum(['member', 'staff', 'owner']).default('member'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const phoneLoginSchema = z.object({
  phone: z.string().min(10),
});

export const otpVerifySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-*\/[\]\\`~';])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});
