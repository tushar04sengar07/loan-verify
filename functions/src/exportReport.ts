import PDFDocument from 'pdfkit';
import { Submission, Loan } from '../../shared/types';

/**
 * Generates a structured compliance PDF report stream
 */
export function generateCompliancePdfReport(
  submissions: Submission[],
  loans: Loan[],
  reportTitle: string = 'Loan Utilization & Verification Compliance Report'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#1A56DB');
      doc.fillColor('#FFFFFF')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('LOANVERIFY COMPLIANCE REPORT', 55, 52);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Generated on: ${new Date().toLocaleString()} | Government & Bank Monitoring`, 55, 75);

      doc.moveDown(3);

      // Summary KPI Box
      const totalLoans = loans.length;
      const totalSubs = submissions.length;
      const approvedCount = submissions.filter(s => s.status === 'approved' || s.status === 'ai_passed').length;
      const flaggedCount = submissions.filter(s => s.status === 'ai_flagged' || s.status === 'rejected').length;

      doc.fillColor('#111827')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Verification Executive Summary', 40, 120);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Loans Tracked: ${totalLoans}`, 40, 142);
      doc.text(`Total Submissions: ${totalSubs}`, 180, 142);
      doc.text(`Verified & Passed: ${approvedCount}`, 320, 142);
      doc.text(`Flagged/Anomalies: ${flaggedCount}`, 440, 142);

      doc.moveTo(40, 165).lineTo(555, 165).strokeColor('#E5E7EB').stroke();

      // Table Header
      let y = 180;
      doc.rect(40, y, 515, 20).fill('#F3F4F6');
      doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold');
      doc.text('Beneficiary', 45, y + 5);
      doc.text('Scheme / Category', 160, y + 5);
      doc.text('District', 290, y + 5);
      doc.text('AI Score', 370, y + 5);
      doc.text('Status', 440, y + 5);
      doc.text('Fraud Flags', 495, y + 5);

      y += 25;
      doc.font('Helvetica').fontSize(8).fillColor('#1F2937');

      for (let i = 0; i < Math.min(submissions.length, 25); i++) {
        const s = submissions[i];
        if (y > 750) {
          doc.addPage();
          y = 40;
        }

        doc.text((s.beneficiaryName || s.beneficiaryId).substring(0, 18), 45, y);
        doc.text(s.assetCategory.substring(0, 20), 160, y);
        doc.text(s.district || 'Pune', 290, y);
        doc.text(`${s.aiValidationResult?.anomalyScore || 0}/100`, 370, y);
        doc.text(s.status.toUpperCase(), 440, y);
        doc.text(s.aiValidationResult?.flags?.length ? `${s.aiValidationResult.flags.length} flags` : 'None', 495, y);

        y += 18;
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates CSV string for bulk export
 */
export function generateSubmissionsCSV(submissions: Submission[]): string {
  const headers = [
    'Submission ID',
    'Loan ID',
    'Beneficiary Name',
    'Beneficiary Phone',
    'Scheme Name',
    'Asset Category',
    'District',
    'Status',
    'AI Score',
    'GPS Lat',
    'GPS Lng',
    'Duplicates Detected',
    'Flags',
    'Submitted At'
  ];

  const rows = submissions.map(s => [
    `"${s.submissionId}"`,
    `"${s.loanId}"`,
    `"${s.beneficiaryName || ''}"`,
    `"${s.beneficiaryPhone || ''}"`,
    `"${s.schemeName}"`,
    `"${s.assetCategory}"`,
    `"${s.district || ''}"`,
    `"${s.status}"`,
    s.aiValidationResult?.anomalyScore || 0,
    s.mediaFiles[0]?.gpsLat || '',
    s.mediaFiles[0]?.gpsLng || '',
    s.aiValidationResult?.duplicateDetected ? 'YES' : 'NO',
    `"${(s.aiValidationResult?.flags || []).join('; ')}"`,
    `"${s.submittedAt}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
