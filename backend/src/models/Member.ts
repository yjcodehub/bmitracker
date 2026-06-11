import mongoose, { Document, Schema, Types } from 'mongoose';

export type Gender = 'male' | 'female' | 'other';
export type MemberStatus = 'pending_approval' | 'active' | 'inactive' | 'archived';

export interface IMember extends Document {
  gymId: Types.ObjectId;
  userId?: Types.ObjectId;
  trainerId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  email: string;
  age: number;
  gender: Gender;
  height: number;
  currentWeight: number;
  idealWeight?: number;
  weightLossGoal?: number;
  trainerName?: string;
  membershipNumber: string;
  registrationDate: Date;
  profilePhoto?: string;
  status: MemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    height: { type: Number, required: true, min: 50, max: 300 },
    currentWeight: { type: Number, required: true, min: 20, max: 500 },
    idealWeight: { type: Number, min: 20, max: 500 },
    weightLossGoal: { type: Number, min: 0 },
    trainerName: { type: String, trim: true },
    membershipNumber: { type: String, required: true, trim: true },
    registrationDate: { type: Date, default: Date.now },
    profilePhoto: { type: String },
    status: {
      type: String,
      enum: ['pending_approval', 'active', 'inactive', 'archived'],
      default: 'pending_approval',
    },
  },
  { timestamps: true }
);

memberSchema.index({ gymId: 1, membershipNumber: 1 }, { unique: true });
memberSchema.index({ gymId: 1, email: 1 });
memberSchema.index({ gymId: 1, status: 1 });
memberSchema.index({ gymId: 1, trainerId: 1 });
memberSchema.index({ fullName: 'text', email: 'text', membershipNumber: 'text' });

export const Member = mongoose.model<IMember>('Member', memberSchema);
