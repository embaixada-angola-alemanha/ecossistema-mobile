import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@store/auth-store';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './types';
import { SplashScreen } from '@screens/auth/SplashScreen';
import { colors } from '@config/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['ao.gov.embaixada.mobile://', 'https://embaixada-angola.de/app'],
  config: {
    screens: {
      Main: {
        screens: {
          VisaTab: {
            screens: {
              VisaTracking: 'visa/:vistoId',
            },
          },
          AppointmentsTab: {
            screens: {
              AppointmentDetail: 'appointment/:appointmentId',
            },
          },
          NewsTab: {
            screens: {
              NewsDetail: 'news/:slug',
            },
          },
        },
      },
    },
  },
};

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
