import React from 'react';
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
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { topics } from '@/mocks/topics';

export default function BookmarksScreen() {
  const router = useRouter();
  const { progress } = useStudy();

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

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Kaydedilenler</Text>
          <Text style={styles.subtitle}>Favori konularınız</Text>

          {!hasBookmarks && (
            <View style={styles.emptyState}>
              <Bookmark color={Colors.textLight} size={48} />
              <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
              <Text style={styles.emptySubtitle}>
                Konuları incelerken yer imi ekleyerek burada görüntüleyin
              </Text>
            </View>
          )}

          {bookmarkedTopicsList.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <BookOpen color={Colors.primary} size={16} />
                <Text style={styles.sectionTitle}>Konular</Text>
              </View>
              {bookmarkedTopicsList.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/topic/[id]' as any, params: { id: topic.id } })}
                >
                  <View
                    style={[
                      styles.cardDot,
                      { backgroundColor: topic.color },
                    ]}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{topic.title}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {topic.description}
                    </Text>
                  </View>
                  <ChevronRight color={Colors.textLight} size={18} />
                </TouchableOpacity>
              ))}
            </>
          )}

          {bookmarkedSubtopicsList.length > 0 && (
            <>
              <View
                style={[
                  styles.sectionHeader,
                  bookmarkedTopicsList.length > 0 && { marginTop: 20 },
                ]}
              >
                <Bookmark color={Colors.primary} size={16} />
                <Text style={styles.sectionTitle}>Alt Konular</Text>
              </View>
              {bookmarkedSubtopicsList.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({ pathname: '/subtopic/[id]' as any, params: { id: st.id } })
                  }
                >
                  <View
                    style={[
                      styles.cardDot,
                      { backgroundColor: st.topicColor },
                    ]}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{st.title}</Text>
                    <Text style={styles.cardSub}>{st.topicTitle}</Text>
                  </View>
                  <ChevronRight color={Colors.textLight} size={18} />
                </TouchableOpacity>
              ))}
            </>
          )}

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
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
    color: Colors.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.cardShadow,
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
    color: Colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center' as const,
    maxWidth: 240,
  },
  bottomSpacer: {
    height: 20,
  },
});
