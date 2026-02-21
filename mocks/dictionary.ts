export interface Term {
  id: string;
  term: string;
  definition: string;
  category?: string;
}

export const terms: Term[] = [
  {
    id: '1',
    term: 'İskan Politikası',
    definition: 'Osmanlı Devleti\'nin Balkanlar\'da fethettiği topraklara Anadolu\'daki Türkmenleri yerleştirerek bölgeyi Türkleştirme ve İslamlaştırma çabasıdır.',
    category: 'Osmanlı'
  },
  {
    id: '2',
    term: 'Kut İnancı',
    definition: 'Eski Türklerde hükümdarlığın tanrı tarafından verildiğine inanılan kutsal güçtür. Kan yoluyla babadan oğula geçer.',
    category: 'İslam Öncesi'
  },
  {
    id: '3',
    term: 'Nizam-ı Cedid',
    definition: 'III. Selim tarafından kurulan modern ordu ve bu ordunun ihtiyaçlarını karşılamak için yapılan ıslahatların genel adıdır.',
    category: 'Osmanlı'
  },
  {
    id: '4',
    term: 'İstimalet Politikası',
    definition: 'Osmanlı Devleti\'nin fethettiği bölgelerdeki gayrimüslim halka karşı uyguladığı hoşgörü ve adalet politikasıdır.',
    category: 'Osmanlı'
  },
  {
    id: '5',
    term: 'Tımar Sistemi',
    definition: 'Devletin, asker ve memurlarına hizmetleri karşılığında belirli toprakların vergi gelirlerini bırakması sistemidir. Hem askeri hem ekonomik amaçlıdır.',
    category: 'Osmanlı'
  },
  {
    id: '6',
    term: 'Kurultay (Toy)',
    definition: 'Eski Türk devletlerinde devlet işlerinin görüşülüp karara bağlandığı meclise verilen isimdir.',
    category: 'İslam Öncesi'
  },
  {
    id: '7',
    term: 'Millet Sistemi',
    definition: 'Osmanlı toplumunun ırk esasına göre değil, dinsel inançlarına göre (Müslüman, Rum, Ermeni, Yahudi) örgütlenmesidir.',
    category: 'Osmanlı'
  },
  {
    id: '8',
    term: 'Ahilik',
    definition: 'Anadolu\'da Selçuklular döneminde kurulan, esnaf ve sanatkarların dayanışma, eğitim ve denetim teşkilatıdır.',
    category: 'Selçuklu/Osmanlı'
  },
  {
    id: '9',
    term: 'Devşirme Sistemi',
    definition: 'Hristiyan ailelerin çocuklarının devlet hizmetine ve ordunun ihtiyacı için küçük yaşta alınıp Türk-İslam kültürüyle yetiştirilmesi sistemidir.',
    category: 'Osmanlı'
  },
  {
    id: '10',
    term: 'Veraset Sistemi',
    definition: 'Hükümdarlığın kimden kime ve ne şekilde geçeceğini belirleyen kurallar bütünüdür.',
    category: 'Genel'
  },
  {
    id: '11',
    term: 'Vakıf Sistemi',
    definition: 'Bireylerin kendilerine ait mülkleri veya gelirleri, toplumsal hizmetler için (cami, okul, hastane vb.) kalıcı olarak bağışlamasıdır.',
    category: 'Genel'
  },
  {
    id: '12',
    term: 'Reaya',
    definition: 'Osmanlı Devleti\'nde yönetime katılmayan, vergi veren halk kesimidir (Müslüman ve gayrimüslim tebaa).',
    category: 'Osmanlı'
  }
];
