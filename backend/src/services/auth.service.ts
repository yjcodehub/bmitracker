import bcrypt from 'bcryptjs';
import { User, Member, Role, Settings } from '../models';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt';
import { generateOTP, hashOTP, verifyOTP, generateResetToken } from '../utils/otp';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number;
    currentWeight: number;
    weightLossGoal?: number;
  }) {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ gymName: 'My Gym' });
    }

    const memberRole = await Role.findOne({ slug: 'member', isSystem: true });
    if (!memberRole) throw new AppError('Member role not configured', 500);

    const existing = await User.findOne({ gymId: settings._id, email: data.email });
    if (existing) throw new AppError('Email already registered', 409);

    const membershipNumber = `MEM${Date.now().toString(36).toUpperCase()}`;
    const passwordHash = await bcrypt.hash(data.password, 12);

    const member = await Member.create({
      gymId: settings._id,
      fullName: data.fullName,
      contactNumber: data.phone || '',
      email: data.email,
      age: data.age,
      gender: data.gender,
      height: data.height,
      currentWeight: data.currentWeight,
      weightLossGoal: data.weightLossGoal,
      membershipNumber,
      status: 'pending_approval',
    });

    const user = await User.create({
      gymId: settings._id,
      roleId: memberRole._id,
      email: data.email,
      phone: data.phone,
      passwordHash,
      memberId: member._id,
      status: 'pending_verification',
    });

    await Member.findByIdAndUpdate(member._id, { userId: user._id });

    return { user, member, message: 'Registration successful. Awaiting admin approval.' };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+passwordHash').populate('roleId');
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    if (user.status !== 'active') {
      throw new AppError('Account pending approval or inactive', 403);
    }

    const role = user.roleId as unknown as { slug: string; _id: string };
    const tokens = this.generateTokens(user, role.slug, role._id.toString());

    user.lastLoginAt = new Date();
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();

    return { user, ...tokens };
  }

  async sendOTP(phone: string) {
    const user = await User.findOne({ phone }).select('+otpHash +otpExpiresAt');
    if (!user) throw new AppError('Phone number not registered', 404);

    const otp = generateOTP();
    user.otpHash = await hashOTP(otp);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // In production, send via SMS gateway
    return { message: 'OTP sent', ...(process.env.NODE_ENV === 'development' && { otp }) };
  }

  async verifyOTPLogin(phone: string, otp: string) {
    const user = await User.findOne({ phone })
      .select('+otpHash +otpExpiresAt +passwordHash')
      .populate('roleId');
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      throw new AppError('Invalid OTP request', 400);
    }

    if (user.otpExpiresAt < new Date()) throw new AppError('OTP expired', 400);

    const valid = await verifyOTP(otp, user.otpHash);
    if (!valid) throw new AppError('Invalid OTP', 401);

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.status = 'active';

    const role = user.roleId as unknown as { slug: string; _id: string };
    const tokens = this.generateTokens(user, role.slug, role._id.toString());
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();

    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    const { verifyRefreshToken } = await import('../utils/jwt');
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId).select('+refreshToken').populate('roleId');
    if (!user || !user.refreshToken) throw new AppError('Invalid refresh token', 401);

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new AppError('Invalid refresh token', 401);

    const role = user.roleId as unknown as { slug: string; _id: string };
    const accessToken = generateAccessToken(this.buildPayload(user, role.slug, role._id.toString()));

    return { accessToken };
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email }).select('+resetToken +resetTokenExpiresAt');
    if (!user) return { message: 'If email exists, reset link has been sent' };

    const token = generateResetToken();
    user.resetToken = await bcrypt.hash(token, 10);
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    return {
      message: 'If email exists, reset link has been sent',
      ...(process.env.NODE_ENV === 'development' && { token }),
    };
  }

  async resetPassword(token: string, password: string) {
    const users = await User.find({
      resetTokenExpiresAt: { $gt: new Date() },
    }).select('+resetToken +resetTokenExpiresAt');

    let matchedUser = null;
    for (const user of users) {
      if (user.resetToken && (await bcrypt.compare(token, user.resetToken))) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) throw new AppError('Invalid or expired reset token', 400);

    matchedUser.passwordHash = await bcrypt.hash(password, 12);
    matchedUser.resetToken = undefined;
    matchedUser.resetTokenExpiresAt = undefined;
    await matchedUser.save();

    return { message: 'Password reset successful' };
  }

  private buildPayload(
    user: { _id: unknown; gymId: unknown; email: string; memberId?: unknown },
    roleSlug: string,
    roleId: string
  ): TokenPayload {
    const payload: TokenPayload = {
      userId: String(user._id),
      gymId: String(user.gymId),
      roleId,
      roleSlug,
      email: user.email,
    };
    if (user.memberId) {
      payload.memberId = String(user.memberId);
    }
    return payload;
  }

  private generateTokens(
    user: { _id: unknown; gymId: unknown; email: string; memberId?: unknown },
    roleSlug: string,
    roleId: string
  ) {
    const payload = this.buildPayload(user, roleSlug, roleId);
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
