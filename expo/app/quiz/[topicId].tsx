import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, XCircle, ChevronRight, RotateCcw, Trophy, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { topics } from '@/mocks/topics';
import { questions as allQuestions } from '@/mocks/questions';
import { useStudy } from '@/providers/StudyProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { QuizResult, WrongAnswer } from '@/types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { addQuizResult } = useStudy();

  const themedStyles = useMemo(() => styles(colors), [colors]);

  const topic = topics.find((t) => t.id === topicId);
  const topicQuestions = allQuestions.filter((q) => q.topicId === topicId);
  const [questions] = useState(() => shuffleArray(topicQuestions).slice(0, 10));

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [wrongAnswersList, setWrongAnswersList] = useState<WrongAnswer[]>([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (quizFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, quizFinished]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, []);

  const animateQuestion = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    animateQuestion();
  }, [currentIndex]);

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (showResult) return;

      setSelectedAnswer(index);
      setShowResult(true);

      const isCorrect = index === currentQuestion.correctAnswer;
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setWrongAnswersList((prev) => [
          ...prev,
          {
            questionId: currentQuestion.id,
            topicId: topicId ?? '',
            selectedAnswer: index,
            date: new Date().toISOString(),
            reviewedCount: 0,
          },
        ]);
      }
    },
    [showResult, currentQuestion, topicId]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalCorrect = correctCount;
      const result: QuizResult = {
        id: `quiz-${Date.now()}`,
        topicId: topicId ?? '',
        date: new Date().toISOString(),
        totalQuestions: questions.length,
        correctAnswers: finalCorrect,
        timeSpent: elapsedSeconds,
        wrongAnswerIds: wrongAnswersList.map((w) => w.questionId),
      };

      addQuizResult(result, wrongAnswersList);
      setQuizFinished(true);
    }
  }, [currentIndex, questions.length, correctCount, topicId, elapsedSeconds, addQuizResult, wrongAnswersList]);

  const getOptionStyle = useCallback(
    (index: number) => {
      if (!showResult) return themedStyles.optionDefault;
      if (index === currentQuestion.correctAnswer) return themedStyles.optionCorrect;
      if (index === selectedAnswer && index !== currentQuestion.correctAnswer) return themedStyles.optionWrong;
      return themedStyles.optionDisabled;
    },
    [showResult, currentQuestion, selectedAnswer, themedStyles]
  );

  const getOptionTextStyle = useCallback(
    (index: number) => {
      if (!showResult) return themedStyles.optionTextDefault;
      if (index === currentQuestion.correctAnswer) return themedStyles.optionTextCorrect;
      if (index === selectedAnswer && index !== currentQuestion.correctAnswer) return themedStyles.optionTextWrong;
      return themedStyles.optionTextDisabled;
    },
    [showResult, currentQuestion, selectedAnswer, themedStyles]
  );

  if (!topic || questions.length === 0) {
    return (
      <View style={themedStyles.container}>
        <SafeAreaView style={themedStyles.safeArea}>
          <Text style={themedStyles.errorText}>Bu konu için soru bulunamadı</Text>
          <TouchableOpacity style={themedStyles.backBtn} onPress={() => router.back()}>
            <Text style={themedStyles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  if (quizFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return (
      <View style={themedStyles.container}>
        <SafeAreaView edges={['top', 'bottom']} style={themedStyles.safeArea}>
          <ScrollView
            contentContainerStyle={themedStyles.resultContainer}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                themedStyles.resultCircle,
                {
                  backgroundColor:
                    accuracy >= 70 ? colors.success + '15' : accuracy >= 50 ? colors.warning + '15' : colors.error + '15',
                },
              ]}
            >
              <Trophy
                color={accuracy >= 70 ? colors.success : accuracy >= 50 ? colors.warning : colors.error}
                size={48}
              />
            </View>

            <Text style={themedStyles.resultTitle}>Test Tamamlandı!</Text>
            <Text style={themedStyles.resultTopicName}>{topic.title}</Text>

            <Text
              style={[
                themedStyles.resultAccuracy,
                {
                  color: accuracy >= 70 ? colors.success : accuracy >= 50 ? colors.warning : colors.error,
                },
              ]}
            >
              %{accuracy}
            </Text>

            <View style={themedStyles.resultStats}>
              <View style={themedStyles.resultStat}>
                <Text style={[themedStyles.resultStatValue, { color: colors.success }]}>{correctCount}</Text>
                <Text style={themedStyles.resultStatLabel}>Doğru</Text>
              </View>
              <View style={themedStyles.resultStatDivider} />
              <View style={themedStyles.resultStat}>
                <Text style={[themedStyles.resultStatValue, { color: colors.error }]}>
                  {questions.length - correctCount}
                </Text>
                <Text style={themedStyles.resultStatLabel}>Yanlış</Text>
              </View>
              <View style={themedStyles.resultStatDivider} />
              <View style={themedStyles.resultStat}>
                <Text style={themedStyles.resultStatValue}>
                  {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
                <Text style={themedStyles.resultStatLabel}>Süre</Text>
              </View>
            </View>

            {wrongAnswersList.length > 0 && (
              <TouchableOpacity
                style={[themedStyles.resultButton, { backgroundColor: colors.error + '12', borderWidth: 1, borderColor: colors.error + '30' }]}
                onPress={() => router.push('/wrong-answers' as any)}
                activeOpacity={0.8}
              >
                <XCircle color={colors.error} size={18} />
                <Text style={[themedStyles.resultButtonText, { color: colors.error }]}>
                  Yanlışları İncele ({wrongAnswersList.length})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[themedStyles.resultButton, { backgroundColor: topic.color }]}
              onPress={() => {
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCorrectCount(0);
                setQuizFinished(false);
                setWrongAnswersList([]);
                setElapsedSeconds(0);
              }}
              activeOpacity={0.8}
            >
              <RotateCcw color={colors.white} size={18} />
              <Text style={themedStyles.resultButtonText}>Tekrar Çöz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.resultBackButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={themedStyles.resultBackText}>Konuya Dön</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={themedStyles.safeArea}>
        <View style={themedStyles.quizHeader}>
          <Pressable style={themedStyles.closeButton} onPress={() => router.back()} hitSlop={12}>
            <X color={colors.textSecondary} size={22} />
          </Pressable>
          <View style={themedStyles.progressInfo}>
            <Text style={themedStyles.progressText}>{currentIndex + 1}/{questions.length}</Text>
          </View>
          <View style={themedStyles.timerBadge}>
            <Clock color={colors.accent} size={13} />
            <Text style={themedStyles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        <View style={themedStyles.progressBarContainer}>
          <View style={themedStyles.progressBarBg}>
            <View
              style={[themedStyles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: topic.color }]}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themedStyles.quizContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={themedStyles.questionText}>{currentQuestion.text}</Text>

            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[themedStyles.optionButton, getOptionStyle(index)]}
                activeOpacity={showResult ? 1 : 0.7}
                onPress={() => handleSelectAnswer(index)}
                disabled={showResult}
              >
                <View style={themedStyles.optionLetter}>
                  <Text style={[themedStyles.optionLetterText, getOptionTextStyle(index)]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[themedStyles.optionText, getOptionTextStyle(index)]}>{option}</Text>
                {showResult && index === currentQuestion.correctAnswer && (
                  <Check color={colors.success} size={20} />
                )}
                {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <XCircle color={colors.error} size={20} />
                )}
              </TouchableOpacity>
            ))}

            {showResult && (
              <View style={themedStyles.explanationCard}>
                <Text style={themedStyles.explanationTitle}>Açıklama</Text>
                <Text style={themedStyles.explanationText}>{currentQuestion.explanation}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {showResult && (
          <View style={themedStyles.nextButtonContainer}>
            <TouchableOpacity
              style={[themedStyles.nextButton, { backgroundColor: topic.color }]}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={themedStyles.nextButtonText}>
                {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
              </Text>
              <ChevronRight color={colors.white} size={20} />
            </TouchableOpacity>
          </View>
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
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  quizContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  optionDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  optionCorrect: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success,
  },
  optionWrong: {
    backgroundColor: colors.error + '15',
    borderColor: colors.error,
  },
  optionDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.5,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  optionTextDefault: {
    color: colors.text,
  },
  optionTextCorrect: {
    color: colors.success,
  },
  optionTextWrong: {
    color: colors.error,
  },
  optionTextDisabled: {
    color: colors.textLight,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: colors.accent + '10',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.accent,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  nextButtonContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 36,
    paddingTop: 12,
    backgroundColor: colors.background,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 14,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  resultContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  resultCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 4,
  },
  resultTopicName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  resultAccuracy: {
    fontSize: 56,
    fontWeight: '800' as const,
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  resultStatLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '500' as const,
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  resultBackButton: {
    padding: 12,
  },
  resultBackText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  backBtn: {
    marginTop: 16,
    alignSelf: 'center',
    padding: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
});
