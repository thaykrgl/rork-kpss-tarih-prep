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
import { useStudy } from '@/providers/StudyProvider';
import { usePremium } from '@/providers/PremiumProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { topics } from '@/mocks/topics';
import { flashcards } from '@/mocks/flashcards';

export default function StudyScreen() {
  const router = useRouter();
  const { progress, getTodayStudy } = useStudy();
  const { isPremium } = usePremium();
  const { colors } = useTheme();
  const todayStudy = getTodayStudy();

  const wrongCount = (progress.wrongAnswers || []).length;

  const topicFlashcardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const fc of flashcards) {
      counts[fc.topicId] = (counts[fc.topicId] || 0) + 1;
    }
    return counts;
  }, []);

  const themedStyles = useMemo(() => styles(colors), [colors]);

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <Text style={themedStyles.title}>Çalışma</Text>
          <Text style={themedStyles.subtitle}>Konuları pekiştir, kartları çalış</Text>

          <View style={themedStyles.quickActions}>
            <TouchableOpacity
              style={themedStyles.actionCard}
              activeOpacity={0.7}
              onPress={() => router.push('/wrong-answers' as any)}
            >
              <View style={[themedStyles.actionIcon, { backgroundColor: colors.error + '12' }]}>
                <XCircle color={colors.error} size={22} />
              </View>
              <Text style={themedStyles.actionTitle}>Yanlış Cevaplar</Text>
              <Text style={themedStyles.actionCount}>
                {wrongCount} soru
              </Text>
            </TouchableOpacity>

            <View style={themedStyles.actionCard}>
              <View style={[themedStyles.actionIcon, { backgroundColor: colors.accent + '15' }]}>
                <Target color={colors.accent} size={22} />
              </View>
              <Text style={themedStyles.actionTitle}>Günlük Hedef</Text>
              <Text style={themedStyles.actionCount}>
                {todayStudy?.questionsAnswered ?? 0}/{progress.dailyGoal || 10}
              </Text>
            </View>
          </View>

          <View style={themedStyles.streakCard}>
            <View style={themedStyles.streakRow}>
              <Flame color="#FF6B35" size={24} />
              <View style={themedStyles.streakInfo}>
                <Text style={themedStyles.streakValue}>{progress.currentStreak || 0} Gün</Text>
                <Text style={themedStyles.streakLabel}>Mevcut Seri</Text>
              </View>
            </View>
            <View style={themedStyles.streakDivider} />
            <View style={themedStyles.streakRow}>
              <Brain color={colors.primary} size={24} />
              <View style={themedStyles.streakInfo}>
                <Text style={themedStyles.streakValue}>{todayStudy?.questionsAnswered ?? 0}</Text>
                <Text style={themedStyles.streakLabel}>Bugün Çözülen</Text>
              </View>
            </View>
          </View>

          <View style={themedStyles.sectionHeader}>
            <Layers color={colors.primary} size={18} />
            <Text style={themedStyles.sectionTitle}>Bilgi Kartları</Text>
          </View>
          <Text style={themedStyles.sectionSub}>Konulara göre kartları çalışarak bilgini pekiştir</Text>

          {topics.map((topic) => {
            const cardCount = topicFlashcardCounts[topic.id] || 0;
            if (cardCount === 0) return null;
            const isLocked = topic.isPremium && !isPremium;

            return (
              <TouchableOpacity
                key={topic.id}
                style={[themedStyles.flashcardRow, isLocked && { opacity: 0.6 }]}
                activeOpacity={0.7}
                onPress={() => {
                  if (isLocked) {
                    router.push('/paywall' as any);
                    return;
                  }
                  router.push({ pathname: '/flashcards/[topicId]' as any, params: { topicId: topic.id } });
                }}
              >
                <View style={[themedStyles.flashcardDot, { backgroundColor: isLocked ? colors.textLight : topic.color }]} />
                <View style={themedStyles.flashcardInfo}>
                  <Text style={themedStyles.flashcardTitle}>{topic.title}</Text>
                  <Text style={themedStyles.flashcardCount}>{cardCount} kart</Text>
                </View>
                {isLocked ? (
                  <Lock color={colors.textLight} size={16} />
                ) : (
                  <ChevronRight color={colors.textLight} size={18} />
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.cardShadow,
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
    color: colors.text,
  },
  actionCount: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: colors.cardShadow,
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
    backgroundColor: colors.borderLight,
    marginHorizontal: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.text,
  },
  streakLabel: {
    fontSize: 11,
    color: colors.textLight,
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
    color: colors.primary,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  flashcardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: colors.cardShadow,
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
    color: colors.text,
  },
  flashcardCount: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
});
