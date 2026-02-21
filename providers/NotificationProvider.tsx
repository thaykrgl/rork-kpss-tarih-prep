import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useStudy } from './StudyProvider';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const { progress } = useStudy();
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'web') return;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // We don't want to alert on every start if not granted, just silent fail
        return;
      }
      
      try {
        const token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        setExpoPushToken(token);
      } catch (e) {
        console.warn('Push token error:', e);
      }
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B2838',
      });
    }
  }, []);

  const scheduleStudyReminder = useCallback(async (hour: number, minute: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 KPSS Tarih Çalışma Vakti!",
        body: "Bugünkü hedefine ulaşmak için bir test çözmeye ne dersin?",
        data: { screen: '(tabs)/index' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) => setChannels(value ?? []));
    }

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle notification click if needed
      console.log('Notification clicked:', response.notification.request.content.data);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [registerForPushNotificationsAsync]);

  // Sync scheduled reminder with study progress settings
  useEffect(() => {
    if (progress.notificationsEnabled && progress.reminderTime) {
      scheduleStudyReminder(progress.reminderTime.hour, progress.reminderTime.minute);
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }, [progress.notificationsEnabled, progress.reminderTime, scheduleStudyReminder]);

  const sendLocalNotification = useCallback(async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // immediate
    });
  }, []);

  return {
    expoPushToken,
    notification,
    channels,
    scheduleStudyReminder,
    sendLocalNotification,
  };
});
