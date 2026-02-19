import { by, element, expect, device, waitFor } from 'detox';
import { waitForText, takeScreenshot, navigateToTab } from './helpers';

describe('Profile Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should navigate to profile from home', async () => {
    // Navigate to profile
    await element(by.text('Perfil')).tap();
    await waitForText('Dados pessoais', 10000);
    await takeScreenshot('06-profile');
  });

  it('should display personal data section', async () => {
    await expect(element(by.text('Dados pessoais'))).toBeVisible();
  });

  it('should display contact info section', async () => {
    await expect(element(by.text('Contacto'))).toBeVisible();
  });

  it('should display address section', async () => {
    await expect(element(by.text('Morada na Alemanha'))).toBeVisible();
    await takeScreenshot('07-profile-full');
  });
});
