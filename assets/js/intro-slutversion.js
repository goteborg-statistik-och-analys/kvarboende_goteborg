(function(){
 'use strict';
 const d=window.INTRO_SLUTVERSION,slide=document.getElementById('steg-1');
 if(!d||!slide)return;
 Object.entries(d).forEach(([key,c])=>{const e=slide.querySelector('[data-intro="'+key+'"]');if(e)e.textContent=key==='start'||key==='slut'?c.value.toLocaleString('sv-SE'):(c.value*100).toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1})+' %';});
 const inner=document.querySelector('#metod .metod__inner'),legacy=document.createElement('div');legacy.className='intro-metod-aldre';while(inner.firstChild)legacy.append(inner.firstChild);inner.append(legacy);
 const note=document.createElement('section');note.className='intro-metod';note.innerHTML='<h2>Så mäter vi</h2><p>Vi följer de personer som var folkbokförda i Göteborg den 31 december 2024 till den 31 december 2025. Båda andelarna har hela startbefolkningen som nämnare.</p><h3>Kvar i Göteborg och kvar i samma bostad</h3><p>En person kan bo kvar i Göteborg men ha bytt bostad inom staden. Personer som finns kvar i Göteborg men vars bostadsidentitet inte kan jämföras ingår också i andelen kvar i Göteborg. De räknas varken som bekräftat kvar i samma bostad eller som bekräftat bostadsbyte.</p><p>Skillnaden mellan de två talen är därför inte enbart personer som bytt bostad. Uppgifterna beskriver två mättillfällen, inte alla flyttningar under året.</p><h3>När bostadsuppgiften saknas eller är oklar</h3><p>Det gäller personer som är folkbokförda i Göteborg båda åren, men vars bostadsjämförelse inte kan avgöras i uttaget. De räknas varken som bekräftat kvar i samma bostad eller som bekräftat bostadsbyte.</p><p>Andelen 83,1 procent avser bekräftat kvarboende i samma bostad, med hela startbefolkningen som nämnare.</p><p>Personerna ingår i Göteborgs befolkning och i andelen kvar i staden. Bortfallet gäller jämförelsen av bostad, och fördelas inte ut mellan samma och annan bostad.</p><h3>Källa</h3><p>Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.</p>';
 inner.prepend(note);
 let played=false,fontsReady=false;
 function update(){const active=slide.classList.contains('aktiv');note.hidden=!active;legacy.hidden=active;if(!active&&slide.classList.contains('intro-visad'))slide.classList.remove('intro-visad');if(active&&!played&&fontsReady&&document.visibilityState==='visible'){played=true;slide.classList.add('intro-visad');}}
 slide.querySelector('.intro-nyckeltal li:last-child b').addEventListener('animationend',e=>{if(e.animationName==='intro-tal-fram')slide.classList.remove('intro-visad');});
 document.fonts.ready.then(()=>{fontsReady=true;update();});
 document.addEventListener('visibilitychange',update);
 new MutationObserver(update).observe(slide,{attributes:true,attributeFilter:['class']});update();
})();
