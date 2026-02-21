import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, ChevronRight, BookOpen } from 'lucide-react-native';
import { useStudy } from '@/providers/StudyProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { topics } from '@/mocks/topics';

export default function BookmarksScreen() {
  const router = useRouter();
  const { progress } = useStudy();
  const { colors } = useTheme();

  const bookmarkedTopicsList = topics.filter((t) =>
    progress.bookmarkedTopics.includes(t.id)
  );

  const bookmarkedSubtopicsList = topics
    .flatMap((t) =>
      t.subtopics.map((st) => ({
        ...st,
        topicTitle: t.title,
        topicColor: t.color,
      }))
    )
    .filter((st) => progress.bookmarkedSubtopics.includes(st.id));

  const hasBookmarks =
    bookmarkedTopicsList.length > 0 || bookmarkedSubtopicsList.length > 0;

  const themedStyles = useMemo(() => styles(colors), [colors]);

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <Text style={themedStyles.title}>Kaydedilenler</Text>
          <Text style={themedStyles.subtitle}>Favori konularınız</Text>

          {!hasBookmarks && (
            <View style={themedStyles.emptyState}>
              <Bookmark color={colors.textLight} size={48} />
              <Text style={themedStyles.emptyTitle}>Henüz kayıt yok</Text>
              <Text style={themedStyles.emptySubtitle}>
                Konuları incelerken yer imi ekleyerek burada görüntüleyin
              </Text>
            </View>
          )}

          {bookmarkedTopicsList.length > 0 && (
            <>
              <View style={themedStyles.sectionHeader}>
                <BookOpen color={colors.primary} size={16} />
                <Text style={themedStyles.sectionTitle}>Konular</Text>
              </View>
              {bookmarkedTopicsList.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={themedStyles.card}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/topic/[id]' as any, params: { id: topic.id } })}
                >
                  <View
                    style={[
                      themedStyles.cardDot,
                      { backgroundColor: topic.color },
                    ]}
                  />
                  <View style={themedStyles.cardInfo}>
                    <Text style={themedStyles.cardTitle}>{topic.title}</Text>
                    <Text style={themedStyles.cardSub} numberOfLines={1}>
                      {topic.description}
                    </Text>
                  </View>
                  <ChevronRight color={colors.textLight} size={18} />
                </TouchableOpacity>
              ))}
            </>
          )}

          {bookmarkedSubtopicsList.length > 0 && (
            <>
              <View
                style={[
                  themedStyles.sectionHeader,
                  bookmarkedTopicsList.length > 0 && { marginTop: 20 },
                ]}
              >
                <Bookmark color={colors.primary} size={16} />
                <Text style={themedStyles.sectionTitle}>Alt Konular</Text>
              </View>
              {bookmarkedSubtopicsList.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={themedStyles.card}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({ pathname: '/subtopic/[id]' as any, params: { id: st.id } })
                  }
                >
                  <View
                    style={[
                      themedStyles.cardDot,
                      { backgroundColor: st.topicColor },
                    ]}
                  />
                  <View style={themedStyles.cardInfo}>
                    <Text style={themedStyles.cardTitle}>{st.title}</Text>
                    <Text style={themedStyles.cardSub}>{st.topicTitle}</Text>
                  </View>
                  <ChevronRight color={colors.textLight} size={18} />
                </TouchableOpacity>
              ))}
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
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  cardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center' as const,
    maxWidth: 240,
  },
  bottomSpacer: {
    height: 20,
  },
});
