export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'war' | 'treaty' | 'state' | 'internal' | 'culture';
  importance: 1 | 2 | 3;
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: '1',
    year: '1071',
    title: 'Malazgirt Meydan Muharebesi',
    description: 'Büyük Selçuklu Devleti ile Bizans İmparatorluğu arasında gerçekleşti. Anadolu\'nun kapıları Türklere açıldı.',
    type: 'war',
    importance: 3
  },
  {
    id: '2',
    year: '1299',
    title: 'Osmanlı Devleti\'nin Kuruluşu',
    description: 'Osman Gazi tarafından Söğüt ve çevresinde Osmanlı Beyliği kuruldu.',
    type: 'state',
    importance: 3
  },
  {
    id: '3',
    year: '1453',
    title: 'İstanbul\'un Fethi',
    description: 'II. Mehmed (Fatih) tarafından Bizans İmparatorluğu\'na son verildi. Orta Çağ kapandı, Yeni Çağ başladı.',
    type: 'war',
    importance: 3
  },
  {
    id: '4',
    year: '1517',
    title: 'Mısır Seferi ve Hilafet',
    description: 'Yavuz Sultan Selim döneminde Ridaniye Savaşı ile Memlük Devleti yıkıldı, halifelik Osmanlı\'ya geçti.',
    type: 'war',
    importance: 2
  },
  {
    id: '5',
    year: '1699',
    title: 'Karlofça Antlaşması',
    description: 'Osmanlı Devleti\'nin ilk kez büyük çapta toprak kaybettiği antlaşmadır. Duraklama dönemi bitti, Gerileme başladı.',
    type: 'treaty',
    importance: 3
  },
  {
    id: '6',
    year: '1839',
    title: 'Tanzimat Fermanı',
    description: 'Gülhane Parkı\'nda okundu. Hukuk üstünlüğü ve anayasalcılık yolunda atılan ilk önemli adımdır.',
    type: 'internal',
    importance: 3
  },
  {
    id: '7',
    year: '1876',
    title: 'I. Meşrutiyet\'in İlanı',
    description: 'Kanun-i Esasi kabul edildi. İlk kez halk seçme seçilme hakkını kullanarak meclise girdi.',
    type: 'internal',
    importance: 3
  },
  {
    id: '8',
    year: '1919',
    title: 'Samsun\'a Çıkış',
    description: 'Mustafa Kemal Paşa 19 Mayıs\'ta Samsun\'a çıkarak Milli Mücadele\'yi fiilen başlattı.',
    type: 'state',
    importance: 3
  },
  {
    id: '9',
    year: '1920',
    title: 'TBMM\'nin Açılması',
    description: '23 Nisan\'da Ankara\'da açılan meclis, halkın iradesini temsil eden en üst kurum oldu.',
    type: 'state',
    importance: 3
  },
  {
    id: '10',
    year: '1922',
    title: 'Mudanya Ateşkes Antlaşması',
    description: 'Kurtuluş Savaşı\'nın silahlı mücadelesini bitiren antlaşmadır. İstanbul ve Doğu Trakya savaşsız kurtarıldı.',
    type: 'treaty',
    importance: 2
  },
  {
    id: '11',
    year: '1923',
    title: 'Cumhuriyetin İlanı',
    description: '29 Ekim\'de devletin yönetim şekli resmen Cumhuriyet olarak belirlendi.',
    type: 'state',
    importance: 3
  },
  {
    id: '12',
    year: '1924',
    title: 'Halifeliğin Kaldırılması',
    description: 'Laikliğin en önemli aşamasıdır. Tevhid-i Tedrisat Kanunu da aynı gün kabul edildi.',
    type: 'internal',
    importance: 3
  }
];
