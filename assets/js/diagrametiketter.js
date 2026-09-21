/* Direkta serienamn. Radbrytning och ledlinjer håller etiketter läsbara även när linjer möts. */
(function(){
 'use strict';
 window.RAPPORT_ETIKETTER=function(svg,items,{right,top,bottom,width}){
  const NS='http://www.w3.org/2000/svg',lineHeight=14,maxChars=Math.max(9,Math.floor((width-right-31)/6.5));
  function el(tag,attrs,text){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text!==undefined)e.textContent=text;return e;}
  const rows=items.map(s=>{
   const lines=[];let line='';for(const word of s.name.split(/\s+/)){if(line&&(line+' '+word).length>maxChars){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);
   return {...s,lines,h:Math.max(20,lines.length*lineHeight+6)};
  }).sort((a,b)=>a.y-b.y);
  rows.forEach((r,i)=>r.center=Math.max(r.y,i?rows[i-1].center+(rows[i-1].h+r.h)/2:top+r.h/2));
  for(let i=rows.length-1;i>=0;i--)rows[i].center=Math.min(rows[i].center,i===rows.length-1?bottom-rows[i].h/2:rows[i+1].center-(rows[i+1].h+rows[i].h)/2);
  rows.forEach(r=>{
   svg.append(el('path',{d:`M${right+5},${r.y} L${right+16},${r.center} H${right+22}`,fill:'none',stroke:r.color,'stroke-width':1.3}));
   const t=el('text',{x:right+27,y:r.center-(r.lines.length-1)*lineHeight/2+4,fill:'#1f1f1f','font-size':12,'font-weight':600,'font-family':'Open Sans, Arial, sans-serif','data-series-label':r.name});
   r.lines.forEach((line,i)=>t.append(el('tspan',{x:right+27,dy:i?lineHeight:0},line)));svg.append(t);
  });
 };
})();
