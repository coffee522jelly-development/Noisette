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
    await expect(page.getByText('Reference Noise Generator', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  });

  test('Theme toggling works correctly', async ({ page }) => {
    const html = page.locator('html');
    const toggleBtn = page.getByRole('button', { name: /Toggle Theme Mode/i });

    await expect(toggleBtn).toBeVisible();

    const isCurrentlyDark = await html.evaluate(el => el.classList.contains('dark'));

    // We dispatch a click on the toggle element using evaluate
    await toggleBtn.evaluate(b => (b as HTMLElement).click());

    await page.waitForTimeout(1000); // Give time for reactivity to update class

    const isNowDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(isCurrentlyDark).not.toBe(isNowDark);
  });

  test('Visual modes for VU Meter toggle correctly', async ({ page }) => {
    // Check if we see "Retro"
    await expect(page.getByText('Retro').first()).toBeVisible();

    // Switch to Digital mode by clicking the switch directly
    const modeSwitch = page.getByRole('switch');
    await modeSwitch.evaluate(b => (b as HTMLElement).click());

    // Wait for visual change
    await page.waitForTimeout(1000);

    // Check if "Digital" text now has the accent color
    const modeSwitchLabel = page.getByText('Digital', { exact: true });
    const digitalTextClass = await modeSwitchLabel.getAttribute('class') || '';
    expect(digitalTextClass).toMatch(/text-accent/);
  });

  test('Base noise type changes successfully', async ({ page }) => {
    // Select Pink noise
    const pinkRadio = page.getByText('Pink', { exact: true });
    await pinkRadio.evaluate(b => (b as HTMLElement).click());
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="baseNoise"][value="pink"]')).toBeChecked();
  });

  test('Ambient effectors can be toggled simultaneously', async ({ page }) => {
    // Both Rain and Tape should be off initially (we assume, or we just toggle them on)
    const rainBtn = page.locator('button').filter({ hasText: 'Rain' });
    const tapeBtn = page.locator('button').filter({ hasText: 'Tape' });

    await rainBtn.evaluate(b => (b as HTMLElement).click());
    await tapeBtn.evaluate(b => (b as HTMLElement).click());

    await page.waitForTimeout(500);

    // Verify visual state of toggled buttons (we check if the LED indicator inside changed color)
    // The LED indicator changes from empty or black to text-primary or bg-primary
    const rainIndicator = rainBtn.locator('div > div').nth(1);
    const tapeIndicator = tapeBtn.locator('div > div').nth(1);

    const rainClass = await rainIndicator.getAttribute('class') || '';
    const tapeClass = await tapeIndicator.getAttribute('class') || '';

    expect(rainClass).toMatch(/bg-primary/);
    expect(tapeClass).toMatch(/bg-primary/);
  });
});
