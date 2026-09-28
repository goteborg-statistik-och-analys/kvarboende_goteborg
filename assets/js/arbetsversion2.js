(function(){
 'use strict';
 const file=location.pathname.split('/').pop(),make=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text)e.textContent=text;return e;};
 const top=document.querySelector('.topp__vanster');
 if(top){const nav=make('nav','v2-topplankar');nav.setAttribute('aria-label','Läsvägar');for(const [href,text] of [['huvudresultat.html','Huvudresultat'],['utforska.html','Alla delar']]){const a=make('a','',text);a.href=href;nav.append(a);}top.append(nav);}
 document.querySelectorAll('.kapitelmeny__lista').forEach(nav=>{const a=make('a','kapitelmeny__start','Huvudresultat och läsvägar');a.href='huvudresultat.html';nav.append(a);});
 document.querySelectorAll('.metod__inner').forEach(m=>{const p=make('p'),a=make('a','','Gemensam guide till mått och definitioner');a.href='metod-och-status.html';p.append(a);m.append(p);});
 document.querySelectorAll('.metod__inner').forEach(m=>{const section=make('section','v2-zoomhjalp');section.append(make('h3','','Anpassa storleken i webbläsaren'),make('p','','Tryck Ctrl och + för att förstora eller Ctrl och − för att förminska. Ctrl och 0 återställer till 100 procent. Du kan också hålla ned Ctrl och rulla mushjulet. På Mac använder du ⌘ i stället för Ctrl med tangenterna.'));m.append(section);});
 function status(selector,title,text,anchor){const place=document.querySelector(selector);if(!place)return;if(anchor==='omradesjamforelse'){const p=make('p','v2-review-link'),a=make('a','','Så beräknas jämförelsevärdet');p.dataset.reviewStatus=anchor;a.href='metod-och-status.html#'+anchor;p.append(a);place.prepend(p);return;}const box=make('aside','v2-status');box.dataset.reviewStatus=anchor;box.append(make('strong','',title),make('p','',text));const a=make('a','','Läs status och vad som återstår');a.href='metod-och-status.html#'+anchor;box.append(a);place.prepend(box);}
 if(file==='kapitel7.html'){
   for(const id of ['k7-bestand','k7-bada'])status('#'+id,'Arbetsberäkning, ej publiceringsgranskad','Beräknade avvikelser visas för lokal granskning. För vissa områden är källans avvikelse undertryckt. Redovisningsregeln och publiceringsbedömningen återstår.','omradesjamforelse');
   const p=make('p','not','Mellanområden samlar flera primärområden och används här för jämförelsen mellan stadens 36 områden. Högre kvarboende är inte automatiskt bättre. Följ gärna samma område genom kapitlets tre vyer.');document.querySelector('#steg-1 .steg__vanster')?.append(p);
 }
 if(file==='kapitel9.html'){
   const place=document.querySelector('#k9-stadsomraden');
   if(place){const p=make('p','v2-review-link'),a=make('a','','Stadsområden enligt 2025 års indelning');a.href='metod-och-status.html#historisk-geografi';p.append(a);place.prepend(p);}
 }
 if(file==='kapitel8.html'){
   const p=make('p','not','Under 1 år kräver ett känt annat bostads-ID vid föregående årsskifte. Gruppen omfattar därför inte alla som nyligen flyttat in. Sammanlagt 63 025 personer, cirka 10,3 procent av startbefolkningen, ligger utanför de fyra grupperna eftersom historiken eller startbostaden inte kan bedömas.');document.querySelector('#k8-boendetid .k8__not')?.after(p);
 }
 const comments={'kapitel2.html':['steg-3','steg-4'],'kapitel3.html':['steg-2','steg-3','steg-4','steg-5'],'kapitel5.html':['steg-1']};
 for(const id of comments[file]||[]){const left=document.querySelector('#'+id+' .steg__vanster');const h=left?.querySelector('h1,h2');const note=make('p','v2-kommentar');if(file==='kapitel3.html'&&id==='steg-5'){note.append(make('strong','','Kommentar till 2025. Du kan välja ett annat år i diagrammet med reglaget under diagrammet.'));}else{note.textContent='Kommentar till 2025. Du kan välja ett annat år i diagrammet med reglaget under diagrammet.';}h?.after(note);}
 if(file==='rapport.html')document.querySelector('#steg-3 .steg__vanster')?.append(make('p','not','Nytillkommen betyder att personen inte ingick i Göteborgs befolkning vid föregående årsskifte. Personen kan ha bott här tidigare år.'));
 if(file==='kapitel3.html')document.querySelector('#steg-4 .steg__vanster')?.append(make('p','not','Nytillkomna kan också vara återvändare som bott i Göteborg tidigare.'));
 if(file==='sammanfattning.html'){
   // Samma numeriska jämförelser, separata kort utan gemensam rangordning av spann.
   const box=document.getElementById('ks-ranges'),cards=make('div','v2-resultatkort');
   for(const r of window.DATA_SAMMANFATTNING.gradients){const card=make('section');card.append(make('h4','',r.name));for(const end of [r.low,r.high]){const p=make('p'),b=make('b','',end.value.toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1})+' %');p.append(b,document.createTextNode(' · '+end.name));card.append(p);}card.append(make('p','',r.population));const a=make('a','','Utforska jämförelsen');a.href=r.link;card.append(a);cards.append(card);}
   const wrapper=make('details','v2-fordjupning');wrapper.append(make('summary','','Fördjupning: samtliga grupper och spann'));box.before(cards,wrapper);wrapper.append(box);
   const adjustment=document.getElementById('ks-adjustment'),details=make('details','v2-fordjupning');details.append(make('summary','','Fördjupning: spridningsmått och värden'));adjustment.before(details);details.append(adjustment);
   status('#steg-3 .steg__hoger','Resultaten har arbetsstatus','Spridningsmåtten bygger på kapitel 7:s härledda avvikelser. Publiceringsbedömningen är inte klar. Diagram och värden finns kvar som lokal fördjupning.','omradesjamforelse');
   status('#steg-4 .steg__hoger','Områdesresultatet är preliminärt','Tolkningen av områdesjämförelsen ska läsas tillsammans med kapitel 7:s olösta publicerings- och underlagsfrågor.','omradesjamforelse');
   const spanP=document.querySelector('[data-sum="spread-raw"]')?.closest('p');if(spanP){const d=make('details','v2-fordjupning');d.append(make('summary','','Vad betyder standardavvikelsen?'));spanP.before(d);d.append(spanP);}
 }
})();
