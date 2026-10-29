(()=>{
 const host=document.querySelector('.invitations[data-view]:not([hidden])');
 if(!host)return;
 const tabs=[...host.querySelectorAll('[data-invite-tab]')];
 const panels=[...host.querySelectorAll('[data-invite-panel]')];
 function select(index,focus=false){
  const tab=tabs[index];
  if(!tab)return;
  const changed=tab.getAttribute('aria-selected')!=='true';
  tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;});
  panels.forEach(panel=>panel.hidden=panel.dataset.invitePanel!==tab.dataset.inviteTab);
  if(focus)tab.focus();
  if(changed)dispatchEvent(new CustomEvent('nordra-preview-change',{detail:{panel:panels[index]}}));
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>select(index));
  tab.addEventListener('keydown',event=>{
   const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
   if(next!==null){event.preventDefault();select(next,true);}
  });
 });
})();
