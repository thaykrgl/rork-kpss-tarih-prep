export interface TopicDistribution {
  topic: string;
  count: number;
  percentage: number;
}

export const questionDistribution: TopicDistribution[] = [
  { topic: 'Osmanlı Kültür ve Medeniyet', count: 4, percentage: 14.8 },
  { topic: 'Kurtuluş Savaşı Muharebeler', count: 3, percentage: 11.1 },
  { topic: 'Atatürk İnkılapları', count: 3, percentage: 11.1 },
  { topic: 'Osmanlı Dağılma Dönemi', count: 3, percentage: 11.1 },
  { topic: 'İslamiyet Öncesi Türk Tarihi', count: 3, percentage: 11.1 },
  { topic: 'Türk-İslam Devletleri', count: 3, percentage: 11.1 },
  { topic: 'XX. Yüzyıl Başlarında Osmanlı', count: 3, percentage: 11.1 },
  { topic: 'Çağdaş Türk ve Dünya Tarihi', count: 3, percentage: 11.1 },
  { topic: 'Atatürk İlkeleri', count: 2, percentage: 7.4 },
];
