import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';
import { Role, Permission } from '../models';

const permissionCache = new Map<string, Set<string>>();

export async function loadRolePermissions(roleSlug: string, roleId: string): Promise<Set<string>> {
  const cacheKey = `${roleSlug}:${roleId}`;
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!;
  }

  const role = await Role.findById(roleId).populate('permissionIds');
  if (!role) return new Set();

  const slugs = new Set<string>();
  for (const perm of role.permissionIds) {
    if (typeof perm === 'object' && 'slug' in perm) {
      slugs.add((perm as { slug: string }).slug);
    }
  }

  permissionCache.set(cacheKey, slugs);
  return slugs;
}

export function requirePermission(...permissions: string[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (req.user.roleSlug === 'owner') {
      return next();
    }

    const userPerms = await loadRolePermissions(req.user.roleSlug, req.user.roleId);
    const hasPermission = permissions.some((p) => userPerms.has(p));

    if (!hasPermission) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.roleSlug)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
}
