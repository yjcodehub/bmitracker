'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { BodyCompositionRules } from '@/types';
import { toast } from 'sonner';
import { Loader2, Check, RotateCcw } from 'lucide-react';

const DEFAULT_BODY_RULES: BodyCompositionRules = {
  visceralFat: { normal: 8, high: 10, risk: 15 },
  trunkFat: { normalMax: 15, highMin: 16, highMax: 18, riskMin: 18 },
  bodyFat: {
    male: { normalMin: 10, normalMax: 20, highMin: 21, highMax: 25, riskMin: 25 },
    female: { normalMin: 20, normalMax: 30, highMin: 31, highMax: 35, riskMin: 35 },
  },
  muscleMass: {
    male: { normalMin: 33, normalMax: 36 },
    female: { normalMin: 30, normalMax: 33 },
  },
  bmrReference: { male: 2000, female: 1800 },
};

export default function BodyRulesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<BodyCompositionRules | null>(null);

  useEffect(() => {
    api.get<BodyCompositionRules>('/settings/body-rules')
      .then((res) => {
        if (res.success && res.data) {
          setRules(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load body composition rules');
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rules) return;

    setSaving(true);
    try {
      const res = await api.put<BodyCompositionRules>('/settings/body-rules', { bodyCompositionRules: rules });
      if (res.success) {
        toast.success('Body composition rules saved successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all body composition evaluation parameters to the system defaults?')) {
      setRules(DEFAULT_BODY_RULES);
      toast.info('Default ranges loaded (remember to click save)');
    }
  };

  if (loading || !rules) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Body Composition Evaluation Rules"
        subtitle="Manage normal, high, and risk ranges for biometric measurements"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global/General Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visceral Fat Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visceral Fat Index</CardTitle>
              <CardDescription>Normal, High, and Risk category thresholds (in units)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="visceralNormal">Normal Max</Label>
                  <Input
                    type="number"
                    id="visceralNormal"
                    value={rules.visceralFat.normal}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      visceralFat: { ...prev.visceralFat, normal: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="visceralHigh">High Min</Label>
                  <Input
                    type="number"
                    id="visceralHigh"
                    value={rules.visceralFat.high}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      visceralFat: { ...prev.visceralFat, high: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="visceralRisk">Risk Min</Label>
                  <Input
                    type="number"
                    id="visceralRisk"
                    value={rules.visceralFat.risk}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      visceralFat: { ...prev.visceralFat, risk: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trunk Fat Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trunk Fat Percentage (%)</CardTitle>
              <CardDescription>Fat content thresholds in the body trunk segment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="trunkNormal">Normal Max</Label>
                  <Input
                    type="number"
                    id="trunkNormal"
                    value={rules.trunkFat.normalMax}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      trunkFat: { ...prev.trunkFat, normalMax: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="trunkHighMin">High Min</Label>
                  <Input
                    type="number"
                    id="trunkHighMin"
                    value={rules.trunkFat.highMin}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      trunkFat: { ...prev.trunkFat, highMin: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="trunkHighMax">High Max</Label>
                  <Input
                    type="number"
                    id="trunkHighMax"
                    value={rules.trunkFat.highMax}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      trunkFat: { ...prev.trunkFat, highMax: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="trunkRisk">Risk Min</Label>
                  <Input
                    type="number"
                    id="trunkRisk"
                    value={rules.trunkFat.riskMin}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      trunkFat: { ...prev.trunkFat, riskMin: parseFloat(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gender Specific Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MALE Parameters */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="text-base text-blue-600 flex items-center gap-2">
                Male Biometric Ranges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-xs text-muted-foreground uppercase">Body Fat % Ranges</Label>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <Label className="text-[10px]" htmlFor="mFatNormMin">Norm Min</Label>
                    <Input
                      type="number"
                      id="mFatNormMin"
                      value={rules.bodyFat.male.normalMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.male.normalMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="mFatNormMax">Norm Max</Label>
                    <Input
                      type="number"
                      id="mFatNormMax"
                      value={rules.bodyFat.male.normalMax}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.male.normalMax = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="mFatHighMin">High Min</Label>
                    <Input
                      type="number"
                      id="mFatHighMin"
                      value={rules.bodyFat.male.highMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.male.highMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="mFatHighMax">High Max</Label>
                    <Input
                      type="number"
                      id="mFatHighMax"
                      value={rules.bodyFat.male.highMax}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.male.highMax = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="mFatRisk">Risk Min</Label>
                    <Input
                      type="number"
                      id="mFatRisk"
                      value={rules.bodyFat.male.riskMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.male.riskMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-semibold text-xs text-muted-foreground uppercase">Muscle Mass % Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={rules.muscleMass.male.normalMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.muscleMass.male.normalMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={rules.muscleMass.male.normalMax}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.muscleMass.male.normalMax = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mBmr" className="font-semibold text-xs text-muted-foreground uppercase">BMR Reference (kcal)</Label>
                  <Input
                    type="number"
                    id="mBmr"
                    value={rules.bmrReference.male}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      bmrReference: { ...prev.bmrReference, male: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FEMALE Parameters */}
          <Card className="border-t-4 border-t-pink-500">
            <CardHeader>
              <CardTitle className="text-base text-pink-600 flex items-center gap-2">
                Female Biometric Ranges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-xs text-muted-foreground uppercase">Body Fat % Ranges</Label>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <Label className="text-[10px]" htmlFor="fFatNormMin">Norm Min</Label>
                    <Input
                      type="number"
                      id="fFatNormMin"
                      value={rules.bodyFat.female.normalMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.female.normalMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="fFatNormMax">Norm Max</Label>
                    <Input
                      type="number"
                      id="fFatNormMax"
                      value={rules.bodyFat.female.normalMax}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.female.normalMax = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="fFatHighMin">High Min</Label>
                    <Input
                      type="number"
                      id="fFatHighMin"
                      value={rules.bodyFat.female.highMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.female.highMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="fFatHighMax">High Max</Label>
                    <Input
                      type="number"
                      id="fFatHighMax"
                      value={rules.bodyFat.female.highMax}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.female.highMax = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]" htmlFor="fFatRisk">Risk Min</Label>
                    <Input
                      type="number"
                      id="fFatRisk"
                      value={rules.bodyFat.female.riskMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.bodyFat.female.riskMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                      className="px-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-semibold text-xs text-muted-foreground uppercase">Muscle Mass % Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={rules.muscleMass.female.normalMin}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.muscleMass.female.normalMin = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={rules.muscleMass.female.normalMax}
                      onChange={(e) => setRules((prev: any) => {
                        const next = { ...prev };
                        next.muscleMass.female.normalMax = parseFloat(e.target.value) || 0;
                        return next;
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="fBmr" className="font-semibold text-xs text-muted-foreground uppercase">BMR Reference (kcal)</Label>
                  <Input
                    type="number"
                    id="fBmr"
                    value={rules.bmrReference.female}
                    onChange={(e) => setRules((prev: any) => ({
                      ...prev,
                      bmrReference: { ...prev.bmrReference, female: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore System Defaults
          </Button>
          <Button type="submit" className="min-w-[150px]" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Ranges
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
