import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demo = process.argv.includes('--demo');
const venue = demo ? 'Jardín Aurora' : 'La Covadonga, NL 20 2002, Cieneguilla, 67308 Santiago, N.L., México';
const summary = demo ? 'Se viene la posada · Demo' : 'Se viene la posada';
const cardName = demo ? 'invitacion-posada-demo.jpg' : 'invitacion-posada-covadonga.jpg';
const folder = resolve(project, `public/demos/${demo ? 'posada-pinata' : 'posada-luz'}`);
const html = await readFile(resolve(folder, 'index.html'), 'utf8');
const js = await readFile(resolve(folder, 'posada.js'), 'utf8');
const ics = await readFile(resolve(folder, 'se-viene-la-posada.ics'), 'utf8');
new Script(js, { filename: 'posada.js' });
new Script(await readFile(resolve(folder, 'keepsake.js'), 'utf8'), { filename: 'keepsake.js' });
new Script(await readFile(resolve(folder, 'interaction-motion.js'), 'utf8'), { filename: 'interaction-motion.js' });

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');
for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Missing anchor ${href}`);
  else if (href.startsWith('./')) await access(resolve(folder, href));
  else if (href.startsWith('/') && !href.includes('.html')) await access(resolve(project, 'public', href.slice(1)));
}

assert.ok(!/(?<!\r)\n/.test(ics), 'Calendar must use CRLF line endings');
const lines = ics.trimEnd().split('\r\n');
assert.equal(lines[0], 'BEGIN:VCALENDAR');
assert.equal(lines.at(-1), 'END:VCALENDAR');
for (const line of lines) assert.ok(Buffer.byteLength(line) <= 75, 'Long calendar lines must be folded');
assert.ok(lines.includes('VERSION:2.0'));
assert.ok(lines.includes(`SUMMARY:${summary}`));
assert.ok(ics.replace(/\r\n /g, '').includes(`LOCATION:${venue.replaceAll(',', '\\,')}`));
const start = lines.find(line => line.startsWith('DTSTART:')).slice(8);
assert.equal(start, '20261220T000000Z', '18:00 in Monterrey is midnight UTC on Dec 20');
const iso = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}T${start.slice(9, 11)}:${start.slice(11, 13)}:${start.slice(13, 15)}Z`;
const local = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Monterrey', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
assert.equal(local, 'Saturday, 19/12/2026, 18:00');
assert.equal(Date.parse(iso), Date.parse(html.match(/datetime="([^"]+)"/)[1]), 'Calendar and visible date must describe the same instant');
assert.ok(js.includes(html.match(/datetime="([^"]+)"/)[1]), 'Countdown must target the invitation time');
assert.ok(!lines.some(line => /^(DTEND|DURATION|ATTENDEE|ORGANIZER):/.test(line)), 'Do not invent an end time or RSVP contacts');
if (demo) assert.ok(!/<form\b/.test(html));
else {
  assert.ok(html.includes('id="rsvp-form"'));
  assert.ok(html.includes('name="attendance"'));
  new Script(await readFile(resolve(folder, 'event-details.js'), 'utf8'));
  assert.ok(html.includes('25.356768%2C-100.164319'));
}
assert.ok(/<main id="invitation">/.test(html), 'Content remains available without JavaScript');
assert.ok(/id="entry" hidden/.test(html), 'Opening is a progressive enhancement');

const google = new URL(html.match(/href="(https:\/\/calendar.google.com\/[^\"]+)"/)[1].replaceAll('&amp;', '&'));
assert.equal(google.searchParams.get('action'), 'TEMPLATE');
assert.equal(google.pathname, '/calendar/render', 'Use the mobile-compatible Google template route');
assert.equal(google.searchParams.get('text'), summary);
assert.equal(google.searchParams.get('location'), venue);
assert.equal(google.searchParams.get('ctz'), 'America/Monterrey');
// Same instant at both ends represents the start only, without inventing a finish.
assert.deepEqual(google.searchParams.get('dates').split('/'), [start, start]);
const googleWeb = new URL(html.match(/href="(https:\/\/accounts.google.com\/[^\"]+)"/)[1].replaceAll('&amp;', '&'));
assert.equal(googleWeb.pathname, '/AccountChooser');
assert.equal(googleWeb.searchParams.get('service'), 'cl');
assert.equal(googleWeb.searchParams.get('continue'), google.href, 'The browser fallback must retain the complete event through Google sign-in');
assert.ok(html.includes('Revisa el evento y toca Guardar'), 'Make the final confirmation in Google clear');
const appleLink = html.match(/<a\b[^>]*class="calendar-option"[^>]*>/)[0];
assert.ok(appleLink.includes('type="text/calendar"') && !appleLink.includes('download'), 'Let iOS open the calendar instead of forcing a file download');
assert.ok(html.includes('download="se-viene-la-posada.ics"'), 'Keep a calendar-file fallback');
const card = await readFile(resolve(folder, `assets/${cardName}`));
assert.equal(card.readUInt16BE(0), 0xffd8, 'Download must be a real JPEG');
assert.ok(card.length > 100000 && card.length < 1500000, 'Keep the high-resolution download reasonably small');
assert.equal(html.match(/class="invitation-download"[^>]+download="([^"]+)"/)[1], cardName, 'Invitation download works without JavaScript');
assert.ok(/<dialog[^>]+aria-labelledby="download-title"/.test(html), 'Preview has a labelled native modal');
if (demo) {
  const keepsake = await readFile(resolve(folder, 'keepsake.js'), 'utf8');
  assert.ok(!/covadonga|BYOB|juegos|posada-luz/i.test(html + ics + keepsake), 'The demo must not retain the original event data');
  assert.ok(html.includes('Demo de posada · Datos de ejemplo'));
  assert.ok(html.includes('https://nordrastudio.mx/demos/posada-pinata/assets/posada-demo-social-v1.jpg'));
  assert.ok(google.searchParams.get('details').includes('Cena, piñata e intercambio'));
  assert.ok(lines.includes('UID:demo-posada-pinata-20261219@nordrastudio.mx'));
}
console.log(`Posada${demo ? ' demo' : ''}: assets, anchors, JavaScript, JPEG and both calendar paths checked. Saturday 19 December 2026, 18:00 Monterrey.`);
