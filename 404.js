// Mostra na página 404 o endereço que não existe (e o nome dele na aba).
// O idioma segue a mesma regra do portfólio: ?lang= > escolha salva > idioma do navegador.
(function () {
  var idioma = null;
  try {
    idioma = new URLSearchParams(location.search).get('lang') || localStorage.getItem('ana-idioma');
  } catch (e) { /* armazenamento bloqueado: decide pelo navegador */ }
  if (idioma !== 'en' && idioma !== 'pt') idioma = /^pt\b/i.test(navigator.language || '') ? 'pt' : 'en';
  if (idioma === 'en') {
    document.documentElement.setAttribute('lang', 'en');
    Array.prototype.forEach.call(document.querySelectorAll('[data-en]'), function (n) {
      n.textContent = n.getAttribute('data-en');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-en-aria-label]'), function (n) {
      n.setAttribute('aria-label', n.getAttribute('data-en-aria-label'));
    });
  }

  var caminho = decodeURIComponent(location.pathname);
  document.getElementById('caminho').textContent = caminho;
  var nome = caminho.split('/').filter(Boolean).pop();
  if (nome) document.getElementById('aba-nome').textContent = nome;
})();
