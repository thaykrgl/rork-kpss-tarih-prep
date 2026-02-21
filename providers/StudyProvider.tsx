import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { QuizResult, UserProgress, WrongAnswer, StudyNote, DailyStudy } from '@/types';

const STORAGE_KEY = 'kpss_user_progress';

const defaultProgress: UserProgress = {
  completedQuizzes: [],
  bookmarkedTopics: [],
  bookmarkedSubtopics: [],
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  wrongAnswers: [],
  notes: [],
  dailyStudy: [],
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  dailyGoal: 10,
  notificationsEnabled: true,
  reminderTime: { hour: 20, minute: 0 },
  theme: 'system',
};

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function calcStreak(dailyStudy: DailyStudy[], lastStudyDate: string, currentStreak: number): { streak: number; longest: number; longestStreak: number } {
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastStudyDate === today) {
    return { streak: currentStreak, longest: currentStreak, longestStreak: currentStreak };
  }

  if (lastStudyDate === yesterday) {
    const newStreak = currentStreak + 1;
    return { streak: newStreak, longest: newStreak, longestStreak: newStreak };
  }

  return { streak: 1, longest: 1, longestStreak: 1 };
}

export const [StudyProvider, useStudy] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);

  const progressQuery = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as UserProgress) : defaultProgress;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (newProgress: UserProgress) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });

  useEffect(() => {
    if (progressQuery.data) {
      const data = { ...defaultProgress, ...progressQuery.data };
      if (!data.wrongAnswers) data.wrongAnswers = [];
      if (!data.notes) data.notes = [];
      if (!data.dailyStudy) data.dailyStudy = [];
      setProgress(data);
    }
  }, [progressQuery.data]);

  const save = useCallback((updated: UserProgress) => {
    setProgress(updated);
    saveMutation.mutate(updated);
  }, [saveMutation]);

  const toggleBookmarkTopic = useCallback((topicId: string) => {
    setProgress((prev) => {
      const isBookmarked = prev.bookmarkedTopics.includes(topicId);
      const updated = {
        ...prev,
        bookmarkedTopics: isBookmarked
          ? prev.bookmarkedTopics.filter((id) => id !== topicId)
          : [...prev.bookmarkedTopics, topicId],
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const toggleBookmarkSubtopic = useCallback((subtopicId: string) => {
    setProgress((prev) => {
      const isBookmarked = prev.bookmarkedSubtopics.includes(subtopicId);
      const updated = {
        ...prev,
        bookmarkedSubtopics: isBookmarked
          ? prev.bookmarkedSubtopics.filter((id) => id !== subtopicId)
          : [...prev.bookmarkedSubtopics, subtopicId],
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const updateDailyStudy = useCallback((questionsCount: number, correctCount: number, timeSpent: number) => {
    const today = getTodayStr();
    setProgress((prev) => {
      const existingIndex = (prev.dailyStudy || []).findIndex((d) => d.date === today);
      const dailyStudy = [...(prev.dailyStudy || [])];

      if (existingIndex >= 0) {
        dailyStudy[existingIndex] = {
          ...dailyStudy[existingIndex],
          questionsAnswered: dailyStudy[existingIndex].questionsAnswered + questionsCount,
          correctAnswers: dailyStudy[existingIndex].correctAnswers + correctCount,
          timeSpent: dailyStudy[existingIndex].timeSpent + timeSpent,
          quizzesCompleted: dailyStudy[existingIndex].quizzesCompleted + 1,
        };
      } else {
        dailyStudy.push({
          date: today,
          questionsAnswered: questionsCount,
          correctAnswers: correctCount,
          timeSpent,
          quizzesCompleted: 1,
        });
      }

      const { streak, longestStreak } = calcStreak(dailyStudy, prev.lastStudyDate, prev.currentStreak);

      const updated: UserProgress = {
        ...prev,
        dailyStudy: dailyStudy.slice(-30),
        currentStreak: streak,
        longestStreak: Math.max(prev.longestStreak || 0, longestStreak),
        lastStudyDate: today,
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const addDailyProgress = useCallback((questionsCount: number, correctCount: number) => {
    updateDailyStudy(questionsCount, correctCount, 0);
  }, [updateDailyStudy]);

  const addQuizResult = useCallback((result: QuizResult, wrongAnswersList?: WrongAnswer[]) => {
    setProgress((prev) => {
      const updated: UserProgress = {
        ...prev,
        completedQuizzes: [result, ...prev.completedQuizzes],
        totalQuestionsAnswered: prev.totalQuestionsAnswered + result.totalQuestions,
        totalCorrectAnswers: prev.totalCorrectAnswers + result.correctAnswers,
        wrongAnswers: wrongAnswersList
          ? [...(prev.wrongAnswers || []), ...wrongAnswersList]
          : (prev.wrongAnswers || []),
      };
      saveMutation.mutate(updated);
      return updated;
    });
    updateDailyStudy(result.totalQuestions, result.correctAnswers, result.timeSpent);
  }, [saveMutation, updateDailyStudy]);

  const removeWrongAnswer = useCallback((questionId: string) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        wrongAnswers: (prev.wrongAnswers || []).filter((w) => w.questionId !== questionId),
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const markWrongAnswerReviewed = useCallback((questionId: string) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        wrongAnswers: (prev.wrongAnswers || []).map((w) =>
          w.questionId === questionId
            ? { ...w, reviewedCount: w.reviewedCount + 1 }
            : w
        ),
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const addNote = useCallback((note: StudyNote) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        notes: [note, ...(prev.notes || [])],
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const updateNote = useCallback((noteId: string, text: string) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        notes: (prev.notes || []).map((n) =>
          n.id === noteId ? { ...n, text, updatedAt: new Date().toISOString() } : n
        ),
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const deleteNote = useCallback((noteId: string) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        notes: (prev.notes || []).filter((n) => n.id !== noteId),
      };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const setDailyGoal = useCallback((goal: number) => {
    setProgress((prev) => {
      const updated = { ...prev, dailyGoal: goal };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const toggleNotifications = useCallback((enabled: boolean) => {
    setProgress((prev) => {
      const updated = { ...prev, notificationsEnabled: enabled };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const setReminderTime = useCallback((hour: number, minute: number) => {
    setProgress((prev) => {
      const updated = { ...prev, reminderTime: { hour, minute } };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setProgress((prev) => {
      const updated = { ...prev, theme };
      saveMutation.mutate(updated);
      return updated;
    });
  }, [saveMutation]);

  const resetProgress = useCallback(() => {
    save(defaultProgress);
  }, [save]);

  const isTopicBookmarked = useCallback(
    (topicId: string) => progress.bookmarkedTopics.includes(topicId),
    [progress.bookmarkedTopics]
  );

  const isSubtopicBookmarked = useCallback(
    (subtopicId: string) => progress.bookmarkedSubtopics.includes(subtopicId),
    [progress.bookmarkedSubtopics]
  );

  const getTopicQuizResults = useCallback(
    (topicId: string) =>
      progress.completedQuizzes.filter((q) => q.topicId === topicId),
    [progress.completedQuizzes]
  );

  const getSubtopicNotes = useCallback(
    (subtopicId: string) =>
      (progress.notes || []).filter((n) => n.subtopicId === subtopicId),
    [progress.notes]
  );

  const getTodayStudy = useCallback((): DailyStudy | null => {
    const today = getTodayStr();
    return (progress.dailyStudy || []).find((d) => d.date === today) ?? null;
  }, [progress.dailyStudy]);

  const overallAccuracy =
    progress.totalQuestionsAnswered > 0
      ? Math.round(
          (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
        )
      : 0;

  return {
    progress,
    isLoading: progressQuery.isLoading,
    toggleBookmarkTopic,
    toggleBookmarkSubtopic,
    addQuizResult,
    addDailyProgress,
    isTopicBookmarked,
    isSubtopicBookmarked,
    getTopicQuizResults,
    overallAccuracy,
    removeWrongAnswer,
    markWrongAnswerReviewed,
    addNote,
    updateNote,
    deleteNote,
    getSubtopicNotes,
    setDailyGoal,
    toggleNotifications,
    setReminderTime,
    setTheme,
    getTodayStudy,
    resetProgress,
  };
});
