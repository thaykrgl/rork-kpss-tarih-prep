import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Book, ChevronRight, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { terms } from '@/mocks/dictionary';
import { useTheme } from '@/providers/ThemeProvider';

export default function DictionaryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const themedStyles = useMemo(() => styles(colors), [colors]);

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...terms].sort((a, b) => a.term.localeCompare(b.term, 'tr'));
    }
    const q = searchQuery.toLowerCase();
    return terms
      .filter(t => 
        t.term.toLowerCase().includes(q) || 
        t.definition.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      )
      .sort((a, b) => a.term.localeCompare(b.term, 'tr'));
  }, [searchQuery]);

  const renderTerm = ({ item }: { item: typeof terms[0] }) => (
    <View style={themedStyles.termCard}>
      <View style={themedStyles.termHeader}>
        <View style={themedStyles.termNameContainer}>
          <Book size={18} color={colors.primary} />
          <Text style={themedStyles.termName}>{item.term}</Text>
        </View>
        {item.category && (
          <View style={themedStyles.categoryBadge}>
            <Text style={themedStyles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
      <Text style={themedStyles.termDefinition}>{item.definition}</Text>
    </View>
  );

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
          <Text style={themedStyles.title}>Tarih Terimleri Sözlüğü</Text>
        </View>

        <View style={themedStyles.searchContainer}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={themedStyles.searchInput}
            placeholder="Terim veya açıklama ara..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredTerms}
          keyExtractor={item => item.id}
          renderItem={renderTerm}
          contentContainerStyle={themedStyles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={themedStyles.emptyState}>
              <Info size={48} color={colors.textLight} />
              <Text style={themedStyles.emptyText}>Sonuç bulunamadı</Text>
            </View>
          }
        />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  termCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  termNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  termName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  categoryBadge: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  termDefinition: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    gap: 15,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
});
