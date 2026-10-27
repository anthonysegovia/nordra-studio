(() => {
  'use strict';
  const refresh = document.querySelector('#refresh');
  const search = document.querySelector('#guest-search');
  const list = document.querySelector('#guests');
  const status = document.querySelector('#list-status');
  const count = document.querySelector('#guest-count');
  let names = [];
  let loaded = false;
  let busy = false;
  function message(text, error = false) { status.textContent = text; status.classList.toggle('error', error); status.closest('.message-wrap').dataset.visible = String(Boolean(text)); }
  function render() {
    const query = search.value.trim().toLocaleLowerCase('es-MX');
    const matches = names.filter(name => name.toLocaleLowerCase('es-MX').includes(query));
    const fragment = document.createDocumentFragment();
    for (const name of matches) { const li = document.createElement('li'); li.textContent = name; fragment.appendChild(li); }
    list.replaceChildren(fragment);
    message(matches.length ? '' : names.length ? 'No encontramos ese nombre' : 'Todavía no hay confirmaciones. ¿Quién se apunta primero?');
  }
  async function load() {
    if (busy) return;
    busy = true; refresh.disabled = true; refresh.classList.add('loading'); list.setAttribute('aria-busy', 'true');
    message(loaded ? 'Actualizando la lista…' : 'Cargando confirmaciones…');
    try {
      const next = []; let page = 0; let total = 0;
      do {
        const response = await fetch(`/api/posada-confirmados?page=${page++}`, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(15000) });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.names)) throw new Error('Unavailable');
        next.push(...data.names); total = data.total;
        if (!data.names.length) break;
      } while (next.length < total);
      names = next; loaded = true; search.disabled = false; count.textContent = String(names.length);
      document.querySelector('#count-label').textContent = names.length === 1 ? 'persona' : 'personas';
      document.querySelector('#updated').textContent = `Actualizada ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
      render();
    } catch { message(loaded ? 'No pudimos actualizar. Esta es la última lista que cargamos; intenta de nuevo.' : 'No pudimos cargar la lista. Toca Actualizar para intentarlo de nuevo.', true); }
    finally { busy = false; refresh.disabled = false; refresh.classList.remove('loading'); list.removeAttribute('aria-busy'); }
  }
  search.addEventListener('input', render); refresh.addEventListener('click', load); load();
})();
