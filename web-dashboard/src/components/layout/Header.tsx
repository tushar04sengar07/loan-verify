import React from 'react';
import { 
  FileDown, 
  MapPin, 
  Search, 
  Bell, 
  FileSpreadsheet,
  DownloadCloud
} from 'lucide-react';
import { exportComplianceReportPDF, exportSubmissionsToCSV } from '../../services/exportService';
import { dataService } from '../../services/dataService';

interface HeaderProps {
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDistrict,
  onDistrictChange,
  searchTerm,
  onSearchChange
}) => {
  const handleExportPDF = () => {
    const subs = dataService.getSubmissions();
    const loans = dataService.getLoans();
    exportComplianceReportPDF(subs, loans);
  };

  const handleExportCSV = () => {
    const subs = dataService.getSubmissions();
    exportSubmissionsToCSV(subs);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Search & District Filter */}
      <div className="flex items-center space-x-4 flex-1 max-w-2xl">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Beneficiary, Loan ID, or Asset Tag..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
          >
            <option value="ALL">All Districts (National)</option>
            <option value="Pune">Pune, Maharashtra</option>
            <option value="Varanasi">Varanasi, Uttar Pradesh</option>
            <option value="Jaipur">Jaipur, Rajasthan</option>
            <option value="Coimbatore">Coimbatore, Tamil Nadu</option>
            <option value="Patna">Patna, Bihar</option>
            <option value="Ludhiana">Ludhiana, Punjab</option>
            <option value="Ahmedabad">Ahmedabad, Gujarat</option>
            <option value="Bengaluru Rural">Bengaluru Rural, Karnataka</option>
            <option value="Kamrup">Kamrup, Assam</option>
            <option value="Indore">Indore, Madhya Pradesh</option>
            <option value="Ernakulam">Ernakulam, Kerala</option>
            <option value="Khordha">Khordha, Odisha</option>
          </select>
        </div>
      </div>

      {/* Quick Export Actions & Notification Bell */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
          title="Export CSV Table"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={handleExportPDF}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-govBlue-600 hover:bg-govBlue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/10 transition-colors"
          title="Download PDF Compliance Report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>PDF Report</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
};
