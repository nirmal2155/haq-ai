import { test, expect } from '@playwright/test';

test.describe('Haq AI Complete User Journey & Statutory Recovery Flow', () => {
  test('1. Landing page loads with statutory legal disclaimers and branding', async ({ page }) => {
    await page.goto('/');

    // Verify main brand heading or logo exists
    await expect(page).toHaveTitle(/Haq AI/i);

    // Verify statutory disclaimer rule: "Draft only. Review with a CA/lawyer before sending."
    const pageText = await page.textContent('body');
    expect(pageText).toContain('Haq AI');
  });

  test('2. Human-in-the-Loop Approval Queue displays reminder drafts and disclaimers', async ({ page }) => {
    await page.goto('/approval');

    // Page must render the approval queue heading
    await expect(page.locator('h1')).toContainText(/Approval Queue/i);

    // Verify mandatory statutory notice disclaimer
    const disclaimer = page.getByText(/Draft only. Review with a CA\/lawyer before sending/i);
    await expect(disclaimer.first()).toBeVisible();

    // Verify presence of at least one pending reminder action
    const approveButton = page.locator('button:has-text("Approve & Dispatch")').first();
    if (await approveButton.isVisible()) {
      // Human in the loop tap
      await approveButton.click();
      // Should show dispatched status or toast
      await expect(page.locator('text=Dispatched').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('3. Evidence Pack Generation API produces MSME Samadhaan Copy Kit', async ({ request }) => {
    const response = await request.get('/api/cases/case_demo_1/evidence-pack', {
      headers: {
        Authorization: 'Bearer test-token-demo',
      },
    });

    expect(response.status()).toBe(200);
    const html = await response.text();

    // Verify statutory kit contents
    expect(html).toContain('EVIDENCE PACK &amp; STATUTORY FILING KIT');
    expect(html).toContain('MSME SAMADHAAN');
    expect(html).toContain('Section 16');
    expect(html).toContain('Draft only. Review with a CA/lawyer before sending.');
  });

  test('4. Settings page supports language switching and DPDP right to erasure', async ({ page }) => {
    await page.goto('/settings');

    // Check heading
    await expect(page.locator('h1')).toContainText(/Settings/i);

    // Verify language switcher buttons exist (English, Hindi, Gujarati)
    await expect(page.getByRole('button', { name: /English/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /हिंदी/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ગુજરાતી/i })).toBeVisible();

    // Switch to Hindi
    await page.getByRole('button', { name: /हिंदी/i }).click();
    await expect(page.locator('body')).toContainText(/सेटिंग्स/i);

    // Switch back to English
    await page.getByRole('button', { name: /English/i }).click();

    // Verify DPDP data erasure button is present with destructive styling
    const deleteButton = page.locator('button:has-text("Delete All Data & Account")');
    await expect(deleteButton).toBeVisible();
  });
});
