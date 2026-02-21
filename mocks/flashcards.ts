import { Flashcard } from '@/types';
import { topics } from './topics';

function generateFlashcardsFromTopics(): Flashcard[] {
  const cards: Flashcard[] = [];
  let idx = 0;

  for (const topic of topics) {
    for (const subtopic of topic.subtopics) {
      for (const point of subtopic.keyPoints) {
        let front = '';
        let back = '';

        const separator = point.includes(': ') ? ': ' : (point.includes(' - ') ? ' - ' : null);
        
        if (separator) {
          const parts = point.split(separator);
          const part1 = parts[0].trim();
          const part2 = parts[1].trim();

          // Standard punchy templates
          if (part1.includes('Kuruluş') || part1.includes('Kurucu')) {
            front = `${subtopic.title} ne zaman veya kim tarafından kurulmuştur?`;
            back = part2;
          } else if (part1.includes('En parlak') || part1.includes('En güçlü')) {
            front = `${subtopic.title}'nin en parlak dönemi hangisidir?`;
            back = part2;
          } else if (part1.includes('Başkent')) {
            front = `${subtopic.title}'nin başkenti neresidir?`;
            back = part2;
          } else if (part1.match(/^\d{3,4}$/)) { // If part 1 is just a year
            front = `${subtopic.title} tarihinde ${part1} yılında ne olmuştur?`;
            back = part2;
          }
          // Entity-based smart questions
          else {
            const isPerson = part2.includes('lider') || part2.includes('kağan') || part2.includes('sultan') || part2.includes('hükümdar') || part2.includes('vezir') || part2.includes('kişi');
            const isEvent = part2.includes('savaşı') || part2.includes('olayı') || part2.includes('zamanı');
            
            if (isPerson) {
              front = `${part2.replace(/başlattı|kurdu|yaptı|yönetti/g, (m) => m === 'başlattı' ? 'başlatan' : m === 'kurdu' ? 'kuran' : m === 'yaptı' ? 'yapan' : 'yöneten')} ${subtopic.title} hükümdarı/kişisi kimdir?`;
            } else if (isEvent) {
              front = `${part2} nedir/hangisidir?`;
            } else {
              // Swap logic: check if part 1 is a single word (likely a concept)
              if (part1.split(' ').length === 1) {
                front = `${subtopic.title} bağlamında "${part1}" nedir?`;
              } else {
                front = `${part1} nedir veya neyi ifade eder?`;
              }
            }
            back = part2;
            
            // If the swap made sense in the previous logic but sounded clunky:
            // "Balamir: Kavimler Göçünü başlatan lider" -> "Avrupa Hun Devleti'nde Kavimler Göçünü başlatan lider kimdir?"
            if (part2.length > part1.length && part2.split(' ').length > 2) {
              front = `${part2.replace('başlattı', 'başlatan').replace('kurdu', 'kuran')} kimdir/nedir?`;
              back = part1;
            }
          }
        } else {
          // No separator: try to extract meaning
          if (point.includes('Savaşı')) {
            const warName = point.split('Savaşı')[0] + ' Savaşı';
            front = `${warName} nedir veya önemi nedir?`;
            back = point;
          } else {
            front = `${subtopic.title} ile ilgili şu bilgiyi biliniz:`;
            back = point;
          }
        }

        if (front && back && front.length > 5) {
          // Clean suffixes
          front = front.replace(' kişisi/olayı hangisidir?', ' kimdir/nedir?');
          front = front.replace(' bağlamında "" nedir?', ' nedir?');
          
          cards.push({
            id: `fc-${idx++}`,
            topicId: topic.id,
            subtopicId: subtopic.id,
            front: front.trim(),
            back: back.trim(),
          });
        }
      }
    }
  }

  return cards;
}

export const flashcards: Flashcard[] = generateFlashcardsFromTopics();
