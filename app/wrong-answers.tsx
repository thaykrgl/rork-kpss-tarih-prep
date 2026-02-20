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
import Colors from '@/constants/colors';
import { useStudy } from '@/providers/StudyProvider';
import { topics } from '@/mocks/topics';
import { questions as allQuestions } from '@/mocks/questions';

export default function WrongAnswersScreen() {
  const router = useRouter();
  const { progress, removeWrongAnswer, markWrongAnswerReviewed } = useStudy();
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.primary} size={22} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yanlış Cevaplar</Text>
          <View style={styles.headerBtn} />
        </View>

        {wrongAnswers.length === 0 && (progress.wrongAnswers || []).length === 0 ? (
          <View style={styles.emptyState}>
            <Check color={Colors.success} size={48} />
            <Text style={styles.emptyTitle}>Harika!</Text>
            <Text style={styles.emptySubtitle}>Henüz yanlış cevabınız yok. Test çözerek başlayın.</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              <TouchableOpacity
                style={[styles.filterChip, selectedTopicFilter === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedTopicFilter('all')}
              >
                <Text style={[styles.filterChipText, selectedTopicFilter === 'all' && styles.filterChipTextActive]}>
                  Tümü ({(progress.wrongAnswers || []).length})
                </Text>
              </TouchableOpacity>
              {topicsWithWrong.map((t) => {
                const count = (progress.wrongAnswers || []).filter((w) => w.topicId === t.id).length;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.filterChip,
                      selectedTopicFilter === t.id && { backgroundColor: t.color + '18', borderColor: t.color },
                    ]}
                    onPress={() => setSelectedTopicFilter(t.id)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
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
                <View key={wa.questionId + wa.date} style={styles.card}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleReview(wa.questionId)}
                    style={styles.cardHeader}
                  >
                    <View style={[styles.cardDot, { backgroundColor: topic?.color || Colors.error }]} />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardQuestion} numberOfLines={isExpanded ? undefined : 2}>
                        {question.text}
                      </Text>
                      <View style={styles.cardMeta}>
                        <Text style={styles.cardMetaText}>{topic?.title}</Text>
                        {wa.reviewedCount > 0 && (
                          <>
                            <View style={styles.cardMetaDot} />
                            <RefreshCw color={Colors.textLight} size={10} />
                            <Text style={styles.cardMetaText}>{wa.reviewedCount}x tekrar</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View style={styles.answerRow}>
                        <XCircle color={Colors.error} size={14} />
                        <Text style={styles.wrongAnswerText}>
                          Seçtiğiniz: {question.options[wa.selectedAnswer]}
                        </Text>
                      </View>
                      <View style={styles.answerRow}>
                        <Check color={Colors.success} size={14} />
                        <Text style={styles.correctAnswerText}>
                          Doğru: {question.options[question.correctAnswer]}
                        </Text>
                      </View>
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationText}>{question.explanation}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemove(wa.questionId)}
                      >
                        <Trash2 color={Colors.error} size={14} />
                        <Text style={styles.removeBtnText}>Listeden Kaldır</Text>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
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
    color: Colors.text,
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
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  cardMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textLight,
    marginHorizontal: 2,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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
    color: Colors.error,
    lineHeight: 18,
  },
  correctAnswerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.success,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  explanationBox: {
    backgroundColor: Colors.accent + '10',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  explanationText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: Colors.error,
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
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center' as const,
  },
});
