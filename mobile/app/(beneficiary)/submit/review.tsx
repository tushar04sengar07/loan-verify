import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, CloudUpload, ShieldCheck, MapPin, QrCode, Building, Calendar } from 'lucide-react-native';
import { useStore } from '../../../store/useStore';

export default function Step4ReviewScreen() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const isOnline = useStore((s) => s.isOnline);
  const submitDraft = useStore((s) => s.submitDraft);
  const queueDraftOffline = useStore((s) => s.queueDraftOffline);
  const t = useStore((s) => s.t);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [aiScoreResult, setAiScoreResult] = useState<number | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        const sub = await submitDraft();
        setAiScoreResult(sub.aiValidationResult?.anomalyScore || 90);
      } else {
        await queueDraftOffline();
        setAiScoreResult(null);
      }
      setIsSubmitting(false);
      setSuccessModal(true);
    } catch (e) {
      console.error('Submission error:', e);
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setSuccessModal(false);
    router.replace('/(beneficiary)');
  };

  return (
    <View style={styles.container}>
      {/* Header Wizard Bar */}
      <View style={styles.wizardHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.stepInfo}>
          <Text style={styles.stepLabel}>Step 4 of 4</Text>
          <Text style={styles.stepTitle}>Review & Submit Proof</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: '100%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* GPS Verification Badge */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <MapPin size={16} color="#1A56DB" />
            <Text style={styles.cardTitle}>Geo-Location Pin</Text>
          </View>
          <Text style={styles.geoText}>
            {draft.gpsLat.toFixed(6)}° N, {draft.gpsLng.toFixed(6)}° E (±{draft.gpsAccuracy}m accuracy)
          </Text>
        </View>

        {/* Photos Preview */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={16} color="#057A55" />
            <Text style={styles.cardTitle}>Captured Proof Media ({draft.mediaFiles.length} Photos)</Text>
          </View>
          <View style={styles.photoRow}>
            {draft.mediaFiles.map((m) => (
              <View key={m.id} style={styles.thumbWrapper}>
                <Image source={{ uri: m.url }} style={styles.thumbImg} />
                <Text style={styles.thumbLabel}>{m.angle?.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Asset Details Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Building size={16} color="#475569" />
            <Text style={styles.cardTitle}>Asset & Vendor Information</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Asset Category:</Text>
              <Text style={styles.infoVal}>{draft.assetCategory}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>QR / Tag ID:</Text>
              <Text style={[styles.infoVal, { color: '#1A56DB', fontWeight: '800' }]}>
                {draft.assetTagId || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Vendor Name:</Text>
              <Text style={styles.infoVal}>{draft.vendorName || 'Authorized Dealer'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Invoice Number:</Text>
              <Text style={styles.infoVal}>{draft.invoiceNumber || 'INV-001'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Description:</Text>
              <Text style={styles.infoVal}>{draft.assetDescription || 'Asset verified.'}</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, !isOnline && styles.offlineSubmitBtn]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <CloudUpload size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {isOnline ? 'Submit Verification Proof' : 'Save to Offline SQLite Queue'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      {successModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconBadge}>
              <CheckCircle2 size={36} color="#057A55" />
            </View>

            <Text style={styles.modalTitle}>
              {isOnline ? 'Proof Successfully Submitted!' : 'Saved to Offline Queue!'}
            </Text>

            <Text style={styles.modalSubtitle}>
              {isOnline
                ? `AI Authenticity Score: ${aiScoreResult}/100. Your proof has been submitted to the State Agency console for final approval.`
                : 'Your submission and media have been stored locally. It will auto-sync when internet connectivity is restored.'}
            </Text>

            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
              <Text style={styles.finishBtnText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 12
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  stepInfo: {
    flex: 1
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A56DB',
    textTransform: 'uppercase'
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A'
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    width: '100%'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1A56DB'
  },
  scrollContent: {
    padding: 16,
    gap: 14
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A'
  },
  geoText: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: 'monospace',
    fontWeight: '700'
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10
  },
  thumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  thumbImg: {
    width: '100%',
    height: '100%'
  },
  thumbLabel: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  },
  infoList: {
    gap: 6
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  infoKey: {
    fontSize: 11,
    color: '#64748B'
  },
  infoVal: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600'
  },
  submitBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6
  },
  offlineSubmitBtn: {
    backgroundColor: '#057A55'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 12
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DEF7EC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18
  },
  finishBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 6
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
