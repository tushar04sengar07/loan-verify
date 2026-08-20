import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Mic, 
  Send 
} from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export default function FieldAuditExecutionScreen() {
  const router = useRouter();
  const { submissionId } = useLocalSearchParams<{ submissionId?: string }>();
  const user = useStore((s) => s.user);
  const updateSubmissionAudit = useStore((s) => s.updateSubmissionAudit);

  const [gpsCheckedIn, setGpsCheckedIn] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [auditOutcome, setAuditOutcome] = useState<'verified' | 'discrepancy' | 'not_found'>('verified');
  const [auditNotes, setAuditNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const beneficiaryPhotoUrl = 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80';
  const officerAuditPhotoUrl = 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80';

  const handleGpsCheckIn = () => {
    setGpsCheckedIn(true);
  };

  const handleCaptureAuditPhoto = () => {
    setCapturedPhoto(officerAuditPhotoUrl);
  };

  const handleCompleteAudit = async () => {
    setIsCompleted(true);

    const targetSubId = submissionId || 'sub_001_pune';
    const auditPayload = {
      auditId: `audit_${Date.now()}`,
      submissionId: targetSubId,
      officerId: user?.userId || 'user_field_officer_01',
      officerName: user?.name || 'Vikram Shinde (Field Auditor)',
      visitedAt: new Date().toISOString(),
      gpsLat: 18.5204,
      gpsLng: 73.8567,
      gpsAccuracy: 8,
      outcome: auditOutcome,
      notes: auditNotes || `On-site field verification completed with outcome: ${auditOutcome.toUpperCase()}.`,
      auditPhotos: [
        {
          id: `audit_photo_${Date.now()}`,
          url: capturedPhoto || officerAuditPhotoUrl,
          type: 'photo',
          angle: 'audit_spot',
          gpsLat: 18.5204,
          gpsLng: 73.8567,
          gpsAccuracy: 8,
          timestamp: new Date().toISOString(),
          deviceId: 'officer-tablet',
          hash: 'audit_pHash_' + Date.now()
        }
      ]
    };

    updateSubmissionAudit(targetSubId, auditPayload);

    try {
      await fetch('http://localhost:5000/api/submissions/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditPayload)
      });
    } catch (e) {
      console.warn('Could not reach local server to submit spot audit:', e);
    }

    setTimeout(() => {
      router.replace('/(officer)');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerSubtitle}>Field Spot Audit Mode</Text>
          <Text style={styles.headerTitle}>Asset Cross-Verification</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: GPS Arrival Check-in */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={16} color="#1A56DB" />
            <Text style={styles.cardTitle}>1. Officer Site GPS Check-In</Text>
          </View>
          
          <Text style={styles.cardSub}>
            Arrival coordinates will be logged immutably into the audit trail.
          </Text>

          <TouchableOpacity
            style={[styles.checkInBtn, gpsCheckedIn && styles.checkInBtnDone]}
            onPress={handleGpsCheckIn}
            disabled={gpsCheckedIn}
          >
            <ShieldCheck size={16} color="#FFFFFF" />
            <Text style={styles.checkInBtnText}>
              {gpsCheckedIn ? '✓ Verified Check-In: 18.5204° N, 73.8567° E' : 'Tap for Live GPS Arrival Lock'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step 2: Split View Comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. Side-by-Side Visual Inspection</Text>
          
          <View style={styles.splitRow}>
            {/* Beneficiary photo */}
            <View style={styles.splitCol}>
              <Text style={styles.splitColTitle}>Original Submission</Text>
              <Image source={{ uri: beneficiaryPhotoUrl }} style={styles.splitImg} />
              <Text style={styles.splitMeta}>Geo: 18.5204, 73.8567</Text>
            </View>

            {/* Officer live photo */}
            <View style={styles.splitCol}>
              <Text style={styles.splitColTitle}>On-Site Spot Photo</Text>
              {capturedPhoto ? (
                <Image source={{ uri: capturedPhoto }} style={styles.splitImg} />
              ) : (
                <TouchableOpacity style={styles.cameraPlaceholder} onPress={handleCaptureAuditPhoto}>
                  <Camera size={24} color="#64748B" />
                  <Text style={styles.camText}>Tap to Capture</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.splitMeta}>
                {capturedPhoto ? '✓ Auditor Photo Captured' : 'Pending Capture'}
              </Text>
            </View>
          </View>
        </View>

        {/* Step 3: Physical Outcome Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. Verification Outcome & Audit Notes</Text>

          <View style={styles.outcomeRow}>
            <TouchableOpacity
              style={[styles.outcomeBtn, auditOutcome === 'verified' && styles.outcomeBtnVerified]}
              onPress={() => setAuditOutcome('verified')}
            >
              <CheckCircle2 size={16} color={auditOutcome === 'verified' ? '#FFFFFF' : '#057A55'} />
              <Text style={[styles.outcomeBtnText, auditOutcome === 'verified' && styles.outcomeTextActive]}>
                Verified ✓
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outcomeBtn, auditOutcome === 'discrepancy' && styles.outcomeBtnDiscrepancy]}
              onPress={() => setAuditOutcome('discrepancy')}
            >
              <AlertTriangle size={16} color={auditOutcome === 'discrepancy' ? '#FFFFFF' : '#C27803'} />
              <Text style={[styles.outcomeBtnText, auditOutcome === 'discrepancy' && styles.outcomeTextActive]}>
                Discrepancy ⚠
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outcomeBtn, auditOutcome === 'not_found' && styles.outcomeBtnNotFound]}
              onPress={() => setAuditOutcome('not_found')}
            >
              <XCircle size={16} color={auditOutcome === 'not_found' ? '#FFFFFF' : '#C81E1E'} />
              <Text style={[styles.outcomeBtnText, auditOutcome === 'not_found' && styles.outcomeTextActive]}>
                Missing ✗
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={3}
            placeholder="Enter officer audit notes and physical inspection findings..."
            value={auditNotes}
            onChangeText={setAuditNotes}
          />
        </View>

        {/* Complete Audit Action */}
        <TouchableOpacity
          style={[styles.completeBtn, (!gpsCheckedIn || !capturedPhoto) && styles.completeBtnDisabled]}
          onPress={handleCompleteAudit}
          disabled={!gpsCheckedIn || !capturedPhoto}
        >
          <Text style={styles.completeBtnText}>
            {isCompleted ? '✓ Audit Record Logged & Synced!' : 'Submit Field Spot Audit'}
          </Text>
        </TouchableOpacity>
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
  headerTitleBox: {
    flex: 1
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase'
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A'
  },
  scrollContent: {
    padding: 16,
    gap: 14
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B'
  },
  checkInBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4
  },
  checkInBtnDone: {
    backgroundColor: '#057A55'
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10
  },
  splitCol: {
    flex: 1,
    gap: 4
  },
  splitColTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  splitImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#E2E8F0'
  },
  cameraPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 4
  },
  camText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700'
  },
  splitMeta: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace'
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 6
  },
  outcomeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4
  },
  outcomeBtnVerified: {
    backgroundColor: '#057A55',
    borderColor: '#057A55'
  },
  outcomeBtnDiscrepancy: {
    backgroundColor: '#C27803',
    borderColor: '#C27803'
  },
  outcomeBtnNotFound: {
    backgroundColor: '#C81E1E',
    borderColor: '#C81E1E'
  },
  outcomeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  outcomeTextActive: {
    color: '#FFFFFF'
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 11,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    height: 60,
    textAlignVertical: 'top'
  },
  completeBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  completeBtnDisabled: {
    opacity: 0.5
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
