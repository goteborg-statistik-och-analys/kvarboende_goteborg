/* Flerårshorisonter har olika startår. Kohorten har fast startgrupp. */
(function(){
'use strict';
const D=window.DATA_KAPITEL9,C=window.RAPPORT_FARGER.palette;
const $=id=>document.getElementById(id),f=n=>n.toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1}),nr=n=>n.toLocaleString('sv-SE');
function node(tag,attrs={},text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;}
function label(s,x,y,text,attrs={}){s.append(node('text',{x,y,fill:'#1f1f1f','font-size':12,...attrs},text));}
function lineChart(series,index,full,fixed=false){
const horizons=series[0].rows.map(r=>r.years);
const width=760,height=310,left=47,right=560,top=24,bottom=264,min=full?0:30;
const x=years=>left+(years-1)/19*(right-left),y=v=>bottom-(v-min)/(100-min)*(bottom-top);
const s=node('svg',{viewBox:'0 0 760 310',role:'img','aria-label':fixed?'Samma Göteborgsbefolkning från 2005 följs vid årsskiftena 2006–2025.':'Andel kvar inom respektive område, ett till tjugo år. Alla jämförelser slutar 2025.'});
for(let v=min;v<=100;v+=full?20:10){s.append(node('line',{x1:left,x2:right,y1:y(v),y2:y(v),stroke:'#d1d9dc'}));label(s,left-8,y(v)+4,f(v),{'text-anchor':'end'});}
(fixed?[1,5,10,15,20]:horizons).forEach(h=>label(s,x(h),bottom+23,h+' år',{'text-anchor':'middle'}));
s.append(node('line',{x1:x(horizons[index]),x2:x(horizons[index]),y1:top,y2:bottom,stroke:'#3f5564','stroke-dasharray':'3 4'}));
series.forEach(r=>{s.append(node('path',{d:r.rows.map((v,i)=>(i?'L':'M')+x(v.years)+','+y(v.value)).join(' '),fill:'none',stroke:C[r.color],'stroke-width':2.6}));r.rows.forEach((v,i)=>{const dot=node('circle',{cx:x(v.years),cy:y(v.value),r:i===index?5:3,fill:C[r.color]});dot.append(node('title',{},r.name+' · '+v.from+'–'+v.to+': '+f(v.value)+' %'));s.append(dot);});});
window.RAPPORT_ETIKETTER(s,series.map(r=>({name:r.name,color:C[r.color],y:y(r.rows.at(-1).value)})),{right,top,bottom,width});
return s;
}
function cohortChart(){
const s=node('svg',{viewBox:'0 0 760 370',role:'img','aria-label':'Samma barnkohort från 2017: utfall 2021 och 2025. Alla staplar börjar på noll.'}),left=248,right=686,x=v=>left+v/100*(right-left);
[0,25,50,75,100].forEach(v=>{s.append(node('line',{x1:x(v),x2:x(v),y1:30,y2:358,stroke:'#d1d9dc'}));label(s,x(v),20,v+' %',{'text-anchor':'middle'});});
D.cohort.categories.forEach((r,i)=>{const cy=60+i*80;label(s,0,cy+15,r.name);r.rows.forEach((v,j)=>{const y=cy+j*29;s.append(node('rect',{x:left,y,width:x(v.value)-left,height:21,fill:C[r.color]}));if(j===0)s.append(node('rect',{x:left,y,width:x(v.value)-left,height:21,fill:'none',stroke:'#ffffff','stroke-width':3}));label(s,left-9,y+15,v.year,{'text-anchor':'end'});label(s,x(v.value)+7,y+15,f(v.value)+' %',{'font-weight':j?600:400});});});
return s;
}

