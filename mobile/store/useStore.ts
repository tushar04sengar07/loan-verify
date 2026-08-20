import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Loan, Submission, MediaFile, SyncQueueItem, SchemeRule } from '../shared/types';
import { DEFAULT_SCHEMES } from '../shared/defaultSchemes';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { executeAIValidationPipeline } from '../shared/validationUtils';
import { generateSimulatedPHash } from '../shared/fraudUtils';

interface DraftSubmission {
  loanId: string;
  schemeId: string;
  assetCategory: string;
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number;
  locationLocked: boolean;
  mediaFiles: MediaFile[];
  assetDescription: string;
  assetTagId?: string;
  invoiceNumber?: string;
  vendorName?: string;
  purchaseDate?: string;
}

interface AppState {
  // Auth
  user: User | null;
  language: Language;
  isOnline: boolean;
  
  // Data
  loans: Loan[];
  submissions: Submission[];
  schemes: SchemeRule[];
  offlineQueue: SyncQueueItem[];
  
  // Active Draft
  draft: DraftSubmission;
  
  // Actions
  setUser: (user: User | null) => void;
  setLanguage: (lang: Language) => void;
  setIsOnline: (online: boolean) => void;
  setDraftGps: (lat: number, lng: number, acc: number) => void;
  addDraftMedia: (media: MediaFile) => void;
  removeDraftMedia: (mediaId: string) => void;
  updateDraftDetails: (details: Partial<DraftSubmission>) => void;
  resetDraft: () => void;
  submitDraft: () => Promise<Submission>;
  queueDraftOffline: () => Promise<SyncQueueItem>;
  processOfflineQueue: () => Promise<number>;
  setSubmissions: (submissions: Submission[]) => void;
  setUserDistrict: (district: string) => void;
  updateSubmissionAudit: (submissionId: string, fieldAudit: any) => void;
  t: (key: string) => string;
}

const INITIAL_BENEFICIARY_USER: User = {
  userId: 'user_ben_01',
  phone: '+91 98123 45670',
  name: 'Ramesh Patil',
  aadhaarLast4: '3812',
  role: 'beneficiary',
  district: 'Pune',
  state: 'Maharashtra',
  createdAt: '2026-06-01T08:30:00Z',
  lastLogin: new Date().toISOString(),
  trustScore: 92
};

const INITIAL_ACTIVE_LOAN: Loan = {
  loanId: 'loan_pune_01',
  beneficiaryId: 'user_ben_01',
  beneficiaryName: 'Ramesh Patil',
  beneficiaryPhone: '+91 98123 45670',
  loanAmount: 180000,
  disbursedAmount: 180000,
  schemeId: 'scheme_milch_animal',
  schemeName: 'National Livestock Mission (Dairy Cattle)',
  assetCategory: 'Milch Animal',
  bankName: 'State Bank of India',
  branchCode: 'SBI000452',
  district: 'Pune',
  state: 'Maharashtra',
  sanctionDate: '2026-07-05',
  expectedVerificationDate: '2026-08-30',
  status: 'pending_submission',
  verificationDeadline: '2026-09-10',
  fraudScore: 0,
  fraudFlags: [],
  createdAt: '2026-07-05T10:00:00Z',
  updatedAt: '2026-08-10T12:00:00Z'
};

