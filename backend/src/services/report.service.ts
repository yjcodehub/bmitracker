import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Report, BMIRecord, Member, Settings, DietPlan } from '../models';
import { emailService } from './email.service';
import { AppError } from '../middleware/errorHandler';

const REPORTS_DIR = path.join(process.cwd(), 'uploads', 'reports');

export class ReportService {
  constructor() {
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
  }

  async generate(bmiRecordId: string, gymId: string, generatedBy?: string) {
    const record = await BMIRecord.findById(bmiRecordId).populate('memberId');
    if (!record) throw new AppError('BMI record not found', 404);

    const member = record.memberId as unknown as {
      fullName: string;
      email: string;
      membershipNumber: string;
      age: number;
      gender: string;
      height: number;
    };

    const settings = await Settings.findById(gymId);
    const dietPlan = record.dietPlanId
      ? await DietPlan.findById(record.dietPlanId)
      : null;

    const fileName = `report-${member.membershipNumber}-${Date.now()}.pdf`;
    const pdfPath = path.join(REPORTS_DIR, fileName);

    await this.buildPDF(pdfPath, {
      gymName: settings?.theme.gymName || 'Gym',
      member,
      record: {
        analysisDate: record.analysisDate,
        weight: record.weight,
        bmi: record.bmi,
        bmiCategory: record.bmiCategory,
        healthRisk: record.healthRisk,
        suggestedAction: record.suggestedAction,
        bodyComposition: { ...record.bodyComposition },
        trainerNotes: record.trainerNotes,
      },
      dietPlan,
    });

    const report = await Report.create({
      memberId: (record.memberId as { _id: unknown })._id || record.memberId,
      gymId,
      bmiRecordId,
      generatedBy,
      pdfPath,
      fileName,
    });

    return report;
  }

  async emailReport(reportId: string) {
    const report = await Report.findById(reportId);
    if (!report) throw new AppError('Report not found', 404);

    const member = await Member.findById(report.memberId);
    if (!member) throw new AppError('Member not found', 404);

    const pdfBuffer = fs.readFileSync(report.pdfPath);
    await emailService.sendReport(member.email, member.fullName, pdfBuffer, report.fileName);

    report.emailedAt = new Date();
    report.emailedTo = member.email;
    await report.save();

    return report;
  }

  private buildPDF(
    filePath: string,
    data: {
      gymName: string;
      member: {
        fullName: string;
        membershipNumber: string;
        age: number;
        gender: string;
        height: number;
      };
      record: {
        analysisDate: Date;
        weight: number;
        bmi: number;
        bmiCategory: string;
        healthRisk: string;
        suggestedAction: string;
        bodyComposition: {
          bodyFatPercent?: number;
          bodyFatStatus?: string;
          visceralFat?: number;
          visceralFatStatus?: string;
          muscleMass?: number;
          bmr?: number;
          bodyAge?: number;
          [key: string]: unknown;
        };
        trainerNotes?: string;
      };
      dietPlan: { name: string; meals: Record<string, unknown> } | null;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).text(data.gymName, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text('Body Analysis Report', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12).text(`Member: ${data.member.fullName}`);
      doc.text(`Membership: ${data.member.membershipNumber}`);
      doc.text(`Date: ${new Date(data.record.analysisDate).toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(14).text('BMI Analysis');
      doc.fontSize(12);
      doc.text(`Weight: ${data.record.weight} kg`);
      doc.text(`Height: ${data.member.height} cm`);
      doc.text(`BMI: ${data.record.bmi} (${data.record.bmiCategory})`);
      doc.text(`Health Risk: ${data.record.healthRisk}`);
      doc.text(`Suggested Action: ${data.record.suggestedAction}`);
      doc.moveDown();

      doc.fontSize(14).text('Body Composition');
      doc.fontSize(12);
      const bc = data.record.bodyComposition;
      doc.text(`Body Fat: ${bc.bodyFatPercent}% (${bc.bodyFatStatus})`);
      doc.text(`Visceral Fat: ${bc.visceralFat} (${bc.visceralFatStatus})`);
      doc.text(`Muscle Mass: ${bc.muscleMass} kg`);
      doc.text(`BMR: ${bc.bmr} kcal`);
      doc.text(`Body Age: ${bc.bodyAge}`);
      doc.moveDown();

      if (data.dietPlan) {
        doc.font('Helvetica-Bold').fontSize(14).text(`Diet Plan: ${data.dietPlan.name}`);
        doc.font('Helvetica').fontSize(10).text(`Water Intake: ${(data.dietPlan as any).waterIntakeGoal || '3-4 litres per day'}`);
        doc.moveDown(0.5);

        const meals = data.dietPlan.meals as any;
        const mealKeys: { key: string; label: string }[] = [
          { key: 'earlyMorning', label: 'Early Morning' },
          { key: 'breakfast', label: 'Breakfast' },
          { key: 'midSnack', label: 'Mid Snack' },
          { key: 'lunch', label: 'Lunch' },
          { key: 'eveningSnack', label: 'Evening Snack' },
          { key: 'dinner', label: 'Dinner' }
        ];

        for (const mKey of mealKeys) {
          const mealList = meals?.[mKey.key];
          if (Array.isArray(mealList) && mealList.length > 0) {
            doc.font('Helvetica-Bold').fontSize(11).text(mKey.label);
            doc.font('Helvetica').fontSize(10);
            for (const meal of mealList) {
              if (meal.items && meal.items.length > 0) {
                doc.text(`  - ${meal.items.join(', ')}`);
              }
            }
            doc.moveDown(0.3);
          }
        }
        doc.font('Helvetica').moveDown();
      }

      if (data.record.trainerNotes) {
        doc.fontSize(14).text('Trainer Notes');
        doc.fontSize(12).text(data.record.trainerNotes);
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}

export const reportService = new ReportService();
