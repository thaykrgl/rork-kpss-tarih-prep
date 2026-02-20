import { Flashcard } from '@/types';
import { topics } from './topics';

function generateFlashcardsFromTopics(): Flashcard[] {
  const cards: Flashcard[] = [];
  let idx = 0;

  for (const topic of topics) {
    for (const subtopic of topic.subtopics) {
      for (const point of subtopic.keyPoints) {
        const parts = point.split(' - ');
        const front = parts.length > 1 ? parts[0] : point;
        const back = parts.length > 1 ? parts[1] : `${subtopic.title} konusundan: ${point}`;

        cards.push({
          id: `fc-${idx++}`,
          topicId: topic.id,
          subtopicId: subtopic.id,
          front,
          back,
        });
      }
    }
  }

  return cards;
}

export const flashcards: Flashcard[] = generateFlashcardsFromTopics();
