export interface Exam {
  id: string;
  title: string;
  shortTitle: string;
  date: string; // ISO format
  applicationStart: string;
  applicationEnd: string;
  resultsDate: string;
  color: string;
}

// 2026 KPSS Sınav Takvimi (Approximate dates based on past cycles)
export const exams: Exam[] = [
  {
    id: 'kpss-lisans-2026',
    title: 'KPSS Lisans (Genel Yetenek-Genel Kültür, Eğitim Bilimleri)',
    shortTitle: 'KPSS Lisans',
    date: '2026-07-12T10:15:00',
    applicationStart: '2026-05-03',
    applicationEnd: '2026-05-15',
    resultsDate: '2026-08-12',
    color: '#4A90E2',
  },
  {
    id: 'kpss-alan-2026',
    title: 'KPSS Lisans Alan Bilgisi',
    shortTitle: 'Alan Bilgisi',
    date: '2026-07-19T10:15:00',
    applicationStart: '2026-05-03',
    applicationEnd: '2026-05-15',
    resultsDate: '2026-08-12',
    color: '#9B51E0',
  },
  {
    id: 'kpss-oabt-2026',
    title: 'KPSS Öğretmenlik Alan Bilgisi Testi (ÖABT)',
    shortTitle: 'ÖABT',
    date: '2026-08-02T10:15:00',
    applicationStart: '2026-05-03',
    applicationEnd: '2026-05-15',
    resultsDate: '2026-08-25',
    color: '#F2994A',
  },
  {
    id: 'kpss-onlisans-2026',
    title: 'KPSS Ön Lisans',
    shortTitle: 'Ön Lisans',
    date: '2026-09-06T10:15:00',
    applicationStart: '2026-07-04',
    applicationEnd: '2026-07-17',
    resultsDate: '2026-10-06',
    color: '#27AE60',
  },
  {
    id: 'kpss-ortaogretim-2026',
    title: 'KPSS Ortaöğretim',
    shortTitle: 'Ortaöğretim',
    date: '2026-10-04T10:15:00',
    applicationStart: '2026-08-15',
    applicationEnd: '2026-08-29',
    resultsDate: '2026-11-03',
    color: '#EB5757',
  },
  {
    id: 'ekpss-2026',
    title: 'Engelli Kamu Personeli Seçme Sınavı (EKPSS)',
    shortTitle: 'EKPSS',
    date: '2026-04-26T10:15:00',
    applicationStart: '2026-02-06',
    applicationEnd: '2026-02-21',
    resultsDate: '2026-05-21',
    color: '#2D9CDB',
  },
];
