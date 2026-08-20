import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { dataService } from './services/dataService';
import { UserRole } from '../../shared/types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Submissions } from './pages/Submissions';
import { SubmissionDetail } from './pages/SubmissionDetail';
import { Beneficiaries } from './pages/Beneficiaries';
import { FraudMonitor } from './pages/FraudMonitor';
import { Analytics } from './pages/Analytics';
import { SchemeRules } from './pages/SchemeRules';
import { OfficerManagement } from './pages/OfficerManagement';
import { Login } from './pages/Login';

export function App() {
  const [currentUser, setCurrentUser] = useState(dataService.getCurrentUser());
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [submissions, setSubmissions] = useState(dataService.getSubmissions());

  useEffect(() => {
    const handleStorage = () => {
      setCurrentUser(dataService.getCurrentUser());
      setSubmissions(dataService.getSubmissions());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    const matched = dataService.getUsers().find(u => u.role === newRole) || {
      ...currentUser,
      role: newRole
    };
    dataService.setCurrentUser(matched);
    setCurrentUser(matched);
  };

  const pendingCount = submissions.filter(s => s.status === 'ai_passed' || s.status === 'officer_review').length;
  const fraudCount = submissions.filter(s => (s.aiValidationResult?.anomalyScore || 0) < 50 || s.status === 'ai_flagged').length;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/*"
          element={
            <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
              {/* Sidebar */}
              <Sidebar
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                onRoleChange={handleRoleChange}
                pendingCount={pendingCount}
                fraudCount={fraudCount}
              />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <Header
                  selectedDistrict={selectedDistrict}
                  onDistrictChange={setSelectedDistrict}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                <main className="flex-1 pb-12">
                  <Routes>
                    <Route
                      path="/"
                      element={<Submissions selectedDistrict={selectedDistrict} searchTerm={searchTerm} />}
                    />
                    <Route path="/submission/:id" element={<SubmissionDetail />} />
                    <Route
                      path="/beneficiaries"
                      element={<Beneficiaries selectedDistrict={selectedDistrict} searchTerm={searchTerm} />}
                    />
                    <Route path="/fraud" element={<FraudMonitor />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/schemes" element={<SchemeRules />} />
                    <Route
                      path="/officers"
                      element={
                        <OfficerManagement 
                          selectedDistrict={selectedDistrict} 
                          searchTerm={searchTerm} 
                          currentUserRole={currentUser.role} 
                        />
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
