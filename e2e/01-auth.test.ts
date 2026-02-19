import { by, element, expect, device, waitFor } from 'detox';
import { waitForVisible, waitForText, takeScreenshot } from './helpers';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should show splash screen on launch', async () => {
    await waitForText('Embaixada Angola', 15000);
    await takeScreenshot('01-splash');
  });

  it('should display login screen with Keycloak button', async () => {
    await waitForText('Entrar');
    await expect(element(by.text('Entrar'))).toBeVisible();
    await takeScreenshot('02-login');
  });

  it('should navigate to home after login', async () => {
    // Tap login — triggers Keycloak auth flow
    await element(by.text('Entrar')).tap();

    // In E2E environment, the mock auth should return immediately
    // Wait for home screen to appear
    await waitForText('Olá', 30000);
    await takeScreenshot('03-home-after-login');
  });

  it('should display quick actions on home screen', async () => {
    await waitForText('Acções rápidas');
    await expect(element(by.text('Acções rápidas'))).toBeVisible();
    await takeScreenshot('04-home-quick-actions');
  });

  it('should navigate to settings and back', async () => {
    // Tap settings icon (gear in home header)
    await element(by.text('Definições')).tap();
    await waitForText('Idioma');
    await takeScreenshot('05-settings');

    // Go back
    await element(by.id('back-button')).tap();
    await waitForText('Olá');
  });
});
