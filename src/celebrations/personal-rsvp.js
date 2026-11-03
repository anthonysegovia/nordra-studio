import { sampleGuestRequest, sampleGuestError } from '../lib/weddingSampleGuest';

export async function personalRsvp(form, status, access, occasion) {
  const submit = form.querySelector('[type=submit]');
  const name = form.elements.guest;
  let invitation;
  const pass=document.createElement('a');pass.textContent=form.dataset.qr||'Ver mi pase QR';pass.hidden=true;
  form.append(pass);
  const picker = document.createElement('select');
  picker.setAttribute('aria-label',form.dataset.picker||'Persona que responde');
  form.querySelector('label').before(picker);
  form.querySelector('.local-note').textContent='Datos de muestra · Tu respuesta se guarda en el panel durante 24 horas.';
  form.closest('.confirmation').querySelector('.sample-notice').textContent=form.dataset.personalNotice||'Este enlace es personal. Confirma por cada persona invitada.';
  submit.firstChild.textContent=(form.dataset.save||'Guardar mi respuesta')+' ';
  submit.disabled=true;
  form.addEventListener('submit',send);
  if(access==='invalid'){status.textContent=form.dataset.invalid||'El enlace personal está incompleto.';return}
  function display() {
    const index=picker.selectedIndex, person=invitation.people[index];
    name.readOnly=!(invitation.kind==='plusOne'&&index===1);
    name.required=false;
    name.value=person.name;
    pass.hidden=!(invitation.passLink && invitation.people.some(p=>p.attendance==='yes'));
    if(!pass.hidden)pass.href=invitation.passLink;
    for(const radio of form.querySelectorAll('[name=attendance]'))radio.checked=radio.value===person.attendance;
    status.textContent='';
    if(form.dataset.personalNotice)form.dispatchEvent(new CustomEvent('pass-person',{detail:{
      name:person.name||form.dataset.companion,seats:invitation.people.length,attendance:person.attendance
    }}));
  }
  async function send(event) {
    event.preventDefault();
    if(!invitation || submit.disabled || !form.reportValidity())return;
    const index=picker.selectedIndex;
    const people=invitation.people.map((p,i)=>i===index?{...p,name:name.value.trim(),attendance:form.elements.attendance.value}:p);
    submit.disabled=true;
    picker.disabled=true;
    try{
      invitation=await sampleGuestRequest(access,AbortSignal.timeout(15000),{people,updatedAt:invitation.updated_at},occasion);
      picker.options[index].textContent=invitation.people[index].name||'Acompañante';
      display();
      status.textContent=form.dataset.saved||'Tu respuesta ya está en el panel de muestra.';
      if(form.dataset.personalNotice){
        const attendance=invitation.people[index].attendance;
        status.textContent+=' '+(attendance==='yes'?form.dataset.yesMessage:form.dataset.noMessage);
        form.dispatchEvent(new CustomEvent('pass-response',{detail:{name:invitation.people[index].name,attendance}}));
      }
      if(invitation.people[index].attendance==='yes') form.dispatchEvent(new Event('attendance-confirmed'));
      submit.disabled=false;
    }catch(error){
      const issue=sampleGuestError(error);
      status.textContent=issue.text+(issue.reload?' Recarga la página para continuar.':'');
      submit.disabled=issue.reload;
    }finally{picker.disabled=false}
    status.focus({preventScroll:true});
  }
  try{
    invitation=await sampleGuestRequest(access,AbortSignal.timeout(15000),undefined,occasion);
    const greeting=document.createElement('p');
    greeting.textContent='Para '+invitation.people.map(p=>p.name||'acompañante').join(' y ');
    if(!form.dataset.personalNotice)document.querySelector('.cover-bottom').prepend(greeting);
    function options(){picker.replaceChildren(...invitation.people.map((p,i)=>new Option(p.name||'Acompañante',String(i))))}
    options();
    picker.hidden=invitation.people.length===1;
    picker.addEventListener('change',display);
    display();submit.disabled=false;
  }catch(error){status.textContent=sampleGuestError(error).text}
}
