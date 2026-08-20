import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, Lock, Globe, Shield, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { Language } from '../../i18n/translations';
import { requestOtp, verifyOtp } from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const setUser = useStore((s) => s.setUser);
  const t = useStore((s) => s.t);

  const [phone, setPhone] = useState('9812345670');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [role, setRole] = useState<'beneficiary' | 'fieldOfficer'>('beneficiary');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'bn', label: 'বাংলা' },
  ];

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const res = await requestOtp(phone, role);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setCooldown(30);
      setSuccessInfo(`OTP has been sent to +91 ${phone}. Please check your phone SMS.`);
      setOtp(''); // Strict empty state: user must type the code from their phone
    } else {
      setErrorMsg(res.error || res.message || 'Failed to send OTP.');
      if (res.cooldown) setCooldown(res.cooldown);
    }
  };

  const handleVerify = async () => {
    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code received on your phone.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const res = await verifyOtp(phone, otp, role);
    setLoading(false);

    if (res.success && res.user) {
      setUser(res.user);
      if (role === 'fieldOfficer') {
        router.replace('/(officer)');
      } else {
        router.replace('/(beneficiary)');
      }
    } else {
      setErrorMsg(res.error || 'Invalid OTP code. Please check your SMS and retry.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
          <Text style={styles.appTitle}>{t('appTitle')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>

        {/* Language Selection Grid */}
        <View style={styles.languageCard}>
          <View style={styles.langHeader}>
            <Globe size={14} color="#1A56DB" />
            <Text style={styles.langTitle}>Select Language / भाषा चुनें</Text>
          </View>
          <View style={styles.langGrid}>
            {languages.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[styles.langChip, language === l.code && styles.langChipActive]}
                onPress={() => setLanguage(l.code)}
              >
                <Text style={[styles.langChipText, language === l.code && styles.langChipTextActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Role Toggle Selector */}
        <View style={styles.roleToggleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'beneficiary' && styles.roleBtnActive]}
            onPress={() => {
              setRole('beneficiary');
              setOtpSent(false);
              setErrorMsg(null);
              setSuccessInfo(null);
            }}
          >
            <Text style={[styles.roleBtnText, role === 'beneficiary' && styles.roleBtnTextActive]}>
              👤 Beneficiary (Farmer / Applicant)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'fieldOfficer' && styles.roleBtnActive]}
            onPress={() => {
              setRole('fieldOfficer');
              setOtpSent(false);
              setErrorMsg(null);
              setSuccessInfo(null);
            }}
          >
            <Text style={[styles.roleBtnText, role === 'fieldOfficer' && styles.roleBtnTextActive]}>
              📍 Field Officer (Spot Auditor)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form Box */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {role === 'beneficiary' ? 'Beneficiary OTP Login' : 'Field Officer OTP Login'}
          </Text>

          {successInfo && (
            <View style={styles.successBox}>
              <CheckCircle2 size={14} color="#057A55" />
              <Text style={styles.successText}>{successInfo}</Text>
            </View>
          )}

          {errorMsg && (
            <View style={styles.errorBox}>
              <AlertCircle size={14} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder={t('phonePlaceholder')}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  setErrorMsg(null);
                }}
                maxLength={10}
                editable={!otpSent}
              />
            </View>
          </View>

          {otpSent && (
            <View style={styles.inputGroup}>
              <View style={styles.otpHeaderRow}>
                <Text style={styles.inputLabel}>{t('enterOtp')}</Text>
                {cooldown > 0 ? (
                  <Text style={styles.cooldownText}>Resend in {cooldown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={16} color="#64748B" style={{ marginLeft: 12 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code received on SMS"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    setErrorMsg(null);
                  }}
                  maxLength={6}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={otpSent ? handleVerify : handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>
                  {otpSent ? t('verifyOtp') : t('sendOtp')}
                </Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={styles.securityFooter}>
          <Shield size={14} color="#057A55" />
          <Text style={styles.securityText}>
            Secured by Real-Time Cryptographic OTP Engine
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1A56DB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  logoEmoji: {
    fontSize: 26
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 8,
    letterSpacing: -0.5
  },
  tagline: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2
  },
  languageCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14
  },
  langHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  langTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  langChipActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB'
  },
  langChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  langChipTextActive: {
    color: '#FFFFFF'
  },
  roleToggleContainer: {
    gap: 6,
    marginBottom: 14
  },
  roleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  roleBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6'
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  roleBtnTextActive: {
    color: '#1A56DB',
    fontWeight: '800'
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 8,
    borderRadius: 8
  },
  successText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 8,
    borderRadius: 8
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '600'
  },
  inputGroup: {
    gap: 4
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cooldownText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  resendLink: {
    fontSize: 10,
    color: '#1A56DB',
    fontWeight: '800'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC'
  },
  countryCode: {
    paddingLeft: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B'
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A'
  },
  submitBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16
  },
  securityText: {
    fontSize: 10,
    color: '#057A55',
    fontWeight: '600'
  }
});
