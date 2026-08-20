import React, { useState } from 'react';
import { Camera, MapPin, Clock, Eye, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { MediaFile, FieldAuditRecord } from '../../../../shared/types';

interface SideBySideReviewProps {
  beneficiaryMedia: MediaFile[];
  fieldAudit?: FieldAuditRecord;
  assetCategory: string;
}

export const SideBySideReview: React.FC<SideBySideReviewProps> = ({
  beneficiaryMedia,
  fieldAudit,
  assetCategory
}) => {
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);
  const activeMedia = beneficiaryMedia[selectedAngleIndex] || beneficiaryMedia[0];
  const auditPhoto = fieldAudit?.auditPhotos?.[selectedAngleIndex] || fieldAudit?.auditPhotos?.[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Visual Proof & Field Audit Verification
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect beneficiary captured geo-media alongside officer on-site audit
          </p>
        </div>

        {/* Angle Filter Chips */}
        <div className="flex items-center space-x-1.5">
          {beneficiaryMedia.map((m, idx) => (
            <button
              key={m.id || idx}
              onClick={() => setSelectedAngleIndex(idx)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedAngleIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.angle || `Photo #${idx + 1}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Beneficiary Captured Proof */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
          <div className="px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Beneficiary Submission</span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 capitalize">
              Angle: {activeMedia?.angle || 'Front'}
            </span>
          </div>

          <div className="relative aspect-video bg-black/90 flex items-center justify-center overflow-hidden group">
            {activeMedia?.url ? (
              <img
                src={activeMedia.url}
                alt="Beneficiary Asset Proof"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-xs">No image available</div>
            )}
            
            {/* Geo-tag overlay badge on image */}
            <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-md text-[10px] space-y-0.5">
              <div className="flex items-center space-x-1 font-mono">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{activeMedia?.gpsLat?.toFixed(4)}, {activeMedia?.gpsLng?.toFixed(4)}</span>
                <span className="text-slate-400">(±{activeMedia?.gpsAccuracy || 8}m)</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-300">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{activeMedia?.timestamp ? new Date(activeMedia.timestamp).toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* EXIF Details strip */}
          <div className="p-3 bg-white text-xs border-t border-slate-200 space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Device / Camera:</span>
              <span className="font-medium text-slate-800">{activeMedia?.exifData?.make || 'Samsung'} {activeMedia?.exifData?.model || 'SM-A536E'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Perceptual Hash:</span>
              <span className="font-mono text-[10px] text-slate-700">{activeMedia?.hash?.substring(0, 16) || 'a8f4c9103e28...'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Field Officer Spot Audit */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
          <div className="px-3.5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">Field Officer Spot Audit</span>
            </div>
            {fieldAudit ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 uppercase">
                {fieldAudit.outcome}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 italic">Audit Pending</span>
            )}
          </div>

          <div className="relative aspect-video bg-black/90 flex items-center justify-center overflow-hidden">
            {auditPhoto?.url ? (
              <img
                src={auditPhoto.url}
                alt="Field Officer Audit Photo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-slate-400 font-medium">No physical spot audit conducted yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the action below to dispatch a Field Officer.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-white text-xs border-t border-slate-200 space-y-1">
            {fieldAudit ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Auditor:</span>
                  <span className="font-medium text-slate-800">{fieldAudit.officerName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Visit Date:</span>
                  <span className="text-slate-800">{new Date(fieldAudit.visitedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-slate-600 pt-1 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Audit Notes: </span>
                  {fieldAudit.notes}
                </div>
              </>
            ) : (
              <div className="text-slate-500 italic text-[11px] py-1">
                Standard remote AI evaluation mode. Spot audit is optional for high confidence submissions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
