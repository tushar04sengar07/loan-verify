import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  Save, 
  RotateCcw,
  Layers,
  Cpu
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { SchemeRule } from '../../../shared/types';
import { DEFAULT_SCHEMES } from '../../../shared/defaultSchemes';

export const SchemeRules: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeRule[]>([]);
  const [editingScheme, setEditingScheme] = useState<SchemeRule | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const reloadSchemes = () => {
    setSchemes(dataService.getSchemes());
  };

  useEffect(() => {
    reloadSchemes();
  }, []);

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingScheme({
      schemeId: `scheme_${Date.now()}`,
      schemeName: '',
      assetCategory: '',
      description: '',
      icon: 'shield',
      minPhotos: 3,
      requiredAngles: ['front', 'side', 'tag'],
      requireVideo: false,
      requireHumanPresence: false,
      requireInvoice: true,
      requireQrTag: false,
      targetLabels: ['equipment', 'asset'],
      silhouetteType: 'general',
      minAiConfidence: 0.75,
      autoApprovalScoreThreshold: 85,
      flagThreshold: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;

    dataService.saveScheme(editingScheme);
    setEditingScheme(null);
    setIsCreating(false);
    reloadSchemes();
    setToastMessage(`Scheme rule "${editingScheme.schemeName}" successfully saved!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteScheme = (schemeId: string) => {
    if (window.confirm('Are you sure you want to delete this scheme validation rule?')) {
      dataService.deleteScheme(schemeId);
      reloadSchemes();
      setToastMessage('Scheme rule removed.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleLoadDefaults = () => {
    DEFAULT_SCHEMES.forEach(s => dataService.saveScheme(s));
    reloadSchemes();
    setToastMessage('Standard reference scheme templates loaded!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Configurable AI Rule Engine
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Scheme Rules & Vision Label Mappings
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamically adjust AI recognition targets, required silhouette guides, and risk thresholds per scheme
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleLoadDefaults}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Standard Templates</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-govBlue-600 hover:bg-govBlue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Scheme Rule</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Schemes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((s) => (
          <div key={s.schemeId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {s.silhouetteType === 'animal' ? '🐄' :
                     s.silhouetteType === 'tractor' ? '🚜' :
                     s.silhouetteType === 'machine' ? '🧵' :
                     s.silhouetteType === 'solar' ? '☀️' : '📦'}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.assetCategory}</h3>
                    <div className="text-[11px] text-slate-500">{s.schemeName}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => { setEditingScheme(s); setIsCreating(false); }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteScheme(s.schemeId)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>

            {/* Target Vision Labels */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Google Vision API Labels:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.targetLabels.map((lbl, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-md border border-blue-200 font-mono">
                    {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Rule Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-slate-400 text-[10px]">Min Photos</div>
                <div className="font-bold text-slate-800">{s.minPhotos} photos ({s.requiredAngles.join(', ')})</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-slate-400 text-[10px]">Silhouette Guide</div>
                <div className="font-bold text-slate-800 capitalize">{s.silhouetteType} Overlay</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <div className="text-slate-400 text-[10px]">Auto-Pass Score</div>
                <div className="font-bold text-emerald-700">≥ {s.autoApprovalScoreThreshold}/100</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {editingScheme && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">
              {isCreating ? 'Create Dynamic Scheme Rule' : `Edit Scheme Rule: ${editingScheme.assetCategory}`}
            </h3>

            <form onSubmit={handleSaveScheme} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheme Official Name</label>
                <input
                  type="text"
                  required
                  value={editingScheme.schemeName}
                  onChange={(e) => setEditingScheme({ ...editingScheme, schemeName: e.target.value })}
                  placeholder="e.g. National Livestock Mission (Dairy Cattle Scheme)"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asset Category</label>
                  <input
                    type="text"
                    required
                    value={editingScheme.assetCategory}
                    onChange={(e) => setEditingScheme({ ...editingScheme, assetCategory: e.target.value })}
                    placeholder="e.g. Milch Animal"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Camera Silhouette Overlay</label>
                  <select
                    value={editingScheme.silhouetteType}
                    onChange={(e) => setEditingScheme({ ...editingScheme, silhouetteType: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="animal">Animal / Livestock Outline</option>
                    <option value="tractor">Tractor / Vehicle Outline</option>
                    <option value="machine">Machine / Tool Outline</option>
                    <option value="solar">Solar Panel & Pump Outline</option>
                    <option value="general">General Asset Frame</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Vision API Label Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={editingScheme.targetLabels.join(', ')}
                  onChange={(e) => setEditingScheme({
                    ...editingScheme,
                    targetLabels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g. cow, cattle, bovine, livestock, mammal"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Photos</label>
                  <input
                    type="number"
                    value={editingScheme.minPhotos}
                    onChange={(e) => setEditingScheme({ ...editingScheme, minPhotos: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Auto-Pass Score</label>
                  <input
                    type="number"
                    value={editingScheme.autoApprovalScoreThreshold}
                    onChange={(e) => setEditingScheme({ ...editingScheme, autoApprovalScoreThreshold: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flag Threshold</label>
                  <input
                    type="number"
                    value={editingScheme.flagThreshold}
                    onChange={(e) => setEditingScheme({ ...editingScheme, flagThreshold: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-red-700"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingScheme.requireHumanPresence}
                    onChange={(e) => setEditingScheme({ ...editingScheme, requireHumanPresence: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Require Farmer / Human Presence alongside asset</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingScheme.requireQrTag}
                    onChange={(e) => setEditingScheme({ ...editingScheme, requireQrTag: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">Require Physical QR / Ear Tag scan</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingScheme(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-govBlue-600 hover:bg-govBlue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Scheme Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
