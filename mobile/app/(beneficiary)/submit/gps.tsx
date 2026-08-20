import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, MapPin, CheckCircle } from 'lucide-react-native';
import { useStore } from '../../../store/useStore';
import { LocationLock } from '../../../components/LocationLock';

export default function Step1GpsScreen() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const t = useStore((s) => s.t);

  const handleNext = () => {
    router.push('/(beneficiary)/submit/media');
  };

  return (
    <View style={styles.container}>
      {/* Header Wizard Bar */}
      <View style={styles.wizardHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.stepInfo}>
          <Text style={styles.stepLabel}>Step 1 of 4</Text>
          <Text style={styles.stepTitle}>Geographic Location Lock</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: '25%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.instructionText}>
          Lock your high-accuracy GPS coordinates at the exact physical location of the sanctioned asset.
        </Text>

        <LocationLock />

        {/* Action Button */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
          <Text style={styles.continueBtnText}>Continue to Step 2: Camera Capture</Text>
          <ArrowRight size={16} color="#FFFFFF" />
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
    gap: 16
  },
  instructionText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500'
  },
  continueBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
