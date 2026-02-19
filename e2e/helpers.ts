import { by, element, expect, device, waitFor } from 'detox';

/**
 * E2E test helpers for the Ecossistema Mobile app.
 */

/** Wait for an element to be visible with a timeout */
export async function waitForVisible(testID: string, timeout = 10000) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
}

/** Wait for text to appear anywhere on screen */
export async function waitForText(text: string, timeout = 10000) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
}

/** Tap an element by testID */
export async function tap(testID: string) {
  await element(by.id(testID)).tap();
}

/** Tap an element by text label */
export async function tapText(text: string) {
  await element(by.text(text)).tap();
}

/** Type into a text input by testID */
export async function typeText(testID: string, text: string) {
  await element(by.id(testID)).typeText(text);
}

/** Scroll down on a scrollable element */
export async function scrollDown(testID: string, pixels = 300) {
  await element(by.id(testID)).scroll(pixels, 'down');
}

/** Take a screenshot for visual regression */
export async function takeScreenshot(name: string) {
  await device.takeScreenshot(name);
}

/** Login helper: waits for login screen, taps login button */
export async function loginViaKeycloak() {
  // Wait for login screen
  await waitForText('Embaixada Angola', 15000);
  await waitForText('Entrar');

  // Tap login button — this triggers Keycloak OIDC flow
  await tapText('Entrar');

  // Wait for home screen to confirm successful login
  await waitForText('Olá', 30000);
}

/** Navigate to a specific tab */
export async function navigateToTab(tabName: string) {
  await tapText(tabName);
}

/** Pull to refresh on a list */
export async function pullToRefresh(testID: string) {
  await element(by.id(testID)).swipe('down', 'slow', 0.5);
}
