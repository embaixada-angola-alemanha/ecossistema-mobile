import codePush, { RemotePackage } from 'react-native-code-push';
import { Alert } from 'react-native';

/**
 * CodePush OTA update service.
 * Checks for and applies over-the-air JavaScript bundle updates.
 */
export const OTAUpdateService = {
  /**
   * CodePush options for the App wrapper HOC.
   * - CHECK_ON_RESUME: checks when app comes to foreground
   * - IMMEDIATE install mode for mandatory updates
   */
  codePushOptions: {
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.ON_NEXT_RESTART,
    mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
  },

  /**
   * Manually check for updates (e.g., from settings screen).
   */
  async checkForUpdate(): Promise<boolean> {
    try {
      const update: RemotePackage | null = await codePush.checkForUpdate();

      if (!update) return false;

      if (update.isMandatory) {
        // Mandatory: install immediately
        Alert.alert(
          'Actualização obrigatória',
          'Uma actualização obrigatória está disponível. A aplicação será actualizada.',
          [{ text: 'OK', onPress: () => OTAUpdateService.installUpdate(update) }]
        );
      } else {
        // Optional: ask user
        Alert.alert(
          'Actualização disponível',
          `Versão ${update.label} disponível. Deseja actualizar agora?`,
          [
            { text: 'Mais tarde', style: 'cancel' },
            { text: 'Actualizar', onPress: () => OTAUpdateService.installUpdate(update) },
          ]
        );
      }

      return true;
    } catch (error) {
      console.warn('CodePush check failed:', error);
      return false;
    }
  },

  /**
   * Download and install an update package.
   */
  async installUpdate(remotePackage: RemotePackage): Promise<void> {
    try {
      const localPackage = await remotePackage.download();
      await localPackage.install(
        remotePackage.isMandatory
          ? codePush.InstallMode.IMMEDIATE
          : codePush.InstallMode.ON_NEXT_RESTART
      );

      if (remotePackage.isMandatory) {
        codePush.restartApp();
      }
    } catch (error) {
      console.warn('CodePush install failed:', error);
    }
  },

  /**
   * Get current installed update metadata.
   */
  async getCurrentVersion(): Promise<string> {
    try {
      const metadata = await codePush.getUpdateMetadata();
      return metadata ? `${metadata.appVersion} (${metadata.label})` : '1.0.0';
    } catch {
      return '1.0.0';
    }
  },
};

/**
 * CodePush HOC wrapper for App component.
 * Usage: export default codePush(OTAUpdateService.codePushOptions)(App);
 */
export const withCodePush = codePush(OTAUpdateService.codePushOptions);
