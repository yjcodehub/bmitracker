import { z } from 'zod';

const mealItemSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  items: z.array(z.string()).min(1, 'At least one item is required'),
});

export const createDietSchema = z.object({
  name: z.string().min(1, 'Diet plan name is required'),
  description: z.string().optional(),
  isTemplate: z.boolean().default(true),
  isVegetarian: z.boolean().default(true),
  isNonVegetarian: z.boolean().default(false),
  waterIntakeGoal: z.string().default('3-4 litres per day'),
  meals: z.object({
    earlyMorning: z.array(mealItemSchema).default([]),
    breakfast: z.array(mealItemSchema).default([]),
    midSnack: z.array(mealItemSchema).default([]),
    lunch: z.array(mealItemSchema).default([]),
    eveningSnack: z.array(mealItemSchema).default([]),
    dinner: z.array(mealItemSchema).default([]),
  }),
  isActive: z.boolean().default(true),
});

export const updateDietSchema = createDietSchema.partial();
