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
import {
  Layers,
  XCircle,
  ChevronRight,
  Brain,
  Flame,
  Target,
  Lock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { usePremium } from '@/providers/PremiumProvider';
import { topics } from '@/mocks/topics';
import { flashcards } from '@/mocks/flashcards';

export default function StudyScreen() {
  const router = useRouter();
  const { progress, getTodayStudy } = useStudy();
  const { isPremium, canAccessTopic } = usePremium();
  const todayStudy = getTodayStudy();

  const wrongCount = (progress.wrongAnswers || []).length;

  const topicFlashcardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fc of flashcards) {
      counts[fc.topicId] = (counts[fc.topicId] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Çalışma</Text>
          <Text style={styles.subtitle}>Konuları pekiştir, kartları çalış</Text>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => router.push('/wrong-answers' as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.error + '12' }]}>
                <XCircle color={Colors.error} size={22} />
              </View>
              <Text style={styles.actionTitle}>Yanlış Cevaplar</Text>
              <Text style={styles.actionCount}>
                {wrongCount} soru
              </Text>
            </TouchableOpacity>

            <View style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Target color={Colors.accent} size={22} />
              </View>
              <Text style={styles.actionTitle}>Günlük Hedef</Text>
              <Text style={styles.actionCount}>
                {todayStudy?.questionsAnswered ?? 0}/{progress.dailyGoal || 10}
              </Text>
            </View>
          </View>

          <View style={styles.streakCard}>
            <View style={styles.streakRow}>
              <Flame color="#FF6B35" size={24} />
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{progress.currentStreak || 0} Gün</Text>
                <Text style={styles.streakLabel}>Mevcut Seri</Text>
              </View>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakRow}>
              <Brain color={Colors.primary} size={24} />
              <View style={styles.streakInfo}>
                <Text style={styles.streakValue}>{todayStudy?.questionsAnswered ?? 0}</Text>
                <Text style={styles.streakLabel}>Bugün Çözülen</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Layers color={Colors.primary} size={18} />
            <Text style={styles.sectionTitle}>Bilgi Kartları</Text>
          </View>
          <Text style={styles.sectionSub}>Konulara göre kartları çalışarak bilgini pekiştir</Text>

          {topics.map((topic) => {
            const cardCount = topicFlashcardCounts[topic.id] || 0;
            if (cardCount === 0) return null;
            const isLocked = topic.isPremium && !isPremium;

            return (
              <TouchableOpacity
                key={topic.id}
                style={[styles.flashcardRow, isLocked && { opacity: 0.6 }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (isLocked) {
                    router.push('/paywall' as any);
                    return;
                  }
                  router.push({ pathname: '/flashcards/[topicId]' as any, params: { topicId: topic.id } });
                }}
              >
                <View style={[styles.flashcardDot, { backgroundColor: isLocked ? Colors.textLight : topic.color }]} />
                <View style={styles.flashcardInfo}>
                  <Text style={styles.flashcardTitle}>{topic.title}</Text>
                  <Text style={styles.flashcardCount}>{cardCount} kart</Text>
                </View>
                {isLocked ? (
                  <Lock color={Colors.textLight} size={16} />
                ) : (
                  <ChevronRight color={Colors.textLight} size={18} />
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 40 }} />
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  actionCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  streakRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  streakLabel: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500' as const,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  sectionSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  flashcardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  flashcardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  flashcardInfo: {
    flex: 1,
  },
  flashcardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  flashcardCount: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
});
