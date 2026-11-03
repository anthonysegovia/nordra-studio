import {invitation as config} from './config.mjs';
import {countdown,eventStamp} from './clock.mjs';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const quiet=()=>reduced.matches||document.body.hasAttribute('data-float-skipped')||document.body.dataset.floatPaused==='true';

const clock=document.querySelector('.countdown'),message=document.querySelector('.clock-message');
const target=new Date(eventStamp(config));
let tick,clockVisible=false;
function syncClock(){
  clearTimeout(tick);
  if(!clockVisible||document.hidden)return;
  const value=countdown(config,new Date(),target);
  clock.hidden=!value.digits;message.hidden=!!value.digits;
  if(value.digits)clock.querySelectorAll('b').forEach((digit,i)=>{
    const next=String(value.digits[i]).padStart(2,'0');
    if(next===digit.textContent)return;
    digit.textContent=next;
    if(!quiet())digit.animate([{transform:'rotateX(-65deg)',opacity:.45},{transform:'rotateX(0)',opacity:1}],{duration:290,easing:'ease-out'});
  });
  else message.textContent=value.message;
  tick=setTimeout(syncClock,1010-Date.now()%1000);
}
new IntersectionObserver(([e])=>{clockVisible=e.isIntersecting;syncClock()}).observe(document.querySelector('#cuando'));
document.addEventListener('visibilitychange',syncClock);

const album=document.querySelector('.album-section');
const deck=document.querySelector('.note-deck');
const reveal=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){e.target.classList.add('unfolded');reveal.unobserve(e.target)}
},{threshold:.18});
if(album){
  reveal.observe(album);
  const wide=matchMedia('(min-width:701px)');
  let frame=0;
  function updateFan(){
    frame=0;
    const progress=quiet()?1:Math.max(0,Math.min(1,(innerHeight-album.getBoundingClientRect().top)/(innerHeight*.42)));
    album.style.setProperty('--fan-progress',String(progress));
  }
  function queue(){if(!frame&&wide.matches)frame=requestAnimationFrame(updateFan)}
  new IntersectionObserver(([entry])=>{
    if(entry.isIntersecting){addEventListener('scroll',queue,{passive:true});queue()}
    else{removeEventListener('scroll',queue);cancelAnimationFrame(frame);frame=0}
  }).observe(album);
  wide.addEventListener('change',queue);reduced.addEventListener('change',queue);
}
reveal.observe(deck);
deck.addEventListener('click',event=>{
  const button=event.target.closest('button[aria-controls]');
  if(!button)return;
  const next=button.getAttribute('aria-expanded')==='false';
  deck.classList.add('unfolded');
  button.setAttribute('aria-expanded',String(next));
  if(next)button.setAttribute('aria-describedby',button.getAttribute('aria-controls'));else button.removeAttribute('aria-describedby');
  document.getElementById(button.getAttribute('aria-controls')).hidden=!next;
});
const form=document.querySelector('.celebration-rsvp'),ticket=document.querySelector('.foil-ticket');
const name=ticket.querySelector('[data-pass-name]'),seats=ticket.querySelector('[data-pass-seats]'),state=ticket.querySelector('[data-pass-state]');
const personal=location.hash.startsWith('#invitacion=');
if(personal)name.textContent=config.copy.loadingGuest;
form.addEventListener('pass-unavailable',()=>{name.textContent=config.copy.unavailable;seats.textContent='';state.textContent=''});
function setAttendance(attendance){
  state.textContent=attendance==='yes'?config.copy.accepted:attendance==='no'?config.copy.declined:config.copy.reserved;
  ticket.dataset.attendance=attendance;
}
form.addEventListener('pass-person',({detail})=>{
  ticket.classList.remove('torn');
  name.textContent=detail.name;seats.textContent=detail.seats+' '+(detail.seats===1?config.copy.seat:config.copy.seats);
  setAttendance(detail.attendance);
});
form.addEventListener('pass-response',({detail})=>{
  if(detail.name)name.textContent=detail.name;
  setAttendance(detail.attendance);
  if(detail.attendance==='yes'&&!quiet())ticket.classList.add('torn');
  else ticket.classList.remove('torn');
});
ticket.addEventListener('pointermove',e=>{
  if(quiet())return;
  const r=ticket.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  ticket.style.setProperty('--foil-x',x*100+'%');ticket.style.setProperty('--tilt',((x-.5)*4)+'deg');
  ticket.style.setProperty('--pitch',((.5-y)*3)+'deg');
});
ticket.addEventListener('pointerleave',()=>{ticket.style.removeProperty('--tilt');ticket.style.removeProperty('--pitch')});
