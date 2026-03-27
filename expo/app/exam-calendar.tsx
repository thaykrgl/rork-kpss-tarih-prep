import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Bell, Info, CheckCircle2, Clock } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { exams, Exam } from '@/mocks/exams';

export default function ExamCalendarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const themedStyles = useMemo(() => styles(colors), [colors]);

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  const getStatus = (exam: Exam) => {
    const now = new Date();
    const examDate = new Date(exam.date);
    const appStart = new Date(exam.applicationStart);
    const appEnd = new Date(exam.applicationEnd);

    if (now > examDate) return { label: 'Tamamlandı', color: colors.textLight, icon: CheckCircle2 };
    if (now >= appStart && now <= appEnd) return { label: 'Başvurular Açık', color: colors.warning, icon: Bell };
    if (now < appStart) return { label: 'Gelecek Sınav', color: colors.primary, icon: Clock };
    return { label: 'Beklemede', color: colors.textSecondary, icon: Info };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <TouchableOpacity style={themedStyles.headerBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.primary} size={22} />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle}>Sınav Takvimi 2026</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <View style={themedStyles.infoCard}>
            <Info color={colors.primary} size={20} />
            <Text style={themedStyles.infoText}>
              Sınav tarihleri ÖSYM tarafından açıklanan takvime göre güncellenmektedir. Başvuru tarihlerini kaçırmamak için bildirimlerinizi açık tutun.
            </Text>
          </View>

          {sortedExams.map((exam) => {
            const status = getStatus(exam);
            const StatusIcon = status.icon;

            return (
              <View key={exam.id} style={themedStyles.examCard}>
                <View style={[themedStyles.accentBar, { backgroundColor: exam.color }]} />
                <View style={themedStyles.examContent}>
                  <View style={themedStyles.examTop}>
                    <Text style={themedStyles.examShortTitle}>{exam.shortTitle}</Text>
                    <View style={[themedStyles.statusBadge, { backgroundColor: status.color + '15' }]}>
                      <StatusIcon color={status.color} size={12} />
                      <Text style={[themedStyles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                  
                  <Text style={themedStyles.examFullTitle}>{exam.title}</Text>
                  
                  <View style={themedStyles.dateRow}>
                    <Calendar color={colors.textLight} size={14} />
                    <Text style={themedStyles.dateLabel}>Sınav Tarihi:</Text>
                    <Text style={themedStyles.dateValue}>{formatDate(exam.date)}</Text>
                  </View>

                  <View style={themedStyles.dateRow}>
                    <Bell color={colors.textLight} size={14} />
                    <Text style={themedStyles.dateLabel}>Başvuru:</Text>
                    <Text style={themedStyles.dateValue}>
                      {formatDate(exam.applicationStart)} - {formatDate(exam.applicationEnd)}
                    </Text>
                  </View>

                  <View style={themedStyles.dateRow}>
                    <CheckCircle2 color={colors.textLight} size={14} />
                    <Text style={themedStyles.dateLabel}>Sonuçlar:</Text>
                    <Text style={themedStyles.dateValue}>{formatDate(exam.resultsDate)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '15',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  examCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accentBar: {
    width: 6,
    height: '100%',
  },
  examContent: {
    flex: 1,
    padding: 16,
  },
  examTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examShortTitle: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  examFullTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    width: 90,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
});
