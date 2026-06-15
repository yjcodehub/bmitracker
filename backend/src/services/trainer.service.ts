import { Trainer } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export class TrainerService {
  async create(
    gymId: string,
    data: {
      name: string;
      email?: string | null;
      phone?: string | null;
      specialization?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await Trainer.findOne({ gymId, name: data.name });
    if (existing) {
      throw new AppError('Trainer with this name already exists in the gym', 409);
    }

    const trainer = await Trainer.create({
      gymId,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      specialization: data.specialization || undefined,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return trainer;
  }

  async list(
    gymId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    }
  ) {
    const { skip, page, limit } = getPagination(options);
    const filter: Record<string, unknown> = { gymId };

    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    if (options.search) {
      filter.name = { $regex: options.search, $options: 'i' };
    }

    const [trainers, total] = await Promise.all([
      Trainer.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Trainer.countDocuments(filter),
    ]);

    return { trainers, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getById(id: string, gymId: string) {
    const trainer = await Trainer.findOne({ _id: id, gymId });
    if (!trainer) throw new AppError('Trainer not found', 404);
    return trainer;
  }

  async update(
    id: string,
    gymId: string,
    data: Partial<{
      name: string;
      email: string | null;
      phone: string | null;
      specialization: string | null;
      isActive: boolean;
    }>
  ) {
    // Check if updating name to an existing trainer name
    if (data.name) {
      const existing = await Trainer.findOne({ gymId, name: data.name, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Trainer with this name already exists in the gym', 409);
      }
    }

    const trainer = await Trainer.findOneAndUpdate(
      { _id: id, gymId },
      {
        ...data,
        email: data.email === null ? undefined : data.email,
        phone: data.phone === null ? undefined : data.phone,
        specialization: data.specialization === null ? undefined : data.specialization,
      },
      { new: true, runValidators: true }
    );

    if (!trainer) throw new AppError('Trainer not found', 404);
    return trainer;
  }

  async delete(id: string, gymId: string) {
    const trainer = await Trainer.findOneAndDelete({ _id: id, gymId });
    if (!trainer) throw new AppError('Trainer not found', 404);
    return trainer;
  }
}

export const trainerService = new TrainerService();
