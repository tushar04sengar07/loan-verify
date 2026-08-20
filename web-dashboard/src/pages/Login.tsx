import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { dataService } from '../services/dataService';
import { requestOtp, verifyOtp } from '../services/authService';
import { UserRole } from '../../../shared/types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('stateOfficer');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const users = dataService.getUsers();

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const res = await requestOtp(phone, selectedRole);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCooldown(30);
      setSuccessInfo(`OTP sent to +91 ${phone}. Please check your phone SMS.`);
      setOtp(''); // Strict empty state
    } else {
      setErrorMsg(res.error || res.message || 'Failed to send OTP.');
      if (res.cooldown) setCooldown(res.cooldown);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code received on your phone.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const res = await verifyOtp(phone, otp, selectedRole);
    setLoading(false);

    if (res.success) {
      const matchedUser = users.find(u => u.role === selectedRole) || users[0];
      dataService.setCurrentUser(matchedUser);
      navigate('/');
    } else {
      setErrorMsg(res.error || 'Invalid OTP code. Please check your SMS and retry.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const matchedUser = users.find(u => u.role === role) || users[0];
    dataService.setCurrentUser(matchedUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background geometric accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-govBlue-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/20">
            🏛️
          </div>
        </div>
        <h2 className="text-center text-2xl font-black text-white tracking-tight">
          LoanVerify Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Field Verification & Loan Utilization Monitoring System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 border border-slate-700 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {/* Quick Persona Demo Selector */}
          <div className="mb-6 pb-6 border-b border-slate-700">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Quick One-Click Demo Personas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('stateOfficer')}
                className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold text-left transition-all"
              >
                👮 State Officer
                <span className="block text-[10px] text-slate-400 font-normal">Review & Approvals</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bankAdmin')}
                className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold text-left transition-all"
              >
                🏦 Bank Admin
                <span className="block text-[10px] text-slate-400 font-normal">CSV Onboarding</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('fieldOfficer')}
                className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold text-left transition-all"
              >
                📍 Field Officer
                <span className="block text-[10px] text-slate-400 font-normal">Spot Audit Mode</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('superAdmin')}
                className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold text-left transition-all"
              >
                👑 Super Admin
                <span className="block text-[10px] text-slate-400 font-normal">System Oversight</span>
              </button>
            </div>
          </div>

          {/* Regular Phone OTP Auth Form */}
          <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
            {successInfo && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-2.5 flex items-center space-x-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successInfo}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-950/60 border border-red-500/40 rounded-lg p-2.5 flex items-center space-x-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Your Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="stateOfficer">State Agency Officer (Approval Console)</option>
                <option value="bankAdmin">Bank Administrator (Beneficiary Entry)</option>
                <option value="fieldOfficer">Field Verification Officer</option>
                <option value="superAdmin">Super Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Registered Mobile (SMS OTP)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrorMsg(null);
                    setSuccessInfo(null);
                  }}
                  disabled={otpSent}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Enter 6-digit OTP received via SMS
                  </label>
                  {cooldown > 0 ? (
                    <span className="text-[10px] text-slate-400 font-mono">Resend in {cooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code received on SMS"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-govBlue-600 hover:bg-govBlue-700 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{otpSent ? 'Verify OTP & Enter Portal' : 'Send Verification OTP'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
