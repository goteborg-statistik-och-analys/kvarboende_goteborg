/* Gemensam navigering. Kapitlens egna steg- och diagramfunktioner behålls. */
(function () {
  'use strict';
  const menu = document.querySelector('.kapitelmeny');
  const stages = [...document.querySelectorAll('.scen > .steg')];
  const forward = document.getElementById('framat');
  const next = document.querySelector('.nav__nasta');
  const count = document.querySelector('.nav__antal');
  if (!menu || !stages.length) return;
  const summary = menu.querySelector('summary');
  function closeMenu(focus = false) {
    menu.open = false;
    if (focus) summary.focus();
  }
  document.addEventListener('click', e => {
    if (!menu.contains(e.target)) closeMenu();
  });
  document.addEventListener('focusin', e => {
    if (!menu.contains(e.target)) closeMenu();
  });
  // Låt inte kapitlets piltangenter bläddra bakom en öppen kapitelmeny.
  document.addEventListener('keydown', e => {
    if (!menu.open) return;
    if (e.key === 'Escape') { closeMenu(true); e.preventDefault(); }
    if (['Escape', 'ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) e.stopImmediatePropagation();
  }, true);
  function update() {
    const i = stages.findIndex(s => s.classList.contains('aktiv'));
    const last = i === stages.length - 1;
    count.textContent = (i + 1) + ' / ' + stages.length;
    count.setAttribute('aria-label', 'Delsida ' + (i + 1) + ' av ' + stages.length);
    if (next) {
      const focused = document.activeElement;
      next.hidden = !last;
      forward.hidden = last;
      if (last && focused === forward) next.focus();
      else if (!last && focused === next) forward.focus();
    }
    document.querySelectorAll('#punkter button').forEach(b => b.title = b.getAttribute('aria-label') || 'Välj delsida');
  }
  const observer = new MutationObserver(update);
  stages.forEach(s => observer.observe(s, { attributes: true, attributeFilter: ['class'] }));
  update();
})();
