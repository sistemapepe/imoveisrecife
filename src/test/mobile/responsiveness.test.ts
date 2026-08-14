import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness - iOS/Android Emulation', () => {
  test.beforeEach(async ({ page }) => {
    // Set to a common mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12/13/14
    await page.goto('http://localhost:8080/');
  });

  test('Navbar and BottomNav visibility and positioning', async ({ page }) => {
    // Check Navbar
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
    
    // Check BottomNav
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav).toBeVisible();
    
    // Ensure BottomNav is at the bottom using safe-area padding
    const box = await bottomNav.boundingBox();
    if (box) {
      expect(box.y + box.height).toBeGreaterThanOrEqual(800);
    }
  });

  test('Lead Capture Modal mobile layout', async ({ page }) => {
    // Trigger WhatsApp FAB to open modal
    await page.click('button[aria-label="Fale conosco pelo WhatsApp"]');
    
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Check if it fits within viewport width
    const box = await modal.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }
  });
});
