import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Camera, 
  MessageSquare,
  Building2,
  LogOut
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { OfflineSyncBar } from '../../components/OfflineSyncBar';

export default function BeneficiaryDashboard() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const loans = useStore((s) => s.loans);
  const submissions = useStore((s) => s.submissions);
  const t = useStore((s) => s.t);
  const setUser = useStore((s) => s.setUser);

  const activeLoan = loans[0];
  const recentSubmission = submissions[0];

  const handleStartVerification = () => {
    router.push('/(beneficiary)/submit/gps');
  };

  const handleLogout = () => {
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Offline Sync Banner */}
      <OfflineSyncBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top User Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greetingText}>Welcome, Namaste 🙏</Text>
            <Text style={styles.userNameText}>{user?.name || 'Beneficiary'}</Text>
            <Text style={styles.userSubText}>{user?.district}, {user?.state} • Phone: {user?.phone}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Active Loan Scheme Card */}
        {activeLoan && (
          <View style={styles.loanCard}>
            <View style={styles.loanBadgeRow}>
              <View style={styles.schemeTag}>
                <Text style={styles.schemeTagText}>{activeLoan.assetCategory}</Text>
              </View>
              <View style={[styles.statusPill, activeLoan.status === 'approved' ? styles.statusPillApproved : styles.statusPillPending]}>
                <Text style={[styles.statusPillText, activeLoan.status === 'approved' ? styles.statusTextApproved : styles.statusTextPending]}>
                  {activeLoan.status.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
            </View>

            <Text style={styles.loanSchemeName}>{activeLoan.schemeName}</Text>
            
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Sanctioned Subsidy / Loan Amount</Text>
              <Text style={styles.amountValue}>₹{activeLoan.loanAmount.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.loanDetailsGrid}>
              <View style={styles.detailItem}>
                <Building2 size={13} color="#64748B" />
                <Text style={styles.detailText}>{activeLoan.bankName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Calendar size={13} color="#64748B" />
                <Text style={styles.detailText}>Due: {activeLoan.verificationDeadline}</Text>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.verifyActionBtn}
              onPress={handleStartVerification}
            >
              <Camera size={18} color="#FFFFFF" />
              <Text style={styles.verifyActionText}>{t('submitProof')}</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Submission Lifecycle Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardSectionTitle}>Verification Lifecycle Progress</Text>
          
          <View style={styles.timelineList}>
            {/* Stage 1: Submitted */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconDone]}>
                <CheckCircle2 size={14} color="#FFFFFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>1. Proof Submitted (Geo-Tagged)</Text>
                <Text style={styles.timelineSub}>
                  {recentSubmission ? `Uploaded on ${new Date(recentSubmission.submittedAt).toLocaleDateString()}` : 'Pending Submission'}
                </Text>
              </View>
            </View>

            {/* Stage 2: AI Pre-Check */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, recentSubmission?.aiValidationResult ? styles.timelineIconDone : styles.timelineIconInactive]}>
                <ShieldCheck size={14} color="#FFFFFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>2. Automated AI Authenticity Check</Text>
                <Text style={styles.timelineSub}>
                  {recentSubmission?.aiValidationResult
                    ? `AI Score: ${recentSubmission.aiValidationResult.anomalyScore}/100 (${recentSubmission.aiValidationResult.assetMatch ? 'Asset Matched' : 'Review Required'})`
                    : 'Awaiting submission upload'}
                </Text>
              </View>
            </View>

            {/* Stage 3: Officer Review */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, recentSubmission?.status === 'approved' ? styles.timelineIconDone : styles.timelineIconInactive]}>
                <FileText size={14} color="#FFFFFF" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>3. State Agency Officer Review</Text>
                <Text style={styles.timelineSub}>
                  {recentSubmission?.officerDecision
                    ? `Decision: ${recentSubmission.officerDecision.toUpperCase()}`
                    : 'Queued in district review console'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Quick Links */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navCard}
            onPress={() => router.push('/(beneficiary)/submissions')}
          >
            <FileText size={18} color="#1A56DB" />
            <Text style={styles.navCardTitle}>Past Submissions</Text>
            <Text style={styles.navCardSub}>{submissions.length} Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => router.push('/(beneficiary)/notifications')}
          >
            <MessageSquare size={18} color="#9333EA" />
            <Text style={styles.navCardTitle}>Officer Queries</Text>
            <Text style={styles.navCardSub}>Help & Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16,
    gap: 16
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  greetingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2
  },
  userSubText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginTop: 1
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#E2E8F0'
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    gap: 12
  },
  loanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  schemeTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  schemeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A56DB'
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1
  },
  statusPillPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  statusPillApproved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800'
  },
  statusTextPending: {
    color: '#92400E'
  },
  statusTextApproved: {
    color: '#166534'
  },
  loanSchemeName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#057A55',
    marginTop: 2
  },
  loanDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  detailText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600'
  },
  verifyActionBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  verifyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  timelineList: {
    gap: 12
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  timelineIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1
  },
  timelineIconDone: {
    backgroundColor: '#057A55'
  },
  timelineIconInactive: {
    backgroundColor: '#94A3B8'
  },
  timelineContent: {
    flex: 1
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B'
  },
  timelineSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1
  },
  navRow: {
    flexDirection: 'row',
    gap: 12
  },
  navCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4
  },
  navCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4
  },
  navCardSub: {
    fontSize: 11,
    color: '#64748B'
  }
});
