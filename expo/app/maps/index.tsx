import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ChevronLeft, Compass, ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 72;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.65;

type MapData = {
  id: string;
  title: string;
  era: string;
  color: string;
  imageUrl: string;
  notes: string[];
};

const MAPS: MapData[] = [
  {
    id: '1',
    title: 'Anadolu Beylikleri (1300)',
    era: 'Beylikler Dönemi',
    color: '#16A085',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Anatolian_Beyliks_in_1300.png',
    notes: [
      '1071 - Malazgirt Savaşı → Anadolu\'nun kapıları açıldı',
      '1243 - Kösedağ Savaşı → Selçuklu Moğol hakimiyetine girdi',
      'Anadolu beylikler arasında paylaşıldı',
      'Osmanlılar, Karamanoğulları, Germiyanoğulları, Candaroğulları',
      'Osmanlı Beyliği kuzeybatı Anadolu\'da kuruldu (1299)',
      'Beylikler zamanla Osmanlı tarafından birleştirildi',
    ],
  },
  {
    id: '2',
    title: 'Osmanlı Kuruluş Dönemi (1451)',
    era: 'Kuruluş Dönemi',
    color: '#E67E22',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/OttomanEmpire1451.png',
    notes: [
      '1299 - Osmanlı Beyliği kuruldu (Söğüt)',
      '1326 - Bursa fethedildi, başkent oldu',
      '1361 - Edirne fethedildi, Rumeli\'ye geçiş',
      '1389 - I. Kosova Savaşı',
      '1396 - Niğbolu Savaşı',
      '1402 - Ankara Savaşı (Fetret Devri başladı)',
      '1444 - Varna Savaşı',
      '1453 - İstanbul\'un Fethi',
    ],
  },
  {
    id: '3',
    title: 'Osmanlı Yükselme Dönemi (1590)',
    era: 'Yükselme Dönemi',
    color: '#C0392B',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/OttomanEmpire1590.png',
    notes: [
      '1453 - İstanbul\'un Fethi → Yükselme başladı',
      '1517 - Mısır\'ın fethi, Halifelik Osmanlı\'ya geçti',
      '1521 - Belgrad\'ın fethi',
      '1526 - Mohaç Savaşı → Macaristan fethi',
      '1529 - I. Viyana Kuşatması',
      '1538 - Preveze Deniz Savaşı → Akdeniz hakimiyeti',
    ],
  },
  {
    id: '4',
    title: 'Osmanlı En Geniş Sınırlar (1683)',
    era: 'Duraklama Dönemi',
    color: '#8E44AD',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/06/OttomanEmpireIn1683.png',
    notes: [
      'Üç kıtaya yayılan dev imparatorluk',
      'Avrupa: Viyana kapılarına kadar (Macaristan, Balkanlar)',
      'Afrika: Mısır, Libya, Tunus, Cezayir',
      'Asya: Irak, Hicaz, Yemen, Basra Körfezi',
      '1683 - II. Viyana Kuşatması → Gerileme başladı',
      '1699 - Karlofça Antlaşması → İlk büyük toprak kaybı',
    ],
  },
  {
    id: '5',
    title: 'Osmanlı Gerileme Dönemi (1792)',
    era: 'Gerileme Dönemi',
    color: '#2C3E50',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Territorial_changes_of_the_Ottoman_Empire_1792.jpg',
    notes: [
      '1699 - Karlofça Antlaşması → Macaristan, Mora kaybedildi',
      '1718 - Pasarofça Antlaşması → Belgrad kaybedildi',
      '1774 - Küçük Kaynarca Antlaşması → Kırım kaybedildi',
      'Rusya Karadeniz\'e indi',
      'III. Selim ıslahat çabaları: Nizam-ı Cedit',
      'Balkanlarda milliyetçilik hareketleri başladı',
    ],
  },
  {
    id: '6',
    title: 'Osmanlı Dağılma Dönemi (1800)',
    era: 'Dağılma Dönemi',
    color: '#E74C3C',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Ottoman_Empire_1800_with_tributary_christian_principalities.png',
    notes: [
      '1829 - Yunanistan bağımsız oldu',
      '1878 - Berlin Antlaşması → Sırbistan, Karadağ, Romanya bağımsız',
      '1881 - Tunus Fransa\'ya, 1882 Mısır İngiltere\'ye',
      '1912 - Balkan Savaşları → Rumeli kaybedildi',
      'Trablusgarp Savaşı (1911) → Libya kaybedildi',
      'Osmanlıcılık, İslamcılık, Türkçülük akımları',
    ],
  },
  {
    id: '7',
    title: 'I. Dünya Savaşı - Ortadoğu (1914-1918)',
    era: 'I. Dünya Savaşı',
    color: '#D35400',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Middle_East_1914-1919.jpg',
    notes: [
      'ÇANAKKALE CEPHESİ: Tek kazanılan cephe (1915)',
      'KAFKAS CEPHESİ: Sarıkamış Faciası (Aralık 1914)',
      'KANAL CEPHESİ: Süveyş Kanalı → Başarısız',
      'IRAK CEPHESİ: Kutülamare Zaferi → Sonra Bağdat kaybedildi',
      'SURİYE-FİLİSTİN: Son savunma hattı',
      'HİCAZ-YEMEN: Arap İsyanı',
      '30 Ekim 1918 - Mondros Ateşkes Antlaşması',
    ],
  },
  {
    id: '8',
    title: 'Sevr Antlaşması Haritası (1920)',
    era: 'İşgal Dönemi',
    color: '#2C3E50',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Map_of_Sevres_Treaty.png',
    notes: [
      '10 Ağustos 1920 - Sevr Antlaşması imzalandı',
      'Doğu Anadolu\'da Ermeni devleti öngörüldü',
      'Batı Anadolu ve Trakya Yunanistan\'a',
      'Güneydoğu Fransa ve İngiltere\'ye',
      'İstanbul ve Boğazlar uluslararası kontrol altına',
      'TBMM tarafından tanınmadı, hiç uygulanmadı',
    ],
  },
  {
    id: '9',
    title: 'Misak-ı Milli Sınırları (1920)',
    era: 'Milli Mücadele',
    color: '#E74C3C',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Misak-i_milli_tr.png',
    notes: [
      '28 Ocak 1920 - Son Osmanlı Mebusan Meclisi\'nce kabul edildi',
      'Mondros Ateşkesi sınırları içindeki Türk toprakları',
      'Batı Trakya için halk oylaması istendi',
      'Kars, Ardahan, Batum için halk oylaması istendi',
      'Boğazlar\'ın güvenliği şartıyla açılması',
      'Milli Mücadele\'nin temel hedefi oldu',
    ],
  },
  {
    id: '10',
    title: 'Kurtuluş Savaşı Cepheleri (1919-1922)',
    era: 'Milli Mücadele',
    color: '#C0392B',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Fronts_during_the_Turkish_War_of_Independence.jpg',
    notes: [
      '19 Mayıs 1919 - Samsun\'a çıkış',
      'BATI CEPHESİ: İnönü I-II, Sakarya, Büyük Taarruz',
      'DOĞU CEPHESİ: Kars, Sarıkamış → Gümrü Antlaşması',
      'GÜNEY CEPHESİ: Maraş, Antep, Urfa → Ankara Antlaşması',
      '30 Ağustos 1922 - Başkomutanlık Meydan Muharebesi',
      '9 Eylül 1922 - İzmir\'in kurtuluşu',
    ],
  },
  {
    id: '11',
    title: 'Yunan-Türk Savaşı Haritası (1919-1922)',
    era: 'Batı Cephesi',
    color: '#2980B9',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Greco-Turkish_War_Map.png',
    notes: [
      '15 Mayıs 1919 - Yunan ordusu İzmir\'e çıktı',
      '10 Ocak 1921 - I. İnönü Muharebesi → Zafer',
      '31 Mart 1921 - II. İnönü Muharebesi → Zafer',
      '23 Ağustos-13 Eylül 1921 - Sakarya Meydan Muharebesi',
      '26 Ağustos 1922 - Büyük Taarruz başladı',
      '30 Ağustos 1922 - Dumlupınar → Başkomutanlık Meydan Muharebesi',
      '9 Eylül 1922 - İzmir kurtarıldı',
    ],
  },
  {
    id: '12',
    title: 'Osmanlı Devleti Genel Haritası',
    era: 'Tüm Dönemler',
    color: '#27AE60',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/OttomanEmpireMain.png',
    notes: [
      '1299 - Kuruluş (Söğüt, küçük bir beylik)',
      '1453 - İstanbul\'un Fethi → Yükselme başladı',
      '1590-1683 - En geniş sınırlar',
      '1699 - Karlofça → Gerileme başladı',
      '1789 - Dağılma dönemi',
      '1918 - Mondros ile fiilen sona erdi',
      '1923 - Lozan ile Türkiye Cumhuriyeti kuruldu',
    ],
  },
];

