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

// Idioma: ?lang= no endereço > escolha salva > idioma do navegador (pt → português, o resto → inglês).
(function () {
  var idioma = null;
  try {
    var pedido = new URLSearchParams(location.search).get('lang');
    if (pedido === 'en' || pedido === 'pt') {
      idioma = pedido;
      localStorage.setItem('ana-idioma', pedido);
    } else {
      idioma = localStorage.getItem('ana-idioma');
    }
  } catch (e) { /* armazenamento bloqueado: decide pelo navegador */ }
  if (idioma !== 'en' && idioma !== 'pt') idioma = /^pt\b/i.test(navigator.language || '') ? 'pt' : 'en';
  document.documentElement.setAttribute('data-idioma', idioma);
  document.documentElement.setAttribute('lang', idioma === 'en' ? 'en' : 'pt-BR');
  // app instalado (PWA) com nome, descrição e atalhos no mesmo idioma
  var manifesto = document.querySelector('link[rel="manifest"]');
  if (manifesto && idioma === 'en') manifesto.setAttribute('href', 'manifest-en.webmanifest');
})();
