export type UserRole = 'beneficiary' | 'fieldOfficer' | 'stateOfficer' | 'bankAdmin' | 'superAdmin';

export interface User {
  userId: string;
  phone: string;
  name: string;
  aadhaarLast4: string;
  role: UserRole;
  district: string;
  state: string;
  assignedLoans?: string[];
  createdAt: string;
  lastLogin: string;
  trustScore?: number; // 0 - 100
}

export type LoanStatus = 
  | 'pending_submission' 
  | 'under_review' 
  | 'approved' 
  | 'flagged' 
  | 'rejected'
  | 'field_audit_required';

export interface Loan {
  loanId: string;
  beneficiaryId: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  loanAmount: number;
  disbursedAmount: number;
  schemeId: string;
  schemeName: string;
  assetCategory: string; // e.g. "Milch Animal", "Tractor", "Sewing Machine", "Solar Water Pump"
  bankName: string;
  branchCode: string;
  district: string;
  state: string;
  sanctionDate: string;
  expectedVerificationDate: string;
  status: LoanStatus;
  officerAssignedId?: string;
  officerAssignedName?: string;
  verificationDeadline: string;
  fraudScore: number; // 0 - 100
  fraudFlags: string[];
  reverificationCycle?: number;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = 
  | 'ai_pending' 
  | 'ai_passed' 
  | 'ai_flagged' 
  | 'officer_review' 
  | 'approved' 
  | 'rejected'
  | 'clarification_requested'
  | 'spot_audit_assigned';

export interface MediaFile {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'photo' | 'video' | 'document';
  angle?: 'front' | 'side' | 'tag' | 'invoice' | 'audit_spot' | 'other';
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number; // in meters
  timestamp: string;
  deviceId: string;
  hash: string; // pHash or SHA256
  isBlurry?: boolean;
  laplacianVariance?: number;
  exifData?: {
    make?: string;
    model?: string;
    dateTimeOriginal?: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    altitude?: number;
  };
}

export interface AIValidationResult {
  confidence: number; // 0.0 - 1.0
  detectedLabels: Array<{
    name: string;
    confidence: number;
  }>;
  assetMatch: boolean;
  humanPresent?: boolean;
  duplicateDetected: boolean;
  duplicateSubmissionId?: string;
  hammingDistance?: number;
  metadataIntact: boolean;
  metadataFlags?: string[];
  locationInDistrict: boolean;
  locationDriftMeters?: number;
  contentSafe: boolean;
  anomalyScore: number; // 0 - 100
  breakdown: {
    gpsScore: number;       // max 20
    timestampScore: number; // max 15
    uniquenessScore: number;// max 25
    assetScore: number;     // max 30
    districtScore: number;  // max 10
  };
  validatedAt: string;
  flags: string[];
}

export interface SubmissionClarificationQuery {
  queryId: string;
  officerId: string;
  officerName: string;
  message: string;
  createdAt: string;
  responseMessage?: string;
  responseMedia?: MediaFile[];
  respondedAt?: string;
}

export interface FieldAuditRecord {
  auditId: string;
  officerId: string;
  officerName: string;
  visitedAt: string;
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy: number;
  outcome: 'verified' | 'discrepancy_found' | 'asset_not_found';
  notes: string;
  audioNoteUrl?: string;
  auditPhotos: MediaFile[];
  gpsTrail?: Array<{ lat: number; lng: number; timestamp: string }>;
}

export interface Submission {
  submissionId: string;
  loanId: string;
  beneficiaryId: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  schemeId: string;
  schemeName: string;
  assetCategory: string;
  mediaFiles: MediaFile[];
  assetDescription: string;
  assetTagId?: string; // QR / Barcode Tag
  invoiceNumber?: string;
  vendorName?: string;
  purchaseDate?: string;
  invoiceUrl?: string;
  aiValidationResult?: AIValidationResult;
  submittedAt: string;
  syncedAt: string;
  isOffline: boolean;
  status: SubmissionStatus;
  officerNotes?: string;
  officerVoiceNoteUrl?: string;
  officerReviewedAt?: string;
  officerDecision?: 'approve' | 'flag' | 'request_info' | 'reject';
  officerId?: string;
  clarifications?: SubmissionClarificationQuery[];
  fieldAudit?: FieldAuditRecord;
  reverificationIndex?: number;
  district: string;
  state: string;
}

export interface SchemeRule {
  schemeId: string;
  schemeName: string;
  assetCategory: string;
  description: string;
  icon: string;
  minPhotos: number;
  requiredAngles: string[];
  requireVideo: boolean;
  requireHumanPresence: boolean;
  requireInvoice: boolean;
  requireQrTag: boolean;
  targetLabels: string[]; // Vision API labels to match e.g. ["cow", "cattle", "bovine", "livestock"]
  silhouetteType: 'animal' | 'tractor' | 'machine' | 'solar' | 'general' | 'fish' | 'honey' | 'warehouse' | 'vehicle' | 'irrigation';
  minAiConfidence: number; // default 0.75
  autoApprovalScoreThreshold: number; // default 85
  flagThreshold: number; // default 50
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  logId: string;
  entityType: 'submission' | 'loan' | 'user' | 'scheme' | 'field_audit';
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface SyncQueueItem {
  id: string;
  localUuid: string;
  loanId: string;
  beneficiaryId: string;
  status: 'PENDING' | 'UPLOADING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
  mediaCount: number;
  mediaFiles: Array<{
    localUri: string;
    type: 'photo' | 'video' | 'document';
    angle: string;
    gpsLat: number;
    gpsLng: number;
    gpsAccuracy: number;
    timestamp: string;
  }>;
  formData: {
    assetDescription: string;
    assetTagId?: string;
    vendorName?: string;
    purchaseDate?: string;
    invoiceNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DistrictBoundary {
  districtName: string;
  stateName: string;
  center: [number, number]; // [lat, lng]
  polygonCoordinates: Array<[number, number]>; // Array of [lat, lng]
}
