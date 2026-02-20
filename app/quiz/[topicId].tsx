import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import Colors from '@/constants/colors';
import { topics } from '@/mocks/topics';
import { questions as allQuestions } from '@/mocks/questions';
import { useStudy } from '@/providers/StudyProvider';
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
  const { addQuizResult } = useStudy();

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
      const finalCorrect = correctCount + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      const result: QuizResult = {
        id: `quiz-${Date.now()}`,
        topicId: topicId ?? '',
        date: new Date().toISOString(),
        totalQuestions: questions.length,
        correctAnswers: finalCorrect,
        timeSpent,
        wrongAnswerIds: wrongAnswersList.map((w) => w.questionId),
      };

      addQuizResult(result, wrongAnswersList);
      setQuizFinished(true);
    }
  }, [currentIndex, questions.length, correctCount, selectedAnswer, currentQuestion, topicId, startTime, addQuizResult, wrongAnswersList]);

  const getOptionStyle = useCallback(
    (index: number) => {
      if (!showResult) return styles.optionDefault;
      if (index === currentQuestion.correctAnswer) return styles.optionCorrect;
      if (index === selectedAnswer && index !== currentQuestion.correctAnswer) return styles.optionWrong;
      return styles.optionDisabled;
    },
    [showResult, currentQuestion, selectedAnswer]
  );

  const getOptionTextStyle = useCallback(
    (index: number) => {
      if (!showResult) return styles.optionTextDefault;
      if (index === currentQuestion.correctAnswer) return styles.optionTextCorrect;
      if (index === selectedAnswer && index !== currentQuestion.correctAnswer) return styles.optionTextWrong;
      return styles.optionTextDisabled;
    },
    [showResult, currentQuestion, selectedAnswer]
  );

  if (!topic || questions.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Bu konu için soru bulunamadı</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  if (quizFinished) {
    const finalCorrect = correctCount;
    const accuracy = Math.round((finalCorrect / questions.length) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.resultContainer}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.resultCircle,
                {
                  backgroundColor:
                    accuracy >= 70 ? Colors.successLight : accuracy >= 50 ? Colors.warningLight : Colors.errorLight,
                },
              ]}
            >
              <Trophy
                color={accuracy >= 70 ? Colors.success : accuracy >= 50 ? Colors.warning : Colors.error}
                size={48}
              />
            </View>

            <Text style={styles.resultTitle}>Test Tamamlandı!</Text>
            <Text style={styles.resultTopicName}>{topic.title}</Text>

            <Text
              style={[
                styles.resultAccuracy,
                {
                  color: accuracy >= 70 ? Colors.success : accuracy >= 50 ? Colors.warning : Colors.error,
                },
              ]}
            >
              %{accuracy}
            </Text>

            <View style={styles.resultStats}>
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatValue, { color: Colors.success }]}>{finalCorrect}</Text>
                <Text style={styles.resultStatLabel}>Doğru</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStat}>
                <Text style={[styles.resultStatValue, { color: Colors.error }]}>
                  {questions.length - finalCorrect}
                </Text>
                <Text style={styles.resultStatLabel}>Yanlış</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStat}>
                <Text style={styles.resultStatValue}>
                  {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
                <Text style={styles.resultStatLabel}>Süre</Text>
              </View>
            </View>

            {wrongAnswersList.length > 0 && (
              <TouchableOpacity
                style={[styles.resultButton, { backgroundColor: Colors.error + '12', borderWidth: 1, borderColor: Colors.error + '30' }]}
                onPress={() => router.push('/wrong-answers' as any)}
                activeOpacity={0.8}
              >
                <XCircle color={Colors.error} size={18} />
                <Text style={[styles.resultButtonText, { color: Colors.error }]}>
                  Yanlışları İncele ({wrongAnswersList.length})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: topic.color }]}
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
              <RotateCcw color={Colors.white} size={18} />
              <Text style={styles.resultButtonText}>Tekrar Çöz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resultBackButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.resultBackText}>Konuya Dön</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.quizHeader}>
          <Pressable style={styles.closeButton} onPress={() => router.back()} hitSlop={12}>
            <X color={Colors.textSecondary} size={22} />
          </Pressable>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>{currentIndex + 1}/{questions.length}</Text>
          </View>
          <View style={styles.timerBadge}>
            <Clock color={Colors.accent} size={13} />
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: topic.color }]}
            />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quizContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, getOptionStyle(index)]}
                activeOpacity={showResult ? 1 : 0.7}
                onPress={() => handleSelectAnswer(index)}
                disabled={showResult}
              >
                <View style={styles.optionLetter}>
                  <Text style={[styles.optionLetterText, getOptionTextStyle(index)]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.optionText, getOptionTextStyle(index)]}>{option}</Text>
                {showResult && index === currentQuestion.correctAnswer && (
                  <Check color={Colors.success} size={20} />
                )}
                {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <XCircle color={Colors.error} size={20} />
                )}
              </TouchableOpacity>
            ))}

            {showResult && (
              <View style={styles.explanationCard}>
                <Text style={styles.explanationTitle}>Açıklama</Text>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {showResult && (
          <View style={styles.nextButtonContainer}>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: topic.color }]}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
              </Text>
              <ChevronRight color={Colors.white} size={20} />
            </TouchableOpacity>
          </View>
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accentDark,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.borderLight,
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
    color: Colors.primary,
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
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  optionCorrect: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  optionWrong: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  optionDisabled: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    opacity: 0.5,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  optionTextDefault: {
    color: Colors.text,
  },
  optionTextCorrect: {
    color: Colors.success,
  },
  optionTextWrong: {
    color: Colors.error,
  },
  optionTextDisabled: {
    color: Colors.textLight,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: Colors.accent + '10',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accentDark,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.background,
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
    color: Colors.white,
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
    color: Colors.primary,
    marginBottom: 4,
  },
  resultTopicName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  resultAccuracy: {
    fontSize: 56,
    fontWeight: '800' as const,
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  resultStat: {
    flex: 1,
    alignItems: 'center',
  },
  resultStatDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  resultStatLabel: {
    fontSize: 11,
    color: Colors.textLight,
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
    color: Colors.white,
  },
  resultBackButton: {
    padding: 12,
  },
  resultBackText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
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
    color: Colors.primary,
  },
});
