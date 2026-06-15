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
