(async function(){
 'use strict';
 const mount=document.getElementById('population-nets');if(!mount)return;
 try{
 const response=await fetch('data/befolkningsnetton-2000-2025.json');if(!response.ok)throw Error('Data kunde inte läsas');
 const data=await response.json();
 const keys=['births','deaths','domesticNet','immigrationNet','populationChange'];if(keys.some(k=>data[k].length!==26||data[k].some(v=>!Number.isInteger(v))))throw Error('Ofullständig årsserie');
 const rows=Array.from({length:26},(_,i)=>({year:2000+i,birthNet:data.births[i]-data.deaths[i],domesticNet:data.domesticNet[i],immigrationNet:data.immigrationNet[i],populationChange:data.populationChange[i]}));
 const series=[['birthNet','Födelsenetto','Födda minus avlidna','#3f5564'],['domesticNet','Inrikes flyttnetto','Inflyttningar minus utflyttningar inom Sverige','#008391'],['immigrationNet','Invandringsnetto','Invandringar minus utvandringar','#674b99']];
 const ns='http://www.w3.org/2000/svg',f=n=>n.toLocaleString('sv-SE'),signed=n=>(n>0?'+':'')+f(n);
 const svgEl=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs||{}))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
 const panels=mount.querySelector('.population-nets-panels'),range=mount.querySelector('input'),output=mount.querySelector('output'),detail=mount.querySelector('.population-nets-values');
 const bars=[];
 for(const [key,name,description,color]of series){
  const panel=document.createElement('section');panel.innerHTML='<h4></h4><p class="population-nets-definition"></p>';panel.querySelector('h4').textContent=name;panel.querySelector('p').textContent=description;
  const svg=svgEl('svg',{viewBox:'0 0 350 330',role:'img','aria-label':name+', Göteborg 2000 till 2025. Samma skala i alla tre diagram. Exakta värden finns i tabellen.'});
  const left=49,right=344,top=12,bottom=282,y=v=>top+(8000-v)/12000*(bottom-top),step=(right-left)/26;
  for(const tick of [-4000,0,4000,8000]){svg.append(svgEl('line',{x1:left,x2:right,y1:y(tick),y2:y(tick),stroke:tick===0?'#3f5564':'#d1d9dc','stroke-width':tick===0?1.7:1}));svg.append(svgEl('text',{x:left-7,y:y(tick)+4,'text-anchor':'end',fill:'#1f1f1f','font-size':12},f(tick)));}
  rows.forEach((row,i)=>{const val=row[key],bar=svgEl('rect',{x:left+i*step+1,y:Math.min(y(0),y(val)),width:step-2,height:Math.max(.8,Math.abs(y(val)-y(0))),fill:color});bar.append(svgEl('title',{},name+' '+row.year+': '+signed(val)));svg.append(bar);bars.push({bar,i});
   const target=svgEl('rect',{x:left+i*step,y:top,width:step,height:bottom-top,fill:'none','pointer-events':'all'});target.addEventListener('pointerenter',()=>select(i));target.addEventListener('click',()=>select(i));svg.append(target);
  });
  for(const i of [0,10,20,25])svg.append(svgEl('text',{x:left+(i+.5)*step,y:bottom+24,'text-anchor':i===25?'end':i===0?'start':'middle',fill:'#1f1f1f','font-size':12},String(2000+i)));
  panel.append(svg);panels.append(panel);
 }
 function select(i){mount.querySelector('[data-population-total-year]').textContent=rows[i].year;mount.querySelector('[data-population-total-value]').textContent=signed(rows[i].populationChange)+' personer';range.value=i;output.textContent=rows[i].year;detail.replaceChildren();for(const [key,name]of series){const div=document.createElement('div'),label=document.createElement('span'),value=document.createElement('strong');label.textContent=name;value.textContent=signed(rows[i][key]);div.append(label,value);detail.append(div);}for(const b of bars){b.bar.setAttribute('stroke',b.i===i?'#1f1f1f':'none');b.bar.setAttribute('stroke-width','1.4');}}
 range.addEventListener('input',()=>select(Number(range.value)));select(25);
 const tbody=mount.querySelector('tbody');for(const row of rows){const tr=document.createElement('tr');for(const [i,v]of [row.year,row.birthNet,row.domesticNet,row.immigrationNet,row.populationChange].entries()){const td=document.createElement(i===0?'th':'td');if(i===0)td.scope='row';td.textContent=i===0?v:signed(v);tr.append(td);}tbody.append(tr);}
 mount.querySelector('.population-nets-csv').addEventListener('click',()=>{const csv='\uFEFFÅr;Födelsenetto;Inrikes flyttnetto;Invandringsnetto;Total befolkningsförändring inklusive justeringar\r\n'+rows.map(r=>[r.year,r.birthNet,r.domesticNet,r.immigrationNet,r.populationChange].join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='goteborg-befolkningsnetton-2000-2025.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 }catch(error){mount.querySelector('.population-nets-panels').textContent='Diagrammet kunde inte laddas. '+error.message;console.error(error);}
})();
