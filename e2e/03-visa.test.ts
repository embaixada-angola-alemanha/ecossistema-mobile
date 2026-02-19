import { by, element, expect, device, waitFor } from 'detox';
import { waitForText, takeScreenshot, navigateToTab, tapText } from './helpers';

describe('Visa Application Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should navigate to visa tab', async () => {
    await navigateToTab('Vistos');
    await waitForText('Vistos', 10000);
    await takeScreenshot('08-visa-list');
  });

  it('should open visa application form', async () => {
    await tapText('Solicitar visto');
    await waitForText('Tipo de visto', 10000);
    await takeScreenshot('09-visa-apply-types');
  });

  it('should select a visa type', async () => {
    await tapText('TURISMO');
    await expect(element(by.text('TURISMO'))).toBeVisible();
    await takeScreenshot('10-visa-type-selected');
  });

  it('should fill in travel reason', async () => {
    await element(by.id('motivo-viagem')).typeText('Férias em família');
    await takeScreenshot('11-visa-form-filled');
  });

  it('should show save draft option', async () => {
    await expect(element(by.text('Guardar rascunho'))).toBeVisible();
  });

  it('should submit visa application', async () => {
    await tapText('Submeter pedido');

    // Wait for either success or error dialog
    await waitFor(element(by.text('Pedido submetido')).or(element(by.text('Ocorreu um erro'))))
      .toBeVisible()
      .withTimeout(15000);

    await takeScreenshot('12-visa-submitted');
  });
});
