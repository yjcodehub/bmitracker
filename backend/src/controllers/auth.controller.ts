import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { User, Role } from '../models';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, result.message, 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendSuccess(res, {
        accessToken: result.accessToken,
        user: {
          id: result.user._id,
          email: result.user.email,
          roleId: result.user.roleId,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async sendOTP(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.sendOTP(req.body.phone);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async verifyOTP(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      const result = await authService.verifyOTPLogin(phone, otp);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendSuccess(res, { accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
      const result = await authService.refresh(token);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) await authService.logout(req.user.userId);
      res.clearCookie('refreshToken');
      sendSuccess(res, null, 'Logged out');
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user!.userId)
        .populate('roleId', 'name slug')
        .populate('memberId');
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { profilePhoto, phone } = req.body;
      const updateData: any = {};
      if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
      if (phone !== undefined) updateData.phone = phone;

      const user = await User.findByIdAndUpdate(
        req.user!.userId,
        { $set: updateData },
        { new: true }
      )
        .populate('roleId', 'name slug')
        .populate('memberId');

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
