import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { Submission, Loan } from '../../../shared/types';

export function exportSubmissionsToCSV(submissions: Submission[]) {
  const data = submissions.map(s => ({
    'Submission ID': s.submissionId,
    'Loan ID': s.loanId,
    'Beneficiary Name': s.beneficiaryName || 'N/A',
    'Beneficiary Phone': s.beneficiaryPhone || 'N/A',
    'Scheme Name': s.schemeName,
    'Asset Category': s.assetCategory,
    'District': s.district,
    'State': s.state,
    'Status': s.status,
    'AI Score': s.aiValidationResult?.anomalyScore ?? 'N/A',
    'Asset Match': s.aiValidationResult?.assetMatch ? 'YES' : 'NO',
    'Duplicate Detected': s.aiValidationResult?.duplicateDetected ? 'YES' : 'NO',
    'GPS Coordinates': s.mediaFiles[0] ? `${s.mediaFiles[0].gpsLat}, ${s.mediaFiles[0].gpsLng}` : 'N/A',
    'Submitted At': s.submittedAt,
    'Flags': (s.aiValidationResult?.flags || []).join('; ')
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LoanVerify_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportComplianceReportPDF(submissions: Submission[], loans: Loan[]) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(26, 86, 219); // Gov Blue #1A56DB
  doc.rect(0, 0, 210, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LOANVERIFY COMPLIANCE & UTILIZATION REPORT', 14, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()} | Government Field Tracking Portal`, 14, 21);

  // Executive Summary Card
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, 34);

  const totalSubs = submissions.length;
  const approvedCount = submissions.filter(s => s.status === 'approved' || s.status === 'ai_passed').length;
  const flaggedCount = submissions.filter(s => s.status === 'ai_flagged' || s.status === 'rejected').length;
  const pendingCount = totalSubs - approvedCount - flaggedCount;

  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, 38, 182, 22, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Loans Monitored: ${loans.length}`, 18, 46);
  doc.text(`Submissions Received: ${totalSubs}`, 18, 54);

  doc.setTextColor(5, 122, 85); // Green
  doc.text(`Verified / Approved: ${approvedCount} (${totalSubs > 0 ? Math.round((approvedCount/totalSubs)*100) : 0}%)`, 80, 46);

  doc.setTextColor(200, 30, 30); // Red
  doc.text(`Flagged Anomalies: ${flaggedCount}`, 80, 54);

  doc.setTextColor(194, 120, 3); // Amber
  doc.text(`Pending Review: ${pendingCount}`, 145, 46);

  // Table
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Recent Field Submissions & AI Risk Triage', 14, 70);

  // Table Header Row
  doc.setFillColor(30, 66, 159);
  doc.rect(14, 74, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Beneficiary', 16, 79);
  doc.text('Scheme / Category', 60, 79);
  doc.text('District', 110, 79);
  doc.text('AI Score', 140, 79);
  doc.text('Status', 165, 79);

  let y = 88;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  for (let i = 0; i < Math.min(submissions.length, 20); i++) {
    const s = submissions[i];
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    if (i % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(14, y - 5, 182, 7, 'F');
    }

    doc.setTextColor(31, 41, 55);
    doc.text((s.beneficiaryName || s.beneficiaryId).substring(0, 22), 16, y);
    doc.text(s.assetCategory.substring(0, 24), 60, y);
    doc.text(s.district || 'Pune', 110, y);
    
    const score = s.aiValidationResult?.anomalyScore || 0;
    if (score >= 80) doc.setTextColor(5, 122, 85);
    else if (score < 50) doc.setTextColor(200, 30, 30);
    else doc.setTextColor(194, 120, 3);
    doc.text(`${score}/100`, 140, y);

    doc.setTextColor(31, 41, 55);
    doc.text(s.status.toUpperCase(), 165, y);

    y += 8;
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('Confidential — For Authorized Government & Bank Officials Only — Powered by LoanVerify', 14, 290);

  doc.save(`LoanVerify_Compliance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
