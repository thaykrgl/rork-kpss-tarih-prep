import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Clock, CheckCircle2, XCircle, Info, Timer, Trophy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { questions as allQuestions } from '@/mocks/questions';
import { useTheme } from '@/providers/ThemeProvider';
import { useStudy } from '@/providers/StudyProvider';

const { width } = Dimensions.get('window');

const EXAM_QUESTION_COUNT = 27;
const EXAM_DURATION = 40 * 60; // 40 minutes in seconds

export default function MockExamScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addDailyProgress } = useStudy();
  
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [examQuestions, setExamQuestions] = useState<typeof allQuestions>([]);
  
  const themedStyles = useMemo(() => styles(colors), [colors]);

  const startExam = useCallback(() => {
    // Shuffle and pick 27 questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, EXAM_QUESTION_COUNT));
    setExamStarted(true);
    setTimeLeft(EXAM_DURATION);
    setAnswers({});
    setCurrentIdx(0);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (examStarted && !examFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examFinished, timeLeft]);

  const finishExam = () => {
    setExamFinished(true);
    // Calculate and save results
    const results = examQuestions.map((q, idx) => ({
      isCorrect: answers[idx] === q.correctAnswer,
      isAnswered: answers[idx] !== undefined,
    }));
    
    const correctCount = results.filter(r => r.isCorrect).length;
    addDailyProgress(results.length, correctCount);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!examStarted) {
    return (
      <View style={themedStyles.container}>
        <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
          <View style={themedStyles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <Text style={themedStyles.title}>KPSS Deneme Modu</Text>
          </View>
          <View style={themedStyles.introCard}>
            <Timer size={48} color={colors.primary} />
            <Text style={themedStyles.introTitle}>Gerçek Deneme Deneyimi</Text>
            <Text style={themedStyles.introDesc}>
              Bu modda karışık konulardan {EXAM_QUESTION_COUNT} soru sorulacaktır. Süreniz 40 dakikadır.
            </Text>
            <View style={themedStyles.infoBox}>
              <Info size={16} color={colors.primary} />
              <Text style={themedStyles.infoText}>Sorular tüm tarih müfredatını kapsar.</Text>
            </View>
            <TouchableOpacity style={themedStyles.startBtn} onPress={startExam}>
              <Text style={themedStyles.startBtnText}>Denemeyi Başlat</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (examFinished) {
    const correct = examQuestions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const wrong = examQuestions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correctAnswer).length;
    const blank = EXAM_QUESTION_COUNT - (correct + wrong);
    const net = correct - (wrong * 0.25);

    return (
      <View style={themedStyles.container}>
        <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
          <Text style={themedStyles.resultsTitle}>Deneme Sonucu</Text>
          <View style={themedStyles.resultGrid}>
            <View style={themedStyles.resultItem}>
              <Text style={[themedStyles.resultVal, { color: colors.success }]}>{correct}</Text>
              <Text style={themedStyles.resultLabel}>Doğru</Text>
            </View>
            <View style={themedStyles.resultItem}>
              <Text style={[themedStyles.resultVal, { color: colors.error }]}>{wrong}</Text>
              <Text style={themedStyles.resultLabel}>Yanlış</Text>
            </View>
            <View style={themedStyles.resultItem}>
              <Text style={[themedStyles.resultVal, { color: colors.textSecondary }]}>{blank}</Text>
              <Text style={themedStyles.resultLabel}>Boş</Text>
            </View>
            <View style={themedStyles.break} />
            <View style={themedStyles.netBox}>
              <Text style={themedStyles.netValue}>{net.toFixed(2)}</Text>
              <Text style={themedStyles.netLabel}>Net Puan</Text>
            </View>
          </View>
          <TouchableOpacity style={themedStyles.finishBtn} onPress={() => router.back()}>
            <Text style={themedStyles.finishBtnText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const currentQ = examQuestions[currentIdx];

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.examHeader}>
          <Text style={themedStyles.questionCounter}>Soru {currentIdx + 1}/{EXAM_QUESTION_COUNT}</Text>
          <View style={themedStyles.timerBox}>
            <Clock size={16} color={timeLeft < 300 ? colors.error : colors.textSecondary} />
            <Text style={[themedStyles.timerText, timeLeft < 300 && { color: colors.error }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Bitir', 'Denemeyi bitirmek istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Bitir', onPress: finishExam }
          ])}>
            <Text style={themedStyles.finishLink}>Bitir</Text>
          </TouchableOpacity>
        </View>

        <View style={themedStyles.progressContainer}>
          <View style={[themedStyles.progressFill, { width: `${(currentIdx / EXAM_QUESTION_COUNT) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={themedStyles.questionScroll}>
          <Text style={themedStyles.questionText}>{currentQ.text}</Text>
          {currentQ.options.map((opt, i) => {
            const isSelected = answers[currentIdx] === i;
            return (
              <TouchableOpacity
                key={i}
                style={[themedStyles.option, isSelected && themedStyles.optionSelected]}
                onPress={() => setAnswers({ ...answers, [currentIdx]: i })}
              >
                <View style={[themedStyles.optionBullet, isSelected && themedStyles.optionBulletSelected]}>
                  <Text style={[themedStyles.optionBulletText, isSelected && themedStyles.optionBulletTextSelected]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[themedStyles.optionText, isSelected && themedStyles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={themedStyles.navBar}>
          <TouchableOpacity 
            style={[themedStyles.navBtn, currentIdx === 0 && { opacity: 0.3 }]}
            onPress={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
            disabled={currentIdx === 0}
          >
            <Text style={themedStyles.navBtnText}>Geri</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={themedStyles.navBtnPrimary}
            onPress={() => {
              if (currentIdx < EXAM_QUESTION_COUNT - 1) {
                setCurrentIdx(currentIdx + 1);
              } else {
                Alert.alert('Tamamla', 'Bu son soruydu. Denemeyi bitirmek istiyor musunuz?', [
                  { text: 'Kontrol Et', style: 'cancel' },
                  { text: 'Bitir', onPress: finishExam }
                ]);
              }
            }}
          >
            <Text style={themedStyles.navBtnPrimaryText}>
              {currentIdx === EXAM_QUESTION_COUNT - 1 ? 'Sınavı Bitir' : 'İleri'}
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    gap: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  introCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.primary,
    textAlign: 'center',
  },
  introDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  startBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  startBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  questionCounter: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  finishLink: {
    color: colors.error,
    fontWeight: '700' as const,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  questionScroll: {
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    lineHeight: 26,
    marginBottom: 25,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionBulletSelected: {
    backgroundColor: colors.primary,
  },
  optionBulletText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  optionBulletTextSelected: {
    color: colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: '600' as const,
    color: colors.primary,
  },
  navBar: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  navBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textSecondary,
  },
  navBtnPrimary: {
    flex: 2,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  navBtnPrimaryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 20,
    justifyContent: 'center',
  },
  resultItem: {
    width: (width - 80) / 3,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultVal: {
    fontSize: 24,
    fontWeight: '800' as const,
  },
  resultLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  break: {
    width: '100%',
  },
  netBox: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  netValue: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: colors.white,
  },
  netLabel: {
    fontSize: 14,
    color: colors.white + '90',
    fontWeight: '600' as const,
  },
  finishBtn: {
    backgroundColor: colors.accent,
    margin: 40,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  finishBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
