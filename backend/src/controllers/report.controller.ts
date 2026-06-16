import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { reportService } from '../services/report.service';
import { Report, Member } from '../models';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export class ReportController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.body.bmiRecordId) {
        throw new AppError('bmiRecordId is required', 400);
      }
      const report = await reportService.generate(
        req.body.bmiRecordId,
        req.user!.gymId,
        req.user!.userId
      );
      sendSuccess(res, report, 'PDF report generated successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await Report.findOne({ _id: String(req.params.id), gymId: req.user!.gymId });
      if (!report) throw new AppError('Report not found', 404);
      sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await Report.findOne({ _id: String(req.params.id), gymId: req.user!.gymId });
      if (!report) throw new AppError('Report not found', 404);
      
      // Serve the PDF file
      res.download(report.pdfPath, report.fileName, (err) => {
        if (err) {
          next(new AppError('Failed to download file', 500));
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async email(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.emailReport(String(req.params.id));
      sendSuccess(res, report, 'Report emailed successfully');
    } catch (err) {
      next(err);
    }
  }

  async listByMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await Report.find({
        memberId: String(req.params.memberId),
        gymId: req.user!.gymId,
      }).sort({ createdAt: -1 });
      sendSuccess(res, reports);
    } catch (err) {
      next(err);
    }
  }

  async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPagination({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });

      const conditions: Record<string, any>[] = [{ gymId: req.user!.gymId }];

      if (req.query.search) {
        const escapedSearch = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = { $regex: escapedSearch, $options: 'i' };

        // Find members whose name or membership number matches search query
        const matchedMembers = await Member.find({
          gymId: req.user!.gymId,
          $or: [
            { fullName: searchRegex },
            { membershipNumber: searchRegex },
          ],
        }).select('_id');

        const memberIds = matchedMembers.map((m) => m._id);

        conditions.push({
          $or: [
            { fileName: searchRegex },
            { memberId: { $in: memberIds } },
          ],
        });
      }

      const filter = conditions.length > 1 ? { $and: conditions } : conditions[0];

      const [reports, total] = await Promise.all([
        Report.find(filter)
          .populate('memberId', 'fullName membershipNumber')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Report.countDocuments(filter),
      ]);

      sendPaginated(res, reports, buildPaginationMeta(page, limit, total));
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
