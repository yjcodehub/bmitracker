'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { BMIRule } from '@/types';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, RotateCcw, Check } from 'lucide-react';

const WHO_DEFAULT_RULES: BMIRule[] = [
  { min: 0, max: 18, category: 'Malnutrition', healthRisk: 'Severe underweight, risk of nutrient deficiency', suggestedAction: 'Consult nutritionist for weight gain program' },
  { min: 18.1, max: 20, category: 'Malnutrition 1', healthRisk: 'Underweight, weakened immune system', suggestedAction: 'Increase caloric intake with balanced nutrition' },
  { min: 20.1, max: 23, category: 'Normal', healthRisk: 'Healthy weight range', suggestedAction: 'Maintain current lifestyle and regular exercise' },
  { min: 23.1, max: 25, category: 'Overweight', healthRisk: 'Slightly elevated health risk', suggestedAction: 'Increase physical activity and monitor diet' },
  { min: 25.1, max: 28, category: 'Obesity Grade 1', healthRisk: 'Increased risk of cardiovascular disease', suggestedAction: 'Structured weight loss program with trainer' },
  { min: 28.1, max: 30, category: 'Obesity Grade 2', healthRisk: 'High risk of diabetes and heart disease', suggestedAction: 'Medical consultation and intensive fitness plan' },
  { min: 30.1, max: 999, category: 'Obesity Grade 3', healthRisk: 'Very high risk of serious health conditions', suggestedAction: 'Immediate medical intervention required' },
];

export default function BmiRulesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<BMIRule[]>([]);

  useEffect(() => {
    api.get<BMIRule[]>('/settings/bmi-rules')
      .then((res) => {
        if (res.success && res.data) {
          setRules(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load BMI rules');
        setLoading(false);
      });
  }, []);

  const handleFieldChange = (index: number, field: keyof BMIRule, value: string | number) => {
    setRules((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'min' || field === 'max' ? parseFloat(value as string) || 0 : value,
      };
      return updated;
    });
  };

  const handleAddRow = () => {
    const lastRule = rules[rules.length - 1];
    const newMin = lastRule ? Number((lastRule.max + 0.1).toFixed(1)) : 0;
    const newMax = newMin + 5;

    setRules((prev) => [
      ...prev,
      {
        min: newMin,
        max: newMax,
        category: 'New Category',
        healthRisk: 'Enter health risk description',
        suggestedAction: 'Enter suggested actions',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRestoreDefaults = () => {
    if (confirm('Are you sure you want to restore the default WHO BMI classification guidelines? Any custom thresholds will be overwritten.')) {
      setRules(WHO_DEFAULT_RULES);
      toast.info('Default guidelines applied (remember to save changes)');
    }
  };

  const handleSave = async () => {
    // Basic validation
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      if (rule.min < 0 || rule.max < 0) {
        toast.error('Threshold limits must be positive numbers');
        return;
      }
      if (rule.min >= rule.max) {
        toast.error(`Category "${rule.category}" has min threshold larger than or equal to max`);
        return;
      }
      if (!rule.category.trim()) {
        toast.error('Category name cannot be blank');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await api.put<BMIRule[]>('/settings/bmi-rules', { bmiRules: rules });
      if (res.success) {
        toast.success('BMI classification rules saved successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save BMI rules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="BMI Classification Rules"
        subtitle="Configure the BMI thresholds and health advice rules used in user reports"
      />

      <Card className="shadow-md mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-semibold">Classification Matrix</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRestoreDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
            <Button size="sm" onClick={handleAddRow} className="bg-primary hover:bg-primary/95 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-medium">
                <th className="p-3 w-24">Min BMI</th>
                <th className="p-3 w-24">Max BMI</th>
                <th className="p-3 w-44">Category Tag</th>
                <th className="p-3">Associated Health Risk</th>
                <th className="p-3">Suggested Recommendation</th>
                <th className="p-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((rule, index) => (
                <tr key={index} className="hover:bg-accent/10 transition-colors">
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={rule.min}
                      onChange={(e) => handleFieldChange(index, 'min', e.target.value)}
                      className="h-8 px-2"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={rule.max}
                      onChange={(e) => handleFieldChange(index, 'max', e.target.value)}
                      className="h-8 px-2"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="text"
                      value={rule.category}
                      onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
                      className="h-8 px-2 font-medium"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="text"
                      value={rule.healthRisk}
                      onChange={(e) => handleFieldChange(index, 'healthRisk', e.target.value)}
                      className="h-8 px-2 text-xs"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="text"
                      value={rule.suggestedAction}
                      onChange={(e) => handleFieldChange(index, 'suggestedAction', e.target.value)}
                      className="h-8 px-2 text-xs"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRow(index)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    No BMI classification rules defined. Click "Add Row" or "Reset Defaults".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button size="lg" onClick={handleSave} disabled={saving} className="min-w-[150px]">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Rules
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
