import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITrainer extends Document {
  gymId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trainerSchema = new Schema<ITrainer>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    specialization: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

trainerSchema.index({ gymId: 1, name: 1 });
trainerSchema.index({ gymId: 1, isActive: 1 });

export const Trainer = mongoose.model<ITrainer>('Trainer', trainerSchema);
