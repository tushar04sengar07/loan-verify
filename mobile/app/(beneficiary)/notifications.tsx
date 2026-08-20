import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Send, CheckCircle2, Bell } from 'lucide-react-native';
import { useStore } from '../../store/useStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  const handleSendReply = () => {
    if (replyText.trim().length > 0) {
      setReplySent(true);
      setReplyText('');
      setTimeout(() => setReplySent(false), 4000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Officer Inquiries & Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sample notification alert */}
        <View style={styles.notificationCard}>
          <View style={styles.notifHeader}>
            <Bell size={16} color="#1A56DB" />
            <Text style={styles.notifTitle}>Loan Utilization Verification Notice</Text>
          </View>
          <Text style={styles.notifBody}>
            Your loan verification is scheduled. Please ensure asset photos are taken directly at the farm site with GPS enabled.
          </Text>
          <Text style={styles.notifDate}>2 hours ago • State Nodal Agency</Text>
        </View>

        {/* Officer Clarification Query Thread */}
        <View style={styles.queryCard}>
          <View style={styles.notifHeader}>
            <MessageSquare size={16} color="#9333EA" />
            <Text style={[styles.notifTitle, { color: '#6B21A8' }]}>
              Officer Query: Clarification Required
            </Text>
          </View>

          <View style={styles.officerMsgBox}>
            <Text style={styles.officerName}>Officer Anjali Deshmukh (Pune District):</Text>
            <Text style={styles.officerMsg}>
              "Please provide an additional photo of the ear tag #MH-PUN-8841 showing the serial number clearly against the animal."
            </Text>
          </View>

          {replySent && (
            <View style={styles.successToast}>
              <CheckCircle2 size={14} color="#057A55" />
              <Text style={styles.successToastText}>Response sent to verifying officer.</Text>
            </View>
          )}

          <View style={styles.replyBox}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type clarification response here..."
              value={replyText}
              onChangeText={setReplyText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendReply}>
              <Send size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
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
    gap: 14
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A'
  },
  notifBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18
  },
  notifDate: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600'
  },
  queryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    gap: 10
  },
  officerMsgBox: {
    backgroundColor: '#FAF5FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 4
  },
  officerName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B21A8'
  },
  officerMsg: {
    fontSize: 12,
    color: '#3B0764',
    lineHeight: 18
  },
  replyBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    backgroundColor: '#F8FAFC'
  },
  sendBtn: {
    backgroundColor: '#9333EA',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8
  },
  successToastText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700'
  }
});
