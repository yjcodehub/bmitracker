import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserStatus = 'active' | 'inactive' | 'pending_verification';

export interface IUser extends Document {
  gymId: Types.ObjectId;
  roleId: Types.ObjectId;
  email: string;
  phone?: string;
  passwordHash: string;
  status: UserStatus;
  memberId?: Types.ObjectId;
  refreshToken?: string;
  otpHash?: string;
  otpExpiresAt?: Date;
  resetToken?: string;
  resetTokenExpiresAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings', required: true },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_verification'],
      default: 'pending_verification',
    },
    memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    refreshToken: { type: String, select: false },
    otpHash: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ gymId: 1, email: 1 }, { unique: true });
userSchema.index({ gymId: 1, phone: 1 }, { sparse: true });
userSchema.index({ gymId: 1, roleId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
