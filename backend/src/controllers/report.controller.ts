import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { reportService } from '../services/report.service';
import { Report } from '../models';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

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
      const reports = await Report.find({ gymId: req.user!.gymId })
        .populate('memberId', 'fullName membershipNumber')
        .sort({ createdAt: -1 });
      sendSuccess(res, reports);
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
