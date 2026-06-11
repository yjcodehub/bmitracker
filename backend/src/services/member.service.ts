import bcrypt from 'bcryptjs';
import { Member, User, Role } from '../models';
import { AppError } from '../middleware/errorHandler';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export class MemberService {
  async create(
    gymId: string,
    data: {
      fullName: string;
      contactNumber: string;
      email: string;
      age: number;
      gender: 'male' | 'female' | 'other';
      height: number;
      currentWeight: number;
      idealWeight?: number;
      weightLossGoal?: number;
      trainerId?: string;
      trainerName?: string;
      membershipNumber?: string;
      status?: 'pending_approval' | 'active' | 'inactive' | 'archived';
      password?: string;
    },
    createdBy?: string
  ) {
    const existing = await Member.findOne({ gymId, email: data.email });
    if (existing) throw new AppError('Member with this email already exists', 409);

    const membershipNumber =
      data.membershipNumber || `MEM${Date.now().toString(36).toUpperCase()}`;

    const member = await Member.create({
      gymId,
      ...data,
      membershipNumber,
      status: data.status || 'pending_approval',
      createdBy,
    });

    if (data.password) {
      const memberRole = await Role.findOne({ slug: 'member', isSystem: true });
      if (memberRole) {
        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await User.create({
          gymId,
          roleId: memberRole._id,
          email: data.email,
          phone: data.contactNumber,
          passwordHash,
          memberId: member._id,
          status: 'active',
        });
        await Member.findByIdAndUpdate(member._id, { userId: user._id });
      }
    }

    return member;
  }

  async list(
    gymId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      trainerId?: string;
    }
  ) {
    const { skip, page, limit } = getPagination(options);
    const filter: Record<string, unknown> = { gymId };

    if (options.status) filter.status = options.status;
    if (options.trainerId) filter.trainerId = options.trainerId;
    if (options.search) {
      filter.$text = { $search: options.search };
    }

    const [members, total] = await Promise.all([
      Member.find(filter)
        .populate('trainerId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Member.countDocuments(filter),
    ]);

    return { members, pagination: buildPaginationMeta(page, limit, total) };
  }

  async getById(id: string, gymId: string) {
    const member = await Member.findOne({ _id: id, gymId }).populate('trainerId', 'name');
    if (!member) throw new AppError('Member not found', 404);
    return member;
  }

  async update(id: string, gymId: string, data: Partial<{
    fullName: string;
    contactNumber: string;
    email: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number;
    currentWeight: number;
    idealWeight: number;
    weightLossGoal: number;
    trainerId: string;
    trainerName: string;
    profilePhoto: string;
    status: 'pending_approval' | 'active' | 'inactive' | 'archived';
  }>) {
    const member = await Member.findOneAndUpdate({ _id: id, gymId }, data, {
      new: true,
      runValidators: true,
    });
    if (!member) throw new AppError('Member not found', 404);
    return member;
  }

  async approve(id: string, gymId: string) {
    const member = await Member.findOneAndUpdate(
      { _id: id, gymId },
      { status: 'active' },
      { new: true }
    );
    if (!member) throw new AppError('Member not found', 404);

    if (member.userId) {
      await User.findByIdAndUpdate(member.userId, { status: 'active' });
    }

    return member;
  }

  async delete(id: string, gymId: string) {
    const member = await Member.findOneAndUpdate(
      { _id: id, gymId },
      { status: 'archived' },
      { new: true }
    );
    if (!member) throw new AppError('Member not found', 404);
    return member;
  }
}

export const memberService = new MemberService();
