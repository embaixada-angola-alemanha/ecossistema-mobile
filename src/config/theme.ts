export const colors = {
  primary: '#1B4332',       // Embassy green
  primaryLight: '#2D6A4F',
  primaryDark: '#081C15',
  accent: '#D4A020',        // Gold
  accentLight: '#E6C04F',
  ember: '#C4512D',         // Welwitschia ember
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  border: '#DEE2E6',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
  // Status colors
  statusDraft: '#ADB5BD',
  statusPending: '#FFC107',
  statusInProgress: '#17A2B8',
  statusApproved: '#28A745',
  statusRejected: '#DC3545',
  statusIssued: '#1B4332',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};
