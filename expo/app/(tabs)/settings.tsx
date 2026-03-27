import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Clock,
  CheckCircle,
  ChevronRight,
  Info,
  Lock,
  User,
  ShieldCheck,
  CreditCard,
  LogOut,
  Mail,
  Share2,
  Star
} from 'lucide-react-native';
import { useStudy } from '@/providers/StudyProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { usePremium } from '@/providers/PremiumProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    progress,
    toggleNotifications,
    setReminderTime,
    setTheme,
    resetProgress,
  } = useStudy();
  const { colors, themeMode } = useTheme();
  const { isPremium } = usePremium();
  
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const themedStyles = useMemo(() => styles(colors), [colors]);

  const renderSectionHeader = (title: string) => (
    <Text style={themedStyles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={themedStyles.container}>
      <SafeAreaView edges={['top']} style={themedStyles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themedStyles.scrollContent}
        >
          <Text style={themedStyles.title}>Ayarlar</Text>
          <Text style={themedStyles.subtitle}>Uygulama tercihlerinizi yönetin</Text>

          {/* Premium Status */}
          <TouchableOpacity
            style={themedStyles.premiumCard}
            activeOpacity={0.9}
            onPress={() => { if (!isPremium) router.push('/paywall' as any); }}
          >
            <View style={themedStyles.premiumInfo}>
              <View style={[themedStyles.premiumIconContainer, { backgroundColor: isPremium ? '#FFD700' : colors.primary }]}>
                <ShieldCheck color={colors.white} size={24} />
              </View>
              <View>
                <Text style={themedStyles.premiumTitle}>
                  {isPremium ? 'Premium Üyesiniz' : 'Premium\'a Yükselt'}
                </Text>
                <Text style={themedStyles.premiumSub}>
                  {isPremium ? 'Tüm içeriklere sınırsız erişim' : 'Reklamsız ve tüm konular kilitsiz'}
                </Text>
              </View>
            </View>
            {!isPremium && <ChevronRight color={colors.white} size={20} />}
          </TouchableOpacity>

          {renderSectionHeader('Görünüm')}
          <View style={themedStyles.settingsCard}>
            <View style={themedStyles.settingItem}>
              <View style={themedStyles.settingInfo}>
                <Sun color={colors.primary} size={20} />
                <View>
                  <Text style={themedStyles.settingTitle}>Tema</Text>
                  <Text style={themedStyles.settingSub}>Uygulama renk modunu seçin</Text>
                </View>
              </View>
            </View>
            <View style={themedStyles.themeOptions}>
              <TouchableOpacity 
                style={[themedStyles.themeBtn, themeMode === 'light' && themedStyles.themeBtnActive]} 
                onPress={() => setTheme('light')}
              >
                <Sun size={16} color={themeMode === 'light' ? colors.primary : colors.textSecondary} />
                <Text style={[themedStyles.themeBtnText, themeMode === 'light' && themedStyles.themeBtnTextActive]}>Aydınlık</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[themedStyles.themeBtn, themeMode === 'dark' && themedStyles.themeBtnActive]} 
                onPress={() => setTheme('dark')}
              >
                <Moon size={16} color={themeMode === 'dark' ? colors.primary : colors.textSecondary} />
                <Text style={[themedStyles.themeBtnText, themeMode === 'dark' && themedStyles.themeBtnTextActive]}>Karanlık</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[themedStyles.themeBtn, themeMode === 'system' && themedStyles.themeBtnActive]} 
                onPress={() => setTheme('system')}
              >
                <Monitor size={16} color={themeMode === 'system' ? colors.primary : colors.textSecondary} />
                <Text style={[themedStyles.themeBtnText, themeMode === 'system' && themedStyles.themeBtnTextActive]}>Sistem</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderSectionHeader('Bildirimler')}
          <View style={themedStyles.settingsCard}>
            <View style={themedStyles.settingRow}>
              <View style={themedStyles.settingInfo}>
                <Bell color={colors.primary} size={20} />
                <View>
                  <Text style={themedStyles.settingTitle}>Günlük Hatırlatıcı</Text>
                  <Text style={themedStyles.settingSub}>Çalışma vaktinizi unutmayın</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={progress.notificationsEnabled ? colors.primary : colors.white}
                onValueChange={(val) => toggleNotifications(val)}
                value={progress.notificationsEnabled}
              />
            </View>
            
            {progress.notificationsEnabled && (
              <TouchableOpacity 
                style={[themedStyles.settingRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 16 }]}
                onPress={() => setIsTimePickerVisible(true)}
              >
                <View style={themedStyles.settingInfo}>
                  <Clock color={colors.primary} size={20} />
                  <View>
                    <Text style={themedStyles.settingTitle}>Hatırlatma Saati</Text>
                    <Text style={themedStyles.settingSub}>Her gün saat {progress.reminderTime?.hour}:00'da</Text>
                  </View>
                </View>
                <Text style={themedStyles.timeValueText}>Değiştir</Text>
              </TouchableOpacity>
            )}
          </View>

          {renderSectionHeader('Hakkında & Destek')}
          <View style={themedStyles.settingsCard}>
            <TouchableOpacity
              style={themedStyles.navItem}
              onPress={() => Linking.openURL('mailto:destek@kpsstarih.app?subject=Geri%20Bildirim')}
            >
              <View style={themedStyles.settingInfo}>
                <Mail color={colors.textSecondary} size={20} />
                <Text style={themedStyles.navText}>Geri Bildirim Gönder</Text>
              </View>
              <ChevronRight color={colors.textLight} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={themedStyles.navItem}
              onPress={() => {
                // App Store link will be updated after publish
                Alert.alert('Teşekkürler!', 'Uygulama yayınlandıktan sonra App Store\'da puanlayabilirsiniz.');
              }}
            >
              <View style={themedStyles.settingInfo}>
                <Star color={colors.textSecondary} size={20} />
                <Text style={themedStyles.navText}>Uygulamayı Puanla</Text>
              </View>
              <ChevronRight color={colors.textLight} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={themedStyles.navItem}
              onPress={() => {
                Share.share({
                  message: 'KPSS Tarih hazırlık uygulamasını dene! Tüm konular, testler ve bilgi kartları ile sınava hazırlan.',
                });
              }}
            >
              <View style={themedStyles.settingInfo}>
                <Share2 color={colors.textSecondary} size={20} />
                <Text style={themedStyles.navText}>Arkadaşlarınla Paylaş</Text>
              </View>
              <ChevronRight color={colors.textLight} size={18} />
            </TouchableOpacity>
            <TouchableOpacity style={[themedStyles.navItem, { borderBottomWidth: 0 }]}>
              <View style={themedStyles.settingInfo}>
                <Info color={colors.textSecondary} size={20} />
                <Text style={themedStyles.navText}>Versiyon Bilgisi (1.0.0)</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={themedStyles.logoutBtn}
            onPress={() => {
              Alert.alert(
                'Verileri Sıfırla',
                'Tüm ilerlemeniz, test sonuçlarınız ve notlarınız silinecektir. Bu işlem geri alınamaz.',
                [
                  { text: 'İptal', style: 'cancel' },
                  { text: 'Sıfırla', style: 'destructive', onPress: () => resetProgress() },
                ]
              );
            }}
          >
            <LogOut color={colors.error} size={20} />
            <Text style={themedStyles.logoutText}>Verileri Sıfırla</Text>
          </TouchableOpacity>

          <Modal
            visible={isTimePickerVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsTimePickerVisible(false)}
          >
            <Pressable 
              style={themedStyles.modalOverlay} 
              onPress={() => setIsTimePickerVisible(false)}
            >
              <View style={themedStyles.pickerContainer}>
                <View style={themedStyles.pickerHeader}>
                  <Text style={themedStyles.pickerTitle}>Saat Seçin</Text>
                  <TouchableOpacity 
                    onPress={() => setIsTimePickerVisible(false)}
                    hitSlop={10}
                  >
                    <Text style={themedStyles.pickerClose}>Kapat</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={themedStyles.hourList} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        themedStyles.hourItem,
                        progress.reminderTime?.hour === h && themedStyles.hourItemActive
                      ]}
                      onPress={() => {
                        setReminderTime(h, 0);
                        setIsTimePickerVisible(false);
                      }}
                    >
                      <Text style={[
                        themedStyles.hourText,
                        progress.reminderTime?.hour === h && themedStyles.hourTextActive
                      ]}>
                        {h < 10 ? `0${h}` : h}:00
                      </Text>
                      {progress.reminderTime?.hour === h && (
                        <CheckCircle color={colors.primary} size={18} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>

          <View style={themedStyles.bottomSpacer} />
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 24,
  },
  premiumCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  premiumInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
  premiumSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  settingSub: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 1,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeBtnActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  themeBtnTextActive: {
    color: colors.primary,
  },
  timeValueText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500' as const,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  pickerClose: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  hourList: {
    flexGrow: 0,
  },
  hourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  hourItemActive: {
    backgroundColor: colors.primary + '08',
  },
  hourText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
  hourTextActive: {
    fontWeight: '700' as const,
    color: colors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
