import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Role, Permission, User } from '../models';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { clearPermissionCache } from '../middleware/rbac';

export class RbacController {
  async listRoles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const roles = await Role.find({
        $or: [
          { gymId },
          { isSystem: true }
        ]
      }).populate('permissionIds');

      sendSuccess(res, roles, 'Roles retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async listPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await Permission.find().sort({ resource: 1, action: 1 });
      sendSuccess(res, permissions, 'Permissions retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getRoleDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      const { id } = req.params;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const role = await Role.findOne({
        _id: id,
        $or: [{ gymId }, { isSystem: true }]
      }).populate('permissionIds');

      if (!role) {
        return next(new AppError('Role not found', 404));
      }

      sendSuccess(res, role);
    } catch (err) {
      next(err);
    }
  }

  async createRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const { name, description, permissionIds } = req.body;

      if (!name || !name.trim()) {
        return next(new AppError('Role name is required', 400));
      }

      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Check if role name / slug already exists for this gym
      const existing = await Role.findOne({ slug, gymId });
      if (existing) {
        return next(new AppError('Role name already exists in this gym', 400));
      }

      // Check system roles to avoid overrides
      const existingSystem = await Role.findOne({ slug, isSystem: true });
      if (existingSystem) {
        return next(new AppError('Role name conflicts with a system role', 400));
      }

      const role = await Role.create({
        name,
        slug,
        description: description || '',
        permissionIds: permissionIds || [],
        isSystem: false,
        gymId
      });

      sendSuccess(res, role, 'Role created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      const { id } = req.params;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const { name, description, permissionIds } = req.body;

      const role = await Role.findOne({ _id: id, gymId, isSystem: false });
      if (!role) {
        return next(new AppError('Custom role not found or cannot edit system roles', 404));
      }

      if (name) {
        role.name = name;
        role.slug = name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      if (description !== undefined) {
        role.description = description;
      }

      if (permissionIds) {
        role.permissionIds = permissionIds;
      }

      await role.save();

      // Clear cached permissions for this role
      clearPermissionCache(role.slug, role._id.toString());

      sendSuccess(res, role, 'Role updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      const { id } = req.params;
      if (!gymId) return next(new AppError('Gym ID not found', 401));

      const role = await Role.findOne({ _id: id, gymId, isSystem: false });
      if (!role) {
        return next(new AppError('Custom role not found or cannot delete system roles', 404));
      }

      // Check if any users are currently assigned to this role
      const usersWithRole = await User.findOne({ gymId, roleId: role._id });
      if (usersWithRole) {
        return next(new AppError('Cannot delete role that is currently assigned to one or more staff members', 400));
      }

      await Role.deleteOne({ _id: role._id });

      // Clear cache
      clearPermissionCache(role.slug, role._id.toString());

      sendSuccess(res, null, 'Role deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const rbacController = new RbacController();
