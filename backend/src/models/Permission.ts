import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  resource: string;
  action: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    resource: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

permissionSchema.index({ resource: 1, action: 1 });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
