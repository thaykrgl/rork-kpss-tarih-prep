import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Map as MapIcon, Compass, Crosshair, Landmark, Swords } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');

const MAP_REGIONS = [
  {
    id: '1',
    title: 'Osmanlı Devleti En Geniş Sınırlar',
    description: '16. yüzyıl sonunda Osmanlı Devleti\'nin üç kıtaya yayılan en geniş sınırları.',
    era: 'Yükselme/Duraklama',
    details: 'Cezayir\'den Hazar Denizi\'ne, Budin\'den Basra Korfezi\'ne kadar uzanan topraklar.',
    icon: Landmark,
    color: '#E67E22'
  },
  {
    id: '2',
    title: 'Milli Mücadele Cepheleri',
    description: 'Kurtuluş Savaşı döneminde Doğu, Güney ve Batı cephelerindeki mücadele alanları.',
    era: 'Milli Mücadele',
    details: 'Batı Cephesi (Yunanistan), Doğu Cephesi (Ermenistan), Güney Cephesi (Fransa).',
    icon: Swords,
    color: '#E74C3C'
  },
  {
    id: '3',
    title: 'Selçuklu Anadolu Hakimiyeti',
    description: 'Malazgirt sonrası Anadolu\'nun Türkleşme süreci ve beylikler haritası.',
    era: 'Selçuklu Dönemi',
    details: 'Danişmentliler, Saltuklular, Mengücekliler ve Artuklular gibi ilk dönem beylikleri.',
    icon: Crosshair,
    color: '#3498DB'
  }
];

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
            <ChevronRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={themedStyles.title}>Tarih Haritaları</Text>
        </View>

        <ScrollView 
          contentContainerStyle={themedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={themedStyles.infoCard}>
            <Compass size={32} color={colors.primary} />
            <Text style={themedStyles.infoTitle}>Görsel Hafıza ile Çalış</Text>
            <Text style={themedStyles.infoDesc}>
              Savaşların konumları ve devletlerin sınır değişimlerini haritalar üzerinden incele.
            </Text>
          </View>

          {MAP_REGIONS.map((region) => {
            const Icon = region.icon;
            const isExpanded = selectedId === region.id;
            
            return (
              <TouchableOpacity 
                key={region.id} 
                style={[themedStyles.regionCard, isExpanded && themedStyles.regionCardExpanded]}
                activeOpacity={0.9}
                onPress={() => setSelectedId(isExpanded ? null : region.id)}
              >
                <View style={themedStyles.regionHeader}>
                  <View style={[themedStyles.regionIcon, { backgroundColor: region.color + '15' }]}>
                    <Icon color={region.color} size={24} />
                  </View>
                  <View style={themedStyles.regionInfo}>
                    <Text style={themedStyles.regionTitle}>{region.title}</Text>
                    <Text style={themedStyles.regionEra}>{region.era}</Text>
                  </View>
                  <ChevronRight 
                    size={20} 
                    color={colors.textLight} 
                    style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} 
                  />
                </View>

                {isExpanded && (
                  <View style={themedStyles.regionDetails}>
                    <View style={themedStyles.mapPlaceholder}>
                      <MapIcon size={40} color={colors.border} />
                      <Text style={themedStyles.mapPlaceholderText}>Harita Görseli Yükleniyor...</Text>
                    </View>
                    <Text style={themedStyles.detailsTitle}>Önemli Notlar</Text>
                    <Text style={themedStyles.detailsText}>{region.details}</Text>
                    <Text style={themedStyles.detailsText}>{region.description}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={themedStyles.comingSoon}>
            <Text style={themedStyles.comingSoonText}>Yeni haritalar ve interaktif detaylar yakında eklenecektir.</Text>
          </View>
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
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  regionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionCardExpanded: {
    borderColor: colors.primary,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  regionInfo: {
    flex: 1,
  },
  regionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  regionEra: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  regionDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mapPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mapPlaceholderText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 10,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  comingSoon: {
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
