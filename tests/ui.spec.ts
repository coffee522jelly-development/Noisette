import { test, expect } from '@playwright/test';

test.describe('Noisen App UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the built app preview server
    await page.goto('/');
    // Wait for the app to hydrate
    await page.waitForTimeout(2000);
  });

  test('Layout and typography load correctly', async ({ page }) => {
    await expect(page.getByText('Noisen', { exact: false })).toBeVisible();
    await expect(page.getByText('Reference Noise Generator', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  });

  test('Theme toggling works correctly', async ({ page }) => {
    // Check initial state
    const toggleBtn = page.getByRole('button', { name: /Mode/i });
    await expect(toggleBtn).toBeVisible();

    const initialState = await toggleBtn.innerText();

    // We dispatch a click on the toggle element using evaluate
    await toggleBtn.evaluate(b => (b as HTMLElement).click());

    await page.waitForTimeout(1000); // Give time for reactivity to update class

    const newState = await toggleBtn.innerText();
    expect(initialState).not.toBe(newState);
  });

  test('Visual modes for VU Meter toggle correctly', async ({ page }) => {
    // Check if we see "Retro"
    await expect(page.getByText('Retro').first()).toBeVisible();

    // Switch to Digital mode by clicking the switch
    const modeSwitch = page.getByRole('switch');
    await modeSwitch.evaluate(b => (b as HTMLElement).click());

    // Wait for visual change
    await page.waitForTimeout(1000);

    // Check if "Digital" text now has the accent color
    const modeSwitchLabel = page.getByText('Digital', { exact: false });
    const digitalTextClass = await modeSwitchLabel.getAttribute('class') || '';
    expect(digitalTextClass).toMatch(/text-accent/);
  });

  test('Noise type changes successfully', async ({ page }) => {
    // Select Pink noise
    const pinkRadio = page.getByText('Pink', { exact: false });
    await pinkRadio.evaluate(b => (b as HTMLElement).click());
    await page.waitForTimeout(1000);
    await expect(page.locator('input[value="pink"]')).toBeChecked();
  });
});
