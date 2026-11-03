import {sampleGuestAccess} from '../../lib/weddingSampleGuest';
import {invitation} from './config.mjs';
import {countdown,eventStamp} from './clock.mjs';
import {giftOpening} from './opening';
import {album} from './album';

giftOpening();
album();
const target=new Date(eventStamp(invitation));
const clock=document.querySelector('[data-clock]');
function tick(){
  const message=countdown(invitation,new Date(),target);
  const parts=message.split(/(\d+)/);
  clock.replaceChildren(...parts.map((part,i)=>{
    if(!(i%2))return document.createTextNode(part);
    const stamp=document.createElement('strong');stamp.textContent=part;return stamp;
  }));
}
tick();
let timer;
function syncClock(){clearInterval(timer);if(!document.hidden){tick();timer=setInterval(tick,30000)}}
syncClock();document.addEventListener('visibilitychange',syncClock);

const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('arrived');observer.unobserve(entry.target)}
},{threshold:.08});
document.querySelectorAll('.tag,.album,.letter,.thread').forEach(el=>observer.observe(el));

const form=document.querySelector('.celebration-rsvp');
const status=form.querySelector('[data-rsvp-status]');
const ticket=document.querySelector('.admission');
const admission=ticket.querySelector('[data-admission]');
const access=sampleGuestAccess(location.hash);
const {copy}=invitation;
function stamp(attendance,flash){
  const accepted=attendance==='yes';
  ticket.classList.toggle('accepted',accepted);
  if(accepted&&flash&&!ticket.hasAttribute('data-stamped')){
    ticket.dataset.stamped='';ticket.classList.add('flash');
    setTimeout(()=>ticket.classList.remove('flash'),600);
  }
}
if(access){
  Object.assign(form.dataset,{personalNotice:copy.personalNotice,save:copy.save,saved:copy.saved,yesMessage:copy.yesMessage,noMessage:copy.noMessage,companion:'Acompañante'});
  form.querySelector('.personal-fields').hidden=false;
  const save=form.querySelector('.save');save.hidden=false;save.disabled=true;
  form.addEventListener('pass-person',({detail:p})=>{
    admission.textContent=copy.personalPass.replace('{guest}',p.name).replace('{seats}',p.seats+' '+(p.seats===1?'lugar':'lugares'));
    stamp(p.attendance,false);
  });
  form.addEventListener('pass-response',({detail})=>stamp(detail.attendance,true));
  form.addEventListener('pass-unavailable',()=>{form.querySelector('.choices').inert=true});
  import('../personal-rsvp.js').then(({personalRsvp})=>personalRsvp(form,status,access,'birthday'));
}else{
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('change',()=>{
    const answer=form.elements.attendance.value;
    status.textContent=answer==='yes'?copy.yesMessage:copy.noMessage;
    stamp(answer,true);
  });
}
