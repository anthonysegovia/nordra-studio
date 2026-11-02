import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Startup and reduced-motion portraits from the approved nocturnal scene (3db332c).
const nightPortraits = {
  "landscape-poster-dark-compact-v5.webp": "3b2ce4a7d394f2eed8ac83ec08b20014f15142f51d6724e1cd4da28054649687",
  "landscape-poster-dark-desktop-v5.webp": "6c40b26996c4b1ec56396815b018da32f25714ffed31f395994a7782d98f9e99",
  "landscape-poster-dark-mobile-v5.webp": "56b2cff5b30d625eaf098dbda8efeb383609fd781bdacb71cb235bf00268d0e5",
  "landscape-poster-dark-wide-v5.webp": "39c193614fd50d40283b6a577cce6f8a3bb55a86b922e10a4eb0c38a0bf3fef8",
  "landscape-start-dark-compact-v5.webp": "bc22d9fb2baadba5a22fae55e029e6a493800093153042bc235ee0a97286d42e",
  "landscape-start-dark-desktop-v5.webp": "bd31b3db1acd4c377f231cbfe5441bc8cf2e0630f7439d9393c74396cc5b2b0b",
  "landscape-start-dark-mobile-v5.webp": "d6b347de3c892e469b5cba14cdf0e4984d0c447b1b731c93764fb1616edb50d8",
  "landscape-start-dark-wide-v5.webp": "c2dfa442a29969dd9277ff27696374f9b66a25d5afa4e758f86aa866989cc3a7"
};

test('conserva exactamente las ocho imágenes nocturnas de la rama móvil', () => {
  assert.equal(Object.keys(nightPortraits).length,8);
  for (const [file,signature] of Object.entries(nightPortraits)) {
    const data = readFileSync(new URL('../public/nordra/v548/assets/'+file,import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'),signature,file);
  }
});
