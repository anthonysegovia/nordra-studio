/* Preference only: the privacy notice never loads an analytics SDK. */
(() => {
  const button = document.getElementById('analytics-preference');
  const status = document.getElementById('analytics-preference-status');
  if (!button || !status) return;
  const key = 'nordra-analytics-disabled';
  function sync() {
    try {
      const disabled = localStorage.getItem(key) === 'true';
      button.disabled = false;
      button.setAttribute('aria-pressed', String(disabled));
      button.textContent = disabled ? 'Activar medición en este navegador' : 'Desactivar medición en este navegador';
      status.textContent = disabled ? 'La medición está desactivada en este navegador.' : 'La medición está permitida en este navegador.';
    } catch {
      button.disabled = true;
      status.textContent = 'El almacenamiento no está disponible. La medición no se activa en este navegador.';
    }
  }
  button.addEventListener('click', () => {
    try {
      if (localStorage.getItem(key) === 'true') localStorage.removeItem(key);
      else localStorage.setItem(key, 'true');
      sync();
    } catch { status.textContent = 'No se pudo guardar la preferencia. Puedes escribir a hola@nordrastudio.mx para solicitar ayuda.'; }
  });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) sync(); });
  sync();
})();