function accountingChart(a){
 const width=760,height=385,top=40,bottom=329,barWidth=158,max=Math.ceil(Math.max(a.start,a.end)/100000)*100000;
 const y=v=>bottom-v/max*(bottom-top);
 const svg=node('svg',{viewBox:'0 0 760 385',role:'img','aria-label':a.name+', 2005 och 2025. Samma grupp kvar i båda staplarna. Antal personer, skala från noll.'});
 for(let i=0;i<=4;i++){const v=max*i/4;svg.append(node('line',{x1:91,x2:704,y1:y(v),y2:y(v),stroke:'#d1d9dc'}));label(svg,80,y(v)+4,nr(v),{'text-anchor':'end','font-size':11});}
 const columns=[{x:190,year:2005,total:a.start,extra:a.borta,kind:'Inte kvar',fill:C.gra,text:'#1f1f1f'},{x:464,year:2025,total:a.end,extra:a.nya,kind:'Nytillkomna',fill:C.gron,text:'#ffffff'}];
 // Gemensam bas och samma höjd visar exakt samma personer.
 svg.append(node('line',{x1:348,x2:464,y1:y(a.kvar),y2:y(a.kvar),stroke:C.morkbla,'stroke-width':1}));
 columns.forEach(c=>{
  const base=node('rect',{x:c.x,y:y(a.kvar),width:barWidth,height:bottom-y(a.kvar),fill:C.morkbla,'data-part':'kvar','data-value':a.kvar});
  base.append(node('title',{},'Kvar i '+a.name+' både 2005 och 2025: '+nr(a.kvar)));svg.append(base);
  const added=node('rect',{x:c.x,y:y(c.total),width:barWidth,height:y(a.kvar)-y(c.total),fill:c.fill,'data-part':c.kind,'data-value':c.extra});
  added.append(node('title',{},c.kind+': '+nr(c.extra)));svg.append(added);
  const baseMid=(bottom+y(a.kvar))/2,extraMid=(y(a.kvar)+y(c.total))/2;
  label(svg,c.x+14,baseMid-5,'Kvar i båda åren',{fill:'#ffffff','font-size':12});label(svg,c.x+14,baseMid+17,nr(a.kvar),{fill:'#ffffff','font-size':19,'font-weight':800});
  label(svg,c.x+14,extraMid-5,c.kind,{fill:c.text,'font-size':12});label(svg,c.x+14,extraMid+17,nr(c.extra),{fill:c.text,'font-size':19,'font-weight':800});
  label(svg,c.x+barWidth/2,y(c.total)-11,nr(c.total),{'text-anchor':'middle','font-size':15,'font-weight':600});
  label(svg,c.x+barWidth/2,bottom+27,String(c.year),{'text-anchor':'middle','font-size':15,'font-weight':600});
 });
 label(svg,91,18,'Antal personer',{'font-size':11});
 return svg;
}

