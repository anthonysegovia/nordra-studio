import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { host: '127.0.0.1', port: 0 } });
let browser;
try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const base = server.resolvedUrls.local[0].replace(/\/$/, '');
  for (const prefix of ['', '/en']) {
    for (const hash of ['temporada', 'temporadas', 'plan-temporada']) {
      await page.goto(`${base}${prefix}/invitaciones#${hash}`);
      await page.waitForURL(`${base}${prefix}/temporada`);
      assert.equal(new URL(page.url()).hash, '');
      console.log(`375px: ${prefix}/invitaciones#${hash} -> ${prefix}/temporada`);
    }
    for (const route of ['bodas', 'cumpleanos', 'eventos']) {
      await page.goto(`${base}${prefix}/${route}`, { waitUntil: 'networkidle' });
      const tabs = page.getByRole('tab');
      assert.equal(await tabs.count(), 2);
      for (const text of await tabs.allTextContents()) assert.doesNotMatch(text, /\b0[12]\b/);
      await tabs.nth(1).click();
      await page.waitForFunction(() => document.querySelectorAll('[role="tab"]')[1].getAttribute('aria-selected') === 'true');
      await tabs.nth(0).click();
      assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
      await tabs.nth(0).press('End');
      assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
      console.log(`375px: ${prefix}/${route} tabs without numbers; click and keyboard selection OK`);
    }
  }
} finally {
  await browser?.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
