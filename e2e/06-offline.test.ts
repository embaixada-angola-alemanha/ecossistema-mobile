import { by, element, expect, device, waitFor } from 'detox';
import { waitForText, takeScreenshot, navigateToTab } from './helpers';

describe('Offline Behaviour', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should handle airplane mode gracefully', async () => {
    // Enable airplane mode
    await device.setURLBlacklist(['.*']);

    // Navigate to visa tab — should show cached data or empty state
    await navigateToTab('Vistos');
    await takeScreenshot('27-offline-visa-list');

    // Disable airplane mode
    await device.setURLBlacklist([]);
  });

  it('should show cached profile data when offline', async () => {
    // First, load profile while online
    await navigateToTab('Início');
    await element(by.text('Perfil')).tap();
    await waitForText('Dados pessoais', 10000);

    // Go offline
    await device.setURLBlacklist(['.*']);

    // Navigate away and back — should still show cached data
    await device.pressBack();
    await element(by.text('Perfil')).tap();

    // Profile should still be visible from cache
    await takeScreenshot('28-offline-profile');

    // Restore connectivity
    await device.setURLBlacklist([]);
  });

  it('should save visa draft when offline', async () => {
    // Go offline
    await device.setURLBlacklist(['.*']);

    await navigateToTab('Vistos');
    await element(by.text('Solicitar visto')).tap();
    await waitForText('Tipo de visto');

    // Select visa type
    await element(by.text('NEGOCIOS')).tap();

    // Save as draft
    await element(by.text('Guardar rascunho')).tap();
    await waitForText('Rascunho guardado');

    await takeScreenshot('29-offline-draft-saved');

    // Restore connectivity
    await device.setURLBlacklist([]);
  });
});
