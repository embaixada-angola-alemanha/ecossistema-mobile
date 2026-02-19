import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'ao.gov.embaixada.ecossistema';

export const SecureStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Keychain.setGenericPassword(
      'tokens',
      JSON.stringify({ accessToken, refreshToken }),
      { service: SERVICE_NAME, accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED }
    );
  },

  async getTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const result = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    if (result && result.password) {
      return JSON.parse(result.password);
    }
    return null;
  },

  async clearTokens(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  },

  async hasTokens(): Promise<boolean> {
    const result = await Keychain.getGenericPassword({ service: SERVICE_NAME });
    return !!result;
  },
};
