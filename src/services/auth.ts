import { authorize, refresh, revoke, AuthConfiguration } from 'react-native-app-auth';
import { ENV } from '@config/env';
import { SecureStorage } from './secure-storage';
import { BiometricService } from './biometric';
import { AuthTokens, UserProfile } from '@types/auth';
import { jwtDecode } from './jwt-decode';

const authConfig: AuthConfiguration = {
  issuer: `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}`,
  clientId: ENV.KEYCLOAK_CLIENT_ID,
  redirectUrl: ENV.KEYCLOAK_REDIRECT_URI,
  scopes: ['openid', 'profile', 'email', 'offline_access'],
  usePKCE: true,
  serviceConfiguration: {
    authorizationEndpoint: `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
    tokenEndpoint: `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/token`,
    revocationEndpoint: `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/revoke`,
    endSessionEndpoint: `${ENV.KEYCLOAK_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
  },
};

export const AuthService = {
  async login(): Promise<AuthTokens> {
    const result = await authorize(authConfig);

    const tokens: AuthTokens = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      idToken: result.idToken,
      expiresAt: new Date(result.accessTokenExpirationDate).getTime(),
    };

    await SecureStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  async refreshTokens(currentRefreshToken: string): Promise<AuthTokens> {
    const result = await refresh(authConfig, { refreshToken: currentRefreshToken });

    const tokens: AuthTokens = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken || currentRefreshToken,
      idToken: result.idToken,
      expiresAt: new Date(result.accessTokenExpirationDate).getTime(),
    };

    await SecureStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  async logout(idToken?: string): Promise<void> {
    try {
      if (idToken) {
        await revoke(authConfig, { tokenToRevoke: idToken, sendClientId: true });
      }
    } catch (e) {
      console.warn('Revoke failed (may be expired):', e);
    }
    await SecureStorage.clearTokens();
  },

  async tryRestoreSession(): Promise<AuthTokens | null> {
    const stored = await SecureStorage.getTokens();
    if (!stored) return null;

    // Check if biometric is required
    const biometricEnabled = await BiometricService.isEnabled();
    if (biometricEnabled) {
      const { available } = await BiometricService.isAvailable();
      if (available) {
        const authenticated = await BiometricService.authenticate();
        if (!authenticated) return null;
      }
    }

    // Try to refresh the token
    try {
      return await AuthService.refreshTokens(stored.refreshToken);
    } catch {
      await SecureStorage.clearTokens();
      return null;
    }
  },

  extractUserProfile(accessToken: string): UserProfile {
    const decoded = jwtDecode(accessToken);
    const realmRoles = decoded.realm_access?.roles || [];
    const resourceRoles = decoded.resource_access?.[ENV.KEYCLOAK_CLIENT_ID]?.roles || [];
    const roles = [...realmRoles, ...resourceRoles];

    return {
      id: decoded.sub || '',
      username: decoded.preferred_username || '',
      email: decoded.email || '',
      firstName: decoded.given_name || '',
      lastName: decoded.family_name || '',
      fullName: `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
      roles,
      keycloakId: decoded.sub || '',
    };
  },

  isTokenExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expiresAt - 30000; // 30s buffer
  },
};
