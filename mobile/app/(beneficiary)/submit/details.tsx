import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, QrCode, FileText, CheckCircle2 } from 'lucide-react-native';
import { useStore } from '../../../store/useStore';

export default function Step3DetailsScreen() {
  const router = useRouter();
  const draft = useStore((s) => s.draft);
  const updateDraftDetails = useStore((s) => s.updateDraftDetails);
  const t = useStore((s) => s.t);

  const [description, setDescription] = useState(draft.assetDescription || '');
  const [vendorName, setVendorName] = useState(draft.vendorName || '');
  const [invoiceNumber, setInvoiceNumber] = useState(draft.invoiceNumber || '');
  const [tagId, setTagId] = useState(draft.assetTagId || '');
  const [tagScanned, setTagScanned] = useState(false);

  const handleScanQr = () => {
    const generatedTag = `TAG-${draft.assetCategory.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTagId(generatedTag);
    setTagScanned(true);
  };

  const handleNext = () => {
    updateDraftDetails({
      assetDescription: description,
      vendorName,
      invoiceNumber,
      assetTagId: tagId
    });
    router.push('/(beneficiary)/submit/review');
  };

  return (
    <View style={styles.container}>
      {/* Header Wizard Bar */}
      <View style={styles.wizardHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.stepInfo}>
          <Text style={styles.stepLabel}>Step 3 of 4</Text>
          <Text style={styles.stepTitle}>Asset Description & Invoice</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: '75%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Asset Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset Description / Specifications</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              placeholder="e.g. Healthy Murrah Buffalo purchased from Baramati Cattle Fair, tag attached."
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* QR / Ear Tag Scanner Simulation */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Asset QR Code / Ear Tag ID</Text>
            <View style={styles.qrRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Scan or enter tag ID"
                value={tagId}
                onChangeText={setTagId}
              />
              <TouchableOpacity style={styles.scanBtn} onPress={handleScanQr}>
                <QrCode size={16} color="#FFFFFF" />
                <Text style={styles.scanBtnText}>Scan QR</Text>
              </TouchableOpacity>
            </View>
            {tagScanned && (
              <Text style={styles.scannedSuccess}>✓ Tag verified & registered</Text>
            )}
          </View>

          {/* Vendor Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Authorized Vendor / Seller Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Baramati Agro Co-operative"
              value={vendorName}
              onChangeText={setVendorName}
            />
          </View>

          {/* Invoice / Bill Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Invoice / Cash Memo Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. INV-2026-9812"
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
            />
          </View>
        </View>

        {/* Continue Action */}
        <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
          <Text style={styles.continueBtnText}>Continue to Step 4: Final Review</Text>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14
  },
  inputGroup: {
    gap: 4
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC'
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top'
  },
  qrRow: {
    flexDirection: 'row',
    gap: 8
  },
  scanBtn: {
    backgroundColor: '#1A56DB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  scannedSuccess: {
    color: '#057A55',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2
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
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
