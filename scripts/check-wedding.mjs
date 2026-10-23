import { readFileSync, existsSync } from 'node:fs';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../public/demos/boda-jardin');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
inline.forEach(source => new Script(source));
new Script(readFileSync(resolve(root, 'magic.js'), 'utf8'));
new Script(readFileSync(resolve(root, 'guest-experience.js'), 'utf8'));
new Script(readFileSync(resolve(root, 'motion-text.js'), 'utf8'));
new Script(readFileSync(resolve(root, 'rsvp-motion.js'), 'utf8'));
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs must be unique');
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) {
  assert(existsSync(resolve(root, match[1])), `Missing asset: ${match[1]}`);
}
for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
  for (const candidate of match[1].split(',')) assert(existsSync(resolve(root, candidate.trim().split(/\s+/)[0])), `Missing srcset: ${candidate}`);
}
assert.match(html, /<main id="invitation">/, 'Base document must be readable without JS');
assert.match(html, /id="gate" hidden/, 'Gate is progressively enhanced');
assert.doesNotMatch(html, /La ilusión|Para los novios/);
// Exercise the actual calendar handler without downloading a file or sending data.
const calendar = inline.join('\n').match(/function saveCalendar\(\) \{ ([\s\S]*?) \}\r?\nq\('#calendar'\)/)[1];
let icsBlob, fileName;
const anchor = { click() {}, remove() {}, set download(value) { fileName = value; } };
new Script(calendar).runInNewContext({
  Blob,
  URL: { createObjectURL(blob) { icsBlob = blob; return 'blob:test'; }, revokeObjectURL() {} },
  document: { createElement() { return anchor; }, body: { append() {} } },
  setTimeout(fn) { fn(); },
});
const ics = await icsBlob.text();
assert(ics.includes('\r\n'), 'Calendar must use CRLF');
assert(ics.includes('DTSTART:20270619T220000Z\r\n'));
assert(ics.includes('DTEND:20270620T070000Z\r\n'));
assert(ics.includes('SUMMARY:DEMO'));
assert.equal(fileName, 'boda-demo-valentina-sebastian.ics');
assert.equal(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Cancun', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date('2027-06-19T22:00:00Z')), '17:00');
console.log('Wedding checks passed: inline/external syntax, unique IDs, local assets/srcset, progressive access, copy and actual ICS handler/time zone.');

// Exercise the shipped countdown at its time boundary and on tab visibility changes.
const source = inline.join('\n');
const countdown = source.slice(source.indexOf('const target ='), source.indexOf('function saveCalendar()'));
const eventTime = Date.parse('2027-06-19T22:00:00Z');
for (const offset of [-1000, 0, 1000]) {
  const elements = new Map(['days','hours','minutes','seconds','count-label'].map(id=>['#'+id,{textContent:''}]));
  let intervals=0, visibilityHandler;
  const document = { hidden:false, addEventListener(name,fn){if(name==='visibilitychange')visibilityHandler=fn} };
  class TestDate extends Date { static now(){return eventTime+offset} }
  new Script(countdown).runInNewContext({ Date:TestDate, q:id=>elements.get(id), document,
    weddingSetText(element,value){element.textContent=value},
    setInterval(){intervals++;return 1},clearInterval(){intervals=0} });
  assert.equal(elements.get('#seconds').textContent, offset<0?'01':'00');
  for(const id of ['days','hours','minutes'])assert.equal(elements.get('#'+id).textContent,'00');
  assert.equal(intervals,offset<0?1:0);
  if(offset>=0)assert.equal(elements.get('#count-label').textContent,'¡Llegó nuestro gran día!');
  document.hidden=true;visibilityHandler();assert.equal(intervals,0);
}
const luminance = hex => {
  const rgb=hex.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
};
for (const [fg,bg] of [['493a33','f4e8d8'],['5d625e','f4e8d8'],['5d625e','fffcf7'],['5d625e','ecddcc'],['245967','fffcf7'],['77552d','f4e8d8'],['fffcf7','493a33'],['fff0d1','153b49'],['ecf7f5','28717d']]) {
  const values=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);const ratio=(values[0]+.05)/(values[1]+.05);
  console.log(`Contrast #${fg}/#${bg}: ${ratio.toFixed(2)}:1`);assert(ratio>=4.5);
}
console.log('Countdown boundary/visibility and functional palette contrast checks passed.');

