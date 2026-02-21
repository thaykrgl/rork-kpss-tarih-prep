import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, HelpCircle, AlertCircle, RefreshCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { topics } from '@/mocks/topics';
import { flashcards } from '@/mocks/flashcards';
import { useTheme } from '@/providers/ThemeProvider';
import { useStudy } from '@/providers/StudyProvider';
import { FlashcardScore } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FlashcardsScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { progress, updateFlashcardProgress } = useStudy();

  const themedStyles = useMemo(() => styles(colors), [colors]);

  const topic = topics.find((t) => t.id === topicId);
  
  const topicCards = useMemo(() => {
    return flashcards.filter((fc) => fc.topicId === topicId);
  }, [topicId]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionVotes, setSessionVotes] = useState<Record<string, FlashcardScore>>({});
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [activeCards, setActiveCards] = useState<typeof flashcards>([]);

  useEffect(() => {
    if (topicCards.length > 0 && activeCards.length === 0 && !showSummary) {
      setActiveCards(topicCards);
    }
  }, [topicCards, showSummary]);

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
      ? Math.min(currentIndex + 1, activeCards.length - 1)
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
  }, [currentIndex, activeCards.length, flipAnim, slideAnim]);

  const handleVote = useCallback((score: FlashcardScore) => {
    Haptics.notificationAsync(
      score === 5 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    );
    
    const cardId = activeCards[currentIndex].id;
    updateFlashcardProgress(cardId, score);
    
    setSessionVotes(prev => ({ ...prev, [cardId]: score }));
    
    if (currentIndex < activeCards.length - 1) {
      goToCard('next');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSummary(true);
    }
  }, [currentIndex, activeCards, updateFlashcardProgress, goToCard]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    setSessionVotes({});
    setShowSummary(false);
    setActiveCards(topicCards);
  }, [flipAnim, slideAnim, topicCards]);

  const redoMistakes = useCallback(() => {
    const mistakes = activeCards.filter(card => sessionVotes[card.id] === 1);
    setActiveCards(mistakes);
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    setSessionVotes({});
    setShowSummary(false);
  }, [activeCards, sessionVotes, flipAnim, slideAnim]);

  if (!topic || topicCards.length === 0) {
    return (
      <View style={themedStyles.container}>
        <SafeAreaView style={themedStyles.safeArea}>
          <Text style={themedStyles.errorText}>Bu konu için kart bulunamadı</Text>
          <TouchableOpacity style={themedStyles.backBtn} onPress={() => router.back()}>
            <Text style={themedStyles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const currentCard = activeCards[currentIndex] || activeCards[0];
  if (!currentCard) return null;

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

  if (showSummary) {
    const counts = {
      known: Object.values(sessionVotes).filter(v => v === 5).length,
      unknown: Object.values(sessionVotes).filter(v => v === 1).length,
    };

    return (
      <View style={themedStyles.container}>
        <SafeAreaView style={themedStyles.safeArea}>
          <View style={themedStyles.header}>
            <TouchableOpacity style={themedStyles.headerBtn} onPress={() => router.back()}>
              <ArrowLeft color={colors.primary} size={22} />
            </TouchableOpacity>
            <View style={themedStyles.headerCenter}>
              <Text style={themedStyles.headerTitle}>Çalışma Özeti</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={themedStyles.summaryContent}>
            <View style={themedStyles.summaryIconContainer}>
              <View style={[themedStyles.summaryCircle, { backgroundColor: colors.success + '15' }]}>
                <CheckCircle2 color={colors.success} size={40} />
              </View>
              <Text style={themedStyles.summaryTitle}>Tebrikler!</Text>
              <Text style={themedStyles.summarySub}>Konuyu başarıyla tamamladın.</Text>
            </View>

            <View style={themedStyles.statsContainer}>
              <View style={[themedStyles.statItem, { backgroundColor: colors.successLight }]}>
                <CheckCircle2 color={colors.success} size={20} />
                <View style={themedStyles.statInfo}>
                  <Text style={themedStyles.statValue}>{counts.known}</Text>
                  <Text style={themedStyles.statLabel}>Biliyorum</Text>
                </View>
              </View>

              <View style={[themedStyles.statItem, { backgroundColor: colors.errorLight }]}>
                <AlertCircle color={colors.error} size={20} />
                <View style={themedStyles.statInfo}>
                  <Text style={themedStyles.statValue}>{counts.unknown}</Text>
                  <Text style={themedStyles.statLabel}>Bilmiyorum</Text>
                </View>
              </View>
            </View>

            <View style={themedStyles.summaryActions}>
              {counts.unknown > 0 && (
                <TouchableOpacity 
                  style={[themedStyles.summaryBtn, { backgroundColor: colors.primary }]}
                  onPress={redoMistakes}
                >
                  <RefreshCcw color={colors.white} size={20} />
                  <Text style={themedStyles.summaryBtnText}>Bilmediklerimi Tekrarla</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[themedStyles.summaryBtn, { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }]}
                onPress={resetSession}
              >
                <RotateCcw color={colors.text} size={20} />
                <Text style={[themedStyles.summaryBtnText, { color: colors.text }]}>Sıfırdan Başla</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[themedStyles.summaryBtn, { backgroundColor: 'transparent' }]}
                onPress={() => router.back()}
              >
                <Text style={[themedStyles.summaryBtnText, { color: colors.primary }]}>Çalışma Merkezine Dön</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <TouchableOpacity style={themedStyles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.primary} size={22} />
          </TouchableOpacity>
          <View style={themedStyles.headerCenter}>
            <Text style={themedStyles.headerTitle} numberOfLines={1}>{topic.title}</Text>
            <Text style={themedStyles.headerSub}>{currentIndex + 1} / {activeCards.length}</Text>
          </View>
          <TouchableOpacity
            style={themedStyles.headerBtn}
            onPress={resetSession}
          >
            <RotateCcw color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        <View style={themedStyles.progressBar}>
          <View
            style={[
              themedStyles.progressFill,
              {
                width: `${((currentIndex + 1) / activeCards.length) * 100}%`,
                backgroundColor: topic.color,
              },
            ]}
          />
        </View>

        <View style={themedStyles.cardContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={themedStyles.cardTouchable}>
            <Animated.View
              style={[
                themedStyles.card,
                {
                  transform: [
                    { translateX: slideAnim },
                    { perspective: 1000 },
                    { rotateY: frontInterpolate },
                  ],
                  opacity: frontOpacity,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={[themedStyles.cardLabel, { backgroundColor: topic.color + '15' }]}>
                <Text style={[themedStyles.cardLabelText, { color: topic.color }]}>SORU</Text>
              </View>
              <Text style={themedStyles.cardFrontText} numberOfLines={8} adjustsFontSizeToFit>{currentCard.front}</Text>
              <Text style={themedStyles.tapHint}>Cevabı görmek için dokun</Text>
            </Animated.View>

            <Animated.View
              style={[
                themedStyles.card,
                themedStyles.cardBack,
                {
                  transform: [
                    { translateX: slideAnim },
                    { perspective: 1000 },
                    { rotateY: backInterpolate },
                  ],
                  opacity: backOpacity,
                  backgroundColor: colors.surfaceAlt,
                  borderColor: topic.color + '30',
                },
              ]}
            >
              <View style={[themedStyles.cardLabel, { backgroundColor: topic.color + '20' }]}>
                <Text style={[themedStyles.cardLabelText, { color: topic.color }]}>CEVAP</Text>
              </View>
              <Text style={themedStyles.cardBackText} numberOfLines={10} adjustsFontSizeToFit>{currentCard.back}</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={themedStyles.controlsWrapper}>
          {isFlipped ? (
            <View style={themedStyles.srsButtons}>
              <View style={themedStyles.srsBtnWrapper}>
                <TouchableOpacity 
                  style={[themedStyles.srsBtn, { backgroundColor: colors.errorLight, borderColor: colors.error + '40' }]} 
                  onPress={() => handleVote(1)}
                >
                  <Text style={[themedStyles.srsBtnLabel, { color: colors.error }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Bilmiyorum</Text>
                </TouchableOpacity>
              </View>
              
              <View style={themedStyles.srsBtnWrapper}>
                <TouchableOpacity 
                  style={[themedStyles.srsBtn, { backgroundColor: colors.successLight, borderColor: colors.success + '40' }]} 
                  onPress={() => handleVote(5)}
                >
                  <Text style={[themedStyles.srsBtnLabel, { color: colors.success }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Biliyorum</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={themedStyles.controls}>
              <TouchableOpacity
                style={[themedStyles.navButton, currentIndex === 0 && themedStyles.navButtonDisabled]}
                onPress={() => goToCard('prev')}
                disabled={currentIndex === 0}
              >
                <ChevronLeft color={currentIndex === 0 ? colors.textLight : colors.primary} size={24} />
                <Text style={[themedStyles.navButtonText, currentIndex === 0 && themedStyles.navButtonTextDisabled]}>Önceki</Text>
              </TouchableOpacity>

              <View style={themedStyles.dotsContainer}>
                {activeCards.slice(
                  Math.max(0, currentIndex - 2),
                  Math.min(activeCards.length, currentIndex + 3)
                ).map((_, i) => {
                  const actualIndex = Math.max(0, currentIndex - 2) + i;
                  return (
                    <View
                      key={actualIndex}
                      style={[
                        themedStyles.dot,
                        actualIndex === currentIndex && { backgroundColor: topic.color, transform: [{ scale: 1.3 }] },
                        actualIndex !== currentIndex && { backgroundColor: colors.border },
                      ]}
                    />
                  );
                })}
              </View>

              <TouchableOpacity
                style={[themedStyles.navButton, currentIndex === activeCards.length - 1 && themedStyles.navButtonDisabled]}
                onPress={() => goToCard('next')}
                disabled={currentIndex === activeCards.length - 1}
              >
                <Text style={[themedStyles.navButtonText, currentIndex === activeCards.length - 1 && themedStyles.navButtonTextDisabled]}>Sonraki</Text>
                <ChevronRight color={currentIndex === activeCards.length - 1 ? colors.textLight : colors.primary} size={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
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
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  cardBackText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  tapHint: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    color: colors.textLight,
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
    backgroundColor: colors.surface,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.textLight,
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
  },
  controlsWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    minHeight: 100, // SRS butonları geldiğinde yüksekliğin zıplamasını engellemek için
    justifyContent: 'center',
  },
  srsButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  srsBtnWrapper: {
    flex: 1,
  },
  srsBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  srsBtnLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  summaryContent: {
    padding: 24,
    alignItems: 'center',
  },
  summaryIconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  summaryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
  },
  summarySub: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  summaryActions: {
    width: '100%',
    gap: 12,
  },
  summaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  summaryBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
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
    color: colors.primary,
  },
});
