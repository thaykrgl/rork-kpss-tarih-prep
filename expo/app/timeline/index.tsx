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
import { ChevronRight, Calendar, Swords, FileText, Landmark, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { timelineEvents } from '@/mocks/timeline';
import { useTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');

const TYPE_ICONS = {
  war: Swords,
  treaty: FileText,
  state: Landmark,
  internal: Users,
  culture: Calendar,
};

const TYPE_COLORS = {
  war: '#E74C3C',
  treaty: '#3498DB',
  state: '#F1C40F',
  internal: '#9B59B6',
  culture: '#2ECC71',
};

export default function TimelineScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const themedStyles = useMemo(() => styles(colors), [colors]);

  const sortedEvents = useMemo(() => {
    return [...timelineEvents].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }, []);

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
          <Text style={themedStyles.title}>Zaman Tüneli</Text>
        </View>

        <ScrollView 
          style={themedStyles.timelineContainer}
          contentContainerStyle={themedStyles.timelineContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedEvents.map((event, index) => {
            const Icon = TYPE_ICONS[event.type];
            const isLast = index === sortedEvents.length - 1;

            return (
              <View key={event.id} style={themedStyles.eventRow}>
                <View style={themedStyles.leftColumn}>
                  <Text style={themedStyles.eventYear}>{event.year}</Text>
                  <View style={[themedStyles.typeBadge, { backgroundColor: TYPE_COLORS[event.type] + '20' }]}>
                    <Icon size={12} color={TYPE_COLORS[event.type]} />
                  </View>
                </View>

                <View style={themedStyles.centerColumn}>
                  <View style={[themedStyles.dot, { backgroundColor: TYPE_COLORS[event.type] }]} />
                  {!isLast && <View style={themedStyles.line} />}
                </View>

                <View style={themedStyles.rightColumn}>
                  <View style={themedStyles.eventCard}>
                    <Text style={themedStyles.eventTitle}>{event.title}</Text>
                    <Text style={themedStyles.eventDesc}>{event.description}</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  timelineContainer: {
    flex: 1,
  },
  timelineContent: {
    padding: 20,
    paddingLeft: 0,
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  leftColumn: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: 15,
    paddingTop: 5,
  },
  eventYear: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  typeBadge: {
    marginTop: 5,
    padding: 4,
    borderRadius: 6,
  },
  centerColumn: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 1,
    marginTop: 8,
    borderWidth: 3,
    borderColor: colors.background,
  },
  line: {
    position: 'absolute',
    top: 22,
    bottom: -30,
    width: 2,
    backgroundColor: colors.border,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  eventDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
