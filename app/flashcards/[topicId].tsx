import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { topics } from '@/mocks/topics';
import { flashcards } from '@/mocks/flashcards';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FlashcardsScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();

  const topic = topics.find((t) => t.id === topicId);
  const topicCards = flashcards.filter((fc) => fc.topicId === topicId);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const flipCard = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipAnim]);

  const goToCard = useCallback((direction: 'next' | 'prev') => {
    const newIndex = direction === 'next'
      ? Math.min(currentIndex + 1, topicCards.length - 1)
      : Math.max(currentIndex - 1, 0);

    if (newIndex === currentIndex) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const slideOut = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    Animated.timing(slideAnim, {
      toValue: slideOut,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      flipAnim.setValue(0);
      setIsFlipped(false);
      setCurrentIndex(newIndex);
      slideAnim.setValue(direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });
  }, [currentIndex, topicCards.length, flipAnim, slideAnim]);

  if (!topic || topicCards.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Bu konu için kart bulunamadı</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const currentCard = topicCards[currentIndex];

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: topic.color + '08' }]}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.primary} size={22} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{topic.title}</Text>
            <Text style={styles.headerSub}>{currentIndex + 1} / {topicCards.length}</Text>
          </View>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              flipAnim.setValue(0);
              setIsFlipped(false);
              setCurrentIndex(0);
            }}
          >
            <RotateCcw color={Colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / topicCards.length) * 100}%`,
                backgroundColor: topic.color,
              },
            ]}
          />
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.cardTouchable}>
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: slideAnim },
                    { perspective: 1000 },
                    { rotateY: frontInterpolate },
                  ],
                  opacity: frontOpacity,
                  backgroundColor: Colors.surface,
                },
              ]}
            >
              <View style={[styles.cardLabel, { backgroundColor: topic.color + '15' }]}>
                <Text style={[styles.cardLabelText, { color: topic.color }]}>SORU</Text>
              </View>
              <Text style={styles.cardFrontText}>{currentCard.front}</Text>
              <Text style={styles.tapHint}>Cevabı görmek için dokun</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                {
                  transform: [
                    { translateX: slideAnim },
                    { perspective: 1000 },
                    { rotateY: backInterpolate },
                  ],
                  opacity: backOpacity,
                  backgroundColor: topic.color + '0D',
                  borderColor: topic.color + '30',
                },
              ]}
            >
              <View style={[styles.cardLabel, { backgroundColor: topic.color + '20' }]}>
                <Text style={[styles.cardLabelText, { color: topic.color }]}>CEVAP</Text>
              </View>
              <Text style={styles.cardBackText}>{currentCard.back}</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={() => goToCard('prev')}
            disabled={currentIndex === 0}
          >
            <ChevronLeft color={currentIndex === 0 ? Colors.textLight : Colors.primary} size={24} />
            <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>Önceki</Text>
          </TouchableOpacity>

          <View style={styles.dotsContainer}>
            {topicCards.slice(
              Math.max(0, currentIndex - 2),
              Math.min(topicCards.length, currentIndex + 3)
            ).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 2) + i;
              return (
                <View
                  key={actualIndex}
                  style={[
                    styles.dot,
                    actualIndex === currentIndex && { backgroundColor: topic.color, transform: [{ scale: 1.3 }] },
                  ]}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.navButton, currentIndex === topicCards.length - 1 && styles.navButtonDisabled]}
            onPress={() => goToCard('next')}
            disabled={currentIndex === topicCards.length - 1}
          >
            <Text style={[styles.navButtonText, currentIndex === topicCards.length - 1 && styles.navButtonTextDisabled]}>Sonraki</Text>
            <ChevronRight color={currentIndex === topicCards.length - 1 ? Colors.textLight : Colors.primary} size={24} />
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardTouchable: {
    width: '100%',
    height: 340,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: 340,
    borderRadius: 24,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    borderWidth: 1.5,
  },
  cardLabel: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardLabelText: {
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 1,
  },
  cardFrontText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 30,
  },
  cardBackText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  tapHint: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    color: Colors.textLight,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  navButtonTextDisabled: {
    color: Colors.textLight,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  backBtn: {
    marginTop: 16,
    alignSelf: 'center',
    padding: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
});
