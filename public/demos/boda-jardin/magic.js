const hero = document.querySelector('.hero');
// Keep the native disclosure authoritative across cancellation and preference changes.
document.querySelectorAll('.gift-reveal').forEach(note => {
  const content = note.querySelector('.gift-content');
  let animation, intendedOpen = note.open;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function settle() {
    if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
    note.open = intendedOpen;
    note.style.height = ''; note.style.overflow = '';
    content.inert = !intendedOpen;
  }
  note.addEventListener('toggle', () => { if (!animation) { intendedOpen = note.open; content.inert = !note.open; } });
  note.querySelector('summary').addEventListener('click', event => {
    if (motion.matches || !note.animate) return;
    event.preventDefault();
    const start = note.getBoundingClientRect().height;
    intendedOpen = !intendedOpen;
    if (animation) { animation.onfinish = null; animation.cancel(); }
    note.style.height = ''; note.open = intendedOpen;
    const end = note.getBoundingClientRect().height;
    note.open = true; note.style.overflow = 'hidden';
    content.inert = !intendedOpen;
    animation = note.animate([{height:`${start}px`},{height:`${end}px`}], {duration:620,easing:'cubic-bezier(.22,1,.36,1)'});
    animation.onfinish = settle;
  });
  motion.addEventListener('change',()=>{if(!animation)intendedOpen=note.open;settle()});
  if ('ResizeObserver' in window) {
    let width = note.getBoundingClientRect().width;
    new ResizeObserver(entries=>{const next=entries[0].contentRect.width;if(Math.abs(next-width)>.5){width=next;settle()}}).observe(note);
  }
});
const arrival = document.querySelector('#gate');
arrival.insertAdjacentHTML('afterbegin', `<div class="tidal-scene" aria-hidden="true"><span class="tidal-moon"></span><span class="tidal-orbit"></span><div class="tidal-sparks">${Array.from({length:10},(_,i)=>`<i style="--x:${(i*37+9)%100}%;--y:${(i*19+7)%91}%;--delay:-${i%6}s"></i>`).join('')}</div><svg class="tidal-water" viewBox="0 0 1000 240" preserveAspectRatio="none"><path d="M0 70Q125 30 250 70T500 70T750 70T1000 70V240H0Z" fill="#2c788c"/><path d="M0 115Q125 75 250 115T500 115T750 115T1000 115V240H0Z" fill="#41909c"/><path d="M0 160Q125 120 250 160T500 160T750 160T1000 160V240H0Z" fill="#79b8ba"/></svg></div>`);
document.querySelector('.arrival-copy .eyebrow').textContent = 'DESDE CANCÚN, CON AMOR';
document.querySelector('.arrival-copy>p:last-child').innerHTML = 'Nos casamos.<br><em>Te esperamos en Cancún.</em>';
document.querySelector('.pocket-dedication').textContent = 'Invitación a nuestra boda';
document.querySelector('.arrival-instruction p').textContent = 'Toca la perla para abrir la invitación';
document.querySelector('.letter-flower').innerHTML = `<svg viewBox="0 0 80 60" width="45" height="34" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M33 54C29 47 4 29 8 20Q10 12 18 14Q19 3 30 9Q40 -2 50 9Q61 3 62 14Q70 12 72 20C76 29 51 47 47 54Z"/><path d="M40 51V8M36 51L21 15M32 49L12 24M44 51L59 15M48 49L68 24M33 54H47"/></svg>`;
document.querySelector('#open').setAttribute('aria-label', 'Tocar la perla y abrir la invitación de Valentina y Sebastián');
document.querySelector('.envelope').insertAdjacentHTML('beforeend','<span class="sea-postmark" aria-hidden="true">CANCÚN<br><b>19 · JUN</b><br>2027</span>');
arrival.querySelector('.tidal-scene').insertAdjacentHTML('beforeend', `<div class="sunset-rays"></div><div class="pearl-ripples"><i></i><i></i><i></i></div><svg class="shore-birds" viewBox="0 0 180 60"><path d="M10 30Q25 17 40 30Q55 17 70 30M100 45Q110 36 120 45Q130 36 140 45M125 12Q135 3 145 12Q155 3 165 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`);
hero.insertAdjacentHTML('beforeend', `<svg class="ocean-waves" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70Q180 20 360 70T720 70T1080 70T1440 70V80Q1260 30 1080 80T720 80T360 80T0 80Z" fill="currentColor"/><path d="M0 100Q180 50 360 100T720 100T1080 100T1440 100V108Q1260 58 1080 108T720 108T360 108T0 108Z" fill="currentColor"/><path d="M0 135Q180 85 360 135T720 135T1080 135T1440 135V142Q1260 92 1080 142T720 142T360 142T0 142Z" fill="currentColor"/></svg>`);
const sky = document.createElement('div');
sky.className = 'star-field';
sky.setAttribute('aria-hidden', 'true');
for (let i = 0; i < 28; i++) {
  const star = document.createElement('i');
  star.style.cssText = `--sx:${(i * 37 + 7) % 100}%;--sy:${(i * 23 + 3) % 93}%;--size:${i % 3 + 1}px;--twinkle:${3 + i % 5}s;--wait:-${i % 7}s`;
  sky.append(star);
}
const moon = document.createElement('span');
moon.className = 'moon';
sky.append(moon);
hero.prepend(sky);

