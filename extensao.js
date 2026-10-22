/* ==========================================================================
   Aba "Extension: Ana Neves" — comportamento
   Script clássico (não módulo). Define window.iniciarExtensao(raiz):
   - liga as abas internas (DETALHES · RECURSOS · CHANGELOG) no padrão
     tablist do WAI-ARIA: roving tabindex, ←/→ (com volta), Home/End;
   - anima a contagem dos números uma vez por carregamento da página
     (se a aba for recriada depois, mostra o valor final direto; com
     prefers-reduced-motion, sempre o valor final).
   data-abrir / data-acao / data-copiar NÃO são tratados aqui (delegação
   global do site).
   ========================================================================== */
(function () {
  'use strict';

  var DURACAO_MS = 1100;
  var contagemJaRodou = false; // uma animação por carregamento da página
  var instancias = 0;

  function lista(nodos) {
    return Array.prototype.slice.call(nodos || []);
  }

  function acharExt(raiz) {
    if (!raiz || typeof raiz !== 'object') return null;
    if (raiz.nodeType === 1 && raiz.classList && raiz.classList.contains('ext')) return raiz;
    if (typeof raiz.querySelector === 'function') return raiz.querySelector('.ext');
    return null;
  }

  function porId(ext, id) {
    if (!id) return null;
    var nodos = ext.querySelectorAll('[id]');
    for (var i = 0; i < nodos.length; i++) {
      if (nodos[i].id === id) return nodos[i];
    }
    return null;
  }

  /* Se a aba existir duas vezes no documento ao mesmo tempo, os ids das
     abas/painéis colidiriam (aria-controls/aria-labelledby). Nesse caso a
     instância nova ganha um sufixo e as referências são atualizadas. */
  function resolverIdsDuplicados(ext, sufixo) {
    var doc = ext.ownerDocument;
    if (!doc) return;
    var comId = lista(ext.querySelectorAll('[id]'));
    var conflito = comId.some(function (el) {
      var total = 0;
      var iguais = doc.querySelectorAll('[id]');
      for (var i = 0; i < iguais.length; i++) {
        if (iguais[i].id === el.id && iguais[i] !== el) total++;
      }
      return total > 0;
    });
    if (!conflito) return;

    var mapa = {};
    comId.forEach(function (el) {
      var novo = el.id + '-' + sufixo;
      mapa[el.id] = novo;
      el.id = novo;
    });
    ['aria-controls', 'aria-labelledby', 'aria-describedby', 'for'].forEach(function (attr) {
      lista(ext.querySelectorAll('[' + attr + ']')).forEach(function (el) {
        var valor = (el.getAttribute(attr) || '')
          .split(/\s+/)
          .map(function (token) { return mapa[token] || token; })
          .join(' ');
        el.setAttribute(attr, valor);
      });
    });
  }

  /* ---------- Abas internas ---------------------------------------------- */

  function ligarAbas(ext) {
    var tablist = ext.querySelector('[role="tablist"]');
    if (!tablist) return;
    var abas = lista(tablist.querySelectorAll('[role="tab"]'));
    if (!abas.length) return;

    function painelDe(aba) {
      return porId(ext, aba.getAttribute('aria-controls'));
    }

    // Se a página já rolou para além do topo do painel (barra de abas
    // grudada), traz o início do painel novo para logo abaixo da barra.
    function alinharPainel(painel) {
      if (!painel || typeof painel.scrollIntoView !== 'function') return;
      var barra = tablist.getBoundingClientRect();
      if (painel.getBoundingClientRect().top < barra.bottom - 1) {
        painel.scrollIntoView({ block: 'start' });
      }
    }

    function selecionar(aba, opcoes) {
      abas.forEach(function (a) {
        var ativa = a === aba;
        a.setAttribute('aria-selected', ativa ? 'true' : 'false');
        a.tabIndex = ativa ? 0 : -1;
        var painel = painelDe(a);
        if (painel) painel.hidden = !ativa;
      });
      if (opcoes && opcoes.focar) aba.focus();
      if (opcoes && opcoes.alinhar) alinharPainel(painelDe(aba));
    }

    function abaDoEvento(evento) {
      var alvo = evento.target;
      if (!alvo || typeof alvo.closest !== 'function') return null;
      var aba = alvo.closest('[role="tab"]');
      return abas.indexOf(aba) === -1 ? null : aba;
    }

    tablist.addEventListener('click', function (evento) {
      var aba = abaDoEvento(evento);
      if (aba) selecionar(aba, { alinhar: true });
    });

    tablist.addEventListener('keydown', function (evento) {
      if (evento.altKey || evento.ctrlKey || evento.metaKey) return;
      var aba = abaDoEvento(evento);
      if (!aba) return;
      var i = abas.indexOf(aba);
      var n = abas.length;
      var proxima = null;
      switch (evento.key) {
        case 'ArrowRight':
        case 'Right':
          proxima = abas[(i + 1) % n];
          break;
        case 'ArrowLeft':
        case 'Left':
          proxima = abas[(i - 1 + n) % n];
          break;
        case 'Home':
          proxima = abas[0];
          break;
        case 'End':
          proxima = abas[n - 1];
          break;
        default:
          return;
      }
      evento.preventDefault();
      selecionar(proxima, { focar: true, alinhar: true });
    });

    var inicial = abas.filter(function (a) {
      return a.getAttribute('aria-selected') === 'true';
    })[0] || abas[0];
    selecionar(inicial, null);
  }

  /* ---------- Contagem dos números --------------------------------------- */

  function prepararNumero(el) {
    var alvo = parseFloat(el.getAttribute('data-ext-alvo'));
    if (!isFinite(alvo)) return null;
    var casas = parseInt(el.getAttribute('data-ext-casas') || '0', 10);
    if (!isFinite(casas) || casas < 0) casas = 0;
    if (!el.hasAttribute('data-ext-final')) el.setAttribute('data-ext-final', el.textContent);
    return {
      el: el,
      alvo: alvo,
      casas: Math.min(casas, 3),
      antes: el.getAttribute('data-ext-antes') || '',
      depois: el.getAttribute('data-ext-depois') || '',
      final: el.getAttribute('data-ext-final')
    };
  }

  function formatar(item, valor) {
    var fixo = valor.toFixed(item.casas);
    var antes = Number(fixo) === 0 ? '' : item.antes;
    // vírgula decimal só na página em português (4,5M+); em inglês fica 4.5M+
    var decimal = document.documentElement.getAttribute('data-idioma') === 'en' ? fixo : fixo.replace('.', ',');
    return antes + decimal + item.depois;
  }

  function mostrarFinal(itens) {
    itens.forEach(function (item) { item.el.textContent = item.final; });
  }

  function animar(itens) {
    var inicio = null;
    function passo(agora) {
      if (inicio === null) inicio = agora;
      var p = Math.min(1, (agora - inicio) / DURACAO_MS);
      var suave = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      var algumVivo = false;
      itens.forEach(function (item) {
        if (item.el.isConnected === false) return;
        algumVivo = true;
        item.el.textContent = p >= 1 ? item.final : formatar(item, item.alvo * suave);
      });
      if (p < 1 && algumVivo) window.requestAnimationFrame(passo);
    }
    window.requestAnimationFrame(passo);
  }

  function prefereMenosMovimento() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  function ligarNumeros(ext) {
    var itens = lista(ext.querySelectorAll('[data-ext-contar]'))
      .map(prepararNumero)
      .filter(Boolean);
    if (!itens.length) return;

    var podeAnimar = !contagemJaRodou &&
      !prefereMenosMovimento() &&
      typeof window.IntersectionObserver === 'function' &&
      typeof window.requestAnimationFrame === 'function';

    if (!podeAnimar) {
      mostrarFinal(itens);
      return;
    }

    var grupo = ext.querySelector('.ext-numeros') || itens[0].el;
    try {
      var observador = new window.IntersectionObserver(function (entradas) {
        var visivel = entradas.some(function (entrada) { return entrada.isIntersecting; });
        if (!visivel) return;
        observador.disconnect();
        if (contagemJaRodou) {
          mostrarFinal(itens);
          return;
        }
        contagemJaRodou = true;
        animar(itens);
        // dispara assim que a linha dos números entra na tela (sem ficar
        // exibindo "0" parado na borda inferior)
      }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
      itens.forEach(function (item) { item.el.textContent = formatar(item, 0); });
      observador.observe(grupo);
    } catch (e) {
      mostrarFinal(itens);
    }
  }

  /* ---------- Entrada pública -------------------------------------------- */

  window.iniciarExtensao = function (raiz) {
    var ext = acharExt(raiz);
    if (!ext) return null;
    if (ext.getAttribute('data-ext-pronta') === '1') return ext; // idempotente
    ext.setAttribute('data-ext-pronta', '1');
    instancias += 1;
    try {
      resolverIdsDuplicados(ext, instancias);
      ligarAbas(ext);
      ligarNumeros(ext);
    } catch (erro) {
      if (window.console && typeof window.console.warn === 'function') {
        window.console.warn('[extensao] falha ao iniciar:', erro);
      }
    }
    return ext;
  };
})();
