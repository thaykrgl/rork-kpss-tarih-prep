import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Target, CheckCircle, TrendingUp, Clock, Flame, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { topics } from '@/mocks/topics';

export default function ProgressScreen() {
  const { progress, overallAccuracy, getTodayStudy } = useStudy();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const todayStudy = getTodayStudy();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: overallAccuracy / 100,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overallAccuracy]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const weeklyData = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabels = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];
      const ds = (progress.dailyStudy || []).find((d) => d.date === dateStr);
      days.push({
        label: dayLabels[date.getDay()],
        count: ds?.questionsAnswered ?? 0,
      });
    }
    return days;
  }, [progress.dailyStudy]);

  const maxWeekly = Math.max(...weeklyData.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>İlerleme</Text>
          <Text style={styles.subtitle}>Çalışma performansınız</Text>

          <Animated.View style={[styles.mainCard, { opacity: fadeAnim }]}>
            <View style={styles.accuracyHeader}>
              <Trophy color={Colors.accent} size={24} />
              <Text style={styles.accuracyTitle}>Genel Başarı Oranı</Text>
            </View>
            <Text style={styles.accuracyValue}>%{overallAccuracy}</Text>
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.accuracyHint}>
              {progress.totalQuestionsAnswered} sorudan {progress.totalCorrectAnswers} doğru
            </Text>
          </Animated.View>

          <Animated.View style={[styles.streakSection, { opacity: fadeAnim }]}>
            <View style={styles.streakItem}>
              <Flame color="#FF6B35" size={20} />
              <Text style={styles.streakItemValue}>{progress.currentStreak || 0}</Text>
              <Text style={styles.streakItemLabel}>Mevcut Seri</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Calendar color={Colors.primary} size={20} />
              <Text style={styles.streakItemValue}>{progress.longestStreak || 0}</Text>
              <Text style={styles.streakItemLabel}>En Uzun Seri</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Target color={Colors.accent} size={20} />
              <Text style={styles.streakItemValue}>{todayStudy?.questionsAnswered ?? 0}</Text>
              <Text style={styles.streakItemLabel}>Bugün</Text>
            </View>
          </Animated.View>

          <Text style={styles.sectionTitle}>Haftalık Aktivite</Text>
          <View style={styles.weeklyChart}>
            {weeklyData.map((day, i) => (
              <View key={i} style={styles.weeklyBar}>
                <View style={styles.weeklyBarOuter}>
                  <View
                    style={[
                      styles.weeklyBarInner,
                      {
                        height: `${Math.max((day.count / maxWeekly) * 100, 4)}%`,
                        backgroundColor: day.count > 0 ? Colors.primary : Colors.borderLight,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.weeklyLabel, i === 6 && { color: Colors.primary, fontWeight: '700' as const }]}>
                  {day.label}
                </Text>
                {day.count > 0 && (
                  <Text style={styles.weeklyCount}>{day.count}</Text>
                )}
              </View>
            ))}
          </View>

          <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: Colors.accent + '18' }]}>
                <Target color={Colors.accent} size={20} />
              </View>
              <Text style={styles.gridValue}>{progress.completedQuizzes.length}</Text>
              <Text style={styles.gridLabel}>Tamamlanan Test</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: Colors.success + '18' }]}>
                <CheckCircle color={Colors.success} size={20} />
              </View>
              <Text style={styles.gridValue}>{progress.totalCorrectAnswers}</Text>
              <Text style={styles.gridLabel}>Doğru Cevap</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: '#2E86AB18' }]}>
                <TrendingUp color="#2E86AB" size={20} />
              </View>
              <Text style={styles.gridValue}>{progress.totalQuestionsAnswered}</Text>
              <Text style={styles.gridLabel}>Toplam Soru</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: Colors.error + '18' }]}>
                <Clock color={Colors.error} size={20} />
              </View>
              <Text style={styles.gridValue}>
                {(progress.wrongAnswers || []).length}
              </Text>
              <Text style={styles.gridLabel}>Yanlış Cevap</Text>
            </View>
          </Animated.View>

          <Text style={styles.sectionTitle}>Konu Bazlı Performans</Text>

          {topics.map((topic) => {
            const quizzes = progress.completedQuizzes.filter((q) => q.topicId === topic.id);
            const totalQ = quizzes.reduce((s, q) => s + q.totalQuestions, 0);
            const totalC = quizzes.reduce((s, q) => s + q.correctAnswers, 0);
            const acc = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

            return (
              <View key={topic.id} style={styles.topicRow}>
                <View style={[styles.topicDot, { backgroundColor: topic.color }]} />
                <View style={styles.topicRowInfo}>
                  <Text style={styles.topicRowTitle}>{topic.title}</Text>
                  <View style={styles.topicBarBg}>
                    <View
                      style={[
                        styles.topicBarFill,
                        { width: `${acc}%`, backgroundColor: topic.color },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.topicRowAcc,
                    {
                      color:
                        quizzes.length === 0
                          ? Colors.textLight
                          : acc >= 70
                          ? Colors.success
                          : acc >= 50
                          ? Colors.warning
                          : Colors.error,
                    },
                  ]}
                >
                  {quizzes.length === 0 ? '—' : `%${acc}`}
                </Text>
              </View>
            );
          })}

          {progress.completedQuizzes.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Son Testler</Text>
              {progress.completedQuizzes.slice(0, 8).map((quiz, index) => {
                const topic = topics.find((t) => t.id === quiz.topicId);
                const acc = Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100);
                return (
                  <View key={quiz.id + index} style={styles.recentQuiz}>
                    <View style={[styles.recentDot, { backgroundColor: topic?.color || Colors.textLight }]} />
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentQuizTitle}>{topic?.title ?? 'Bilinmeyen'}</Text>
                      <Text style={styles.recentQuizDate}>
                        {new Date(quiz.date).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                    <View style={styles.recentQuizScore}>
                      <Text
                        style={[
                          styles.recentQuizAcc,
                          {
                            color: acc >= 70 ? Colors.success : acc >= 50 ? Colors.warning : Colors.error,
                          },
                        ]}
                      >
                        %{acc}
                      </Text>
                      <Text style={styles.recentQuizDetail}>
                        {quiz.correctAnswers}/{quiz.totalQuestions}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {progress.completedQuizzes.length === 0 && (
            <View style={styles.emptyState}>
              <Trophy color={Colors.textLight} size={48} />
              <Text style={styles.emptyTitle}>Henüz test çözmediniz</Text>
              <Text style={styles.emptySubtitle}>
                Konuları inceleyip test çözerek ilerlemenizi takip edin
              </Text>
            </View>
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
  mainCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  accuracyTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accentLight,
  },
  accuracyValue: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  accuracyHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  streakSection: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  streakItemValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  streakItemLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  streakDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 14,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
    marginBottom: 24,
    height: 160,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  weeklyBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  weeklyBarOuter: {
    flex: 1,
    width: 20,
    backgroundColor: Colors.borderLight + '50',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  weeklyBarInner: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  weeklyLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  weeklyCount: {
    fontSize: 9,
    color: Colors.textLight,
    fontWeight: '600' as const,
    position: 'absolute',
    top: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  gridItem: {
    width: '48%' as unknown as number,
    flexBasis: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  gridLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  topicDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  topicRowInfo: {
    flex: 1,
    marginRight: 12,
  },
  topicRowTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  topicBarBg: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  topicBarFill: {
    height: '100%',
    borderRadius: 2,
    minWidth: 2,
  },
  topicRowAcc: {
    fontSize: 15,
    fontWeight: '700' as const,
    minWidth: 36,
    textAlign: 'right' as const,
  },
  recentQuiz: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentQuizTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  recentQuizDate: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  recentQuizScore: {
    alignItems: 'flex-end',
  },
  recentQuizAcc: {
    fontSize: 17,
    fontWeight: '800' as const,
  },
  recentQuizDetail: {
    fontSize: 11,
    color: Colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  bottomSpacer: {
    height: 20,
  },
});
