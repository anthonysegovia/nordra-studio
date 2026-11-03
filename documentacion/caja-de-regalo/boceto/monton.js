// Interacción local del montón de muestra. El recorrido empieza por los cinco años.
const pile = document.querySelector('.album');
const photos = [...pile.querySelectorAll('figure')];
const next = pile.querySelector('.next');
const narrow = matchMedia('(max-width: 680px)');
let front = 0;

function showPhoto() {
  photos.forEach((photo, index) => {
    const depth = (index - front + photos.length) % photos.length;
    photo.style.setProperty('--depth', depth);
    photo.setAttribute('aria-hidden', String(narrow.matches && depth !== 0));
  });
  next.setAttribute('aria-label', photos[front].querySelector('figcaption').textContent + '. Ver la siguiente polaroid');
}
function turn(step) {
  front = (front + step + photos.length) % photos.length;
  showPhoto();
}
let touchStart;
let swiped = false;
next.addEventListener('pointerdown', event => {
  touchStart = event.clientX;
  swiped = false;
  next.setPointerCapture(event.pointerId);
});
next.addEventListener('pointerup', event => {
  const distance = event.clientX - touchStart;
  if (Math.abs(distance) > 28) {
    swiped = true;
    turn(distance < 0 ? 1 : -1);
  }
});
next.addEventListener('click', event => {
  if (!swiped || event.detail === 0) turn(1);
  swiped = false;
});
narrow.addEventListener('change', showPhoto);
showPhoto();
