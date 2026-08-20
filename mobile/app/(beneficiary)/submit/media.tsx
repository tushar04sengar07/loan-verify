import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Camera, Check, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useStore } from '../../../store/useStore';
import { GuidedCamera } from '../../../components/GuidedCamera';
import { MediaFile } from '../../../../shared/types';

export default function Step2MediaScreen() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const schemes = useStore((s) => s.schemes);
  const addDraftMedia = useStore((s) => s.addDraftMedia);
  const removeDraftMedia = useStore((s) => s.removeDraftMedia);
  const t = useStore((s) => s.t);

  const currentScheme = schemes.find(s => s.assetCategory === draft.assetCategory) || schemes[0];
  const silhouetteType = currentScheme?.silhouetteType || 'animal';

  const [activeAngle, setActiveAngle] = useState<'front' | 'side' | 'tag'>('front');

  const handleCaptureComplete = (media: MediaFile) => {
    addDraftMedia(media);
    // Auto advance to next angle if not captured yet
    if (activeAngle === 'front') setActiveAngle('side');
    else if (activeAngle === 'side') setActiveAngle('tag');
  };

  const handleNext = () => {
    router.push('/(beneficiary)/submit/details');
  };

  const hasFront = draft.mediaFiles.some(m => m.angle === 'front');
  const hasSide = draft.mediaFiles.some(m => m.angle === 'side');
  const hasTag = draft.mediaFiles.some(m => m.angle === 'tag');

  return (
    <View style={styles.container}>
      {/* Header Wizard Bar */}
      <View style={styles.wizardHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.stepInfo}>
          <Text style={styles.stepLabel}>Step 2 of 4</Text>
          <Text style={styles.stepTitle}>Guided Asset Photo Capture</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: '50%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Angle Selection Tabs */}
        <View style={styles.angleSelector}>
          <TouchableOpacity
            style={[styles.angleTab, activeAngle === 'front' && styles.angleTabActive]}
            onPress={() => setActiveAngle('front')}
          >
            <Text style={[styles.angleTabText, activeAngle === 'front' && styles.angleTabTextActive]}>
              1. Front View {hasFront && '✓'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.angleTab, activeAngle === 'side' && styles.angleTabActive]}
            onPress={() => setActiveAngle('side')}
          >
            <Text style={[styles.angleTabText, activeAngle === 'side' && styles.angleTabTextActive]}>
              2. Side View {hasSide && '✓'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.angleTab, activeAngle === 'tag' && styles.angleTabActive]}
            onPress={() => setActiveAngle('tag')}
          >
            <Text style={[styles.angleTabText, activeAngle === 'tag' && styles.angleTabTextActive]}>
              3. ID / Tag {hasTag && '✓'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guided Camera Component */}
        <GuidedCamera
          silhouetteType={silhouetteType}
          requiredAngle={activeAngle}
          onCaptureComplete={handleCaptureComplete}
        />

        {/* Captured Photos Strip */}
        <View style={styles.galleryCard}>
          <Text style={styles.galleryTitle}>Captured Proof Media ({draft.mediaFiles.length}/3)</Text>
          <View style={styles.galleryGrid}>
            {draft.mediaFiles.map((m) => (
              <View key={m.id} style={styles.galleryItem}>
                <Image source={{ uri: m.url }} style={styles.galleryImg} />
                <View style={styles.angleBadge}>
                  <Text style={styles.angleBadgeText}>{m.angle?.toUpperCase()}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeDraftMedia(m.id)}
                >
                  <Trash2 size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Continue Action */}
        <TouchableOpacity
          style={[styles.continueBtn, draft.mediaFiles.length === 0 && styles.continueBtnDisabled]}
          onPress={handleNext}
        >
          <Text style={styles.continueBtnText}>Continue to Step 3: Asset Details</Text>
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
    gap: 14
  },
  angleSelector: {
    flexDirection: 'row',
    gap: 6
  },
  angleTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  angleTabActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB'
  },
  angleTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B'
  },
  angleTabTextActive: {
    color: '#FFFFFF'
  },
  galleryCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10
  },
  galleryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A'
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  galleryItem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  galleryImg: {
    width: '100%',
    height: '100%'
  },
  angleBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4
  },
  angleBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700'
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 4,
    borderRadius: 6
  },
  continueBtn: {
    backgroundColor: '#1A56DB',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4
  },
  continueBtnDisabled: {
    opacity: 0.5
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
