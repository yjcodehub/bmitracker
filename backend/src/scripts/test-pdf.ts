import { connectDatabase } from '../config/database';
import { BMIRecord, Settings } from '../models';
import { reportService } from '../services/report.service';

async function main() {
  await connectDatabase();
  const record = await BMIRecord.findOne();
  const settings = await Settings.findOne();
  if (!record || !settings) {
    console.error('No record or settings found. Please run seed script first: npm run seed');
    process.exit(1);
  }
  console.log(`Generating test report for record ID: ${record._id} and gym: ${settings._id}`);
  const report = await reportService.generate(record._id.toString(), settings._id.toString());
  console.log(`Report generated successfully at: ${report.pdfPath}`);
  console.log(`Testing email send for report ID: ${report._id}`);
  await reportService.emailReport(report._id.toString());
  console.log(`Email report sent/logged successfully`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
