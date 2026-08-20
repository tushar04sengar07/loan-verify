import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ShieldCheck, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ChevronDown,
  RefreshCw,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { OfflineSyncBar } from '../../components/OfflineSyncBar';
import { SAMPLE_DISTRICTS } from '../../shared/sampleDistricts';
import { Submission, Loan } from '../../shared/types';

export default function OfficerInboxScreen() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const submissions = useStore((s) => s.submissions);
  const setSubmissions = useStore((s) => s.setSubmissions);
  const setUserDistrict = useStore((s) => s.setUserDistrict);
  const setUser = useStore((s) => s.setUser);

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [districtLoans, setDistrictLoans] = useState<Loan[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeDistrict = user?.district || 'Pune';

  const fetchLiveSubmissions = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch Submissions
      const subResp = await fetch('http://localhost:5000/api/submissions');
      const subData = await subResp.json();
      if (subData.success && Array.isArray(subData.submissions)) {
        setSubmissions(subData.submissions);
      }

      // 2. Fetch Loans
      const loanResp = await fetch('http://localhost:5000/api/loans');
      const loanData = await loanResp.json();
      if (loanData.success && Array.isArray(loanData.loans)) {
        setDistrictLoans(loanData.loans);
      }
    } catch (e) {
      console.warn('Local server sync unavailable, using cached state:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveSubmissions();
    const interval = setInterval(fetchLiveSubmissions, 4000);
    return () => clearInterval(interval);
  }, [activeDistrict]);

  const handleLogout = () => {
    setUser(null);
    router.replace('/(auth)/login');
  };

  const handleStartAudit = (submissionId: string) => {
    router.push({
      pathname: '/(officer)/audit',
      params: { submissionId }
    });
  };

  const handleSelectDistrict = (districtName: string) => {
    setUserDistrict(districtName);
    setShowDistrictModal(false);
  };

  // Filter Submissions for Active District (matches district name or state e.g. Ludhiana / Punjab)
  const districtSubmissions = submissions.filter((s) => {
    const dMatch = s.district?.toLowerCase() === activeDistrict.toLowerCase();
    const sMatch = s.state?.toLowerCase() === activeDistrict.toLowerCase();
    const stateOfDistrict = SAMPLE_DISTRICTS[activeDistrict]?.stateName?.toLowerCase();
    const stateMatch = stateOfDistrict && s.state?.toLowerCase() === stateOfDistrict;
    return dMatch || sMatch || stateMatch;
  });

  // Pending vs Completed Audits
  const pendingSubmissions = districtSubmissions.filter(
    (s) => !s.fieldAudit && s.status !== 'approved' && s.status !== 'rejected'
  );

  const completedSubmissions = districtSubmissions.filter(
    (s) => s.fieldAudit !== undefined || s.status === 'approved' || s.status === 'rejected'
  );

  // Other Loans in District without submissions
  const pendingLoansInDistrict = districtLoans.filter((l) => {
    const dMatch = l.district?.toLowerCase() === activeDistrict.toLowerCase();
    const sMatch = l.state?.toLowerCase() === activeDistrict.toLowerCase();
    const stateOfDistrict = SAMPLE_DISTRICTS[activeDistrict]?.stateName?.toLowerCase();
    const stateMatch = stateOfDistrict && l.state?.toLowerCase() === stateOfDistrict;
    const isMatchingZone = dMatch || sMatch || stateMatch;
    return isMatchingZone && !districtSubmissions.some((s) => s.loanId === l.loanId);
  });

  return (
    <View style={styles.container}>
      <OfflineSyncBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Officer Header */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Field Verification Officer Mode</Text>
            <Text style={styles.userNameText}>{user?.name || 'Officer Vikram Shinde'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* District Switcher Card */}
        <View style={styles.districtCard}>
          <View style={styles.districtInfoRow}>
            <View style={styles.pinCircle}>
              <MapPin size={18} color="#1A56DB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.districtLabel}>Assigned Jurisdiction</Text>
              <Text style={styles.districtNameText}>
                {activeDistrict} District, {SAMPLE_DISTRICTS[activeDistrict]?.stateName || 'India'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.changeDistrictBtn}
              onPress={() => setShowDistrictModal(true)}
            >
              <Text style={styles.changeDistrictText}>Change</Text>
              <ChevronDown size={14} color="#1A56DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Audit Queue Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Clock size={15} color={activeTab === 'pending' ? '#1A56DB' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
              Pending Spot Audits ({pendingSubmissions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
            onPress={() => setActiveTab('completed')}
          >
            <FileCheck size={15} color={activeTab === 'completed' ? '#057A55' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActiveCompleted]}>
              Completed ({completedSubmissions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: PENDING SPOT AUDITS */}
        {activeTab === 'pending' && (
          <View style={styles.queueContainer}>
            {pendingSubmissions.length === 0 ? (
              <View style={styles.emptyCard}>
                <CheckCircle2 size={36} color="#057A55" />
                <Text style={styles.emptyTitle}>All Spot Audits Completed!</Text>
                <Text style={styles.emptySub}>
                  No pending field verifications for {activeDistrict} District.
                </Text>
                {pendingLoansInDistrict.length > 0 && (
                  <Text style={styles.emptyNotice}>
                    {pendingLoansInDistrict.length} loan(s) in {activeDistrict} are currently awaiting beneficiary photo upload.
                  </Text>
                )}
              </View>
            ) : (
              pendingSubmissions.map((sub) => (
                <View key={sub.submissionId} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.badgeAnom}>
                      <Text style={styles.badgeAnomText}>SPOT AUDIT QUEUED</Text>
                    </View>
                    <Text style={styles.distText}>{sub.district} District</Text>
                  </View>

                  <Text style={styles.benName}>{sub.beneficiaryName} ({sub.assetCategory})</Text>
                  <Text style={styles.benAddress}>
                    📍 {sub.district}, {sub.state} • Tag: {sub.assetTagId || 'N/A'} • Loan: {sub.loanId}
                  </Text>

                  <View style={styles.geoBox}>
                    <MapPin size={14} color="#1A56DB" />
                    <Text style={styles.geoBoxText}>
                      Target GPS: {sub.mediaFiles[0]?.gpsLat ? `${sub.mediaFiles[0].gpsLat.toFixed(4)}, ${sub.mediaFiles[0].gpsLng.toFixed(4)}` : '18.5204, 73.8567'}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.auditBtn} onPress={() => handleStartAudit(sub.submissionId)}>
                    <Navigation size={16} color="#FFFFFF" />
                    <Text style={styles.auditBtnText}>GPS Arrival Check-In & Audit</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Other Active Loans in District (Pending Beneficiary Upload) */}
            {pendingLoansInDistrict.length > 0 && (
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionHeader}>Other Sanctioned Loans in {activeDistrict}</Text>
                <Text style={styles.sectionSub}>Awaiting beneficiary proof submission</Text>

                {pendingLoansInDistrict.map((loan) => (
                  <View key={loan.loanId} style={styles.loanCard}>
                    <View style={styles.cardTop}>
                      <View style={styles.badgePending}>
                        <Text style={styles.badgePendingText}>AWAITING BENEFICIARY PROOF</Text>
                      </View>
                      <Text style={styles.distText}>₹{loan.loanAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={styles.benName}>{loan.beneficiaryName} ({loan.assetCategory})</Text>
                    <Text style={styles.benAddress}>
                      Phone: {loan.beneficiaryPhone} • Bank: {loan.bankName} • Due: {loan.verificationDeadline}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 2: COMPLETED AUDITS */}
        {activeTab === 'completed' && (
          <View style={styles.queueContainer}>
            {completedSubmissions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Clock size={36} color="#64748B" />
                <Text style={styles.emptyTitle}>No Completed Audits Yet</Text>
                <Text style={styles.emptySub}>
                  Completed on-site inspections for {activeDistrict} will appear here.
                </Text>
              </View>
            ) : (
              completedSubmissions.map((sub) => {
                const outcome = sub.fieldAudit?.outcome || (sub.status === 'approved' ? 'verified' : 'discrepancy');
                return (
                  <View key={sub.submissionId} style={styles.completedCard}>
                    <View style={styles.cardTop}>
                      <View style={[
                        styles.outcomeBadge,
                        outcome === 'verified' ? styles.outcomeBadgeVerified :
                        outcome === 'discrepancy_found' || outcome === 'discrepancy' ? styles.outcomeBadgeDiscrepancy :
                        styles.outcomeBadgeMissing
                      ]}>
                        <Text style={[
                          styles.outcomeBadgeText,
                          outcome === 'verified' ? styles.outcomeTextVerified :
                          outcome === 'discrepancy_found' || outcome === 'discrepancy' ? styles.outcomeTextDiscrepancy :
                          styles.outcomeTextMissing
                        ]}>
                          ✓ AUDIT {outcome.toUpperCase().replace('_', ' ')}
                        </Text>
                      </View>
                      <Text style={styles.distText}>
                        {sub.fieldAudit?.visitedAt ? new Date(sub.fieldAudit.visitedAt).toLocaleDateString() : 'Inspected'}
                      </Text>
                    </View>

                    <Text style={styles.benName}>{sub.beneficiaryName} ({sub.assetCategory})</Text>
                    <Text style={styles.benAddress}>
                      📍 {sub.district}, {sub.state} • Audited by: {sub.fieldAudit?.officerName || 'Vikram Shinde'}
                    </Text>

                    {sub.fieldAudit?.notes && (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesText}>"{sub.fieldAudit.notes}"</Text>
                      </View>
                    )}

                    <View style={styles.geoBox}>
                      <MapPin size={14} color="#057A55" />
                      <Text style={styles.geoBoxText}>
                        GPS Lock: {sub.fieldAudit?.gpsLat ? `${sub.fieldAudit.gpsLat.toFixed(4)}, ${sub.fieldAudit.gpsLng.toFixed(4)}` : '18.5204, 73.8567'} (±8m)
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* District Selector Modal */}
      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Assigned District</Text>
                <Text style={styles.modalSub}>12 Pan-India District Boundaries</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.values(SAMPLE_DISTRICTS)}
              keyExtractor={(item) => item.districtName}
              renderItem={({ item }) => {
                const isSelected = item.districtName.toLowerCase() === activeDistrict.toLowerCase();
                return (
                  <TouchableOpacity
                    style={[styles.districtItem, isSelected && styles.districtItemActive]}
                    onPress={() => handleSelectDistrict(item.districtName)}
                  >
                    <View>
                      <Text style={[styles.districtItemName, isSelected && styles.districtItemNameActive]}>
                        {item.districtName}
                      </Text>
                      <Text style={styles.districtItemState}>{item.stateName}</Text>
                    </View>
                    {isSelected && <CheckCircle2 size={18} color="#1A56DB" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
    gap: 14
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  greetingText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#E2E8F0'
  },
  districtCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  districtInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center'
  },
  districtLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase'
  },
  districtNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A'
  },
  changeDistrictBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD'
  },
  changeDistrictText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A56DB'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    gap: 4
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  tabTextActive: {
    color: '#1A56DB',
    fontWeight: '800'
  },
  tabTextActiveCompleted: {
    color: '#057A55',
    fontWeight: '800'
  },
  queueContainer: {
    gap: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeAnom: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  badgeAnomText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E'
  },
  distText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  benName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  benAddress: {
    fontSize: 11,
    color: '#475569'
  },
  geoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  geoBoxText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#1E293B',
    fontWeight: '700'
  },
  auditBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 11,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2
  },
  auditBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },
  emptyNotice: {
    fontSize: 11,
    color: '#1A56DB',
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    textAlign: 'center'
  },
  sectionDivider: {
    marginTop: 10,
    gap: 8
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B'
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6
  },
  badgePending: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  badgePendingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569'
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  outcomeBadgeVerified: {
    backgroundColor: '#DEF7EC',
    borderColor: '#BCF0DA'
  },
  outcomeBadgeDiscrepancy: {
    backgroundColor: '#FEF08A',
    borderColor: '#FDE047'
  },
  outcomeBadgeMissing: {
    backgroundColor: '#FDE8E8',
    borderColor: '#FBD5D5'
  },
  outcomeBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  outcomeTextVerified: {
    color: '#03543F'
  },
  outcomeTextDiscrepancy: {
    color: '#854D0E'
  },
  outcomeTextMissing: {
    color: '#9B1C1C'
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#334155'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    padding: 20,
    gap: 12
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A'
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B'
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B'
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8
  },
  districtItemActive: {
    backgroundColor: '#EFF6FF'
  },
  districtItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  districtItemNameActive: {
    color: '#1A56DB',
    fontWeight: '800'
  },
  districtItemState: {
    fontSize: 11,
    color: '#64748B'
  }
});
