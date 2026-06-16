import { DietPlan } from '../models';
import { AppError } from '../middleware/errorHandler';

export class DietService {
  async create(
    gymId: string,
    data: {
      name: string;
      description?: string;
      isTemplate?: boolean;
      isVegetarian?: boolean;
      isNonVegetarian?: boolean;
      waterIntakeGoal?: string;
      meals: {
        earlyMorning?: { name: string; items: string[] }[];
        breakfast?: { name: string; items: string[] }[];
        midSnack?: { name: string; items: string[] }[];
        lunch?: { name: string; items: string[] }[];
        eveningSnack?: { name: string; items: string[] }[];
        dinner?: { name: string; items: string[] }[];
      };
      isActive?: boolean;
    }
  ) {
    const dietPlan = await DietPlan.create({
      ...data,
      gymId,
    });
    return dietPlan;
  }

  async list(
    gymId: string,
    options: {
      isTemplate?: boolean;
      isActive?: boolean;
      search?: string;
    } = {}
  ) {
    const filter: Record<string, any> = { gymId };
    
    if (options.isTemplate !== undefined) {
      filter.isTemplate = options.isTemplate;
    }
    
    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    if (options.search) {
      const escapedSearch = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    const plans = await DietPlan.find(filter).sort({ createdAt: -1 });
    return plans;
  }

  async getById(id: string, gymId: string) {
    const plan = await DietPlan.findOne({ _id: id, gymId });
    if (!plan) throw new AppError('Diet plan not found', 404);
    return plan;
  }

  async update(
    id: string,
    gymId: string,
    data: Partial<{
      name: string;
      description: string;
      isVegetarian: boolean;
      isNonVegetarian: boolean;
      waterIntakeGoal: string;
      meals: any;
      isActive: boolean;
    }>
  ) {
    const plan = await DietPlan.findOneAndUpdate(
      { _id: id, gymId },
      data,
      { new: true, runValidators: true }
    );
    if (!plan) throw new AppError('Diet plan not found', 404);
    return plan;
  }

  async delete(id: string, gymId: string) {
    const plan = await DietPlan.findOneAndUpdate(
      { _id: id, gymId },
      { isActive: false },
      { new: true }
    );
    if (!plan) throw new AppError('Diet plan not found', 404);
    return plan;
  }
}

export const dietService = new DietService();
