import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Play,
  FileText,
  Layers,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { topics } from '@/mocks/topics';
import { questions } from '@/mocks/questions';
import { flashcards } from '@/mocks/flashcards';
import { useStudy } from '@/providers/StudyProvider';
import { usePremium } from '@/providers/PremiumProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    isTopicBookmarked,
    toggleBookmarkTopic,
    getTopicQuizResults,
  } = useStudy();
  const { canAccessTopic } = usePremium();

  const topic = topics.find((t) => t.id === id);
  const hasAccess = topic ? canAccessTopic(topic.isPremium) : false;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const themedStyles = useMemo(() => styles(colors), [colors]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!topic) {
    return (
      <View style={themedStyles.container}>
        <SafeAreaView style={themedStyles.safeArea}>
          <Text style={themedStyles.errorText}>Konu bulunamadı</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (!hasAccess) {
    router.replace('/paywall' as any);
    return null;
  }

  const isBookmarked = isTopicBookmarked(topic.id);
  const topicQuestions = questions.filter((q) => q.topicId === topic.id);
  const topicFlashcards = flashcards.filter((fc) => fc.topicId === topic.id);
  const quizResults = getTopicQuizResults(topic.id);
  const bestScore =
    quizResults.length > 0
      ? Math.max(
          ...quizResults.map((q) =>
            Math.round((q.correctAnswers / q.totalQuestions) * 100)
          )
        )
      : null;

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmarkTopic(topic.id);
  };

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <Pressable
            style={themedStyles.backButton}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <ArrowLeft color={colors.primary} size={22} />
          </Pressable>
          <Pressable
            style={themedStyles.bookmarkButton}
            onPress={handleBookmark}
            hitSlop={12}
          >
            {isBookmarked ? (
              <BookmarkCheck color={colors.accent} size={22} />
            ) : (
              <Bookmark color={colors.textLight} size={22} />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={[
                themedStyles.topicBanner,
                { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <View
                style={[themedStyles.bannerBadge, { backgroundColor: topic.color }]}
              >
                <Text style={themedStyles.bannerBadgeText}>
                  {topic.subtopics.length} Alt Konu
                </Text>
              </View>
              <Text style={themedStyles.topicTitle}>{topic.title}</Text>
              <Text style={themedStyles.topicDescription}>{topic.description}</Text>

              <View style={themedStyles.topicStats}>
                <View style={themedStyles.topicStat}>
                  <FileText color={topic.color} size={16} />
                  <Text style={themedStyles.topicStatText}>
                    {topicQuestions.length} Soru
                  </Text>
                </View>
                <View style={themedStyles.topicStat}>
                  <Layers color={topic.color} size={16} />
                  <Text style={themedStyles.topicStatText}>
                    {topicFlashcards.length} Kart
                  </Text>
                </View>
                {bestScore !== null && (
                  <View style={themedStyles.topicStat}>
                    <Play color={topic.color} size={16} />
                    <Text style={themedStyles.topicStatText}>
                      En iyi: %{bestScore}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={themedStyles.actionRow}>
              <TouchableOpacity
                style={[themedStyles.actionButton, { backgroundColor: topic.color }]}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/quiz/[topicId]' as any,
                    params: { topicId: topic.id },
                  })
                }
              >
                <Play color={colors.white} size={18} />
                <Text style={themedStyles.actionButtonText}>Test Çöz</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  themedStyles.actionButton,
                  {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: topic.color + '40',
                  },
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/flashcards/[topicId]' as any,
                    params: { topicId: topic.id },
                  })
                }
              >
                <Layers color={topic.color} size={18} />
                <Text style={[themedStyles.actionButtonText, { color: topic.color }]}>
                  Kartlar
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={themedStyles.sectionTitle}>Alt Konular</Text>

            {topic.subtopics.map((subtopic, index) => (
              <TouchableOpacity
                key={subtopic.id}
                style={themedStyles.subtopicCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/subtopic/[id]' as any,
                    params: { id: subtopic.id },
                  })
                }
              >
                <View style={themedStyles.subtopicIndex}>
                  <Text
                    style={[themedStyles.subtopicIndexText, { color: topic.color }]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={themedStyles.subtopicInfo}>
                  <Text style={themedStyles.subtopicTitle}>{subtopic.title}</Text>
                  <Text style={themedStyles.subtopicContent} numberOfLines={2}>
                    {subtopic.content}
                  </Text>
                  <Text style={themedStyles.subtopicKeyCount}>
                    {subtopic.keyPoints.length} önemli nokta
                  </Text>
                </View>
                <ChevronRight color={colors.textLight} size={18} />
              </TouchableOpacity>
            ))}
          </Animated.View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topicBanner: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.white,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  topicDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  topicStats: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  topicStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicStatText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 14,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 14,
  },
  subtopicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtopicIndex: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subtopicIndexText: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  subtopicInfo: {
    flex: 1,
  },
  subtopicTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 3,
  },
  subtopicContent: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 4,
  },
  subtopicKeyCount: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});
