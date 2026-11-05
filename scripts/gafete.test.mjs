import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { invitation } from '../src/celebrations/gafete/config.mjs';
import { scene, renderGafete } from '../src/celebrations/gafete/template.mjs';
import { countdown, eventStamp } from '../src/celebrations/gafete/clock.mjs';
test('Monterrey countdown handles distant, last day, local day and past boundaries', () => {
  assert.equal(eventStamp(invitation), '2027-06-12T10:00:00-06:00');
  for (const [time, text] of [
    ['2027-06-02T16:00:00Z', 'Faltan 10 días para encontrarnos'],
    ['2027-06-12T05:00:00Z', 'Faltan 11 h y 0 min para encontrarnos'],
    ['2027-06-12T06:00:00Z', 'Hoy nos encontramos'],
    ['2027-06-13T05:59:00Z', 'Hoy nos encontramos'],
    ['2027-06-13T06:00:00Z', 'Gracias por venir'],
  ])
    assert.equal(countdown(invitation, new Date(time)), text);
});
test('gafete renders real configurable content, initial inert states and no old copy', () => {
  const html = scene();
  assert.match(
    html,
    /<button[^>]+data-open[^>]+aria-label="Dale la vuelta al gafete para abrir la invitación"/,
  );
  assert.match(html, /class="celebration-header" hidden inert/);
  assert.match(html, /class="celebration-content" hidden inert/);
  assert.doesNotMatch(
    html,
    /Buenas ideas en buena compañía|Un espacio para encontrarnos|Así nos encontramos|Probar confirmación/,
  );
  for (const [time, title, description] of invitation.agenda)
    for (const text of [time, title, description])
      assert.ok(html.includes(text));
  assert.equal((html.match(/name="attendance"/g) || []).length, 2);
  assert.match(html, /class="qr-wrap" hidden/);
  assert.equal(renderGafete('unrelated'), 'unrelated');
  const other = structuredClone(invitation);
  other.name = 'Congreso Nexo';
  other.agenda[0][1] = 'Apertura';
  assert.ok(scene(other).includes('Congreso Nexo'));
  assert.ok(scene(other).includes('Apertura'));
});
test('gafete does not import shared invitation styling or Three', () => {
  for (const file of ['main.js', 'opening.js', 'invitation.css'])
    assert.doesNotMatch(
      readFileSync('src/celebrations/gafete/' + file, 'utf8'),
      /three|\.\.\/invitation\.(?:css|js)/,
    );
});
