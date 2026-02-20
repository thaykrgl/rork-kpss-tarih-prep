import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
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
import Colors from '@/constants/colors';
import { topics } from '@/mocks/topics';
import { useStudy } from '@/providers/StudyProvider';
import { StudyNote } from '@/types';

export default function SubtopicDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    isSubtopicBookmarked,
    toggleBookmarkSubtopic,
    getSubtopicNotes,
    addNote,
    deleteNote,
  } = useStudy();

  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');

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
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Alt konu bulunamadı</Text>
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
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <ArrowLeft color={Colors.primary} size={22} />
          </Pressable>
          <Pressable
            style={styles.bookmarkButton}
            onPress={handleBookmark}
            hitSlop={12}
          >
            {isBookmarked ? (
              <BookmarkCheck color={Colors.accent} size={22} />
            ) : (
              <Bookmark color={Colors.textLight} size={22} />
            )}
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.topicBadge, { backgroundColor: topic.color + '15' }]}>
            <Text style={[styles.topicBadgeText, { color: topic.color }]}>
              {topic.title}
            </Text>
          </View>

          <Text style={styles.title}>{subtopic.title}</Text>

          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{subtopic.content}</Text>
          </View>

          <Text style={styles.sectionTitle}>Önemli Noktalar</Text>

          {subtopic.keyPoints.map((point, index) => (
            <View key={index} style={styles.keyPointCard}>
              <View
                style={[
                  styles.keyPointIcon,
                  { backgroundColor: topic.color + '15' },
                ]}
              >
                <CircleDot color={topic.color} size={16} />
              </View>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}

          <View style={styles.notesSection}>
            <View style={styles.notesSectionHeader}>
              <View style={styles.notesTitleRow}>
                <StickyNote color={Colors.primary} size={16} />
                <Text style={styles.sectionTitle}>Notlarım</Text>
              </View>
              <TouchableOpacity
                style={styles.addNoteBtn}
                onPress={() => setShowNoteInput(!showNoteInput)}
              >
                <Plus color={Colors.primary} size={16} />
                <Text style={styles.addNoteBtnText}>Ekle</Text>
              </TouchableOpacity>
            </View>

            {showNoteInput && (
              <View style={styles.noteInputContainer}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Notunuzu yazın..."
                  placeholderTextColor={Colors.textLight}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
                <TouchableOpacity
                  style={[
                    styles.sendNoteBtn,
                    !noteText.trim() && styles.sendNoteBtnDisabled,
                  ]}
                  onPress={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <Send
                    color={noteText.trim() ? Colors.white : Colors.textLight}
                    size={16}
                  />
                </TouchableOpacity>
              </View>
            )}

            {notes.length === 0 && !showNoteInput && (
              <Text style={styles.noNotesText}>
                Henüz not eklemediniz. Önemli bilgileri not alarak hatırlamayı kolaylaştırın.
              </Text>
            )}

            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteText}>{note.text}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteNote(note.id)}
                    hitSlop={12}
                  >
                    <Trash2 color={Colors.textLight} size={14} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
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
    color: Colors.primary,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  contentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 14,
  },
  keyPointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
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
    color: Colors.text,
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
    backgroundColor: Colors.primary + '10',
  },
  addNoteBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    gap: 10,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    minHeight: 60,
    maxHeight: 120,
    padding: 0,
  },
  sendNoteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendNoteBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
  noNotesText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text,
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
    color: Colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center' as const,
    marginTop: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});
