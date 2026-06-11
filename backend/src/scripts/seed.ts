import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { Permission, Role, User, Settings, DietPlan } from '../models';

const PERMISSIONS = [
  { resource: 'members', action: 'create', slug: 'members:create', description: 'Create members' },
  { resource: 'members', action: 'read', slug: 'members:read', description: 'View members' },
  { resource: 'members', action: 'update', slug: 'members:update', description: 'Update members' },
  { resource: 'members', action: 'delete', slug: 'members:delete', description: 'Delete members' },
  { resource: 'members', action: 'approve', slug: 'members:approve', description: 'Approve member registration' },
  { resource: 'bmi', action: 'create', slug: 'bmi:create', description: 'Create BMI analysis' },
  { resource: 'bmi', action: 'read', slug: 'bmi:read', description: 'View BMI records' },
  { resource: 'bmi', action: 'update', slug: 'bmi:update', description: 'Update BMI records' },
  { resource: 'bmi', action: 'delete', slug: 'bmi:delete', description: 'Delete BMI records' },
  { resource: 'reports', action: 'create', slug: 'reports:create', description: 'Generate reports' },
  { resource: 'reports', action: 'read', slug: 'reports:read', description: 'View reports' },
  { resource: 'reports', action: 'email', slug: 'reports:email', description: 'Email reports' },
  { resource: 'diet', action: 'create', slug: 'diet:create', description: 'Create diet plans' },
  { resource: 'diet', action: 'read', slug: 'diet:read', description: 'View diet plans' },
  { resource: 'diet', action: 'update', slug: 'diet:update', description: 'Update diet plans' },
  { resource: 'diet', action: 'delete', slug: 'diet:delete', description: 'Delete diet plans' },
  { resource: 'trainers', action: 'create', slug: 'trainers:create', description: 'Create trainers' },
  { resource: 'trainers', action: 'read', slug: 'trainers:read', description: 'View trainers' },
  { resource: 'trainers', action: 'update', slug: 'trainers:update', description: 'Update trainers' },
  { resource: 'trainers', action: 'delete', slug: 'trainers:delete', description: 'Delete trainers' },
  { resource: 'settings', action: 'read', slug: 'settings:read', description: 'View settings' },
  { resource: 'settings', action: 'update', slug: 'settings:update', description: 'Update settings' },
  { resource: 'rbac', action: 'create', slug: 'rbac:create', description: 'Create roles' },
  { resource: 'rbac', action: 'read', slug: 'rbac:read', description: 'View roles' },
  { resource: 'rbac', action: 'update', slug: 'rbac:update', description: 'Update roles' },
  { resource: 'rbac', action: 'delete', slug: 'rbac:delete', description: 'Delete roles' },
  { resource: 'staff', action: 'create', slug: 'staff:create', description: 'Create staff' },
  { resource: 'staff', action: 'read', slug: 'staff:read', description: 'View staff' },
  { resource: 'staff', action: 'update', slug: 'staff:update', description: 'Update staff' },
  { resource: 'staff', action: 'delete', slug: 'staff:delete', description: 'Delete staff' },
  { resource: 'analytics', action: 'read', slug: 'analytics:read', description: 'View analytics' },
  { resource: 'audit', action: 'read', slug: 'audit:read', description: 'View audit logs' },
  { resource: 'export', action: 'read', slug: 'export:read', description: 'Export data' },
];

const STAFF_PERMISSIONS = [
  'members:create', 'members:read', 'members:update',
  'bmi:create', 'bmi:read', 'bmi:update',
  'reports:create', 'reports:read', 'reports:email',
  'diet:read', 'trainers:read',
];

const MEMBER_PERMISSIONS = [
  'members:read', 'members:update',
  'bmi:read', 'reports:read', 'diet:read', 'trainers:read',
];

async function seed() {
  await connectDatabase();

  console.log('Seeding permissions...');
  const permissionDocs = await Promise.all(
    PERMISSIONS.map((p) =>
      Permission.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true })
    )
  );
  const permMap = Object.fromEntries(permissionDocs.map((p) => [p.slug, p._id]));

  console.log('Seeding roles...');
  const allPermIds = permissionDocs.map((p) => p._id);

  const ownerRole = await Role.findOneAndUpdate(
    { slug: 'owner', isSystem: true },
    { name: 'Gym Owner', slug: 'owner', isSystem: true, permissionIds: allPermIds, description: 'Full system access' },
    { upsert: true, new: true }
  );

  const staffRole = await Role.findOneAndUpdate(
    { slug: 'staff', isSystem: true },
    {
      name: 'Gym Staff',
      slug: 'staff',
      isSystem: true,
      permissionIds: STAFF_PERMISSIONS.map((s) => permMap[s]),
      description: 'Operational access',
    },
    { upsert: true, new: true }
  );

  await Role.findOneAndUpdate(
    { slug: 'member', isSystem: true },
    {
      name: 'Gym Member',
      slug: 'member',
      isSystem: true,
      permissionIds: MEMBER_PERMISSIONS.map((s) => permMap[s]),
      description: 'Self-service access',
    },
    { upsert: true, new: true }
  );

  console.log('Seeding gym settings...');
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      gymName: 'FitZone Gym',
      theme: {
        primaryColor: '#F97316',
        secondaryColor: '#0A0A0A',
        gymName: 'FitZone Gym',
        footerText: 'Powered by BMI Tracker Pro',
      },
    });
  }

  console.log('Seeding default diet plan...');
  const existingDiet = await DietPlan.findOne({ gymId: settings._id, name: 'Weight Loss Plan' });
  if (!existingDiet) {
    await DietPlan.create({
      gymId: settings._id,
      name: 'Weight Loss Plan',
      description: 'Default weight loss diet template',
      isTemplate: true,
      isVegetarian: true,
      isNonVegetarian: true,
      waterIntakeGoal: '3-4 litres per day',
      meals: {
        earlyMorning: [{ name: 'Early Morning', items: ['Black Coffee', 'Green Tea'] }],
        breakfast: [{ name: 'Breakfast', items: ['Oats', 'Boiled Eggs', 'Skimmed Milk', 'Brown Bread'] }],
        midSnack: [{ name: 'Mid Snack', items: ['Green Tea', 'Apple'] }],
        lunch: [{ name: 'Lunch', items: ['Roti', 'Sabji', 'Salad', 'Curd'] }],
        eveningSnack: [{ name: 'Evening Snack', items: ['Green Tea'] }],
        dinner: [{ name: 'Dinner', items: ['Roti', 'Sabji', 'Soup', 'Salad'] }],
      },
    });
  }

  console.log('Seeding owner account...');
  const existingOwner = await User.findOne({ email: 'owner@fitzone.com' });
  if (!existingOwner) {
    const passwordHash = await bcrypt.hash('Owner@123456', 12);
    const owner = await User.create({
      gymId: settings._id,
      roleId: ownerRole._id,
      email: 'owner@fitzone.com',
      phone: '9876543210',
      passwordHash,
      status: 'active',
    });
    await Settings.findByIdAndUpdate(settings._id, { ownerId: owner._id });
    console.log('Owner created: owner@fitzone.com / Owner@123456');
  }

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
