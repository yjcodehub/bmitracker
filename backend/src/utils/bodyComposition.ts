import { Gender } from '../models/Member';
import { IBodyCompositionRules } from '../models/Settings';

type Status = 'normal' | 'high' | 'risk';

export function evaluateVisceralFat(value: number, rules: IBodyCompositionRules): Status {
  if (value <= rules.visceralFat.normal) return 'normal';
  if (value <= rules.visceralFat.high) return 'high';
  return 'risk';
}

export function evaluateTrunkFat(value: number, rules: IBodyCompositionRules): Status {
  if (value < rules.trunkFat.normalMax) return 'normal';
  if (value >= rules.trunkFat.highMin && value <= rules.trunkFat.highMax) return 'high';
  return 'risk';
}

export function evaluateBodyFat(
  value: number,
  gender: Gender,
  rules: IBodyCompositionRules
): Status {
  const g = gender === 'female' ? rules.bodyFat.female : rules.bodyFat.male;
  if (value >= g.normalMin && value <= g.normalMax) return 'normal';
  if (value >= g.highMin && value <= g.highMax) return 'high';
  return 'risk';
}

export function evaluateMuscleMass(
  value: number,
  gender: Gender,
  rules: IBodyCompositionRules
): Status {
  const g = gender === 'female' ? rules.muscleMass.female : rules.muscleMass.male;
  if (value >= g.normalMin && value <= g.normalMax) return 'normal';
  return value < g.normalMin ? 'high' : 'normal';
}