// Exercise the shipped asynchronous album: slow decodes must not replace a newer
// choice, reopen a closed gallery, or leave duplicate layers after pausing.
const magicSource = readFileSync(resolve(root, 'magic.js'), 'utf8');
const albumSource = magicSource.slice(magicSource.indexOf("const gallery = document.querySelector('#gallery');"));
const handlers = new Map(), pendingImages = [], layers = [];
let allowMotion = true;
const gallery = {
  open: true, addEventListener(name, fn) { handlers.set(name, fn); },
  querySelectorAll() { return [...layers]; },
};
const galleryImage = {
  src: 'recuerdo-1-1600.jpg', complete: true, naturalWidth: 1600,
  cloneNode() {
    const layer = {
      removeAttribute() {}, setAttribute() {}, getAnimations() { return []; },
      animate() { return { finished: new Promise(() => {}) }; },
      remove() { const index = layers.indexOf(layer); if (index >= 0) layers.splice(index, 1); },
    };
    return layer;
  },
  after(layer) { layers.push(layer); },
};
const position = {};
const buttons = [1, 2].map(index => ({
  querySelector() { return { src: `recuerdo-${index}-800.jpg`, alt: `Photo ${index}` }; },
  addEventListener() {},
}));
class AlbumImage {
  constructor() { pendingImages.push(this); }
  decode() { return new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject; }); }
}
const albumContext = {
  Image: AlbumImage, weddingMotionAllowed: () => allowMotion,
  weddingSetText(element,value){element.textContent=value},
  motionPreference: { matches: false, addEventListener() {} },
  document: {
    querySelectorAll() { return buttons; },
    querySelector(selector) {
      return selector === '#gallery' ? gallery : selector === '#gallery-image' ? galleryImage : selector === '#gallery-position' ? position : { addEventListener() {} };
    },
    addEventListener(name, fn) { handlers.set(name, fn); },
  },
};
new Script(albumSource).runInNewContext(albumContext);
const older = albumContext.showPhoto(0), newer = albumContext.showPhoto(1);
assert.equal(galleryImage.src, 'recuerdo-1-1600.jpg', 'Keep the current photo during loading');
pendingImages[1].resolve(); await newer;
assert.equal(galleryImage.src, 'recuerdo-2-1600.jpg');
assert.equal(layers.length, 1, 'A loaded replacement crossfades over the previous image');
pendingImages[0].resolve(); await older;
assert.equal(galleryImage.src, 'recuerdo-2-1600.jpg', 'A stale decode cannot replace the latest choice');
allowMotion = false; handlers.get('wedding:motionchange')();
assert.equal(layers.length, 0, 'Pausing settles the crossfade');
const closedRequest = albumContext.showPhoto(0), closingImage = pendingImages.at(-1);
gallery.open = false; handlers.get('close')(); closingImage.resolve(); await closedRequest;
assert.equal(galleryImage.src, 'recuerdo-2-1600.jpg', 'Closing invalidates pending image loads');
gallery.open = true;
const fallbackRequest = albumContext.showPhoto(0);
pendingImages.at(-1).reject(new Error('Unavailable full-size photo')); await fallbackRequest;
assert.equal(galleryImage.src, 'recuerdo-1-800.jpg', 'Use the existing preview when full-size decoding fails');
assert.equal(layers.length, 0, 'Paused photo changes do not animate');
console.log('Album loading, stale request, close, pause and preview fallback checks passed.');
