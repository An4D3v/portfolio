// Carregado no <head>, antes do CSS pintar: evita piscar o tema padrão
// (Dark Modern) para quem escolheu outro na visita anterior.
(function () {
  var fundos = { dracula: '#282a36', 'light-modern': '#ffffff', hc: '#000000' };
  try {
    var t = localStorage.getItem('ana-tema');
    if (fundos[t]) {
      document.documentElement.setAttribute('data-tema', t);
      document.querySelector('meta[name="theme-color"]').setAttribute('content', fundos[t]);
    }
  } catch (e) { /* armazenamento bloqueado: fica o Dark Modern */ }
})();
