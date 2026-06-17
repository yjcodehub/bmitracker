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
      settings: settings ? {
        gymName: settings.gymName,
        theme: settings.theme,
        contactNumber: settings.contactNumber,
        website: settings.website,
        address: settings.address,
      } : null,
      member,
      record: {
        analysisDate: record.analysisDate,
        weight: record.weight,
        bmi: record.bmi,
        bmiCategory: record.bmiCategory,
        healthRisk: record.healthRisk,
        suggestedAction: record.suggestedAction,
        bodyComposition: { ...record.bodyComposition } as any,
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

    const record = await BMIRecord.findById(report.bmiRecordId);
    if (!record) throw new AppError('BMI record not found', 404);

    const settings = await Settings.findById(report.gymId);
    const dietPlan = record.dietPlanId
      ? await DietPlan.findById(record.dietPlanId)
      : null;

    const pdfBuffer = fs.readFileSync(report.pdfPath);
    await emailService.sendReport(
      member.email,
      member.fullName,
      pdfBuffer,
      report.fileName,
      {
        member,
        record,
        settings,
        dietPlan,
      }
    );

    report.emailedAt = new Date();
    report.emailedTo = member.email;
    await report.save();

    return report;
  }

  private buildPDF(
    filePath: string,
    data: {
      settings: {
        gymName: string;
        theme?: {
          primaryColor?: string;
          secondaryColor?: string;
          footerText?: string;
        };
        contactNumber?: string;
        website?: string;
        address?: string;
      } | null;
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
          totalBodyFat?: number;
          trunkFat?: number;
          trunkFatStatus?: string;
          armFat?: number;
          legFat?: number;
          trunkMuscleMass?: number;
          armMuscleMass?: number;
          legMuscleMass?: number;
          [key: string]: any;
        };
        trainerNotes?: string;
      };
      dietPlan: { name: string; meals: Record<string, any>; waterIntakeGoal?: string } | null;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const PAGE_WIDTH = 595.28;
      const PAGE_HEIGHT = 841.89;
      const primaryColor = data.settings?.theme?.primaryColor || '#F97316';
      const secondaryColor = data.settings?.theme?.secondaryColor || '#0D0D0D';

      // --- PAGE 1 ---
      // 1. Header Banner (Edge-to-edge)
      doc.rect(0, 0, PAGE_WIDTH, 130).fill(secondaryColor);
      doc.rect(0, 125, PAGE_WIDTH, 5).fill(primaryColor);

      // 2. Logo placement
      let logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
      if (!fs.existsSync(logoPath)) {
        logoPath = path.join(process.cwd(), 'dist', 'assets', 'logo.png');
      }
      if (!fs.existsSync(logoPath)) {
        logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
      }

      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 40, 20, { width: 90 });
        } catch (err) {
          // Fallback if image loading fails
          doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16).text(data.settings?.gymName || 'FITZONE', 40, 45);
          doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('GET ACTIVE, GET FIT.', 40, 65);
        }
      } else {
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16).text(data.settings?.gymName || 'FITZONE', 40, 45);
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('GET ACTIVE, GET FIT.', 40, 65);
      }

      // 3. Member Metadata Card
      const metaX = 380;
      const metaY = 25;
      doc.roundedRect(metaX - 10, metaY - 5, 185, 75, 4).fillOpacity(0.08).fill('#FFFFFF');
      doc.fillOpacity(1.0); // Reset opacity
      
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text('Member Name:', metaX, metaY);
      doc.font('Helvetica').fillColor('#E5E7EB').text(data.member.fullName, metaX + 85, metaY);

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').text('Membership ID:', metaX, metaY + 18);
      doc.font('Helvetica').fillColor('#E5E7EB').text(data.member.membershipNumber, metaX + 85, metaY + 18);

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').text('Date:', metaX, metaY + 36);
      doc.font('Helvetica').fillColor('#E5E7EB').text(new Date(data.record.analysisDate).toLocaleDateString('en-GB'), metaX + 85, metaY + 36);

      // 4. Report Title
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(22).text('BODY ANALYSIS REPORT', 0, 155, { align: 'center', width: PAGE_WIDTH });

      // 5. Section 1 Header
      doc.rect(40, 195, 515.28, 26).fill(primaryColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('1. BMI ANALYSIS (Body Mass Index)', 50, 203);

      // 6. Weight, Height, BMI Cards
      const cardY = 232;
      const cardH = 65;
      // Weight
      doc.roundedRect(40, cardY, 150, cardH, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('Weight:', 52, cardY + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(18).text(`${data.record.weight} kg`, 52, cardY + 28);

      // Height
      doc.roundedRect(205, cardY, 150, cardH, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('Height:', 217, cardY + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(18).text(`${data.member.height} cm`, 217, cardY + 28);

      // BMI
      doc.roundedRect(370, cardY, 185, cardH, 6).fill(primaryColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('BMI:', 385, cardY + 12);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22).text(`${data.record.bmi}`, 385, cardY + 26);

      // 7. BMI Bar & Slider
      const barY = 325;
      const barH = 12;
      const barW = 515.28;
      const barX = 40;

      // Segment widths proportional to ranges on scale 15 to 35 (Range = 20)
      const wUnder = ((18.5 - 15) / 20) * barW; // 90.17
      const wNorm  = ((25 - 18.5) / 20) * barW; // 167.47
      const wOver  = ((30 - 25) / 20) * barW;    // 128.82
      const wObese = ((35 - 30) / 20) * barW;    // 128.82

      // Draw segments
      doc.rect(barX, barY, wUnder, barH).fill('#60A5FA');
      doc.rect(barX + wUnder, barY, wNorm, barH).fill('#34D399');
      doc.rect(barX + wUnder + wNorm, barY, wOver, barH).fill('#FBBF24');
      doc.rect(barX + wUnder + wNorm + wOver, barY, wObese, barH).fill('#F87171');

      // Segment text labels
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(8);
      doc.text('UNDERWEIGHT', barX, barY + 18, { width: wUnder, align: 'center' });
      doc.text('NORMAL', barX + wUnder, barY + 18, { width: wNorm, align: 'center' });
      doc.text('OVERWEIGHT', barX + wUnder + wNorm, barY + 18, { width: wOver, align: 'center' });
      doc.text('OBESE', barX + wUnder + wNorm + wOver, barY + 18, { width: wObese, align: 'center' });

      // Pointer Position Calculation
      let bmiPct = (data.record.bmi - 15) / 20;
      if (bmiPct < 0) bmiPct = 0;
      if (bmiPct > 1) bmiPct = 1;
      const pointerX = barX + bmiPct * barW;

      // Draw pointer (triangle)
      doc.moveTo(pointerX, barY - 1).lineTo(pointerX - 6, barY - 9).lineTo(pointerX + 6, barY - 9).closePath().fill(secondaryColor);
      // Pointer Label
      doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(9).text(`${data.record.bmi} (${data.record.bmiCategory})`, pointerX - 50, barY - 21, { width: 100, align: 'center' });

      // 8. Status Details Card
      const statusY = 370;
      doc.roundedRect(40, statusY, 515.28, 65, 6).fill('#1F2937');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('Current Status: ', 55, statusY + 14, { continued: true });
      doc.fillColor(primaryColor).text(data.record.bmiCategory.toUpperCase() + ' (BMI ' + data.record.bmi + ')', { continued: true });
      doc.fillColor('#D1D5DB').font('Helvetica').text('. ' + data.record.healthRisk + '. ' + data.record.suggestedAction, { width: 485, lineGap: 3 });

      // 9. Gym Owner Comment Box
      const commentY = 455;
      doc.rect(40, commentY, 160, 18).fill('#C2410C');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5).text("GYM OWNER'S COMMENT", 50, commentY + 4.5);

      doc.roundedRect(40, commentY + 18, 515.28, 90, 6).fill('#F9FAFB');
      doc.roundedRect(40, commentY + 18, 515.28, 90, 6).strokeColor('#E5E7EB').stroke();
      doc.fillColor('#374151').font('Helvetica-Oblique').fontSize(10).text(
        data.record.trainerNotes || `Great start, ${data.member.fullName.split(' ')[0]}! Let's schedule a consultation with our fitness trainer to create a personalized training and nutrition plan to hit your target. Keep pushing!`, 
        60, commentY + 36, { width: 475, lineGap: 4 }
      );

      // 10. Page 1 Graphic/Motivational text
      doc.fillColor('#E5E7EB').font('Helvetica-Bold').fontSize(36).text('STRONGER', 40, 680);
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(36).text('EVERY DAY', 40, 720);
      
      // Horizontal separator line
      doc.moveTo(40, 775).lineTo(PAGE_WIDTH - 40, 775).strokeColor('#E5E7EB').lineWidth(1.5).stroke();

      // 11. Footer (Page 1)
      const footerY = 795;
      const contactText = `Contact Us: ${data.settings?.contactNumber || 'info@skfitnessclub.com'} | Website: ${data.settings?.website || 'www.skfitnessclub.com'} | Address: ${data.settings?.address || 'Fitness Center'}`;
      
      doc.rect(0, footerY, PAGE_WIDTH, 47).fill(secondaryColor);
      doc.fillColor('#9CA3AF').font('Helvetica').fontSize(8).text(contactText, 0, footerY + 11, { align: 'center', width: PAGE_WIDTH });
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5).text('Powerd by veggainz Solutions', 0, footerY + 26, { align: 'center', width: PAGE_WIDTH });


      // --- PAGE 2 ---
      doc.addPage();
      
      // 1. Header (Smaller edge-to-edge)
      doc.rect(0, 0, PAGE_WIDTH, 60).fill(secondaryColor);
      doc.rect(0, 57, PAGE_WIDTH, 3).fill(primaryColor);

      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 40, 10, { width: 40 });
        } catch (err) {}
      }
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('BODY ANALYSIS REPORT', 95, 22);

      // 2. Section 2 Header
      const s2Y = 80;
      doc.rect(40, s2Y, 515.28, 25).fill(primaryColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('2. BODY COMPOSITION', 50, s2Y + 7);

      // Subtitle
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9.5).text('Dynamic Infographics', 40, s2Y + 38);

      // 3. Grid of Cards
      const bc = data.record.bodyComposition;
      const gridY = s2Y + 53;
      const gridH = 135;

      // Card 1: Body Fat
      doc.roundedRect(40, gridY, 160, gridH, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('Body Fat', 52, gridY + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(16).text(`${bc.bodyFatPercent || 0}%`, 52, gridY + 28);
      doc.fillColor('#6B7280').font('Helvetica').fontSize(8.5).text(`(${bc.totalBodyFat || 0} kg)`, 52, gridY + 45);
      
      const bfStatus = String(bc.bodyFatStatus || 'normal').toUpperCase();
      let bfColor = '#34D399';
      if (bfStatus === 'HIGH') bfColor = '#FBBF24';
      if (bfStatus === 'RISK') bfColor = '#F87171';
      doc.fillColor(bfColor).font('Helvetica-Bold').fontSize(8).text(bfStatus, 52, gridY + 58);

      // Mini Vertical Bar Chart for Body Fat
      const chartX = 115;
      const chartY = gridY + 95;
      const chartMaxH = 45;
      doc.moveTo(chartX, chartY).lineTo(chartX + 35, chartY).strokeColor('#9CA3AF').lineWidth(1).stroke();

      const valTrunkF = bc.trunkFat || 0;
      const valArmF   = bc.armFat || 0;
      const valLegF   = bc.legFat || 0;
      const maxFVal   = Math.max(valTrunkF, valArmF, valLegF, 5);

      const hTrunkF = (valTrunkF / maxFVal) * chartMaxH;
      const hArmF   = (valArmF / maxFVal) * chartMaxH;
      const hLegF   = (valLegF / maxFVal) * chartMaxH;

      doc.rect(chartX + 2, chartY - hTrunkF, 6, hTrunkF).fill(primaryColor);
      doc.rect(chartX + 12, chartY - hArmF, 6, hArmF).fill(secondaryColor);
      doc.rect(chartX + 22, chartY - hLegF, 6, hLegF).fill('#6B7280');

      doc.fillColor('#9CA3AF').font('Helvetica').fontSize(6);
      doc.text('Tr', chartX + 2, chartY + 4);
      doc.text('Ar', chartX + 12, chartY + 4);
      doc.text('Lg', chartX + 22, chartY + 4);

      // Card 2: Visceral Fat Gauge
      doc.roundedRect(215, gridY, 160, gridH, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('Visceral Fat', 227, gridY + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(16).text(`Lvl ${bc.visceralFat || 0}`, 227, gridY + 28);
      
      const vfStatus = String(bc.visceralFatStatus || 'normal').toUpperCase();
      let vfColor = '#34D399';
      if (vfStatus === 'HIGH') vfColor = '#FBBF24';
      if (vfStatus === 'RISK') vfColor = '#F87171';
      doc.fillColor(vfColor).font('Helvetica-Bold').fontSize(8).text(vfStatus, 227, gridY + 45);

      // Gauge needle vector drawing
      const gX = 295;
      const gY = gridY + 115;
      const gRad = 28;
      // Draw background semicircle arc
      (doc as any).arc(gX, gY, gRad, Math.PI, 2 * Math.PI).strokeColor('#D1D5DB').lineWidth(5).stroke();
      
      // Visceral fat clamp between 1 and 20
      const vfVal = Math.min(Math.max(bc.visceralFat || 1, 1), 20);
      const vfAngle = Math.PI + ((vfVal - 1) / 19) * Math.PI;
      const needleX = gX + (gRad - 5) * Math.cos(vfAngle);
      const needleY = gY + (gRad - 5) * Math.sin(vfAngle);

      doc.moveTo(gX, gY).lineTo(needleX, needleY).strokeColor(primaryColor).lineWidth(1.8).stroke();
      doc.circle(gX, gY, 3).fill(primaryColor);

      // Card 3: Muscle Mass
      doc.roundedRect(390, gridY, 165, gridH, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('Muscle Mass', 402, gridY + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(16).text(`${bc.muscleMass || 0} kg`, 402, gridY + 28);
      doc.fillColor('#34D399').font('Helvetica-Bold').fontSize(8).text('OPTIMAL', 402, gridY + 45);

      // Segment Muscle Mass Progress Bars
      const barStartX = 442;
      const barMaxW = 95;
      const valTrunkM = bc.trunkMuscleMass || 0;
      const valArmM   = bc.armMuscleMass || 0;
      const valLegM   = bc.legMuscleMass || 0;
      const maxMVal   = Math.max(valTrunkM, valArmM, valLegM, 20);

      const wTrunkM = valTrunkM ? (valTrunkM / maxMVal) * barMaxW : 0;
      const wArmM   = valArmM ? (valArmM / maxMVal) * barMaxW : 0;
      const wLegM   = valLegM ? (valLegM / maxMVal) * barMaxW : 0;

      // Trunk Row
      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text('Trunk', 402, gridY + 70);
      doc.rect(barStartX, gridY + 71, barMaxW, 4.5).fill('#E5E7EB');
      doc.rect(barStartX, gridY + 71, wTrunkM, 4.5).fill(primaryColor);

      // Arm Row
      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text('Arms', 402, gridY + 88);
      doc.rect(barStartX, gridY + 89, barMaxW, 4.5).fill('#E5E7EB');
      doc.rect(barStartX, gridY + 89, wArmM, 4.5).fill(secondaryColor);

      // Leg Row
      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text('Legs', 402, gridY + 106);
      doc.rect(barStartX, gridY + 107, barMaxW, 4.5).fill('#E5E7EB');
      doc.rect(barStartX, gridY + 107, wLegM, 4.5).fill('#6B7280');


      // 4. Row 2 of Cards: BMR & Body Age
      const grid2Y = gridY + 148;
      const grid2H = 60;

      // Card 4: BMR
      doc.roundedRect(40, grid2Y, 250, grid2H, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('BMR (Basal Metabolic Rate)', 52, grid2Y + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(15).text(`${bc.bmr || 0} kcal`, 52, grid2Y + 26);
      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text('Daily baseline calorie requirement', 52, grid2Y + 44);

      // Card 5: Body Age
      doc.roundedRect(305, grid2Y, 250, grid2H, 6).fill('#F3F4F6');
      doc.fillColor('#4B5563').font('Helvetica-Bold').fontSize(9).text('Body Age', 317, grid2Y + 12);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(15).text(`${bc.bodyAge || 0} Years`, 317, grid2Y + 26);
      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text(`Actual Age: ${data.member.age} Years`, 317, grid2Y + 44);


      // 5. Section 3: Recommended Actions & Support
      const s3Y = grid2Y + 75;
      doc.rect(40, s3Y, 515.28, 25).fill(primaryColor);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('3. RECOMMENDED ACTIONS & SUPPORT', 50, s3Y + 7);

      // Columns split layout
      const colY = s3Y + 40;
      
      // Left Column: Guidelines
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10.5).text('Increase Physical Activity', 40, colY);
      doc.fillColor('#4B5563').font('Helvetica').fontSize(8.5);
      doc.text('• 3-4 structured workout sessions per week.', 40, colY + 16);
      doc.text('• Incorporate both resistance training and HIIT cardio.', 40, colY + 28);
      doc.text('• Focus on progressive overload to build lean muscle.', 40, colY + 40);

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10.5).text('Monitor Diet & Hydration', 40, colY + 65);
      doc.fillColor('#4B5563').font('Helvetica').fontSize(8.5);
      doc.text('• Ensure you meet daily macronutrient & protein goals.', 40, colY + 81);
      doc.text('• Drink 3-4 litres of water daily for overall metabolic health.', 40, colY + 93);
      doc.text('• Minimize sugar and high-sodium processed foods.', 40, colY + 105);

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10.5).text('Member Resources', 40, colY + 130);
      doc.fillColor('#2563EB').font('Helvetica-Bold').fontSize(8.5).text('Book Trainer Session  |  Nutrition Guide  |  Club Calendar', 40, colY + 146);

      // Right Column: Assigned Diet Plan Card
      const dietX = 305;
      const dietW = 250;
      doc.roundedRect(dietX, colY - 5, dietW, 168, 6).fill('#F9FAFB');
      doc.roundedRect(dietX, colY - 5, dietW, 168, 6).strokeColor('#E5E7EB').stroke();

      if (data.dietPlan) {
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9.5).text('ASSIGNED DIET PLAN', dietX + 15, colY + 7);
        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(data.dietPlan.name, dietX + 15, colY + 21, { width: 220, height: 16 });
        doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text(`Hydration Goal: ${data.dietPlan.waterIntakeGoal || '3-4 Litres/day'}`, dietX + 15, colY + 36);

        const meals = data.dietPlan.meals as any;
        let mY = colY + 54;
        const keys = [
          { k: 'breakfast', l: 'Breakfast' },
          { k: 'lunch', l: 'Lunch' },
          { k: 'dinner', l: 'Dinner' }
        ];

        for (const item of keys) {
          const mList = meals?.[item.k];
          if (Array.isArray(mList) && mList.length > 0 && mList[0]?.items?.length > 0) {
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8).text(item.l, dietX + 15, mY);
            doc.fillColor('#4B5563').font('Helvetica').fontSize(7.5).text(mList[0].items.slice(0, 3).join(', '), dietX + 15, mY + 10, { width: 220, height: 14 });
            mY += 26;
          }
        }
      } else {
        // Fallback placeholder diet template
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9.5).text('DIET RECOMMENDATION', dietX + 15, colY + 7);
        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text('Balanced Lifestyle Diet', dietX + 15, colY + 21);
        doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text('Water target: 3-4 litres daily', dietX + 15, colY + 36);

        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8).text('Breakfast', dietX + 15, colY + 54);
        doc.fillColor('#4B5563').font('Helvetica').fontSize(7.5).text('Oatmeal, banana, 3 egg whites', dietX + 15, colY + 64);

        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8).text('Lunch', dietX + 15, colY + 80);
        doc.fillColor('#4B5563').font('Helvetica').fontSize(7.5).text('Brown rice, grilled tofu/chicken, salad', dietX + 15, colY + 90);

        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8).text('Dinner', dietX + 15, colY + 106);
        doc.fillColor('#4B5563').font('Helvetica').fontSize(7.5).text('Sautéed vegetables, paneer/fish, soup', dietX + 15, colY + 116);

        doc.fillColor('#6B7280').font('Helvetica-Oblique').fontSize(7.5).text('Consult your trainer to assign a custom diet template.', dietX + 15, colY + 140);
      }

      // 6. Page 2 Graphic/Motivational text
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(22).text('CHASE YOUR', dietX, PAGE_HEIGHT - 160, { align: 'right', width: dietW });
      doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(30).text('GOALS', dietX, PAGE_HEIGHT - 134, { align: 'right', width: dietW });

      // Horizontal separator line page 2
      doc.moveTo(40, PAGE_HEIGHT - 67).lineTo(PAGE_WIDTH - 40, PAGE_HEIGHT - 67).strokeColor('#E5E7EB').lineWidth(1.5).stroke();

      // 7. Footer (Page 2)
      doc.rect(0, footerY, PAGE_WIDTH, 47).fill(secondaryColor);
      doc.fillColor('#9CA3AF').font('Helvetica').fontSize(8).text(contactText, 0, footerY + 11, { align: 'center', width: PAGE_WIDTH });
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5).text('Powerd by veggainz Solutions', 0, footerY + 26, { align: 'center', width: PAGE_WIDTH });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }
}

export const reportService = new ReportService();
