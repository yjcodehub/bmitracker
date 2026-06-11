'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

const bmiSchema = z.object({
  memberId: z.string().min(1, 'Member ID required'),
  weight: z.coerce.number().min(20).max(500),
  bodyFatPercent: z.coerce.number().min(0).max(100),
  visceralFat: z.coerce.number().min(0),
  bmr: z.coerce.number().min(0),
  bodyAge: z.coerce.number().min(0),
  totalBodyFat: z.coerce.number().min(0),
  trunkFat: z.coerce.number().min(0),
  armFat: z.coerce.number().min(0),
  legFat: z.coerce.number().min(0),
  muscleMass: z.coerce.number().min(0),
  trainerNotes: z.string().optional(),
});

type BMIForm = z.infer<typeof bmiSchema>;

export default function NewBMIPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BMIForm>({
    resolver: zodResolver(bmiSchema),
  });

  const onSubmit = async (data: BMIForm) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/bmi', data);
      router.push('/staff');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="New BMI Analysis" subtitle="Record body composition data" />

      <Card>
        <CardContent className="p-4 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Member ID</Label>
              <Input {...register('memberId')} placeholder="Paste member ID" />
              {errors.memberId && <p className="text-sm text-destructive">{errors.memberId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" {...register('weight')} />
              </div>
              <div className="space-y-2">
                <Label>Body Fat %</Label>
                <Input type="number" step="0.1" {...register('bodyFatPercent')} />
              </div>
              <div className="space-y-2">
                <Label>Visceral Fat</Label>
                <Input type="number" step="0.1" {...register('visceralFat')} />
              </div>
              <div className="space-y-2">
                <Label>BMR (kcal)</Label>
                <Input type="number" {...register('bmr')} />
              </div>
              <div className="space-y-2">
                <Label>Body Age</Label>
                <Input type="number" {...register('bodyAge')} />
              </div>
              <div className="space-y-2">
                <Label>Muscle Mass (kg)</Label>
                <Input type="number" step="0.1" {...register('muscleMass')} />
              </div>
              <div className="space-y-2">
                <Label>Total Body Fat</Label>
                <Input type="number" step="0.1" {...register('totalBodyFat')} />
              </div>
              <div className="space-y-2">
                <Label>Trunk Fat</Label>
                <Input type="number" step="0.1" {...register('trunkFat')} />
              </div>
              <div className="space-y-2">
                <Label>Arm Fat</Label>
                <Input type="number" step="0.1" {...register('armFat')} />
              </div>
              <div className="space-y-2">
                <Label>Leg Fat</Label>
                <Input type="number" step="0.1" {...register('legFat')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trainer Notes</Label>
              <Input {...register('trainerNotes')} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save Analysis'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