export const useStore = create<AppState>((set, get) => ({
  user: INITIAL_BENEFICIARY_USER,
  language: 'en',
  isOnline: true,
  loans: [INITIAL_ACTIVE_LOAN],
  submissions: [],
  schemes: [...DEFAULT_SCHEMES],
  offlineQueue: [],

  draft: {
    loanId: INITIAL_ACTIVE_LOAN.loanId,
    schemeId: INITIAL_ACTIVE_LOAN.schemeId,
    assetCategory: INITIAL_ACTIVE_LOAN.assetCategory,
    gpsLat: 18.5204,
    gpsLng: 73.8567,
    gpsAccuracy: 8,
    locationLocked: true,
    mediaFiles: [],
    assetDescription: '',
    assetTagId: '',
    invoiceNumber: '',
    vendorName: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  },

  setUser: (user) => {
    if (!user) {
      set({ user: null });
      return;
    }

    // Build active loan dynamically from the logged-in beneficiary record
    const userAny = user as any;
    const deadline = userAny.verificationDeadline || userAny.dueDate || userAny.expectedVerificationDate || '2026-10-15';
    const sanctionDate = userAny.sanctionDate || new Date().toISOString().split('T')[0];

    const userLoan: Loan = {
      loanId: userAny.loanId || `loan_${user.userId}`,
      beneficiaryId: user.userId,
      beneficiaryName: user.name,
      beneficiaryPhone: user.phone,
      loanAmount: Number(userAny.loanAmount || userAny.sanctionedAmount) || 150000,
      disbursedAmount: Number(userAny.disbursedAmount || userAny.loanAmount || userAny.sanctionedAmount) || 150000,
      schemeId: userAny.schemeId || 'scheme_milch_animal',
      schemeName: userAny.schemeName || 'National Livestock Mission (Dairy Cattle)',
      assetCategory: userAny.assetCategory || 'Milch Animal',
      bankName: userAny.bankName || 'State Bank of India',
      branchCode: userAny.branchCode || 'SBI000452',
      district: user.district || 'Pune',
      state: user.state || 'Maharashtra',
      sanctionDate: sanctionDate,
      expectedVerificationDate: deadline,
      status: 'pending_submission',
      verificationDeadline: deadline,
      fraudScore: 0,
      fraudFlags: [],
      createdAt: userAny.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set((state) => ({
      user,
      loans: [userLoan, ...state.loans.filter(l => l.beneficiaryPhone !== user.phone)],
      draft: {
        ...state.draft,
        loanId: userLoan.loanId,
        assetCategory: userLoan.assetCategory,
        schemeId: userLoan.schemeId
      }
    }));

    // Live query for server loan records
    try {
      const phoneDigits = (user.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (phoneDigits) {
        fetch(`http://localhost:5000/api/loans/user/${phoneDigits}`)
          .then(r => r.json())
          .then(res => {
            if (res.success && res.loans && res.loans.length > 0) {
              const liveLoan = res.loans[0];
              set((state) => ({
                loans: [liveLoan, ...state.loans.filter(l => l.loanId !== liveLoan.loanId)],
                draft: {
                  ...state.draft,
                  loanId: liveLoan.loanId,
                  assetCategory: liveLoan.assetCategory,
                  schemeId: liveLoan.schemeId
                }
              }));
            }
          })
          .catch(() => {});
      }
    } catch (e) {}
  },
  setLanguage: (language) => set({ language }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setSubmissions: (submissions) => set({ submissions }),
  setUserDistrict: (district) => set((state) => ({
    user: state.user ? { ...state.user, district } : null
  })),
  updateSubmissionAudit: (submissionId, fieldAudit) => set((state) => ({
    submissions: state.submissions.map(s => 
      s.submissionId === submissionId 
        ? { 
            ...s, 
            fieldAudit, 
            status: fieldAudit.outcome === 'verified' ? 'approved' : fieldAudit.outcome === 'discrepancy_found' ? 'ai_flagged' : 'rejected' 
          }
        : s
    )
  })),

  setDraftGps: (gpsLat, gpsLng, gpsAccuracy) => {
    set((state) => ({
      draft: { ...state.draft, gpsLat, gpsLng, gpsAccuracy, locationLocked: true }
    }));
  },

  addDraftMedia: (media) => {
    set((state) => ({
      draft: { ...state.draft, mediaFiles: [...state.draft.mediaFiles, media] }
    }));
  },

  removeDraftMedia: (mediaId) => {
    set((state) => ({
      draft: {
        ...state.draft,
        mediaFiles: state.draft.mediaFiles.filter(m => m.id !== mediaId)
      }
    }));
  },

  updateDraftDetails: (details) => {
    set((state) => ({
      draft: { ...state.draft, ...details }
    }));
  },

  resetDraft: () => {
    set((state) => ({
      draft: {
        loanId: state.loans[0]?.loanId || 'loan_01',
        schemeId: state.loans[0]?.schemeId || 'scheme_milch_animal',
        assetCategory: state.loans[0]?.assetCategory || 'Milch Animal',
        gpsLat: 18.5204,
        gpsLng: 73.8567,
        gpsAccuracy: 8,
        locationLocked: true,
        mediaFiles: [],
        assetDescription: '',
        assetTagId: '',
        invoiceNumber: '',
        vendorName: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      }
    }));
  },

  submitDraft: async () => {
    const state = get();
    const { draft, user, loans, schemes, submissions } = state;
    const loan = loans.find(l => l.loanId === draft.loanId) || loans[0];
    const schemeRule = schemes.find(s => s.schemeId === draft.schemeId) || schemes[0];

    const submission: Submission = {
      submissionId: `sub_${Date.now()}`,
      loanId: draft.loanId,
      beneficiaryId: user?.userId || 'user_ben_01',
      beneficiaryName: user?.name || 'Beneficiary',
      beneficiaryPhone: user?.phone || '+91 98123 45670',
      schemeId: draft.schemeId,
      schemeName: loan?.schemeName || 'Government Scheme',
      assetCategory: draft.assetCategory,
      mediaFiles: draft.mediaFiles.length > 0 ? draft.mediaFiles : [
        {
          id: `med_${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
          type: 'photo',
          angle: 'front',
          gpsLat: draft.gpsLat,
          gpsLng: draft.gpsLng,
          gpsAccuracy: draft.gpsAccuracy,
          timestamp: new Date().toISOString(),
          deviceId: 'samsung-a53',
          hash: generateSimulatedPHash(`img_asset_${Date.now()}`),
          exifData: {
            make: 'Samsung',
            model: 'SM-A536E',
            gpsLatitude: draft.gpsLat,
            gpsLongitude: draft.gpsLng
          }
        }
      ],
      assetDescription: draft.assetDescription || 'Asset verified and in operational usage.',
      assetTagId: draft.assetTagId || `TAG-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber: draft.invoiceNumber || 'INV-2026-001',
      vendorName: draft.vendorName || 'Authorized Vendor',
      purchaseDate: draft.purchaseDate || new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      isOffline: false,
      status: 'ai_pending',
      district: user?.district || 'Pune',
      state: user?.state || 'Maharashtra'
    };

    // Run client AI validation
    const aiResult = await executeAIValidationPipeline({
      submission,
      loan,
      schemeRule
    });

    const status = aiResult.anomalyScore >= (schemeRule?.autoApprovalScoreThreshold || 80)
      ? 'ai_passed'
      : aiResult.anomalyScore < (schemeRule?.flagThreshold || 50)
        ? 'ai_flagged'
        : 'officer_review';

    const processedSubmission: Submission = {
      ...submission,
      aiValidationResult: aiResult,
      status
    };

    // Update state & loan
    const updatedLoans = loans.map(l => {
      if (l.loanId === draft.loanId) {
        return {
          ...l,
          status: status === 'ai_passed' ? 'under_review' as const : 'flagged' as const,
          fraudScore: 100 - aiResult.anomalyScore,
          fraudFlags: aiResult.flags
        };
      }
      return l;
    });

    set({
      submissions: [processedSubmission, ...submissions],
      loans: updatedLoans
    });

    get().resetDraft();
    return processedSubmission;
  },

  queueDraftOffline: async () => {
    const state = get();
    const { draft, user, offlineQueue } = state;

    const queueItem: SyncQueueItem = {
      id: `queue_${Date.now()}`,
      localUuid: `uuid_${Date.now()}`,
      loanId: draft.loanId,
      beneficiaryId: user?.userId || 'user_ben_01',
      status: 'PENDING',
      retryCount: 0,
      mediaCount: draft.mediaFiles.length,
      mediaFiles: draft.mediaFiles.map(m => ({
        localUri: m.url,
        type: m.type,
        angle: m.angle || 'front',
        gpsLat: m.gpsLat,
        gpsLng: m.gpsLng,
        gpsAccuracy: m.gpsAccuracy,
        timestamp: m.timestamp
      })),
      formData: {
        assetDescription: draft.assetDescription,
        assetTagId: draft.assetTagId,
        vendorName: draft.vendorName,
        purchaseDate: draft.purchaseDate,
        invoiceNumber: draft.invoiceNumber
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedQueue = [...offlineQueue, queueItem];
    set({ offlineQueue: updatedQueue });
    get().resetDraft();
    return queueItem;
  },

  processOfflineQueue: async () => {
    const state = get();
    const { offlineQueue } = state;
    if (offlineQueue.length === 0) return 0;

    let syncedCount = 0;
    for (const item of offlineQueue) {
      if (item.status === 'PENDING' || item.status === 'FAILED') {
        item.status = 'SYNCED';
        syncedCount++;
      }
    }

    set({ offlineQueue: offlineQueue.filter(i => i.status !== 'SYNCED') });
    return syncedCount;
  },

  t: (key: string) => {
    const lang = get().language;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  }
}));
