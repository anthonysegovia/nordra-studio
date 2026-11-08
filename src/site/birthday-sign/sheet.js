export function mountSheet({$,mobile,still,preview}){
  const controls=$('controls'),toggle=$('custom-toggle'),scrim=$('sheet-scrim');
  const host=document.createElement('div');host.className='birthday-sign-root bs-sheet-host';document.body.append(host);
  const marker=document.createComment('birthday controls');controls.before(marker);
  let liveTimer,focusTimer;
  function cancelPreview(){clearTimeout(liveTimer);}
  function close(){
    clearTimeout(focusTimer);if(!controls.classList.contains('open'))return;
    controls.classList.remove('open');scrim.hidden=true;toggle.setAttribute('aria-expanded','false');
    controls.inert=mobile.matches;document.body.classList.remove('sheet-open');
    toggle.focus({preventScroll:true});
  }
  function place(){
    close();if(mobile.matches){$('shelf').append(toggle);host.append(controls,scrim);controls.setAttribute('role','dialog');controls.setAttribute('aria-modal','true');controls.setAttribute('aria-labelledby','bs-sheet-title');controls.inert=true;}
    else {marker.before(toggle);marker.after(controls);controls.inert=false;controls.removeAttribute('role');controls.removeAttribute('aria-modal');controls.removeAttribute('aria-labelledby');}
  }
  toggle.addEventListener('click',()=>{
    if(!mobile.matches)return;
    if(controls.classList.contains('open'))return close();
    controls.inert=false;controls.classList.add('open');toggle.setAttribute('aria-expanded','true');scrim.hidden=false;document.body.classList.add('sheet-open');
    const header=document.querySelector('.site-header').getBoundingClientRect().height;
    scrollTo({top:scrollY+$('sign').getBoundingClientRect().top-header-12,behavior:still()?'instant':'smooth'});
    focusTimer=setTimeout(()=>$('nm').focus({preventScroll:true}),still()?0:320);
  });
  const rowToggle=$('row-toggle'),row=$('row');
  rowToggle.addEventListener('click',()=>{const open=row.classList.toggle('open');rowToggle.setAttribute('aria-expanded',String(open));});
  $('sheet-x').addEventListener('click',close);scrim.addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(!mobile.matches||!controls.classList.contains('open'))return;
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){
      const focusable=[...controls.querySelectorAll('button,input,a[href]')].filter(e=>e.getClientRects().length&&!e.disabled&&!e.hidden);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  for(const id of ['nm','ag'])$(id).addEventListener('input',()=>{if(!mobile.matches)return;cancelPreview();liveTimer=setTimeout(preview,550);});
  const viewport=window.visualViewport;
  function keyboard(){controls.style.setProperty('--kb',Math.max(0,innerHeight-(viewport?.height||innerHeight)-(viewport?.offsetTop||0))+'px');controls.style.setProperty('--sheet-height',Math.max(140,(viewport?.height||innerHeight)-16)+'px');}
  viewport?.addEventListener('resize',keyboard);viewport?.addEventListener('scroll',keyboard);
  mobile.addEventListener('change',place);place();keyboard();
  return {close,cancelPreview};
}
