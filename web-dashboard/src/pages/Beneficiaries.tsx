import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  Users, 
  UploadCloud, 
  Plus, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Phone, 
  Calendar,
  Building,
  Check,
  X
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Loan, SchemeRule } from '../../../shared/types';
import { SAMPLE_DISTRICTS } from '../../../shared/sampleDistricts';

interface BeneficiariesProps {
  selectedDistrict: string;
  searchTerm: string;
}

export const Beneficiaries: React.FC<BeneficiariesProps> = ({
  selectedDistrict,
  searchTerm
}) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [schemes, setSchemes] = useState<SchemeRule[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCsvModal, setShowCsvModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Single Loan Form State
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryPhone: '',
    aadhaarLast4: '',
    loanAmount: 150000,
    schemeId: '',
    assetCategory: 'Milch Animal',
    bankName: 'State Bank of India',
    branchCode: 'SBI000101',
    district: 'Pune',
    state: 'Maharashtra',
    verificationDeadline: '2026-10-15'
  });

  // CSV Bulk Upload State
  const [parsedCsvRows, setParsedCsvRows] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState<boolean>(false);

  const reloadData = () => {
    setLoans(dataService.getLoans());
    setSchemes(dataService.getSchemes());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleCreateSingleLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedScheme = schemes.find(s => s.schemeId === formData.schemeId) || schemes[0];

    dataService.createLoan({
      beneficiaryName: formData.beneficiaryName,
      beneficiaryPhone: formData.beneficiaryPhone,
      loanAmount: Number(formData.loanAmount),
      disbursedAmount: Number(formData.loanAmount),
      schemeId: selectedScheme.schemeId,
      schemeName: selectedScheme.schemeName,
      assetCategory: selectedScheme.assetCategory,
      bankName: formData.bankName,
      branchCode: formData.branchCode,
      district: formData.district,
      state: formData.state,
      sanctionDate: new Date().toISOString().split('T')[0],
      expectedVerificationDate: formData.verificationDeadline || '2026-10-15',
      verificationDeadline: formData.verificationDeadline || '2026-10-15'
    });

    setShowAddModal(false);
    reloadData();
    setToastMessage(`Loan successfully created for ${formData.beneficiaryName}. OTP SMS invite dispatched.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        const errors: string[] = [];
        const validated: any[] = [];

        rows.forEach((row, idx) => {
          if (!row.beneficiaryName || !row.loanAmount || !row.assetCategory) {
            errors.push(`Row ${idx + 1}: Missing required fields (Name, Amount, or Category)`);
          } else {
            validated.push({
              beneficiaryName: row.beneficiaryName,
              beneficiaryPhone: row.beneficiaryPhone || '+91 98000 00000',
              loanAmount: Number(row.loanAmount),
              assetCategory: row.assetCategory,
              schemeName: row.schemeName || 'Government Subsidy Scheme',
              bankName: row.bankName || 'State Bank of India',
              branchCode: row.branchCode || 'SBI0001',
              district: row.district || 'Pune',
              state: row.state || 'Maharashtra',
              sanctionDate: row.sanctionDate || new Date().toISOString().split('T')[0],
              verificationDeadline: row.verificationDeadline || row.dueDate || row.expectedVerificationDate || '2026-10-15'
            });
          }
        });

        setParsedCsvRows(validated);
        setCsvErrors(errors);
      }
    });
  };

  const handleCommitCsvImport = () => {
    setIsProcessingCsv(true);
    const count = dataService.bulkCreateLoans(parsedCsvRows);
    setIsProcessingCsv(false);
    setShowCsvModal(false);
    setParsedCsvRows([]);
    reloadData();
    setToastMessage(`Successfully onboarded ${count} beneficiaries & loans via CSV bulk upload!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredLoans = loans.filter(l => {
    if (selectedDistrict !== 'ALL' && l.district !== selectedDistrict) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = l.beneficiaryName?.toLowerCase().includes(term);
      const matchPhone = l.beneficiaryPhone?.toLowerCase().includes(term);
      const matchLoan = l.loanId.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchLoan) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Bank & Agency Onboarding
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Beneficiary & Loan Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create loan records, upload bulk sanction CSVs, and trigger automated OTP invitations
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCsvModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Bulk CSV Upload</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-govBlue-600 hover:bg-govBlue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Single Loan</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Loans Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Loan Amount</th>
                <th className="py-3 px-4">Scheme & Asset</th>
                <th className="py-3 px-4">Bank & Branch</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Verification Due</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No loan records found for the current selection.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => (
                  <tr key={l.loanId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{l.beneficiaryName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{l.beneficiaryPhone} • ID: {l.loanId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-700">₹{l.loanAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-400">Disbursed: ₹{l.disbursedAmount.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{l.assetCategory}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{l.schemeName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{l.bankName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.branchCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{l.district}, {l.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{l.verificationDeadline}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        l.status === 'flagged' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {l.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">Create New Loan Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleLoan} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone (OTP)</label>
                  <input
                    type="tel"
                    required
                    value={formData.beneficiaryPhone}
                    onChange={(e) => setFormData({ ...formData, beneficiaryPhone: e.target.value })}
                    placeholder="+91 98123 45678"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Category</label>
                  <select
                    value={formData.schemeId}
                    onChange={(e) => setFormData({ ...formData, schemeId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {schemes.map(s => (
                      <option key={s.schemeId} value={s.schemeId}>{s.assetCategory} ({s.schemeName.substring(0, 20)}...)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => {
                      const dist = e.target.value;
                      const st = SAMPLE_DISTRICTS[dist]?.stateName || 'Maharashtra';
                      setFormData({ ...formData, district: dist, state: st });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(SAMPLE_DISTRICTS).map((d) => (
                      <option key={d.districtName} value={d.districtName}>
                        {d.districtName}, {d.stateName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verification Deadline</label>
                  <input
                    type="date"
                    value={formData.verificationDeadline}
                    onChange={(e) => setFormData({ ...formData, verificationDeadline: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-govBlue-600 hover:bg-govBlue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save & Dispatch Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Bulk Beneficiary CSV Import</h3>
              </div>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <label className="block text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                <span>Select .CSV file to upload</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                CSV Headers: beneficiaryName, beneficiaryPhone, loanAmount, assetCategory, district
              </p>
            </div>

            {parsedCsvRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Parsed {parsedCsvRows.length} valid beneficiary rows</span>
                  <span className="text-emerald-600">✓ Ready to import</span>
                </div>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2 text-[11px] bg-slate-50 space-y-1">
                  {parsedCsvRows.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex justify-between text-slate-600">
                      <span>{r.beneficiaryName} ({r.assetCategory})</span>
                      <span className="font-bold text-emerald-700">₹{r.loanAmount}</span>
                    </div>
                  ))}
                  {parsedCsvRows.length > 5 && (
                    <div className="text-slate-400 italic text-[10px]">
                      + {parsedCsvRows.length - 5} more records
                    </div>
                  )}
                </div>
              </div>
            )}

            {csvErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg space-y-1 max-h-24 overflow-y-auto">
                <div className="font-bold">Validation Warnings ({csvErrors.length})</div>
                {csvErrors.map((err, i) => (
                  <div key={i} className="text-[11px]">• {err}</div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedCsvRows.length === 0 || isProcessingCsv}
                onClick={handleCommitCsvImport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm"
              >
                {isProcessingCsv ? 'Importing...' : `Commit Import (${parsedCsvRows.length} records)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
