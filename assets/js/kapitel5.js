/* Kapitel 5. Bostaden vid startåret, ålder vid slutåret. */
(function(){
'use strict';
const D=window.DATA_KAPITEL5,F=window.RAPPORT_FARGER,C=F.palette;
if(!D)return;
let yearIndex=D.ar.length-1;
const source=window.RAPPORT_KALLA,period='2024-12-31 till 2025-12-31';
const fmt=(v,d=1)=>v===null?'Uppgift saknas':v.toLocaleString('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d});
const $=id=>document.getElementById(id);
  function html(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function node(tag,attrs={},text){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;}
  function label(x,y,text,anchor='start',weight=400){return node('text',{x,y,'text-anchor':anchor,fill:'#1f1f1f','font-family':'Open Sans, Arial, sans-serif','font-size':12,'font-weight':weight},text);}
  function button(text,fn){const b=html('button','',text);b.type='button';b.addEventListener('click',fn);return b;}
  function symbol(id,x,y,r=4){
    const a={fill:C[F.ageLines[id]],stroke:'#fff','stroke-width':1},kind=F.symbols[id];
    if(kind===1)return node('rect',{...a,x:x-r,y:y-r,width:2*r,height:2*r});
    if(kind===2)return node('path',{...a,d:`M${x},${y-r-1} L${x+r+1},${y} L${x},${y+r+1} L${x-r-1},${y} Z`});
    if(kind===3)return node('path',{...a,d:`M${x},${y-r-1} L${x+r+1},${y+r} L${x-r-1},${y+r} Z`});
    return node('circle',{...a,cx:x,cy:y,r});
  }
  function shell(id,title,caption,kalla=source){
    const root=$(id);root.replaceChildren();const heading=html('h3','',title);
    if(id!=='k5-karta')heading.append(html('span','k5__datum',' ('+period+')'));
    const controls=html('div','k5__val'),scale=html('div','k5__verktyg'),figure=html('div','k5__figur'),cap=html('p','',caption),src=html('p','',kalla),exports=html('div','k5__export'),status=html('span');status.setAttribute('role','status');root.append(heading,controls,scale,figure,cap,src,exports);
    const p={id,root,heading,controls,scale,figure,cap,src,exports,status,full:false};
    const copy=button(id==='k5-karta'?'Kopiera karta':'Kopiera diagram',()=>copyGraphic(p,copy));p.download=html('a','','Hämta PNG');p.download.hidden=true;exports.append(copy,p.download,status);return p;
  }
  function table(p,rows){
    if(!p.details){
      p.details=html('details','k5__data');p.details.append(html('summary','','Visa alla värden'));p.tableWrap=html('div','k5__tabell');p.tableWrap.tabIndex=0;p.tableWrap.setAttribute('role','region');p.tableWrap.setAttribute('aria-label','Datatabell, kan rullas i sidled');
      const controls=html('div','k5__export'),status=html('span'),fallback=html('textarea');status.setAttribute('role','status');fallback.readOnly=true;fallback.hidden=true;fallback.setAttribute('aria-label','Värden för kopiering till Excel');
      controls.append(button('Kopiera siffrorna',async()=>{const value=p.rows.map(r=>r.join('\t')).join('\r\n');fallback.hidden=true;try{await navigator.clipboard.writeText(value);status.textContent='Kopierat. Klistra in i Excel.';}catch{fallback.value=value;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Kopiera markerad text med Ctrl+C eller ⌘C.';}}),status);p.details.append(p.tableWrap,controls,fallback);p.root.append(p.details);
    }
    p.rows=rows;const t=html('table');t.createCaption().textContent=p.cap.textContent;const head=t.createTHead().insertRow();rows[0].forEach(v=>{const th=html('th','',v);th.scope='col';head.append(th);});const body=t.createTBody();rows.slice(1).forEach(row=>{const tr=body.insertRow();row.forEach((v,i)=>{const cell=html(i?'td':'th','',v);if(!i)cell.scope='row';tr.append(cell);});});p.tableWrap.replaceChildren(t);
  }

const panels=[
 {...shell('k5-typ-tid','Kvar i samma bostad, efter bostadstyp',''),time:true,series:window.K5S1_SLUTVERSION},
 {...shell('k5-typ-alder','Kvar i samma bostad – tre åldersgrupper',''),series:window.K5S2_SLUTVERSION,categories:D.bostadstyper.slice(0,3)},
 {...shell('k5-rum-alder','Kvar i samma bostad – antal rum och ålder',''),rooms:true,series:window.K5S3_SLUTVERSION,categories:D.rumsklasser}
];
function visible(p){return p.time?p.series.filter(s=>p.visible.has(s.id)):p.view==='compare'?p.series:p.series.filter(s=>s.id===p.view);}
function seriesColor(p,s){return C[p.time?s.farg:F.ageLines[s.id]];}
function profileRows(p){
 const s=visible(p)[0];const rows=p.categories.map((name,i)=>({name,i,value:s.varden[i]}));
 if(p.view!=='compare'&&p.sort!=='category')rows.sort((a,b)=>(p.sort==='low'?a.value-b.value:b.value-a.value)||a.i-b.i);
 return rows;
}
function bounds(p){return !p.time&&p.view!=='compare'||p.full?[0,100]:[50,100];}
function points(p,width){
 const W=Math.max(500,width),H=280,left=48,right=W-(p.time?150:24),top=23,bottom=235,series=visible(p),[min,max]=bounds(p),count=p.time?13:p.categories.length;
 const x=i=>left+i/(count-1)*(right-left),y=v=>bottom-(v-min)/(max-min)*(bottom-top);
 const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':p.time?'Kvarboende i fyra bostadstyper 2013–2025. Uppgift saknas 2019.':'Kvarboende efter antal rum för tre åldersgrupper 2025. Exakta värden finns i tabellen.'});
 const ticks=min===0?[0,25,50,75,100]:[50,60,70,80,90,100];
 ticks.forEach(v=>svg.append(node('line',{x1:left,x2:right,y1:y(v),y2:y(v),stroke:C.gra}),label(left-8,y(v)+4,fmt(v),'end')));
 const tickIds=p.time?[0,4,8,12]:p.categories.map((_,i)=>i);tickIds.forEach(i=>svg.append(label(x(i),H-14,p.time?D.ar[i]:p.categories[i],'middle')));
 if(p.time){svg.append(node('line',{x1:x(yearIndex),x2:x(yearIndex),y1:top,y2:bottom,stroke:C.morkbla,'stroke-dasharray':'4 4'}),label(x(6),14,'2019 saknas','middle'));}
 series.forEach(s=>{
  let path='',connected=false;s.varden.forEach((v,i)=>{if(v===null){connected=false;return;}path+=(connected?' L':' M')+x(i)+' '+y(v);connected=true;});
  svg.append(node('path',{d:path,fill:'none',stroke:seriesColor(p,s),'stroke-width':2.7,'stroke-linejoin':'round','data-series':s.id}));
  if(p.time)svg.append(node('path',{d:`M${x(5)},${y(s.varden[5])} L${x(7)},${y(s.varden[7])}`,fill:'none',stroke:seriesColor(p,s),'stroke-width':2.7,'stroke-dasharray':'5 5','data-gap':s.id}));
  s.varden.forEach((v,i)=>{if(v===null)return;const point=p.time?node('circle',{cx:x(i),cy:y(v),r:i===yearIndex?5:2.7,fill:seriesColor(p,s),stroke:i===yearIndex?'#1f1f1f':'none','stroke-width':1}):symbol(s.id,x(i),y(v));point.append(node('title',{},s.namn+' · '+(p.time?D.ar[i]:p.categories[i])+': '+fmt(v,1)+' %'));if(p.time)point.addEventListener('click',()=>{yearIndex=i;drawCharts();});svg.append(point);});
 });
 if(p.time){
  const names=series.map(s=>({s,y:y(s.varden[12]),target:y(s.varden[12])})).sort((a,b)=>a.y-b.y);
  names.forEach((n,i)=>n.y=Math.max(n.y,i?names[i-1].y+20:top));
  for(let i=names.length-1;i>=0;i--)names[i].y=Math.min(names[i].y,i===names.length-1?bottom:names[i+1].y-20);
  names.forEach(n=>svg.append(node('path',{d:`M${right+5},${n.target} L${right+16},${n.y} H${right+23}`,fill:'none',stroke:seriesColor(p,n.s),'stroke-width':1.3}),label(right+28,n.y+4,n.s.namn,'start',600)));
 }
 return svg;
}
function spreads(p,width){
 const W=Math.max(500,width),left=118,right=W-72,[min,max]=bounds(p),x=v=>left+(v-min)/(max-min)*(right-left),panelH=96+p.categories.length*24,H=34+p.series.length*panelH;
 const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'En panel per ålder. Spannet är högsta minus lägsta kvarboendet över samma '+(p.rooms?'fem rumsklasser':'tre bostadstyper')+'. Alla paneler har samma skala.'});
 (min===0?[0,25,50,75,100]:[50,60,70,80,90,100]).forEach(v=>svg.append(label(x(v),17,fmt(v),'middle')));
 p.series.forEach((s,index)=>{
  const top=32+index*panelH;if(s.varden.every(v=>v===null)){svg.append(node('line',{x1:0,x2:W,y1:top,y2:top,stroke:C.gra}),label(0,top+25,s.namn,'start',800),label(0,top+65,'Uppgifter behöver kompletteras för denna åldersgrupp.'));return;}const lo=Math.min(...s.varden),hi=Math.max(...s.varden),range=Math.round((hi-lo)*100)/100;
  svg.append(node('line',{x1:0,x2:W,y1:top,y2:top,stroke:C.gra}),label(0,top+25,s.namn,'start',800));
  if(p.id==='k5-typ-alder')svg.append(label(0,top+48,['Större skillnader mellan bostadstyper','Lägre kvarboende, mindre skillnader','Högst kvarboende i småhus'][index]));
  if(p.rooms)svg.append(label(0,top+48,['Större skillnader mellan rumsklasser','Små skillnader mellan rumsklasser','Högre kvarboende i större bostäder'][index]));
  const number=label(W-2,top+30,fmt(range),'end',800);number.setAttribute('font-size',28);number.setAttribute('class','k5__spann');number.setAttribute('data-range',s.id);svg.append(number,label(W-2,top+48,'procentenheters spann','end'));
  svg.append(node('rect',{x:x(lo),y:top+67,width:x(hi)-x(lo),height:p.categories.length*24,fill:'#fff3b0'}),node('path',{d:`M${x(lo)},${top+64} V${top+58} H${x(hi)} V${top+64}`,fill:'none',stroke:C.morkbla,'stroke-width':1.5}));
  (min===0?[0,25,50,75,100]:[50,60,70,80,90,100]).forEach(v=>svg.append(node('line',{x1:x(v),x2:x(v),y1:top+67,y2:top+67+p.categories.length*24,stroke:C.gra,'stroke-width':.6})));
  p.categories.forEach((name,i)=>{const cy=top+80+i*24;svg.append(label(0,cy+4,name),node('circle',{cx:x(s.varden[i]),cy,r:4.5,fill:p.rooms?C.morkbla:C[D.bostadstyp_tid[i].farg],stroke:'#fff','stroke-width':1}),label(W-2,cy+4,fmt(s.varden[i])+' %','end',600));});
 });return svg;
}
function profile(p,width){
 const W=Math.max(500,width),rows=profileRows(p),bars=p.view!=='compare',H=65+rows.length*51,left=118,right=W-(bars?72:190),[min,max]=bounds(p),x=v=>left+(v-min)/(max-min)*(right-left),series=visible(p);
 const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':(bars?'Liggande staplar för '+series[0].namn:'Åldersjämförelse med punkter')+'. Kvar i samma bostad 2025. Exakta värden finns i tabellen.'});
 (min===0?[0,25,50,75,100]:[50,60,70,80,90,100]).forEach(v=>svg.append(node('line',{x1:x(v),x2:x(v),y1:35,y2:H-12,stroke:C.gra}),label(x(v),23,fmt(v),'middle')));
 if(!bars)series.forEach((s,j)=>svg.append(label(W-126+j*59,23,s.namn.replace(' år',''),'end')));
 rows.forEach((row,pos)=>{
  const y=60+pos*51;svg.append(label(0,y+4,row.name));
  if(bars){const s=series[0],value=s.varden[row.i];if(value===null){svg.append(label(W-2,y+4,'Uppgift saknas','end'));return;}svg.append(node('rect',{x:x(0),y:y-13,width:x(value)-x(0),height:26,fill:seriesColor(p,s),'data-bar':'true'}),label(W-2,y+4,fmt(value)+' %','end',600));}
  else{const values=series.map(s=>s.varden[row.i]);svg.append(node('line',{x1:x(Math.min(...values)),x2:x(Math.max(...values)),y1:y,y2:y,stroke:C.gra,'stroke-width':3}));series.forEach((s,j)=>{const point=symbol(s.id,x(s.varden[row.i]),y,4.5);point.append(node('title',{},row.name+' · '+s.namn+': '+fmt(s.varden[row.i],1)+' %'));svg.append(point,label(W-126+j*59,y+4,fmt(s.varden[row.i])+' %','end'));});}
 });return svg;
}
function rowsForTable(p){
 const header=[p.time?'Slutår':p.rooms?'Rumsklass':'Bostadstyp',p.time?'Bostadstyp':'Åldersgrupp','Andel kvar (%)','Antal kvar','Startbefolkning'];
 const rows=[];
 if(p.time)D.ar.forEach((year,i)=>p.series.forEach(s=>rows.push([year,s.namn,s.varden[i]===null?'Uppgift saknas':fmt(s.varden[i]),s.kvar[i]===null?'':String(s.kvar[i]),s.population[i]===null?'':String(s.population[i])])));
 else profileRows(p).forEach(row=>visible(p).forEach(s=>rows.push([row.name,s.namn,fmt(s.varden[row.i],1),s.kvar[row.i]===null?'':String(s.kvar[row.i]),s.population[row.i]===null?'':String(s.population[row.i])])));
 return [header,...rows];
}
function setup(p){
 p.title=p.heading.childNodes[0].textContent;p.view='compare';p.sort='category';p.visible=new Set(p.series.map(s=>s.id));
 p.scaleLabel=html('span');p.zoom=button('Visa 0–100 %',()=>{p.full=!p.full;drawCharts();});p.scale.append(p.scaleLabel,p.zoom);
 p.figure.tabIndex=0;p.figure.setAttribute('role','region');p.figure.setAttribute('aria-label','Diagram, kan rullas i sidled på liten skärm');
 if(p.time){
  p.metrics=html('div','k5__metrics');p.heading.after(p.metrics);p.figure.after(p.controls);
  p.controls.setAttribute('role','group');p.controls.setAttribute('aria-label','Visa eller dölj bostadstyper');
  p.buttons=p.series.map(s=>{const b=button(s.namn,()=>{if(p.visible.has(s.id)&&p.visible.size===1){p.status.textContent='Minst en bostadstyp behöver visas.';return;}p.visible.has(s.id)?p.visible.delete(s.id):p.visible.add(s.id);p.status.textContent='';drawCharts();});const sample=html('i','k5__prov');sample.style.backgroundColor=seriesColor(p,s);sample.setAttribute('aria-hidden','true');b.prepend(sample);p.controls.append(b);return b;});
  const wrap=html('div','k5__arval'),lab=html('label','','Utforska årsskiftet');lab.htmlFor=p.id+'-ar';lab.append(html('small','','Dra i reglaget för att välja år.'));const quick=html('div','k5__snabbval');p.quick=[].map(i=>{const b=button(D.ar[i],()=>{yearIndex=i;drawCharts();});quick.append(b);return b;});p.slider=html('input');p.slider.type='range';p.slider.id=lab.htmlFor;p.slider.min=0;p.slider.max=12;p.slider.step=1;p.slider.value=12;p.slider.addEventListener('input',e=>{yearIndex=Number(e.target.value);drawCharts();});wrap.append(lab,quick,p.slider);p.controls.after(wrap);
 }else{
  p.controls.setAttribute('role','group');p.controls.setAttribute('aria-label','Jämför åldrar eller välj en ålder för staplar');
  p.buttons=[{id:'compare',namn:'Jämför åldrar'},...p.series].map(s=>{const b=button(s.namn,()=>{p.view=s.id;p.sort=s.id==='compare'?'category':'high';drawCharts();});b.dataset.view=s.id;p.controls.append(b);return b;});
  p.sorting=html('label','k5__sort','Sortera: ');p.sortSelect=html('select');p.sortSelect.setAttribute('aria-label','Sortera staplar');[['category',p.rooms?'Antal rum':'Bostadstyp'],['high','Högst först'],['low','Lägst först']].forEach(([value,text])=>{const o=html('option','',text);o.value=value;p.sortSelect.append(o);});p.sortSelect.addEventListener('change',()=>{p.sort=p.sortSelect.value;drawCharts();});p.sorting.append(p.sortSelect);p.scale.append(p.sorting);
 }
}
function drawCharts(){
 panels.forEach(p=>{
  const bars=!p.time&&p.view!=='compare',[min,max]=bounds(p),year=p.time?D.ar[yearIndex]:'2025',shown=visible(p);
  p.heading.textContent=p.title+(bars?' · '+shown[0].namn:'');p.heading.append(html('span','k5__datum',' ('+(Number(year)-1)+'-12-31 till '+year+'-12-31)'));
  p.scaleLabel.textContent='Andel (%) · Skala '+min+'–'+max;p.zoom.hidden=bars;p.zoom.textContent=p.full?'Visa närbild 50–100 %':'Visa 0–100 %';p.zoom.setAttribute('aria-pressed',String(p.full));
  const width=p.root.getBoundingClientRect().width;p.figure.replaceChildren(p.time?points(p,width):bars?profile(p,width):spreads(p,width));
  p.cap.textContent='Andel av startbefolkningen som bor kvar i samma bostad ett år senare. Bostadens egenskaper avser startåret.'+(p.time?' Streckat förbinder 2018 och 2020; uppgift saknas 2019. Bostadsrätt och hyresrätt avser flerbostadshus.':' Ålder vid slutåret. Välj en ålder för sorterade staplar på skala 0–100 procent.');
  if(p.id==='k5-typ-alder')p.cap.textContent+=' Småhus samt bostadsrätt och hyresrätt i flerbostadshus. Specialbostäder ingår inte i denna jämförelse.';
  if(p.rooms)p.cap.textContent+=' Endast flerbostadshus med uppgift om antal rum; småhus och specialbostäder ingår inte.';
  if(!p.time&&!bars)p.cap.textContent+=' Gul yta visar intervallet mellan lägsta och högsta värdet. Spannet jämför samma '+(p.rooms?'fem rumsklasser':'tre bostadstyper')+' inom varje ålder.';
  if(p.time){p.metrics.replaceChildren();shown.forEach(s=>{const d=html('div');d.append(html('b','',s.varden[yearIndex]===null?'—':fmt(s.varden[yearIndex])+' %'),html('span','',s.namn));p.metrics.append(d);});p.buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(p.visible.has(p.series[i].id))));p.quick.forEach((b,i)=>b.setAttribute('aria-pressed',String([0,8,12][i]===yearIndex)));p.slider.value=yearIndex;p.slider.setAttribute('aria-valuetext',year+(year==='2019'?' · Uppgift saknas':''));}
  else{p.buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===p.view)));p.sorting.hidden=!bars;p.sortSelect.value=p.sort;}
  table(p,rowsForTable(p));
 });
}
  async function graphicBlob(p){
    if(p.finish)p.finish();
    const svg=p.figure.querySelector('svg').cloneNode(true),title=p.heading.textContent,caption=(p.scaleLabel?p.scaleLabel.textContent+'. ':'')+p.cap.textContent,source=p.src.textContent,ageNames=(p.time||p.view!=='compare'?visible(p):[]).map(s=>({...s,namn:s.namn+(p.time?' · '+fmt(s.varden[yearIndex])+(s.varden[yearIndex]===null?'':' %'):''),color:seriesColor(p,s)}));
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');const box=svg.getAttribute('viewBox').split(' ').map(Number);svg.setAttribute('width',box[2]);svg.setAttribute('height',box[3]);svg.querySelectorAll('text').forEach(t=>{t.setAttribute('font-family','Arial, sans-serif');t.setAttribute('font-size',t.classList.contains('k5__spann')?28:12);t.setAttribute('fill',t.hasAttribute('data-bar-value')?'#ffffff':'#1f1f1f');});
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
    try{
      const image=new Image();await new Promise((yes,no)=>{image.onload=yes;image.onerror=no;image.src=url;});
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),W=1000,pad=38,inner=W-2*pad,graphHeight=inner*box[3]/box[2];
      function wrap(text,font){ctx.font=font;const lines=[];let line='';text.split(/\s+/).forEach(word=>{if(line&&ctx.measureText(line+' '+word).width>inner){lines.push(line);line=word;}else line+=(line?' ':'')+word;});if(line)lines.push(line);return lines;}
      const titles=wrap(title,'bold 25px Arial'),caps=wrap(caption,'15px Arial'),sources=wrap(source,'14px Arial'),H=pad*2+titles.length*32+graphHeight+ageNames.length*25+caps.length*22+sources.length*21+35;
      canvas.width=W*2;canvas.height=Math.ceil(H)*2;ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';let y=pad;
      function lines(values,font,step){ctx.fillStyle='#1f1f1f';ctx.font=font;values.forEach(v=>{ctx.fillText(v,pad,y);y+=step;});}
      lines(titles,'bold 25px Arial',32);y+=8;ctx.drawImage(image,pad,y,inner,graphHeight);y+=graphHeight+12;
      ageNames.forEach(s=>{ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pad,y+8);ctx.lineTo(pad+24,y+8);ctx.stroke();ctx.fillStyle='#1f1f1f';ctx.font='15px Arial';ctx.fillText(s.namn,pad+35,y);y+=25;});lines(caps,'15px Arial',22);y+=8;lines(sources,'14px Arial',21);
      return await new Promise((yes,no)=>canvas.toBlob(b=>b?yes(b):no(Error('PNG saknas')),'image/png'));
    }finally{URL.revokeObjectURL(url);}
  }
  async function copyGraphic(p,b){
    b.disabled=true;p.status.textContent='Skapar bild…';p.download.hidden=true;const blob=graphicBlob(p);
    try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);p.status.textContent='Kopierat. Klistra in bilden där du vill använda den.';}
    catch{try{const result=await blob;if(p.url)URL.revokeObjectURL(p.url);p.url=URL.createObjectURL(result);p.download.href=p.url;p.download.download=p.id+'-'+(p.time?D.ar[yearIndex]:'2025')+'.png';p.download.hidden=false;p.status.textContent='Kopieringen gick inte. Hämta samma bild som PNG.';}catch{p.status.textContent='Bilden kunde inte skapas. Försök igen.';}}
    finally{b.disabled=false;}
  }

