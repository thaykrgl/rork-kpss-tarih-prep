import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Target, CheckCircle, TrendingUp, Flame, Calendar, Clock } from 'lucide-react-native';
import { useStudy } from '@/providers/StudyProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { topics } from '@/mocks/topics';

export default function ProgressScreen() {
  const { 
    progress, 
    overallAccuracy, 
    getTodayStudy,
  } = useStudy();
  const { colors } = useTheme();
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const todayStudy = getTodayStudy();

  const themedStyles = useMemo(() => styles(colors), [colors]);

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
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <Text style={themedStyles.title}>İlerleme</Text>
          <Text style={themedStyles.subtitle}>Çalışma performansınız</Text>

          <Animated.View style={[themedStyles.mainCard, { opacity: fadeAnim }]}>
            <View style={themedStyles.accuracyHeader}>
              <Trophy color={colors.accent} size={24} />
              <Text style={themedStyles.accuracyTitle}>Genel Başarı Oranı</Text>
            </View>
            <Text style={themedStyles.accuracyValue}>%{overallAccuracy}</Text>
            <View style={themedStyles.progressBarBg}>
              <Animated.View style={[themedStyles.progressBarFill, { width: progressWidth }]} />
            </View>
            <Text style={themedStyles.accuracyHint}>
              {progress.totalQuestionsAnswered} sorudan {progress.totalCorrectAnswers} doğru
            </Text>
          </Animated.View>

          <Animated.View style={[themedStyles.streakSection, { opacity: fadeAnim }]}>
            <View style={themedStyles.streakItem}>
              <Flame color="#FF6B35" size={20} />
              <Text style={themedStyles.streakItemValue}>{progress.currentStreak || 0}</Text>
              <Text style={themedStyles.streakItemLabel}>Mevcut Seri</Text>
            </View>
            <View style={themedStyles.streakDivider} />
            <View style={themedStyles.streakItem}>
              <Calendar color={colors.primary} size={20} />
              <Text style={themedStyles.streakItemValue}>{progress.longestStreak || 0}</Text>
              <Text style={themedStyles.streakItemLabel}>En Uzun Seri</Text>
            </View>
            <View style={themedStyles.streakDivider} />
            <View style={themedStyles.streakItem}>
              <Target color={colors.accent} size={20} />
              <Text style={themedStyles.streakItemValue}>{todayStudy?.questionsAnswered ?? 0}</Text>
              <Text style={themedStyles.streakItemLabel}>Bugün</Text>
            </View>
          </Animated.View>

          <Text style={themedStyles.sectionTitle}>Haftalık Aktivite</Text>
          <View style={themedStyles.weeklyChart}>
            {weeklyData.map((day, i) => (
              <View key={i} style={themedStyles.weeklyBar}>
                <View style={themedStyles.weeklyBarOuter}>
                  <View
                    style={[
                      themedStyles.weeklyBarInner,
                      {
                        height: `${Math.max((day.count / maxWeekly) * 100, 4)}%`,
                        backgroundColor: day.count > 0 ? colors.primary : colors.borderLight,
                      },
                    ]}
                  />
                </View>
                <Text style={[themedStyles.weeklyLabel, i === 6 && { color: colors.primary, fontWeight: '700' as const }]}>
                  {day.label}
                </Text>
                {day.count > 0 && (
                  <Text style={themedStyles.weeklyCount}>{day.count}</Text>
                )}
              </View>
            ))}
          </View>

          <Animated.View style={[themedStyles.statsGrid, { opacity: fadeAnim }]}>
            <View style={themedStyles.gridItem}>
              <View style={[themedStyles.gridIcon, { backgroundColor: colors.accent + '18' }]}>
                <Target color={colors.accent} size={20} />
              </View>
              <Text style={themedStyles.gridValue}>{progress.completedQuizzes.length}</Text>
              <Text style={themedStyles.gridLabel}>Tamamlanan Test</Text>
            </View>
            <View style={themedStyles.gridItem}>
              <View style={[themedStyles.gridIcon, { backgroundColor: colors.success + '18' }]}>
                <CheckCircle color={colors.success} size={20} />
              </View>
              <Text style={themedStyles.gridValue}>{progress.totalCorrectAnswers}</Text>
              <Text style={themedStyles.gridLabel}>Doğru Cevap</Text>
            </View>
            <View style={themedStyles.gridItem}>
              <View style={[themedStyles.gridIcon, { backgroundColor: '#2E86AB18' }]}>
                <TrendingUp color="#2E86AB" size={20} />
              </View>
              <Text style={themedStyles.gridValue}>{progress.totalQuestionsAnswered}</Text>
              <Text style={themedStyles.gridLabel}>Toplam Soru</Text>
            </View>
            <View style={themedStyles.gridItem}>
              <View style={[themedStyles.gridIcon, { backgroundColor: colors.error + '18' }]}>
                <Clock size={20} color={colors.error} />
              </View>
              <Text style={themedStyles.gridValue}>
                {(progress.wrongAnswers || []).length}
              </Text>
              <Text style={themedStyles.gridLabel}>Yanlış Cevap</Text>
            </View>
          </Animated.View>

          <Text style={themedStyles.sectionTitle}>Konu Bazlı Performans</Text>

          {topics.map((topic) => {
            const quizzes = progress.completedQuizzes.filter((q) => q.topicId === topic.id);
            const totalQ = quizzes.reduce((s, q) => s + q.totalQuestions, 0);
            const totalC = quizzes.reduce((s, q) => s + q.correctAnswers, 0);
            const acc = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

            return (
              <View key={topic.id} style={themedStyles.topicRow}>
                <View style={[themedStyles.topicDot, { backgroundColor: topic.color }]} />
                <View style={themedStyles.topicRowInfo}>
                  <Text style={themedStyles.topicRowTitle}>{topic.title}</Text>
                  <View style={themedStyles.topicBarBg}>
                    <View
                      style={[
                        themedStyles.topicBarFill,
                        { width: `${acc}%`, backgroundColor: topic.color },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    themedStyles.topicRowAcc,
                    {
                      color:
                        quizzes.length === 0
                          ? colors.textLight
                          : acc >= 70
                          ? colors.success
                          : acc >= 50
                          ? colors.warning
                          : colors.error,
                    },
                  ]}
                >
                  {quizzes.length === 0 ? '—' : `%${acc}`}
                </Text>
              </View>
            );
          })}

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
  mainCard: {
    backgroundColor: colors.primary,
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
    color: colors.accentLight,
  },
  accuracyValue: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: colors.white,
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
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  accuracyHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  streakSection: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.cardShadow,
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
    color: colors.text,
  },
  streakItemLabel: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  streakDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 14,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
    marginBottom: 24,
    height: 160,
    shadowColor: colors.cardShadow,
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
    backgroundColor: colors.borderLight + '50',
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
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  weeklyCount: {
    fontSize: 9,
    color: colors.textLight,
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
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    color: colors.text,
    marginBottom: 6,
  },
  topicBarBg: {
    height: 4,
    backgroundColor: colors.borderLight,
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
  bottomSpacer: {
    height: 40,
  },
});
