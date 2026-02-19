import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  DocumentsTab: undefined;
  VisaTab: undefined;
  AppointmentsTab: undefined;
  NewsTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  ProcessDetail: { processId: string };
};

export type DocumentsStackParamList = {
  DocumentsList: undefined;
  DocumentDetail: { documentId: string };
  ProcessDocuments: { processId: string };
};

export type VisaStackParamList = {
  VisaList: undefined;
  VisaDetail: { vistoId: string };
  VisaApply: undefined;
  VisaTracking: { vistoId: string };
};

export type AppointmentsStackParamList = {
  AppointmentsList: undefined;
  AppointmentDetail: { appointmentId: string };
  NewAppointment: undefined;
};

export type NewsStackParamList = {
  NewsList: undefined;
  NewsDetail: { slug: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
