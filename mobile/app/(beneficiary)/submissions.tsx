import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, ShieldAlert, Clock, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export default function SubmissionsHistoryScreen() {
  const router = useRouter();
  const submissions = useStore((s) => s.submissions);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Verification Submissions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submissions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Clock size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Submissions Yet</Text>
            <Text style={styles.emptySub}>
              Start a new verification workflow from your home dashboard.
            </Text>
          </View>
        ) : (
          submissions.map((sub) => {
            const score = sub.aiValidationResult?.anomalyScore || 0;
            return (
              <View key={sub.submissionId} style={styles.subCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.schemeName}>{sub.assetCategory}</Text>
                    <Text style={styles.subIdText}>{sub.submissionId}</Text>
                  </View>
                  <View style={[styles.statusBadge, sub.status === 'approved' ? styles.badgeApproved : styles.badgePending]}>
                    <Text style={[styles.statusBadgeText, sub.status === 'approved' ? styles.textApproved : styles.textPending]}>
                      {sub.status.toUpperCase().replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {/* AI Score readout */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>AI Authenticity Score:</Text>
                  <Text style={[styles.scoreValue, score >= 80 ? styles.scoreGood : styles.scoreWarn]}>
                    {score}/100
                  </Text>
                </View>

                {/* Media preview */}
                <View style={styles.thumbRow}>
                  {sub.mediaFiles.map((m) => (
                    <Image key={m.id} source={{ uri: m.url }} style={styles.thumb} />
                  ))}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>
                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A'
  },
  scrollContent: {
    padding: 16,
    gap: 12
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155'
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  schemeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  subIdText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1
  },
  badgeApproved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  badgePending: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE'
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800'
  },
  textApproved: {
    color: '#166534'
  },
  textPending: {
    color: '#1E40AF'
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: '800'
  },
  scoreGood: {
    color: '#057A55'
  },
  scoreWarn: {
    color: '#D97706'
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6
  },
  dateText: {
    fontSize: 10,
    color: '#64748B'
  }
});
