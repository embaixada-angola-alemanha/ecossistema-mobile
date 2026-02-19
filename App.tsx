import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from '@navigation/AppNavigator';
import { useAuthStore } from '@store/auth-store';
import { PushNotificationService } from '@services/push-notifications';
import { SyncProcessor } from '@services/sync-processor';
import { OfflineCache } from '@services/offline-cache';
import { withCodePush } from '@services/ota-update';
import { colors } from '@config/theme';
import '@config/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

function App() {
  const restoreSession = useAuthStore(s => s.restoreSession);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Init push notifications
      PushNotificationService.init().catch(e =>
        console.warn('Push notification init failed:', e)
      );

      // Start sync queue processor (auto-syncs when connectivity restored)
      SyncProcessor.start();

      // Evict expired cache entries periodically
      OfflineCache.evictExpired();
    }

    return () => {
      SyncProcessor.stop();
    };
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <AppNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default withCodePush(App);
