import mongoose, { Document, Schema } from 'mongoose';

export interface IBMIRule {
  min: number;
  max: number;
  category: string;
  healthRisk: string;
  suggestedAction: string;
}

export interface IBodyCompositionRules {
  visceralFat: { normal: number; high: number; risk: number };
  trunkFat: { normalMax: number; highMin: number; highMax: number; riskMin: number };
  bodyFat: {
    male: { normalMin: number; normalMax: number; highMin: number; highMax: number; riskMin: number };
    female: { normalMin: number; normalMax: number; highMin: number; highMax: number; riskMin: number };
  };
  muscleMass: {
    male: { normalMin: number; normalMax: number };
    female: { normalMin: number; normalMax: number };
  };
  bmrReference: { male: number; female: number };
}

export interface ITheme {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  gymName: string;
  footerText: string;
}

export interface IEmailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
  welcomeEmailEnabled: boolean;
  reportEmailEnabled: boolean;
  reminderEmailEnabled: boolean;
}

export interface ISettings extends Document {
  gymName: string;
  ownerId?: Schema.Types.ObjectId;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  contactNumber?: string;
  website?: string;
  gstNumber?: string;
  theme: ITheme;
  bmiRules: IBMIRule[];
  bodyCompositionRules: IBodyCompositionRules;
  emailSettings: IEmailSettings;
  printSettings: {
    showLogo: boolean;
    showFooter: boolean;
    paperSize: 'A4' | 'Letter';
  };
  subscriptionSettings: {
    plan: string;
    expiresAt?: Date;
    maxMembers: number;
    maxStaff: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const defaultBMIRules: IBMIRule[] = [
  { min: 0, max: 18, category: 'Malnutrition', healthRisk: 'Severe underweight, risk of nutrient deficiency', suggestedAction: 'Consult nutritionist for weight gain program' },
  { min: 18.1, max: 20, category: 'Malnutrition 1', healthRisk: 'Underweight, weakened immune system', suggestedAction: 'Increase caloric intake with balanced nutrition' },
  { min: 20.1, max: 23, category: 'Normal', healthRisk: 'Healthy weight range', suggestedAction: 'Maintain current lifestyle and regular exercise' },
  { min: 23.1, max: 25, category: 'Overweight', healthRisk: 'Slightly elevated health risk', suggestedAction: 'Increase physical activity and monitor diet' },
  { min: 25.1, max: 28, category: 'Obesity Grade 1', healthRisk: 'Increased risk of cardiovascular disease', suggestedAction: 'Structured weight loss program with trainer' },
  { min: 28.1, max: 30, category: 'Obesity Grade 2', healthRisk: 'High risk of diabetes and heart disease', suggestedAction: 'Medical consultation and intensive fitness plan' },
  { min: 30.1, max: 999, category: 'Obesity Grade 3', healthRisk: 'Very high risk of serious health conditions', suggestedAction: 'Immediate medical intervention required' },
];

const defaultBodyRules: IBodyCompositionRules = {
  visceralFat: { normal: 8, high: 10, risk: 15 },
  trunkFat: { normalMax: 15, highMin: 16, highMax: 18, riskMin: 18 },
  bodyFat: {
    male: { normalMin: 10, normalMax: 20, highMin: 21, highMax: 25, riskMin: 25 },
    female: { normalMin: 20, normalMax: 30, highMin: 31, highMax: 35, riskMin: 35 },
  },
  muscleMass: {
    male: { normalMin: 33, normalMax: 36 },
    female: { normalMin: 30, normalMax: 33 },
  },
  bmrReference: { male: 2000, female: 1800 },
};

const bmiRuleSchema = new Schema<IBMIRule>(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    category: { type: String, required: true },
    healthRisk: { type: String, required: true },
    suggestedAction: { type: String, required: true },
  },
  { _id: false }
);

const settingsSchema = new Schema<ISettings>(
  {
    gymName: { type: String, required: true, default: 'My Gym' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, default: '' },
    openingTime: { type: String, default: '06:00' },
    closingTime: { type: String, default: '22:00' },
    contactNumber: { type: String, default: '' },
    website: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    theme: {
      primaryColor: { type: String, default: '#F97316' },
      secondaryColor: { type: String, default: '#0A0A0A' },
      logo: { type: String },
      gymName: { type: String, default: 'My Gym' },
      footerText: { type: String, default: 'Powered by BMI Tracker Pro' },
    },
    bmiRules: { type: [bmiRuleSchema], default: defaultBMIRules },
    bodyCompositionRules: { type: Schema.Types.Mixed, default: defaultBodyRules },
    emailSettings: {
      welcomeEmailEnabled: { type: Boolean, default: true },
      reportEmailEnabled: { type: Boolean, default: true },
      reminderEmailEnabled: { type: Boolean, default: true },
      smtpHost: { type: String, default: '' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: '' },
      smtpPassword: { type: String, default: '' },
      smtpFrom: { type: String, default: '' },
    },
    printSettings: {
      showLogo: { type: Boolean, default: true },
      showFooter: { type: Boolean, default: true },
      paperSize: { type: String, enum: ['A4', 'Letter'], default: 'A4' },
    },
    subscriptionSettings: {
      plan: { type: String, default: 'starter' },
      maxMembers: { type: Number, default: 500 },
      maxStaff: { type: Number, default: 20 },
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export { defaultBMIRules, defaultBodyRules };
