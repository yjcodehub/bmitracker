import { BMIRecord, Member, Settings } from '../models';
import { calculateBMI, classifyBMI } from '../utils/bmi';
import {
  evaluateVisceralFat,
  evaluateTrunkFat,
  evaluateBodyFat,
} from '../utils/bodyComposition';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export class BMIService {
  async create(data: {
    memberId: string;
    gymId: string;
    staffId?: string;
    weight: number;
    bodyFatPercent: number;
    visceralFat: number;
    bmr: number;
    bodyAge: number;
    totalBodyFat: number;
    trunkFat: number;
    armFat: number;
    legFat: number;
    muscleMass: number;
    trunkMuscleMass?: number;
    armMuscleMass?: number;
    legMuscleMass?: number;
    dietPlanId?: string;
    trainerNotes?: string;
    analysisDate?: Date;
  }) {
    const member = await Member.findById(data.memberId);
    if (!member) throw new AppError('Member not found', 404);

    const settings = await Settings.findById(data.gymId);
    if (!settings) throw new AppError('Gym settings not found', 404);

    const bmiValue = calculateBMI(data.weight, member.height);
    const classification = classifyBMI(bmiValue, settings.bmiRules);
    const rules = settings.bodyCompositionRules;

    const record = await BMIRecord.create({
      memberId: data.memberId,
      gymId: data.gymId,
      staffId: data.staffId,
      analysisDate: data.analysisDate || new Date(),
      weight: data.weight,
      height: member.height,
      bmi: bmiValue,
      bmiCategory: classification.category,
      healthRisk: classification.healthRisk,
      suggestedAction: classification.suggestedAction,
      bodyComposition: {
        bodyFatPercent: data.bodyFatPercent,
        visceralFat: data.visceralFat,
        visceralFatStatus: evaluateVisceralFat(data.visceralFat, rules),
        bmr: data.bmr,
        bodyAge: data.bodyAge,
        totalBodyFat: data.totalBodyFat,
        trunkFat: data.trunkFat,
        trunkFatStatus: evaluateTrunkFat(data.trunkFat, rules),
        armFat: data.armFat,
        legFat: data.legFat,
        muscleMass: data.muscleMass,
        bodyFatStatus: evaluateBodyFat(data.bodyFatPercent, member.gender, rules),
        trunkMuscleMass: data.trunkMuscleMass || 0,
        armMuscleMass: data.armMuscleMass || 0,
        legMuscleMass: data.legMuscleMass || 0,
      },
      dietPlanId: data.dietPlanId,
      trainerNotes: data.trainerNotes,
    });

    await Member.findByIdAndUpdate(data.memberId, { currentWeight: data.weight });

    return record;
  }

  async getById(id: string) {
    const record = await BMIRecord.findById(id)
      .populate('memberId', 'fullName membershipNumber gender')
      .populate('dietPlanId', 'name meals');
    if (!record) throw new AppError('BMI record not found', 404);
    return record;
  }

  async getMemberHistory(memberId: string, page = 1, limit = 20) {
    const { skip, page: p, limit: l } = getPagination({ page, limit });
    const [records, total] = await Promise.all([
      BMIRecord.find({ memberId })
        .sort({ analysisDate: -1 })
        .skip(skip)
        .limit(l)
        .populate('dietPlanId', 'name meals isVegetarian isNonVegetarian waterIntakeGoal'),
      BMIRecord.countDocuments({ memberId }),
    ]);
    return { records, pagination: buildPaginationMeta(p, l, total) };
  }

  async calculate(weight: number, height: number, gymId: string) {
    const settings = await Settings.findById(gymId);
    const rules = settings?.bmiRules || [];
    const bmiValue = calculateBMI(weight, height);
    return classifyBMI(bmiValue, rules);
  }

  async delete(id: string) {
    const record = await BMIRecord.findByIdAndDelete(id);
    if (!record) throw new AppError('BMI record not found', 404);
    return record;
  }

  async assignDietPlan(id: string, dietPlanId: string | null) {
    const record = await BMIRecord.findByIdAndUpdate(
      id,
      { dietPlanId: dietPlanId || null },
      { new: true }
    ).populate('dietPlanId', 'name meals');
    if (!record) throw new AppError('BMI record not found', 404);
    return record;
  }
}

export const bmiService = new BMIService();
