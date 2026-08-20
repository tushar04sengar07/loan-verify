import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  MessageSquare, 
  FileText, 
  MapPin, 
  QrCode, 
  Calendar, 
  Phone, 
  Building, 
  DollarSign, 
  Send,
  UserCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Submission, Loan } from '../../../shared/types';
import { ConfidenceMeter } from '../components/ai/ConfidenceMeter';
import { DistrictMap } from '../components/map/DistrictMap';
import { SideBySideReview } from '../components/review/SideBySideReview';

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);

  // Decision Modal States
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [decisionType, setDecisionType] = useState<'approve' | 'flag' | 'request_info' | 'reject'>('approve');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [queryMessage, setQueryMessage] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSub = async () => {
      await dataService.syncWithServer();
      if (id) {
        const sub = dataService.getSubmissionById(id);
        if (sub) {
          setSubmission(sub);
          const l = dataService.getLoanById(sub.loanId);
          if (l) setLoan(l);
        }
      }
    };
    loadSub();
  }, [id]);

  if (!submission) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-base font-bold text-slate-800">Submission not found</h3>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          Return to Review Queue
        </button>
      </div>
    );
  }

  const handleOpenAction = (type: 'approve' | 'flag' | 'request_info' | 'reject') => {
    setDecisionType(type);
    setOfficerNotes(
      type === 'approve' ? 'Proof verified. Asset authenticity, EXIF geo-tags and category labels confirmed.' :
      type === 'flag' ? 'Flagged for on-site physical audit due to detected anomaly.' :
      type === 'reject' ? 'Submission rejected due to failure to meet verification requirements.' : ''
    );
    setQueryMessage(
      type === 'request_info' ? 'Please submit an additional clear photo showing the asset invoice and serial number tag.' : ''
    );
    setShowActionModal(true);
  };

  const handleConfirmDecision = () => {
    if (!submission) return;
    const updated = dataService.reviewSubmission(
      submission.submissionId,
      decisionType,
      officerNotes,
      queryMessage
    );
    setSubmission({ ...updated });
    setShowActionModal(false);
    setActionSuccess(`Decision recorded: ${decisionType.toUpperCase()} successfully applied.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const primaryMedia = submission.mediaFiles[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Submission Review: {submission.submissionId}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                submission.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                submission.status === 'ai_flagged' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {submission.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {new Date(submission.submittedAt).toLocaleString()} • Beneficiary: {submission.beneficiaryName}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAction('request_info')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
            <span>Request Info</span>
          </button>

          <button
            onClick={() => handleOpenAction('flag')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Flag for Field Visit</span>
          </button>

          <button
            onClick={() => handleOpenAction('reject')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Reject</span>
          </button>

          <button
            onClick={() => handleOpenAction('approve')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve Proof</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Visual Proof + AI Report Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Confidence Meter Gauge */}
          <ConfidenceMeter result={submission.aiValidationResult} />

          {/* Side by Side Visual Proof & Spot Audit */}
          <SideBySideReview
            beneficiaryMedia={submission.mediaFiles}
            fieldAudit={submission.fieldAudit}
            assetCategory={submission.assetCategory}
          />

          {/* AI Validation Report Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Detailed AI Pipeline Inspection Report
            </h4>

            {/* Check Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Check 1: EXIF Metadata */}
              <div className={`p-3 rounded-xl border flex items-start space-x-3 ${
                submission.aiValidationResult?.metadataIntact
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50/50 border-red-200 text-red-900'
              }`}>
                <FileText className={`w-4 h-4 mt-0.5 ${
                  submission.aiValidationResult?.metadataIntact ? 'text-emerald-600' : 'text-red-600'
                }`} />
                <div className="text-xs">
                  <div className="font-bold">EXIF & GPS Integrity</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {submission.aiValidationResult?.metadataIntact
                      ? 'EXIF GPS coordinates match reported sensor pin (<500m tolerance).'
                      : `Anomaly: ${submission.aiValidationResult?.metadataFlags?.join(', ') || 'Metadata mismatch'}`}
                  </div>
                </div>
              </div>

              {/* Check 2: Duplicate / Recycled Photo Check */}
              <div className={`p-3 rounded-xl border flex items-start space-x-3 ${
                !submission.aiValidationResult?.duplicateDetected
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50/50 border-red-200 text-red-900'
              }`}>
                <ShieldAlert className={`w-4 h-4 mt-0.5 ${
                  !submission.aiValidationResult?.duplicateDetected ? 'text-emerald-600' : 'text-red-600'
                }`} />
                <div className="text-xs">
                  <div className="font-bold">Perceptual Hash Uniqueness</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {!submission.aiValidationResult?.duplicateDetected
                      ? `Unique image (Hamming distance ${submission.aiValidationResult?.hammingDistance || 48} > 10).`
                      : `RECYCLED IMAGE COLLISION with submission ${submission.aiValidationResult?.duplicateSubmissionId}`}
                  </div>
                </div>
              </div>

              {/* Check 3: Vision Object Match */}
              <div className={`p-3 rounded-xl border flex items-start space-x-3 ${
                submission.aiValidationResult?.assetMatch
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50/50 border-red-200 text-red-900'
              }`}>
                <CheckCircle className={`w-4 h-4 mt-0.5 ${
                  submission.aiValidationResult?.assetMatch ? 'text-emerald-600' : 'text-red-600'
                }`} />
                <div className="text-xs">
                  <div className="font-bold">Asset Recognition ({submission.assetCategory})</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Detected: {(submission.aiValidationResult?.detectedLabels || []).map(l => l.name).join(', ')}
                  </div>
                </div>
              </div>

              {/* Check 4: District Containment */}
              <div className={`p-3 rounded-xl border flex items-start space-x-3 ${
                submission.aiValidationResult?.locationInDistrict
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50/50 border-red-200 text-red-900'
              }`}>
                <MapPin className={`w-4 h-4 mt-0.5 ${
                  submission.aiValidationResult?.locationInDistrict ? 'text-emerald-600' : 'text-red-600'
                }`} />
                <div className="text-xs">
                  <div className="font-bold">District Boundary Containment</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {submission.aiValidationResult?.locationInDistrict
                      ? `Coordinates fall inside ${submission.district} GeoJSON polygon.`
                      : `GPS coordinates are outside registered district (${submission.district}).`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: GPS Map + Loan Summary */}
        <div className="space-y-6">
          {/* Field Spot Audit Report (if present) */}
          {submission.fieldAudit && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl border border-slate-700 p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Field Spot Audit Report
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  submission.fieldAudit.outcome === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  submission.fieldAudit.outcome === 'discrepancy_found' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {submission.fieldAudit.outcome.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-700/60 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Auditing Officer:</span>
                  <span className="font-semibold text-white">{submission.fieldAudit.officerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Arrival GPS Lock:</span>
                  <span className="font-mono text-emerald-300">
                    {submission.fieldAudit.gpsLat.toFixed(4)}, {submission.fieldAudit.gpsLng.toFixed(4)} (±{submission.fieldAudit.gpsAccuracy}m)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Audit Timestamp:</span>
                  <span>{new Date(submission.fieldAudit.visitedAt).toLocaleString()}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-700/40">
                  <span className="text-slate-400 block mb-1">Inspection Notes:</span>
                  <p className="italic text-slate-200 bg-slate-800/80 p-2 rounded-lg border border-slate-700/50">
                    "{submission.fieldAudit.notes}"
                  </p>
                </div>
              </div>

              {submission.fieldAudit.auditPhotos && submission.fieldAudit.auditPhotos.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">On-Site Auditor Photo:</span>
                  <img
                    src={submission.fieldAudit.auditPhotos[0].url}
                    alt="Auditor spot capture"
                    className="w-full h-32 object-cover rounded-lg border border-slate-700"
                  />
                </div>
              )}
            </div>
          )}

          {/* Leaflet GPS Verification Map */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Geo-Tag Boundary Verification
              </h4>
              <span className="text-[11px] text-blue-600 font-bold">{submission.district} District</span>
            </div>
            
            <DistrictMap
              gpsLat={primaryMedia?.gpsLat}
              gpsLng={primaryMedia?.gpsLng}
              gpsAccuracy={primaryMedia?.gpsAccuracy}
              districtName={submission.district}
              anomalyScore={submission.aiValidationResult?.anomalyScore}
            />

            <div className="text-[11px] text-slate-500 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Latitude:</span>
                <span className="text-slate-800 font-semibold">{primaryMedia?.gpsLat?.toFixed(6) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Longitude:</span>
                <span className="text-slate-800 font-semibold">{primaryMedia?.gpsLng?.toFixed(6) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy Radius:</span>
                <span className="text-slate-800 font-semibold">±{primaryMedia?.gpsAccuracy || 8} meters</span>
              </div>
            </div>
          </div>

          {/* Beneficiary & Loan Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Loan & Scheme Summary
            </h4>

            <div className="space-y-2.5 divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-900">{submission.beneficiaryName}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Mobile Phone:</span>
                <span className="font-mono text-slate-800">{submission.beneficiaryPhone || '+91 98123 45670'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Loan Amount:</span>
                <span className="font-bold text-emerald-700">₹{loan?.loanAmount?.toLocaleString('en-IN') || '1,80,000'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Bank / Branch:</span>
                <span className="text-slate-800 font-medium">{loan?.bankName} ({loan?.branchCode})</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Asset Tag / QR:</span>
                <span className="font-mono text-blue-600 font-semibold">{submission.assetTagId || 'N/A'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Vendor / Invoice:</span>
                <span className="text-slate-800">{submission.vendorName || 'Direct Vendor'} (#{submission.invoiceNumber || 'INV-001'})</span>
              </div>
            </div>
          </div>

          {/* Clarification Thread */}
          {submission.clarifications && submission.clarifications.length > 0 && (
            <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-sm space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-purple-800 font-bold">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>Officer Clarification Thread</span>
              </div>
              {submission.clarifications.map((c) => (
                <div key={c.queryId} className="bg-purple-50 p-3 rounded-lg border border-purple-100 space-y-1">
                  <div className="flex justify-between font-semibold text-purple-900">
                    <span>{c.officerName}</span>
                    <span className="text-[10px] text-purple-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 capitalize">
              Confirm Action: {decisionType.replace('_', ' ')}
            </h3>

            {decisionType === 'request_info' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message to Beneficiary (Push & SMS)
                </label>
                <textarea
                  rows={3}
                  value={queryMessage}
                  onChange={(e) => setQueryMessage(e.target.value)}
                  placeholder="Specify what additional photos or details are needed..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Officer Review Notes & Rationale
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className="px-4 py-2 bg-govBlue-600 hover:bg-govBlue-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
