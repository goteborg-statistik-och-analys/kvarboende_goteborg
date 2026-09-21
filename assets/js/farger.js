/* Rapportens färgnyckel. Färg avser den dimension som diagrammet jämför. */
(function () {
  'use strict';
  const palette = {morkbla:'#3f5564',turkos:'#008391',gron:'#008767',gul:'#ffcd37',rosa:'#d53878',lila:'#674b99',rod:'#d24723',gra:'#d1d9dc',bla:'#0077bc'};
  const outcomes = {samma:'gron',inom:'gul',gr:'turkos',in_gr:'turkos',gr_in:'turkos',sverige:'lila',in_sverige:'lila',sverige_in:'lila',bort:'rosa',utvandrat:'rosa',in_utland:'rosa',invandrade:'rosa',fodda:'morkbla',nyfodda:'morkbla'};
  const ages = {'1-5':'turkos','6-9':'morkbla','10-15':'morkbla','16-18':'morkbla','19-24':'lila','25-29':'lila','30-44':'turkos','45-59':'morkbla','60-69':'gron','70-79':'gron','80-89':'gron','90+':'gron'};
  const symbols = {'1-5':0,'30-44':1,'19-24':0,'25-29':1,'6-9':0,'10-15':1,'16-18':2,'45-59':3,'60-69':0,'70-79':1,'80-89':2,'90+':3};
  // Fördjupning: fasta linjefärger skiljer åldrar inom varje livsfas.
  // Gruppmarkeringar och översikt använder fortfarande ages ovan.
  const ageLines = {'1-5':'turkos','30-44':'lila','19-24':'lila','25-29':'morkbla','6-9':'morkbla','10-15':'turkos','16-18':'lila','45-59':'gron','60-69':'gron','70-79':'morkbla','80-89':'lila','90+':'turkos'};
  window.RAPPORT_FARGER = {palette,outcomes,ages,ageLines,symbols};
  // Äldre exporter har presentationsfärger inbakade. Nyckeln styr visningen.
  for(const data of [window.DATA_FLODE,window.DATA_KAPITEL2]) {
    if(data) for(const row of [...(data.utflode||[]),...(data.inflode||[])]) if(outcomes[row.id]) row.farg=outcomes[row.id];
  }
  document.querySelectorAll('[data-farg]').forEach(el=>{
    const name=outcomes[el.dataset.farg]||el.dataset.farg;
    if(el.namespaceURI==='http://www.w3.org/2000/svg') el.setAttribute('fill',palette[name]);
    else el.style.backgroundColor=palette[name];
  });
})();
