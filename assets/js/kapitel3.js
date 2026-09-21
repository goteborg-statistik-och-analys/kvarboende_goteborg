/* Årvalet delas mellan kapitlets vyer. Saknade observationer bryter linjen. */
(function () {
  "use strict";
  const D = window.DATA_KAPITEL3;
  if (!D) return;
  const colors = window.RAPPORT_FARGER.palette;
  // Gemensamma färger för in- och utflödet. Turkos ersätter rosa för att
  // skilja regionen tydligare från den röda serien när linjerna möts.
  const flowColors = window.RAPPORT_FARGER.outcomes;
  const fmt = (n, digits=2) => n === null ? "Uppgift saknas" : n.toLocaleString("sv-SE", { minimumFractionDigits: digits, maximumFractionDigits: digits }) + " %";
  const period = i => (Number(D.ar[i]) - 1) + " → " + D.ar[i];
  let yearIndex = D.ar.length - 1;
  let active = 0;
  const stages = [...document.querySelectorAll(".steg")];
  const peak = row => row.every(v=>v===null) ? null : Math.max(...row.filter(v=>v!==null));
  const ageSeries = (id, namn, farg) => { const values=window.K3S4_SLUTVERSION.history[id] || window.K3S3_SLUTVERSION.history[id] || D.history[id]; return {id,namn,farg,varden:values.map(peak),ageValues:values}; };
  const measures = { samma_bostad:'Kvar i samma bostad', kvar_i_goteborg:'Kvar i Göteborg' };
  const groups = [
    {name:'Barn 1–5 år och vuxna 30–44 år',ages:[0,6],color:'turkos',text:'Bland 1–5-åringar var 80,0 procent kvar i samma bostad 2025 som de bodde i ett år tidigare. För 30–44-åringar var andelen 78,5 procent. Båda grupperna låg lägre 2021: 76,2 respektive 75,7 procent. Bland barn i förskoleåldern (1–5 år) och vuxna i vanliga föräldraåldrar sjönk alltså bostadskvarboendet tillfälligt under pandemiåren och återhämtades därefter.'},
    {name:'Unga vuxna',ages:[4,5],color:'lila',text:'Bland 25–29-åringar var 68,3 procent kvar i samma bostad 2025, jämfört med 66,1 procent 2013 och 64,4 procent 2021. För 19–24-åringar var motsvarande tal 71,5, 69,2 och 68,4 procent. Även bland unga vuxna sjönk bostadskvarboendet tillfälligt under pandemiåren. Åldersskillnaderna består, samtidigt som nivåerna förändras.'},
    {name:'Skolåldrar och vuxna 45–59 år',ages:[1,2,3,7],color:'morkbla',text:'Bland 6–9-åringar har kvarboendet legat lägre de senaste åren, både i bostaden och i Göteborg. Mellan 2018 och 2025 minskade andelarna från 87,4 till 85,7 respektive från 96,6 till 96,2 procent. Båda måtten steg dock 2025 jämfört med 2024. Bland 16–18-åringar var kvarboendet i Göteborg högst av alla åldersgrupper 2025: 98,1 procent.'},
    {name:'Äldre åldrar',ages:[8,9,10,11],color:'gron',text:'Bland 60–69-åringar bodde 91,7 procent kvar i samma bostad 2025, och bland 70–79-åringar 92,4 procent. Någon tydlig svacka inför pensionen framträder inte här. Bland de äldsta sjunker kvarboendet, men måttet påverkas också av dödsfall. Vi kan inte skilja ut dödlighet från utvandring i underlaget.'}
  ];
  groups.forEach(g=>g.color=window.RAPPORT_FARGER.ages[D.aldrar[g.ages[0]]]);
  // Gruppmarkeringar och diagram hämtar samma livsfasfärg.
  const phaseColors=D.aldrar.map(age=>window.RAPPORT_FARGER.ages[age]);
  const trendSeries = measure => D.aldrar_namn.map((namn,i)=>({namn,farg:window.RAPPORT_FARGER.ageLines[D.aldrar[i]],symbol:window.RAPPORT_FARGER.symbols[D.aldrar[i]],varden:window.K3S2_SLUTVERSION.history[measure].map(row=>row[i])}));
  const panels = [
    {id:'k3-profil',multi:true,compact:true,profile:true,overview:true,title:'Kvar i bostaden och i Göteborg',series:[{namn:'Kvar i samma bostad',farg:'morkbla',varden:D.ar.map(y=>y==='2025'?Math.max(...window.K3S1_SLUTVERSION.map(r=>r.home)):null),ageValues:D.ar.map(y=>y==='2025'?window.K3S1_SLUTVERSION.map(r=>r.home):[])},{namn:'Kvar i Göteborg',farg:'morkbla',varden:D.ar.map(y=>y==='2025'?Math.max(...window.K3S1_SLUTVERSION.map(r=>r.city)):null),ageValues:D.ar.map(y=>y==='2025'?window.K3S1_SLUTVERSION.map(r=>r.city):[])}],min:60,max:100,full:false},
    {id:'k3-total',multi:true,compact:true,trend:true,measure:'samma_bostad',group:0,title:'Kvar i samma bostad',series:trendSeries('samma_bostad'),min:60,max:100,full:false},
    {id:'k3-ut',multi:true,compact:true,profile:true,outcompare:true,title:'Utflyttning inom Sverige, efter ålder',series:[ageSeries('utflode_gr','Till övriga Göteborgsregionen',flowColors.gr),ageSeries('utflode_sverige','Till övriga Sverige',flowColors.sverige)],min:0,max:8},
    {id:'k3-in',multi:true,compact:true,profile:true,incompare:true,title:'Nytillkomna göteborgare, efter ålder',series:[ageSeries('inflode_gr','Från övriga Göteborgsregionen',flowColors.gr_in),ageSeries('inflode_sverige','Från övriga Sverige',flowColors.sverige_in),ageSeries('inflode_invandrad','Invandrade, tidigare ej folkbokförda eller okänt',flowColors.invandrade)],min:0,max:12,end:true},
    {id:'k3-netto',multi:true,compact:true,profile:true,net:true,title:'Inrikes in minus ut, efter ålder',series:[{id:'netto_inrikes',namn:'Inrikes netto, alla åldrar',farg:'morkbla',varden:window.K3S5_SLUTVERSION.total,ageValues:window.K3S5_SLUTVERSION.history}],min:-5000,max:5000}
  ];
  const valueText = (p,n) => p.net ? (n===null?'Kan inte redovisas':(n>0?'+':'')+n.toLocaleString('sv-SE')) : fmt(n,p.trend||p.overview||p.outcompare||p.incompare?1:2);
  const indexFor = p => p.overview ? D.ar.indexOf('2025') : yearIndex;
  function overviewRows(p) {
    const idx=indexFor(p),home=p.overview?window.K3S1_SLUTVERSION.map(r=>r.home):window.K3S3_SLUTVERSION.history.utflode_gr[idx],city=p.overview?window.K3S1_SLUTVERSION.map(r=>r.city):window.K3S3_SLUTVERSION.history.utflode_sverige[idx];
    const rows=D.aldrar_namn.map((age,i)=>({age,i,home:home[i],city:city[i],diff:city[i]-home[i],total:city[i]+home[i]}));
    return rows.sort((a,b)=>!p.sort || p.sort==='age' ? a.i-b.i : (p.sort==='diffAsc'?a.diff-b.diff:b[p.sort]-a[p.sort]) || a.i-b.i);
  }
  function overviewChart(p,width) {
    const bars=p.view && p.view!=='compare', [min,max]=chartScale(p), columns=width>=480;
    const left=70,right=width-(columns?(bars?65:(p.overview?232:193)):16),top=58,rowH=29,height=top+12*rowH+10;
    const x=v=>left+(v-min)/(max-min)*(right-left);
    const svg=node('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':p.title+', '+D.ar[indexFor(p)]+'. '+(bars?'Liggande staplar.':p.outcompare?'Öppen ring: övriga Göteborgsregionen. Fylld punkt: övriga Sverige. Diff: Sverige minus regionen.':'Öppen ring: samma bostad. Fylld punkt: Göteborg. Skillnaden är övriga kvar i Göteborg, inklusive ej bedömbar bostadsidentitet.')+' Exakta värden finns i tabellen.'});
    const rows=overviewRows(p), decimal=v=>v.toFixed(1).replace('.',','), difference=v=>(p.outcompare && v>0?'+':'')+decimal(v);
    rows.forEach((row,pos)=>{
      const cy=top+pos*rowH+rowH/2;
      if(pos%2===0)svg.append(node('rect',{x:0,y:cy-rowH/2,width,height:rowH,fill:'#f4f6f7'}));
      if(!p.outcompare)svg.append(node('rect',{x:0,y:cy-8,width:3,height:16,fill:colors[phaseColors[row.i]]}));
    });
    const tickCount=right-left<280?2:4;
    for(let i=0;i<=tickCount;i++){
      const v=min+(max-min)*i/tickCount;
      svg.append(node('line',{x1:x(v),x2:x(v),y1:top-9,y2:height-10,stroke:'#d1d9dc','stroke-width':1}));
      svg.append(node('text',{x:x(v),y:top-19,'text-anchor':'middle'},v.toFixed(1).replace('.',',')));
    }
    const colX=p.overview?[width-171,width-104,width-7]:[width-132,width-65,width-7];
    if(columns) (bars?['Andel']:(p.outcompare?['Övr. GR','Övr. Sv.','Diff¹']:['Bostad','Göteborg','Övriga kvar|i Göteborg|procentenheter'])).forEach((label,i)=>{const text=node('text',{x:bars?width-7:colX[i],y:label.includes('|')?top-43:top-19,'text-anchor':'end'});label.split('|').forEach((line,j)=>text.append(node('tspan',{x:bars?width-7:colX[i],dy:j?12:0},line)));svg.append(text);});
    if(columns&&!bars)[false,true].forEach((filled,i)=>svg.append(node('circle',{cx:colX[i]-22,cy:12,r:4,fill:filled?(p.outcompare?colors[p.series[i].farg]:'#3f5564'):'#ffffff',stroke:p.outcompare?colors[p.series[i].farg]:'#3f5564','stroke-width':2})));
    rows.forEach((row,pos)=>{
      const cy=top+pos*rowH+rowH/2,color=p.outcompare?(p.view==='total'?colors.morkbla:colors[p.series[p.view==='city'?1:0].farg]):colors[phaseColors[row.i]];
      svg.append(node('text',{x:58,y:cy+4,'text-anchor':'end'},row.age.replace(' år','')));
      if(bars){
        const v=row[p.view],bar=node('rect',{x:x(0),y:cy-7,width:x(v)-x(0),height:14,fill:color});
        bar.append(node('title',{},row.age+': '+fmt(v,1)));svg.append(bar);
        if(columns)svg.append(node('text',{x:width-7,y:cy+4,'text-anchor':'end'},decimal(v)+' %'));
      } else {
        svg.append(node('line',{x1:x(row.home),x2:x(row.city),y1:cy,y2:cy,stroke:p.outcompare?'#b9c2c8':color,'stroke-width':2}));
        for(const [value,filled] of [[row.home,false],[row.city,true]]){
          const pointColor=p.outcompare?colors[p.series[filled?1:0].farg]:color;
          const circle=node('circle',{cx:x(value),cy,r:5,fill:filled?pointColor:'#ffffff',stroke:pointColor,'stroke-width':2});
          circle.append(node('title',{},row.age+' · '+(p.outcompare?p.series[filled?1:0].namn+': ':(filled?'Kvar i Göteborg: ':'Kvar i samma bostad: '))+fmt(value,1)+' · Skillnad: '+difference(row.diff)+' procentenheter'));svg.append(circle);
        }
        if(columns)[decimal(row.home)+' %',decimal(row.city)+' %',difference(row.diff)].forEach((value,i)=>svg.append(node('text',{x:colX[i],y:cy+4,'text-anchor':'end'},value)));
      }
    });
    return svg;
  }
  const inViews=[['compare','Jämför alla'],['gr','Från övriga GR'],['sweden','Från övriga Sverige'],['abroad','Invandrade/tidigare ej folkbokförda/okänt¹'],['total','Totalt inflyttade']];
  const inSorts=[['age','Ålder'],['total','Total inflyttning ↓'],['gr','Från övriga GR ↓'],['sweden','Från övriga Sverige ↓'],['abroad','Tidigare ej i Sverige ↓']];
  function incomingRows(p) {
    const idx=indexFor(p);
    return D.aldrar_namn.map((age,i)=>{
      const [gr,sweden,abroad]=p.series.map(s=>s.ageValues[idx][i]);
      const states=window.K3S4_SLUTVERSION.status[idx][i];
      return {age,i,gr,sweden,abroad,total:[gr,sweden,abroad].some(v=>v===null)?null:gr+sweden+abroad,states:[...states,states.includes('undertryckt')?'undertryckt':states.includes('saknas')?'saknas':'redovisad']};
    }).sort((a,b)=>!p.sort || p.sort==='age'?a.i-b.i:a[p.sort]===null?(b[p.sort]===null?a.i-b.i:1):b[p.sort]===null?-1:b[p.sort]-a[p.sort] || a.i-b.i);
  }
  const incomingValue=(row,k)=>row[['gr','sweden','abroad','total'][k]]===null?(row.states[k]==='undertryckt'?(k>=2?'Kan inte redovisas – innehåller skyddad delpost':'Sekretesskyddat'):'Uppgift saknas'):row[['gr','sweden','abroad','total'][k]].toFixed(1).replace('.',',')+' %';
  function incomingChart(p,width) {
    const bars=p.view && p.view!=='compare',columns=width>=560,top=58,rowH=29,height=top+12*rowH+10;
    const left=70,right=width-(columns?(bars?110:254):16),rows=incomingRows(p),max=chartScale(p)[1],x=v=>left+v/max*(right-left);
    const svg=node('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':p.title+', '+D.ar[indexFor(p)]+'. Åldersgrupper och tre ursprung. Exakta värden och total finns i tabellen.'});
    const keys=['gr','sweden','abroad'];
    rows.forEach((row,i)=>{if(i%2===0)svg.append(node('rect',{x:0,y:top+i*rowH,width,height:rowH,fill:'#f4f6f7'}));});
    const steps=right-left<280?2:4;
    for(let t=0;t<=steps;t++){const v=max*t/steps;svg.append(node('line',{x1:x(v),x2:x(v),y1:top-9,y2:height-10,stroke:'#d1d9dc'}));svg.append(node('text',{x:x(v),y:top-19,'text-anchor':'middle'},v.toFixed(1).replace('.',',')));}
    const cols=[width-195,width-133,width-69,width-7];
    if(columns)(bars?['Andel']:['Övr. GR','Övr. Sv.','Ej i Sv.¹','Totalt']).forEach((label,i)=>svg.append(node('text',{x:bars?width-7:cols[i],y:top-19,'text-anchor':'end'},label)));
    if(columns&&!bars){

      p.series.forEach((s,i)=>{const cx=cols[i]-22,cy=12,color=colors[s.farg];svg.append(i===2?node('path',{d:'M'+cx+' '+(cy-5)+' L'+(cx+5)+' '+cy+' L'+cx+' '+(cy+5)+' L'+(cx-5)+' '+cy+' Z',fill:color}):node('circle',{cx,cy,r:4,fill:i?color:'#ffffff',stroke:color,'stroke-width':2}));});
    }
    rows.forEach((row,i)=>{
      const cy=top+i*rowH+rowH/2;
      svg.append(node('text',{x:58,y:cy+4,'text-anchor':'end'},row.age.replace(' år','')));
      if(bars){const value=row[p.view],k=[...keys,'total'].indexOf(p.view),s=p.view==='total'?{namn:'Totalt inflyttade',farg:'morkbla'}:p.series[k];if(value!==null){const bar=node('rect',{x:x(0),y:cy-7,width:x(value)-x(0),height:14,fill:colors[s.farg]});bar.append(node('title',{},row.age+' · '+s.namn+': '+fmt(value,1)));svg.append(bar);}if(columns){const label=node('text',{x:width-7,y:cy+4,'text-anchor':'end'},value===null?'—':incomingValue(row,k));if(value===null)label.append(node('title',{},incomingValue(row,k)));svg.append(label);}}
      else {
        const values=keys.map(k=>row[k]).filter(v=>v!==null);if(values.length>1)svg.append(node('line',{x1:x(Math.min(...values)),x2:x(Math.max(...values)),y1:cy,y2:cy,stroke:'#b9c2c8','stroke-width':2}));
        keys.forEach((key,k)=>{
          if(row[key]===null)return;
          const s=p.series[k],cx=x(row[key]),color=colors[s.farg];
          const mark=k===2?node('path',{d:'M'+cx+' '+(cy-5)+' L'+(cx+5)+' '+cy+' L'+cx+' '+(cy+5)+' L'+(cx-5)+' '+cy+' Z',fill:color,stroke:color}):node('circle',{cx,cy,r:5,fill:k===0?'#ffffff':color,stroke:color,'stroke-width':2});
          mark.append(node('title',{},row.age+' · '+s.namn+': '+fmt(row[key],1)));svg.append(mark);
        });
        if(columns)[row.gr,row.sweden,row.abroad,row.total].forEach((v,k)=>{const t=node('text',{x:cols[k],y:cy+4,'text-anchor':'end','font-weight':k===3?700:400},v===null?'—':incomingValue(row,k));if(v===null)t.append(node('title',{},incomingValue(row,k)));svg.append(t);});
      }
    });
    return svg;
  }
  function buildIncoming(p) {
    p.metrics.hidden=true;p.legend.remove();
    const key=document.createElement('div');key.className='k3__mattnyckel';key.setAttribute('role','group');key.setAttribute('aria-label','Välj inflyttningsvy');
    p.viewButtons=inViews.map(([id,label],i)=>{
      const b=document.createElement('button');b.type='button';b.dataset.view=id;
      if(i && id!=='total'){const mark=document.createElement('i');mark.className=i===1?'k3__ring':i===2?'k3__punkt':'k3__diamant';mark.setAttribute('aria-hidden','true');mark.style.borderColor=colors[p.series[i-1].farg];if(i>1)mark.style.backgroundColor=colors[p.series[i-1].farg];b.append(mark);}
      b.append(document.createTextNode(label));b.addEventListener('click',()=>{p.view=id;p.sort=id==='compare'?'age':id;draw(p);});key.append(b);return b;
    });p.root.querySelector('.k2__huvud').after(key);
    const label=document.createElement('label');label.className='k3__sortering';label.textContent='Sortera: ';
    p.sortSelect=document.createElement('select');p.sortSelect.setAttribute('aria-label','Sortera inflyttning efter ålder eller andel');
    inSorts.forEach(([id,name])=>{const o=document.createElement('option');o.value=id;o.textContent=name;p.sortSelect.append(o);});
    p.sortSelect.addEventListener('change',()=>{p.sort=p.sortSelect.value;draw(p);});label.append(p.sortSelect);p.root.querySelector('.k2__skalrad').append(label);
    const guide=document.createElement('p');guide.className='k3__kontrollhjalp';
    guide.textContent='Totalt inflyttade summerar de tre ursprungen, exklusive nollåringar. Streck betyder att uppgiften saknas eller inte kan redovisas. En skyddad delpost kan göra att även en stor sammanslagen kategori eller total inte kan visas. Det betyder inte att hela gruppen är liten.';
    p.root.querySelector('.k2__skalrad').after(guide);
  }
  function ageChart(p, width) {
    if(p.incompare)return incomingChart(p,width);
    if(p.overview || p.outcompare)return overviewChart(p,width);
    const shown=visibleSeries(p), height=340, left=p.net?112:68, right=width-(p.net?54:p.overview?54:20), top=28, bottom=height-28;
    const x=v=>left+(v-p.min)/(p.max-p.min)*(right-left), y=i=>top+12+i*(bottom-top-20)/11;
    const svg=node('svg',{viewBox:'0 0 '+width+' '+height,role:'img','aria-label':p.title+', '+D.ar[yearIndex]+'. Exakta värden för alla åldrar finns i tabellen.'});
    const ticks=p.net?[-5000,-2500,0,2500,5000]:[0,p.max/4,p.max/2,p.max*3/4,p.max];
    ticks.forEach(v=>{svg.append(node('line',{x1:x(v),x2:x(v),y1:top-3,y2:bottom,stroke:v===0?'#3f5564':'#d1d9dc'}));svg.append(node('text',{x:x(v),y:height-5,'text-anchor':'middle'},p.net?v.toLocaleString('sv-SE'):v.toFixed(1).replace('.',',')));});
    D.aldrar_namn.forEach((age,i)=>{
      const cy=y(i);
      svg.append(node('text',{x:58,y:cy+4,'text-anchor':'end'},age.replace(' år','')));
      if(!p.net) svg.append(node('line',{x1:left,x2:right,y1:cy,y2:cy,stroke:'#e8ecee'}));
      shown.forEach((s,si)=>{
        const v=s.ageValues[yearIndex][i];
        if(v===null){if(p.net)svg.append(node('text',{x:x(0)+5,y:cy+4},'—'));return;}
        const cx=x(v);
        let mark;
        if(p.net){ mark=node('rect',{x:Math.min(x(0),cx),y:cy-7,width:Math.abs(cx-x(0)),height:14,fill:colors[phaseColors[i]]});svg.append(node('text',{x:cx+(v>=0?5:-5),y:cy+4,'text-anchor':v>=0?'start':'end'},valueText(p,v))); }
        else { const offset=(si-(shown.length-1)/2)*5; mark=node('circle',{cx,cy:cy+offset,r:4,fill:colors[p.overview?phaseColors[i]:s.farg],stroke:'#ffffff','stroke-width':1}); }
        if(p.overview) svg.append(node('text',{x:right+9,y:cy+4,'text-anchor':'start'},v.toFixed(1).replace('.',',')+' %'));
        mark.append(node('title',{},age+' · '+s.namn+': '+valueText(p,v)));svg.append(mark);
      });
    });
    if(p.overview && shown[0].varden[yearIndex]===null) svg.append(node('text',{x:(left+right)/2,y:18,'text-anchor':'middle'},'Bostadsuppgift saknas 2019'));
    return svg;
  }
  function ageSymbol(series,cx,cy,r,selected=false) {
    const attrs={fill:colors[series.farg],stroke:selected?'#1f1f1f':colors[series.farg],'stroke-width':selected?1.2:.7};
    let mark;
    if(series.symbol===1)mark=node('rect',{...attrs,x:cx-r,y:cy-r,width:r*2,height:r*2});
    else if(series.symbol===2)mark=node('path',{...attrs,d:'M'+cx+' '+(cy-r*1.3)+' L'+(cx+r*1.3)+' '+cy+' L'+cx+' '+(cy+r*1.3)+' L'+(cx-r*1.3)+' '+cy+' Z'});
    else if(series.symbol===3)mark=node('path',{...attrs,d:'M'+cx+' '+(cy-r*1.4)+' L'+(cx+r*1.3)+' '+(cy+r)+' L'+(cx-r*1.3)+' '+(cy+r)+' Z'});
    else mark=node('circle',{...attrs,cx,cy,r});
    return mark;
  }
  function node(tag, attrs, text) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function visibleSeries(p) { return p.multi ? p.series.filter((s, i) => p.visible.has(i)) : [p.series[p.selected]]; }
  function flowSummary(p,i) { return ''; }
  const patterns = ["", "9 5", "2 4", "10 4 2 4"];
  function chartScale(p) {
    if(p.incompare && p.view==='total') return [0,Math.max(12,Math.ceil(Math.max(...incomingRows(p).map(r=>r.total??0))/4)*4)];
    if(p.outcompare && p.view==='total') return [0,Math.max(8,Math.ceil(Math.max(...overviewRows(p).map(r=>r.total))/2)*2)];
    if(p.overview && p.view && p.view!=='compare') return [0,100];
    if (p.id === "k3-bostad") {
      if (p.visible.size > 1 || p.full) return [0, 100];
      return p.visible.has(1) ? [8, 18] : [75, 85];
    }
    return p.full ? [0, 100] : [p.min, p.max];
  }
  function gapBridges(values, x, y) {
    const bridges = [];
    let last = -1;
    values.forEach((v, i) => {
      if (v === null) return;
      if (last >= 0 && i > last + 1) bridges.push("M" + x(last) + " " + y(values[last]) + " L" + x(i) + " " + y(v));
      last = i;
    });
    return bridges;
  }
  function draw(p) {
    const yearIndex=indexFor(p);
    if(p.overview || p.outcompare){
      p.title=p.outcompare?(p.view==='total'?'Till andra kommuner totalt':p.view==='home'?'Till övriga Göteborgsregionen':p.view==='city'?'Till övriga Sverige':'Utflyttning inom Sverige, efter ålder'):p.view==='home'?'Kvar i samma bostad, efter ålder':p.view==='city'?'Kvar i Göteborg, efter ålder':'Kvar i bostaden och i Göteborg';
      if(p.scaleButton)p.scaleButton.hidden=!!p.view && p.view!=='compare';
      p.viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===(p.view||'compare'))));
      p.sortSelect.value=p.sort||'age';
    }
    if(p.incompare){
      p.title=p.view==='total'?'Totalt inflyttade, efter ålder':p.view && p.view!=='compare'?p.series[['gr','sweden','abroad'].indexOf(p.view)].namn:'Nytillkomna göteborgare, efter ålder';
      p.viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===(p.view||'compare'))));p.sortSelect.value=p.sort||'age';
    }
    if(p.net) {
      p.netAgeLabel.hidden=p.profile;
      const a=p.netAge.value;p.series[0].varden=p.profile||a==='total'?window.K3S5_SLUTVERSION.total:window.K3S5_SLUTVERSION.history.map(row=>row[Number(a)]);p.series[0].namn=p.profile||a==='total'?'Inrikes netto, alla åldrar':'Inrikes netto, '+D.aldrar_namn[Number(a)];
      p.title=p.profile?'Inrikes netto, efter ålder':'Inrikes netto över tid';
      p.netButtons.forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='age')===p.profile)));
    }
    const shown = visibleSeries(p), s = shown[0];
    const width = Math.max(p.profile ? 560 : 500, Math.round(p.chart.getBoundingClientRect().width || 560));
    const height = p.multi ? 260 : (p.id === "k3-total" ? 235 : 210);
    const left = 54, right = width - (p.net ? 155 : 94), top = 22, bottom = height - 32;
    const [min, max] = chartScale(p);
    const x = i => left + i / (D.ar.length - 1) * (right - left);
    const y = v => bottom - (v - min) / (max - min) * (bottom - top);
    const svg = node("svg", { viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": (p.multi ? p.title : s.namn) + ", 2013–2025. Linjernas namn och värden finns nedanför." });
    const tickCount = max === 3 ? 6 : 4;
    for (let i = 0; i <= tickCount; i++) {
      const value = min + (max - min) * i / tickCount;
      svg.append(node("line", { x1: left, x2: right, y1: y(value), y2: y(value), stroke: p.net && value===0 ? colors.morkbla : "#d1d9dc", "stroke-width": p.net && value===0 ? 1.5 : 1 }));
      svg.append(node("text", { x: left - 8, y: y(value) + 4, "text-anchor": "end" }, value.toLocaleString("sv-SE", { minimumFractionDigits: p.net ? 0 : 1, maximumFractionDigits: p.net ? 0 : 1 })));
    }
    [0, 4, 8, 12].forEach(i => svg.append(node("text", { x: x(i), y: height - 8, "text-anchor": "middle" }, D.ar[i])));
    const gap = s.varden.indexOf(null);
    if (gap >= 0 && !p.net) {
      if (!p.compact) svg.append(node("line", { x1: x(gap), x2: x(gap), y1: top + 18, y2: bottom, stroke: "#3f5564", "stroke-dasharray": "2 5" }));
      svg.append(node("text", { x: x(gap), y: top - 5, "text-anchor": "middle" }, "2019 saknas"));
    }
    if(p.net&&!p.profile){D.aldrar_namn.forEach((age,a)=>{let d='',connected=false;window.K3S5_SLUTVERSION.history.forEach((row,i)=>{const v=row[a];if(v===null){connected=false;return;}d+=(connected?' L':' M')+x(i)+' '+y(v);connected=true;});const line=node('path',{d,fill:'none',stroke:'#d1d9dc','stroke-width':0.8,'data-net-background':a});line.append(node('title',{},age));svg.append(line);});}
    shown.forEach(series => {
      const index = p.series.indexOf(series);
      let path = "", connected = false;
      series.varden.forEach((v, i) => {
        if (v === null) { connected = false; return; }
        path += (connected ? " L" : " M") + x(i) + " " + y(v);
        connected = true;
      });
      svg.append(node("path", { d: path, fill: "none", stroke: colors[series.farg], "stroke-width": 2.7, "stroke-dasharray": p.multi && !p.compact ? patterns[index] : "", "stroke-linejoin": "round" }));
      if (p.compact && !p.net) gapBridges(series.varden, x, y).forEach(d => {
        svg.append(node("path", { d, fill: "none", stroke: colors[series.farg], "stroke-width": 2.7, "stroke-dasharray": "5 5", "aria-label": "Förbindelse mellan 2018 och 2020. Uppgift för 2019 saknas." }));
      });
      series.varden.forEach((v, i) => {
        if (v !== null) svg.append(p.trend ? ageSymbol(series,x(i),y(v),3) : node("circle", { cx: x(i), cy: y(v), r: 2.4, fill: colors[series.farg] }));
      });
      if (series.varden[yearIndex] !== null) svg.append(p.trend ? ageSymbol(series,x(yearIndex),y(series.varden[yearIndex]),5,true) : node("circle", { cx: x(yearIndex), cy: y(series.varden[yearIndex]), r: 5, fill: colors[series.farg], stroke: "#1f1f1f", "stroke-width": 1.3 }));
    });
    svg.append(node("line", { x1: x(yearIndex), x2: x(yearIndex), y1: top, y2: bottom, stroke: "#1f1f1f", "stroke-dasharray": "4 4" }));
    if(!p.profile)window.RAPPORT_ETIKETTER(svg,shown.filter(s=>s.varden[s.varden.length-1]!==null).map(s=>({name:s.namn,y:y(s.varden[s.varden.length-1]),color:colors[s.farg]})),{right,top,bottom,width});
    p.chart.replaceChildren(p.profile ? ageChart(p,width) : svg);
    p.scale.textContent = p.net ? "Antal personer · Samma skala för alla år" : "Andel (%) · Skala " + min + "–" + max;
    p.value.hidden = !!p.multi;
    if (!p.multi) {
      p.value.textContent = fmt(s.varden[yearIndex]);
      p.value.classList.toggle("k2__varde--saknas", s.varden[yearIndex] === null);
    }
    p.period.textContent = period(yearIndex);
    p.slider.value = yearIndex;
    if (p.yearLabel) p.yearLabel.textContent = "Årsskifte " + D.ar[yearIndex];
    p.slider.setAttribute("aria-valuetext", period(yearIndex) + ": " + shown.map(v => v.namn + " " + valueText(p,v.varden[yearIndex])).join("; "));
    p.caption.textContent = (p.net ? 'Antal inflyttade minus utflyttade inom Sverige. ' : 'Andel (%) av åldersgruppens '+(p.end?'slutbefolkning':'startbefolkning')+'. ')+'Ålder vid slutåret. Jämförelse 31 december '+(Number(D.ar[yearIndex])-1)+' till 31 december '+D.ar[yearIndex]+'.';
    if(p.net && !p.profile) p.caption.textContent=s.namn+'. Tunna grå linjer visar åldersgrupperna. Luckor betyder att ett underliggande tal är skyddat; de fylls inte i. Totalt beräknas separat för hela befolkningen. Varje år jämförs folkbokföringen vid två på varandra följande årsskiften. Plus: fler kom från andra svenska kommuner än lämnade för dem. Minus: fler lämnade än kom.';
    if(p.overview) p.caption.textContent+=(p.view && p.view!=='compare' ? ' Staplarna visar '+(p.view==='home'?'kvar i samma bostad':'kvar i Göteborg')+'.' : ' Öppen ring: samma bostad. Fylld punkt: kvar i Göteborg. Övriga kvar i Göteborg = skillnaden mellan måtten, i procentenheter. Här ingår annan bostad och bostadsbyte som inte kan avgöras.')+' Sortering: '+({age:'ålder, stigande',home:'bostad, högst först',city:'Göteborg, högst först',diff:'övriga kvar i Göteborg, högst först'}[p.sort||'age'])+'.';
    if(p.outcompare)p.caption.textContent+=' Övr. GR = övriga Göteborgsregionen. Övr. Sv. = kommuner utanför Göteborgsregionen. ¹ Diff = övriga Sverige minus övriga Göteborgsregionen, i procentenheter. Plus betyder större andel till övriga Sverige; minus större andel till regionen. Sortering: '+({age:'ålder',home:'andel till regionen, högst först',city:'andel till övriga Sverige, högst först',total:'total inrikes utflyttning, högst först',diff:'övervikt övriga Sverige',diffAsc:'övervikt regionen'}[p.sort||'age'])+'.';
    if(p.incompare)p.caption.textContent+=' Övr. GR = övriga Göteborgsregionen. Övr. Sv. = kommuner utanför Göteborgsregionen. ¹ Invandrade, tidigare ej folkbokförda eller okänt. Totalt är summan av de tre komponenterna, exklusive nollåringar. Sortering: '+inSorts.find(s=>s[0]===(p.sort||'age'))[1].replace(' ↓',', högst först')+'.';
    if(p.measure==='samma_bostad') p.caption.textContent+=' Bostadsuppgift saknas 2019. Streckat förbinder 2018 och 2020 i tidsserien, utan ett beräknat värde för 2019.';
    if(p.overview && (!p.view || p.view==='compare')) {
      const legend='Öppen ring: samma bostad. Fylld punkt: kvar i Göteborg.';
      const parts=p.caption.textContent.split(legend);
      if(parts.length===2){const strong=document.createElement('strong');strong.textContent=legend;p.caption.replaceChildren(parts[0],strong,parts[1]);}
    }
    p.heading.textContent = p.multi ? p.title : s.namn;
    if (p.id === "k3-total" || p.compact) {
      const dates = document.createElement("span");
      dates.className = "k2__rubrikdatum";
      dates.textContent = " (" + (Number(D.ar[yearIndex]) - 1) + "-12-31 till " + D.ar[yearIndex] + "-12-31)";
      p.heading.append(dates);
      p.period.hidden = true;
    }
    if (p.compact) {
      p.metrics.replaceChildren();
      shown.forEach(series => {
        const item = document.createElement("div");
        const value = document.createElement("b");
        value.textContent = valueText(p,series.varden[yearIndex]);
        value.classList.toggle("k2__varde--saknas", series.varden[yearIndex] === null);
        const label = document.createElement("span"); label.textContent = metricLabel(p,series);
        item.append(value, label); p.metrics.append(item);
      });
      if (p.id === "k3-bostad") {
        p.scaleButton.disabled = p.visible.size > 1;
        p.scaleButton.textContent = p.visible.size > 1 ? "Båda linjerna: 0–100 %" : (p.full ? "Visa närbild" : "Visa 0–100 %");
        p.scaleButton.setAttribute("aria-pressed", String(p.full));
      }
    }
    if (p.multi) p.toggles.forEach((button, i) => {
      button.hidden=!!p.trend && !groups[p.group].ages.includes(i);
      const on = p.visible.has(i);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-disabled", String(on && p.visible.size === 1));
      button.querySelector("b").textContent = on ? fmt(p.series[i].varden[yearIndex]) : "Dold";
    });
    p.root.querySelectorAll("[data-year]").forEach(b => b.setAttribute("aria-pressed", String(Number(b.dataset.year) === yearIndex)));
    if (p.summary) p.summary.textContent = flowSummary(p, yearIndex);
    renderTable(p);
  }
  function metricLabel(p,s) {
    return p.profile && !p.net && s.varden[yearIndex]!==null ? s.namn+' · högst bland '+D.aldrar_namn[s.ageValues[yearIndex].indexOf(s.varden[yearIndex])] : s.namn;
  }
  function setPerspective(p) {
    p.title=measures[p.measure]+(p.overview?', efter ålder':' · '+groups[p.group].name);
    p.series=p.overview?[ageSeries(p.measure,measures[p.measure],'morkbla')]:trendSeries(p.measure);
    if(p.trend) {
      const group=groups[p.group];
      p.visible=new Set(group.ages);
      p.toggles.forEach((b,i)=>b.querySelector('line').setAttribute('stroke',colors[p.series[i].farg]));
      document.getElementById('k3-gruppanalys').textContent=window.K3S2_SLUTVERSION.texts[p.group];
      p.groupButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===p.group)));
    }
    p.measureButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.measure===p.measure)));
    draw(p);
  }
  function buildPerspectives(p) {
    const wrap=document.createElement('div');wrap.className='k3__perspektiv';
    if(p.trend) {
      const groupRow=document.createElement('div');groupRow.className='k3__gruppval';groupRow.setAttribute('role','group');groupRow.setAttribute('aria-label','Välj åldersjämförelse');
      p.groupButtons=groups.map((g,i)=>{const b=document.createElement('button');b.type='button';b.textContent=g.name;b.style.borderLeftColor=colors[g.color];b.addEventListener('click',()=>{p.group=i;setPerspective(p);});groupRow.append(b);return b;});const groupLabel=document.createElement('span');groupLabel.className='k3__valrubrik';groupLabel.id=p.id+'-grupprubrik';groupLabel.textContent='Välj åldersgrupper';groupRow.setAttribute('aria-labelledby',groupLabel.id);wrap.append(groupLabel,groupRow);
    }
    const measureRow=document.createElement('div');measureRow.className='k3__mattval';measureRow.setAttribute('role','group');measureRow.setAttribute('aria-label','Välj kvarboendemått');
    p.measureButtons=Object.entries(measures).map(([id,name])=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.dataset.measure=id;b.addEventListener('click',()=>{p.measure=id;setPerspective(p);});measureRow.append(b);return b;});if(p.trend){
      const measureLabel=document.createElement('span');measureLabel.className='k3__valrubrik';measureLabel.id=p.id+'-mattrubrik';measureLabel.textContent='Visa kvarboende i …';measureRow.setAttribute('aria-labelledby',measureLabel.id);wrap.append(measureLabel);
    }
    wrap.append(measureRow);
    if(p.trend){
      const guide=document.createElement('p');guide.className='k3__kontrollhjalp';guide.textContent='Välj en åldersjämförelse. Se om utvecklingen följs åt och vad som ändras när vi går från bostaden till kommunen.';wrap.append(guide);
    }
    p.root.prepend(wrap);
    if(p.overview) {
      const key=document.createElement('p');key.className='k3__fasnyckel';
      groups.forEach(g=>{const item=document.createElement('span'),sample=document.createElement('i');sample.style.backgroundColor=colors[g.color];sample.setAttribute('aria-hidden','true');item.append(sample,document.createTextNode(g.name));key.append(item);});p.chart.after(key);
    }
  }
  function chooseYear(i) {
    yearIndex = Math.max(0, Math.min(D.ar.length - 1, Number(i)));
    panels.forEach(draw);
  }
  function build(p) {
    p.selected = 0;
    p.visible = new Set(p.series.map((s,i) => i));
    if (p.trend) p.visible = new Set(groups[p.group].ages);
    p.root = document.getElementById(p.id);
    p.root.innerHTML = '<div class="k2__val"></div>'
      + '<div class="k2__huvud"><h3></h3><b class="k2__varde"></b><span class="k2__period"></span></div>'
      + '<div class="k2__skalrad"><span></span></div><div class="k2__diagram"></div><div class="k2__serier" role="group" aria-label="Visa eller dölj linjer"></div>'
      + '<div class="k2__arval"><label for="' + p.id + '-ar">Utforska årsskiftet</label><div class="k2__snabbval"></div>'
      + '<input id="' + p.id + '-ar" type="range" min="0" max="12" step="1" value="12"></div>'
      + '<p class="k2__namnare"></p><p class="k2__kalla">Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.</p>'
      + '<div class="k2__export"><button type="button" class="k2__kopiera">Kopiera diagram</button><a class="k2__hamta" hidden>Hämta PNG</a><span class="k2__status" role="status"></span></div><details class="k2__data"><summary>Visa alla värden</summary><div class="k2__tabell" role="region" aria-label="Datatabell, kan rullas i sidled" tabindex="0"></div></details>';
    p.chart = p.root.querySelector(".k2__diagram");
    p.value = p.root.querySelector(".k2__varde");
    p.period = p.root.querySelector(".k2__period");
    p.heading = p.root.querySelector("h3");
    p.scale = p.root.querySelector(".k2__skalrad span");
    p.caption = p.root.querySelector(".k2__namnare");
    p.slider = p.root.querySelector("input");
    p.slider.addEventListener("input", e => chooseYear(e.target.value));
    if (p.trend || p.outcompare || p.incompare || p.net) {
      p.yearLabel = document.createElement("output");
      p.yearLabel.className = "k2__valt-ar";
      p.yearLabel.setAttribute("for", p.slider.id);
      p.root.querySelector(".k2__snabbval").replaceWith(p.yearLabel);
      const yearHelp=document.createElement('p');yearHelp.className='k3__kontrollhjalp';yearHelp.id=p.id+'-arhjalp';yearHelp.textContent='Årvalet ändrar diagrammets värden, inte analystexten.';
      p.root.querySelector('.k2__arval').after(yearHelp);
      p.slider.setAttribute('aria-describedby',yearHelp.id);
    }
    p.legend = p.root.querySelector(".k2__serier");
    p.status = p.root.querySelector(".k2__status");
    p.download = p.root.querySelector(".k2__hamta");
    p.copyButton = p.root.querySelector(".k2__kopiera");
    p.copyButton.addEventListener("click", () => copyChart(p));
    if (p.compact) {
      p.metrics = document.createElement("div"); p.metrics.className = "k2__bostadsvarden";
      p.root.querySelector(".k2__huvud").after(p.metrics);
      if (false) {
        p.summary = document.createElement("p");
        p.summary.className = "k2__summa";
        p.summary.title = "Summor för alla kategorier, även om någon linje är dold. Beräknade från avrundade kategoriandelar.";
        p.metrics.after(p.summary);
      }
      if (p.id === "k3-bostad") {
        const note = document.createElement("p"); note.className = "k2__lucka";
        note.textContent = "Streckat förbinder 2018 och 2020. Uppgift för 2019 saknas.";
        p.chart.after(note);
      }
    }
    const choices = p.root.querySelector(".k2__val");
    if (p.multi) {
      choices.remove();
      p.toggles = p.series.map((s, i) => {
        const button = document.createElement("button");
        button.type = "button"; button.className = "k2__serie";
        const sample = node("svg", { viewBox: "0 0 34 12", "aria-hidden": "true" });
        sample.append(node("line", { x1: 1, x2: 33, y1: 6, y2: 6, stroke: colors[s.farg], "stroke-width": 2.7, "stroke-dasharray": p.compact ? "" : patterns[i] }));
        if(p.trend) sample.append(ageSymbol(s,17,6,3));
        const name = document.createElement("span"); name.textContent = s.namn;
        const value = document.createElement("b");
        button.append(sample, name, value);
        button.addEventListener("click", () => {
          if (p.visible.has(i) && p.visible.size === 1) {
            p.status.textContent = "Minst en linje behöver vara synlig."; return;
          }
          if (p.visible.has(i)) p.visible.delete(i); else p.visible.add(i);
          if (p.id === "k3-bostad" && p.visible.size > 1) p.full = true;
          draw(p);
          p.status.textContent = s.namn + (p.visible.has(i) ? " visas." : " är dold.");
        });
        p.legend.append(button);
        return button;
      });
    } else if (p.series.length > 1) {
      const label = document.createElement("label");
      label.htmlFor = p.id + "-serie";
      label.textContent = "Visa utvecklingen för";
      const select = document.createElement("select");
      select.id = label.htmlFor;
      p.series.forEach((s, i) => { const o = document.createElement("option"); o.value = i; o.textContent = s.namn; select.append(o); });
      select.addEventListener("change", () => { p.selected = Number(select.value); draw(p); });
      choices.append(label, select);
    } else choices.remove();
    if (p.full !== undefined) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Visa 0–100 %";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => { p.full = !p.full; button.textContent = p.full ? (p.overview ? "Visa närbild 60–100 %" : "Visa närbild") : "Visa 0–100 %"; button.setAttribute("aria-pressed", String(p.full)); draw(p); });
      p.scaleButton = button;
      p.root.querySelector(".k2__skalrad").append(button);
    }
    (p.trend || p.outcompare || p.incompare || p.net ? [] : [0, 8, 12]).forEach(i => {
      const b = document.createElement("button"); b.type = "button"; b.dataset.year = i; b.textContent = D.ar[i];
      b.addEventListener("click", () => chooseYear(i)); p.root.querySelector(".k2__snabbval").append(b);
    });
    p.tableHolder=p.root.querySelector('.k2__tabell');
    if(p.net || p.overview || p.outcompare) p.legend.remove();
    if(p.overview || p.outcompare) {
      p.metrics.hidden=true;
      if(p.overview){
        p.root.querySelector('.k2__arval').hidden=true;
        p.scaleButton.textContent=p.full?'Visa närbild 60–100 %':'Visa 0–100 %';
        p.scaleButton.setAttribute('aria-pressed',String(p.full));
      }
      const key=document.createElement('div');key.className='k3__mattnyckel';key.setAttribute('role','group');key.setAttribute('aria-label','Välj diagramvy');
      p.viewButtons=[['compare','Jämför båda'],['home',p.outcompare?'Till övriga GR':'Kvar i samma bostad'],['city',p.outcompare?'Till övriga Sverige':'Kvar i Göteborg'],...(p.outcompare?[['total','Till andra kommuner totalt']]:[])].map(([id,label])=>{
        const b=document.createElement('button');b.type='button';b.dataset.view=id;
        if(id!=='compare' && id!=='total'){const mark=document.createElement('i');mark.className=id==='home'?'k3__ring':'k3__punkt';mark.setAttribute('aria-hidden','true');if(p.outcompare){mark.style.borderColor=colors[p.series[id==='home'?0:1].farg];if(id==='city')mark.style.backgroundColor=colors[p.series[1].farg];}b.append(mark);}
        b.append(document.createTextNode(label));b.addEventListener('click',()=>{p.view=id;p.sort=id==='compare'?'age':id;draw(p);});key.append(b);return b;
      });
      p.root.querySelector('.k2__huvud').after(key);
      if(p.overview){
        const explanation=document.createElement('p');
        explanation.className='k3__punktforklaring';
        explanation.textContent='Avståndet mellan punkterna visar skillnaden i procentenheter mellan att bo kvar i samma bostad och att bo kvar någonstans i Göteborg, alltså övriga kvar i Göteborg. Här ingår annan bostad och bostadsbyte som inte kan avgöras.';
        key.after(explanation);
      }
      const sorting=document.createElement('label');sorting.className='k3__sortering';sorting.textContent='Sortera: ';
      p.sortSelect=document.createElement('select');p.sortSelect.setAttribute('aria-label','Sortera åldersgrupper');
      (p.outcompare?[['age','Ålder'],['total','Totalt inrikes ↓'],['home','Till övriga GR ↓'],['city','Till övriga Sverige ↓'],['diff','Övervikt övriga Sverige'],['diffAsc','Övervikt övriga GR']]:[['age','Ålder'],['home','Bostad ↓'],['city','Göteborg ↓'],['diff','Övriga kvar i Göteborg ↓']]).forEach(([id,label])=>{const o=document.createElement('option');o.value=id;o.textContent=label;p.sortSelect.append(o);});
      p.sortSelect.addEventListener('change',()=>{p.sort=p.sortSelect.value;draw(p);});sorting.append(p.sortSelect);p.root.querySelector('.k2__skalrad').append(sorting);
      if(p.outcompare){
        const guide=document.createElement('p');guide.className='k3__kontrollhjalp';
        guide.textContent='Till andra kommuner totalt summerar övriga GR och övriga Sverige. Välj en vy och sortera åldrarna efter andel.';
        p.root.querySelector('.k2__skalrad').after(guide);
      }
      const phases=document.createElement('p');phases.className='k3__fasnyckel';phases.hidden=!!p.outcompare;
      groups.forEach(g=>{const item=document.createElement('span'),sample=document.createElement('i');sample.style.backgroundColor=colors[g.color];sample.setAttribute('aria-hidden','true');item.append(sample,document.createTextNode(g.name));phases.append(item);});p.chart.after(phases);
    }
    if(p.net) {
      const views=document.createElement('div');views.className='k3__mattnyckel';
      views.setAttribute('role','group');views.setAttribute('aria-label','Välj åldersfördelning eller tidsserie');
      p.netButtons=[['age','Efter ålder'],['time','Över tid · 2013–2025']].map(([id,label])=>{
        const button=document.createElement('button');button.type='button';button.dataset.view=id;button.textContent=label;
        button.addEventListener('click',()=>{p.profile=id==='age';draw(p);});
        views.append(button);return button;
      });
      p.heading.closest('.k2__huvud').after(views);
      const guide=document.createElement('p');guide.className='k3__kontrollhjalp';
      guide.textContent='Välj Över tid för att se stadens inrikes netto sedan 2013, eller Efter ålder för att se vilka åldersgrupper som bidrar till nettot.';
      views.after(guide);
      p.netAgeLabel=document.createElement('label');p.netAgeLabel.className='k3__kontrollhjalp k3__netto-alder';p.netAgeLabel.textContent='Åldersgrupp: ';p.netAge=document.createElement('select');p.netAge.setAttribute('aria-label','Välj netto för åldersgrupp');[['total','Totalt netto'],...D.aldrar_namn.map((name,i)=>[String(i),name])].forEach(([value,name])=>{const o=document.createElement('option');o.value=value;o.textContent=name;p.netAge.append(o);});p.netAge.addEventListener('change',()=>draw(p));p.netAgeLabel.append(p.netAge);guide.after(p.netAgeLabel);
    }
    if(p.incompare)buildIncoming(p);
    if(p.measure) buildPerspectives(p);
    if (p.id === "k3-total" || p.compact) {
      const help = document.createElement("span");
      help.className = "k2__reglagehjalp";
      help.id = p.id + "-hjalp";
      help.textContent = p.yearLabel ? "Dra i reglaget för att välja år." : "(Dra i reglaget eller använd knapparna)";
      p.root.querySelector('.k2__arval label').append(help);
      p.slider.setAttribute("aria-describedby", [p.slider.getAttribute("aria-describedby"), help.id].filter(Boolean).join(" "));
      const controls = document.createElement("div");
      controls.className = "k2__kopiera-siffror";
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Kopiera siffrorna";
      const status = document.createElement("span");
      status.setAttribute("role", "status");
      const fallback = document.createElement("textarea");
      fallback.readOnly = true;
      fallback.hidden = true;
      fallback.setAttribute("aria-label", "Tabellvärden för kopiering till Excel");
      button.addEventListener("click", async () => {
        const text = tableText(p);
        button.disabled = true;
        fallback.hidden = true;
        try {
          await navigator.clipboard.writeText(text);
          status.textContent = "Kopierat. Klistra in i Excel.";
        } catch (error) {
          fallback.value = text;
          fallback.hidden = false;
          fallback.focus();
          fallback.select();
          status.textContent = "Automatisk kopiering gick inte. Kopiera den markerade texten med Ctrl+C eller ⌘C och klistra in i Excel.";
        } finally { button.disabled = false; }
      });
      controls.append(button, status, fallback);
      p.root.querySelector(".k2__data").append(controls);
    }
  }
  function tableRows(p) {
    const yearIndex=indexFor(p);
    if(p.incompare)return [['Ålder vid slutåret',...p.series.map(s=>s.namn+' (%)'),'Total inflyttning (%)'],...incomingRows(p).map(row=>[row.age,...[0,1,2,3].map(k=>incomingValue(row,k).replace(' %',''))])];
    if(p.outcompare)return [['Ålder vid slutåret','Till övriga Göteborgsregionen (%)','Till övriga Sverige (%)','Övriga Sverige minus övriga GR (procentenheter)','Totalt inrikes (%)'],...overviewRows(p).map(row=>[row.age,...[row.home,row.city,row.diff,row.total].map(v=>v.toFixed(1).replace('.',','))])];
    if(p.overview)return [['Ålder vid slutåret','Kvar i samma bostad (%)','Kvar i Göteborg (%)','Övriga kvar i Göteborg (procentenheter)'],...overviewRows(p).map(row=>[row.age,...[row.home,row.city,row.diff].map(v=>v.toFixed(1).replace('.',','))])];
    const labels=p.profile?D.aldrar_namn:D.ar;
    const tableSeries=p.trend?p.series.filter((s,i)=>groups[p.group].ages.includes(i)):p.series;
    return [[p.profile?'Ålder vid slutåret':'Slutår',...tableSeries.map(s=>s.namn+(p.trend?' · '+measures[p.measure]:'')+(p.net?' (antal)':' (%)'))],...labels.map((label,i)=>[label,...tableSeries.map(s=>{const n=p.profile?s.ageValues[yearIndex][i]:s.varden[i];return n===null?(p.net?'Kan inte redovisas – skyddad delpost':''):p.net?String(n):n.toFixed(p.trend?1:2).replace('.',',');})])];
  }
  function renderTable(p) {
    const rows=tableRows(p), table=document.createElement('table');
    table.createCaption().textContent=p.trend ? measures[p.measure]+". Andel (%) av respektive åldersgrupps startbefolkning, 2013–2025. Ålder vid slutåret."+(p.measure==='samma_bostad'?" Uppgift saknas 2019.":"") : p.caption.textContent;
    const header=table.createTHead().insertRow();
    rows[0].forEach(text=>{const th=document.createElement('th');th.scope='col';th.textContent=text;header.append(th);});
    const body=table.createTBody();
    rows.slice(1).forEach(values=>{const row=body.insertRow();values.forEach((text,i)=>{const cell=document.createElement(i?'td':'th');if(!i)cell.scope='row';cell.textContent=text===''?'Uppgift saknas':text;row.append(cell);});});
    p.tableHolder.replaceChildren(table);
  }
  function tableText(p) {
    const yearIndex=indexFor(p);
    const rows=tableRows(p);
    if(p.profile){rows[0].unshift('Slutår');rows.slice(1).forEach(row=>row.unshift(D.ar[yearIndex]));}
    return rows.map(row=>row.join('\t')).join('\r\n');
  }
  async function chartPng(p) {
    const yearIndex=indexFor(p);
    // Frys den valda vyn vid klicket, innan bildkonverteringen börjar.
    const svg = p.chart.querySelector("svg").cloneNode(true);
    const title = p.heading.textContent;
    const subtitle = (p.profile ? "Åldersfördelning · " : "2013–2025 · ") + p.scale.textContent + " · Valt årsskifte: " + period(yearIndex);
    const caption = p.caption.textContent + (p.incompare && (!p.view || p.view==='compare') ? " Turkos öppen ring: övriga Göteborgsregionen. Lila fylld punkt: övriga Sverige. Rosa romb: invandrade, tidigare ej folkbokförda eller okänt." : "") + (p.net && p.profile ? " Färgerna följer åldersgruppernas livsfas. Staplarnas riktning visar positivt eller negativt netto." : "") + (p.summary ? " " + p.summary.textContent + ". Totalsiffrorna omfattar även dolda kategorier." : "") + (p.id === "k3-bostad" ? " Streckat förbinder 2018 och 2020. Uppgift för 2019 saknas." : "");
    const source = p.root.querySelector(".k2__kalla").textContent;
    const rows = (p.overview || p.outcompare || p.incompare ? [] : visibleSeries(p)).map(s => ({ name: metricLabel(p,s), value: valueText(p,s.varden[yearIndex]), color: colors[s.farg], symbol:p.trend?s.symbol:undefined, pattern: p.multi && !p.compact ? patterns[p.series.indexOf(s)] : "" }));
    const box = svg.getAttribute("viewBox").split(" ").map(Number);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", box[2]); svg.setAttribute("height", box[3]);
    svg.querySelectorAll("text").forEach(t => {
      t.setAttribute("fill", "#1f1f1f"); t.setAttribute("font-family", "Arial, sans-serif"); t.setAttribute("font-size", "12");
    });
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("Diagrammet kunde inte renderas.")); image.src = url; });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Bildexport saknas i webbläsaren.");
      const w = 900, pad = 36, area = w - pad * 2;
      function wrap(text, font, max) {
        ctx.font = font;
        const lines = []; let line = "";
        text.split(/\s+/).forEach(word => {
          if (line && ctx.measureText(line + " " + word).width > max) { lines.push(line); line = word; }
          else line += (line ? " " : "") + word;
        });
        if (line) lines.push(line);
        return lines;
      }
      const headingLines = wrap(title, "800 26px Arial", area);
      const subLines = wrap(subtitle, "16px Arial", area);
      const capLines = wrap(caption, "16px Arial", area);
      const sourceLines = wrap(source, "14px Arial", area);
      const legends = rows.map(r => ({ ...r, lines: wrap(r.name, "16px Arial", area - 165) }));
      const graphH = area / box[2] * box[3];
      const height = pad * 2 + headingLines.length * 34 + subLines.length * 23 + graphH + 22
        + legends.reduce((sum, r) => sum + Math.max(30, r.lines.length * 22 + 8), 0)
        + 20 + capLines.length * 23 + sourceLines.length * 20;
      canvas.width = w * 2; canvas.height = Math.ceil(height) * 2;
      ctx.scale(2, 2); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, height);
      ctx.textBaseline = "top"; ctx.fillStyle = "#1f1f1f";
      let y = pad;
      function textLines(lines, font, spacing) { ctx.font = font; lines.forEach(line => { ctx.fillText(line, pad, y); y += spacing; }); }
      textLines(headingLines, "800 26px Arial", 34);
      textLines(subLines, "16px Arial", 23);
      y += 8; ctx.drawImage(image, pad, y, area, graphH); y += graphH + 14;
      legends.forEach(r => {
        ctx.strokeStyle = r.color; ctx.lineWidth = 3;
        ctx.setLineDash(r.pattern ? r.pattern.split(" ").map(Number) : []);
        ctx.beginPath(); ctx.moveTo(pad, y + 9); ctx.lineTo(pad + 32, y + 9); ctx.stroke(); ctx.setLineDash([]);
        if(r.symbol!==undefined){
          const mx=pad+16,my=y+9;ctx.fillStyle=r.color;ctx.beginPath();
          if(r.symbol===1)ctx.rect(mx-4,my-4,8,8);
          else if(r.symbol===2){ctx.moveTo(mx,my-5);ctx.lineTo(mx+5,my);ctx.lineTo(mx,my+5);ctx.lineTo(mx-5,my);ctx.closePath();}
          else if(r.symbol===3){ctx.moveTo(mx,my-5);ctx.lineTo(mx+5,my+4);ctx.lineTo(mx-5,my+4);ctx.closePath();}
          else ctx.arc(mx,my,4,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle = "#1f1f1f"; ctx.font = "16px Arial";
        r.lines.forEach((line, i) => ctx.fillText(line, pad + 44, y + i * 22));
        ctx.font = "bold 16px Arial"; ctx.textAlign = "right"; ctx.fillText(r.value, w - pad, y); ctx.textAlign = "left";
        y += Math.max(30, r.lines.length * 22 + 8);
      });
      y += 20;
      textLines(capLines, "16px Arial", 23);
      textLines(sourceLines, "14px Arial", 20);
      return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG kunde inte skapas.")), "image/png"));
    } finally { URL.revokeObjectURL(url); }
  }
  async function copyChart(p) {
    const yearIndex=indexFor(p);
    p.copyButton.disabled = true;
    p.status.textContent = "Skapar diagram…";
    p.download.hidden = true;
    if (p.downloadUrl) { URL.revokeObjectURL(p.downloadUrl); p.downloadUrl = null; }
    const fileName = p.id + "-" + D.ar[yearIndex] + ".png";
    const png = chartPng(p);
    try {
      if (!navigator.clipboard || !window.ClipboardItem) throw new Error("Urklipp saknas.");
      // Löftet lämnas direkt till urklippet för att behålla klickets användaraktivering.
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      p.status.textContent = "Diagrammet är kopierat. Klistra in det där du vill använda det.";
    } catch (error) {
      try {
        const blob = await png;
        p.downloadUrl = URL.createObjectURL(blob);
        p.download.href = p.downloadUrl; p.download.download = fileName; p.download.hidden = false;
        p.status.textContent = "Kopieringen gick inte. Du kan hämta samma bild som PNG.";
      } catch (renderError) {
        p.status.textContent = "Diagrammet kunde inte skapas. Försök igen.";
      }
    } finally { p.copyButton.disabled = false; }
  }

  panels.forEach(build);
  panels.filter(p=>p.measure).forEach(setPerspective);
  panels.forEach(draw);
  const dots = document.getElementById("punkter");
  stages.forEach((s, i) => {
    const li = document.createElement("li"), b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-label", "Steg " + (i + 1) + ": " + s.getAttribute("aria-label"));
    b.addEventListener("click", () => show(i)); li.append(b); dots.append(li);
  });
  function show(i, address = true) {
    active = Math.max(0, Math.min(stages.length - 1, i));
    stages.forEach((s, j) => { s.classList.toggle("aktiv", j === active); s.inert = j !== active; s.setAttribute("aria-hidden", String(j !== active)); });
    [...dots.querySelectorAll("button")].forEach((b, j) => b.setAttribute("aria-current", String(j === active)));
    document.getElementById("bakat").disabled = active === 0;
    document.getElementById("framat").disabled = active === stages.length - 1;
    document.getElementById("stegstatus").textContent = "Kapitel 3 · " + (active + 1) + " av " + stages.length;
    if (address) history.replaceState(null, "", "#" + stages[active].id);
    draw(panels[active]);
    window.scrollTo(0, 0);
  }
  document.getElementById("bakat").onclick = () => show(active - 1);
  document.getElementById("framat").onclick = () => show(active + 1);
  const modal = document.getElementById("metod");
  document.getElementById("oppna-metod").onclick = () => modal.showModal();
  document.getElementById("stang-metod").onclick = () => modal.close();
  modal.addEventListener("close", () => document.getElementById("oppna-metod").focus());
  document.getElementById("metod-kallor").textContent = "Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.";
  document.addEventListener("keydown", e => {
    if (modal.open || e.target.closest("button, a, input, select, textarea, summary, [role='region']")) return;
    if (["ArrowRight", "PageDown"].includes(e.key)) { show(active + 1); e.preventDefault(); }
    if (["ArrowLeft", "PageUp"].includes(e.key)) { show(active - 1); e.preventDefault(); }
  });
  let touch = null;
  document.addEventListener("touchstart", e => {
    touch = !modal.open && !e.target.closest("input, select, button, a, details") ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }, { passive: true });
  document.addEventListener("touchend", e => {
    if (!touch || modal.open) return;
    const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 2) show(active + (dx < 0 ? 1 : -1));
    touch = null;
  }, { passive: true });
  document.addEventListener("touchcancel", () => { touch = null; }, { passive: true });
  function fromHash() { const i = stages.findIndex(s => "#" + s.id === location.hash); show(i < 0 ? 0 : i, false); }
  window.addEventListener("hashchange", fromHash);
  window.addEventListener("resize", () => draw(panels[active]));
  window.addEventListener("beforeprint", () => panels.forEach(draw));
  fromHash();
})();







