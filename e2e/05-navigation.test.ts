import { by, element, expect, device, waitFor } from 'detox';
import { waitForText, takeScreenshot, navigateToTab } from './helpers';

describe('Navigation & Tab Switching', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should navigate through all tabs', async () => {
    // Home tab
    await navigateToTab('Início');
    await waitForText('Olá', 5000);
    await takeScreenshot('20-tab-home');

    // Documents tab
    await navigateToTab('Documentos');
    await waitForText('Documentos', 5000);
    await takeScreenshot('21-tab-documents');

    // Visa tab
    await navigateToTab('Vistos');
    await waitForText('Vistos', 5000);
    await takeScreenshot('22-tab-visa');

    // Appointments tab
    await navigateToTab('Agenda');
    await waitForText('Agendamentos', 5000);
    await takeScreenshot('23-tab-appointments');

    // News tab
    await navigateToTab('Notícias');
    await waitForText('Notícias', 5000);
    await takeScreenshot('24-tab-news');
  });

  it('should switch language to English', async () => {
    await navigateToTab('Início');
    await element(by.text('Definições')).tap();
    await waitForText('Idioma', 5000);

    // Select English
    await element(by.text('English')).tap();

    // Verify language changed
    await waitForText('Language', 5000);
    await takeScreenshot('25-settings-english');

    // Switch back to Portuguese
    await element(by.text('Português')).tap();
    await waitForText('Idioma', 5000);
  });

  it('should handle back navigation correctly', async () => {
    // Go to settings
    await navigateToTab('Início');
    await element(by.text('Definições')).tap();
    await waitForText('Idioma', 5000);

    // Go back
    await device.pressBack();
    await waitForText('Olá', 5000);
    await takeScreenshot('26-back-to-home');
  });
});
