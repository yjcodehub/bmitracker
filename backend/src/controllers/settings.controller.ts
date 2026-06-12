import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Settings } from '../models';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';

export class SettingsController {
  async getGymSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) {
        return next(new AppError('Unauthorized: Gym ID not found', 401));
      }

      const settings = await Settings.findById(gymId);
      if (!settings) {
        return next(new AppError('Gym settings not found', 404));
      }

      sendSuccess(res, {
        name: settings.gymName,
        address: settings.address || '',
        openingTime: settings.openingTime || '06:00',
        closingTime: settings.closingTime || '22:00',
        contactNumber: settings.contactNumber || '',
        website: settings.website || '',
        gstNumber: settings.gstNumber || '',
      });
    } catch (err) {
      next(err);
    }
  }

  async updateGymSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) {
        return next(new AppError('Unauthorized: Gym ID not found', 401));
      }

      const { name, address, openingTime, closingTime, contactNumber, website, gstNumber } = req.body;

      if (!name || !name.trim()) {
        return next(new AppError('Gym name is required', 400));
      }

      const updated = await Settings.findByIdAndUpdate(
        gymId,
        {
          gymName: name,
          address: address || '',
          openingTime: openingTime || '06:00',
          closingTime: closingTime || '22:00',
          contactNumber: contactNumber || '',
          website: website || '',
          gstNumber: gstNumber || '',
        },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return next(new AppError('Gym settings not found', 404));
      }

      sendSuccess(res, {
        name: updated.gymName,
        address: updated.address || '',
        openingTime: updated.openingTime || '06:00',
        closingTime: updated.closingTime || '22:00',
        contactNumber: updated.contactNumber || '',
        website: updated.website || '',
        gstNumber: updated.gstNumber || '',
      }, 'Gym settings updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const settingsController = new SettingsController();
