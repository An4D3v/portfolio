// Mostra na página 404 o endereço que não existe (e o nome dele na aba).
(function () {
  var caminho = decodeURIComponent(location.pathname);
  document.getElementById('caminho').textContent = caminho;
  var nome = caminho.split('/').filter(Boolean).pop();
  if (nome) document.getElementById('aba-nome').textContent = nome;
})();
