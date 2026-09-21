(function(){
  const box=document.createElement('aside');
  box.className='arbetslage';box.setAttribute('aria-label','Om testversionen');
  const title=document.createElement('strong');title.textContent='Arbetsmaterial · Testversion 1.';
  const note=document.createElement('span');note.textContent='Visas bäst i webbläsare på dator.';
  box.append(title,note);document.body.append(box);
  const plots=[...document.querySelectorAll('[id$="-plot"],.k4__figur')];
  function updateOverflow(){plots.forEach(plot=>{
    const overflow=plot.scrollWidth>plot.clientWidth+2;
    plot.classList.toggle('diagram-rullbart',overflow);
    if(overflow){plot.tabIndex=0;plot.setAttribute('role','region');if(!plot.hasAttribute('aria-label'))plot.setAttribute('aria-label','Diagram, rulla i sidled för att se hela');}
    let hint=plot.nextElementSibling;
    if(!hint?.classList.contains('diagram-rulltips')){hint=document.createElement('p');hint.className='diagram-rulltips';hint.textContent='Dra diagrammet i sidled för att se hela. Med tangentbord: välj diagrammet och använd piltangenterna.';plot.after(hint);}
    hint.hidden=!overflow;
  });}
  new ResizeObserver(updateOverflow).observe(document.body);
  window.addEventListener('hashchange',updateOverflow);updateOverflow();
})();
