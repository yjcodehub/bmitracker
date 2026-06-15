import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBodyComposition {
  bodyFatPercent: number;
  visceralFat: number;
  visceralFatStatus: 'normal' | 'high' | 'risk';
  bmr: number;
  bodyAge: number;
  totalBodyFat: number;
  trunkFat: number;
  trunkFatStatus: 'normal' | 'high' | 'risk';
  armFat: number;
  legFat: number;
  muscleMass: number;
  bodyFatStatus: 'normal' | 'high' | 'risk';
  trunkMuscleMass?: number;
  armMuscleMass?: number;
  legMuscleMass?: number;
}

export interface IBMIRecord extends Document {
  memberId: Types.ObjectId;
  gymId: Types.ObjectId;
  staffId?: Types.ObjectId;
  analysisDate: Date;
  weight: number;
  height: number;
  bmi: number;
  bmiCategory: string;
  healthRisk: string;
  suggestedAction: string;
  bodyComposition: IBodyComposition;
  dietPlanId?: Types.ObjectId;
  trainerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bodyCompositionSchema = new Schema<IBodyComposition>(
  {
    bodyFatPercent: { type: Number, required: true },
    visceralFat: { type: Number, required: true },
    visceralFatStatus: { type: String, enum: ['normal', 'high', 'risk'], required: true },
    bmr: { type: Number, required: true },
    bodyAge: { type: Number, required: true },
    totalBodyFat: { type: Number, required: true },
    trunkFat: { type: Number, required: true },
    trunkFatStatus: { type: String, enum: ['normal', 'high', 'risk'], required: true },
    armFat: { type: Number, required: true },
    legFat: { type: Number, required: true },
    muscleMass: { type: Number, required: true },
    bodyFatStatus: { type: String, enum: ['normal', 'high', 'risk'], required: true },
    trunkMuscleMass: { type: Number, default: 0 },
    armMuscleMass: { type: Number, default: 0 },
    legMuscleMass: { type: Number, default: 0 },
  },
  { _id: false }
);

const bmiRecordSchema = new Schema<IBMIRecord>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User' },
    analysisDate: { type: Date, default: Date.now },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    bmi: { type: Number, required: true },
    bmiCategory: { type: String, required: true },
    healthRisk: { type: String, required: true },
    suggestedAction: { type: String, required: true },
    bodyComposition: { type: bodyCompositionSchema, required: true },
    dietPlanId: { type: Schema.Types.ObjectId, ref: 'DietPlan' },
    trainerNotes: { type: String },
  },
  { timestamps: true }
);

bmiRecordSchema.index({ memberId: 1, analysisDate: -1 });
bmiRecordSchema.index({ gymId: 1, analysisDate: -1 });
bmiRecordSchema.index({ gymId: 1, memberId: 1 });

export const BMIRecord = mongoose.model<IBMIRecord>('BMIRecord', bmiRecordSchema);
