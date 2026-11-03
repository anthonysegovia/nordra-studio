const section = document.getElementById('opciones-web');
if (section) initializeObjectives(section);

function initializeObjectives(root) {
  const goals = root.querySelector('.offer-goals');
  const panels = [...root.querySelectorAll('[data-group]')];
  const radios = [...goals.querySelectorAll('input')];
  const rows = [...root.querySelectorAll('.offer-row')].map(link => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = link.className;
    button.dataset.row = link.dataset.row;
    button.hidden = link.hidden;
    button.append(...link.childNodes);
    link.replaceWith(button);
    return button;
  });

  function select(panel, levelId) {
    const levels = [...panel.querySelectorAll('.offer-level')];
    const selected = levels.find(el => el.dataset.level === levelId) || levels[0];
    const id = selected.dataset.level;
    panels.forEach(el => { el.inert = el !== panel; });
    radios.forEach(input => { input.checked = input.value === panel.dataset.group; });
    rows.forEach(row => { row.hidden = row.dataset.row === panel.dataset.group; });
    for (const el of panel.querySelectorAll('[data-level]')) el.hidden = el.dataset.level !== id;
    for (const input of panel.querySelectorAll('.offer-switch input')) input.checked = input.value === id;
    for (const detail of root.querySelectorAll('.offer-details[open]')) detail.open = false;
    root.dataset.selectedOffer = id;
    root.dispatchEvent(new Event('offerchange', {bubbles:true}));
  }

  function fromAnchor(id) {
    for (const panel of panels) {
      if (id === 'offer-' + panel.dataset.group) { select(panel); return; }
      const level = [...panel.querySelectorAll('.offer-level')].find(el => id === 'service-' + el.dataset.level);
      if (level) { select(panel, level.dataset.level); return; }
    }
  }

  function choose(group, levelId) {
    const panel = panels.find(el => el.dataset.group === group);
    select(panel, levelId);
    const id = levelId ? 'service-' + levelId : 'offer-' + group;
    history.replaceState(history.state, '', '#' + id);
    return panel;
  }

  goals.addEventListener('change', e => choose(e.target.value));
  for (const panel of panels) {
    panel.querySelector('.offer-switch')?.addEventListener('change', e => choose(panel.dataset.group, e.target.value));
  }
  for (const row of rows) row.addEventListener('click', () => {
    const panel = choose(row.dataset.row);
    panel.querySelector('h3').focus({preventScroll:true});
    panel.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  root.addEventListener('offeranchor', e => fromAnchor(e.detail));
  fromAnchor(location.hash.slice(1));
  root.classList.add('offers-ready');
  goals.hidden = false;
}

