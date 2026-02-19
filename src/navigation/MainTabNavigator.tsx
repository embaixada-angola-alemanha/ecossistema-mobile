import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '@config/theme';
import {
  MainTabParamList,
  HomeStackParamList,
  DocumentsStackParamList,
  VisaStackParamList,
  AppointmentsStackParamList,
  NewsStackParamList,
} from './types';

// Screen imports
import { HomeScreen } from '@screens/home/HomeScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { SettingsScreen } from '@screens/settings/SettingsScreen';
import { DocumentsListScreen } from '@screens/documents/DocumentsListScreen';
import { VisaListScreen } from '@screens/visa/VisaListScreen';
import { VisaApplyScreen } from '@screens/visa/VisaApplyScreen';
import { VisaTrackingScreen } from '@screens/visa/VisaTrackingScreen';
import { AppointmentsListScreen } from '@screens/appointments/AppointmentsListScreen';
import { NewAppointmentScreen } from '@screens/appointments/NewAppointmentScreen';
import { AppointmentDetailScreen } from '@screens/appointments/AppointmentDetailScreen';
import { NewsListScreen } from '@screens/news/NewsListScreen';
import { NewsDetailScreen } from '@screens/news/NewsDetailScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// === Home Stack ===
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
    </HomeStack.Navigator>
  );
}

// === Documents Stack ===
const DocsStack = createNativeStackNavigator<DocumentsStackParamList>();
function DocumentsStackScreen() {
  return (
    <DocsStack.Navigator screenOptions={{ headerShown: false }}>
      <DocsStack.Screen name="DocumentsList" component={DocumentsListScreen} />
    </DocsStack.Navigator>
  );
}

// === Visa Stack ===
const VisStack = createNativeStackNavigator<VisaStackParamList>();
function VisaStackScreen() {
  return (
    <VisStack.Navigator screenOptions={{ headerShown: false }}>
      <VisStack.Screen name="VisaList" component={VisaListScreen} />
      <VisStack.Screen name="VisaApply" component={VisaApplyScreen} />
      <VisStack.Screen name="VisaTracking" component={VisaTrackingScreen} />
    </VisStack.Navigator>
  );
}

// === Appointments Stack ===
const ApptStack = createNativeStackNavigator<AppointmentsStackParamList>();
function AppointmentsStackScreen() {
  return (
    <ApptStack.Navigator screenOptions={{ headerShown: false }}>
      <ApptStack.Screen name="AppointmentsList" component={AppointmentsListScreen} />
      <ApptStack.Screen name="NewAppointment" component={NewAppointmentScreen} />
      <ApptStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </ApptStack.Navigator>
  );
}

// === News Stack ===
const NStack = createNativeStackNavigator<NewsStackParamList>();
function NewsStackScreen() {
  return (
    <NStack.Navigator screenOptions={{ headerShown: false }}>
      <NStack.Screen name="NewsList" component={NewsListScreen} />
      <NStack.Screen name="NewsDetail" component={NewsDetailScreen} />
    </NStack.Navigator>
  );
}

// === Tab Navigator ===
export function MainTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: 4 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="DocumentsTab"
        component={DocumentsStackScreen}
        options={{
          tabBarLabel: t('tabs.documents'),
          tabBarIcon: ({ color, size }) => <Icon name="file-document" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="VisaTab"
        component={VisaStackScreen}
        options={{
          tabBarLabel: t('tabs.visa'),
          tabBarIcon: ({ color, size }) => <Icon name="passport" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AppointmentsTab"
        component={AppointmentsStackScreen}
        options={{
          tabBarLabel: t('tabs.appointments'),
          tabBarIcon: ({ color, size }) => <Icon name="calendar-clock" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="NewsTab"
        component={NewsStackScreen}
        options={{
          tabBarLabel: t('tabs.news'),
          tabBarIcon: ({ color, size }) => <Icon name="newspaper" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
