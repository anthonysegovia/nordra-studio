import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addWhatsAppOrigins } from '../build/whatsapp-origin.mjs';
import { whatsappURL } from '../src/site/birthday-sign/state.js';

const anchor = '<a href="https://wa.me/528129022231?text=Hola%20Nordra" data-invitation-offer="aurora">Contactar</a>';
test('personalized birthday messages retain the origin provided by the build', () => {
  for (const lang of ['es', 'en']) {
    const path = lang === 'en' ? '/en/cumpleanos.html' : '/cumpleanos.html';
    const source = '<a href="#" data-analytics-whatsapp="letrero">Personalizar</a>' + anchor.replace('data-invitation-offer="aurora"', 'data-analytics-whatsapp="closing"');
    const html = addWhatsAppOrigins(source, path);
    const origin = html.match(/data-whatsapp-origin="([^"]+)"/)[1];
    assert.ok(html.startsWith('<a href="https://wa.me/'));
    for (const style of ['neon', 'caja', 'bar', 'xv', 'espacio']) {
      const message = new URL(whatsappURL({ name: 'Ana', age: '30', lang, style, origin })).searchParams.get('text');
      assert.ok(message.endsWith('\n\n' + origin));
    }
  }
});
test('WhatsApp origin is scoped, localized and preserves original content', () => {
  for (const path of ['/gestion.html', '/panel-boda.html', '/demos/example/index.html', '/invitaciones/cliente/index.html', '/mi-boda.html']) {
    assert.equal(addWhatsAppOrigins(anchor, path), anchor);
  }
  for (const [path, expected] of [['/index.html', 'Desde nordrastudio.mx'], ['/bodas.html', 'Desde nordrastudio.mx/bodas'], ['/en/bodas.html', 'From nordrastudio.mx/en/bodas']]) {
    const result = addWhatsAppOrigins(anchor, path);
    const url = new URL(result.match(/href="([^"]+)"/)[1]);
    assert.equal(url.searchParams.get('text'), 'Hola Nordra\n\n' + expected + ' · Aurora');
  }
});