panels[1].src.textContent='Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.';
panels[2].src.textContent='Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.';
panels.forEach(setup);drawCharts();
  const stages=[...document.querySelectorAll('.steg')],dots=$('punkter'),modal=$('metod');let active=0;
  stages.forEach((s,i)=>{const li=html('li');li.append(button('',()=>show(i)));li.firstChild.setAttribute('aria-label','Steg '+(i+1)+': '+s.getAttribute('aria-label'));dots.append(li);});
  function show(i,address=true){
    active=Math.max(0,Math.min(stages.length-1,i));stages.forEach((s,j)=>{s.classList.toggle('aktiv',j===active);s.inert=j!==active;s.setAttribute('aria-hidden',String(j!==active));});[...dots.querySelectorAll('button')].forEach((b,j)=>b.setAttribute('aria-current',String(j===active)));
    $('bakat').disabled=active===0;$('framat').disabled=active===stages.length-1;$('stegstatus').textContent='Kapitel 5 · '+(active+1)+' av '+stages.length;if(address)history.replaceState(null,'','#'+stages[active].id);drawCharts();window.scrollTo(0,0);
  }
  $('bakat').onclick=()=>show(active-1);$('framat').onclick=()=>show(active+1);$('oppna-metod').onclick=()=>modal.showModal();$('stang-metod').onclick=()=>modal.close();modal.addEventListener('close',()=>$('oppna-metod').focus());
  document.addEventListener('keydown',e=>{if(modal.open||e.target.closest('button,a,input,select,textarea,summary,[role="region"]'))return;if(['ArrowRight','PageDown'].includes(e.key)){show(active+1);e.preventDefault();}if(['ArrowLeft','PageUp'].includes(e.key)){show(active-1);e.preventDefault();}});
  let touch=null;document.addEventListener('touchstart',e=>{touch=!modal.open&&!e.target.closest('.k5,button,a,input,select,details')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});document.addEventListener('touchend',e=>{if(!touch||modal.open)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*2)show(active+(dx<0?1:-1));touch=null;},{passive:true});document.addEventListener('touchcancel',()=>touch=null,{passive:true});
  function fromHash(){const i=stages.findIndex(s=>'#'+s.id===location.hash);show(i<0?0:i,false);}window.addEventListener('hashchange',fromHash);window.addEventListener('resize',drawCharts);window.addEventListener('beforeprint',()=>{drawCharts();});fromHash();
})();
