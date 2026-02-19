import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const biometrics = new ReactNativeBiometrics();
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const BiometricService = {
  async isAvailable(): Promise<{ available: boolean; biometryType: string | undefined }> {
    const { available, biometryType } = await biometrics.isSensorAvailable();
    return { available, biometryType };
  },

  async isEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  },

  async setEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
  },

  async authenticate(promptMessage = 'Confirme a sua identidade'): Promise<boolean> {
    try {
      const { success } = await biometrics.simplePrompt({ promptMessage });
      return success;
    } catch {
      return false;
    }
  },

  getBiometryLabel(biometryType: string | undefined): string {
    switch (biometryType) {
      case BiometryTypes.FaceID: return 'Face ID';
      case BiometryTypes.TouchID: return 'Touch ID';
      case BiometryTypes.Biometrics: return 'Biometria';
      default: return 'Biometria';
    }
  },
};