const skyControl = document.createElement('button');
skyControl.type = 'button';
skyControl.className = 'sky-control';
skyControl.setAttribute('aria-pressed', 'false');
skyControl.innerHTML = '<span aria-hidden="true">☾</span> Mar bajo las estrellas';
document.querySelector('.hero-inner').prepend(skyControl);
skyControl.addEventListener('click', () => {
  const night = hero.classList.toggle('is-night');
  skyControl.setAttribute('aria-pressed', String(night));
});

// Only the pearl and a quiet reflection move continuously; background work sleeps.
const motionControl = document.createElement('button');
motionControl.type = 'button'; motionControl.className = 'motion-control';
motionControl.textContent = 'Pausar animaciones'; motionControl.setAttribute('aria-pressed','false');
document.querySelector('.scroll-cue').before(motionControl);
const entryMotionControl = motionControl.cloneNode(true);
arrival.append(entryMotionControl);
let manuallyPaused = false;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion() {
  document.documentElement.classList.toggle('motion-paused', manuallyPaused || document.hidden || motionPreference.matches);
  [motionControl,entryMotionControl].forEach(control=>{
    control.setAttribute('aria-pressed',String(manuallyPaused));
    control.textContent=motionPreference.matches?'Movimiento reducido activado':manuallyPaused?'Reanudar animaciones':'Pausar animaciones';
    control.disabled=motionPreference.matches;
  });
}
[motionControl,entryMotionControl].forEach(control=>control.addEventListener('click',()=>{manuallyPaused=!manuallyPaused;syncMotion()}));
document.addEventListener('visibilitychange',syncMotion);
motionPreference.addEventListener('change',syncMotion);
if ('IntersectionObserver' in window) {
  const ambientObserver = new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('ambient-idle',!entry.isIntersecting)));
  [arrival,hero].forEach(el=>ambientObserver.observe(el));
}
syncMotion();

// Optional album: full optimized photographs, with native modal focus handling.
const gallery = document.querySelector('#gallery');
const photoButtons = [...document.querySelectorAll('[data-photo]')];
const galleryImage = document.querySelector('#gallery-image');
let photoIndex = 0, photoRevision = 0, photoOrigin;
function showPhoto(index) {
  photoIndex = (index + photoButtons.length) % photoButtons.length;
  const revision = ++photoRevision;
  const source = photoButtons[photoIndex].querySelector('img');
  // Replace immediately: a slow preceding decode can never overwrite the last choice.
  galleryImage.src = source.src.replace('-800.jpg','-1600.jpg');
  galleryImage.alt = source.alt;
  document.querySelector('#gallery-position').textContent = `${photoIndex+1} de ${photoButtons.length}`;
  galleryImage.decode?.().then(()=>{
    if (revision === photoRevision && !motionPreference.matches && gallery.open) galleryImage.animate([{opacity:.4},{opacity:1}],{duration:280,easing:'ease'});
  }).catch(()=>{});
  const next = new Image();
  next.src = photoButtons[(photoIndex+1)%photoButtons.length].querySelector('img').src.replace('-800.jpg','-1600.jpg');
  next.decode?.().catch(()=>{});
}
photoButtons.forEach((button,index)=>button.addEventListener('click',()=>{
  photoOrigin=button;showPhoto(index);gallery.showModal();
}));
document.querySelector('#gallery-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
document.querySelector('#gallery-next').addEventListener('click',()=>showPhoto(photoIndex+1));
document.querySelector('#gallery-close').addEventListener('click',()=>gallery.close());
gallery.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowLeft'?-1:1))}
});
gallery.addEventListener('click',event=>{
  if(event.target!==gallery)return;
  const rect=gallery.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)gallery.close();
});
gallery.addEventListener('close',()=>{++photoRevision;photoOrigin?.focus({preventScroll:true})});

motionPreference.addEventListener('change',()=>{if(motionPreference.matches)galleryImage.getAnimations().forEach(animation=>animation.cancel())});
