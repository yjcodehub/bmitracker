import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReport extends Document {
  memberId: Types.ObjectId;
  gymId: Types.ObjectId;
  bmiRecordId: Types.ObjectId;
  generatedBy?: Types.ObjectId;
  pdfPath: string;
  fileName: string;
  emailedAt?: Date;
  emailedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings', required: true },
    bmiRecordId: { type: Schema.Types.ObjectId, ref: 'BMIRecord', required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pdfPath: { type: String, required: true },
    fileName: { type: String, required: true },
    emailedAt: { type: Date },
    emailedTo: { type: String },
  },
  { timestamps: true }
);

reportSchema.index({ memberId: 1, createdAt: -1 });
reportSchema.index({ gymId: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
