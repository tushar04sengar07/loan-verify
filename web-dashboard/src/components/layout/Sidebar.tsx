import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  CheckCircle2, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Sliders, 
  Building2, 
  UserCheck, 
  LogOut,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { UserRole } from '../../../../shared/types';

interface SidebarProps {
  currentUserRole: UserRole;
  currentUserName: string;
  onRoleChange: (role: UserRole) => void;
  pendingCount: number;
  fraudCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUserRole,
  currentUserName,
  onRoleChange,
  pendingCount,
  fraudCount
}) => {
  const users = dataService.getUsers();

  const handleResetData = () => {
    if (window.confirm('Reset all demo submissions and loans back to initial sample state?')) {
      dataService.resetAllData();
      window.location.reload();
    }
  };

  return (
    <aside className="w-64 bg-sidebarDark text-slate-200 flex flex-col h-screen sticky top-0 shadow-xl border-r border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-govBlue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
            🏛️
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-lg leading-tight">LoanVerify</h1>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block">
              Gov Field Tracking
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Verification Workflows
        </div>

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-govBlue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`
          }
        >
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>Review Console</span>
          </div>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {pendingCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/fraud"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`
          }
        >
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Fraud & Anomaly</span>
          </div>
          {fraudCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-400/30">
              {fraudCount}
            </span>
          )}
        </NavLink>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Scheme & Onboarding
        </div>

        <NavLink
          to="/beneficiaries"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-govBlue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`
          }
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Beneficiaries & Loans</span>
        </NavLink>

        <NavLink
          to="/schemes"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-govBlue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`
          }
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>Scheme Rule Engine</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-govBlue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`
          }
        >
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span>KPI Analytics</span>
        </NavLink>

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Super Admin Console
        </div>

        <NavLink
          to="/officers"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`
          }
        >
          <div className="flex items-center space-x-3">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Officers & Personnel</span>
          </div>
          {currentUserRole === 'superAdmin' ? (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
              👑 Admin
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-slate-800 text-slate-400 border border-slate-700">
              🔒 Read-Only
            </span>
          )}
        </NavLink>
      </nav>

      {/* Persona Switcher Box (for fast demoing) */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Demo Persona Switcher
        </div>
        <select
          value={currentUserRole}
          onChange={(e) => onRoleChange(e.target.value as UserRole)}
          className="w-full bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="stateOfficer">👮 State Officer (Reviewer)</option>
          <option value="bankAdmin">🏦 Bank Admin (Onboarder)</option>
          <option value="fieldOfficer">📍 Field Officer (Auditor)</option>
          <option value="superAdmin">👑 Super Admin</option>
        </select>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-300 border border-slate-600">
            {currentUserName.substring(0, 2).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{currentUserName}</div>
            <div className="text-[10px] text-slate-400 capitalize">{currentUserRole}</div>
          </div>
        </div>
        <button
          onClick={handleResetData}
          title="Reset Sample Data"
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
