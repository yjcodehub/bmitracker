import { DietPlan } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

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
      page?: number;
      limit?: number;
      isVegetarian?: boolean;
      isNonVegetarian?: boolean;
    } = {}
  ) {
    const { skip, page, limit } = getPagination(options);
    const filter: Record<string, any> = { gymId };
    
    if (options.isTemplate !== undefined) {
      filter.isTemplate = options.isTemplate;
    }
    
    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    if (options.isVegetarian !== undefined) {
      filter.isVegetarian = options.isVegetarian;
    }

    if (options.isNonVegetarian !== undefined) {
      filter.isNonVegetarian = options.isNonVegetarian;
    }

    if (options.search) {
      const escapedSearch = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    const [plans, total] = await Promise.all([
      DietPlan.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      DietPlan.countDocuments(filter),
    ]);
    return { plans, pagination: buildPaginationMeta(page, limit, total) };
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
