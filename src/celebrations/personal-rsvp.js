import { sampleGuestRequest, sampleGuestError } from '../lib/weddingSampleGuest';

export async function personalRsvp(form, status, access, occasion) {
  const submit = form.querySelector('[type=submit]');
  const name = form.elements.guest;
  let invitation;
  const pass=document.createElement('a');pass.textContent='Ver mi pase QR';pass.hidden=true;
  form.append(pass);
  const picker = document.createElement('select');
  picker.setAttribute('aria-label','Persona que responde');
  form.querySelector('label').before(picker);
  form.querySelector('.local-note').textContent='Datos de muestra · Tu respuesta se guarda en el panel durante 24 horas.';
  form.closest('.confirmation').querySelector('.sample-notice').textContent='Este enlace es personal. Confirma por cada persona invitada.';
  submit.firstChild.textContent='Guardar mi respuesta ';
  submit.disabled=true;
  form.addEventListener('submit',send);
  if(access==='invalid'){status.textContent='El enlace personal está incompleto.';return}
  function display() {
    const index=picker.selectedIndex, person=invitation.people[index];
    name.readOnly=!(invitation.kind==='plusOne'&&index===1);
    name.required=false;
    name.value=person.name;
    pass.hidden=!(invitation.passLink && invitation.people.some(p=>p.attendance==='yes'));
    if(!pass.hidden)pass.href=invitation.passLink;
    for(const radio of form.querySelectorAll('[name=attendance]'))radio.checked=radio.value===person.attendance;
    status.textContent='';
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
      status.textContent='Tu respuesta ya está en el panel de muestra.';
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
    document.querySelector('.cover-bottom').prepend(greeting);
    function options(){picker.replaceChildren(...invitation.people.map((p,i)=>new Option(p.name||'Acompañante',String(i))))}
    options();
    picker.hidden=invitation.people.length===1;
    picker.addEventListener('change',display);
    display();submit.disabled=false;
  }catch(error){status.textContent=sampleGuestError(error).text}
}
