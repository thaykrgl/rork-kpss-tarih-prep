import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, XCircle, Check, Trash2, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useStudy } from '@/providers/StudyProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { topics } from '@/mocks/topics';
import { questions as allQuestions } from '@/mocks/questions';

export default function WrongAnswersScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { progress, removeWrongAnswer, markWrongAnswerReviewed } = useStudy();
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const themedStyles = useMemo(() => styles(colors), [colors]);

  const wrongAnswers = useMemo(() => {
    const wa = progress.wrongAnswers || [];
    if (selectedTopicFilter === 'all') return wa;
    return wa.filter((w) => w.topicId === selectedTopicFilter);
  }, [progress.wrongAnswers, selectedTopicFilter]);

  const topicsWithWrong = useMemo(() => {
    const topicIds = new Set((progress.wrongAnswers || []).map((w) => w.topicId));
    return topics.filter((t) => topicIds.has(t.id));
  }, [progress.wrongAnswers]);

  const handleRemove = useCallback((questionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Soruyu Kaldır',
      'Bu soruyu yanlış listesinden kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: () => removeWrongAnswer(questionId) },
      ]
    );
  }, [removeWrongAnswer]);

  const handleReview = useCallback((questionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markWrongAnswerReviewed(questionId);
    setExpandedId(expandedId === questionId ? null : questionId);
  }, [markWrongAnswerReviewed, expandedId]);

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <TouchableOpacity style={themedStyles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.primary} size={22} />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle}>Yanlış Cevaplar</Text>
          <View style={themedStyles.headerBtnInvisible} />
        </View>

        {wrongAnswers.length === 0 && (progress.wrongAnswers || []).length === 0 ? (
          <View style={themedStyles.emptyState}>
            <Check color={colors.success} size={48} />
            <Text style={themedStyles.emptyTitle}>Harika!</Text>
            <Text style={themedStyles.emptySubtitle}>Henüz yanlış cevabınız yok. Test çözerek başlayın.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themedStyles.scrollContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={themedStyles.filterRow}
            >
              <TouchableOpacity
                style={[themedStyles.filterChip, selectedTopicFilter === 'all' && themedStyles.filterChipActive]}
                onPress={() => setSelectedTopicFilter('all')}
              >
                <Text style={[themedStyles.filterChipText, selectedTopicFilter === 'all' && themedStyles.filterChipTextActive]}>
                  Tümü ({(progress.wrongAnswers || []).length})
                </Text>
              </TouchableOpacity>
              {topicsWithWrong.map((t) => {
                const count = (progress.wrongAnswers || []).filter((w) => w.topicId === t.id).length;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      themedStyles.filterChip,
                      selectedTopicFilter === t.id && { backgroundColor: t.color + '18', borderColor: t.color },
                    ]}
                    onPress={() => setSelectedTopicFilter(t.id)}
                  >
                    <Text
                      style={[
                        themedStyles.filterChipText,
                        selectedTopicFilter === t.id && { color: t.color },
                      ]}
                    >
                      {t.title} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {wrongAnswers.map((wa) => {
              const question = allQuestions.find((q) => q.id === wa.questionId);
              const topic = topics.find((t) => t.id === wa.topicId);
              if (!question) return null;

              const isExpanded = expandedId === wa.questionId;

              return (
                <View key={wa.questionId + wa.date} style={themedStyles.card}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleReview(wa.questionId)}
                    style={themedStyles.cardHeader}
                  >
                    <View style={[themedStyles.cardDot, { backgroundColor: topic?.color || colors.error }]} />
                    <View style={themedStyles.cardContent}>
                      <Text style={themedStyles.cardQuestion} numberOfLines={isExpanded ? undefined : 2}>
                        {question.text}
                      </Text>
                      <View style={themedStyles.cardMeta}>
                        <Text style={themedStyles.cardMetaText}>{topic?.title}</Text>
                        {wa.reviewedCount > 0 && (
                          <>
                            <View style={themedStyles.cardMetaDot} />
                            <RefreshCw color={colors.textLight} size={10} />
                            <Text style={themedStyles.cardMetaText}>{wa.reviewedCount}x tekrar</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={themedStyles.expandedContent}>
                      <View style={themedStyles.answerRow}>
                        <XCircle color={colors.error} size={14} />
                        <Text style={themedStyles.wrongAnswerText}>
                          Seçtiğiniz: {question.options[wa.selectedAnswer]}
                        </Text>
                      </View>
                      <View style={themedStyles.answerRow}>
                        <Check color={colors.success} size={14} />
                        <Text style={themedStyles.correctAnswerText}>
                          Doğru: {question.options[question.correctAnswer]}
                        </Text>
                      </View>
                      <View style={themedStyles.explanationBox}>
                        <Text style={themedStyles.explanationText}>{question.explanation}</Text>
                      </View>
                      <TouchableOpacity
                        style={themedStyles.removeBtn}
                        onPress={() => handleRemove(wa.questionId)}
                      >
                        <Trash2 color={colors.error} size={14} />
                        <Text style={themedStyles.removeBtnText}>Listeden Kaldır</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerBtnInvisible: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  filterRow: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '12',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 6,
  },
  cardContent: {
    flex: 1,
  },
  cardQuestion: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  cardMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textLight,
    marginHorizontal: 2,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  wrongAnswerText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
  correctAnswerText: {
    flex: 1,
    fontSize: 13,
    color: colors.success,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  explanationBox: {
    backgroundColor: colors.accent + '10',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  explanationText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  removeBtnText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600' as const,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center' as const,
  },
});
