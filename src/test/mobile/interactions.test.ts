import { test, expect } from '@playwright/test';

test.describe('Mobile Interactions - Touch and Virtual Keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost:8080/');
  });

  test('Lead form input focus and zoom prevention', async ({ page }) => {
    await page.click('button[aria-label="Fale conosco pelo WhatsApp"]');
    
    const nameInput = page.locator('#lead-name');
    await nameInput.focus();
    
    // Verification of font-size >= 16px to prevent iOS auto-zoom
    const fontSize = await nameInput.evaluate(el => window.getComputedStyle(el).fontSize);
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
  });

  test('Button tap areas and feedback', async ({ page }) => {
    const fab = page.locator('button[aria-label="Fale conosco pelo WhatsApp"]');
    const box = await fab.boundingBox();
    if (box) {
      // Ensure target is at least 44x44 for WCAG/iOS guidelines
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
