export interface Exam {
  id: string;
  title: string;
  shortTitle: string;
  date: string;
  applicationStart: string;
  applicationEnd: string;
  resultsDate: string;
  color: string;
}

export const exams: Exam[] = [
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
  {
    id: 'kpss-lisans-2026',
    title: 'KPSS Lisans (Genel Yetenek - Genel Kültür)',
    shortTitle: 'KPSS Lisans',
    date: '2026-09-06T10:15:00',
    applicationStart: '2026-07-06',
    applicationEnd: '2026-07-17',
    resultsDate: '2026-10-06',
    color: '#4A90E2',
  },
  {
    id: 'kpss-alan-2026',
    title: 'KPSS Lisans Alan Bilgisi',
    shortTitle: 'Alan Bilgisi',
    date: '2026-09-12T10:15:00',
    applicationStart: '2026-07-06',
    applicationEnd: '2026-07-17',
    resultsDate: '2026-10-12',
    color: '#9B51E0',
  },
  {
    id: 'kpss-alan2-2026',
    title: 'KPSS Lisans Alan Bilgisi (2. Gün)',
    shortTitle: 'Alan Bilgisi 2',
    date: '2026-09-13T10:15:00',
    applicationStart: '2026-07-06',
    applicationEnd: '2026-07-17',
    resultsDate: '2026-10-12',
    color: '#8E44AD',
  },
  {
    id: 'kpss-onlisans-2026',
    title: 'KPSS Ön Lisans',
    shortTitle: 'Ön Lisans',
    date: '2026-10-04T10:15:00',
    applicationStart: '2026-08-10',
    applicationEnd: '2026-08-21',
    resultsDate: '2026-11-03',
    color: '#27AE60',
  },
  {
    id: 'kpss-ortaogretim-2026',
    title: 'KPSS Ortaöğretim',
    shortTitle: 'Ortaöğretim',
    date: '2026-10-25T10:15:00',
    applicationStart: '2026-09-01',
    applicationEnd: '2026-09-12',
    resultsDate: '2026-11-24',
    color: '#EB5757',
  },
];
