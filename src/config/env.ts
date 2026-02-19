import Config from 'react-native-config';

export const ENV = {
  API_BASE_URL: Config.API_BASE_URL || 'http://10.0.2.2:8081/api/v1',
  SGC_API_URL: Config.SGC_API_URL || 'http://10.0.2.2:8081/api/v1',
  WN_API_URL: Config.WN_API_URL || 'http://10.0.2.2:8083/api/v1/public',

  // Keycloak OIDC
  KEYCLOAK_URL: Config.KEYCLOAK_URL || 'http://10.0.2.2:8080',
  KEYCLOAK_REALM: Config.KEYCLOAK_REALM || 'ecossistema',
  KEYCLOAK_CLIENT_ID: Config.KEYCLOAK_CLIENT_ID || 'mobile-app',
  KEYCLOAK_REDIRECT_URI: Config.KEYCLOAK_REDIRECT_URI || 'ao.gov.embaixada.mobile://callback',

  // Feature flags
  BIOMETRIC_ENABLED: Config.BIOMETRIC_ENABLED !== 'false',
  PUSH_ENABLED: Config.PUSH_ENABLED !== 'false',
};
