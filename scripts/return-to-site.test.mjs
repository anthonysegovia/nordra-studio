import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { returnTarget } from '../src/site/return-to-site.js';

describe('site — return from sample invitations', () => {
  const origin = 'https://nordrastudio.mx';
  test('returns to the site page the visitor came from', () => {
    assert.equal(returnTarget('https://nordrastudio.mx/cumpleanos#cumpleanos-event-experience', origin), 'https://nordrastudio.mx/cumpleanos#cumpleanos-event-experience');
    assert.equal(returnTarget('https://nordrastudio.mx/', origin), 'https://nordrastudio.mx/');
    assert.equal(returnTarget('https://nordrastudio.mx/bodas.html', origin), 'https://nordrastudio.mx/bodas.html');
  });
  test('stays hidden for guests and for anything outside the commercial pages', () => {
    assert.equal(returnTarget(null, origin), null);
    assert.equal(returnTarget('', origin), null);
    assert.equal(returnTarget('https://web.whatsapp.com/', origin), null);
    assert.equal(returnTarget('https://nordrastudio.mx/panel-boda?codigo=x', origin), null);
    assert.equal(returnTarget('https://nordrastudio.mx/invitaciones/sofia-25/', origin), null);
    assert.equal(returnTarget('no es una url', origin), null);
  });
  test('accepts the path a site page noted for this tab', () => {
    assert.equal(returnTarget('/bodas#bodas-event-experience', origin), 'https://nordrastudio.mx/bodas#bodas-event-experience');
    assert.equal(returnTarget('//otro.mx/bodas', origin), null);
  });
  test('drops query parameters from the way back', () => {
    assert.equal(returnTarget('https://nordrastudio.mx/eventos?utm_source=x', origin), 'https://nordrastudio.mx/eventos');
  });
});
