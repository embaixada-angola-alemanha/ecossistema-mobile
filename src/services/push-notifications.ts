import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sgcApi } from './api';

const FCM_TOKEN_KEY = 'fcm_token';

export const PushNotificationService = {
  async init(): Promise<void> {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return;

    // Get FCM token
    const token = await messaging().getToken();
    await PushNotificationService.registerToken(token);

    // Listen for token refresh
    messaging().onTokenRefresh(async (newToken) => {
      await PushNotificationService.registerToken(newToken);
    });

    // Configure local notification channel (Android)
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'ecossistema-default',
          channelName: 'Embaixada Angola',
          channelDescription: 'Notificações dos serviços consulares',
          importance: 4,
          vibrate: true,
        },
        () => {}
      );
    }

    // Foreground handler
    messaging().onMessage(async (remoteMessage) => {
      PushNotification.localNotification({
        channelId: 'ecossistema-default',
        title: remoteMessage.notification?.title || 'Embaixada Angola',
        message: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
      });
    });

    // Background/quit handler for deep linking
    messaging().onNotificationOpenedApp((remoteMessage) => {
      PushNotificationService.handleDeepLink(remoteMessage.data);
    });

    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      PushNotificationService.handleDeepLink(initialNotification.data);
    }
  },

  async registerToken(token: string): Promise<void> {
    const previousToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (previousToken === token) return;

    try {
      await sgcApi.post('/notifications/register-device', {
        token,
        platform: Platform.OS,
      });
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    } catch (e) {
      console.warn('Failed to register FCM token:', e);
    }
  },

  handleDeepLink(data: Record<string, string> | undefined): void {
    if (!data) return;

    if (data.vistoId) {
      Linking.openURL(`ao.gov.embaixada.mobile://visa/${data.vistoId}`);
    } else if (data.agendamentoId) {
      Linking.openURL(`ao.gov.embaixada.mobile://appointment/${data.agendamentoId}`);
    } else if (data.articleSlug) {
      Linking.openURL(`ao.gov.embaixada.mobile://news/${data.articleSlug}`);
    }
  },
};
