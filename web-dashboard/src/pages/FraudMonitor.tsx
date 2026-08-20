import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  TrendingUp, 
  FileWarning, 
  Eye, 
  Activity,
  Layers
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { dataService } from '../services/dataService';
import { Submission } from '../../../shared/types';
import { aggregateDistrictFraudStats, DistrictFraudStat } from '../../../shared/fraudUtils';

const COLORS = ['#DC2626', '#EA580C', '#D97706', '#9333EA', '#2563EB'];

export const FraudMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    setSubmissions(dataService.getSubmissions());
  }, []);

  // Top high anomaly submissions (fraud leaderboard)
  const flaggedSubmissions = submissions
    .filter(s => (s.aiValidationResult?.anomalyScore || 0) < 60 || s.status === 'ai_flagged')
    .sort((a, b) => (a.aiValidationResult?.anomalyScore || 0) - (b.aiValidationResult?.anomalyScore || 0));

  // Compute fraud category breakdown
  const fraudTypeCounts: Record<string, number> = {
    'GPS Drift / Out of Boundary': 0,
    'Recycled Photo / Duplicate Hash': 0,
    'Asset Category Mismatch': 0,
    'Metadata / Freshness Tampered': 0,
    'Human Presence Missing': 0
  };

  submissions.forEach(s => {
    s.aiValidationResult?.flags?.forEach(f => {
      if (f.includes('GPS') || f.includes('LOCATION') || f.includes('DISTRICT')) {
        fraudTypeCounts['GPS Drift / Out of Boundary']++;
      } else if (f.includes('DUPLICATE') || f.includes('RECYCLED')) {
        fraudTypeCounts['Recycled Photo / Duplicate Hash']++;
      } else if (f.includes('ASSET') || f.includes('MISMATCH')) {
        fraudTypeCounts['Asset Category Mismatch']++;
      } else if (f.includes('HUMAN')) {
        fraudTypeCounts['Human Presence Missing']++;
      } else {
        fraudTypeCounts['Metadata / Freshness Tampered']++;
      }
    });
  });

  const pieData = Object.entries(fraudTypeCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // District-level aggregation
  const districtStats = aggregateDistrictFraudStats(
    submissions.map(s => ({
      district: s.district,
      status: s.status,
      aiValidationResult: s.aiValidationResult
    }))
  );

  const barData = Object.values(districtStats).map((d: DistrictFraudStat) => ({
    district: d.district,
    'Verified Pass': d.approvedCount,
    'Flagged Anomalies': d.flaggedCount,
    rate: `${d.fraudRate}%`
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 to-slate-900 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              Live Anomaly Detection Engine
            </span>
            <h2 className="text-xl font-black tracking-tight">
              Fraud & Risk Intelligence Monitor
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time geospatial drift detection, perceptual hash collisions, and multi-scheme risk heatmaps
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block font-semibold uppercase">Total Flagged</span>
            <span className="text-xl font-extrabold text-red-400">{flaggedSubmissions.length}</span>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[10px] block font-semibold uppercase">Avg Risk Score</span>
            <span className="text-xl font-extrabold text-amber-400">
              {flaggedSubmissions.length > 0
                ? Math.round(flaggedSubmissions.reduce((acc, s) => acc + (100 - (s.aiValidationResult?.anomalyScore || 0)), 0) / flaggedSubmissions.length)
                : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fraud Type Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <FileWarning className="w-4 h-4 text-red-600" />
            <span>Fraud & Anomaly Categorization</span>
          </h4>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No anomaly flags recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* District Risk Concentration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>District Anomaly Comparison</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Verified Pass" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Flagged Anomalies" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fraud Anomaly Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>High-Risk Anomaly Leaderboard (Immediate Action Required)</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Beneficiary</th>
                <th className="py-2.5 px-3">Scheme</th>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3 text-center">AI Authenticity</th>
                <th className="py-2.5 px-3">Identified Risk Flags</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {flaggedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active flagged submissions detected. All submissions within safe parameters.
                  </td>
                </tr>
              ) : (
                flaggedSubmissions.map((sub) => {
                  const score = sub.aiValidationResult?.anomalyScore || 0;
                  return (
                    <tr key={sub.submissionId} className="hover:bg-red-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{sub.beneficiaryName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sub.loanId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{sub.assetCategory}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {sub.district}, {sub.state}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                          {score}/100
                        </span>
                      </td>
                      <td className="py-3 px-3 text-red-600 font-semibold">
                        {(sub.aiValidationResult?.flags || []).join(' • ') || 'Manual review required'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/submission/${sub.submissionId}`)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
