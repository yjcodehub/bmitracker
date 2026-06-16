import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Multer Setup for Logo Upload
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, webp, svg) are allowed'));
    }
  }
});

router.use(authenticate);

// Legacy/General settings
router.get('/gym', requirePermission('settings:read'), settingsController.getGymSettings);
router.put('/gym', requirePermission('settings:update'), settingsController.updateGymSettings);

// Sub-settings
router.get('/theme', requirePermission('settings:read'), settingsController.getTheme);
router.put('/theme', requirePermission('settings:update'), settingsController.updateTheme);

// Logo upload endpoint
router.post('/logo', requirePermission('settings:update'), upload.single('logo'), (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }
    const logoUrl = `/uploads/${req.file.filename}`;
    sendSuccess(res, { logoUrl }, 'Logo uploaded successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/bmi-rules', requirePermission('settings:read'), settingsController.getBMIRules);
router.put('/bmi-rules', requirePermission('settings:update'), settingsController.updateBMIRules);

router.get('/body-rules', requirePermission('settings:read'), settingsController.getBodyRules);
router.put('/body-rules', requirePermission('settings:update'), settingsController.updateBodyRules);

router.get('/email', requirePermission('settings:read'), settingsController.getEmailSettings);
router.put('/email', requirePermission('settings:update'), settingsController.updateEmailSettings);
router.post('/email/test', requirePermission('settings:update'), settingsController.testEmailConnection);

export default router;
