import mongoose from 'mongoose';
import { Member, BMIRecord, User, Role } from '../models';

export class AnalyticsService {
  async getOwnerDashboard(gymId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const staffRole = await Role.findOne({ slug: 'staff', isSystem: true });

    const [
      totalMembers,
      activeMembers,
      todayAnalyses,
      monthlyAnalyses,
      totalStaff,
      recentRegistrations,
    ] = await Promise.all([
      Member.countDocuments({ gymId }),
      Member.countDocuments({ gymId, status: 'active' }),
      BMIRecord.countDocuments({ gymId, analysisDate: { $gte: today } }),
      BMIRecord.countDocuments({ gymId, analysisDate: { $gte: monthStart } }),
      staffRole
        ? User.countDocuments({ gymId, roleId: staffRole._id, status: 'active' })
        : 0,
      Member.find({ gymId })
        .sort({ registrationDate: -1 })
        .limit(5)
        .select('fullName membershipNumber registrationDate status'),
    ]);

    return {
      totalMembers,
      activeMembers,
      todayAnalyses,
      monthlyAnalyses,
      totalStaff,
      recentRegistrations,
    };
  }

  async getStaffDashboard(gymId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalMembers,
      pendingMembers,
      todayAnalyses,
      recentAnalyses,
    ] = await Promise.all([
      Member.countDocuments({ gymId }),
      Member.countDocuments({ gymId, status: 'pending_approval' }),
      BMIRecord.countDocuments({ gymId, analysisDate: { $gte: today } }),
      BMIRecord.find({ gymId })
        .sort({ analysisDate: -1 })
        .limit(5)
        .populate('memberId', 'fullName membershipNumber weight currentWeight'),
    ]);

    return {
      totalMembers,
      pendingMembers,
      todayAnalyses,
      recentAnalyses,
    };
  }

  async getBMIDistribution(gymId: string) {
    const gymObjectId = new mongoose.Types.ObjectId(gymId);
    const result = await BMIRecord.aggregate([
      { $match: { gymId: gymObjectId } },
      { $sort: { analysisDate: -1 } },
      {
        $group: {
          _id: '$memberId',
          latestCategory: { $first: '$bmiCategory' },
        },
      },
      {
        $group: {
          _id: '$latestCategory',
          count: { $sum: 1 },
        },
      },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    return result;
  }

  async getWeightTrends(gymId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const gymObjectId = new mongoose.Types.ObjectId(gymId);

    return BMIRecord.aggregate([
      { $match: { gymId: gymObjectId, analysisDate: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$analysisDate' } },
          avgWeight: { $avg: '$weight' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', avgWeight: { $round: ['$avgWeight', 1] }, count: 1, _id: 0 } },
    ]);
  }

  async getMemberGrowth(gymId: string, months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    const gymObjectId = new mongoose.Types.ObjectId(gymId);

    return Member.aggregate([
      { $match: { gymId: gymObjectId, registrationDate: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$registrationDate' },
            month: { $month: '$registrationDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }
}

export const analyticsService = new AnalyticsService();
