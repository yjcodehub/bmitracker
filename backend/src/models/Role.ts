import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRole extends Document {
  name: string;
  slug: string;
  description: string;
  permissionIds: Types.ObjectId[];
  isSystem: boolean;
  gymId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    permissionIds: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    isSystem: { type: Boolean, default: false },
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings' },
  },
  { timestamps: true }
);

roleSchema.index({ slug: 1, gymId: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);
