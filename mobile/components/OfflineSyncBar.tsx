import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Wifi, WifiOff, CloudUpload, CheckCircle, RefreshCw } from 'lucide-react-native';
import { useStore } from '../store/useStore';

export const OfflineSyncBar: React.FC = () => {
  const isOnline = useStore((s) => s.isOnline);
  const setIsOnline = useStore((s) => s.setIsOnline);
  const offlineQueue = useStore((s) => s.offlineQueue);
  const processOfflineQueue = useStore((s) => s.processOfflineQueue);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleSyncNow = async () => {
    if (!isOnline) {
      setSyncToast('Cannot sync: Device is in offline mode.');
      setTimeout(() => setSyncToast(null), 3000);
      return;
    }

    setIsSyncing(true);
    const count = await processOfflineQueue();
    setIsSyncing(false);
    setSyncToast(`Synced ${count} pending submissions to Cloud Firestore!`);
    setTimeout(() => setSyncToast(null), 4000);
  };

  const pendingCount = offlineQueue.length;

  return (
    <View style={styles.wrapper}>
      {/* Network toggle & Pending Banner */}
      <View style={[styles.container, isOnline ? styles.onlineBg : styles.offlineBg]}>
        <TouchableOpacity
          style={styles.statusToggle}
          onPress={() => setIsOnline(!isOnline)}
        >
          {isOnline ? (
            <Wifi size={14} color="#057A55" />
          ) : (
            <WifiOff size={14} color="#C81E1E" />
          )}
          <Text style={[styles.statusText, isOnline ? styles.onlineText : styles.offlineText]}>
            {isOnline ? 'Online (Tap to toggle offline)' : 'Offline Mode (Tap to reconnect)'}
          </Text>
        </TouchableOpacity>

        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={handleSyncNow}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <CloudUpload size={13} color="#FFFFFF" />
                <Text style={styles.syncBtnText}>
                  Sync Queue ({pendingCount})
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {syncToast && (
        <View style={styles.toast}>
          <CheckCircle size={14} color="#057A55" />
          <Text style={styles.toastText}>{syncToast}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%'
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  onlineBg: {
    backgroundColor: '#ECFDF5',
    borderBottomColor: '#A7F3D0'
  },
  offlineBg: {
    backgroundColor: '#FEF2F2',
    borderBottomColor: '#FECACA'
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700'
  },
  onlineText: {
    color: '#065F46'
  },
  offlineText: {
    color: '#991B1B'
  },
  syncBtn: {
    backgroundColor: '#1A56DB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  toast: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#BCF0DA'
  },
  toastText: {
    fontSize: 11,
    color: '#03543F',
    fontWeight: '600'
  }
});