function table(headers,rows){const table=document.createElement('table'),head=table.createTHead().insertRow();headers.forEach(h=>{const c=document.createElement('th');c.scope='col';c.textContent=h;head.append(c);});const body=table.createTBody();rows.forEach(row=>{const tr=body.insertRow();row.forEach((v,i)=>{const c=document.createElement(i?'td':'th');if(!i)c.scope='row';c.textContent=v;tr.append(c);});});return table;}
function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;return b;}
function make(id,title,series,cohort=false){
const box=$(id),district=id==='k9-stadsomraden',fixed=['k9-goteborg','k9-jamfor','k9-stadsomraden'].includes(id),horizons=cohort?[]:series[0].rows.map(r=>r.years);let index=horizons.length-1,full=id!=='k9-jamfor';
box.innerHTML='<h3></h3><p class="k9__reading"></p><div class="k9__controls"></div><div class="k9__plot"></div><div class="k9__values"></div><div class="k9__year"></div><p class="k9__note"></p><p class="k9__source"></p><div class="k9__exports"></div><details><summary>Visa alla värden</summary><div class="k9__table"></div></details>';
box.querySelector('h3').textContent=title;
box.querySelector('.k9__source').textContent=window.RAPPORT_KALLA;
const plot=box.querySelector('.k9__plot'),reading=box.querySelector('.k9__reading'),values=box.querySelector('.k9__values'),year=box.querySelector('.k9__year');
let slider,output,scale;
if(!cohort){
scale=button('Visa närbild 30–100 %',()=>{full=!full;draw();});box.querySelector('.k9__controls').append(scale);
const lab=document.createElement('label');lab.htmlFor=id+'-period';lab.textContent=fixed?'Följ gruppen framåt från 2005':'Välj tidsperspektiv';output=document.createElement('output');output.htmlFor=lab.htmlFor;
slider=document.createElement('input');slider.type='range';slider.id=lab.htmlFor;slider.min=0;slider.max=horizons.length-1;slider.step=1;slider.value=index;slider.oninput=()=>{index=Number(slider.value);draw();};
year.append(lab,output,slider);
plot.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const svg=plot.querySelector('svg'),m=svg.getScreenCTM();if(!m)return;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(m.inverse());if(q.x<47||q.x>560||q.y<24||q.y>264)return;const h=1+(q.x-47)/513*19;const nearest=horizons.reduce((a,v,i)=>Math.abs(v-h)<Math.abs(horizons[a]-h)?i:a,0);if(nearest!==index){index=nearest;draw();}});
}
box.querySelector('.k9__note').textContent=cohort?'Samma 34 286 barn vid båda uppföljningarna. Andel av gruppen 2017. Inget av utfallen innebär att personen måste ha bott oavbrutet på platsen.':district?'Varje kurva följer samma startbefolkning i stadsområdet från 2005. Kvar avser samma stadsområde vid uppföljningen, inte samma bostad eller oavbrutet boende. Ospecificerat startområde visas inte.':fixed?'Samma 484 894 personer från Göteborg den 31 december 2005 är nämnare varje år. Kvar betyder folkbokförd där vid uppföljningen; personen kan ha flyttat bort och tillbaka. Reglaget ändrar avläsningen, inte analystexten.':'Varje punkt har ett eget startår och slutår 2025. Reglaget och pekaren ändrar avläsningen, inte analystexten.';
const headers=cohort?['Utfall','År','Antal','Andel (%)']:['Område','Antal år','Startår','Slutår','Startbefolkning','Kvar','Andel (%)'];
const rows=cohort?D.cohort.categories.flatMap(r=>r.rows.map(v=>[r.name,v.year,nr(v.antal),f(v.value)])):series.flatMap(r=>r.rows.map(v=>[r.name,v.years,v.from,v.to,nr(v.start),nr(v.kvar),f(v.value)]));
box.querySelector('.k9__table').append(table(headers,rows));
const exports=box.querySelector('.k9__exports'),status=document.createElement('span');status.setAttribute('role','status');
const fallback=document.createElement('textarea');fallback.hidden=true;fallback.readOnly=true;fallback.setAttribute('aria-label','Tabellvärden att kopiera');
exports.append(button('Kopiera siffrorna',async()=>{const text=[headers,...rows].map(r=>r.join('\t')).join('\n');try{await navigator.clipboard.writeText(text);status.textContent='Siffrorna kopierade.';}catch{fallback.hidden=false;fallback.value=text;fallback.focus();fallback.select();status.textContent='Kopiera den markerade texten.';}}));
exports.append(button('Hämta diagram',()=>{
const svg=plot.querySelector('svg').cloneNode(true);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','760');const h=Number(svg.viewBox.baseVal.height);svg.setAttribute('viewBox','0 -68 760 '+(h+135));svg.setAttribute('height',h+135);svg.setAttribute('font-family','Open Sans, Arial, sans-serif');
const background=node('rect',{x:0,y:-68,width:760,height:h+135,fill:'#ffffff'});svg.prepend(background);
label(svg,12,-43,title,{'font-size':16,'font-weight':600});label(svg,12,-18,reading.textContent,{'font-size':11});label(svg,12,h+18,cohort?'Samma startgrupp 2017.':fixed?'Samma Göteborgsbefolkning 2005, uppföljning 2006–2025.':'Olika startår, gemensamt slutår 2025; respektive områdes startbefolkning.',{'font-size':11});label(svg,12,h+42,box.querySelector('.k9__source').textContent,{'font-size':10});
const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=id+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}));
exports.append(status);box.append(fallback);
function draw(){
plot.replaceChildren(cohort?cohortChart():lineChart(series,index,full,fixed));
if(cohort){reading.textContent='Barn 1–5 år 2017 · uppföljning 2021 och 2025';return;}
const h=horizons[index],from=fixed?2005:2025-h,to=fixed?2005+h:2025;reading.textContent='Andel (%) · Skala '+(full?'0':'30')+'–100 · '+from+'-12-31 till '+to+'-12-31';
scale.textContent=full?'Visa närbild 30–100 %':'Visa 0–100 %';scale.setAttribute('aria-pressed',String(!full));output.textContent=h+' år · '+from+'–'+to;slider.value=index;slider.setAttribute('aria-valuetext',h+' år, '+from+' till '+to);
values.replaceChildren();series.forEach(r=>{const item=document.createElement('div'),name=document.createElement('span'),value=document.createElement('b');name.textContent=r.name;value.textContent=f(r.rows[index].value)+' %';item.append(name,value);values.append(item);});
if(id==='k9-goteborg'){const detail=document.createElement('p');detail.className='k9__count';detail.textContent=nr(series[0].rows[index].kvar)+' av '+nr(series[0].rows[index].start)+' personer vid starten.';values.append(detail);}
}
draw();
}

