import { Submission, Loan, SchemeRule, User, UserRole, AuditLog } from '../../../shared/types';
import {
  INITIAL_SCHEMES,
  INITIAL_LOANS,
  INITIAL_SUBMISSIONS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from './mockData';
import { executeAIValidationPipeline } from '../../../shared/validationUtils';

const STORAGE_KEYS = {
  SCHEMES: 'loanverify_schemes_v1',
  LOANS: 'loanverify_loans_v1',
  SUBMISSIONS: 'loanverify_submissions_v1',
  USERS: 'loanverify_users_v1',
  AUDIT_LOGS: 'loanverify_audit_logs_v1',
  CURRENT_USER: 'loanverify_current_user_v1',
};

class DataService {
  private schemes: SchemeRule[] = [];
  private loans: Loan[] = [];
  private submissions: Submission[] = [];
  private users: User[] = [];
  private auditLogs: AuditLog[] = [];
  private currentUser: User = INITIAL_USERS[0]; // default State Officer

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedSchemes = localStorage.getItem(STORAGE_KEYS.SCHEMES);
      this.schemes = storedSchemes ? JSON.parse(storedSchemes) : [...INITIAL_SCHEMES];

      const storedLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
      this.loans = storedLoans ? JSON.parse(storedLoans) : [...INITIAL_LOANS];

      const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      this.submissions = storedSubs ? JSON.parse(storedSubs) : [...INITIAL_SUBMISSIONS];

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : [...INITIAL_USERS];

      const storedAudits = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : [...INITIAL_AUDIT_LOGS];

      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.warn('Storage read error, using initial defaults:', e);
      this.schemes = [...INITIAL_SCHEMES];
      this.loans = [...INITIAL_LOANS];
      this.submissions = [...INITIAL_SUBMISSIONS];
      this.users = [...INITIAL_USERS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.currentUser = INITIAL_USERS[0];
    }
    this.syncWithServer();
  }

  async syncWithServer(): Promise<void> {
    try {
      const [subResp, loanResp, officerResp] = await Promise.allSettled([
        fetch('http://localhost:5000/api/submissions'),
        fetch('http://localhost:5000/api/loans'),
        fetch('http://localhost:5000/api/officers')
      ]);

      if (subResp.status === 'fulfilled') {
        const subData = await subResp.value.json();
        if (subData.success && Array.isArray(subData.submissions)) {
          for (const serverSub of subData.submissions) {
            const idx = this.submissions.findIndex(s => s.submissionId === serverSub.submissionId);
            if (idx >= 0) {
              this.submissions[idx] = { ...this.submissions[idx], ...serverSub };
            } else {
              this.submissions.unshift(serverSub);
            }

            if (serverSub.fieldAudit) {
              const loanIdx = this.loans.findIndex(l => l.loanId === serverSub.loanId);
              if (loanIdx >= 0) {
                const auditOutcome = serverSub.fieldAudit.outcome;
                this.loans[loanIdx].status = auditOutcome === 'verified' ? 'approved' : auditOutcome === 'discrepancy_found' ? 'flagged' : 'rejected';
              }
            }
          }
        }
      }

      if (loanResp.status === 'fulfilled') {
        const loanData = await loanResp.value.json();
        if (loanData.success && Array.isArray(loanData.loans)) {
          for (const serverLoan of loanData.loans) {
            const idx = this.loans.findIndex(l => l.loanId === serverLoan.loanId);
            if (idx >= 0) {
              this.loans[idx] = { ...this.loans[idx], ...serverLoan };
            } else {
              this.loans.unshift(serverLoan);
            }
          }
        }
      }

      if (officerResp.status === 'fulfilled') {
        const offData = await officerResp.value.json();
        if (offData.success && Array.isArray(offData.officers)) {
          for (const off of offData.officers) {
            const idx = this.users.findIndex(u => u.userId === off.userId || u.phone === off.phone);
            if (idx >= 0) {
              this.users[idx] = { ...this.users[idx], ...off };
            } else {
              this.users.unshift(off);
            }
          }
        }
      }

      this.saveToStorage();
    } catch (e) {
      // Local standalone mode fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(this.schemes));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(this.loans));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // --- Auth & Persona Management ---
  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveToStorage();
  }

  getUsers(): User[] {
    return [...this.users];
  }

  getOfficers(): User[] {
    return this.users.filter(u => u.role !== 'beneficiary');
  }

  createOfficer(officerData: Partial<User>, requesterRole?: UserRole): User {
    const callerRole = requesterRole || this.currentUser.role;
    if (callerRole !== 'superAdmin') {
      throw new Error('Unauthorized: Only Super Administrators have permission to onboard new officers.');
    }

    const newOfficer: User = {
      userId: officerData.userId || `user_${officerData.role || 'fieldOfficer'}_${Date.now().toString().slice(-6)}`,
      phone: officerData.phone || '+91 98765 00000',
      name: officerData.name || 'New Officer',
      aadhaarLast4: officerData.aadhaarLast4 || '0000',
      role: officerData.role || 'fieldOfficer',
      district: officerData.district || 'Pune',
      state: officerData.state || 'Maharashtra',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      trustScore: 95
    };

    const existingIdx = this.users.findIndex(u => u.phone === newOfficer.phone);
    if (existingIdx >= 0) {
      this.users[existingIdx] = newOfficer;
    } else {
      this.users.unshift(newOfficer);
    }

    this.saveToStorage();
    this.logAudit('user', newOfficer.userId, 'OFFICER_CREATED_BY_SUPER_ADMIN', { name: newOfficer.name, role: newOfficer.role });

    // Sync to local server for live OTP auth
    fetch('http://localhost:5000/api/officers/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-role': callerRole
      },
      body: JSON.stringify({ ...newOfficer, requesterRole: callerRole })
    }).catch(() => {});

    return newOfficer;
  }

  deleteOfficer(userId: string, requesterRole?: UserRole): void {
    const callerRole = requesterRole || this.currentUser.role;
    if (callerRole !== 'superAdmin') {
      throw new Error('Unauthorized: Only Super Administrators can delete officer profiles.');
    }
    this.users = this.users.filter(u => u.userId !== userId);
    this.saveToStorage();
    this.logAudit('user', userId, 'OFFICER_DELETED_BY_SUPER_ADMIN', {});
  }

  // --- Schemes Management ---
  getSchemes(): SchemeRule[] {
    return [...this.schemes];
  }

  saveScheme(scheme: SchemeRule) {
    const idx = this.schemes.findIndex(s => s.schemeId === scheme.schemeId);
    if (idx >= 0) {
      this.schemes[idx] = { ...scheme, updatedAt: new Date().toISOString() };
    } else {
      this.schemes.push({
        ...scheme,
        schemeId: scheme.schemeId || `scheme_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this.saveToStorage();
    this.logAudit('scheme', scheme.schemeId, 'SCHEME_SAVED', { name: scheme.schemeName });
  }

  deleteScheme(schemeId: string) {
    this.schemes = this.schemes.filter(s => s.schemeId !== schemeId);
    this.saveToStorage();
    this.logAudit('scheme', schemeId, 'SCHEME_DELETED');
  }

  // --- Loans Management ---
  getLoans(): Loan[] {
    return [...this.loans];
  }

  getLoanById(loanId: string): Loan | undefined {
    return this.loans.find(l => l.loanId === loanId);
  }

  createLoan(loanData: Partial<Loan>): Loan {
    const newLoan: Loan = {
      loanId: loanData.loanId || `loan_${Date.now()}`,
      beneficiaryId: loanData.beneficiaryId || `user_ben_${Date.now().toString().slice(-6)}`,
      beneficiaryName: loanData.beneficiaryName || 'Unknown Beneficiary',
      beneficiaryPhone: loanData.beneficiaryPhone || '+91 98000 00000',
      loanAmount: loanData.loanAmount || 100000,
      disbursedAmount: loanData.disbursedAmount || loanData.loanAmount || 100000,
      schemeId: loanData.schemeId || this.schemes[0]?.schemeId || 'scheme_milch_animal',
      schemeName: loanData.schemeName || this.schemes[0]?.schemeName || 'National Livestock Mission',
      assetCategory: loanData.assetCategory || this.schemes[0]?.assetCategory || 'Milch Animal',
      bankName: loanData.bankName || 'State Bank of India',
      branchCode: loanData.branchCode || 'SBI000100',
      district: loanData.district || 'Pune',
      state: loanData.state || 'Maharashtra',
      sanctionDate: loanData.sanctionDate || new Date().toISOString().split('T')[0],
      expectedVerificationDate: loanData.expectedVerificationDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      status: 'pending_submission',
      verificationDeadline: loanData.verificationDeadline || new Date(Date.now() + 45*86400000).toISOString().split('T')[0],
      fraudScore: 0,
      fraudFlags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.loans.unshift(newLoan);

    // Register Beneficiary User in local roster
    const phoneDigits = (newLoan.beneficiaryPhone || '').replace(/[^0-9]/g, '').slice(-10);
    const normalizedPhone = '+91' + phoneDigits;
    const existsUser = this.users.find(u => (u.phone || '').replace(/[^0-9]/g, '').slice(-10) === phoneDigits);
    if (!existsUser) {
      this.users.push({
        userId: newLoan.beneficiaryId || `user_ben_${Date.now()}`,
        phone: normalizedPhone,
        name: newLoan.beneficiaryName || 'Beneficiary',
        aadhaarLast4: phoneDigits.slice(-4),
        role: 'beneficiary',
        district: newLoan.district || 'Pune',
        state: newLoan.state || 'Maharashtra',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        trustScore: 90
      });
    }

    this.saveToStorage();
    this.logAudit('loan', newLoan.loanId, 'LOAN_CREATED', { beneficiary: newLoan.beneficiaryName, amount: newLoan.loanAmount });

    // Sync directly with the Local OTP & Loan Server
    fetch('http://localhost:5000/api/loans/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLoan)
    }).catch(err => {
      console.warn('Local OTP server offline, saved locally to client storage:', err.message);
    });

    return newLoan;
  }

  bulkCreateLoans(loansData: Array<Partial<Loan>>): number {
    let count = 0;
    for (const data of loansData) {
      this.createLoan(data);
      count++;
    }
    return count;
  }

  // --- Submissions Management ---
  getSubmissions(): Submission[] {
    return [...this.submissions];
  }

  getSubmissionById(submissionId: string): Submission | undefined {
    return this.submissions.find(s => s.submissionId === submissionId);
  }

  async submitProof(submission: Submission): Promise<Submission> {
    const loan = this.getLoanById(submission.loanId) || ({
      loanId: submission.loanId,
      beneficiaryId: submission.beneficiaryId,
      assetCategory: submission.assetCategory,
      district: submission.district,
      state: submission.state,
      fraudScore: 0,
      fraudFlags: []
    } as unknown as Loan);

    const schemeRule = this.schemes.find(s => s.schemeId === submission.schemeId || s.assetCategory === submission.assetCategory);

    // Retrieve existing media hashes
    const existingHashes: Array<{ submissionId: string; hash: string; beneficiaryId: string }> = [];
    for (const s of this.submissions) {
      for (const m of s.mediaFiles || []) {
        if (m.hash) {
          existingHashes.push({
            submissionId: s.submissionId,
            hash: m.hash,
            beneficiaryId: s.beneficiaryId
          });
        }
      }
    }

    // Run AI Validation
    const aiResult = await executeAIValidationPipeline({
      submission,
      loan,
      schemeRule,
      existingMediaHashes: existingHashes
    });

    const status = aiResult.anomalyScore >= (schemeRule?.autoApprovalScoreThreshold || 80)
      ? 'ai_passed'
      : aiResult.anomalyScore < (schemeRule?.flagThreshold || 50)
        ? 'ai_flagged'
        : 'officer_review';

    const processedSubmission: Submission = {
      ...submission,
      submissionId: submission.submissionId || `sub_${Date.now()}`,
      aiValidationResult: aiResult,
      status: status,
      syncedAt: new Date().toISOString(),
      isOffline: false
    };

    const existingIdx = this.submissions.findIndex(s => s.submissionId === processedSubmission.submissionId);
    if (existingIdx >= 0) {
      this.submissions[existingIdx] = processedSubmission;
    } else {
      this.submissions.unshift(processedSubmission);
    }

    // Update corresponding Loan
    const loanIdx = this.loans.findIndex(l => l.loanId === processedSubmission.loanId);
    if (loanIdx >= 0) {
      this.loans[loanIdx].status = status === 'ai_passed' ? 'under_review' : 'flagged';
      this.loans[loanIdx].fraudScore = 100 - aiResult.anomalyScore;
      this.loans[loanIdx].fraudFlags = aiResult.flags;
      this.loans[loanIdx].updatedAt = new Date().toISOString();
    }

    this.saveToStorage();
    this.logAudit('submission', processedSubmission.submissionId, `SUBMISSION_AI_PROCESSED (${status})`, {
      score: aiResult.anomalyScore,
      flags: aiResult.flags
    });

    return processedSubmission;
  }

  // --- Officer Review Actions ---
  reviewSubmission(
    submissionId: string,
    decision: 'approve' | 'flag' | 'request_info' | 'reject',
    notes: string,
    queryMessage?: string
  ): Submission {
    const sub = this.submissions.find(s => s.submissionId === submissionId);
    if (!sub) throw new Error('Submission not found');

    sub.officerDecision = decision;
    sub.officerNotes = notes;
    sub.officerReviewedAt = new Date().toISOString();
    sub.officerId = this.currentUser.userId;

    if (decision === 'approve') {
      sub.status = 'approved';
      const l = this.loans.find(loan => loan.loanId === sub.loanId);
      if (l) l.status = 'approved';
    } else if (decision === 'flag') {
      sub.status = 'ai_flagged';
      const l = this.loans.find(loan => loan.loanId === sub.loanId);
      if (l) l.status = 'flagged';
    } else if (decision === 'reject') {
      sub.status = 'rejected';
      const l = this.loans.find(loan => loan.loanId === sub.loanId);
      if (l) l.status = 'rejected';
    } else if (decision === 'request_info') {
      sub.status = 'clarification_requested';
      if (!sub.clarifications) sub.clarifications = [];
      sub.clarifications.push({
        queryId: `clar_${Date.now()}`,
        officerId: this.currentUser.userId,
        officerName: this.currentUser.name,
        message: queryMessage || notes,
        createdAt: new Date().toISOString()
      });
    }

    this.saveToStorage();
    this.logAudit('submission', submissionId, `OFFICER_REVIEW_${decision.toUpperCase()}`, { notes });
    return sub;
  }

  bulkApproveLowRiskSubmissions(minScore = 85): number {
    let count = 0;
    for (const sub of this.submissions) {
      if (
        (sub.status === 'ai_passed' || sub.status === 'officer_review') &&
        (sub.aiValidationResult?.anomalyScore || 0) >= minScore &&
        (sub.aiValidationResult?.flags?.length || 0) === 0
      ) {
        sub.status = 'approved';
        sub.officerDecision = 'approve';
        sub.officerNotes = 'Auto-approved via low-risk bulk approval workflow.';
        sub.officerReviewedAt = new Date().toISOString();
        sub.officerId = this.currentUser.userId;

        const loan = this.loans.find(l => l.loanId === sub.loanId);
        if (loan) loan.status = 'approved';

        count++;
      }
    }
    this.saveToStorage();
    this.logAudit('submission', 'bulk', `BULK_APPROVED_${count}_ITEMS`, { minScore });
    return count;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  private logAudit(
    entityType: 'submission' | 'loan' | 'user' | 'scheme' | 'field_audit',
    entityId: string,
    action: string,
    metadata?: Record<string, any>
  ) {
    const log: AuditLog = {
      logId: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityType,
      entityId,
      action,
      actorId: this.currentUser.userId,
      actorName: this.currentUser.name,
      actorRole: this.currentUser.role,
      timestamp: new Date().toISOString(),
      metadata
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  // Reset to initial clean state
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.SCHEMES);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    this.loadFromStorage();
  }
}

export const dataService = new DataService();