function MapImage({ url, colors }: { url: string; colors: any }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={[mapImageStyles.placeholder, { backgroundColor: colors.surfaceAlt }]}>
        <ImageIcon size={32} color={colors.textLight} />
        <Text style={[mapImageStyles.placeholderText, { color: colors.textLight }]}>
          Görsel yüklenemedi
        </Text>
      </View>
    );
  }

  return (
    <View style={mapImageStyles.container}>
      {loading && (
        <View style={[mapImageStyles.loader, { backgroundColor: colors.surfaceAlt }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      <Image
        source={{ uri: url }}
        style={mapImageStyles.image}
        resizeMode="contain"
        onLoadEnd={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
      />
    </View>
  );
}

const mapImageStyles = StyleSheet.create({
  container: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 1,
  },
  placeholder: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
  },
});

export default function MapsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const themedStyles = useMemo(() => styles(colors), [colors]);

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <View style={themedStyles.header}>
          <TouchableOpacity
            style={themedStyles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={themedStyles.title}>Tarih Haritaları</Text>
          <Text style={themedStyles.headerCount}>{MAPS.length} harita</Text>
        </View>

        <ScrollView
          contentContainerStyle={themedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={themedStyles.infoCard}>
            <Compass size={24} color={colors.primary} />
            <View style={themedStyles.infoTextContainer}>
              <Text style={themedStyles.infoTitle}>Görsel Hafıza ile Çalış</Text>
              <Text style={themedStyles.infoDesc}>
                Devlet sınırları, savaş cepheleri ve antlaşmaları haritalar üzerinden incele.
              </Text>
            </View>
          </View>

          {MAPS.map((map) => {
            const isExpanded = selectedId === map.id;

            return (
              <TouchableOpacity
                key={map.id}
                style={[themedStyles.mapCard, isExpanded && { borderColor: map.color }]}
                activeOpacity={0.9}
                onPress={() => setSelectedId(isExpanded ? null : map.id)}
              >
                <View style={themedStyles.mapHeader}>
                  <View style={[themedStyles.mapDot, { backgroundColor: map.color }]} />
                  <View style={themedStyles.mapInfo}>
                    <Text style={themedStyles.mapTitle}>{map.title}</Text>
                    <Text style={themedStyles.mapEra}>{map.era}</Text>
                  </View>
                  <ChevronRight
                    size={18}
                    color={colors.textLight}
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
                  />
                </View>

                {isExpanded && (
                  <View style={themedStyles.mapDetails}>
                    <MapImage url={map.imageUrl} colors={colors} />

                    <Text style={themedStyles.sourceText}>Kaynak: Wikimedia Commons</Text>

                    <View style={themedStyles.notesContainer}>
                      <Text style={themedStyles.notesTitle}>Önemli Bilgiler</Text>
                      {map.notes.map((note, idx) => (
                        <View key={idx} style={themedStyles.noteRow}>
                          <View style={[themedStyles.noteBullet, { backgroundColor: map.color }]} />
                          <Text style={themedStyles.noteText}>{note}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
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
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
    flex: 1,
  },
  headerCount: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  mapEra: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  mapDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 6,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  notesContainer: {
    width: '100%',
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 10,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  noteBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
    marginRight: 8,
  },
  noteText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
});
