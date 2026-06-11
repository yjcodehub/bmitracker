import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMealItem {
  name: string;
  items: string[];
}

export interface IDietPlan extends Document {
  gymId: Types.ObjectId;
  name: string;
  description?: string;
  isTemplate: boolean;
  isVegetarian: boolean;
  isNonVegetarian: boolean;
  waterIntakeGoal: string;
  meals: {
    earlyMorning: IMealItem[];
    breakfast: IMealItem[];
    midSnack: IMealItem[];
    lunch: IMealItem[];
    eveningSnack: IMealItem[];
    dinner: IMealItem[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const mealItemSchema = new Schema<IMealItem>(
  {
    name: { type: String, required: true },
    items: [{ type: String }],
  },
  { _id: false }
);

const dietPlanSchema = new Schema<IDietPlan>(
  {
    gymId: { type: Schema.Types.ObjectId, ref: 'Settings', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    isTemplate: { type: Boolean, default: true },
    isVegetarian: { type: Boolean, default: true },
    isNonVegetarian: { type: Boolean, default: false },
    waterIntakeGoal: { type: String, default: '3-4 litres per day' },
    meals: {
      earlyMorning: [mealItemSchema],
      breakfast: [mealItemSchema],
      midSnack: [mealItemSchema],
      lunch: [mealItemSchema],
      eveningSnack: [mealItemSchema],
      dinner: [mealItemSchema],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dietPlanSchema.index({ gymId: 1, isTemplate: 1 });
dietPlanSchema.index({ gymId: 1, isActive: 1 });

export const DietPlan = mongoose.model<IDietPlan>('DietPlan', dietPlanSchema);
