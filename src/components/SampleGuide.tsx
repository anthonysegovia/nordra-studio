import { usePanelTerms } from '../lib/panelTerms';
import { useContext, useEffect, useRef, useState } from 'react';
import { PanelExperience } from '../lib/panelExperience';

const clientGuide = [
  { title:['Comparte sus enlaces','Share their links'], detail:['Cada invitación tiene un enlace personal. Ábrela para copiarlo o enviarlo por WhatsApp.','Each invitation has a personal link. Open it to copy it or send it by WhatsApp.'] },
  { title:['Marca lo enviado','Mark what you sent'], detail:['Registra cada envío para saber a quién falta escribirle.','Record each send so you know who still needs a message.'] },
  { title:['Sigue las respuestas','Follow the replies'], detail:['Las confirmaciones llegan aquí solas, persona por persona.','Replies arrive here on their own, person by person.'] },
];

export function SampleGuide({english,link,onGuests,client=false}:{english:boolean;link?:string|null;onGuests:()=>void;client?:boolean}){
  const text=usePanelTerms(english);
  const config=useContext(PanelExperience), lang=english?1:0;
  const key=client?'nordra-client-guide-v1':'nordra-sample-guide-'+config.key+'-v1';
  const [open,setOpen]=useState(false);
  const [hint,setHint]=useState(()=>{try{return !localStorage.getItem(key)}catch{return true}});
  const opened=useRef(false);
  const [step,setStep]=useState(0),trigger=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const current=(client?clientGuide:config.guide.steps)[step];
  useEffect(()=>{
    if(!open)return;
    if(opened.current)heading.current?.focus({preventScroll:true});
    function escape(event:KeyboardEvent){
      if(event.key==='Escape'&&!document.querySelector('dialog[open]')){setOpen(false);trigger.current?.focus({preventScroll:true})}
    }
    document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);
  },[open,step,key]);
  function close(){setOpen(false);trigger.current?.focus({preventScroll:true})}
  function seen(){setHint(false);try{localStorage.setItem(key,'seen')}catch{/* Storage is optional. */}}
  function start(){seen();opened.current=true;setStep(0);setOpen(true)}
  return <>{!hint && <button className="guide-trigger" ref={trigger} aria-expanded={open} onClick={start}>{english?'View guide':'Ver guía'}</button>}
    {hint && !open && <div className="sample-guide-hint"><button onClick={start}>{english?'New here? View the guide':'¿Primera vez? Ver guía'}</button><button onClick={seen} aria-label={english?'Dismiss':'Cerrar'}>×</button></div>}
    {open && <section role="dialog" aria-modal="false" aria-labelledby="guide-step" className="sample-guide">
      <small>{client?(english?'Quick guide':'Guía rápida'):config.guide.label[lang]} · {step+1}/3</small><h3 ref={heading} id="guide-step" tabIndex={-1}>{current.title[lang]}</h3><p>{current.detail[lang]}</p>
      <div>{step<2 && link && <a href={link} target="_blank" rel="noopener noreferrer">{text('asGuest')} ↗</a>}
        <button onClick={()=>{if(step<2)setStep(step+1);else{onGuests();close()}}}>{step<2?(english?'Next':'Siguiente'):(english?'View replies':'Ver respuestas')}</button>
        <button onClick={close}>{english?'Skip guide':'Saltar guía'}</button></div>
    </section>}</>;
}
