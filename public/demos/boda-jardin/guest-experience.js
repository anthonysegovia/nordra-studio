// The invitation's styling guide is local and illustrative; no choices are sent.
(() => {
  const atelier = document.querySelector('.guest-atelier');
  if (!atelier) return;
  const choices = { dress: {color:'#398f97',name:'Turquesa',length:'long'}, suit: {color:'#b79157',name:'Arena'} };
  let active = 'dress';
  const modelButtons = [...atelier.querySelectorAll('[data-outfit]')];
  const swatches = [...atelier.querySelectorAll('[data-fabric]')];
  const lengths = [...atelier.querySelectorAll('[data-length]')];
  const status = atelier.querySelector('.look-result');
  const tip = atelier.querySelector('.atelier-tip');
  const advice = atelier.querySelector('.advice-controls');
  const tipButtons = [...advice.querySelectorAll('[data-tip]')];
  const tipNotes = tipButtons.map(button=>document.getElementById(button.getAttribute('aria-controls')));
  const selection = advice.querySelector('.advice-selection');
  let selectedTip=0;
  function positionSelection() {
    const button=tipButtons[selectedTip];
    selection.style.width=`${button.offsetWidth}px`;
    selection.style.height=`${button.offsetHeight}px`;
    selection.style.transform=`translate(${button.offsetLeft}px,${button.offsetTop}px)`;
  }
  function selectTip(index) {
    if(index===selectedTip)return;
    tip.style.setProperty('--note-direction',index>selectedTip?1:-1);
    selectedTip=index;
    tipButtons.forEach((button,i)=>{
      const selected=i===index;
      button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      tipNotes[i].classList.toggle('is-active',selected);
      tipNotes[i].inert=!selected;tipNotes[i].setAttribute('aria-hidden',String(!selected));
    });
    positionSelection();
  }
  function render() {
    const choice = choices[active];
    atelier.style.setProperty('--dress-color',choices.dress.color);
    atelier.style.setProperty('--suit-color',choices.suit.color);
    atelier.dataset.model = active;
    atelier.dataset.length = choices.dress.length;
    modelButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.outfit === active)));
    swatches.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.fabric === choice.color)));
    lengths.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.length === choices.dress.length)));
    // Both panels reserve their space, so changing outfits does not move the page.
    for (const [selector, visible] of [['.length-options',active==='dress'],['.suit-description',active==='suit']]) {
      const panel=atelier.querySelector(selector);
      panel.inert=!visible;panel.setAttribute('aria-hidden',String(!visible));
    }
    weddingSetText(atelier.querySelector('.look-color-name'),choice.name);
    const label = active === 'dress' ? `Vestido ${choice.length === 'long' ? 'largo' : 'midi'}` : 'Traje de tela ligera';
    weddingSetText(status,`${label} · ${choice.name}`);
  }
  function selectOutfit(model) {
    if(model===active)return;
    active=model;
    render();
  }
  modelButtons.forEach((button,index)=>{
    button.addEventListener('click',()=>selectOutfit(button.dataset.outfit));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%modelButtons.length;
      if(event.key==='ArrowLeft')next=(index+modelButtons.length-1)%modelButtons.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=modelButtons.length-1;
      if(next!==undefined){
        event.preventDefault();
        selectOutfit(modelButtons[next].dataset.outfit);
        modelButtons[next].focus({preventScroll:true});
      }
    });
  });
  swatches.forEach(button => button.addEventListener('click',()=>{
    choices[active].color=button.dataset.fabric;
    choices[active].name=button.dataset.name;
    render();
  }));
  lengths.forEach(button => button.addEventListener('click',()=>{choices.dress.length=button.dataset.length;render()}));
  tipButtons.forEach((button,index)=>{
    button.addEventListener('click',()=>selectTip(index));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%tipButtons.length;
      if(event.key==='ArrowLeft')next=(index+tipButtons.length-1)%tipButtons.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tipButtons.length-1;
      if(next!==undefined){event.preventDefault();selectTip(next);tipButtons[next].focus({preventScroll:true})}
    });
  });
  // The note stack reserves the tallest note, including after font/viewport changes.
  positionSelection();
  if('ResizeObserver' in window)new ResizeObserver(positionSelection).observe(advice);
  document.fonts?.ready.then(positionSelection);
  render();
})();