function makeAccounting(){
 const box=$('k9-helhet');let chosen=0;
 box.innerHTML='<h3>Befolkningen 2005 och 2025</h3><div class="k9__controls k9__area"></div><p class="k9__reading"></p><div class="k9__plot"></div><div class="k9__values k9__balancevalues"></div><p class="k9__note"></p><p class="k9__source"></p><div class="k9__exports"></div><details><summary>Visa alla värden och definitioner</summary><div class="k9__table"></div><p class="k9__note">Kvar betyder samma område vid båda årsskiftena. För stadsområden räknas även flyttar inom Göteborg som nytillkomna eller inte kvar. Dessa utfall ska inte summeras till kommunens utfall.</p></details>';
 const lab=document.createElement('label');lab.textContent='Visa område ';
 const select=document.createElement('select');select.setAttribute('aria-label','Välj Göteborg eller stadsområde');
 D.accounts.forEach((a,i)=>{if(a.name==='Ospecificerat Göteborg')return;const o=document.createElement('option');o.value=i;o.textContent=a.name;select.append(o);});
 select.onchange=()=>{chosen=Number(select.value);draw();};lab.append(select);box.querySelector('.k9__controls').append(lab);
 const plot=box.querySelector('.k9__plot'),values=box.querySelector('.k9__values'),reading=box.querySelector('.k9__reading');
 const headers=['Område','Start 2005','Kvar båda åren','Inte kvar 2025','Slut 2025','Nytillkomna','Kvar av start (%)','Nya av slut (%)'];
 const rows=D.accounts.map(a=>[a.name,nr(a.start),nr(a.kvar),nr(a.borta),nr(a.end),nr(a.nya),f(a.shareKvarStart),f(a.shareNyaEnd)]);
 box.querySelector('.k9__table').append(table(headers,rows));
 box.querySelector('.k9__source').textContent=window.RAPPORT_KALLA;
 const status=document.createElement('span');status.setAttribute('role','status');
 const fallback=document.createElement('textarea');fallback.hidden=true;fallback.readOnly=true;fallback.setAttribute('aria-label','Befolkningsbalanser att kopiera');
 const actions=box.querySelector('.k9__exports');
 actions.append(button('Kopiera siffrorna',async()=>{const text=[headers,...rows].map(r=>r.join('\t')).join('\n');try{await navigator.clipboard.writeText(text);status.textContent='Siffrorna kopierade.';}catch{fallback.hidden=false;fallback.value=text;fallback.focus();fallback.select();status.textContent='Kopiera den markerade texten.';}}));
 actions.append(button('Hämta diagram',()=>{
  const a=D.accounts[chosen],svg=accountingChart(a),h=385;
  svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','760');svg.setAttribute('height','490');svg.setAttribute('viewBox','0 -45 760 490');svg.setAttribute('font-family','Open Sans, Arial, sans-serif');
  svg.prepend(node('rect',{x:0,y:-45,width:760,height:490,fill:'#ffffff'}));
  label(svg,12,-21,a.name+' · befolkningen 2005 och 2025',{'font-size':16,'font-weight':600});
  label(svg,12,h+12,'Samma personer i den mörka basen. Antal personer vid två årsskiften.',{'font-size':11});
  label(svg,12,h+36,window.RAPPORT_KALLA,{'font-size':10});
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='k9-helhet-'+a.name+'.svg';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }));actions.append(status);box.append(fallback);
 function draw(){
  const a=D.accounts[chosen];plot.replaceChildren(accountingChart(a));
  reading.textContent=a.name+' · 31 december 2005 och 31 december 2025';
  values.replaceChildren();
  for(const [caption,value] of [['Av 2005 års befolkning finns kvar',a.shareKvarStart],['Av 2025 års befolkning är nytillkomna',a.shareNyaEnd]]){
   const item=document.createElement('div'),label=document.createElement('span'),number=document.createElement('b');label.textContent=caption;number.textContent=f(value)+' %';item.append(number,label);values.append(item);
  }
  box.querySelector('.k9__note').textContent='De mörka delarna visar samma '+nr(a.kvar)+' personer vid båda årsskiftena. Inte kvar omfattar utflyttade och avlidna; nytillkomna omfattar inflyttade och födda efter starten. Områdesvalet ändrar diagrammet, inte texten om Göteborg.';
 }
 draw();
}

