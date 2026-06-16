import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, Member, Role } from '../models';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export class StaffController {
  async listStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      // Find all roles that are not owner or member
      const roles = await Role.find({
        $or: [
          { gymId, slug: { $nin: ['owner', 'member'] } },
          { isSystem: true, slug: { $nin: ['owner', 'member'] } }
        ]
      });
      const roleIds = roles.map((r) => r._id);

      const query: any = { gymId, roleId: { $in: roleIds } };

      if (search) {
        const matchingMembers = await Member.find({
          gymId,
          fullName: { $regex: search, $options: 'i' },
        });
        const memberIds = matchingMembers.map((m) => m._id);
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { memberId: { $in: memberIds } }
        ];
      }

      const total = await User.countDocuments(query);
      const staff = await User.find(query)
        .populate('roleId', 'name slug description')
        .populate('memberId')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      sendPaginated(res, staff, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }

  async getStaffDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      const { id } = req.params;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const user = await User.findOne({ _id: id, gymId })
        .populate('roleId', 'name slug description')
        .populate('memberId');

      if (!user) {
        return next(new AppError('Staff member not found', 404));
      }

      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  async createStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const { fullName, email, phone, password, roleId } = req.body;

      if (!fullName || !email || !password || !roleId) {
        return next(new AppError('Missing required fields: fullName, email, password, roleId', 400));
      }

      const role = await Role.findOne({
        _id: roleId,
        $or: [{ gymId }, { isSystem: true }],
        slug: { $nin: ['owner', 'member'] }
      });

      if (!role) {
        return next(new AppError('Invalid role ID or role not allowed for staff', 400));
      }

      const existingUser = await User.findOne({ gymId, email });
      if (existingUser) {
        return next(new AppError('Email already registered in this gym', 400));
      }

      // Create Member record with staff flag
      const member = await Member.create({
        gymId,
        fullName,
        contactNumber: phone || '',
        email,
        age: 30, // Default placeholders
        gender: 'other',
        height: 170,
        currentWeight: 70,
        membershipNumber: `STAFF-${Date.now().toString(36).toUpperCase()}`,
        status: 'active',
        role: 'staff',
        registrationDate: new Date().toISOString()
      });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        gymId,
        roleId: role._id,
        email,
        phone,
        passwordHash,
        memberId: member._id,
        status: 'active',
      });

      member.userId = user._id;
      await member.save();

      sendSuccess(res, {
        id: user._id,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleId: user.roleId,
        memberId: member._id,
      }, 'Staff member created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      const { id } = req.params;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const { fullName, phone, roleId, status, password } = req.body;

      const user = await User.findOne({ _id: id, gymId });
      if (!user) {
        return next(new AppError('Staff member not found', 404));
      }

      if (roleId) {
        const role = await Role.findOne({
          _id: roleId,
          $or: [{ gymId }, { isSystem: true }],
          slug: { $nin: ['owner', 'member'] }
        });
        if (!role) {
          return next(new AppError('Invalid role ID or role not allowed for staff', 400));
        }
        user.roleId = role._id;
      }

      if (status) {
        user.status = status;
      }

      if (phone !== undefined) {
        user.phone = phone;
      }

      if (password) {
        user.passwordHash = await bcrypt.hash(password, 12);
      }

      await user.save();

      if (user.memberId) {
        await Member.findByIdAndUpdate(user.memberId, {
          fullName,
          contactNumber: phone || ''
        });
      }

      sendSuccess(res, {
        id: user._id,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roleId: user.roleId,
      }, 'Staff member updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      const { id } = req.params;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const user = await User.findOne({ _id: id, gymId });
      if (!user) {
        return next(new AppError('Staff member not found', 404));
      }

      if (user._id.toString() === req.user!.userId) {
        return next(new AppError('You cannot delete your own account', 400));
      }

      await User.deleteOne({ _id: id });
      if (user.memberId) {
        await Member.deleteOne({ _id: user.memberId });
      }

      sendSuccess(res, null, 'Staff member deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const staffController = new StaffController();
