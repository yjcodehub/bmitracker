'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  membershipNumber: z.string().optional(),
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
  const router = useRouter();
  const [flowState, setFlowState] = useState<'verify' | 'existing' | 'new'>('verify');
  const [membershipId, setMembershipId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: 'male', role: 'member', membershipNumber: '' },
  });

  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');
  const strength = getPasswordStrength(watchedPassword || '');
  const isConfirmPasswordMismatched = watchedConfirmPassword && watchedPassword !== watchedConfirmPassword;

  const handleVerifyMembership = async () => {
    if (!membershipId) return;
    setVerifying(true);
    setError('');
    try {
      const res = await api.get<any>(`/auth/lookup-membership/${membershipId}`);
      toast.success('Membership ID verified!');
      
      reset({
        fullName: res.data.fullName,
        email: res.data.email,
        phone: res.data.contactNumber || '',
        age: res.data.age,
        gender: res.data.gender,
        height: res.data.height,
        currentWeight: res.data.currentWeight,
        weightLossGoal: res.data.weightLossGoal || 0,
        role: res.data.role || 'member',
        membershipNumber: membershipId,
        password: '',
        confirmPassword: '',
      });
      
      setFlowState('existing');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Membership ID not found or already registered';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = data;
      const response = await api.post<any>('/auth/register', payload);
      
      if (response.data?.accessToken) {
        toast.success(response.message || 'Registration complete! Logged in.');
        api.setToken(response.data.accessToken);
        await useAuthStore.getState().fetchUser();
        const userRole = useAuthStore.getState().user?.roleId?.slug || 'member';
        router.push(userRole === 'owner' ? '/owner' : userRole === 'staff' ? '/staff' : '/member');
      } else {
        toast.success('Registration submitted successfully!');
        setSuccess(true);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md text-center shadow-lg border border-border/80">
          <CardContent className="pt-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Registration Submitted</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your registration is pending admin approval. You will be notified once the gym owner activates your account.
            </p>
            <Button asChild className="w-full mt-2">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (flowState === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-lg border border-border/80">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-2xl text-center font-bold">Register Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Verify your gym membership details to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="membershipId">Membership ID</Label>
              <Input
                id="membershipId"
                placeholder="e.g. MEMxyz"
                value={membershipId}
                onChange={(e) => setMembershipId(e.target.value)}
                className="text-center font-mono text-lg tracking-wider"
              />
              {error && <p className="text-xs text-destructive text-center font-medium mt-1">{error}</p>}
            </div>

            <Button
              type="button"
              onClick={handleVerifyMembership}
              className="w-full mt-2"
              disabled={verifying || !membershipId}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying ID...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground">Or register fresh</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset({
                  fullName: '',
                  email: '',
                  phone: '',
                  age: '',
                  gender: 'male',
                  height: '',
                  currentWeight: '',
                  weightLossGoal: '',
                  role: 'member',
                  membershipNumber: '',
                  password: '',
                  confirmPassword: '',
                } as any);
                setFlowState('new');
              }}
              className="w-full border-muted-foreground/30 hover:bg-accent/40"
            >
              Register as a New Member
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 bg-muted/30">
      <Card className="w-full max-w-md mx-auto shadow-lg border border-border/80">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl text-center font-bold">
            {flowState === 'existing' ? 'Generate Password' : 'Register Profile'}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground text-sm">
            {flowState === 'existing' 
              ? 'Complete your registration by generating your password.'
              : 'Create a new member registration request below.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {flowState === 'existing' && (
            <div className="bg-muted/50 p-4 rounded-lg border border-border/60 text-sm space-y-2 mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verified Membership Details</p>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-semibold text-foreground">{watch('fullName')}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-semibold text-foreground">{watch('email')}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-1.5">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-semibold text-foreground">{watch('phone') || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-semibold text-foreground capitalize">{watch('role')}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden fields for existing flow */}
            {flowState === 'existing' && (
              <>
                <input type="hidden" {...register('fullName')} />
                <input type="hidden" {...register('email')} />
                <input type="hidden" {...register('phone')} />
                <input type="hidden" {...register('age')} />
                <input type="hidden" {...register('gender')} />
                <input type="hidden" {...register('height')} />
                <input type="hidden" {...register('currentWeight')} />
                <input type="hidden" {...register('weightLossGoal')} />
                <input type="hidden" {...register('role')} />
                <input type="hidden" {...register('membershipNumber')} />
              </>
            )}

            {flowState === 'new' && (
              <>
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input {...register('fullName')} placeholder="First & Last Name" />
                  {errors.fullName && <p className="text-xs text-destructive font-medium">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" {...register('email')} placeholder="name@example.com" />
                  {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input {...register('phone')} placeholder="Contact phone number" />
                  {errors.phone && <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Registering As</Label>
                  <select {...register('role')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="member">Gym Member</option>
                    <option value="staff">Gym Trainer / Staff</option>
                  </select>
                  {errors.role && <p className="text-xs text-destructive font-medium">{errors.role.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Age</Label>
                    <Input type="number" {...register('age')} placeholder="Age" />
                    {errors.age && <p className="text-xs text-destructive font-medium">{errors.age.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender</Label>
                    <select {...register('gender')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-xs text-destructive font-medium">{errors.gender.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Height (cm)</Label>
                    <Input type="number" {...register('height')} placeholder="cm" />
                    {errors.height && <p className="text-xs text-destructive font-medium">{errors.height.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" {...register('currentWeight')} placeholder="kg" />
                    {errors.currentWeight && <p className="text-xs text-destructive font-medium">{errors.currentWeight.message}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Weight Loss Goal (kg)</Label>
                  <Input type="number" step="0.1" {...register('weightLossGoal')} placeholder="Optional goal" />
                  {errors.weightLossGoal && <p className="text-xs text-destructive font-medium">{errors.weightLossGoal.message}</p>}
                </div>
              </>
            )}

            <div className="space-y-1.5">
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
                <div className="space-y-1.5 mt-1.5">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${strength.textColor}`}>
                    Password Strength: {strength.label}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`pr-10 ${isConfirmPasswordMismatched ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
              {isConfirmPasswordMismatched ? (
                <p className="text-xs text-red-500 font-semibold mt-1">Passwords do not match</p>
              ) : (
                errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive text-center font-medium">{error}</p>}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {flowState === 'existing' ? 'Generating Password...' : 'Submitting Profile...'}
                </>
              ) : (
                flowState === 'existing' ? 'Generate Password & Login' : 'Register Account'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setFlowState('verify');
                setError('');
              }}
              className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors hover:underline"
            >
              ← Go Back to Verify Membership
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
