import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronRight, Flame, Search, X, Lock, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { topics } from '@/mocks/topics';
import { useStudy } from '@/providers/StudyProvider';
import { usePremium } from '@/providers/PremiumProvider';
import { useTheme } from '@/providers/ThemeProvider';

const ICON_MAP: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  Castle: require('lucide-react-native').Castle,
  Crown: require('lucide-react-native').Crown,
  Shield: require('lucide-react-native').Shield,
  Star: require('lucide-react-native').Star,
  Swords: require('lucide-react-native').Swords,
  Globe: require('lucide-react-native').Globe,
  Scale: require('lucide-react-native').Scale,
  Moon: require('lucide-react-native').Moon,
  BookOpen: require('lucide-react-native').BookOpen,
  Compass: require('lucide-react-native').Compass,
  Landmark: require('lucide-react-native').Landmark,
  Flag: require('lucide-react-native').Flag,
};

export default function HomeScreen() {
  const router = useRouter();
  const { progress, overallAccuracy, getTodayStudy } = useStudy();
  const { isPremium } = usePremium();
  const { colors } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const todayStudy = getTodayStudy();

  const themedStyles = useMemo(() => styles(colors), [colors]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalQuestions = topics.reduce((sum, t) => sum + t.questionCount, 0);
  const freeTopics = topics.filter((t) => !t.isPremium);
  const premiumTopics = topics.filter((t) => t.isPremium);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtopics.some((st) => st.title.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const dailyProgress = todayStudy
    ? Math.min(Math.round((todayStudy.questionsAnswered / (progress.dailyGoal || 10)) * 100), 100)
    : 0;

  const handleTopicPress = (topicId: string, topicIsPremium: boolean) => {
    if (topicIsPremium && !isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/paywall' as any);
      return;
    }
    router.push({
      pathname: '/topic/[id]' as any,
      params: { id: topicId },
    });
  };

  const renderTopicCard = (topic: typeof topics[0], index: number) => {
    const IconComponent = ICON_MAP[topic.icon];
    const quizzes = progress.completedQuizzes.filter((q) => q.topicId === topic.id);
    const bestScore =
      quizzes.length > 0
        ? Math.max(...quizzes.map((q) => Math.round((q.correctAnswers / q.totalQuestions) * 100)))
        : null;
    const isLocked = topic.isPremium && !isPremium;

    return (
      <Animated.View
        key={topic.id}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30 + index * 4],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[themedStyles.topicCard, isLocked && themedStyles.topicCardLocked]}
          activeOpacity={0.7}
          onPress={() => handleTopicPress(topic.id, topic.isPremium)}
        >
          <View
            style={[
              themedStyles.topicIconContainer,
              { backgroundColor: isLocked ? colors.textLight + '15' : topic.color + '15' },
            ]}
          >
            {IconComponent && (
              <IconComponent color={isLocked ? colors.textLight : topic.color} size={22} />
            )}
          </View>
          <View style={themedStyles.topicInfo}>
            <View style={themedStyles.topicTitleRow}>
              <Text style={[themedStyles.topicTitle, isLocked && themedStyles.topicTitleLocked]} numberOfLines={1}>
                {topic.title}
              </Text>
              {topic.isPremium && !isPremium && (
                <View style={themedStyles.premiumBadge}>
                  <Crown color="#FFD700" size={10} />
                  <Text style={themedStyles.premiumBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={[themedStyles.topicDescription, isLocked && themedStyles.topicDescLocked]} numberOfLines={1}>
              {topic.description}
            </Text>
            <View style={themedStyles.topicMeta}>
              <Text style={themedStyles.topicMetaText}>
                {topic.subtopics.length} alt konu
              </Text>
              <View style={themedStyles.dot} />
              <Text style={themedStyles.topicMetaText}>
                {topic.questionCount} soru
              </Text>
              {bestScore !== null && (
                <>
                  <View style={themedStyles.dot} />
                  <Text
                    style={[
                      themedStyles.topicMetaText,
                      {
                        color:
                          bestScore >= 70
                            ? colors.success
                            : bestScore >= 50
                            ? colors.warning
                            : colors.error,
                      },
                    ]}
                  >
                    En iyi: %{bestScore}
                  </Text>
                </>
              )}
            </View>
          </View>
          {isLocked ? (
            <Lock color={colors.textLight} size={18} />
          ) : (
            <ChevronRight color={colors.textLight} size={20} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <Animated.View
            style={[
              themedStyles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={themedStyles.headerTop}>
              <View>
                <Text style={themedStyles.greeting}>KPSS Tarih</Text>
                <Text style={themedStyles.subtitle}>Hazırlık Platformu</Text>
              </View>
              <View style={themedStyles.headerBadges}>
                {(progress.currentStreak || 0) > 0 && (
                  <View style={themedStyles.streakBadge}>
                    <Flame color="#FF6B35" size={14} />
                    <Text style={themedStyles.streakBadgeText}>{progress.currentStreak}</Text>
                  </View>
                )}
                {isPremium ? (
                  <View style={themedStyles.proBadge}>
                    <Crown color="#FFD700" size={14} />
                    <Text style={themedStyles.proBadgeText}>PRO</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={themedStyles.upgradeBtn}
                    activeOpacity={0.7}
                    onPress={() => router.push('/paywall' as any)}
                  >
                    <Crown color="#FFD700" size={14} />
                    <Text style={themedStyles.upgradeBtnText}>Premium</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={themedStyles.dailyCard}>
              <View style={themedStyles.dailyCardTop}>
                <Text style={themedStyles.dailyLabel}>Günlük Hedef</Text>
                <Text style={themedStyles.dailyValue}>
                  {todayStudy?.questionsAnswered ?? 0}/{progress.dailyGoal || 10}
                </Text>
              </View>
              <View style={themedStyles.dailyBarBg}>
                <View style={[themedStyles.dailyBarFill, { width: `${dailyProgress}%` }]} />
              </View>
            </View>

            <View style={themedStyles.statsRow}>
              <View style={themedStyles.statCard}>
                <Text style={themedStyles.statValue}>{totalQuestions}</Text>
                <Text style={themedStyles.statLabel}>Toplam Soru</Text>
              </View>
              <View style={themedStyles.statDivider} />
              <View style={themedStyles.statCard}>
                <Text style={themedStyles.statValue}>{progress.totalQuestionsAnswered}</Text>
                <Text style={themedStyles.statLabel}>Çözülen</Text>
              </View>
              <View style={themedStyles.statDivider} />
              <View style={themedStyles.statCard}>
                <Text style={themedStyles.statValue}>%{overallAccuracy}</Text>
                <Text style={themedStyles.statLabel}>Başarı</Text>
              </View>
            </View>
          </Animated.View>

          <View style={themedStyles.searchContainer}>
            <Search color={colors.textLight} size={18} />
            <TextInput
              style={themedStyles.searchInput}
              placeholder="Konu ara..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={12}>
                <X color={colors.textLight} size={16} />
              </TouchableOpacity>
            )}
          </View>

          {searchQuery.trim() ? (
            <>
              <View style={themedStyles.sectionHeader}>
                <BookOpen color={colors.primary} size={18} />
                <Text style={themedStyles.sectionTitle}>
                  Sonuçlar ({filteredTopics.length})
                </Text>
              </View>
              {filteredTopics.length === 0 && (
                <View style={themedStyles.noResults}>
                  <Text style={themedStyles.noResultsText}>Aramanızla eşleşen konu bulunamadı</Text>
                </View>
              )}
              {filteredTopics.map((topic, index) => renderTopicCard(topic, index))}
            </>
          ) : (
            <>
              <View style={themedStyles.sectionHeader}>
                <BookOpen color={colors.primary} size={18} />
                <Text style={themedStyles.sectionTitle}>Ücretsiz Konular</Text>
              </View>
              {freeTopics.map((topic, index) => renderTopicCard(topic, index))}

              <View style={[themedStyles.sectionHeader, { marginTop: 10 }]}>
                <Crown color="#FFD700" size={18} />
                <Text style={themedStyles.sectionTitle}>Premium Konular</Text>
                {!isPremium && (
                  <TouchableOpacity
                    style={themedStyles.unlockAllBtn}
                    onPress={() => router.push('/paywall' as any)}
                  >
                    <Text style={themedStyles.unlockAllText}>Hepsini Aç</Text>
                  </TouchableOpacity>
                )}
              </View>
              {premiumTopics.map((topic, index) => renderTopicCard(topic, index + freeTopics.length))}
            </>
          )}

          <View style={themedStyles.bottomSpacer} />
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35' + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#FF6B35',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFD700' + '40',
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#B8860B',
    letterSpacing: 0.5,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  upgradeBtnText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.white,
  },
  dailyCard: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  dailyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accentLight,
  },
  dailyValue: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: colors.white,
  },
  dailyBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dailyBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
    flex: 1,
  },
  unlockAllBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  unlockAllText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.white,
  },
  noResults: {
    padding: 30,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  topicCardLocked: {
    opacity: 0.85,
  },
  topicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    flexShrink: 1,
  },
  topicTitleLocked: {
    color: colors.textSecondary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#B8860B',
    letterSpacing: 0.5,
  },
  topicDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  topicDescLocked: {
    color: colors.textLight,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicMetaText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textLight,
    marginHorizontal: 6,
  },
  bottomSpacer: {
    height: 20,
  },
});
