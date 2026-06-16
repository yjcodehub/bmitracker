export type UserRole = 'owner' | 'staff' | 'member';

export interface User {
  _id: string;
  email: string;
  phone?: string;
  status: string;
  roleId: {
    _id: string;
    name: string;
    slug: UserRole;
  };
  memberId?: Member;
  profilePhoto?: string;
  createdAt?: string;
}

export interface Trainer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  currentWeight: number;
  idealWeight?: number;
  weightLossGoal?: number;
  trainerId?: string;
  trainerName?: string;
  membershipNumber: string;
  registrationDate: string;
  profilePhoto?: string;
  status: string;
  userId?: {
    _id: string;
    roleId?: {
      _id: string;
      slug: UserRole;
      name: string;
    };
  };
}

export interface BMIRecord {
  _id: string;
  memberId: string;
  analysisDate: string;
  weight: number;
  height: number;
  bmi: number;
  bmiCategory: string;
  healthRisk: string;
  suggestedAction: string;
  bodyComposition: {
    bodyFatPercent: number;
    visceralFat: number;
    visceralFatStatus: string;
    bmr: number;
    bodyAge: number;
    totalBodyFat: number;
    trunkFat: number;
    trunkFatStatus: string;
    armFat: number;
    legFat: number;
    muscleMass: number;
    bodyFatStatus: string;
  };
  trainerNotes?: string;
  dietPlanId?: any;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  todayAnalyses: number;
  monthlyAnalyses: number;
  totalStaff: number;
  recentRegistrations: Member[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface GymTheme {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  gymName: string;
  footerText: string;
}

export interface BMIRule {
  min: number;
  max: number;
  category: string;
  healthRisk: string;
  suggestedAction: string;
}

export interface BodyCompositionRules {
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

export interface EmailSettings {
  welcomeEmailEnabled: boolean;
  reportEmailEnabled: boolean;
  reminderEmailEnabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpFrom?: string;
  hasPassword?: boolean;
}

export interface Permission {
  _id: string;
  resource: string;
  action: string;
  slug: string;
  description: string;
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description: string;
  permissionIds: Permission[] | string[];
  isSystem: boolean;
  gymId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  _id: string;
  gymId: string;
  userId: {
    _id: string;
    email: string;
    phone?: string;
    memberId?: {
      _id: string;
      fullName: string;
    };
  };
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: {
    method?: string;
    path?: string;
    [key: string]: any;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface StaffUser {
  _id: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending_verification';
  roleId: Role;
  memberId?: {
    _id: string;
    fullName: string;
    contactNumber?: string;
  };
  createdAt?: string;
}
