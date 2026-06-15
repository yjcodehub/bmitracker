'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-*\/[\]\\`~';])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  age: z.coerce.number().min(1, 'Age must be at least 1').max(120, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(50, 'Height must be at least 50 cm').max(300, 'Invalid height'),
  currentWeight: z.coerce.number().min(20, 'Weight must be at least 20 kg').max(500, 'Invalid weight'),
  weightLossGoal: z.coerce.number().min(0).optional(),
  role: z.enum(['member', 'staff', 'owner']).default('member'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '', color: 'bg-gray-200', textColor: 'text-muted-foreground', width: 'w-0' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_+\-*\/[\]\\`~';]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/3' };
  } else if (score <= 4) {
    return { score, label: 'Good', color: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/3' };
  } else {
    return { score, label: 'Best', color: 'bg-green-500', textColor: 'text-green-500', width: 'w-full' };
  }
};

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: 'male', role: 'member' },
  });

  const watchedPassword = watch('password');
  const strength = getPasswordStrength(watchedPassword || '');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = data;
      await api.post('/auth/register', payload);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-xl font-bold">Registration Submitted</h2>
            <p className="text-muted-foreground">
              Your registration is pending admin approval. You will be notified once approved.
            </p>
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Member Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...register('fullName')} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {watchedPassword && (
                <div className="space-y-1.5 mt-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-xs font-semibold ${strength.textColor}`}>
                    Password Strength: {strength.label}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pr-10"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select {...register('role')} className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="member">Member</option>
                <option value="staff">Staff</option>
                <option value="owner">Gym Owner</option>
              </select>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" {...register('age')} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select {...register('gender')} className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" {...register('height')} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" {...register('currentWeight')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Weight Loss Goal (kg)</Label>
              <Input type="number" step="0.1" {...register('weightLossGoal')} />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Register'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
