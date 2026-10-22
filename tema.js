// Carregado no <head>, antes do CSS pintar: evita piscar o tema padrão
// para quem escolheu outro na visita anterior.
(function () {
  try {
    var t = localStorage.getItem('ana-tema');
    if (t === 'dark-modern' || t === 'light-modern' || t === 'hc') document.documentElement.setAttribute('data-tema', t);
  } catch (e) { /* armazenamento bloqueado: fica o Dracula */ }
})();
