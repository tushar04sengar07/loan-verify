import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { useStore } from '../store/useStore';

export const LocationLock: React.FC = () => {
  const t = useStore((s) => s.t);
  const draft = useStore((s) => s.draft);
  const setDraftGps = useStore((s) => s.setDraftGps);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshGps = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate high-accuracy GPS capture with slight jitter
      const lat = 18.5204 + (Math.random() - 0.5) * 0.001;
      const lng = 73.8567 + (Math.random() - 0.5) * 0.001;
      const acc = Math.floor(6 + Math.random() * 6);
      setDraftGps(lat, lng, acc);
      setIsRefreshing(false);
    }, 700);
  };

  const isAccuracyGood = draft.gpsAccuracy <= 50;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MapPin size={16} color="#1A56DB" />
          <Text style={styles.headerTitle}>GPS Geo-Tagging Lock</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefreshGps}
          disabled={isRefreshing}
        >
          <RefreshCw size={14} color="#1A56DB" />
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Accuracy Status Box */}
      <View style={[styles.statusBox, isAccuracyGood ? styles.goodBox : styles.warnBox]}>
        {isAccuracyGood ? (
          <ShieldCheck size={18} color="#057A55" />
        ) : (
          <AlertTriangle size={18} color="#C27803" />
        )}
        <View style={styles.statusTextBox}>
          <Text style={[styles.statusTitle, isAccuracyGood ? styles.goodText : styles.warnText]}>
            {isAccuracyGood ? 'High Precision GPS Locked' : 'Low GPS Accuracy (>50m)'}
          </Text>
          <Text style={styles.statusSub}>
            {isAccuracyGood
              ? 'GPS accuracy is within scheme compliance threshold (±' + draft.gpsAccuracy + 'm).'
              : 'Move to an open area with clear sky view for optimal verification.'}
          </Text>
        </View>
      </View>

      {/* Coordinate Readout */}
      <View style={styles.coordsGrid}>
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Latitude</Text>
          <Text style={styles.coordValue}>{draft.gpsLat.toFixed(6)}° N</Text>
        </View>
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Longitude</Text>
          <Text style={styles.coordValue}>{draft.gpsLng.toFixed(6)}° E</Text>
        </View>
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Accuracy Radius</Text>
          <Text style={styles.coordValue}>±{draft.gpsAccuracy} meters</Text>
        </View>
      </View>

      {/* Mini Map Graphic Simulation */}
      <View style={styles.miniMap}>
        <View style={styles.mapGridLineH} />
        <View style={styles.mapGridLineV} />
        <View style={styles.radarRing} />
        <View style={styles.radarCenter}>
          <MapPin size={18} color="#EF4444" />
        </View>
        <Text style={styles.mapPinLabel}>Verified Field Site (Pune District)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF'
  },
  refreshBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A56DB'
  },
  statusBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1
  },
  goodBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0'
  },
  warnBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  statusTextBox: {
    flex: 1
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '800'
  },
  goodText: {
    color: '#166534'
  },
  warnText: {
    color: '#92400E'
  },
  statusSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  coordsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  coordItem: {
    flex: 1
  },
  coordLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase'
  },
  coordValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'monospace',
    marginTop: 2
  },
  miniMap: {
    height: 100,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  mapGridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#CBD5E1'
  },
  mapGridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#CBD5E1'
  },
  radarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(26, 86, 219, 0.4)',
    backgroundColor: 'rgba(26, 86, 219, 0.1)'
  },
  radarCenter: {
    position: 'absolute'
  },
  mapPinLabel: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: '700',
    color: '#334155'
  }
});
