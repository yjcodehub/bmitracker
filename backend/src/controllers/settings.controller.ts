import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Settings } from '../models';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import nodemailer from 'nodemailer';

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

  async getTheme(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const settings = await Settings.findById(gymId);
      if (!settings) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, settings.theme || {
        primaryColor: '#F97316',
        secondaryColor: '#0A0A0A',
        gymName: settings.gymName || 'FitZone Gym',
        footerText: 'Powered by BMI Tracker Pro'
      });
    } catch (err) {
      next(err);
    }
  }

  async updateTheme(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const { primaryColor, secondaryColor, logo, gymName, footerText } = req.body;

      const updated = await Settings.findByIdAndUpdate(
        gymId,
        {
          theme: { primaryColor, secondaryColor, logo, gymName, footerText },
          gymName: gymName
        },
        { new: true, runValidators: true }
      );

      if (!updated) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, updated.theme, 'Theme updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getBMIRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const settings = await Settings.findById(gymId);
      if (!settings) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, settings.bmiRules || []);
    } catch (err) {
      next(err);
    }
  }

  async updateBMIRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const { bmiRules } = req.body;
      if (!Array.isArray(bmiRules)) {
        return next(new AppError('bmiRules must be an array', 400));
      }

      const updated = await Settings.findByIdAndUpdate(
        gymId,
        { bmiRules },
        { new: true, runValidators: true }
      );

      if (!updated) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, updated.bmiRules, 'BMI rules updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getBodyRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const settings = await Settings.findById(gymId);
      if (!settings) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, settings.bodyCompositionRules);
    } catch (err) {
      next(err);
    }
  }

  async updateBodyRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const { bodyCompositionRules } = req.body;

      const updated = await Settings.findByIdAndUpdate(
        gymId,
        { bodyCompositionRules },
        { new: true, runValidators: true }
      );

      if (!updated) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, updated.bodyCompositionRules, 'Body composition rules updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getEmailSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const settings = await Settings.findById(gymId);
      if (!settings) return next(new AppError('Gym settings not found', 404));

      const emailSettings = settings.emailSettings || {
        welcomeEmailEnabled: true,
        reportEmailEnabled: true,
        reminderEmailEnabled: true,
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpFrom: ''
      };

      sendSuccess(res, {
        welcomeEmailEnabled: emailSettings.welcomeEmailEnabled,
        reportEmailEnabled: emailSettings.reportEmailEnabled,
        reminderEmailEnabled: emailSettings.reminderEmailEnabled,
        smtpHost: emailSettings.smtpHost || '',
        smtpPort: emailSettings.smtpPort || 587,
        smtpUser: emailSettings.smtpUser || '',
        smtpFrom: emailSettings.smtpFrom || '',
        hasPassword: !!emailSettings.smtpPassword,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateEmailSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gymId = req.user?.gymId;
      if (!gymId) return next(new AppError('Unauthorized: Gym ID not found', 401));

      const settings = await Settings.findById(gymId);
      if (!settings) return next(new AppError('Gym settings not found', 404));

      const {
        welcomeEmailEnabled,
        reportEmailEnabled,
        reminderEmailEnabled,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        smtpFrom
      } = req.body;

      const emailSettingsUpdate: any = {
        welcomeEmailEnabled: !!welcomeEmailEnabled,
        reportEmailEnabled: !!reportEmailEnabled,
        reminderEmailEnabled: !!reminderEmailEnabled,
        smtpHost: smtpHost || '',
        smtpPort: smtpPort || 587,
        smtpUser: smtpUser || '',
        smtpFrom: smtpFrom || '',
      };

      if (smtpPassword && smtpPassword !== '********') {
        emailSettingsUpdate.smtpPassword = smtpPassword;
      } else if (settings.emailSettings?.smtpPassword) {
        emailSettingsUpdate.smtpPassword = settings.emailSettings.smtpPassword;
      }

      const updated = await Settings.findByIdAndUpdate(
        gymId,
        { emailSettings: emailSettingsUpdate },
        { new: true, runValidators: true }
      );

      if (!updated) return next(new AppError('Gym settings not found', 404));

      sendSuccess(res, {
        welcomeEmailEnabled: updated.emailSettings.welcomeEmailEnabled,
        reportEmailEnabled: updated.emailSettings.reportEmailEnabled,
        reminderEmailEnabled: updated.emailSettings.reminderEmailEnabled,
        smtpHost: updated.emailSettings.smtpHost,
        smtpPort: updated.emailSettings.smtpPort,
        smtpUser: updated.emailSettings.smtpUser,
        smtpFrom: updated.emailSettings.smtpFrom,
        hasPassword: !!updated.emailSettings.smtpPassword
      }, 'Email settings updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async testEmailConnection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { smtpHost, smtpPort, smtpUser, smtpPassword } = req.body;
      if (!smtpHost || !smtpUser || !smtpPassword) {
        return next(new AppError('Host, User and Password are required to test connection', 400));
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
        connectionTimeout: 5000
      });

      await transporter.verify();
      sendSuccess(res, null, 'SMTP Connection test successful!');
    } catch (err: any) {
      next(new AppError(`SMTP Connection test failed: ${err.message}`, 400));
    }
  }
}

export const settingsController = new SettingsController();
