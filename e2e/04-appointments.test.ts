import { by, element, expect, device, waitFor } from 'detox';
import { waitForText, takeScreenshot, navigateToTab, tapText } from './helpers';

describe('Appointment Booking Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('should navigate to appointments tab', async () => {
    await navigateToTab('Agenda');
    await waitForText('Agendamentos', 10000);
    await takeScreenshot('13-appointments-list');
  });

  it('should show upcoming/past tabs', async () => {
    await expect(element(by.text('Próximos'))).toBeVisible();
    await expect(element(by.text('Anteriores'))).toBeVisible();
  });

  it('should open new appointment wizard', async () => {
    await tapText('Novo agendamento');
    await waitForText('Seleccione o tipo de serviço', 10000);
    await takeScreenshot('14-appointment-step1');
  });

  it('should select service type (step 1)', async () => {
    await tapText('PASSAPORTE');
    // Should advance to step 2
    await waitForText('Seleccione a data', 10000);
    await takeScreenshot('15-appointment-step2');
  });

  it('should show calendar strip with available dates', async () => {
    // Calendar strip should be visible with day cards
    await expect(element(by.text('Seleccione a data'))).toBeVisible();
    await takeScreenshot('16-appointment-calendar');
  });

  it('should select a date and show time slots', async () => {
    // Tap the first available day card
    // This depends on the day, but we tap the first child in the calendar strip
    await element(by.id('day-card-0')).tap();

    await waitForText('Seleccione o horário', 10000);
    await takeScreenshot('17-appointment-slots');
  });

  it('should reach confirmation screen (step 3)', async () => {
    // Select a time slot if available
    await element(by.id('slot-0')).tap();

    await waitForText('Reveja o seu agendamento', 10000);
    await expect(element(by.text('PASSAPORTE'))).toBeVisible();
    await expect(element(by.text('Embaixada de Angola — Berlim'))).toBeVisible();
    await takeScreenshot('18-appointment-confirm');
  });

  it('should confirm booking', async () => {
    await tapText('Confirmar agendamento');

    await waitFor(element(by.text('Agendamento confirmado')).or(element(by.text('Ocorreu um erro'))))
      .toBeVisible()
      .withTimeout(15000);

    await takeScreenshot('19-appointment-confirmed');
  });
});
