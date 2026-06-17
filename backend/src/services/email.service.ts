import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export class EmailService {
  private transporter;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: false,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
    }
  }

  async sendWelcome(email: string, name: string, gymName: string) {
    return this.send(
      email,
      `Welcome to ${gymName}`,
      `<h2>Welcome, ${name}!</h2><p>Your membership registration has been received. You will be notified once approved.</p>`
    );
  }

  async sendWelcomeApproved(email: string, name: string, gymName: string) {
    return this.send(
      email,
      `Welcome to ${gymName}!`,
      `<h2>Welcome to the Gym, ${name}!</h2><p>Your membership registration has been approved. You can now log in to the portal and view your diet plans, progress, and reports.</p>`
    );
  }

  async sendReport(
    email: string,
    name: string,
    pdfBuffer: Buffer,
    fileName: string,
    data: {
      member: any;
      record: any;
      settings: any;
      dietPlan: any;
    }
  ) {
    const primaryColor = data.settings?.theme?.primaryColor || '#ff6600';
    const gymName = data.settings?.gymName || 'FitZone Gym';
    const bc = data.record.bodyComposition || {};

    let logoPath = '';
    if (data.settings?.theme?.logo) {
      logoPath = path.join(process.cwd(), data.settings.theme.logo);
      if (!fs.existsSync(logoPath)) {
        logoPath = path.join(process.cwd(), 'backend', data.settings.theme.logo);
      }
    }
    if (!logoPath || !fs.existsSync(logoPath)) {
      logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
    }
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(process.cwd(), 'dist', 'assets', 'logo.png');
    }
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
    }

    const hasLogo = fs.existsSync(logoPath);
    const attachments: any[] = [{ filename: fileName, content: pdfBuffer }];
    if (hasLogo) {
      attachments.push({
        filename: 'logo.png',
        path: logoPath,
        cid: 'gymlogo',
        contentType: 'image/png',
        contentDisposition: 'inline'
      });
    }

    const logoHtml = hasLogo 
      ? `<img src="cid:gymlogo" alt="${gymName} Logo" width="110" height="110" style="display: block; border-radius: 50%; border: 3px solid ${primaryColor}; box-shadow: 0px 8px 16px rgba(0,0,0,0.5);" />`
      : `<div style="width: 100px; height: 100px; border-radius: 50%; background-color: ${primaryColor}; color: #ffffff; font-size: 32px; font-weight: bold; line-height: 100px; text-align: center; margin: 0 auto; box-shadow: 0px 8px 16px rgba(0,0,0,0.5);">${gymName.substring(0, 2).toUpperCase()}</div>`;

    const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${gymName} - Body Analysis Report</title>
  <style type="text/css">
    #outlook a { padding:0; }
    body{ width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; background-color: #0b0b0d; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .ExternalClass { width:100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    table td { border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; }
      .responsive-column { display: block !important; width: 100% !important; box-sizing: border-box; }
      .responsive-column-spacer { height: 15px !important; }
      .header-padding { padding: 25px 15px 25px 15px !important; }
      .body-padding { padding: 20px 15px !important; }
      .stats-box { padding: 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100% !important; background-color: #0b0b0d;">

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0b0d; padding: 20px 0;">
    <tr>
      <td align="center" valign="top">
        
        <table class="container-table" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; border-radius: 16px; overflow: hidden; background-color: #121214; border: 1px solid #232328; border-bottom: 5px solid ${primaryColor};">
          
          <!-- Hero Banner Section -->
          <tr>
            <td valign="top" style="background-color: #18181c; position: relative;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" valign="top" class="header-padding" style="padding: 40px 30px; background-image: linear-gradient(180deg, rgba(18,18,20,0.85) 0%, rgba(18,18,20,0.96) 100%); background-size: cover; background-position: center;">
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding-bottom: 15px;">
                          ${logoHtml}
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <span style="font-size: 13px; font-weight: bold; letter-spacing: 3px; color: ${primaryColor}; text-transform: uppercase;">${gymName}</span>
                          <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; margin: 5px 0 0 0; letter-spacing: 1px; text-transform: uppercase;">BODY ANALYSIS REPORT</h1>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Profile / Personal Header Metrics banner bar -->
          <tr>
            <td style="background-color: #1a1a1e; border-top: 1px solid #232328; border-bottom: 1px solid #232328; padding: 15px 25px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="responsive-column" width="60%" style="vertical-align: middle;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Member Details</td>
                      </tr>
                      <tr>
                        <td style="font-size: 16px; font-weight: bold; color: #ffffff; padding-top: 2px;">
                          ${data.member.fullName} <span style="font-size: 13px; color: ${primaryColor}; font-weight: normal; font-family: monospace;">(${data.member.membershipNumber})</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="responsive-column-spacer" style="height: 0px;" width="1"></td>
                  <td class="responsive-column" width="40%" align="right" style="vertical-align: middle; text-align: left !important; float: left;">
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td align="right" style="text-align: right; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px;">Assessment Date</td>
                      </tr>
                      <tr>
                        <td align="right" style="text-align: right; font-size: 14px; font-weight: bold; color: #ffffff; padding-top: 2px;">
                          ${new Date(data.record.analysisDate).toLocaleDateString('en-GB')}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Report Body Container -->
          <tr>
            <td class="body-padding" style="padding: 30px 25px; background-color: #121214;">
              
              <!-- SECTION 1: BMI ASSESSMENT METRICS -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="border-left: 4px solid ${primaryColor}; padding-left: 12px; padding-bottom: 15px;">
                    <h2 style="font-size: 18px; font-weight: bold; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">BMI Analysis</h2>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td class="responsive-column" width="48%" valign="top">
                          <table width="100%" border="0" cellspacing="0" cellpadding="15" style="background-color: #1a1a1e; border: 1px solid #27272a; border-radius: 8px;">
                            <tr>
                              <td>
                                <span style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; display: block; padding-bottom: 4px;">HEIGHT</span>
                                <span style="font-size: 20px; font-weight: bold; color: #ffffff;">${data.member.height} <span style="font-size: 14px; font-weight: normal; color: ${primaryColor};">cm</span></span>
                              </td>
                            </tr>
                          </table>
                          <div style="height: 12px;"></div>
                          <table width="100%" border="0" cellspacing="0" cellpadding="15" style="background-color: #1a1a1e; border: 1px solid #27272a; border-radius: 8px;">
                            <tr>
                              <td>
                                <span style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; display: block; padding-bottom: 4px;">WEIGHT</span>
                                <span style="font-size: 20px; font-weight: bold; color: #ffffff;">${data.record.weight} <span style="font-size: 14px; font-weight: normal; color: ${primaryColor};">kg</span></span>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td class="responsive-column-spacer" width="4%"></td>
                        <td class="responsive-column" width="48%" valign="top">
                          <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #1a1a1e; border: 1px solid #27272a; border-radius: 8px; text-align: center;">
                            <tr>
                              <td align="center">
                                <span style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; display: block; padding-bottom: 6px;">Calculated BMI</span>
                                <span style="font-size: 32px; font-weight: 800; color: ${primaryColor}; line-height: 1;">${data.record.bmi}</span>
                                <div style="display: inline-block; margin-top: 8px; padding: 4px 12px; background-color: ${primaryColor}; color: #ffffff; font-size: 12px; font-weight: bold; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                                  ${data.record.bmiCategory}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- HEALTH RISK STATS BADGE & ACTIONS -->
              <table width="100%" border="0" cellspacing="0" cellpadding="15" style="background-color: rgba(255, 102, 0, 0.05); border: 1px solid rgba(255,102,0,0.2); border-radius: 10px; margin-bottom: 30px;">
                <tr>
                  <td valign="top" style="padding-bottom: 5px;">
                    <span style="font-size: 11px; color: ${primaryColor}; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block; padding-bottom: 4px;">HEALTH RISK INDICATOR</span>
                    <strong style="font-size: 15px; color: #ffffff;">${data.record.healthRisk}</strong>
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding-top: 0px; border-top: 1px solid rgba(255,102,0,0.1); padding-top: 10px;">
                    <span style="font-size: 11px; color: #a1a1aa; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: block; padding-bottom: 4px;">SUGGESTED GYM ACTION PLAN</span>
                    <p style="font-size: 13px; color: #e4e4e7; line-height: 1.5; margin: 0;">${data.record.suggestedAction}</p>
                  </td>
                </tr>
              </table>

              <!-- SECTION 2: ADVANCED BODY COMPOSITION -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="border-left: 4px solid ${primaryColor}; padding-left: 12px; padding-bottom: 15px;">
                    <h2 style="font-size: 18px; font-weight: bold; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Body Composition</h2>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td class="responsive-column" width="48%" valign="top">
                          <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #1a1a1e; border-bottom: 1px solid #232328;">
                            <tr>
                              <td style="font-size: 13px; color: #a1a1aa;">Body Fat Percentage</td>
                              <td align="right" style="font-size: 14px; font-weight: bold; color: #ffffff; text-align: right;">${bc.bodyFatPercent || 0}% (${(bc.bodyFatStatus || 'normal').toUpperCase()})</td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #1a1a1e; border-bottom: 1px solid #232328;">
                            <tr>
                              <td style="font-size: 13px; color: #a1a1aa;">Visceral Fat Score</td>
                              <td align="right" style="font-size: 14px; font-weight: bold; color: #ffffff; text-align: right;">Lvl ${bc.visceralFat || 0} (${(bc.visceralFatStatus || 'normal').toUpperCase()})</td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #1a1a1e;">
                            <tr>
                              <td style="font-size: 13px; color: #a1a1aa;">Muscle Mass</td>
                              <td align="right" style="font-size: 14px; font-weight: bold; color: #ffffff; text-align: right;">${bc.muscleMass || 0} kg</td>
                            </tr>
                          </table>
                        </td>
                        <td class="responsive-column-spacer" width="4%"></td>
                        <td class="responsive-column" width="48%" valign="top">
                          <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #1a1a1e; border-bottom: 1px solid #232328;">
                            <tr>
                              <td style="font-size: 13px; color: #a1a1aa;">Basal Metabolic Rate (BMR)</td>
                              <td align="right" style="font-size: 14px; font-weight: bold; color: #ffffff; text-align: right;">${bc.bmr || 0} kcal</td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellspacing="0" cellpadding="12" style="background-color: #1a1a1e;">
                            <tr>
                              <td style="font-size: 13px; color: #a1a1aa;">Metabolic / Body Age</td>
                              <td align="right" style="font-size: 14px; font-weight: bold; color: ${primaryColor}; text-align: right;">${bc.bodyAge || 0} years</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TRAINER PERSONAL NOTE / QUOTE -->
              <table width="100%" border="0" cellspacing="0" cellpadding="15" style="background-color: #1a1a1e; border: 1px dashed #3f3f46; border-radius: 8px;">
                <tr>
                  <td valign="top" style="padding-bottom: 5px;">
                    <span style="font-size: 10px; font-weight: bold; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1.5px;">TRAINER NOTES &amp; FOCUS FOR THIS MONTH</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 0; font-size: 13px; line-height: 1.6; color: #d4d4d8; font-style: italic;">
                    "${data.record.trainerNotes || `Great progress starting your assessment, ${data.member.fullName.split(' ')[0]}! Let's crush your goals this month. We recommend scheduling an orientation session to build a tailored program around these parameters.`}"
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer element links -->
          <tr>
            <td style="background-color: #0e0e11; padding: 30px; text-align: center; border-top: 1px solid #1a1a1e;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 14px; font-weight: bold; color: #ffffff; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">
                    ${gymName}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #a1a1aa; line-height: 1.6; padding-bottom: 15px;">
                    Premium Workouts • Professional Guidance • Life Transformation<br>
                    You received this email because you are a registered member of ${gymName}.
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table border="0" cellspacing="0" cellpadding="5">
                      <tr>
                        <td style="font-size: 11px; font-weight: bold; background-color: ${primaryColor}; border-radius: 4px; padding: 6px 12px;">
                          <a href="#" style="color: #ffffff; text-decoration: none; text-transform: uppercase;">Book Training Session</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 10px; color: #52525b; padding-top: 20px;">
                    © 2026 ${gymName}. All Rights Reserved.<br>
                    <span style="font-weight: bold; color: #a1a1aa;">Powerd by veggainz Solutions</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;

    return this.send(
      email,
      `${gymName} - Body Analysis Report`,
      htmlContent,
      attachments
    );
  }

  async sendPasswordReset(email: string, resetUrl: string) {
    return this.send(
      email,
      'Password Reset Request',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
    );
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    attachments?: { filename: string; content: Buffer }[]
  ) {
    if (!this.transporter) {
      console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
      return { messageId: 'mock' };
    }

    return this.transporter.sendMail({
      from: env.SMTP_FROM || env.SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });
  }
}

export const emailService = new EmailService();
