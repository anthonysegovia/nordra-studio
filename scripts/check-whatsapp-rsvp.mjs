import assert from 'node:assert/strict';
import test from 'node:test';
import { whatsappRsvpMessage, whatsappRsvpUrl } from '../src/lib/whatsappRsvp.ts';

test('RSVP targets the configured host and preserves the event text through URL encoding', () => {
  // Fictional NANP number: never navigate or send a message in this test.
  const url = new URL(whatsappRsvpUrl('+1 (202) 555-0100', 'la boda de Ana & José #2027', 'yes'));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/12025550100');
  assert.equal(url.searchParams.get('text'), '¡Hola! Confirmo que asistiré a la boda de Ana & José #2027. Mi nombre es: ');
  assert.equal([...url.searchParams.keys()].length, 1);
  assert.equal(url.hash, '');
});

test('declining never generates an affirmative reply, in either language', () => {
  assert.match(whatsappRsvpMessage('la boda', 'no'), /No podré asistir/);
  assert.doesNotMatch(whatsappRsvpMessage('la boda', 'no'), /Confirmo que asistiré/);
  assert.match(whatsappRsvpMessage('the wedding', 'no', true), /won't be able to attend/);
  assert.match(whatsappRsvpMessage('the wedding', 'yes', true), /I will attend/);
});

test('missing or malformed host details do not create a link to an unintended recipient', () => {
  for (const number of ['', '0000000000', '12025550100?text=hello', 'https://wa.me/12025550100', '123', '1'.repeat(16)]) {
    assert.throws(() => whatsappRsvpUrl(number, 'la boda', 'yes'));
  }
  assert.throws(() => whatsappRsvpUrl('12025550100', '   ', 'yes'));
  assert.throws(() => whatsappRsvpUrl('12025550100', 'la boda', 'maybe'));
});
