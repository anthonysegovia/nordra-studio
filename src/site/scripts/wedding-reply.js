const reply = document.querySelector('#vista-reply');
const form = reply.querySelector('form');
const companion = form.querySelector('[data-demo-companion]');
const status = reply.querySelector('[role="status"]');
form.querySelector('[type=submit]').disabled = false;
const english = document.documentElement.lang === 'en';
form.addEventListener('change', () => {
  companion.disabled = form.elements.attendance.value === 'no';
  status.textContent = '';
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const attending = form.elements.attendance.value === 'yes';
  const count = attending ? 1 + Number(companion.checked) : 0;
  status.textContent = english ? `Sample reply · Attending: ${count} of 2.` : `Respuesta de muestra · Asistirán: ${count} de 2.`;
});
