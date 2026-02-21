export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  subtopics: Subtopic[];
  questionCount: number;
  isPremium: boolean;
}

export interface Subtopic {
  id: string;
  topicId: string;
  title: string;
  content: string;
  keyPoints: string[];
}

export interface Question {
  id: string;
  topicId: string;
  subtopicId?: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  id: string;
  topicId: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  wrongAnswerIds?: string[];
}

export interface WrongAnswer {
  questionId: string;
  topicId: string;
  selectedAnswer: number;
  date: string;
  reviewedCount: number;
}

export interface StudyNote {
  id: string;
  subtopicId: string;
  topicId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyStudy {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  timeSpent: number;
  quizzesCompleted: number;
}

export interface UserProgress {
  completedQuizzes: QuizResult[];
  bookmarkedTopics: string[];
  bookmarkedSubtopics: string[];
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  wrongAnswers: WrongAnswer[];
  notes: StudyNote[];
  dailyStudy: DailyStudy[];
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  dailyGoal: number;
  notificationsEnabled?: boolean;
  reminderTime?: { hour: number; minute: number };
  theme?: 'light' | 'dark' | 'system';
  flashcardProgress?: Record<string, FlashcardProgress>;
}

export type FlashcardScore = 1 | 3 | 5; // 1: Bilmiyorum, 3: Şüpheliyim, 5: Biliyorum

export interface FlashcardProgress {
  cardId: string;
  nextReviewDate: string;
  interval: number; // in days
  easeFactor: number;
  repetition: number;
  lastScore: FlashcardScore;
}

export interface Flashcard {
  id: string;
  topicId: string;
  subtopicId: string;
  front: string;
  back: string;
}

export interface PremiumPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  badge?: string;
  savings?: string;
}
