import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { executeAIValidationPipeline } from './validateSubmission';
import { Submission, Loan, SchemeRule } from '../../shared/types';
import { generateCompliancePdfReport, generateSubmissionsCSV } from './exportReport';
import { sendFCMNotification, sendSMSAlert } from './notifications';

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

/**
 * Storage Trigger: Runs AI Pipeline on new media uploads
 */
export const onSubmissionMediaUploaded = functions.region('asia-south1').storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  if (!filePath || !filePath.startsWith('submissions/')) return;

  const parts = filePath.split('/');
  const submissionId = parts[1];
  if (!submissionId) return;

  const subDoc = await db.collection('submissions').doc(submissionId).get();
  if (!subDoc.exists) return;

  const submission = subDoc.data() as Submission;
  const loanDoc = await db.collection('loans').doc(submission.loanId).get();
  const loan = (loanDoc.exists ? loanDoc.data() : { assetCategory: submission.assetCategory }) as Loan;

  const schemeDoc = await db.collection('schemes').doc(submission.schemeId).get();
  const schemeRule = (schemeDoc.exists ? schemeDoc.data() : undefined) as SchemeRule | undefined;

  // Retrieve existing hashes for duplicate checking
  const allSubmissionsSnap = await db.collection('submissions').limit(200).get();
  const existingHashes: Array<{ submissionId: string; hash: string; beneficiaryId: string }> = [];
  allSubmissionsSnap.forEach(doc => {
    const data = doc.data() as Submission;
    for (const m of data.mediaFiles || []) {
      if (m.hash) {
        existingHashes.push({
          submissionId: data.submissionId,
          hash: m.hash,
          beneficiaryId: data.beneficiaryId
        });
      }
    }
  });

  // Run AI Validation
  const aiResult = await executeAIValidationPipeline({
    submission,
    loan,
    schemeRule,
    existingMediaHashes: existingHashes
  });

  const nextStatus = aiResult.anomalyScore >= 80 
    ? 'ai_passed' 
    : aiResult.anomalyScore < 50 
      ? 'ai_flagged' 
      : 'officer_review';

  // Atomic Update in Firestore
  await db.collection('submissions').doc(submissionId).update({
    aiValidationResult: aiResult,
    status: nextStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Update Loan Fraud Score
  await db.collection('loans').doc(submission.loanId).update({
    fraudScore: 100 - aiResult.anomalyScore,
    fraudFlags: aiResult.flags,
    status: nextStatus === 'ai_passed' ? 'under_review' : 'flagged',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Audit Log Entry
  await db.collection('auditLog').add({
    entityType: 'submission',
    entityId: submissionId,
    action: `AI_VALIDATION_COMPLETED (${nextStatus})`,
    actorId: 'system_ai_pipeline',
    actorName: 'LoanVerify AI Engine',
    actorRole: 'superAdmin',
    timestamp: new Date().toISOString(),
    metadata: {
      score: aiResult.anomalyScore,
      flags: aiResult.flags
    }
  });

  // Trigger Notifications
  if (submission.beneficiaryPhone) {
    const alertText = nextStatus === 'ai_passed'
      ? 'Your loan asset proof has passed preliminary AI validation and is queued for officer approval.'
      : 'Your proof requires additional officer review or clarification.';
    await sendSMSAlert(submission.beneficiaryPhone, alertText);
  }
});

/**
 * HTTP Endpoint: Direct AI Pipeline Validation API
 */
export const validateSubmissionHttp = functions.region('asia-south1').https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { submission, loan, schemeRule, existingHashes } = req.body;
      if (!submission) {
        res.status(400).json({ error: 'Missing submission body' });
        return;
      }

      const result = await executeAIValidationPipeline({
        submission,
        loan: loan || { assetCategory: submission.assetCategory },
        schemeRule,
        existingMediaHashes: existingHashes || []
      });

      res.status(200).json({ success: true, aiValidationResult: result });
    } catch (err: any) {
      console.error('Validation error:', err);
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });
});

/**
 * HTTP Endpoint: PDF / CSV Export API
 */
export const exportReportHttp = functions.region('asia-south1').https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const format = (req.query.format as string) || 'pdf';
      const subsSnap = await db.collection('submissions').limit(100).get();
      const loansSnap = await db.collection('loans').limit(100).get();

      const submissions: Submission[] = [];
      const loans: Loan[] = [];

      subsSnap.forEach(d => submissions.push(d.data() as Submission));
      loansSnap.forEach(d => loans.push(d.data() as Loan));

      if (format === 'csv') {
        const csv = generateSubmissionsCSV(submissions);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="loanverify-compliance-report.csv"');
        res.send(csv);
      } else {
        const pdfBuffer = await generateCompliancePdfReport(submissions, loans);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="loanverify-compliance-report.pdf"');
        res.send(pdfBuffer);
      }
    } catch (err: any) {
      console.error('Export report error:', err);
      res.status(500).json({ error: err.message });
    }
  });
});
