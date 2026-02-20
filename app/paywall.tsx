import React, { useRef, useEffect, useState } from 'react';
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
  const { purchasePlan, restorePurchases, isPurchasing, isRestoring, plans } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
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

  const handlePurchase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    purchasePlan(selectedPlan);
    Alert.alert(
      'Premium Aktif! 🎉',
      'Tüm konulara sınırsız erişiminiz açıldı.',
      [{ text: 'Harika!', onPress: () => router.back() }]
    );
  };

  const handleRestore = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    restorePurchases();
  };

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

            <View style={styles.plansContainer}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedPlan(plan.id);
                    }}
                  >
                    {plan.badge && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <View style={styles.planRadio}>
                      {isSelected ? (
                        <View style={styles.planRadioSelected}>
                          <Check color={Colors.white} size={12} />
                        </View>
                      ) : (
                        <View style={styles.planRadioEmpty} />
                      )}
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>
                        {plan.title}
                      </Text>
                      {plan.savings && (
                        <Text style={styles.planSavings}>{plan.savings}</Text>
                      )}
                    </View>
                    <View style={styles.planPricing}>
                      <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                        {plan.price}
                      </Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
            activeOpacity={0.8}
            onPress={handlePurchase}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Crown color={Colors.white} size={20} />
                <Text style={styles.purchaseButtonText}>Premium'a Geç</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.legalText}>
            İstediğin zaman iptal edebilirsin. Abonelik otomatik yenilenir.
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
  plansContainer: {
    gap: 10,
    marginBottom: 8,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    position: 'relative' as const,
  },
  planCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '08',
  },
  planBadge: {
    position: 'absolute' as const,
    top: -10,
    right: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  planRadio: {
    marginRight: 14,
  },
  planRadioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  planTitleSelected: {
    color: Colors.primary,
  },
  planSavings: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.success,
    marginTop: 2,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  planPriceSelected: {
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500' as const,
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
