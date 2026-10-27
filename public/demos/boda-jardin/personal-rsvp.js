// A personal capability identifies exactly one invitation. It never grants panel access.
(() => {
  const parameters = new URLSearchParams(location.hash.slice(1));
  const initialCapability = parameters.get('invitacion');
  addEventListener('hashchange', () => {
    if (new URLSearchParams(location.hash.slice(1)).get('invitacion') !== initialCapability) location.reload();
  });
  if (!parameters.has('invitacion')) return;
  const [eventId,id,token] = (parameters.get('invitacion') || '').split('~');
  const valid = /^[a-f0-9-]{36}$/i.test(eventId || '') && /^wedding-[\w-]{1,120}$/.test(id || '') && /^[a-f0-9]{64}$/.test(token || '');
  const trigger = document.querySelector('#rsvp');
  const dialog = document.querySelector('#dialog');
  let invitation = null, sending = false;
  const element = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
  dialog.classList.add('personal-rsvp'); dialog.replaceChildren();
  const close = element('button','close','×'); close.type='button'; close.setAttribute('aria-label','Cerrar');
  const eyebrow = element('p','eyebrow','Valentina & Sebastián');
  const title = element('h2','','Un lugar para ustedes'); title.id='dialog-title';
  const introduction = element('p','personal-introduction','Estamos preparando su invitación');
  const form = element('form','personal-form');
  const people = element('div','personal-people');
  const submit = element('button','button','Guardar mi respuesta'); submit.type='submit';
  const status = element('p','personal-status'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
  const retry = element('button','personal-retry','Volver a cargar'); retry.type='button'; retry.hidden=true;
  const note = element('p','personal-note','Espacio de muestra · Tu respuesta se guarda en el panel de prueba durante 24 horas');
  const pass = element('a','button personal-pass','Ver mi pase QR'); pass.target='_blank'; pass.rel='noopener noreferrer'; pass.hidden=true;
  form.append(people,submit); form.hidden=true; dialog.append(close,eyebrow,title,introduction,form,status,pass,retry,note);
  const dedication = element('p','personal-dedication','Preparando tu invitación personal');
  document.querySelector('.hero-inner .intro').after(dedication);
  document.querySelector('#respuesta .fine').textContent='Tu respuesta se reflejará automáticamente en el panel de muestra';
  trigger.querySelector('em').textContent='Una respuesta por persona';
  const capability = {eventId,id,token};
  // Section navigation must not replace the private fragment used on reload.
  document.addEventListener('click', event => {
    const link=event.target.closest?.('a[href^="#"]');
    if(!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button!==0) return;
    const target=document.getElementById(link.getAttribute('href').slice(1));
    if(!target) return;
    event.preventDefault(); target.classList.add('visible'); target.scrollIntoView({behavior:weddingMotionAllowed()?'smooth':'instant',block:'start'});
  });
  const messages = {
    link_unavailable:'Este enlace ya no está disponible. Puede haber vencido o haberse reiniciado la muestra. Solicita un nuevo enlace a quien te invitó.',
    response_changed:'Esta invitación recibió un cambio. Vuelve a cargar la respuesta más reciente antes de confirmar.',
    companion_name_required:'Escribe el nombre de tu acompañante para confirmar su asistencia.',
    reply_required:'Indica la respuesta de al menos una persona.',
    duplicate_name:'Ese nombre ya está registrado. Escribe los apellidos completos de tu acompañante.',
    invalid_name:'Escribe un nombre de 2 a 100 caracteres.',
    limited:'Hemos recibido varios intentos. Espera un momento antes de volver a intentarlo.',
  };
  async function call(action,extra={}) {
    const response = await fetch('/api/wedding-links',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...capability,...extra}),signal:AbortSignal.timeout(15000)});
    const data=await response.json();
    if(!response.ok) throw new Error(data.code || 'unavailable');
    return data;
  }
  function display(item) {
    invitation=item;
    pass.hidden=!item.passLink || !item.people.some(person=>person.attendance==='yes');
    if(item.passLink)pass.href=item.passLink;
    const groupName=item.kind==='couple'?item.people.map(person=>person.name).join(' & '):item.people[0].name+(item.kind==='plusOne'?' +1':'');
    dedication.textContent=`Una invitación para ${groupName}`;
    document.querySelector('.pocket-dedication').textContent=groupName;
    title.textContent=item.people.length===1?'Un lugar para ti':'Un lugar para ustedes';
    introduction.textContent=`${groupName} · ${item.people.length===1?'Hemos reservado un lugar para ti':'Hemos reservado dos lugares para ustedes'}`;
    document.querySelector('#respuesta>p:not(.eyebrow):not(.fine)')?.replaceChildren(document.createTextNode('Confirma la asistencia de cada persona de tu invitación'));
    people.replaceChildren();
    item.people.forEach((person,index)=> {
      const fieldset=element('fieldset','personal-person');
      const role=index===0?'Invitado principal':item.kind==='couple'?'Pareja':'Acompañante';
      fieldset.append(element('legend','',role));
      const companion=item.kind==='plusOne' && index===1;
      let input;
      if(companion) {
        const label=element('label','','Nombre de tu acompañante'); label.htmlFor=`personal-name-${index}`;
        input=element('input',''); input.id=label.htmlFor; input.name='companion'; input.value=person.name; input.placeholder='Por definir'; input.minLength=2; input.maxLength=100; input.autocomplete='off';
        fieldset.append(label,input);
      } else fieldset.append(element('p','personal-name',person.name));
      const label=element('label','','Asistencia'); label.htmlFor=`personal-attendance-${index}`;
      const select=element('select',''); select.id=label.htmlFor; select.name=person.id;
      for(const [value,text] of [['pending','Por confirmar'],['yes','Sí asistiré'],['no','No podré asistir']]) { const option=element('option','',text); option.value=value; select.append(option); }
      select.value=person.attendance; select.setAttribute('aria-label',`Asistencia de ${person.name || 'tu acompañante'}`);
      if(input) { input.required=select.value==='yes'; select.addEventListener('change',()=>{input.required=select.value==='yes';}); }
      fieldset.append(label,select); people.append(fieldset);
    });
    form.hidden=false; retry.hidden=true; submit.disabled=false;
  }
  function errorState(error,loading=false) {
    status.textContent=messages[error.message] || (loading?'No pudimos cargar tu invitación. Revisa tu conexión e intenta nuevamente.':'No pudimos guardar tu respuesta. Tus cambios siguen aquí para volver a intentarlo.');
    status.classList.add('is-error');
    if(loading || error.message==='response_changed') retry.hidden=false;
    if(loading) { dedication.textContent='Tu invitación personal'; introduction.textContent='Revisemos tu enlace'; form.hidden=true; pass.hidden=true; }
    if(error.message==='response_changed' || error.message==='link_unavailable') submit.disabled=true;
  }
  async function load() {
    retry.disabled=true; status.textContent='Cargando tu invitación…'; status.classList.remove('is-error');
    try { if(!valid) throw new Error('link_unavailable'); const data=await call('guest-load'); display(data.invitation); status.textContent=''; }
    catch(error) { errorState(error,true); }
    finally { retry.disabled=false; }
  }
  form.addEventListener('submit',async event=> {
    event.preventDefault(); if(sending || !invitation) return;
    sending=true; submit.disabled=true; close.disabled=true; status.textContent='Guardando tu respuesta…'; status.classList.remove('is-error');
    const response=invitation.people.map((person,index)=>({...person,name:invitation.kind==='plusOne' && index===1?form.querySelector('[name="companion"]').value:person.name,attendance:form.elements.namedItem(person.id).value}));
    people.querySelectorAll('input,select').forEach(node=>node.disabled=true);
    try {
      const data=await call('guest-reply',{people:response,updatedAt:invitation.updated_at});
      display(data.invitation); status.textContent='Gracias, tu respuesta ya se refleja en el panel'; submit.textContent='Actualizar mi respuesta';
      const saved=element('span','personal-saved-mark','✓'); saved.setAttribute('aria-hidden','true'); status.prepend(saved);
    } catch(error) { errorState(error); if(error.message!=='response_changed' && error.message!=='link_unavailable') submit.disabled=false; }
    finally { sending=false; close.disabled=false; people.querySelectorAll('input,select').forEach(node=>node.disabled=false); }
  });
  trigger.addEventListener('click',()=>{dialog.showModal(); close.focus();});
  close.addEventListener('click',()=>{if(!sending) dialog.close();});
  dialog.addEventListener('cancel',event=>{if(sending) event.preventDefault();});
  dialog.addEventListener('close',()=>trigger.focus({preventScroll:true}));
  retry.addEventListener('click',()=>void load());
  void load();
})();
