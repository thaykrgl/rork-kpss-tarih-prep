import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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
  Clock,
  Book,
  Calendar,
  BarChart3,
  Map as MapIcon,
  Zap,
} from 'lucide-react-native';
import { useStudy } from '@/providers/StudyProvider';
import { usePremium } from '@/providers/PremiumProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { topics } from '@/mocks/topics';
import { flashcards } from '@/mocks/flashcards';

const { width } = Dimensions.get('window');

export default function StudyScreen() {
  const router = useRouter();
  const { progress, getTodayStudy } = useStudy();
  const { isPremium } = usePremium();
  const { colors } = useTheme();
  const todayStudy = getTodayStudy();

  const wrongCount = (progress.wrongAnswers || []).length;

  const flashcardStats = useMemo(() => {
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
          <Text style={themedStyles.title}>Çalışma Merkezi</Text>
          <Text style={themedStyles.subtitle}>Sınava hazırlık için tüm araçlar burada</Text>

          <View style={themedStyles.quickActions}>
            <TouchableOpacity
              style={themedStyles.actionCard}
              activeOpacity={0.7}
              onPress={() => router.push('/wrong-answers' as any)}
            >
              <View style={[themedStyles.actionIcon, { backgroundColor: colors.error + '12' }]}>
                <XCircle color={colors.error} size={22} />
              </View>
              <Text style={themedStyles.actionTitle}>Yanlışlarım</Text>
              <Text style={themedStyles.actionCount}>{wrongCount} soru</Text>
            </TouchableOpacity>

            <View style={themedStyles.actionCard}>
              <View style={[themedStyles.actionIcon, { backgroundColor: colors.accent + '15' }]}>
                <Target color={colors.accent} size={22} />
              </View>
              <Text style={themedStyles.actionTitle}>Bugünkü Hedef</Text>
              <Text style={themedStyles.actionCount}>
                {todayStudy?.questionsAnswered ?? 0}/{progress.dailyGoal || 10}
              </Text>
            </View>
          </View>

          <View style={themedStyles.sectionHeader}>
            <Zap color={colors.primary} size={18} />
            <Text style={themedStyles.sectionTitle}>Akıllı Araçlar</Text>
          </View>
          <Text style={themedStyles.sectionSub}>Özel çalışma modları ile verimini artır</Text>

          <View style={themedStyles.toolsGrid}>
            <TouchableOpacity 
              style={themedStyles.toolCard}
              onPress={() => router.push('/mock-exam')}
            >
              <View style={[themedStyles.toolIcon, { backgroundColor: '#FF6B35' + '15' }]}>
                <Clock color="#FF6B35" size={24} />
              </View>
              <Text style={themedStyles.toolTitle}>Deneme Çöz</Text>
              <Text style={themedStyles.toolDesc}>27 Soru Karma</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={themedStyles.toolCard}
              onPress={() => router.push('/timeline')}
            >
              <View style={[themedStyles.toolIcon, { backgroundColor: '#2ECC71' + '15' }]}>
                <Calendar color="#2ECC71" size={24} />
              </View>
              <Text style={themedStyles.toolTitle}>Zaman Tüneli</Text>
              <Text style={themedStyles.toolDesc}>Kronolojik Akış</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={themedStyles.toolCard}
              onPress={() => router.push('/dictionary')}
            >
              <View style={[themedStyles.toolIcon, { backgroundColor: colors.primary + '15' }]}>
                <Book color={colors.primary} size={24} />
              </View>
              <Text style={themedStyles.toolTitle}>Sözlük</Text>
              <Text style={themedStyles.toolDesc}>Tarih Terimleri</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={themedStyles.toolCard}
              onPress={() => router.push('/analysis')}
            >
              <View style={[themedStyles.toolIcon, { backgroundColor: '#9B59B6' + '15' }]}>
                <BarChart3 color="#9B59B6" size={24} />
              </View>
              <Text style={themedStyles.toolTitle}>Yıl Analizi</Text>
              <Text style={themedStyles.toolDesc}>Konu Dağılımı</Text>
            </TouchableOpacity>
          </View>

          <View style={[themedStyles.sectionHeader, { marginTop: 24 }]}>
            <Layers color={colors.primary} size={18} />
            <Text style={themedStyles.sectionTitle}>Bilgi Kartları</Text>
          </View>
          <Text style={themedStyles.sectionSub}>Aktif hatırlama yöntemiyle çalış</Text>

          {topics.map((topic) => {
            const cardCount = flashcardStats[topic.id] || 0;
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
                  <Text style={themedStyles.flashcardCount}>{cardCount} kart mevcut</Text>
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
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '700' as const,
    color: colors.text,
  },
  actionCount: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 11,
    color: colors.textLight,
  },
  flashcardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
  },
  flashcardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dueText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
});
