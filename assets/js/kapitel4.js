/* Kapitel 4: kumulativa nivåer och geografisk orientering med D3. */
(function(){
  'use strict';
  const D=window.DATA_KAPITEL4,F=window.RAPPORT_FARGER,C=F.palette;
  if(!D)return;
  const T=window.K4S1_SLUTVERSION;
  const source=window.RAPPORT_KALLA,period=D.start+' till '+D.slut;
  const fmt=(v,d=1)=>v.toLocaleString('sv-SE',{minimumFractionDigits:d,maximumFractionDigits:d});
  const groups=[{name:'Barn 1–5 år och vuxna 30–44 år',ages:['1-5','30-44']},{name:'Unga vuxna',ages:['19-24','25-29']},{name:'Skolåldrar och vuxna 45–59 år',ages:['6-9','10-15','16-18','45-59']},{name:'Äldre åldrar',ages:['60-69','70-79','80-89','90+']}];
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
    if(id!=='k4-karta')heading.append(html('span','k4__datum',' ('+period+')'));
    const controls=html('div','k4__val'),scale=html('div','k4__verktyg'),figure=html('div','k4__figur'),cap=html('p','',caption),src=html('p','',kalla),exports=html('div','k4__export'),status=html('span');status.setAttribute('role','status');root.append(heading,controls,scale,figure,cap,src,exports);
    const p={id,root,heading,controls,scale,figure,cap,src,exports,status,full:false};
    const copy=button(id==='k4-karta'?'Kopiera karta':'Kopiera diagram',()=>copyGraphic(p,copy));p.download=html('a','','Hämta PNG');p.download.hidden=true;exports.append(copy,p.download,status);return p;
  }
  function table(p,rows){
    if(!p.details){
      p.details=html('details','k4__data');p.details.append(html('summary','','Visa alla värden'));p.tableWrap=html('div','k4__tabell');p.tableWrap.tabIndex=0;p.tableWrap.setAttribute('role','region');p.tableWrap.setAttribute('aria-label','Datatabell, kan rullas i sidled');
      const controls=html('div','k4__export'),status=html('span'),fallback=html('textarea');status.setAttribute('role','status');fallback.readOnly=true;fallback.hidden=true;fallback.setAttribute('aria-label','Värden för kopiering till Excel');
      controls.append(button('Kopiera siffrorna',async()=>{const value=p.rows.map(r=>r.join('\t')).join('\r\n');fallback.hidden=true;try{await navigator.clipboard.writeText(value);status.textContent='Kopierat. Klistra in i Excel.';}catch{fallback.value=value;fallback.hidden=false;fallback.focus();fallback.select();status.textContent='Kopiera markerad text med Ctrl+C eller ⌘C.';}}),status);p.details.append(p.tableWrap,controls,fallback);p.root.append(p.details);
    }
    p.rows=rows;const t=html('table');t.createCaption().textContent=p.cap.textContent;const head=t.createTHead().insertRow();rows[0].forEach(v=>{const th=html('th','',v);th.scope='col';head.append(th);});const body=t.createTBody();rows.slice(1).forEach(row=>{const tr=body.insertRow();row.forEach((v,i)=>{const cell=html(i?'td':'th','',v);if(!i)cell.scope='row';tr.append(cell);});});p.tableWrap.replaceChildren(t);
  }
  const total=shell('k4-trappa','Kvar inom allt större områden','Andel av Göteborgs befolkning den 31 december 2024 som finns kvar inom respektive nivå den 31 december 2025. Mörk stapel: kvar inom nivån. Ljus del: återstoden upp till 100 procent. Nivåerna innesluter varandra och ska inte summeras.');
  const populationNote='Andel av Göteborgs befolkning den 31 december 2024 som finns kvar inom respektive nivå den 31 december 2025.';
  total.cap.replaceChildren(html('strong','k4__population',populationNote),document.createTextNode(' Mörk stapel: bekräftat kvar inom nivån. Ljus del: återstoden upp till 100 procent, inklusive uppgifter som inte kan bedömas. Andelarna ska inte summeras.'));
  const age=shell('k4-alderstrappa','Kvarboende på olika geografiska nivåer','Färgade linjer: markerade åldersgrupper. Tunna grå linjer: övriga åldrar. Andel av respektive åldersgrupps startbefolkning. Ålder vid slutåret. Nivåerna innesluter varandra; x-axeln visar geografiska nivåer, inte tid eller avstånd.');
  age.group=1;age.visible=new Set(groups[1].ages);
  for(const p of [total,age]){p.scaleLabel=html('span');p.zoom=button('Visa 0–100 %',()=>{p.full=!p.full;drawCharts();});p.scale.append(p.scaleLabel,p.zoom);p.figure.setAttribute('role','region');p.figure.setAttribute('aria-label','Diagram, kan rullas i sidled på liten skärm');p.figure.tabIndex=0;}
  total.full=true;total.zoom.remove();
  total.controls.remove();age.groupButtons=groups.map((g,i)=>{const b=button(g.name,()=>{age.group=i;age.visible=new Set(g.ages);drawCharts();});age.controls.append(b);return b;});age.controls.setAttribute('role','group');age.controls.setAttribute('aria-label','Välj åldersjämförelse');
  age.lines=html('div','k4__val');age.lines.setAttribute('role','group');age.lines.setAttribute('aria-label','Markera åldersgrupper i färg eller visa dem i grått');age.figure.after(age.lines);
  function totalSvg(width){
    const W=Math.max(520,width),H=338,left=174,right=W-18,x=v=>left+v/100*(right-left),y=i=>55+i*40;
    const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'83,1 procent kvar i samma bostad, 94,5 i Göteborg och 96,2 i Göteborgsregionen. Nivåerna innesluter varandra.'});
    [0,25,50,75,100].forEach(v=>svg.append(label(x(v),23,String(v)+(v===100?' %':''),'middle')));
    D.rungar.forEach((name,i)=>{
      const value=label(left+10,y(i)+4,fmt(T.andel[i])+' %','start',600);value.setAttribute('fill','#ffffff');value.setAttribute('data-bar-value','true');
      svg.append(label(0,y(i)+4,name),node('rect',{x:left,y:y(i)-14,width:right-left,height:28,fill:C.gra}),node('rect',{x:left,y:y(i)-14,width:x(T.andel[i])-left,height:28,fill:C.morkbla,'data-bar':'true'}),value);
    });return svg;
  }
  function ageSvg(width,full,series){
    const W=Math.max(520,width),H=318,left=46,right=W-95,top=24,bottom=264,min=full?0:60,x=i=>left+i/6*(right-left),y=v=>bottom-(v-min)/(100-min)*(bottom-top);
    const svg=node('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Alla tolv åldrar visas från bostad till Sverige. I färg: '+series.map(s=>s.namn).join(', ')+'. Övriga i grått. Värden finns i tabellen.'});
    (full?[0,25,50,75,100]:[60,70,80,90,100]).forEach(v=>svg.append(node('line',{x1:left,x2:right,y1:y(v),y2:y(v),stroke:C.gra,'stroke-width':.6}),label(left-8,y(v)+4,fmt(v),'end')));
    D.kort.forEach((name,i)=>name.split('-').forEach((part,j)=>svg.append(label(x(i),286+j*15,part+(j===0&&name.includes('-')?'-':''),'middle'))));
    const highlighted=new Set(series.map(s=>s.id));
    window.K4S2_SLUTVERSION.filter(s=>!highlighted.has(s.id)).forEach(s=>{
      const line=node('path',{d:s.varden.map((v,i)=>(i?'L':'M')+x(i)+','+y(v)).join(' '),fill:'none',stroke:C.gra,'stroke-width':1.4,'stroke-linejoin':'round','data-context-age':s.id});line.append(node('title',{},s.namn));svg.append(line);
    });
    series.forEach(s=>{svg.append(node('path',{d:s.varden.map((v,i)=>(i?'L':'M')+x(i)+','+y(v)).join(' '),fill:'none',stroke:C[F.ageLines[s.id]],'stroke-width':2.7,'stroke-linejoin':'round','data-highlight-age':s.id}));s.varden.forEach((v,i)=>{const point=symbol(s.id,x(i),y(v));point.append(node('title',{},s.namn+' · '+D.rungar[i]+': '+fmt(v)+' %'));svg.append(point);});});window.RAPPORT_ETIKETTER(svg,series.map(s=>({name:s.namn,y:y(s.varden[6]),color:C[F.ageLines[s.id]]})),{right,top:24,bottom,width:W});return svg;
  }
  function drawCharts(){
    const focusedAge=age.lines.contains(document.activeElement)?document.activeElement.dataset.age:null;
    for(const p of [total,age]){p.scaleLabel.textContent='Andel (%) · Skala '+(p.full?'0–100':p===total?'75–100':'60–100');p.zoom.textContent=p.full?'Visa närbild':'Visa 0–100 %';p.zoom.setAttribute('aria-pressed',String(p.full));}
    total.figure.replaceChildren(totalSvg(total.root.getBoundingClientRect().width,total.full));
    table(total,[['Nivå','Antal personer','Andel (%)','Ökning från föregående nivå (procentenheter)'],...D.rungar.map((n,i)=>[n,String(T.antal[i]),fmt(T.andel[i]),i?fmt(T.andel[i]-T.andel[i-1]):'—'])]);
    age.figure.replaceChildren(ageSvg(age.root.getBoundingClientRect().width,age.full,window.K4S2_SLUTVERSION.filter(s=>age.visible.has(s.id))));
    age.groupButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===age.group)));age.lines.replaceChildren();
    window.K4S2_SLUTVERSION.filter(s=>groups[age.group].ages.includes(s.id)).forEach(s=>{const b=button(s.namn,()=>{if(age.visible.has(s.id)&&age.visible.size===1){age.status.textContent='Minst en åldersgrupp behöver visas.';return;}age.visible.has(s.id)?age.visible.delete(s.id):age.visible.add(s.id);age.status.textContent='';drawCharts();});b.dataset.age=s.id;const sample=node('svg',{viewBox:'0 0 24 12',width:24,height:12,'aria-hidden':'true'});sample.append(node('line',{x1:0,x2:24,y1:6,y2:6,stroke:C[F.ageLines[s.id]],'stroke-width':2.7}),symbol(s.id,12,6,3));b.prepend(sample);b.setAttribute('aria-pressed',String(age.visible.has(s.id)));age.lines.append(b);if(focusedAge===s.id)b.focus({preventScroll:true});});
    table(age,[['Åldersgrupp',...D.rungar.map(n=>n+' (%)')],...window.K4S2_SLUTVERSION.map(s=>[s.namn,...s.varden.map(v=>fmt(v))])]);
  }
  function mapFeatures(){return Object.fromEntries(['PRIMAROMRADEN','MELLANOMRADEN','STADSOMRADEN','GR_KOMMUNER','HAV','ALV'].map(name=>[name,window['KARTA_'+name]]));}
  function mapChain(layers,code){
    const first=layers.PRIMAROMRADEN.features.find(f=>f.properties.omrade_kod===code);
    if(!first)throw Error('Primärområdet saknas.');
    const mid=layers.MELLANOMRADEN.features.find(f=>f.properties.omrade_kod===first.properties.mellanomrade_kod),city=layers.STADSOMRADEN.features.find(f=>f.properties.omrade_kod===first.properties.stadsomrade_kod),gbg={type:'FeatureCollection',features:layers.STADSOMRADEN.features,properties:{kommun_kod:'1480',kommun_namn:'Göteborg'}};
    if(!mid||!city||!gbg)throw Error('Områdets överordnade indelning saknas.');return [first,mid,city,gbg,layers.GR_KOMMUNER];
  }
  const map=shell('k4-karta','Från Kärralund till Göteborgsregionen','Geografisk orientering. Färgerna markerar valda områden, inte statistiska värden.','Kartunderlag: Göteborgs Stad och SCB, via gothenburg_maps. Indelningar 2025.');
  map.scale.remove();map.level=0;map.code='207';map.profile='bostad';
  function buildMap(){
    if(!window.d3){map.figure.append(html('p','','Kartan kunde inte laddas.'));return;}
    const layers=mapFeatures();layers.GR_KOMMUNER=window.K4_GR_OVERSIKT;const W=500,H=490,levelNames=['Primärområde','Mellanområde','Stadsområde','Göteborg','Göteborgsregionen'];
    map.heading.textContent='Utforska områdenas sammanhang';
    const chooser=html('label','k4__omradesval','Välj primärområde '),select=html('select');select.setAttribute('aria-label','Välj primärområde');
    [...layers.PRIMAROMRADEN.features].sort((a,b)=>a.properties.omrade_namn.localeCompare(b.properties.omrade_namn,'sv')).forEach(f=>{const o=html('option','',f.properties.omrade_namn);o.value=f.properties.omrade_kod;select.append(o);});select.value=map.code;chooser.append(select);map.controls.before(chooser);
    const chainText=html('p','k4__kedja');map.controls.after(chainText);map.controls.setAttribute('role','group');map.controls.setAttribute('aria-label','Välj geografisk nivå');
    const buttons=levelNames.map((n,i)=>{const b=button(n,()=>{map.level=i;update();});map.controls.append(b);return b;});
    const layout=html('div','k4__atlas'),stats=html('div','k4__profil');map.figure.before(layout);layout.append(map.figure,stats);map.figure.classList.add('k4__kartbild');
    const svg=d3.select(map.figure).append('svg').attr('viewBox','0 0 '+W+' '+H).attr('role','img');
    const zoom=d3.zoom().extent([[0,0],[W,H]]).scaleExtent([1,8]).filter(e=>e.type!=='wheel'&&e.type!=='dblclick'&&!e.ctrlKey&&!e.button);let g;
    zoom.on('zoom',e=>{if(g)g.attr('transform',e.transform);});svg.call(zoom);
    const tools=html('div','k4__kartverktyg');tools.append(button('+',()=>svg.call(zoom.scaleBy,1.4)),button('−',()=>svg.call(zoom.scaleBy,1/1.4)),button('Återställ',()=>svg.call(zoom.transform,d3.zoomIdentity)));tools.children[0].setAttribute('aria-label','Zooma in');tools.children[1].setAttribute('aria-label','Zooma ut');map.figure.append(tools);
    function update(){
      const chain=mapChain(layers,map.code),region=map.level===4,selected=chain[map.level],target=region?layers.GR_KOMMUNER:map.level===0?chain[1]:selected;
      map.exportTitle=region?'Göteborgsregionen':map.level===3?'Göteborg':selected.properties.omrade_namn;
      const cityView=map.level===3,cityScale=Math.min(W/420,H/445),cityX=(W-420*cityScale)/2,cityY=(H-445*cityScale)/2;
      const projection=d3.geoMercator().fitExtent(cityView?[[18,25],[402,410]]:[[35,45],[W-35,H-28]],target);
      if(cityView){const t=projection.translate();projection.scale(projection.scale()*cityScale).translate([t[0]*cityScale+cityX,t[1]*cityScale+cityY]);}
      const path=d3.geoPath(projection);
      svg.selectAll('*').remove();
      if(cityView){svg.append('defs').append('clipPath').attr('id','k4-city-clip').append('path').attr('d','M0 0H420V420H250Q160 400 110 365Q80 335 85 286Q75 262 77 232Q69 194 82 161Q91 126 124 101L0 0Z').attr('transform','translate('+cityX+','+cityY+') scale('+cityScale+')');}
      g=svg.append('g');if(cityView)g.attr('clip-path','url(#k4-city-clip)');svg.call(zoom.transform,d3.zoomIdentity);
      const draw=(features,fill,stroke,width)=>g.append('g').selectAll('path').data(features).join('path').attr('d',path).attr('fill',fill).attr('stroke',stroke).attr('stroke-width',width).attr('vector-effect','non-scaling-stroke');
      if(region){
        draw(layers.GR_KOMMUNER.features,'#f1f4f5',C.gra,.8);
        const gbg=layers.GR_KOMMUNER.features.find(f=>f.properties.kommun_kod==='1480');draw([gbg],'#c0e4f2',C.morkbla,1.2);
        layers.GR_KOMMUNER.features.forEach(f=>{const p=path.centroid(f);g.append('text').attr('x',p[0]).attr('y',p[1]).attr('text-anchor','middle').attr('data-context-label','true').attr('font-size',10).attr('fill','#1f1f1f').attr('font-weight',f===gbg?600:400).text(f.properties.kommun_namn);});
      }else{
        draw(layers.STADSOMRADEN.features,'#f1f4f5',cityView?C.morkbla:C.gra,cityView?.7:.6);
        if(map.level>0&&map.level<3)draw(selected.features||[selected],'#b8e1c8',C.morkbla,.9);
        draw([...layers.HAV.features,...layers.ALV.features],'#c0e4f2','none',0);
        if(map.level===1||map.level===2){const key=map.level===1?'mellanomrade_kod':'stadsomrade_kod',members=layers.PRIMAROMRADEN.features.filter(f=>f.properties[key]===selected.properties.omrade_kod);draw(members,'none',C.morkbla,.35).attr('data-primary-boundary','true');members.filter(f=>f.properties.omrade_kod!==map.code).forEach(f=>{const pos=path.centroid(f);g.append('text').attr('x',pos[0]).attr('y',pos[1]).attr('text-anchor','middle').attr('data-primary-context','true').attr('font-size',map.level===1?12:8).attr('fill','#1f1f1f').attr('paint-order','stroke').attr('stroke','#ffffff').attr('stroke-width',1.5).text(f.properties.omrade_namn);});}
        draw([chain[0]],'#fbcfb9','#d24723',2).attr('data-selected-primary','true');
        const center=path.centroid(chain[0]);g.append('text').attr('x',center[0]+9).attr('y',center[1]-9).attr('data-area-label','true').attr('font-size',14).attr('font-weight',600).attr('fill','#1f1f1f').attr('paint-order','stroke').attr('stroke','#fff').attr('stroke-width',3).text(chain[0].properties.omrade_namn);
        if(map.level===3)layers.STADSOMRADEN.features.forEach(f=>{const p=path.centroid(f);g.append('text').attr('x',p[0]).attr('y',p[1]).attr('data-context-label','true').attr('font-size',10).attr('fill','#1f1f1f').attr('text-anchor','middle').text(f.properties.omrade_namn);});
      }
      const localNames=[chain[0].properties.omrade_namn,chain[1].properties.omrade_namn,chain[2].properties.omrade_namn,'Göteborg','Göteborgsregionen'];chainText.replaceChildren();localNames.forEach((name,i)=>{if(i)chainText.append(document.createTextNode(' → '));chainText.append(html(i===map.level?'strong':'span','',name));});svg.attr('aria-label',region?'Göteborgsregionens 13 kommuner. Göteborg markerat.':localNames[0]+' inom '+localNames[Math.max(1,map.level)]);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===map.level)));
      map.cap.textContent=region?'Förenklad kommunöversikt. Kust och öar återges inte detaljerat; nytt kartunderlag behövs för kustvyn.':'Aprikos med röd kontur: valt primärområde. Ljusblått: vatten. Ljusgrönt: valt större område. Kartan visar indelningarna, inte statistiska skillnader.';
      renderMapStats(stats,chain,map.level);map.src.textContent=region?'Förenklad orienteringskarta: okfse/sweden-geojson, ursprungligen Valmyndigheten via OpenDataSoft. Gränsversion ej verifierad för 2025.':'Källa: SCB, specialbeställning gjord inom arbetsprojektet Agenda2030 och Jämlikt Göteborg.';
    }
    select.addEventListener('change',()=>{map.code=select.value;update();});map.finish=()=>{};update();
  }
  function renderMapStats(root,chain,level){
    root.replaceChildren();if(level===4){root.append(html('h3','','Göteborgsregionens 13 kommuner'),html('p','','13 kommuner i ett regionalt sammanhang.'),html('p','','Göteborg är markerat. Välj en nivå inom Göteborg för att utforska kvarboende, åldrar och boendeformer.'));table(map,[['Geografisk nivå','Område'],...chain.slice(0,4).map((f,i)=>[['Primärområde','Mellanområde','Stadsområde','Kommun'][i],f.properties.omrade_namn||f.properties.kommun_namn])]);return;}

    const S=window.KARTSTATISTIK,P=window.K4_BOSTADSPROFIL,kind=['pri','mo','so','gbg'][level],geo=chain[level].properties,code=level===3?'1480':geo.omrade_kod,name=geo.omrade_namn||geo.kommun_namn,pop=S[kind][code],kvar=window.K4S3_SLUTVERSION[kind][code],rows=P.data[kind][code];
    root.append(html('h3','',(['PRI: ','MO: ','SO: ',''][level])+name));
    const metrics=html('div','k4__profilnycklar');
    for(const [value,title] of [[kvar?.share!=null?fmt(kvar.share)+' %':'Uppgift saknas','Kvar i samma bostad 2024–2025'],[pop?fmt(pop[3],0):'Uppgift saknas','Invånare 31 december 2025']]){const p=html('p');p.append(html('strong','',value),html('span','',title));metrics.append(p);}root.append(metrics);
    const tabs=html('div','k4__profiltabs'),content=html('div','k4__nyprofil');tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Välj bostadstabell eller åldersfördelning');root.append(tabs,content);
    const buttons=['Bostäder och boende','Ålder per bostadstyp'].map((name,i)=>{const b=button(name,()=>{map.profile=i?'alder':'bostad';render();});tabs.append(b);return b;});
    const missing='Kan inte redovisas',val=(n,d=0)=>n==null?missing:fmt(n,d),share=r=>r.persons!=null&&pop?.[3]>0?100*r.persons/pop[3]:null;
    function render(){content.replaceChildren();const isAge=map.profile==='alder';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===(isAge?1:0))));
      if(!rows){content.append(html('p','','Underlag saknas för området.'));return;}
      content.append(html('p','k4__profilnot','31 december 2025 · direkt räknat för vald områdesnivå.'));
      if(!isAge){const data=[['Bostadstyp','Bebodda bostäder','Personer','Andel invånare'],...rows.map(r=>[r.name,val(r.homes),val(r.persons),share(r)==null?missing:fmt(share(r))+' %'])];
        const wrap=html('div','k4__profilscroll'),t=html('table','k4__bostadstabell'),head=t.createTHead().insertRow();data[0].forEach(n=>{const th=html('th','',n);th.scope='col';head.append(th);});const body=t.createTBody();data.slice(1).forEach(row=>{const tr=body.insertRow();row.forEach((n,i)=>{const cell=html(i?'td':'th','',n===missing?'—':n);if(n===missing)cell.title=missing+' – underlaget är ofullständigt eller skyddat';tr.append(cell);});});wrap.append(t);content.append(wrap);table(map,data);
        content.append(html('p','k4__profilnot','Andel av områdets invånare. Bostadsrätt och hyresrätt avser flerbostadshus. Äganderätt i flerbostadshus ingår i övrigt. Personer utan bostadsuppgift ingår i sista personkategorin, men kan inte räknas som kända bebodda bostäder.'));
      }else{
        map.housingType??=0;const chooser=html('label','k4__bostadsval','Bostadstyp '),select=html('select');select.setAttribute('aria-label','Välj bostadstyp för åldersfördelning');P.names.forEach((name,i)=>{const o=html('option','',name);o.value=i;select.append(o);});select.value=map.housingType;select.addEventListener('change',()=>{map.housingType=Number(select.value);render();});chooser.append(select);content.append(chooser);
        const r=rows[map.housingType],ref=P.data.gbg['1480'][map.housingType],max=60,W=480,H=380,left=60,right=424,top=35,step=24,x=v=>left+v/max*(right-left),y=i=>top+i*step;
        const svg=node('svg',{viewBox:'0 0 '+W+' '+H,role:'img','aria-label':'Andel per åldersgrupp inom '+r.name+' i '+name+'. Fast skala noll till sextio procent. Fylld punkt: området. Öppen ring: Göteborg.'});
        [0,20,40,60].forEach(v=>svg.append(node('line',{x1:x(v),x2:x(v),y1:25,y2:340,stroke:C.gra}),label(x(v),15,v+' %','middle')));
        P.ages.forEach((age,i)=>{const v=r.shares[i],g=ref.shares[i],cy=y(i);svg.append(label(left-10,cy+4,age==='0 år'?'0':age.replace('-','–'),'end'));if(v!==null)svg.append(node('line',{x1:x(0),x2:x(v),y1:cy,y2:cy,stroke:C.turkos,'stroke-width':2,'data-age-stem':i}));if(g!==null){const mark=node('circle',{cx:x(g),cy,r:6,fill:'#ffffff',stroke:C.morkbla,'stroke-width':1.4,'data-gbg-reference':'true'});mark.append(node('title',{},'Göteborg · '+age+': '+fmt(g)+' %'));svg.append(mark);}if(v!==null){const mark=node('circle',{cx:x(v),cy,r:4.5,fill:C.turkos,'data-age-point':i});mark.append(node('title',{},name+' · '+age+': '+fmt(v)+' %'));svg.append(mark);}svg.append(label(W-2,cy+4,v===null?'—':fmt(v)+' %','end'));});content.append(svg);
        const keyGroups=[{name:'1–5 år',indices:[1]},{name:'6–15 år',indices:[2,3]},{name:'70+ år',indices:[10,11,12]}];
        const groupShare=(row,group)=>row.keys[keyGroups.indexOf(group)] ?? null;
        const percent=v=>v===null?'—':fmt(v)+' %';
        content.append(html('p','k4__aldersrubrik','Andel av de boende i '+r.name.toLocaleLowerCase('sv-SE')));
        const keys=html('div','k4__aldersnycklar');keyGroups.forEach(group=>{const item=html('div');item.append(html('span','',group.name),html('strong','',percent(groupShare(r,group))),html('small','','Göteborg: '+percent(groupShare(ref,group))));keys.append(item);});content.append(keys);
        const comparison=html('details','k4__bostadsjamforelse');comparison.append(html('summary','','Jämför bostadsformer i området'));
        const ct=html('table','k4__bostadstabell');ct.append(html('caption','','Andel inom respektive bostadsform · '+name));const ch=ct.createTHead().insertRow();['Bostadsform',...keyGroups.map(g=>g.name)].forEach(text=>{const th=html('th','',text);th.scope='col';ch.append(th);});const cb=ct.createTBody();rows.forEach((row,i)=>{const tr=cb.insertRow();if(i===map.housingType)tr.className='k4__vald-bostadsform';const th=html('th','',row.name);th.scope='row';tr.append(th);keyGroups.forEach(group=>tr.append(html('td','',percent(groupShare(row,group)))));});comparison.append(ct);content.append(comparison);
        content.append(html('p','k4__profilnot','Fylld punkt: '+name+'. Öppen ring: Göteborg. Samma skala 0–60 % för alla områden och bostadstyper.'+(ref.shares.every(v=>v===null)?' Göteborgs referens saknas ännu.':'')));
        content.append(html('p','k4__profilnot','Varje rad visar andelen i en åldersgrupp inom vald bostadstyp. Grupperna har olika åldersbredd; punkterna visar gruppandelar, inte andelen per ettårsålder.'));
        table(map,[['Ålder',name+' (%)','Göteborg (%)'],...P.ages.map((age,i)=>[age,val(r.shares[i],1),val(ref.shares[i],1)])]);
      }
      content.append(html('p','k4__profilnot','— = ofullständigt eller skyddat underlag. Nyckeltalen är räknade separat och kan därför visas även när en mindre åldersgrupp är skyddad.'));
    }render();
  }
  async function graphicBlob(p){
    if(p.finish)p.finish();
    const svg=p.figure.querySelector('svg').cloneNode(true),title=p.exportTitle||p.heading.textContent,caption=(p.scaleLabel?p.scaleLabel.textContent+'. ':'')+p.cap.textContent,source=p.src.textContent,ageNames=p===age?window.K4S2_SLUTVERSION.filter(s=>age.visible.has(s.id)):[];
    svg.setAttribute('xmlns','http://www.w3.org/2000/svg');const box=svg.getAttribute('viewBox').split(' ').map(Number);svg.setAttribute('width',box[2]);svg.setAttribute('height',box[3]);svg.querySelectorAll('text').forEach(t=>{t.setAttribute('font-family','Arial, sans-serif');if(p!==map)t.setAttribute('font-size',12);t.setAttribute('fill',t.hasAttribute('data-bar-value')?'#ffffff':'#1f1f1f');});
    const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
    try{
      const image=new Image();await new Promise((yes,no)=>{image.onload=yes;image.onerror=no;image.src=url;});
      const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),W=1000,pad=38,inner=W-2*pad,graphHeight=inner*box[3]/box[2];
      function wrap(text,font){ctx.font=font;const lines=[];let line='';text.split(/\s+/).forEach(word=>{if(line&&ctx.measureText(line+' '+word).width>inner){lines.push(line);line=word;}else line+=(line?' ':'')+word;});if(line)lines.push(line);return lines;}
      const titles=wrap(title,'bold 25px Arial'),caps=wrap(caption,'15px Arial'),sources=wrap(source,'14px Arial'),H=pad*2+titles.length*32+graphHeight+ageNames.length*25+caps.length*22+sources.length*21+35;
      canvas.width=W*2;canvas.height=Math.ceil(H)*2;ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.textBaseline='top';let y=pad;
      function lines(values,font,step){ctx.fillStyle='#1f1f1f';ctx.font=font;values.forEach(v=>{ctx.fillText(v,pad,y);y+=step;});}
      lines(titles,'bold 25px Arial',32);y+=8;ctx.drawImage(image,pad,y,inner,graphHeight);y+=graphHeight+12;
      ageNames.forEach(s=>{ctx.strokeStyle=C[F.ageLines[s.id]];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pad,y+8);ctx.lineTo(pad+24,y+8);ctx.stroke();ctx.fillStyle='#1f1f1f';ctx.font='15px Arial';ctx.fillText(s.namn,pad+35,y);y+=25;});lines(caps,'15px Arial',22);y+=8;lines(sources,'14px Arial',21);
      return await new Promise((yes,no)=>canvas.toBlob(b=>b?yes(b):no(Error('PNG saknas')),'image/png'));
    }finally{URL.revokeObjectURL(url);}
  }
  async function copyGraphic(p,b){
    b.disabled=true;p.status.textContent='Skapar bild…';p.download.hidden=true;const blob=graphicBlob(p);
    try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);p.status.textContent='Kopierat. Klistra in bilden där du vill använda den.';}
    catch{try{const result=await blob;if(p.url)URL.revokeObjectURL(p.url);p.url=URL.createObjectURL(result);p.download.href=p.url;p.download.download=p.id+'-2025.png';p.download.hidden=false;p.status.textContent='Kopieringen gick inte. Hämta samma bild som PNG.';}catch{p.status.textContent='Bilden kunde inte skapas. Försök igen.';}}
    finally{b.disabled=false;}
  }
  drawCharts();buildMap();
  const stages=[...document.querySelectorAll('.steg')],dots=$('punkter'),modal=$('metod');let active=0;
  stages.forEach((s,i)=>{const li=html('li');li.append(button('',()=>show(i)));li.firstChild.setAttribute('aria-label','Steg '+(i+1)+': '+s.getAttribute('aria-label'));dots.append(li);});
  function show(i,address=true){
    active=Math.max(0,Math.min(stages.length-1,i));stages.forEach((s,j)=>{s.classList.toggle('aktiv',j===active);s.inert=j!==active;s.setAttribute('aria-hidden',String(j!==active));});[...dots.querySelectorAll('button')].forEach((b,j)=>b.setAttribute('aria-current',String(j===active)));
    $('bakat').disabled=active===0;$('framat').disabled=active===stages.length-1;$('stegstatus').textContent='Kapitel 4 · '+(active+1)+' av '+stages.length;if(address)history.replaceState(null,'','#'+stages[active].id);drawCharts();window.scrollTo(0,0);
  }
  $('bakat').onclick=()=>show(active-1);$('framat').onclick=()=>show(active+1);$('oppna-metod').onclick=()=>modal.showModal();$('stang-metod').onclick=()=>modal.close();modal.addEventListener('close',()=>$('oppna-metod').focus());
  document.addEventListener('keydown',e=>{if(modal.open||e.target.closest('button,a,input,select,textarea,summary,[role="region"]'))return;if(['ArrowRight','PageDown'].includes(e.key)){show(active+1);e.preventDefault();}if(['ArrowLeft','PageUp'].includes(e.key)){show(active-1);e.preventDefault();}});
  let touch=null;document.addEventListener('touchstart',e=>{touch=!modal.open&&!e.target.closest('.k4,button,a,input,select,details')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});document.addEventListener('touchend',e=>{if(!touch||modal.open)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*2)show(active+(dx<0?1:-1));touch=null;},{passive:true});document.addEventListener('touchcancel',()=>touch=null,{passive:true});
  function fromHash(){const i=stages.findIndex(s=>'#'+s.id===location.hash);show(i<0?0:i,false);}window.addEventListener('hashchange',fromHash);window.addEventListener('resize',drawCharts);window.addEventListener('beforeprint',()=>{drawCharts();if(map.finish)map.finish();});fromHash();
})();
