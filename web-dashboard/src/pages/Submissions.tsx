import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCheck
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Submission, SubmissionStatus, Loan } from '../../../shared/types';
import { SAMPLE_DISTRICTS } from '../../../shared/sampleDistricts';

interface SubmissionsPageProps {
  selectedDistrict: string;
  searchTerm: string;
}

export const Submissions: React.FC<SubmissionsPageProps> = ({
  selectedDistrict,
  searchTerm
}) => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [viewMode, setViewMode] = useState<'submissions' | 'loans'>('submissions');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [schemeFilter, setSchemeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'anomaly_highest' | 'score_highest' | 'newest'>('anomaly_highest');
  const [bulkApproveSuccess, setBulkApproveSuccess] = useState<string | null>(null);

  const reloadData = async () => {
    await dataService.syncWithServer();
    setSubmissions(dataService.getSubmissions());
    setLoans(dataService.getLoans());
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBulkApprove = () => {
    const approvedCount = dataService.bulkApproveLowRiskSubmissions(85);
    reloadData();
    setBulkApproveSuccess(`Successfully bulk-approved ${approvedCount} low-risk submissions (Score ≥ 85)`);
    setTimeout(() => setBulkApproveSuccess(null), 4000);
  };

  // Filter and Sort Submissions
  const filteredSubmissions = submissions
    .filter(s => {
      if (selectedDistrict !== 'ALL' && s.district !== selectedDistrict) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (schemeFilter !== 'ALL' && s.schemeId !== schemeFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = s.beneficiaryName?.toLowerCase().includes(term);
        const matchLoan = s.loanId.toLowerCase().includes(term);
        const matchAsset = s.assetCategory.toLowerCase().includes(term);
        const matchTag = s.assetTagId?.toLowerCase().includes(term);
        const matchDist = s.district?.toLowerCase().includes(term);
        const matchState = s.state?.toLowerCase().includes(term);
        if (!matchName && !matchLoan && !matchAsset && !matchTag && !matchDist && !matchState) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const scoreA = a.aiValidationResult?.anomalyScore || 0;
      const scoreB = b.aiValidationResult?.anomalyScore || 0;
      if (sortBy === 'anomaly_highest') {
        return scoreA - scoreB;
      } else if (sortBy === 'score_highest') {
        return scoreB - scoreA;
      } else {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
    });

  // Filter Loans
  const filteredLoans = loans.filter(l => {
    if (selectedDistrict !== 'ALL' && l.district !== selectedDistrict) return false;
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (schemeFilter !== 'ALL' && l.schemeId !== schemeFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = l.beneficiaryName?.toLowerCase().includes(term);
      const matchLoan = l.loanId.toLowerCase().includes(term);
      const matchAsset = l.assetCategory.toLowerCase().includes(term);
      const matchDist = l.district?.toLowerCase().includes(term);
      const matchState = l.state?.toLowerCase().includes(term);
      if (!matchName && !matchLoan && !matchAsset && !matchDist && !matchState) return false;
    }
    return true;
  });

  const schemes = dataService.getSchemes();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & KPI Stat summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              State Officer Triage
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Field Proof Review & Approval Console
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized submission queue triaged by automated AI authenticity & anomaly scoring
          </p>
        </div>

        {/* Bulk Action Button */}
        <button
          onClick={handleBulkApprove}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Bulk Approve Low-Risk (Score ≥ 85)</span>
        </button>
      </div>

      {bulkApproveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{bulkApproveSuccess}</span>
        </div>
      )}

      {/* View Mode Segmented Controls */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setViewMode('submissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            viewMode === 'submissions'
              ? 'bg-govBlue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Proof Submissions Triage ({filteredSubmissions.length})</span>
        </button>

        <button
          onClick={() => setViewMode('loans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            viewMode === 'loans'
              ? 'bg-govBlue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All Sanctioned Loans Registry ({filteredLoans.length})</span>
        </button>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending_submission">Pending Beneficiary Submission</option>
            <option value="under_review">Under Review</option>
            <option value="ai_passed">AI Passed</option>
            <option value="ai_flagged">AI Flagged (Anomaly)</option>
            <option value="approved">Officer Approved</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Scheme Filter */}
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Schemes</option>
            {schemes.map(s => (
              <option key={s.schemeId} value={s.schemeId}>{s.assetCategory} ({s.schemeName.substring(0, 24)}...)</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        {viewMode === 'submissions' && (
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="anomaly_highest">🚨 Highest Anomaly First (Lowest AI Score)</option>
              <option value="score_highest">🛡️ Highest AI Score First</option>
              <option value="newest">🕒 Most Recently Submitted</option>
            </select>
          </div>
        )}
      </div>

      {/* Submissions or Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {viewMode === 'submissions' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Beneficiary & Loan</th>
                  <th className="py-3 px-4">Scheme & Asset</th>
                  <th className="py-3 px-4">Location / District</th>
                  <th className="py-3 px-4 text-center">AI Authenticity Score</th>
                  <th className="py-3 px-4">Proof Media</th>
                  <th className="py-3 px-4">Status & Flags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No submissions match the selected filters or search query.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const score = sub.aiValidationResult?.anomalyScore ?? 0;
                    const isAnomaly = score < 50;

                    return (
                      <tr 
                        key={sub.submissionId}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isAnomaly ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* Beneficiary */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{sub.beneficiaryName || 'Beneficiary'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{sub.loanId}</div>
                        </td>

                        {/* Scheme & Asset */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{sub.assetCategory}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{sub.schemeName}</div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold">{sub.district}, {sub.state}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {sub.mediaFiles[0] ? `${sub.mediaFiles[0].gpsLat.toFixed(3)}, ${sub.mediaFiles[0].gpsLng.toFixed(3)}` : 'GPS Captured'}
                          </div>
                        </td>

                        {/* AI Authenticity Score Meter */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center space-x-2">
                            <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  score >= 80 ? 'bg-emerald-500' :
                                  score >= 50 ? 'bg-amber-500' : 'bg-red-600'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`font-bold text-xs ${
                              score >= 80 ? 'text-emerald-700' :
                              score >= 50 ? 'text-amber-700' : 'text-red-700'
                            }`}>
                              {score}
                            </span>
                          </div>
                        </td>

                        {/* Media Thumbnails */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            {sub.mediaFiles.slice(0, 3).map((m, idx) => (
                              <img
                                key={m.id || idx}
                                src={m.url}
                                alt="proof thumbnail"
                                className="w-8 h-8 rounded-md object-cover border border-slate-200"
                              />
                            ))}
                            {sub.mediaFiles.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                +{sub.mediaFiles.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status & Flags */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                              sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              sub.status === 'ai_passed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              sub.status === 'ai_flagged' ? 'bg-red-50 text-red-700 border border-red-200' :
                              sub.status === 'clarification_requested' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {sub.status.toUpperCase().replace('_', ' ')}
                            </span>

                            {sub.fieldAudit && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                sub.fieldAudit.outcome === 'verified' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                sub.fieldAudit.outcome === 'discrepancy_found' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                🔍 Spot Audit: {sub.fieldAudit.outcome.toUpperCase().replace('_', ' ')}
                              </span>
                            )}

                            {sub.aiValidationResult?.flags && sub.aiValidationResult.flags.length > 0 && (
                              <span className="text-[10px] text-red-600 font-semibold truncate max-w-[150px]" title={sub.aiValidationResult.flags.join(', ')}>
                                ⚠ {sub.aiValidationResult.flags[0]}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/submission/${sub.submissionId}`)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-govBlue-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Beneficiary & Phone</th>
                  <th className="py-3 px-4">Scheme & Asset</th>
                  <th className="py-3 px-4">District / State</th>
                  <th className="py-3 px-4">Sanctioned Amount</th>
                  <th className="py-3 px-4">Bank / Branch</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Loan Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No loans match the selected filters or search query.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => {
                    const matchingSub = submissions.find(s => s.loanId === loan.loanId);
                    return (
                      <tr key={loan.loanId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{loan.beneficiaryName || 'Beneficiary'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{loan.beneficiaryPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{loan.assetCategory}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{loan.schemeName}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-bold">{loan.district}</div>
                          <div className="text-[10px] text-slate-500">{loan.state}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">
                          ₹{loan.loanAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">{loan.bankName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{loan.branchCode}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {loan.verificationDeadline || '2026-10-15'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            loan.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            loan.status === 'under_review' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            loan.status === 'flagged' ? 'bg-red-50 text-red-700 border border-red-200' :
                            loan.status === 'rejected' ? 'bg-gray-100 text-gray-700 border border-gray-300' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {loan.status.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {matchingSub ? (
                            <button
                              onClick={() => navigate(`/submission/${matchingSub.submissionId}`)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-govBlue-50 hover:bg-govBlue-600 hover:text-white text-govBlue-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            >
                              <span>Review Proof</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Awaiting Photo</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
