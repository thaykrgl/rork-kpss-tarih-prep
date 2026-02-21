import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CircleDot,
  StickyNote,
  Plus,
  Trash2,
  Send,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { topics } from '@/mocks/topics';
import { useStudy } from '@/providers/StudyProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { StudyNote } from '@/types';

export default function SubtopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    isSubtopicBookmarked,
    toggleBookmarkSubtopic,
    getSubtopicNotes,
    addNote,
    deleteNote,
  } = useStudy();

  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');

  const themedStyles = useMemo(() => styles(colors), [colors]);

  let foundSubtopic = null;
  let parentTopic = null;
  for (const topic of topics) {
    const st = topic.subtopics.find((s) => s.id === id);
    if (st) {
      foundSubtopic = st;
      parentTopic = topic;
      break;
    }
  }

  if (!foundSubtopic || !parentTopic) {
    return (
      <View style={themedStyles.container}>
        <SafeAreaView style={themedStyles.safeArea}>
          <Text style={themedStyles.errorText}>Alt konu bulunamadı</Text>
        </SafeAreaView>
      </View>
    );
  }

  const subtopic = foundSubtopic;
  const topic = parentTopic;
  const isBookmarked = isSubtopicBookmarked(subtopic.id);
  const notes = getSubtopicNotes(subtopic.id);

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmarkSubtopic(subtopic.id);
  };

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const note: StudyNote = {
      id: `note-${Date.now()}`,
      subtopicId: subtopic.id,
      topicId: topic.id,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addNote(note);
    setNoteText('');
    setShowNoteInput(false);
  }, [noteText, subtopic.id, topic.id, addNote]);

  const handleDeleteNote = useCallback((noteId: string) => {
    Alert.alert('Notu Sil', 'Bu notu silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteNote(noteId) },
    ]);
  }, [deleteNote]);

  return (
    <KeyboardAvoidingView 
      style={themedStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <Pressable
            style={themedStyles.backButton}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <ArrowLeft color={colors.primary} size={22} />
          </Pressable>
          <Pressable
            style={themedStyles.bookmarkButton}
            onPress={handleBookmark}
            hitSlop={12}
          >
            {isBookmarked ? (
              <BookmarkCheck color={colors.accent} size={22} />
            ) : (
              <Bookmark color={colors.textLight} size={22} />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[themedStyles.topicBadge, { backgroundColor: topic.color + '15' }]}>
            <Text style={[themedStyles.topicBadgeText, { color: topic.color }]}>
              {topic.title}
            </Text>
          </View>

          <Text style={themedStyles.title}>{subtopic.title}</Text>

          <View style={themedStyles.contentCard}>
            <Text style={themedStyles.contentText}>{subtopic.content}</Text>
          </View>

          <Text style={themedStyles.sectionTitle}>Önemli Noktalar</Text>

          {subtopic.keyPoints.map((point, index) => (
            <View key={index} style={themedStyles.keyPointCard}>
              <View
                style={[
                  themedStyles.keyPointIcon,
                  { backgroundColor: topic.color + '15' },
                ]}
              >
                <CircleDot color={topic.color} size={16} />
              </View>
              <Text style={themedStyles.keyPointText}>{point}</Text>
            </View>
          ))}

          <View style={themedStyles.notesSection}>
            <View style={themedStyles.notesSectionHeader}>
              <View style={themedStyles.notesTitleRow}>
                <StickyNote color={colors.primary} size={16} />
                <Text style={themedStyles.sectionTitle}>Notlarım</Text>
              </View>
              <TouchableOpacity
                style={themedStyles.addNoteBtn}
                onPress={() => setShowNoteInput(!showNoteInput)}
              >
                <Plus color={colors.primary} size={16} />
                <Text style={themedStyles.addNoteBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>

            {showNoteInput && (
              <View style={themedStyles.noteInputContainer}>
                <TextInput
                  style={themedStyles.noteInput}
                  placeholder="Notunuzu yazın..."
                  placeholderTextColor={colors.textLight}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
                <TouchableOpacity
                  style={[
                    themedStyles.sendNoteBtn,
                    !noteText.trim() && themedStyles.sendNoteBtnDisabled,
                  ]}
                  onPress={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <Send
                    color={noteText.trim() ? colors.white : colors.textLight}
                    size={16}
                  />
                </TouchableOpacity>
              </View>
            )}

            {notes.length === 0 && !showNoteInput && (
              <Text style={themedStyles.noNotesText}>
                Henüz not eklemediniz. Önemli bilgileri not alarak hatırlamayı kolaylaştırın.
              </Text>
            )}

            {notes.map((note) => (
              <View key={note.id} style={themedStyles.noteCard}>
                <Text style={themedStyles.noteText}>{note.text}</Text>
                <View style={themedStyles.noteFooter}>
                  <Text style={themedStyles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteNote(note.id)}
                    hitSlop={12}
                  >
                    <Trash2 color={colors.textLight} size={14} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={themedStyles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
  },
  topicBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 14,
  },
  keyPointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyPointIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  notesSection: {
    marginTop: 24,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary + '10',
  },
  addNoteBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: 10,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    minHeight: 60,
    maxHeight: 120,
    padding: 0,
  },
  sendNoteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendNoteBtnDisabled: {
    backgroundColor: colors.borderLight,
  },
  noNotesText: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  noteDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});
