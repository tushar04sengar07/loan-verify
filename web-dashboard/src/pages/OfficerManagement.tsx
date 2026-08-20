import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Building2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Filter,
  UserPlus,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { User, UserRole } from '../../../shared/types';
import { SAMPLE_DISTRICTS } from '../../../shared/sampleDistricts';

interface OfficerManagementProps {
  selectedDistrict?: string;
  searchTerm?: string;
  currentUserRole?: UserRole;
}

export const OfficerManagement: React.FC<OfficerManagementProps> = ({
  currentUserRole
}) => {
  const [officers, setOfficers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentUser = dataService.getCurrentUser();
  const effectiveRole = currentUserRole || currentUser.role;
  const isSuperAdmin = effectiveRole === 'superAdmin';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'fieldOfficer' as UserRole,
    designation: 'Field Verification Officer',
    district: 'Pune',
    state: 'Maharashtra',
    aadhaarLast4: '',
    employeeId: ''
  });

  const reloadOfficers = async () => {
    await dataService.syncWithServer();
    setOfficers(dataService.getOfficers());
  };

  useEffect(() => {
    reloadOfficers();
    const interval = setInterval(reloadOfficers, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    let defaultDesignation = 'Field Verification Officer';
    if (role === 'stateOfficer') defaultDesignation = 'State Agency Nodal Officer';
    else if (role === 'bankAdmin') defaultDesignation = 'Lead Bank Branch Manager';
    else if (role === 'superAdmin') defaultDesignation = 'Principal Scheme Director';

    setFormData({
      ...formData,
      role,
      designation: defaultDesignation
    });
  };

  const handleDistrictChange = (dist: string) => {
    const st = SAMPLE_DISTRICTS[dist]?.stateName || (dist === 'State HQ' ? 'National' : 'Maharashtra');
    setFormData({
      ...formData,
      district: dist,
      state: st
    });
  };

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setErrorMessage('Permission Denied: Only Super Administrators have authorization to onboard new officers.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Officer Name and Mobile Phone are required.');
      return;
    }

    const cleanPhone = formData.phone.trim().startsWith('+91') 
      ? formData.phone.trim() 
      : `+91${formData.phone.trim().replace(/[^0-9]/g, '').slice(-10)}`;

    try {
      const newOfficer = dataService.createOfficer({
        name: formData.name.trim(),
        phone: cleanPhone,
        role: formData.role,
        district: formData.district,
        state: formData.state,
        aadhaarLast4: formData.aadhaarLast4 || cleanPhone.slice(-4),
        trustScore: 98
      }, effectiveRole);

      setShowAddModal(false);
      setSuccessMessage(`Officer "${newOfficer.name}" (${newOfficer.role}) successfully onboarded.`);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Reset Form
      setFormData({
        name: '',
        phone: '',
        role: 'fieldOfficer',
        designation: 'Field Verification Officer',
        district: 'Pune',
        state: 'Maharashtra',
        aadhaarLast4: '',
        employeeId: ''
      });

      reloadOfficers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to onboard officer.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDeleteOfficer = (userId: string, name: string) => {
    if (!isSuperAdmin) {
      setErrorMessage('Permission Denied: Only Super Administrators can remove officer profiles.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (window.confirm(`Are you sure you want to remove officer "${name}" from the system?`)) {
      try {
        dataService.deleteOfficer(userId, effectiveRole);
        reloadOfficers();
        setSuccessMessage(`Officer "${name}" removed.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to remove officer.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    }
  };

  // Filter logic
  const filteredOfficers = officers.filter(o => {
    if (roleFilter !== 'ALL' && o.role !== roleFilter) return false;
    if (districtFilter !== 'ALL' && o.district !== districtFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = o.name.toLowerCase().includes(q);
      const matchPhone = o.phone.toLowerCase().includes(q);
      const matchDist = o.district.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchDist) return false;
    }
    return true;
  });

  const countField = officers.filter(o => o.role === 'fieldOfficer').length;
  const countState = officers.filter(o => o.role === 'stateOfficer').length;
  const countBank = officers.filter(o => o.role === 'bankAdmin').length;
  const countSuper = officers.filter(o => o.role === 'superAdmin').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Non-SuperAdmin Warning Banner */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-amber-800">👑 Super Admin Privilege Required:</span> You are currently viewing the roster as a <span className="capitalize font-bold underline">{effectiveRole}</span> (Read-Only Mode). Only Super Administrators (Dr. Aruna Roy) possess authorization to onboard new officers or revoke credentials.
            </div>
          </div>
          <span className="text-[11px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-mono font-bold shrink-0 ml-2">
            Switch Persona to Super Admin
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
              isSuperAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {isSuperAdmin ? '👑 Super Admin Console' : '🔒 Officer Roster (Read-Only)'}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Officer & Personnel Management Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperAdmin 
              ? 'Onboard, assign jurisdictions, and manage verification officers across 12 Indian districts'
              : 'Directory of all verified state nodal officers, bank branch managers, and field spot auditors'
            }
          </p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-govBlue-600 hover:bg-govBlue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Officer</span>
          </button>
        ) : (
          <button
            disabled
            title="Super Admin role required to onboard officers"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl border border-slate-200 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Onboard New Officer (Super Admin Only)</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Field Auditors</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{countField}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">On-site GPS Auditors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State Reviewers</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{countState}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Approval Nodal Officers</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bank Admins</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{countBank}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Loan Onboarding Leads</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Super Admins</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{countSuper}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">System Authorities</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Officer Name, Mobile Number, or District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="fieldOfficer">Field Officers</option>
            <option value="stateOfficer">State Officers</option>
            <option value="bankAdmin">Bank Admins</option>
            <option value="superAdmin">Super Admins</option>
          </select>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {Object.values(SAMPLE_DISTRICTS).map(d => (
              <option key={d.districtName} value={d.districtName}>
                {d.districtName}, {d.stateName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3.5 px-4">Officer Profile</th>
                <th className="py-3.5 px-4">Role & Access</th>
                <th className="py-3.5 px-4">Mobile & Login</th>
                <th className="py-3.5 px-4">Assigned Jurisdiction</th>
                <th className="py-3.5 px-4">Aadhaar (Last 4)</th>
                <th className="py-3.5 px-4 text-center">Trust Index</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No officers match the current filters or search query.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.userId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-200">
                          {officer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{officer.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{officer.userId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        officer.role === 'superAdmin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        officer.role === 'stateOfficer' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        officer.role === 'bankAdmin' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {officer.role === 'fieldOfficer' ? '📍 Field Auditor' :
                         officer.role === 'stateOfficer' ? '👮 State Officer' :
                         officer.role === 'bankAdmin' ? '🏦 Bank Admin' : '👑 Super Admin'}
                      </span>
                    </td>

                    {/* Mobile */}
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">
                      {officer.phone}
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-bold">{officer.district}</div>
                      <div className="text-[10px] text-slate-500">{officer.state}</div>
                    </td>

                    {/* Aadhaar */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      •••• •••• {officer.aadhaarLast4 || '9932'}
                    </td>

                    {/* Trust Index */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {officer.trustScore || 95}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isSuperAdmin ? (
                        officer.role !== 'superAdmin' ? (
                          <button
                            onClick={() => handleDeleteOfficer(officer.userId, officer.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Officer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Principal Admin
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">
                          Read-Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Officer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Onboard New Officer</h3>
                  <p className="text-xs text-slate-500">Enable OTP authentication and assign district</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone (10 digits)</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543299"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aadhaar (Last 4)</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4412"
                    value={formData.aadhaarLast4}
                    onChange={(e) => setFormData({ ...formData, aadhaarLast4: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Access Level</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="fieldOfficer">📍 Field Verification Officer</option>
                    <option value="stateOfficer">👮 State Agency Nodal Officer</option>
                    <option value="bankAdmin">🏦 Bank Branch Lead Admin</option>
                    <option value="superAdmin">👑 Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Jurisdiction</label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="State HQ">State HQ (All Districts)</option>
                    {Object.values(SAMPLE_DISTRICTS).map(d => (
                      <option key={d.districtName} value={d.districtName}>
                        {d.districtName}, {d.stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-govBlue-600 hover:bg-govBlue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm & Onboard Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
