import { useContext, useEffect, useRef, useState } from 'react';
import { PanelExperience } from '../lib/panelExperience';

export function SampleGuide({english,link,onGuests}:{english:boolean;link?:string|null;onGuests:()=>void}){
  const config=useContext(PanelExperience), lang=english?1:0;
  const key='nordra-sample-guide-'+config.key+'-v1';
  const [open,setOpen]=useState(()=>{try{return !localStorage.getItem(key)}catch{return true}});
  const [step,setStep]=useState(0),trigger=useRef<HTMLButtonElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const current=config.guide.steps[step];
  useEffect(()=>{
    if(!open)return;
    try{localStorage.setItem(key,'seen')}catch{/* Storage is optional. */}
    heading.current?.focus({preventScroll:true});
    function escape(event:KeyboardEvent){
      if(event.key==='Escape'&&!document.querySelector('dialog[open]')){setOpen(false);trigger.current?.focus({preventScroll:true})}
    }
    document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);
  },[open,step,key]);
  function close(){setOpen(false);trigger.current?.focus({preventScroll:true})}
  return <><button className="guide-trigger" ref={trigger} aria-expanded={open} onClick={()=>{setStep(0);setOpen(true)}}>{english?'View guide':'Ver guía'}</button>
    {open && <section role="dialog" aria-modal="false" aria-labelledby="guide-step" className="sample-guide">
      <small>{config.guide.label[lang]} · {step+1}/3</small><h3 ref={heading} id="guide-step" tabIndex={-1}>{current.title[lang]}</h3><p>{current.detail[lang]}</p>
      <div>{step<2 && link && <a href={link} target="_blank" rel="noopener noreferrer">{english?'Try it as a guest':'Vívelo como invitado'} ↗</a>}
        <button onClick={()=>{if(step<2)setStep(step+1);else{onGuests();close()}}}>{step<2?(english?'Next':'Siguiente'):(english?'View replies':'Ver respuestas')}</button>
        <button onClick={close}>{english?'Skip guide':'Saltar guía'}</button></div>
    </section>}</>;
}
