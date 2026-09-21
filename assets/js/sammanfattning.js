(function(){
'use strict';
const D=window.DATA_SAMMANFATTNING,$=id=>document.getElementById(id);
const f=(n,d=1)=>n.toLocaleString('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d}),nr=n=>n.toLocaleString('sv-SE');
function node(tag,attrs={},text){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function label(s,x,y,text,attrs={}){s.append(node('text',{x,y,fill:'#1f1f1f','font-size':12,...attrs},text));}
function curveSvg(){
const s=node('svg',{viewBox:'0 0 760 245',role:'img','aria-label':'Kvar i Göteborg efter ett till tjugo år. Samma Göteborgsbefolkning från 2005 följs 2006–2025.'}),x=h=>48+(h-1)/19*652,y=v=>196-v/100*166;
[0,25,50,75,100].forEach(v=>{s.append(node('line',{x1:48,x2:700,y1:y(v),y2:y(v),stroke:'#d1d9dc'}));label(s,39,y(v)+4,v+' %',{'text-anchor':'end'});});
s.append(node('path',{d:D.curve.map((r,i)=>(i?'L':'M')+x(r.years)+','+y(r.value)).join(' '),fill:'none',stroke:'#3f5564','stroke-width':2.7}));
D.curve.forEach(r=>{const dot=node('circle',{cx:x(r.years),cy:y(r.value),r:4,fill:'#3f5564'});dot.append(node('title',{},r.from+'–'+r.to+': '+f(r.value)+' %'));s.append(dot);if([1,5,10,15,20].includes(r.years)){label(s,x(r.years),y(r.value)-12,f(r.value)+' %',{'text-anchor':'middle'});label(s,x(r.years),222,r.years+' år',{'text-anchor':'middle'});}});return s;
}
const bygg=window.K8_BYGGAR_NY;const byggRows=bygg.categories.map((name,i)=>({name,value:bygg.types.find(t=>t.id==='hr').varden[i]}));const sortedBygg=[...byggRows].sort((a,b)=>a.value-b.value);D.gradients.push({id:'building',name:'Byggår',link:'kapitel8.html#steg-3',population:'Byggår inom hyresrätter i flerbostadshus',rows:byggRows,low:sortedBygg[0],high:sortedBygg.at(-1)});
function rangesSvg(full){
const s=node('svg',{viewBox:'0 0 760 455',role:'img','aria-label':'Kvar i samma bostad 2024–2025. Spann mellan grupper inom ålder, bostadstyp boendetid och byggår inom hyresrätter. Inte effektstorlekar.'}),min=full?0:50,x=v=>178+(v-min)/(100-min)*400;
for(let v=min;v<=100;v+=full?25:10){s.append(node('line',{x1:x(v),x2:x(v),y1:32,y2:435,stroke:'#d1d9dc'}));label(s,x(v),20,v+' %',{'text-anchor':'middle'});}
label(s,745,20,'Spann, procentenheter',{'text-anchor':'end','font-size':11});
D.gradients.forEach((r,i)=>{const cy=75+i*100;label(s,0,cy+4,r.name,{'font-size':15,'font-weight':600});
s.append(node('line',{x1:x(r.low.value),x2:x(r.high.value),y1:cy,y2:cy,stroke:'#3f5564','stroke-width':3}));
[r.low,r.high].forEach((p,j)=>{const dot=node('circle',{cx:x(p.value),cy,r:5,fill:j?'#3f5564':'#ffffff',stroke:'#3f5564','stroke-width':2});dot.append(node('title',{},p.name+': '+f(p.value)+' %'));s.append(dot);label(s,x(p.value),cy-14,f(p.value)+' %',{'text-anchor':'middle'});});
label(s,745,cy+6,f(r.high.value-r.low.value),{'text-anchor':'end','font-size':21,'font-weight':800});
label(s,178,cy+27,r.low.name+' → '+r.high.name,{'font-size':12});
});return s;
}
function spreadSvg(){
const s=node('svg',{viewBox:'0 0 760 315',role:'img','aria-label':'Standardavvikelse i procentenheter mellan 36 mellanområden. Observerade andelar respektive avvikelser från förväntat.'}),left=255,right=680,x=v=>left+v/5*(right-left);
[0,1,2,3,4,5].forEach(v=>{s.append(node('line',{x1:x(v),x2:x(v),y1:28,y2:296,stroke:'#d1d9dc'}));label(s,x(v),17,v,{'text-anchor':'middle'});});
D.spread.forEach((r,i)=>{const cy=58+i*67;label(s,0,cy+5,r.name,{'font-size':13});const bar=node('rect',{x:left,y:cy-12,width:x(r.value)-left,height:26,fill:i===3?'#008391':'#3f5564','data-value':r.value});bar.append(node('title',{},r.name+': '+f(r.value)+' procentenheter'));s.append(bar);label(s,x(r.value)+9,cy+6,f(r.value),{'font-size':17,'font-weight':600});});return s;
}
function table(headers,rows){const t=document.createElement('table'),h=t.createTHead().insertRow();headers.forEach(v=>{const c=document.createElement('th');c.scope='col';c.textContent=v;h.append(c);});const body=t.createTBody();rows.forEach(row=>{const r=body.insertRow();row.forEach((v,i)=>{const c=document.createElement(i?'td':'th');if(!i)c.scope='row';c.textContent=v;r.append(c);});});return t;}
function btn(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;return b;}
function exportTools(box,plot,headers,rows,title,note){
const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Visa alla värden';details.append(summary,table(headers,rows));box.append(details);
const controls=document.createElement('div');controls.className='ks__exports';const status=document.createElement('span');status.setAttribute('role','status');const fallback=document.createElement('textarea');fallback.hidden=true;fallback.readOnly=true;fallback.setAttribute('aria-label','Tabellvärden att kopiera');
controls.append(btn('Kopiera siffrorna',async()=>{const text=[headers,...rows].map(r=>r.join('\t')).join('\n');try{await navigator.clipboard.writeText(text);status.textContent='Kopierat.';}catch{fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Kopiera den markerade texten.';}}));
controls.append(btn('Hämta diagram',()=>{const s=plot.querySelector('svg').cloneNode(true),height=Number(s.viewBox.baseVal.height);s.setAttribute('xmlns','http://www.w3.org/2000/svg');s.setAttribute('viewBox','0 -58 760 '+(height+130));s.setAttribute('width','760');s.setAttribute('height',height+130);s.setAttribute('font-family','Open Sans, Arial, sans-serif');const bg=node('rect',{x:0,y:-58,width:760,height:height+130,fill:'#ffffff'});s.prepend(bg);label(s,10,-33,title,{'font-size':16,'font-weight':600});label(s,10,height+15,note,{'font-size':11});label(s,10,height+42,window.RAPPORT_KALLA,{'font-size':10});const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(s)],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=plot.id+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}));controls.append(status);box.append(controls,fallback);
}
const fields={'year-range':f(D.yearRange.min)+'–'+f(D.yearRange.max)+' procent',one:f(D.one)+' %',twenty:f(D.curve.at(-1).value)+' %','spread-raw':f(D.spread[0].value)+' procentenheter','spread-both':f(D.spread.at(-1).value)+' procentenheter',household:f(D.household)+' procent'};
document.querySelectorAll('[data-sum]').forEach(e=>e.textContent=fields[e.getAttribute('data-sum')]);
$('ks-curve').append(curveSvg());$('ks-book').textContent='2005–2025: '+nr(D.book.kvar)+' fanns kvar, '+nr(D.book.borta)+' fanns inte kvar och '+nr(D.book.nya)+' var nytillkomna vid slutåret.';
exportTools($('ks-overview'),$('ks-curve'),['Antal år','Startår','Slutår','Andel kvar (%)'],D.curve.map(r=>[r.years,r.from,r.to,f(r.value)]),'Kvar i Göteborg på kort och lång sikt','Samma startbefolkning från 2005, uppföljd 2006–2025. Kapitel 9.');
let full=true,selected=0;const choices=$('ks-range-choices');
const choiceButtons=D.gradients.map((r,i)=>{const b=btn(r.name,()=>{selected=i;drawRange();});choices.append(b);return b;});
function drawRange(){
$('ks-range-plot').replaceChildren(rangesSvg(full));$('ks-range-scale').textContent=full?'Visa närbild 50–100 %':'Visa 0–100 %';$('ks-range-scale').setAttribute('aria-pressed',String(!full));choiceButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
const r=D.gradients[selected],detail=$('ks-range-detail');detail.replaceChildren();const link=document.createElement('a');link.href=r.link;link.textContent='Läs mer om '+r.name.toLowerCase()+' · kapitel '+({age:3,housing:5,tenure:8,building:8}[r.id]);detail.append(link);const details=document.createElement('details'),sum=document.createElement('summary');sum.textContent=r.population+' · visa värden';details.append(sum,table(['Grupp','Kvar i samma bostad (%)'],r.rows.map(v=>[v.name,f(v.value)])));detail.append(details);
}
$('ks-range-scale').onclick=()=>{full=!full;drawRange();};drawRange();
exportTools($('ks-ranges'),$('ks-range-plot'),['Indelning','Lägst grupp','Andel (%)','Högst grupp','Andel (%)','Spann (procentenheter)'],D.gradients.map(r=>[r.name,r.low.name,f(r.low.value),r.high.name,f(r.high.value),f(r.high.value-r.low.value)]),'Kvar i samma bostad · 2024–2025','Olika gruppindelningar, inte isolerade effekter. Kapitel 3, 5 och 8.');
$('ks-spread-plot').append(spreadSvg());
exportTools($('ks-adjustment'),$('ks-spread-plot'),['Jämförelse','Standardavvikelse (procentenheter)'],D.spread.map(r=>[r.name,f(r.value)]),'Spridning mellan 36 mellanområden','Observerade andelar respektive observerat minus förväntat. Kapitel 7.');
const stages=[...document.querySelectorAll('.scen > .steg')],dots=$('punkter');let active=0;
stages.forEach((s,i)=>{const li=document.createElement('li'),b=btn('',()=>show(i));b.setAttribute('aria-label','Delsida '+(i+1));li.append(b);dots.append(li);});
function show(i){active=Math.max(0,Math.min(stages.length-1,i));stages.forEach((s,j)=>{s.classList.toggle('aktiv',j===active);s.setAttribute('aria-hidden',String(j!==active));s.inert=j!==active;});dots.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-current',String(j===active)));$('bakat').disabled=active===0;$('framat').disabled=active===stages.length-1;$('stegstatus').textContent='Delsida '+(active+1)+' av '+stages.length;history.replaceState(null,'','#steg-'+(active+1));}
$('bakat').onclick=()=>show(active-1);$('framat').onclick=()=>show(active+1);
const modal=$('metod');$('oppna-metod').onclick=()=>modal.showModal();$('stang-metod').onclick=()=>modal.close();
document.addEventListener('keydown',e=>{if(modal.open||e.target.closest('button,a,input,select,textarea,summary,[role="region"]'))return;if(['ArrowRight','PageDown','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(active+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}});
window.addEventListener('hashchange',()=>show((Number(location.hash.match(/steg-(\d+)/)?.[1])||1)-1));show((Number(location.hash.match(/steg-(\d+)/)?.[1])||1)-1);
})();
