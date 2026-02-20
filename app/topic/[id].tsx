import React, { useRef, useEffect } from 'react';
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
import Colors from '@/constants/colors';
import { topics } from '@/mocks/topics';
import { questions } from '@/mocks/questions';
import { flashcards } from '@/mocks/flashcards';
import { useStudy } from '@/providers/StudyProvider';
import { usePremium } from '@/providers/PremiumProvider';

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isTopicBookmarked,
    toggleBookmarkTopic,
    getTopicQuizResults,
  } = useStudy();
  const { isPremium, canAccessTopic } = usePremium();

  const topic = topics.find((t) => t.id === id);
  const hasAccess = topic ? canAccessTopic(topic.isPremium) : false;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Konu bulunamadı</Text>
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
    <View style={[styles.container, { backgroundColor: topic.color + '08' }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <ArrowLeft color={Colors.primary} size={22} />
          </Pressable>
          <Pressable
            style={styles.bookmarkButton}
            onPress={handleBookmark}
            hitSlop={12}
          >
            {isBookmarked ? (
              <BookmarkCheck color={Colors.accent} size={22} />
            ) : (
              <Bookmark color={Colors.textLight} size={22} />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={[
                styles.topicBanner,
                { backgroundColor: topic.color + '12' },
              ]}
            >
              <View
                style={[styles.bannerBadge, { backgroundColor: topic.color }]}
              >
                <Text style={styles.bannerBadgeText}>
                  {topic.subtopics.length} Alt Konu
                </Text>
              </View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription}>{topic.description}</Text>

              <View style={styles.topicStats}>
                <View style={styles.topicStat}>
                  <FileText color={topic.color} size={16} />
                  <Text style={styles.topicStatText}>
                    {topicQuestions.length} Soru
                  </Text>
                </View>
                <View style={styles.topicStat}>
                  <Layers color={topic.color} size={16} />
                  <Text style={styles.topicStatText}>
                    {topicFlashcards.length} Kart
                  </Text>
                </View>
                {bestScore !== null && (
                  <View style={styles.topicStat}>
                    <Play color={topic.color} size={16} />
                    <Text style={styles.topicStatText}>
                      En iyi: %{bestScore}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: topic.color }]}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: '/quiz/[topicId]' as any,
                    params: { topicId: topic.id },
                  })
                }
              >
                <Play color={Colors.white} size={18} />
                <Text style={styles.actionButtonText}>Test Çöz</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: topic.color + '12',
                    borderWidth: 1,
                    borderColor: topic.color + '30',
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
                <Text style={[styles.actionButtonText, { color: topic.color }]}>
                  Kartlar
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Alt Konular</Text>

            {topic.subtopics.map((subtopic, index) => (
              <TouchableOpacity
                key={subtopic.id}
                style={styles.subtopicCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/subtopic/[id]' as any,
                    params: { id: subtopic.id },
                  })
                }
              >
                <View style={styles.subtopicIndex}>
                  <Text
                    style={[styles.subtopicIndexText, { color: topic.color }]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.subtopicInfo}>
                  <Text style={styles.subtopicTitle}>{subtopic.title}</Text>
                  <Text style={styles.subtopicContent} numberOfLines={2}>
                    {subtopic.content}
                  </Text>
                  <Text style={styles.subtopicKeyCount}>
                    {subtopic.keyPoints.length} önemli nokta
                  </Text>
                </View>
                <ChevronRight color={Colors.textLight} size={18} />
              </TouchableOpacity>
            ))}
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
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
    color: Colors.white,
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  topicDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
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
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 14,
  },
  subtopicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  subtopicIndex: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    marginBottom: 3,
  },
  subtopicContent: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 4,
  },
  subtopicKeyCount: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});
