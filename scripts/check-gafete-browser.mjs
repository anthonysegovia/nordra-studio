import { walkGafete, checkSubtitleInk } from './gafete-real-journey.mjs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { preview } from 'vite';
import fs from 'node:fs';
import { samplePanelFixture } from './sample-panel-fixture.mjs';
const server = process.env.GAFETE_URL
    ? null
    : await preview({
        preview: { host: '127.0.0.1', port: 5612, strictPort: true },
      }),
  base = process.env.GAFETE_URL || 'http://127.0.0.1:5612';
const out = 'documentacion/gafete/final';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  }),
  records = [];
async function open(p) {
  await p.locator('[data-skip]').click();
  await p.waitForFunction(() => document.body.dataset.phase === 'open');
}
async function settled(p) {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(750);
}

try {
  const journeyRecords = [];
  for (const width of [390, 1440])
    for (const kind of ['normal', 'cuando', 'personal']) {
      const context = await b.newContext({
        viewport: { width, height: width === 390 ? 844 : 1000 },
      });
      let target =
        base +
        '/invitaciones/conexion-27/' +
        (kind === 'cuando' ? '#cuando' : '');
      if (kind === 'personal') {
        await context.route('**/api/wedding-links', samplePanelFixture(base));
        const panel = await context.newPage();
        await panel.goto(base + '/panel-evento.html');
        await panel.locator('.ledger-row').first().waitFor();
        target = await panel
          .locator('.workspace-quick-links a')
          .last()
          .getAttribute('href');
        await panel.close();
      }
      const page = await context.newPage();
      await page.goto(target);
      if (kind === 'normal')
        await page.screenshot({ path: `${out}/portada-real-${width}.png` });
      await page.locator('[data-open]').click();
      await page.waitForTimeout(1200);
      if (kind === 'normal')
        await page.screenshot({ path: `${out}/giro-real-${width}.png` });
      await page.waitForFunction(() => document.body.dataset.phase === 'open');
      const result = await walkGafete(page);
      result.subtitle = await checkSubtitleInk(page);
      if (kind === 'normal')
        await page.screenshot({
          path: `${out}/interior-real-${width}.png`,
          fullPage: true,
        });
      if (kind === 'personal') {
        await page.mouse.wheel(0, 100000);
        await page.waitForTimeout(600);
        const order = await page.evaluate(() => {
          const nodes = [
            '.sample-notice',
            '.picker-ribbon',
            '.ticket-tabs',
            '.save',
          ].map((s) => document.querySelector(s));
          return nodes
            .slice(1)
            .every((node, i) =>
              Boolean(
                nodes[i].compareDocumentPosition(node) &
                Node.DOCUMENT_POSITION_FOLLOWING,
              ),
            );
        });
        assert.ok(order, 'personal form follows notice, person, tickets, save');
        await page
          .locator('#confirmacion')
          .screenshot({ path: `${out}/personal-real-${width}.png` });
      }
      journeyRecords.push({ width, kind, ...result });
      await context.close();
    }
  fs.writeFileSync(
    out + '/real-journey.json',
    JSON.stringify(journeyRecords, null, 2),
  );
  console.log(
    'Real journey passed:',
    journeyRecords.map(({ width, kind, visibleImages }) => ({
      width,
      kind,
      visibleImages,
    })),
  );

  for (const width of [390, 1440])
    for (const hash of ['', '#confirmacion', '#invitacion=invalid']) {
      const p = await b.newPage({
        viewport: { width, height: width === 390 ? 844 : 1000 },
        hasTouch: width === 390,
      });
      const errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      await p.goto(base + '/invitaciones/conexion-27/' + hash);
      const menu = p.locator('.celebration-header');
      assert.ok(await menu.evaluate((e) => e.hidden && e.inert));
      assert.equal(
        await p
          .locator('.celebration-content')
          .evaluate((e) => e.hidden && e.inert),
        true,
      );
      await p.keyboard.press('Tab');
      assert.equal(
        await p
          .locator('[data-open]')
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await p.keyboard.press('Enter');
      assert.equal(
        await p.locator('body').getAttribute('data-phase'),
        'opening',
      );
      assert.ok(await menu.evaluate((e) => e.hidden && e.inert));
      await p.waitForFunction(() => document.body.dataset.phase === 'open');
      assert.ok(await menu.evaluate((e) => !e.hidden && !e.inert));
      assert.ok(
        await menu.evaluate(
          (e) => e.getBoundingClientRect().top + scrollY >= 0,
        ),
        'menu stays within the document after focus',
      );
      assert.equal(
        await p.evaluate(() => document.activeElement.id),
        hash ? 'confirmacion' : 'bienvenida',
      );
      await p.locator('[data-cover]').click();
      await p.locator('[data-open]').click();
      await p.keyboard.press('Escape');
      assert.equal(await p.locator('body').getAttribute('data-phase'), 'open');
      await p.locator('[data-cover]').click();
      await p.emulateMedia({ reducedMotion: 'reduce' });
      await p.locator('[data-open]').click();
      await p.waitForFunction(() => document.body.dataset.phase === 'open');
      if (!hash.includes('invitacion')) {
        await p.locator('[data-card="0"]').focus();
        await p.keyboard.press('ArrowRight');
        assert.equal(
          await p.locator('[data-card="1"]').getAttribute('aria-pressed'),
          'true',
        );
        await p.locator('[data-card="2"]').click();
        assert.equal(
          await p.locator('[data-card="2"]').getAttribute('aria-pressed'),
          'true',
        );
        for (const [answer, message] of [
          ['yes', 'Listo. Tu gafete te espera en el registro'],
          ['no', 'Te vamos a extrañar. Te contamos cómo nos fue'],
        ]) {
          await p.locator(`[value=${answer}]`).check();
          assert.equal(
            await p.locator('[data-rsvp-status]').innerText(),
            message,
          );
          assert.equal(
            await p.locator('.access-object').getAttribute('data-answer'),
            answer,
          );
          assert.equal(await p.locator('.qr-wrap').isVisible(), false);
          const other = answer === 'yes' ? 'no' : 'yes';
          await p.waitForFunction(
            (other) =>
              getComputedStyle(
                document.querySelector('.ticket-' + other + ' img'),
              ).opacity === '0.5',
            other,
          );
        }
      }
      assert.deepEqual(errors, []);
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      records.push({
        width,
        hash,
        keyboard: true,
        menu: true,
        escape: true,
        reduced: true,
      });
      await p.close();
    }
  for (const [date, text] of [
    ['2027-06-02T16:00:00Z', 'Faltan 10 días para encontrarnos'],
    ['2027-06-12T05:00:00Z', 'Faltan 11 h y 0 min para encontrarnos'],
    ['2027-06-12T08:00:00Z', 'Hoy nos encontramos'],
    ['2027-06-13T08:00:00Z', 'Gracias por venir'],
  ]) {
    const p = await b.newPage();
    await p.clock.install({ time: new Date(date) });
    await p.goto(base + '/invitaciones/conexion-27/');
    await open(p);
    assert.equal(
      (await p.locator('[data-clock]').textContent())
        .replace(/\s+/g, ' ')
        .trim(),
      text,
    );
    await p.close();
  }
  const nojs = await b.newPage({ javaScriptEnabled: false });
  await nojs.goto(base + '/invitaciones/conexion-27/');
  assert.match(await nojs.locator('noscript').innerText(), /Activa JavaScript/);
  assert.ok(
    await nojs
      .locator('.celebration-header')
      .evaluate((e) => e.hidden && e.inert),
  );
  await nojs.close();
  // Actual sample handler with local storage and signing; no remote account is touched.
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  await ctx.route('**/api/wedding-links', samplePanelFixture(base));
  const panel = await ctx.newPage();
  await panel.goto(base + '/panel-evento.html');
  await panel.locator('.ledger-row').first().waitFor();
  const personal = await panel
    .locator('.workspace-quick-links a')
    .last()
    .getAttribute('href');
  const p = await ctx.newPage();
  await p.goto(personal);
  await open(p);
  assert.equal(await p.locator('.personal-fields select').count(), 1);
  assert.equal(
    await p
      .locator('.personal-fields select')
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(22, 71, 92)',
  );
  await p.locator('.celebration-rsvp select').selectOption('1');
  await p.locator('#guest').fill('Renata Sol');
  await p.locator('[value=yes]').check();
  await p.locator('.save').click();
  await p
    .getByText(
      'Tu respuesta ya está en el panel de muestra. Listo. Tu gafete te espera en el registro',
      { exact: true },
    )
    .waitFor();
  await p.locator('.qr-wrap:not([hidden])').waitFor();
  assert.match(
    await p.locator('[data-admission]').innerText(),
    /Admite a Renata Sol/,
  );
  await settled(p);
  await p
    .locator('#confirmacion')
    .screenshot({ path: out + '/personal-handler-390.png' });
  await panel.reload();
  await panel
    .getByText('Renata Sol', { exact: true })
    .first()
    .waitFor({ state: 'attached' });
  records.push({
    personalRoundTrip: true,
    serverHandler: true,
    borealQr: true,
  });
  await ctx.close();
  // Aurora contract: absence of passLink must never fabricate a QR.
  for (const boreal of [false, true])
    for (const width of [390, 1440]) {
      const p = await b.newPage({
        viewport: { width, height: width === 390 ? 844 : 1000 },
        reducedMotion: 'reduce',
      });
      const token = 'a'.repeat(64),
        id = '11111111-1111-4111-8111-111111111111';
      let people = [
        { id: 'one', name: 'Renata Sol', attendance: 'yes' },
        { id: 'two', name: 'Acompañante', attendance: 'pending' },
      ];
      await p.route('**/api/wedding-links', async (r) => {
        const data = r.request().postDataJSON();
        if (data.people) people = data.people;
        await r.fulfill({
          json: {
            invitation: {
              id: 'wedding-fixture',
              kind: 'plusOne',
              people,
              updated_at: '2026-11-04T12:00:00Z',
              ...(boreal
                ? { passLink: base + '/pase-boda.html#pase=local-only' }
                : {}),
            },
          },
        });
      });
      await p.goto(
        base +
          '/invitaciones/conexion-27/#invitacion=' +
          id +
          '~wedding-fixture~' +
          token,
      );
      await open(p);
      await p
        .locator('[data-admission]')
        .getByText('Admite a Renata Sol')
        .waitFor();
      if (boreal) await p.locator('.qr-wrap:not([hidden])').waitFor();
      else assert.equal(await p.locator('.qr-wrap').isVisible(), false);
      await settled(p);
      await p.locator('#confirmacion').screenshot({
        path: `${out}/acceso-personal-${boreal ? 'boreal' : 'aurora'}-${width}.png`,
      });
      records.push({
        width,
        boreal,
        qr: await p.locator('.qr-wrap').isVisible(),
        height: await p.evaluate(() => document.documentElement.scrollHeight),
      });
      await p.close();
    }
  fs.writeFileSync(
    out + '/browser-checks.json',
    JSON.stringify(records, null, 2),
  );
  console.log('Gafete browser checks passed', records);
} finally {
  await b.close();
  await server?.close();
}