make('k9-goteborg','Kvar i Göteborg efter ett till tjugo år',[window.K9_KOHORT2005_NY.series[0]]);
make('k9-jamfor','Kvar inom respektive geografi',window.K9_KOHORT2005_NY.series);
make('k9-stadsomraden','Kvar i samma stadsområde',window.K9_STADSOMRADEN_NY.series);


const stages=[...document.querySelectorAll('.scen > .steg')],dots=$('punkter');let active=0;
stages.forEach((s,i)=>{const li=document.createElement('li'),b=button('',()=>show(i));b.setAttribute('aria-label','Delsida '+(i+1));li.append(b);dots.append(li);});
function show(i){active=Math.max(0,Math.min(stages.length-1,i));stages.forEach((s,j)=>{s.classList.toggle('aktiv',j===active);s.setAttribute('aria-hidden',String(j!==active));s.inert=j!==active;});dots.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-current',String(j===active)));$('bakat').disabled=active===0;$('framat').disabled=active===stages.length-1;$('stegstatus').textContent='Delsida '+(active+1)+' av '+stages.length;history.replaceState(null,'','#steg-'+(active+1));}
$('bakat').onclick=()=>show(active-1);$('framat').onclick=()=>show(active+1);
const modal=$('metod');$('oppna-metod').onclick=()=>modal.showModal();$('stang-metod').onclick=()=>modal.close();
document.addEventListener('keydown',e=>{if(modal.open||e.target.closest('button,a,input,select,textarea,summary,[role="region"]'))return;if(['ArrowRight','PageDown','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(active+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}});
window.addEventListener('hashchange',()=>show((Number(location.hash.match(/steg-(\d+)/)?.[1])||1)-1));
show((Number(location.hash.match(/steg-(\d+)/)?.[1])||1)-1);
})();
