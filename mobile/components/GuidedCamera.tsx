import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { MediaFile } from '../shared/types';
import { generateSimulatedPHash } from '../shared/fraudUtils';

interface GuidedCameraProps {
  silhouetteType: 'animal' | 'tractor' | 'machine' | 'solar' | 'general' | 'fish' | 'honey' | 'warehouse' | 'vehicle' | 'irrigation';
  requiredAngle: 'front' | 'side' | 'tag';
  onCaptureComplete: (media: MediaFile) => void;
}

const SAMPLE_ASSET_IMAGES: Record<string, Record<string, string>> = {
  animal: {
    front: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80'
  },
  tractor: {
    front: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  machine: {
    front: 'https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  },
  solar: {
    front: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80'
  },
  fish: {
    front: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  },
  honey: {
    front: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  warehouse: {
    front: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  vehicle: {
    front: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  },
  irrigation: {
    front: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80'
  },
  general: {
    front: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    side: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    tag: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  }
};

export const GuidedCamera: React.FC<GuidedCameraProps> = ({
  silhouetteType,
  requiredAngle,
  onCaptureComplete
}) => {
  const t = useStore((s) => s.t);
  const draft = useStore((s) => s.draft);

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isBlurry, setIsBlurry] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleCapture = () => {
    setIsChecking(true);
    const categoryGroup = SAMPLE_ASSET_IMAGES[silhouetteType] || SAMPLE_ASSET_IMAGES.general;
    const capturedUrl = categoryGroup[requiredAngle] || categoryGroup.front;

    setTimeout(() => {
      setPreviewUri(capturedUrl);
      setIsBlurry(false);
      setIsChecking(false);
    }, 600);
  };

  const handleAcceptPhoto = () => {
    if (!previewUri) return;

    const mediaFile: MediaFile = {
      id: `med_${Date.now()}_${requiredAngle}`,
      url: previewUri,
      type: 'photo',
      angle: requiredAngle,
      gpsLat: draft.gpsLat,
      gpsLng: draft.gpsLng,
      gpsAccuracy: draft.gpsAccuracy,
      timestamp: new Date().toISOString(),
      deviceId: 'samsung-a53',
      hash: generateSimulatedPHash(`${requiredAngle}_${Date.now()}`),
      isBlurry: false,
      laplacianVariance: 420,
      exifData: {
        make: 'Samsung',
        model: 'SM-A536E',
        dateTimeOriginal: new Date().toISOString(),
        gpsLatitude: draft.gpsLat,
        gpsLongitude: draft.gpsLng
      }
    };

    onCaptureComplete(mediaFile);
    setPreviewUri(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Angle Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.angleText}>
          Angle Required: <Text style={styles.angleHighlight}>{requiredAngle.toUpperCase()} VIEW</Text>
        </Text>
        <Text style={styles.subGuideText}>
          Align asset inside the boundary frame overlay
        </Text>
      </View>

      {/* Viewfinder with Silhouette Overlay */}
      <View style={styles.viewfinder}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
        ) : (
          <View style={styles.cameraSim}>
            {/* Silhouette Outline Overlay */}
            <View style={styles.silhouetteFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              
              <Text style={styles.silhouetteIcon}>
                {silhouetteType === 'animal' ? '🐄' :
                 silhouetteType === 'tractor' ? '🚜' :
                 silhouetteType === 'machine' ? '🧵' :
                 silhouetteType === 'solar' ? '☀️' :
                 silhouetteType === 'fish' ? '🐟' :
                 silhouetteType === 'honey' ? '🐝' :
                 silhouetteType === 'warehouse' ? '🏭' :
                 silhouetteType === 'vehicle' ? '🛺' :
                 silhouetteType === 'irrigation' ? '💧' : '📦'}
              </Text>
              <Text style={styles.silhouetteLabel}>
                Fit {silhouetteType.toUpperCase()} within frame
              </Text>
            </View>

            {/* Live GPS Lock Indicator */}
            <View style={styles.gpsPill}>
              <ShieldCheck size={12} color="#10B981" />
              <Text style={styles.gpsPillText}>
                GPS Locked: {draft.gpsLat.toFixed(4)}, {draft.gpsLng.toFixed(4)} (±{draft.gpsAccuracy}m)
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Controls */}
      <View style={styles.actionRow}>
        {previewUri ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity
              style={[styles.btn, styles.retakeBtn]}
              onPress={() => setPreviewUri(null)}
            >
              <RefreshCw size={16} color="#475569" />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.acceptBtn]}
              onPress={handleAcceptPhoto}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.acceptText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.shutterButton}
            onPress={handleCapture}
            disabled={isChecking}
          >
            <View style={styles.shutterInner}>
              <Camera size={26} color="#1A56DB" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155'
  },
  topBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center'
  },
  angleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  },
  angleHighlight: {
    color: '#60A5FA',
    fontWeight: '800'
  },
  subGuideText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2
  },
  viewfinder: {
    aspectRatio: 4 / 3,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  cameraSim: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  silhouetteFrame: {
    width: '75%',
    height: '70%',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  silhouetteIcon: {
    fontSize: 56,
    opacity: 0.6
  },
  silhouetteLabel: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#3B82F6'
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#3B82F6'
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#3B82F6'
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#3B82F6'
  },
  gpsPill: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6
  },
  gpsPillText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  actionRow: {
    padding: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#60A5FA'
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6
  },
  retakeBtn: {
    backgroundColor: '#E2E8F0'
  },
  retakeText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13
  },
  acceptBtn: {
    backgroundColor: '#1A56DB'
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  }
});
