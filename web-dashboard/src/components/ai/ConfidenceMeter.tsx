import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { AIValidationResult } from '../../../../shared/types';

interface ConfidenceMeterProps {
  result?: AIValidationResult;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  result,
  size = 'md',
  showBreakdown = true
}) => {
  const score = result?.anomalyScore ?? 0;
  
  // Color determination
  let colorClass = 'text-emerald-600 bg-emerald-500';
  let badgeText = 'LOW RISK (AI PASSED)';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = ShieldCheck;

  if (score < 50) {
    colorClass = 'text-red-600 bg-red-500';
    badgeText = 'CRITICAL ANOMALY (FLAGGED)';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
    Icon = ShieldAlert;
  } else if (score < 80) {
    colorClass = 'text-amber-600 bg-amber-500';
    badgeText = 'MODERATE RISK (MANUAL REVIEW)';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">AI Anomaly Risk Assessment</h4>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center space-x-1.5 ${badgeBg}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Animated Vertical Gauge */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-36 bg-slate-100 rounded-full p-1 flex flex-col justify-end border border-slate-200 relative overflow-hidden shadow-inner">
            {/* Tick marks */}
            <div className="absolute top-[20%] left-0 right-0 h-px bg-slate-300" />
            <div className="absolute top-[50%] left-0 right-0 h-px bg-slate-300" />
            <div className="absolute top-[80%] left-0 right-0 h-px bg-slate-300" />

            <div
              className={`w-full rounded-full transition-all duration-1000 ease-out ${
                score >= 80 ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' :
                score >= 50 ? 'bg-gradient-to-t from-amber-500 to-amber-400' :
                'bg-gradient-to-t from-red-600 to-red-400'
              }`}
              style={{ height: `${score}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-slate-500 mt-2">Score</span>
        </div>

        {/* Score Readout & Summary */}
        <div className="flex-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score}</span>
            <span className="text-sm font-semibold text-slate-400">/ 100</span>
          </div>

          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            {score >= 80 
              ? 'High authenticity score. Geo-location, perceptual hash uniqueness, and asset labels match verified scheme criteria.'
              : score < 50
                ? 'High risk anomaly detected. Identified potential metadata drift, duplicate image reuse, or category mismatch.'
                : 'Moderate risk rating. Passed standard checks but requires officer scrutiny.'}
          </p>

          {/* Breakdown Pills */}
          {showBreakdown && result?.breakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">GPS Integrity</div>
                <div className="text-xs font-bold text-slate-800">{result.breakdown.gpsScore}/20 pts</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Timestamp Freshness</div>
                <div className="text-xs font-bold text-slate-800">{result.breakdown.timestampScore}/15 pts</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Image Uniqueness</div>
                <div className="text-xs font-bold text-slate-800">{result.breakdown.uniquenessScore}/25 pts</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Asset Recognition</div>
                <div className="text-xs font-bold text-slate-800">{result.breakdown.assetScore}/30 pts</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">District Plausibility</div>
                <div className="text-xs font-bold text-slate-800">{result.breakdown.districtScore}/10 pts</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
