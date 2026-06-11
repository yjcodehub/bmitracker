import { IBMIRule } from '../models/Settings';

export interface BMIResult {
  bmi: number;
  category: string;
  healthRisk: string;
  suggestedAction: string;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function classifyBMI(bmi: number, rules: IBMIRule[]): BMIResult {
  const rule = rules.find((r) => bmi >= r.min && bmi <= r.max);

  if (!rule) {
    return {
      bmi,
      category: 'Unknown',
      healthRisk: 'Unable to classify',
      suggestedAction: 'Consult a healthcare professional',
    };
  }

  return {
    bmi,
    category: rule.category,
    healthRisk: rule.healthRisk,
    suggestedAction: rule.suggestedAction,
  };
}
