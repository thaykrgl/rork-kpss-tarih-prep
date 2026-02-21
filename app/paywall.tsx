import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Crown, Check, Sparkles, BookOpen, Brain, Layers } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { usePremium } from '@/providers/PremiumProvider';

export default function PaywallScreen() {
  const router = useRouter();
  const {
    lifetimePackage,
    purchasePackage,
    restorePurchases,
    isPurchasing,
    isRestoring,
    isLoading,
    purchaseError,
    restoreError,
  } = usePremium();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (purchaseError) {
      const msg = (purchaseError as Error).message ?? 'Bilinmeyen hata';
      if (!msg.includes('cancelled') && !msg.includes('canceled')) {
        Alert.alert('Hata', 'Satın alma başarısız oldu. Lütfen tekrar deneyin.');
      }
    }
  }, [purchaseError]);

  useEffect(() => {
    if (restoreError) {
      Alert.alert('Hata', 'Satın alım geri yüklenemedi. Lütfen tekrar deneyin.');
    }
  }, [restoreError]);

  const handlePurchase = () => {
    if (!lifetimePackage) {
      Alert.alert('Hata', 'Ürün bilgisi yüklenemedi. Lütfen tekrar deneyin.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    purchasePackage(lifetimePackage);
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    restorePurchases();
  };

  const priceLabel = lifetimePackage?.product?.priceString ?? '₺119,99';

  const features = [
    { icon: BookOpen, text: 'Tüm 11 konu başlığına erişim', color: '#2E86AB' },
    { icon: Brain, text: '200+ soru ile sınırsız test', color: '#C0392B' },
    { icon: Layers, text: 'Tüm bilgi kartları', color: '#C8A951' },
    { icon: Sparkles, text: 'Sürekli güncellenen içerik', color: '#1B7A4E' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <X color={Colors.textSecondary} size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestore} disabled={isRestoring}>
            <Text style={styles.restoreText}>
              {isRestoring ? 'Kontrol ediliyor...' : 'Satın alımı geri yükle'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <View style={styles.crownContainer}>
              <View style={styles.crownCircle}>
                <Crown color="#FFD700" size={40} />
              </View>
            </View>

            <Text style={styles.title}>KPSS Tarih Premium</Text>
            <Text style={styles.subtitle}>
              Tüm konulara sınırsız erişim ile sınavına en iyi şekilde hazırlan
            </Text>

            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                    <feature.icon color={feature.color} size={18} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.priceCard}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Tek Seferlik</Text>
              </View>
              <View style={styles.priceRow}>
                <View style={styles.priceRadioSelected}>
                  <Check color={Colors.white} size={12} />
                </View>
                <View style={styles.priceInfo}>
                  <Text style={styles.priceTitle}>Ömür Boyu Erişim</Text>
                  <Text style={styles.priceSavings}>Abonelik yok, bir kere öde</Text>
                </View>
                <Text style={styles.priceAmount}>{priceLabel}</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.purchaseButton, (isPurchasing || isLoading) && styles.purchaseButtonDisabled]}
            activeOpacity={0.8}
            onPress={handlePurchase}
            disabled={isPurchasing || isLoading}
          >
            {isPurchasing || isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Crown color={Colors.white} size={20} />
                <Text style={styles.purchaseButtonText}>
                  {priceLabel} ile Premium'a Geç
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.legalText}>
            Tek seferlik ödeme. Abonelik değildir, otomatik yenilenmez.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  crownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700' + '18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD700' + '30',
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.primary,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  priceCard: {
    flexDirection: 'column',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
    position: 'relative' as const,
  },
  priceBadge: {
    position: 'absolute' as const,
    top: -10,
    right: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRadioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  priceInfo: {
    flex: 1,
  },
  priceTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  priceSavings: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.success,
    marginTop: 2,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center' as const,
    marginTop: 10,
    lineHeight: 16,
  },
});
