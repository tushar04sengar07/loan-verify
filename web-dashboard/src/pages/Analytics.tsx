import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  WifiOff, 
  UserCheck 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { dataService } from '../services/dataService';
import { Submission, Loan } from '../../../shared/types';

export const Analytics: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    setSubmissions(dataService.getSubmissions());
    setLoans(dataService.getLoans());
  }, []);

  const totalLoans = loans.length;
  const totalSubmissions = submissions.length;
  const approvedCount = submissions.filter(s => s.status === 'approved' || s.status === 'ai_passed').length;
  const flaggedCount = submissions.filter(s => s.status === 'ai_flagged' || s.status === 'rejected').length;

  const coveragePercent = totalLoans > 0 ? Math.round((totalSubmissions / totalLoans) * 100) : 0;
  const aiPassRate = totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 0;
  const fraudInterventionRate = totalSubmissions > 0 ? Math.round((flaggedCount / totalSubmissions) * 100) : 0;

  // Monthly trend data
  const velocityData = [
    { month: 'Apr', avgDays: 14.2, passRate: 88, submissions: 12 },
    { month: 'May', avgDays: 11.5, passRate: 91, submissions: 18 },
    { month: 'Jun', avgDays: 9.8, passRate: 94, submissions: 25 },
    { month: 'Jul', avgDays: 8.2, passRate: 92, submissions: 34 },
    { month: 'Aug', avgDays: 6.5, passRate: 95, submissions: 42 },
  ];

  const officerWorkloadData = [
    { officer: 'Anjali D. (Pune)', reviews: 28, spotAudits: 6 },
    { officer: 'Vikram S. (Varanasi)', reviews: 22, spotAudits: 9 },
    { officer: 'Karthik N. (Coimbatore)', reviews: 31, spotAudits: 4 },
    { officer: 'Sunil M. (Jaipur)', reviews: 19, spotAudits: 8 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            System Intelligence & Metrics
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Verification Velocity & Operations Analytics
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          End-to-end monitoring of scheme compliance velocity, AI model performance, and field officer workload
        </p>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Disbursement Velocity</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">6.5 Days</div>
          <div className="text-[11px] text-emerald-600 font-medium">↓ 54% faster turnaround</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Verification Coverage</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{coveragePercent}%</div>
          <div className="text-[11px] text-slate-500">{totalSubmissions} of {totalLoans} loans tracked</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>AI Auto-Pass Rate</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{aiPassRate}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">Score ≥ 80 threshold</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Fraud Catch Rate</span>
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600">{fraudInterventionRate}%</div>
          <div className="text-[11px] text-slate-500">{flaggedCount} cases flagged early</div>
        </div>
      </div>

      {/* Velocity Trend & Pass Rate Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Turnaround Time Velocity (Days from Sanction)</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="avgDays" name="Avg Turnaround Days" stroke="#2563EB" fillOpacity={1} fill="url(#velocityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Officer Productivity & Spot Audits</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officerWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="officer" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviews" name="Desk Reviews" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spotAudits" name="Physical Spot Audits" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
