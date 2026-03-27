import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, BarChart2, PieChart, TrendingUp, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { questionDistribution } from '@/mocks/analysis';
import { useTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');

export default function AnalysisScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const themedStyles = useMemo(() => styles(colors), [colors]);

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <TouchableOpacity 
            style={themedStyles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={themedStyles.title}>Çıkmış Soru Analizi</Text>
        </View>

        <ScrollView 
          contentContainerStyle={themedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={themedStyles.introCard}>
            <TrendingUp size={32} color={colors.accent} />
            <Text style={themedStyles.introTitle}>Konu Dağılım Grafiği</Text>
            <Text style={themedStyles.introDesc}>
              ÖSYM'nin son yıllardaki KPSS Genel Kültür (Tarih) sorularının konu bazlı ortalama dağılımıdır.
            </Text>
          </View>

          <View style={themedStyles.chartCard}>
            <View style={themedStyles.chartHeader}>
              <BarChart2 size={18} color={colors.primary} />
              <Text style={themedStyles.chartTitle}>Soru Sayıları (27 Soru Üzerinden)</Text>
            </View>

            {questionDistribution.map((item, index) => (
              <View key={index} style={themedStyles.distributionRow}>
                <View style={themedStyles.rowInfo}>
                  <Text style={themedStyles.rowTopic}>{item.topic}</Text>
                  <Text style={themedStyles.rowCount}>{item.count} Soru</Text>
                </View>
                <View style={themedStyles.progressBarBg}>
                  <View 
                    style={[
                      themedStyles.progressBarFill, 
                      { 
                        width: `${(item.count / 5) * 100}%`,
                        backgroundColor: index < 3 ? colors.primary : colors.accent 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={themedStyles.adviceCard}>
            <HelpCircle size={24} color={colors.white} />
            <View style={themedStyles.adviceInfo}>
              <Text style={themedStyles.adviceTitle}>Çalışma İpucu</Text>
              <Text style={themedStyles.adviceText}>
                Osmanlı Kültür ve Medeniyet ile İnkılap Tarihi konuları toplamda sınavın %40'ından fazlasını oluşturur. Bu konulara ağırlık vermeniz netlerinizi hızla artıracaktır.
              </Text>
            </View>
          </View>
          
          <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  introDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  distributionRow: {
    marginBottom: 16,
  },
  rowInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowTopic: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  rowCount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  adviceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  adviceInfo: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 13,
    color: colors.white + 'CC',
    lineHeight: 18,
  },
});
