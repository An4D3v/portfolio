'use strict';

(() => {
  const d = document;
  const html = d.documentElement;
  const $ = (sel, raiz = d) => raiz.querySelector(sel);
  const $$ = (sel, raiz = d) => Array.from(raiz.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const escCod = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const ic = (nome, extra = '') => `<svg class="ic${extra ? ' ' + extra : ''}" aria-hidden="true" focusable="false"><use href="#i-${nome}"/></svg>`;
  const mq = {
    celular: matchMedia('(max-width: 760px)'),
    largo: matchMedia('(min-width: 1100px)'),
    calmo: matchMedia('(prefers-reduced-motion: reduce)'),
  };
  const guarda = {
    ler(k) { try { return localStorage.getItem(k); } catch { return null; } },
    gravar(k, v) { try { localStorage.setItem(k, v); } catch { /* navegação privada: segue sem lembrar */ } },
    lerSessao(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    gravarSessao(k, v) { try { sessionStorage.setItem(k, v); } catch { /* idem */ } },
  };
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const normPorChar = (s) => s.split('').map((c) => norm(c)[0] || c).join('');

  const CURVA = 'cubic-bezier(0.2, 0, 0, 1)';
  const CURVA_SAI = 'cubic-bezier(0.4, 0, 1, 1)';
  const semMovimento = () => mq.calmo.matches || typeof Element.prototype.animate !== 'function';

  // Roda `depois` uma única vez: no fim da animação ou, se a página não
  // estiver sendo pintada (aba em segundo plano), pelo relógio. Sem o relógio
  // o fechamento nunca terminaria e a interface ficaria no meio do caminho.
  function animar(alvo, quadros, opcoes, depois) {
    const anim = alvo.animate(quadros, opcoes);
    let feito = false;
    const concluir = () => {
      if (feito || anim.substituida) return;
      feito = true;
      if (depois) depois(anim);
    };
    anim.onfinish = concluir;
    setTimeout(concluir, opcoes.duration + 120);
    return anim;
  }

  // Anima a altura entre 0 e a natural. Ao fechar, segura o último quadro
  // (fill) até `depois` esconder o elemento, para não piscar aberto.
  function animarAltura(alvo, abrir, depois) {
    if (alvo.animacao) {
      alvo.animacao.substituida = true;
      alvo.animacao.cancel();
      alvo.animacao = null;
    }
    if (semMovimento()) {
      if (depois) depois();
      return;
    }
    const altura = alvo.offsetHeight;
    const quadros = [
      { height: '0px', opacity: 0, flexGrow: 0 },
      { height: `${altura}px`, opacity: 1, flexGrow: 0 },
    ];
    alvo.style.overflow = 'hidden';
    alvo.animacao = animar(alvo, abrir ? quadros : quadros.reverse(), {
      duration: abrir ? 200 : 150,
      easing: abrir ? CURVA : CURVA_SAI,
      fill: abrir ? 'none' : 'forwards',
    }, (anim) => {
      alvo.animacao = null;
      if (depois) depois();
      anim.cancel();
      alvo.style.overflow = '';
    });
  }

  function sairSuave(alvo, quadroFinal, depois) {
    if (semMovimento()) {
      depois();
      return;
    }
    animar(alvo, [{ opacity: 1, transform: 'none' }, { opacity: 0, ...quadroFinal }], { duration: 150, easing: CURVA_SAI, fill: 'forwards' }, depois);
  }

  /* ======================================================================
     Dados
     ====================================================================== */
  const EMAIL = 'ana-neves98@outlook.com';
  const GITHUB = 'https://github.com/An4D3v';
  const LINKEDIN = 'https://www.linkedin.com/in/anad3v/';
  const APPS = {
    rumo: 'https://rumo-amber.vercel.app',
    alien: 'https://financas-app-ruby.vercel.app',
    trevo: 'https://vale-do-trevo.vercel.app',
  };

  const TEMAS = {
    dracula: { nome: 'Dracula', fundo: '#282a36' },
    'dark-modern': { nome: 'Dark Modern', fundo: '#1f1f1f' },
    'light-modern': { nome: 'Light Modern', fundo: '#ffffff' },
    hc: { nome: 'Dark High Contrast', fundo: '#000000' },
  };

  const ARQUIVOS = {
    sobre: { nome: 'README.md', icone: 'f-markdown', ling: 'md', rotulo: 'Markdown', tpl: 'tpl-extensao', inicial: 'visual', extensao: true },
    projetos: { nome: 'projetos.tsx', icone: 'f-react-ts', ling: 'ts', rotulo: 'TypeScript JSX', tpl: 'tpl-projetos', inicial: 'visual' },
    experiencia: { nome: 'experiencia.cs', icone: 'f-csharp', ling: 'cs', rotulo: 'C#', tpl: 'tpl-experiencia', inicial: 'visual' },
    stack: { nome: 'stack.json', icone: 'f-json', ling: 'json', rotulo: 'JSON', tpl: 'tpl-stack', inicial: 'codigo' },
    contato: { nome: 'contato.ts', icone: 'f-typescript', ling: 'ts', rotulo: 'TypeScript', tpl: 'tpl-contato', inicial: 'visual' },
    pacote: { nome: 'package.json', icone: 'f-npm', ling: 'json', rotulo: 'JSON', inicial: 'codigo' },
    config: { nome: 'settings.json', pasta: '.vscode', icone: 'f-settings', ling: 'json', rotulo: 'JSON com Comentários', inicial: 'codigo' },
    atalhos: { nome: 'atalhos.md', icone: 'f-markdown', ling: 'md', rotulo: 'Markdown', inicial: 'codigo' },
    'img-mini': { nome: 'ana-64.webp', pasta: 'assets', icone: 'f-image', ling: 'img', rotulo: 'WebP · 64 × 64', imagem: 'assets/ana-64.webp', alt: 'Avatar pequeno da Ana em pixel art' },
    'img-acenando': { nome: 'ana-acenando.webp', pasta: 'assets', icone: 'f-image', ling: 'img', rotulo: 'WebP · 256 × 256', imagem: 'assets/ana-acenando.webp', alt: 'Ilustração em pixel art da Ana acenando' },
    'img-programando': { nome: 'ana-programando.webp', pasta: 'assets', icone: 'f-image', ling: 'img', rotulo: 'WebP animado · 256 × 256', imagem: 'assets/ana-programando.webp', parada: 'assets/ana-acenando.webp', alt: 'Ilustração em pixel art da Ana programando e acenando' },
  };
  const SECOES = ['sobre', 'projetos', 'experiencia', 'stack', 'contato'];
  const ORDEM_BUSCA = ['sobre', 'projetos', 'experiencia', 'stack', 'contato', 'pacote', 'config', 'atalhos'];
  const ARVORE = [
    { pasta: '.vscode', fechada: 'folder-vscode', aberta: 'folder-vscode-open', filhos: ['config'] },
    { pasta: 'assets', fechada: 'folder', aberta: 'folder-open', filhos: ['img-mini', 'img-acenando', 'img-programando'] },
    'contato', 'experiencia', 'pacote', 'projetos', 'sobre', 'stack',
  ];

  const FONTES = {
    sobre: () => `# Ana Neves

> **Backend, dados e IA em produção.**
> Software Developer com produtos próprios no ar · São Paulo, Brasil · [ana@dev](https://github.com/An4D3v)

Construo pipelines que movem milhões de registros, bots com IA que
respondem no Teams e apps que pessoas de verdade usam todo dia.
Gosto de sistema que se explica: idempotente, medido e com teste
que sabe falhar.

## Números

- **4,5M+** registros processados pelos pipelines que mantenho
- **70+** pessoas usando os apps que criei e opero
- **28** testes de integração num único take-home de microsserviços
- **−91%** de erros de cota de API com orquestração inteligente de cargas

## Produtos no ar

- **Rumo** — orientador de rotinas (PWA, 40+ usuários): https://rumo-amber.vercel.app
- **AlienFinanças** — finanças com leitura de nota fiscal por IA (20+ usuários): https://financas-app-ruby.vercel.app
- **Notas Fiscais** — microsserviços .NET, 28 testes: https://github.com/An4D3v/Korp_Teste_AnaNeves
- **Vale do Trevo** — jogo 2D em canvas puro: https://vale-do-trevo.vercel.app

## Abas deste editor

1. \`projetos.tsx\` — os produtos, com links
2. \`experiencia.cs\` — trajetória e bastidores
3. \`stack.json\` — com o que eu trabalho
4. \`contato.ts\` — vamos conversar?

[GitHub](https://github.com/An4D3v) · [LinkedIn](https://www.linkedin.com/in/anad3v/) · [E-mail](mailto:ana-neves98@outlook.com)

<!-- while (true) { learn(); build(); ship(); } -->`,

    projetos: () => `// projetos.tsx — criados, publicados e operados por mim, do banco ao deploy.

type Projeto = {
  nome: string;
  status: 'em produção' | 'código aberto' | 'jogável';
  resumo: string;
  usuarios?: string;
  testes?: number;
  stack: string[];
  links: Record<string, string>;
};

export const projetos: Projeto[] = [
  {
    nome: 'Rumo',
    status: 'em produção',
    resumo: 'Orientador de rotinas: Web Push, MFA (TOTP) e painel admin próprio.',
    usuarios: '40+',
    stack: ['React', 'TypeScript', 'Supabase', 'Vercel'],
    links: { app: 'https://rumo-amber.vercel.app' },
  },
  {
    nome: 'AlienFinanças',
    status: 'em produção',
    resumo: 'Finanças pessoais: a foto do cupom fiscal vira itens categorizados por IA.',
    usuarios: '20+',
    stack: ['React', 'TypeScript', 'Supabase', 'IA (LLM)'],
    links: { app: 'https://financas-app-ruby.vercel.app' },
  },
  {
    nome: 'Notas Fiscais — microsserviços',
    status: 'código aberto',
    resumo: 'Dois serviços .NET: UPDATE atômico, idempotência e recuperação de falha.',
    testes: 28,
    stack: ['C# / .NET 8', 'Angular', 'EF Core', 'SQL Server'],
    links: { codigo: 'https://github.com/An4D3v/Korp_Teste_AnaNeves' },
  },
  {
    nome: 'Vale do Trevo',
    status: 'jogável',
    resumo: 'Jogo 2D top-down em canvas puro, sem engine. Arte da minha amiga, código meu.',
    stack: ['TypeScript', 'Vite', 'Canvas'],
    links: {
      jogar: 'https://vale-do-trevo.vercel.app',
      codigo: 'https://github.com/An4D3v/vale-do-trevo',
    },
  },
];

export function Projetos() {
  return (
    <Grade>
      {projetos.map((p) => (
        <Cartao key={p.nome} {...p} />
      ))}
    </Grade>
  );
}`,

    experiencia: () => `// experiencia.cs — de coleta de dados a dona da plataforma.

namespace AnaNeves.Portfolio;

public record Etapa(string Onde, string Papel, string Resumo);
public record Entrega(string Nome, string Resultado);

public static class Experiencia
{
    public static readonly Etapa[] Trajetoria =
    {
        new("Escritório jurídico, São Paulo", "primeira e única dev",
            "Plataforma do zero: ERP jurídico, robôs de coleta e bots com IA."),
        new("Produtos próprios", "em paralelo",
            "Três apps no ar: PWA, Web Push, MFA, RLS, leitura de documento por IA."),
        new("Jusbrasil", "dados",
            "Coleta de dados em escala com crawlers."),
    };

    // código privado, resultados públicos
    public static readonly Entrega[] Bastidores =
    {
        new("Pipelines de integração", "7+ cargas incrementais · 4,5M+ registros · MERGE idempotente"),
        new("Orquestração de cargas", "−66% de chamadas à API · −91% de erros de cota"),
        new("Bots com IA no Teams", "SSO com Entra ID · Adaptive Cards · usuários reais"),
        new("Classificação com IA", "LLM em produção · acurácia medida contra gabarito humano"),
        new("Migração para Azure SQL", "~292 mil registros · zero divergência"),
        new("Automação & RPA", "Python + Selenium · −65% de esforço manual"),
    };

    public static string Mentoria => "oriento tecnicamente um estagiário";
}`,

    stack: () => `{
  "backend": ["C#", ".NET 8", "Python", "APIs REST", "OAuth2", "EF Core"],
  "cloud": [
    "Azure App Service", "Azure SQL", "Azure Automation",
    "Key Vault", "Application Insights", "Entra ID", "Microsoft Graph"
  ],
  "dados": ["SQL Server", "T-SQL", "PostgreSQL", "Supabase", "ETL incremental", "reconciliação"],
  "front": ["Angular", "React", "TypeScript", "Vite", "PWA"],
  "ia": ["LLMs em produção", "Bot Framework", "prompt engineering", "medição de acurácia"],
  "automacao": ["Python", "Selenium", "runbooks"],
  "devops": ["GitHub Actions", "OIDC", "CI/CD com gate de testes", "Vercel", "observabilidade"]
}`,

    contato: () => `// contato.ts — para falar de backend .NET, dados e IA aplicada.

export const contato = {
  email: 'ana-neves98@outlook.com',
  github: 'https://github.com/An4D3v',
  linkedin: 'https://www.linkedin.com/in/anad3v/',
  base: 'São Paulo, Brasil',
} as const;

export function conversar(): void {
  window.location.href = \`mailto:\${contato.email}\`;
}

// while (true) { learn(); build(); ship(); }`,

    pacote: () => `{
  "name": "portfolio-ana-neves",
  "version": "1.0.0",
  "description": "Portfólio em forma de editor de código.",
  "author": "Ana Neves <ana-neves98@outlook.com>",
  "homepage": "https://github.com/An4D3v",
  "scripts": {
    "dev": "learn",
    "build": "build",
    "deploy": "ship"
  },
  "dependencies": {},
  "devDependencies": {}
}`,

    config: () => `// .vscode/settings.json — as preferências deste editor
{
  "workbench.colorTheme": "${TEMAS[estado.tema].nome}",
  "workbench.iconTheme": "material-icon-theme",
  "editor.fontFamily": "Cascadia Code, Consolas, monospace",
  "editor.minimap.enabled": ${estado.minimapa},
  "editor.wordWrap": "${quebraAtiva() ? 'on' : 'off'}",
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "ana.foco": ["backend .NET", "dados", "IA aplicada"]
}`,

    atalhos: () => `# Atalhos de teclado

Funcionam como no VS Code. No Mac, troque \`Ctrl\` por \`Cmd\`.

- \`Ctrl+Shift+P\` ou \`F1\` — paleta de comandos
- \`Ctrl+P\` — abrir arquivo pelo nome
- \`Ctrl+J\` — mostrar ou esconder o terminal
- \`Ctrl+B\` — mostrar ou esconder o painel lateral
- \`Ctrl+Shift+E\` — explorador de arquivos
- \`Ctrl+Shift+F\` — pesquisar em todos os arquivos
- \`Ctrl+Shift+G\` — controle do código-fonte (repositórios e recado)
- \`Ctrl+Shift+X\` — extensões (a stack)
- \`Alt+1\` a \`Alt+5\` — ir direto para cada aba
- \`Alt+Z\` — quebra de linha no código
- \`F5\` — executar e depurar
- \`Esc\` — fecha paleta, menus e gaveta

## No terminal

- \`help\` lista os comandos
- \`Tab\` completa, \`↑\` e \`↓\` navegam no histórico, \`Esc\` sai do terminal`,
  };

  const DICAS = {
    projetos: {
      usuarios: 'Contas reais cadastradas no app.',
      testes: 'Testes de integração que rodam contra SQL Server real.',
    },
    experiencia: {
      Bastidores: 'Projetos do trabalho: o código é privado, por isso aparecem só os resultados.',
      Mentoria: 'Orientação técnica de um estagiário no dia a dia.',
    },
    contato: { conversar: 'Abre o seu cliente de e-mail já com o endereço da Ana.' },
    pacote: { dependencies: 'Zero dependências: este portfólio é HTML, CSS e JavaScript puros, sem framework.' },
    config: {
      'workbench.colorTheme': 'Dá para trocar pela paleta: Ctrl+Shift+P → Preferências: Tema de Cores.',
      'editor.minimap.enabled': 'O minimapa aparece no código em telas largas: clique ou arraste nele para rolar.',
      'terminal.integrated.defaultProfile.windows': 'O terminal deste portfólio imita um PowerShell: abra com Ctrl+J e digite help.',
    },
  };

  const REPOS = [
    { nome: 'Korp_Teste_AnaNeves', ling: 'C#', desc: 'Notas fiscais: microsserviços .NET + Angular' },
    { nome: 'vale-do-trevo', ling: 'TypeScript', desc: 'Jogo 2D em canvas puro' },
    { nome: 'image-collector', ling: 'Python', desc: 'Integração com Unsplash e Google Drive via OAuth 2.0' },
    { nome: 'An4D3v', ling: 'Markdown', desc: 'README do perfil no GitHub' },
  ];

  const EXTENSOES = [
    { sigla: 'C#', nome: 'C# / .NET 8', desc: 'Pipelines de integração, APIs e microsserviços.', busca: '"C#"' },
    { sigla: 'Az', nome: 'Azure', desc: 'App Service, Azure SQL, Automation, Key Vault, Application Insights.', busca: '"Azure App Service"' },
    { sigla: 'SQL', nome: 'SQL Server · T-SQL', desc: 'MERGE idempotente, watermark e reconciliação.', busca: '"SQL Server"' },
    { sigla: 'Py', nome: 'Python', desc: 'Robôs com Selenium e scripts de dados.', busca: '"Python"' },
    { sigla: 'IA', nome: 'LLMs em produção', desc: 'Classificador de publicações e leitura de nota fiscal.', busca: '"LLMs em produção"' },
    { sigla: 'ID', nome: 'Entra ID · Microsoft Graph', desc: 'SSO nos bots e autenticação sem senha.', busca: '"Entra ID"' },
    { sigla: 'Ng', nome: 'Angular', desc: 'Front do sistema de notas fiscais.', busca: '"Angular"' },
    { sigla: 'Re', nome: 'React + TypeScript', desc: 'Rumo e AlienFinanças.', busca: '"React"' },
    { sigla: 'SB', nome: 'Supabase · PostgreSQL', desc: 'Auth com MFA e Row Level Security nos apps próprios.', busca: '"Supabase"' },
    { sigla: 'GH', nome: 'GitHub Actions', desc: 'CI/CD com OIDC e gate de testes.', busca: '"GitHub Actions"' },
  ];

  const TITULOS_VISTA = {
    explorer: 'Explorador',
    busca: 'Pesquisar',
    scm: 'Controle do Código-Fonte',
    depurar: 'Executar e Depurar',
    extensoes: 'Extensões',
  };

  /* ======================================================================
     Estado e elementos
     ====================================================================== */
  const estado = {
    abertas: [...SECOES],
    ativa: 'sobre',
    modos: {},
    tema: TEMAS[html.dataset.tema] ? html.dataset.tema : 'dark-modern',
    minimapa: guarda.ler('ana-minimapa') !== 'off',
    quebra: null,
    vista: 'explorer',
    lateral: true,
    painel: false,
    painelAba: 'terminal',
    dividido: false,
    zen: false,
    pastas: { '.vscode': true, assets: true },
    historico: ['sobre'],
    posHist: 0,
    statusApps: {},
  };

  const el = {
    app: $('#app'),
    abas: $('#abas'),
    editor: $('#editor'),
    editorLado: $('#editor-lado'),
    grupoLado: $('#grupo-lado'),
    migalha: $('#migalha'),
    arvore: $('#arvore'),
    estrutura: $('#estrutura'),
    linhaTempo: $('#linha-tempo'),
    lateral: $('#lateral'),
    latTitulo: $('#lat-titulo'),
    area: $('#area'),
    minimapa: $('#minimapa'),
    mmConteudo: $('#mm-conteudo'),
    mmJanela: $('#mm-janela'),
    painel: $('#painel'),
    painelCorpo: $('#painel-corpo'),
    painelOutro: $('#painel-outro'),
    termSaida: $('#term-saida'),
    termIn: $('#term-in'),
    termForm: $('#term-form'),
    termCursor: $('.term-cursor'),
    termLista: $('#term-lista'),
    termChips: $('#term-chips'),
    stPos: $('#st-pos'),
    stLing: $('#st-ling'),
    stEsp: $('#st-esp'),
    stSino: $('#st-sino'),
    menu: $('#menu'),
    paleta: $('#paleta'),
    palIn: $('#pal-in'),
    palLista: $('#pal-lista'),
    dica: $('#dica'),
    notifs: $('#notificacoes'),
    fundo: $('#fundo'),
    btModo: $('#bt-modo'),
    btDividir: $('#bt-dividir'),
    menus: $('#menus'),
  };

  const quebraAtiva = () => (estado.quebra === null ? mq.celular.matches : estado.quebra);
  const caminho = (id) => {
    const a = ARQUIVOS[id];
    return (a.pasta ? a.pasta + '/' : '') + a.nome;
  };
  const fonte = (id) => FONTES[id]();
  const temVisual = (id = estado.ativa) => Boolean(id && ARQUIVOS[id].tpl);
  const modoDe = (id) => {
    if (ARQUIVOS[id].imagem) return 'imagem';
    if (!temVisual(id)) return 'codigo';
    if (estado.dividido) return 'codigo';
    return estado.modos[id] || ARQUIVOS[id].inicial;
  };
  function rotuloAba(id, modo = modoDe(id)) {
    const a = ARQUIVOS[id];
    const curto = mq.celular.matches;
    if (modo === 'visual' && a.extensao) return { icone: 'f-extension', texto: curto ? 'Ana Neves' : 'Extensão: Ana Neves', it: true };
    if (modo === 'visual' && !curto) return { icone: 'open-preview', texto: `Visualizar ${a.nome}` };
    return { icone: a.icone, texto: a.nome };
  }

  /* ======================================================================
     Realce de sintaxe (feito à mão, por linha)
     ====================================================================== */
  const PALAVRAS = {
    ts: new Set('as async await break case catch class const continue default else export extends false finally for from function if import in interface let new null of readonly return switch this throw true try type typeof undefined var void while'.split(' ')),
    cs: new Set('abstract as base bool break case catch class const continue default do else false finally for foreach get if in init int interface internal is namespace new null object out override private protected public readonly record return sealed set static string struct switch this throw true try using var void while'.split(' ')),
    json: new Set(['true', 'false', 'null']),
  };
  const CONTROLE = new Set(['return', 'if', 'else', 'for', 'foreach', 'while', 'break', 'continue', 'switch', 'case', 'throw', 'try', 'catch', 'finally', 'import', 'export', 'from', 'await', 'default']);
  const CONSTANTES = new Set(['true', 'false', 'null', 'undefined', 'this']);
  const PRIMITIVOS_TS = new Set(['string', 'number', 'boolean', 'void', 'Record', 'Promise']);
  const TIPOS_CS = new Set(['string', 'int', 'bool', 'var', 'object']);
  const DECLARA = { const: 'var', let: 'var', var: 'var', function: 'fn', class: 'tipo', record: 'tipo', type: 'tipo', interface: 'tipo', namespace: 'tipo' };
  const RE_LINK = /(https?:\/\/[^\s'"`<)\]]+)|(mailto:[^\s'"`<)\]${}]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

  const span = (cls, conteudo) => `<span class="${cls}">${conteudo}</span>`;
  const comDica = (conteudo, txt) => `<span class="hv" tabindex="0" data-dica="${esc(txt)}">${conteudo}</span>`;
  function linkar(t) {
    return t.replace(RE_LINK, (m, url, mailto, email) => {
      if (url) return `<a href="${url}" target="_blank" rel="noopener" tabindex="-1">${url}</a>`;
      return `<a href="${mailto || 'mailto:' + email}" tabindex="-1">${m}</a>`;
    });
  }

  function realcarC(linha, ling, dicas) {
    const kw = PALAVRAS[ling];
    const re = /(\/\/.*$)|(\/\*.*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;
    let saida = '';
    let anterior = '';
    let palavraAnterior = '';
    let emTag = false;
    const ind = linha.match(/^ +/);
    if (ind) {
      saida += `<span class="ind">${ind[0]}</span>`;
      re.lastIndex = ind[0].length;
    }
    let m;
    while ((m = re.exec(linha))) {
      const [tok, com, bloco, str, num, pal, esp] = m;
      const prox = linha.slice(re.lastIndex).match(/^\s*(\S)(\S)?/) || [];
      if (com || bloco) {
        saida += span('t-com', linkar(escCod(tok)));
        anterior = '/';
        palavraAnterior = '';
        continue;
      }
      if (str) {
        const chaveJson = ling === 'json' && prox[1] === ':';
        let h = span(chaveJson ? 't-chave' : 't-str', linkar(escCod(str)));
        const interno = str.slice(1, -1);
        if (dicas[interno]) h = comDica(h, dicas[interno]);
        saida += h;
        anterior = '"';
        palavraAnterior = '';
        continue;
      }
      if (num) {
        saida += span('t-num', tok);
        anterior = '0';
        continue;
      }
      if (pal) {
        const decl = DECLARA[palavraAnterior];
        let cls;
        if (ling === 'ts' && PRIMITIVOS_TS.has(pal)) cls = 't-tipo';
        else if (kw && kw.has(pal)) cls = CONSTANTES.has(pal) ? 't-const' : CONTROLE.has(pal) ? 't-ctl' : 't-key';
        else if (decl === 'tipo') cls = 't-tipo';
        else if (decl === 'fn' || prox[1] === '(') cls = 't-fn';
        else if (anterior === '<' || (anterior === '/' && saida.endsWith('&lt;/'))) { cls = 't-tag'; emTag = true; }
        else if (emTag && prox[1] === '=' && prox[2] !== '=') cls = 't-attr';
        else if (decl === 'var') cls = 't-var';
        else if (ling === 'cs' && TIPOS_CS.has(palavraAnterior)) cls = 't-var';
        else if (/^[A-Z]/.test(pal)) cls = (prox[1] === '=' && prox[2] !== '=') || prox[1] === ';' ? 't-prop' : 't-tipo';
        else if (anterior === '.' || (prox[1] === ':' && prox[2] !== ':') || (prox[1] === '?' && prox[2] === ':')) cls = 't-prop';
        else cls = 't-var';
        let h = span(cls, pal);
        if (dicas[pal]) h = comDica(h, dicas[pal]);
        saida += h;
        anterior = pal.slice(-1);
        palavraAnterior = pal;
        continue;
      }
      if (esp) {
        saida += tok;
        continue;
      }
      if (tok === '>') emTag = false;
      saida += escCod(tok);
      anterior = tok;
      palavraAnterior = '';
    }
    return saida;
  }

  function inlineMd(t) {
    const re = /(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
    let saida = '';
    let i = 0;
    let m;
    while ((m = re.exec(t))) {
      saida += linkar(escCod(t.slice(i, m.index)));
      if (m[1]) {
        saida += span('t-pont', '**') + span('t-neg', escCod(m[1].slice(2, -2))) + span('t-pont', '**');
      } else if (m[2]) {
        const nome = m[2].slice(1, -1);
        const id = Object.keys(ARQUIVOS).find((k) => ARQUIVOS[k].nome === nome);
        saida += id
          ? `<a class="t-mdc" href="#${id}" data-abrir="${id}" tabindex="-1">${escCod(m[2])}</a>`
          : span('t-mdc', escCod(m[2]));
      } else {
        const [, texto, url] = m[3].match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        saida += span('t-pont', '[') + span('t-tipo', escCod(texto)) + span('t-pont', '](') + linkar(escCod(url)) + span('t-pont', ')');
      }
      i = re.lastIndex;
    }
    return saida + linkar(escCod(t.slice(i)));
  }

  function realcarMd(linha) {
    if (/^#{1,6}\s/.test(linha)) return span('t-tit', escCod(linha));
    if (/^\s*<!--.*-->\s*$/.test(linha)) return span('t-com', escCod(linha));
    let m = linha.match(/^(\s*)(>)(\s?)(.*)$/);
    if (m) return m[1] + span('t-pont', '&gt;') + m[3] + span('t-cit', inlineMd(m[4]));
    m = linha.match(/^(\s*)([-*]|\d+\.)(\s+)(.*)$/);
    if (m) return m[1] + span('t-key', escCod(m[2])) + m[3] + inlineMd(m[4]);
    return inlineMd(linha);
  }

  const cacheCodigo = {};
  function htmlCodigo(id) {
    if (cacheCodigo[id] && id !== 'config') return cacheCodigo[id];
    const a = ARQUIVOS[id];
    const dicas = DICAS[id] || {};
    const corpo = fonte(id).split('\n').map((l, i) => {
      const conteudo = a.ling === 'md' ? realcarMd(l) : realcarC(l, a.ling, dicas);
      return `<div class="ln" data-n="${i + 1}"><span class="ln-t">${conteudo}</span></div>`;
    }).join('');
    const h = `<div class="codigo" data-ling="${a.ling}">${corpo}</div>`;
    if (id !== 'config') cacheCodigo[id] = h;
    return h;
  }

  /* ======================================================================
     Renderização
     ====================================================================== */
  function render() {
    renderAbas();
    renderEditor();
    marcarArvore();
    renderMigalha();
    renderStatus();
    atualizarTitulo();
    atualizarNavegacao();
  }

  let assinaturaAbas = '';
  let idsAbas = [];
  function renderAbas() {
    const focoNasAbas = el.abas.contains(d.activeElement);
    const assinatura = estado.abertas.map((id) => `${id}:${rotuloAba(id).texto}`).join('|');
    if (assinatura !== assinaturaAbas) {
      el.abas.innerHTML = estado.abertas.map((id) => {
        const r = rotuloAba(id);
        const nova = idsAbas.length && !idsAbas.includes(id);
        return `<div class="aba${nova ? ' nova' : ''}" data-id="${id}" draggable="true">`
          + `<button class="aba-bt" type="button" data-id="${id}" title="${esc(caminho(id))}">${ic(r.icone)}<span class="rot${r.it ? ' it' : ''}">${esc(r.texto)}</span></button>`
          + `<button class="aba-x" type="button" data-fechar="${id}" aria-label="Fechar ${esc(r.texto)}" title="Fechar"><span>${ic('close')}</span></button></div>`;
      }).join('');
      $$('.aba', el.abas).forEach((a, i) => a.style.setProperty('--i', i));
      assinaturaAbas = assinatura;
      idsAbas = [...estado.abertas];
    }
    $$('.aba', el.abas).forEach((a) => {
      const on = a.dataset.id === estado.ativa;
      a.classList.toggle('ativa', on);
      const bt = $('.aba-bt', a);
      if (on) bt.setAttribute('aria-current', 'page');
      else bt.removeAttribute('aria-current');
    });
    const ativa = $('.aba.ativa', el.abas);
    if (ativa) {
      const ini = ativa.offsetLeft;
      const fim = ini + ativa.offsetWidth;
      if (ini < el.abas.scrollLeft) el.abas.scrollLeft = ini;
      else if (fim > el.abas.scrollLeft + el.abas.clientWidth) el.abas.scrollLeft = fim - el.abas.clientWidth;
      if (focoNasAbas) $('.aba-bt', ativa).focus();
    }
    atualizarBordaAbas();
  }

  function preencher(painel, id, modo) {
    const a = ARQUIVOS[id];
    if (modo === 'visual') {
      const tpl = d.getElementById(a.tpl);
      painel.replaceChildren(tpl.content.cloneNode(true));
      painel.classList.remove('quebra');
    } else if (modo === 'imagem') {
      const src = mq.calmo.matches && a.parada ? a.parada : a.imagem;
      painel.innerHTML = `<div class="visor"><img src="${src}" alt="${esc(a.alt)}" title="Clique para ampliar"></div>`;
      painel.classList.remove('quebra');
    } else {
      painel.innerHTML = htmlCodigo(id);
      painel.classList.toggle('quebra', quebraAtiva());
    }
    painel.dataset.modo = modo;
    painel.scrollTop = 0;
    painel.scrollLeft = 0;
    if (modo === 'visual') aoMostrarVisual(id, painel);
  }

  // Fechar ou reordenar outra aba não pode recriar o conteúdo aberto: a
  // página da extensão refaria o fade de entrada e recarregaria o avatar.
  let conteudoNaTela = '';
  function renderEditor({ forcar = false } = {}) {
    const id = estado.ativa;
    const chave = id ? `${id}|${modoDe(id)}|${estado.dividido}` : 'vazio';
    if (!forcar && chave === conteudoNaTela) return;
    conteudoNaTela = chave;
    esconderDica();
    if (!id) {
      renderVazio();
      return;
    }
    const a = ARQUIVOS[id];
    const modo = modoDe(id);
    preencher(el.editor, id, modo);
    el.editor.setAttribute('aria-label', `Editor: ${rotuloAba(id, modo).texto}`);

    const lado = estado.dividido && temVisual(id);
    el.grupoLado.hidden = !lado;
    if (lado) preencher(el.editorLado, id, 'visual');

    el.btModo.hidden = !a.tpl;
    el.btModo.setAttribute('aria-disabled', String(estado.dividido));
    const vendoCodigo = modo === 'codigo';
    el.btModo.innerHTML = ic(vendoCodigo ? 'open-preview' : 'go-to-file');
    el.btModo.setAttribute('aria-label', vendoCodigo ? 'Abrir visualização' : 'Mostrar código-fonte');
    el.btModo.title = vendoCodigo ? 'Abrir Visualização' : 'Mostrar Código-Fonte';
    el.btDividir.hidden = false;
    el.btDividir.setAttribute('aria-disabled', String(!temVisual(id)));
    el.btDividir.setAttribute('aria-pressed', String(lado));
    el.btDividir.title = temVisual(id) ? 'Abrir Visualização ao Lado' : 'Este arquivo não tem visualização';
    marcarLinha(1, 1);
    if (modo === 'imagem') el.stPos.textContent = '';
    atualizarMinimapa();
    renderEstrutura();
  }

  function renderVazio() {
    el.editor.dataset.modo = 'vazio';
    el.editor.setAttribute('aria-label', 'Editor vazio');
    el.grupoLado.hidden = true;
    el.minimapa.hidden = true;
    el.btModo.hidden = true;
    el.btDividir.hidden = true;
    el.editor.innerHTML = `<div class="vazio">
      <svg class="vazio-logo" viewBox="-70 -70 140 140" aria-hidden="true"><path d="M0 -10L0 -62M-12 -26L0 -38L12 -26M-7 -49L0 -56L7 -49M8.66 -5L53.69 -31M16.52 -23.39L32.91 -19L28.52 -2.61M38.94 -30.56L48.5 -28L45.94 -18.44M8.66 5L53.69 31M28.52 2.61L32.91 19L16.52 23.39M45.94 18.44L48.5 28L38.94 30.56M0 10L0 62M12 26L0 38L-12 26M7 49L0 56L-7 49M-8.66 5L-53.69 31M-16.52 23.39L-32.91 19L-28.52 2.61M-38.94 30.56L-48.5 28L-45.94 18.44M-8.66 -5L-53.69 -31M-28.52 -2.61L-32.91 -19L-16.52 -23.39M-45.94 -18.44L-48.5 -28L-38.94 -30.56" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle r="6" fill="currentColor"/></svg>
      <dl>
        <dt>Mostrar Todos os Comandos</dt><dd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></dd>
        <dt>Ir para o Arquivo</dt><dd><kbd>Ctrl</kbd>+<kbd>P</kbd></dd>
        <dt>Alternar Terminal</dt><dd><kbd>Ctrl</kbd>+<kbd>J</kbd></dd>
      </dl>
      <button class="botao" type="button" data-acao="reabrir">Reabrir as abas</button>
    </div>`;
    el.estrutura.innerHTML = '';
  }

  function renderArvore() {
    const item = (id, nivel) => {
      const a = ARQUIVOS[id];
      return `<li><button class="arvore-item n${nivel}" type="button" data-abrir="${id}" title="${esc(caminho(id))}">`
        + `<span class="sem-gira"></span>${ic(a.icone)}<span class="nome">${esc(a.nome)}</span></button></li>`;
    };
    el.arvore.innerHTML = ARVORE.map((n) => {
      if (typeof n === 'string') return item(n, 0);
      const aberta = Boolean(estado.pastas[n.pasta]);
      return `<li><button class="arvore-item n0" type="button" data-pasta="${esc(n.pasta)}" aria-expanded="${aberta}" title="${esc(n.pasta)}">`
        + `<span class="gira">${ic('chevron-right', 'seta')}</span><span class="icone-pasta">${ic(aberta ? n.aberta : n.fechada)}</span><span class="nome">${esc(n.pasta)}</span></button>`
        + `<ul class="arvore filhos p0"${aberta ? '' : ' hidden'}>${n.filhos.map((f) => item(f, 1)).join('')}</ul>`
        + '</li>';
    }).join('');
    $$(':scope > li', el.arvore).forEach((li, i) => li.style.setProperty('--i', i));
    marcarArvore();
  }

  function marcarArvore() {
    $$('[data-abrir]', el.arvore).forEach((b) => {
      const atual = b.dataset.abrir === estado.ativa;
      b.classList.toggle('atual', atual);
      if (atual) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
    $$('.filhos', el.arvore).forEach((ul) => ul.classList.toggle('tem-atual', Boolean($('.atual', ul))));
  }

  function alternarPasta(bt) {
    const nome = bt.dataset.pasta;
    const abrir = !estado.pastas[nome];
    estado.pastas[nome] = abrir;
    bt.setAttribute('aria-expanded', String(abrir));
    const no = ARVORE.find((n) => n.pasta === nome);
    $('.icone-pasta use', bt).setAttribute('href', `#i-${abrir ? no.aberta : no.fechada}`);
    const filhos = bt.nextElementSibling;
    if (abrir) {
      filhos.hidden = false;
      animarAltura(filhos, true);
    } else {
      animarAltura(filhos, false, () => { filhos.hidden = true; });
    }
  }

  function alternarSecao(sec, abrir) {
    const cab = $('.secao-cab', sec);
    const corpo = $('.secao-corpo', sec);
    cab.setAttribute('aria-expanded', String(abrir));
    if (abrir) sec.classList.add('aberta');
    animarAltura(corpo, abrir, () => {
      sec.classList.remove('animando');
      if (!abrir) sec.classList.remove('aberta');
    });
    if (corpo.animacao) sec.classList.add('animando');
  }

  function renderMigalha() {
    const id = estado.ativa;
    if (!id) {
      el.migalha.innerHTML = '';
      return;
    }
    const a = ARQUIVOS[id];
    const partes = ['portfolio-ana-neves'];
    if (a.pasta) partes.push(a.pasta);
    el.migalha.innerHTML = partes.map((p) => `<span>${esc(p)}</span>${ic('chevron-right', 'sep')}`).join('')
      + `${ic(a.icone)}<span class="atual">${esc(a.nome)}</span>`;
  }

  function renderStatus() {
    const id = estado.ativa;
    el.stLing.textContent = id ? ARQUIVOS[id].rotulo : '';
    el.stEsp.textContent = `Espaços: ${id && ARQUIVOS[id].ling === 'cs' ? 4 : 2}`;
    el.app.classList.toggle('vendo-imagem', Boolean(id && ARQUIVOS[id].imagem));
  }

  function atualizarTitulo() {
    const id = estado.ativa;
    d.title = id ? `${rotuloAba(id).texto} — Ana Neves · Software Developer` : 'Ana Neves · Software Developer';
    if (id && location.hash.slice(1) !== id) {
      try { history.replaceState(null, '', '#' + id); } catch { /* file:// em alguns navegadores */ }
    }
  }

  function atualizarNavegacao() {
    $('#bt-voltar').setAttribute('aria-disabled', String(estado.posHist <= 0));
    $('#bt-avancar').setAttribute('aria-disabled', String(estado.posHist >= estado.historico.length - 1));
  }

  /* ---------- outline e linha do tempo ---------- */
  const RE_SIMBOLO = {
    md: /^(#{1,6})\s+(.*)$/,
    ts: /^(?:export\s+)?(?:const|function|type)\s+(\w+)/,
    cs: /^\s*(?:public\s+)?(?:static\s+)?(?:readonly\s+)?(?:record|class|namespace|string|[A-Z]\w*\[\])\s+([\w.]+)/,
    json: /^ {2}"([\w.]+)"\s*:/,
  };
  function renderEstrutura() {
    const id = estado.ativa;
    if (!id) return;
    let itens = [];
    if (el.editor.dataset.modo === 'visual') {
      itens = $$('h1, h2', el.editor)
        .filter((h) => h.offsetParent !== null && h.textContent.trim())
        .map((h, i) => ({ nome: h.textContent.trim(), alvo: `h:${i}`, sub: h.tagName === 'H2' }));
    } else if (RE_SIMBOLO[ARQUIVOS[id].ling]) {
      const re = RE_SIMBOLO[ARQUIVOS[id].ling];
      fonte(id).split('\n').forEach((l, i) => {
        const m = l.match(re);
        if (m) itens.push({ nome: (m[2] || m[1]).replace(/^#+\s*/, ''), alvo: `l:${i + 1}`, sub: /^##/.test(l) });
      });
    }
    el.estrutura.innerHTML = itens.length
      ? itens.map((it) => `<li><button class="arvore-item ${it.sub ? 'n1' : 'n0'}" type="button" data-simbolo="${it.alvo}"><span class="sem-gira"></span>${ic('list-tree')}<span class="nome">${esc(it.nome)}</span></button></li>`).join('')
      : '<li><p class="vazio-msg">Nenhum símbolo neste arquivo.</p></li>';
  }
  el.estrutura.addEventListener('click', (e) => {
    const b = e.target.closest('[data-simbolo]');
    if (!b) return;
    const [tipo, valor] = b.dataset.simbolo.split(':');
    if (tipo === 'l') irParaLinha(+valor, 1);
    else {
      const alvo = $$('h1, h2', el.editor).filter((h) => h.offsetParent !== null && h.textContent.trim())[+valor];
      if (alvo) rolarAte(el.editor, alvo);
    }
  });
  el.linhaTempo.innerHTML = '<li><p class="vazio-msg">A linha do tempo da Ana está em <button class="link-bt" type="button" data-abrir="experiencia">experiencia.cs</button>.</p></li>';

  function rolarAte(conteiner, alvo) {
    const topo = alvo.getBoundingClientRect().top - conteiner.getBoundingClientRect().top + conteiner.scrollTop - 12;
    conteiner.scrollTo({ top: topo, behavior: mq.calmo.matches ? 'auto' : 'smooth' });
  }

  /* ======================================================================
     Abas: abrir, fechar, alternar
     ====================================================================== */
  function abrir(id, { modo, linha, coluna, historico = true } = {}) {
    if (!ARQUIVOS[id]) return;
    if (!estado.abertas.includes(id)) estado.abertas.push(id);
    if (modo) {
      if (modo === 'codigo' && estado.dividido) estado.dividido = false;
      estado.modos[id] = modo;
    }
    const mudou = estado.ativa !== id;
    estado.ativa = id;
    if (historico && mudou) {
      estado.historico = estado.historico.slice(0, estado.posHist + 1);
      estado.historico.push(id);
      estado.posHist = estado.historico.length - 1;
    }
    render();
    if (linha) irParaLinha(linha, coluna || 1);
    if (mudou) registrar(`aba aberta: ${caminho(id)}`);
    if (mq.celular.matches) fecharGaveta();
  }

  function fecharAba(id) {
    const i = estado.abertas.indexOf(id);
    if (i < 0) return;
    estado.abertas.splice(i, 1);
    if (estado.ativa === id) estado.ativa = estado.abertas[Math.min(i, estado.abertas.length - 1)] || null;
    render();
  }

  function reabrirTodas() {
    SECOES.forEach((id) => { if (!estado.abertas.includes(id)) estado.abertas.push(id); });
    if (!estado.ativa) estado.ativa = 'sobre';
    render();
  }

  function fecharOutras() {
    if (!estado.ativa) return;
    estado.abertas = [estado.ativa];
    render();
  }

  function fecharTodas() {
    estado.abertas = [];
    estado.ativa = null;
    render();
  }

  function alternarModo() {
    const id = estado.ativa;
    if (!temVisual(id) || estado.dividido) return;
    estado.modos[id] = modoDe(id) === 'visual' ? 'codigo' : 'visual';
    render();
  }

  function alternarDivisao() {
    if (!temVisual()) return;
    estado.dividido = !estado.dividido;
    render();
  }

  function navegar(passo) {
    const alvo = estado.posHist + passo;
    if (alvo < 0 || alvo >= estado.historico.length) return;
    estado.posHist = alvo;
    abrir(estado.historico[alvo], { historico: false });
  }

  function fecharAbaSuave(aba, voltarFoco) {
    const fim = () => {
      fecharAba(aba.dataset.id);
      if (voltarFoco) ($('.aba.ativa .aba-bt', el.abas) || el.editor).focus();
    };
    if (semMovimento() || aba.classList.contains('saindo')) {
      fim();
      return;
    }
    aba.classList.add('saindo');
    aba.style.overflow = 'hidden';
    animar(aba, [{ width: `${aba.offsetWidth}px`, opacity: 1 }, { width: '0px', opacity: 0 }], { duration: 150, easing: CURVA_SAI, fill: 'forwards' }, fim);
  }

  el.abas.addEventListener('click', (e) => {
    const x = e.target.closest('[data-fechar]');
    if (x) {
      fecharAbaSuave(x.closest('.aba'), el.abas.contains(d.activeElement));
      return;
    }
    const b = e.target.closest('.aba-bt');
    if (b) abrir(b.dataset.id);
  });
  el.abas.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return;
    const a = e.target.closest('.aba');
    if (a) {
      e.preventDefault();
      fecharAbaSuave(a, false);
    }
  });
  el.abas.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const bts = $$('.aba-bt', el.abas);
    const i = bts.indexOf(d.activeElement);
    if (i < 0) return;
    e.preventDefault();
    bts[(i + (e.key === 'ArrowRight' ? 1 : -1) + bts.length) % bts.length].focus();
  });
  el.abas.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    el.abas.scrollLeft += e.deltaY;
    e.preventDefault();
  }, { passive: false });

  let arrastada = null;
  el.abas.addEventListener('dragstart', (e) => {
    const a = e.target.closest('.aba');
    if (!a) return;
    arrastada = a.dataset.id;
    a.classList.add('arrastando');
    try {
      e.dataTransfer.setData('text/plain', arrastada);
      e.dataTransfer.effectAllowed = 'move';
    } catch { /* alguns navegadores bloqueiam setData */ }
  });
  el.abas.addEventListener('dragover', (e) => {
    const a = e.target.closest('.aba');
    if (!a || !arrastada || a.dataset.id === arrastada) return;
    e.preventDefault();
    $$('.aba.alvo', el.abas).forEach((x) => x.classList.remove('alvo'));
    a.classList.add('alvo');
  });
  el.abas.addEventListener('drop', (e) => {
    const a = e.target.closest('.aba');
    if (!a || !arrastada) return;
    e.preventDefault();
    const de = estado.abertas.indexOf(arrastada);
    estado.abertas.splice(de, 1);
    const para = estado.abertas.indexOf(a.dataset.id);
    estado.abertas.splice(de <= para ? para + 1 : para, 0, arrastada);
    arrastada = null;
    renderAbas();
  });
  el.abas.addEventListener('dragend', () => {
    arrastada = null;
    $$('.aba', el.abas).forEach((a) => a.classList.remove('arrastando', 'alvo'));
    renderAbas();
  });

  function atualizarBordaAbas() {
    el.abas.classList.toggle('tem-mais', el.abas.scrollLeft + el.abas.clientWidth < el.abas.scrollWidth - 4);
  }
  el.abas.addEventListener('scroll', atualizarBordaAbas, { passive: true });

  /* ---------- gestos no celular ---------- */
  function rolaNaHorizontal(no, limite) {
    for (let n = no; n && n !== limite; n = n.parentElement) {
      if (n.scrollWidth > n.clientWidth + 2) {
        const ox = getComputedStyle(n).overflowX;
        if (ox === 'auto' || ox === 'scroll') return true;
      }
    }
    return false;
  }
  function deslizarConteudo(sentido, quadros) {
    const alvo = el.editor.firstElementChild;
    if (!alvo || semMovimento()) return;
    alvo.animate(quadros || [
      { transform: `translateX(${sentido * 48}px)`, opacity: 0 },
      { transform: 'none', opacity: 1 },
    ], { duration: 240, easing: CURVA });
  }

  const toque = { ativo: false, x: 0, y: 0, t: 0 };
  const grupos = $('.grupos');
  grupos.addEventListener('touchstart', (e) => {
    toque.ativo = e.touches.length === 1 && !rolaNaHorizontal(e.target, grupos);
    if (!toque.ativo) return;
    toque.x = e.touches[0].clientX;
    toque.y = e.touches[0].clientY;
    toque.t = Date.now();
  }, { passive: true });
  grupos.addEventListener('touchend', (e) => {
    if (!toque.ativo) return;
    toque.ativo = false;
    const dx = e.changedTouches[0].clientX - toque.x;
    const dy = e.changedTouches[0].clientY - toque.y;
    if (Date.now() - toque.t > 650 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.55) return;
    if (String(getSelection())) return;
    const sentido = dx < 0 ? 1 : -1;
    const i = estado.abertas.indexOf(estado.ativa);
    const j = i + sentido;
    if (i < 0 || j < 0 || j >= estado.abertas.length) {
      deslizarConteudo(sentido, [{ transform: 'none' }, { transform: `translateX(${-sentido * 16}px)` }, { transform: 'none' }]);
      return;
    }
    abrir(estado.abertas[j]);
    deslizarConteudo(sentido);
  }, { passive: true });

  const toqueGaveta = { x: 0, y: 0 };
  el.lateral.addEventListener('touchstart', (e) => {
    toqueGaveta.x = e.touches[0].clientX;
    toqueGaveta.y = e.touches[0].clientY;
  }, { passive: true });
  el.lateral.addEventListener('touchend', (e) => {
    if (!el.app.classList.contains('gaveta')) return;
    const dx = e.changedTouches[0].clientX - toqueGaveta.x;
    const dy = e.changedTouches[0].clientY - toqueGaveta.y;
    if (dx < -60 && Math.abs(dy) < Math.abs(dx) * 0.6) fecharGaveta();
  }, { passive: true });

  el.btModo.addEventListener('click', alternarModo);
  el.btDividir.addEventListener('click', alternarDivisao);
  $('#bt-voltar').addEventListener('click', () => navegar(-1));
  $('#bt-avancar').addEventListener('click', () => navegar(1));
  $('#bt-logo').addEventListener('click', () => {
    abrir('sobre', { modo: 'visual' });
    el.editor.scrollTo({ top: 0, behavior: mq.calmo.matches ? 'auto' : 'smooth' });
  });

  /* ======================================================================
     Editor: linha atual, dicas, minimapa, quebra
     ====================================================================== */
  function marcarLinha(n, col = 1, ln) {
    $$('.ln.atual', el.editor).forEach((x) => x.classList.remove('atual'));
    const alvo = ln || $(`.ln[data-n="${n}"]`, el.editor);
    if (alvo && el.editor.dataset.modo === 'codigo') alvo.classList.add('atual');
    el.stPos.textContent = `Ln ${n}, Col ${col}`;
    estado.linha = n;
  }

  function irParaLinha(n, col = 1) {
    const ln = $(`.ln[data-n="${n}"]`, el.editor);
    if (!ln) return;
    marcarLinha(n, col, ln);
    el.editor.scrollTop = Math.max(0, ln.offsetTop - el.editor.clientHeight / 3);
    ln.classList.remove('brilho');
    void ln.offsetWidth;
    ln.classList.add('brilho');
  }

  el.editor.addEventListener('click', (e) => {
    const foto = e.target.closest('.visor img');
    if (foto) {
      const ampliada = foto.parentElement.classList.toggle('zoom');
      foto.title = ampliada ? 'Clique para reduzir' : 'Clique para ampliar';
      return;
    }
    const ln = e.target.closest('.ln');
    if (!ln || el.editor.dataset.modo !== 'codigo') return;
    let col = 1;
    const sel = getSelection();
    const texto = $('.ln-t', ln);
    if (sel && sel.rangeCount && sel.isCollapsed && texto.contains(sel.anchorNode)) {
      const r = d.createRange();
      r.setStart(texto, 0);
      r.setEnd(sel.anchorNode, sel.anchorOffset);
      col = r.toString().length + 1;
    }
    marcarLinha(+ln.dataset.n, col, ln);
  });

  el.editor.addEventListener('keydown', (e) => {
    if (el.editor.dataset.modo !== 'codigo' || e.target !== el.editor) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const total = $$('.ln', el.editor).length;
    const n = Math.min(total, Math.max(1, (estado.linha || 1) + (e.key === 'ArrowDown' ? 1 : -1)));
    e.preventDefault();
    const ln = $(`.ln[data-n="${n}"]`, el.editor);
    marcarLinha(n, 1, ln);
    const topo = ln.offsetTop;
    if (topo < el.editor.scrollTop + 19) el.editor.scrollTop = topo - 19;
    else if (topo + 38 > el.editor.scrollTop + el.editor.clientHeight) el.editor.scrollTop = topo + 38 - el.editor.clientHeight;
  });

  function mostrarDica(alvo) {
    el.dica.textContent = alvo.dataset.dica;
    el.dica.hidden = false;
    alvo.setAttribute('aria-describedby', 'dica');
    const r = alvo.getBoundingClientRect();
    const dr = el.dica.getBoundingClientRect();
    let topo = r.top - dr.height - 6;
    if (topo < 40) topo = r.bottom + 6;
    const esq = Math.min(Math.max(8, r.left), innerWidth - dr.width - 8);
    el.dica.style.top = `${topo}px`;
    el.dica.style.left = `${esq}px`;
  }
  function esconderDica() {
    el.dica.hidden = true;
    $$('[aria-describedby="dica"]').forEach((x) => x.removeAttribute('aria-describedby'));
  }
  d.addEventListener('pointerover', (e) => {
    const h = e.target.closest && e.target.closest('.hv');
    if (h) mostrarDica(h);
  });
  d.addEventListener('pointerout', (e) => {
    if (e.target.closest && e.target.closest('.hv')) esconderDica();
  });
  d.addEventListener('focusin', (e) => {
    if (e.target.classList && e.target.classList.contains('hv')) mostrarDica(e.target);
  });
  d.addEventListener('focusout', (e) => {
    if (e.target.classList && e.target.classList.contains('hv')) esconderDica();
  });

  const ESCALA_MM = 0.14;
  function atualizarMinimapa() {
    const mostrar = estado.minimapa && mq.largo.matches && el.editor.dataset.modo === 'codigo';
    el.minimapa.hidden = !mostrar;
    el.mmConteudo.innerHTML = '';
    if (!mostrar) return;
    const copia = $('.codigo', el.editor).cloneNode(true);
    $$('a, [tabindex]', copia).forEach((n) => {
      n.removeAttribute('href');
      n.removeAttribute('tabindex');
    });
    el.mmConteudo.appendChild(copia);
    el.mmConteudo.classList.toggle('quebra', quebraAtiva());
    sincronizarMinimapa();
  }
  function medidasMinimapa() {
    const e = el.editor;
    const total = e.scrollHeight;
    const vis = e.clientHeight;
    const excesso = Math.max(0, total * ESCALA_MM - el.minimapa.clientHeight);
    const prog = total > vis ? e.scrollTop / (total - vis) : 0;
    return { vis, desloc: excesso * prog };
  }
  function sincronizarMinimapa() {
    if (el.minimapa.hidden) return;
    const { vis, desloc } = medidasMinimapa();
    el.mmConteudo.style.transform = `translateY(${-desloc}px) scale(${ESCALA_MM})`;
    el.mmJanela.style.top = `${el.editor.scrollTop * ESCALA_MM - desloc}px`;
    el.mmJanela.style.height = `${Math.max(10, vis * ESCALA_MM)}px`;
  }
  el.minimapa.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.minimapa.setPointerCapture(e.pointerId);
    el.minimapa.classList.add('ativo');
    const mover = (ev) => {
      const { vis, desloc } = medidasMinimapa();
      const y = ev.clientY - el.minimapa.getBoundingClientRect().top + desloc;
      el.editor.scrollTop = y / ESCALA_MM - vis / 2;
    };
    mover(e);
    const soltar = () => {
      el.minimapa.classList.remove('ativo');
      el.minimapa.removeEventListener('pointermove', mover);
    };
    el.minimapa.addEventListener('pointermove', mover);
    el.minimapa.addEventListener('pointerup', soltar, { once: true });
    el.minimapa.addEventListener('pointercancel', soltar, { once: true });
  });
  el.editor.addEventListener('scroll', () => {
    sincronizarMinimapa();
    esconderDica();
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => sincronizarMinimapa()).observe(el.editor);

  function alternarMinimapa() {
    estado.minimapa = !estado.minimapa;
    guarda.gravar('ana-minimapa', estado.minimapa ? 'on' : 'off');
    atualizarMinimapa();
    if (estado.ativa === 'config') renderEditor({ forcar: true });
    if (!mq.largo.matches) notificar({ texto: 'O minimapa aparece no código em telas a partir de 1100 px de largura.' });
  }

  function alternarQuebra() {
    estado.quebra = !quebraAtiva();
    if (estado.ativa === 'config') renderEditor({ forcar: true });
    el.editor.classList.toggle('quebra', el.editor.dataset.modo === 'codigo' && quebraAtiva());
    atualizarMinimapa();
  }

  /* ======================================================================
     Visualizações: efeitos por aba
     ====================================================================== */
  function aoMostrarVisual(id, raiz) {
    if (id === 'sobre' && typeof window.iniciarExtensao === 'function') {
      try { window.iniciarExtensao($('.ext', raiz) || raiz); } catch (erro) { registrar(`extensão: ${erro.message}`); }
    }
    if (id === 'projetos') checarApps(raiz);
  }

  function aplicarStatus(raiz) {
    $$('[data-status]', raiz).forEach((s) => {
      const st = estado.statusApps[s.dataset.status];
      const txt = $('.vivo-txt', s);
      s.classList.remove('no-ar', 'sem-resposta');
      if (!st || st.estado === 'checando') txt.textContent = 'verificando…';
      else if (st.estado === 'no-ar') {
        s.classList.add('no-ar');
        txt.textContent = `no ar · ${st.ms} ms`;
        s.title = `Respondeu em ${st.ms} ms agora há pouco, medido do seu navegador.`;
      } else {
        s.classList.add('sem-resposta');
        txt.textContent = 'sem resposta agora';
      }
    });
  }

  function checarApps(raiz) {
    aplicarStatus(raiz);
    Object.keys(APPS).forEach((chave) => {
      if (estado.statusApps[chave]) return;
      estado.statusApps[chave] = { estado: 'checando' };
      const ctl = 'AbortController' in window ? new AbortController() : null;
      const limite = setTimeout(() => ctl && ctl.abort(), 7000);
      const ini = performance.now();
      fetch(APPS[chave], { mode: 'no-cors', cache: 'no-store', signal: ctl ? ctl.signal : undefined })
        .then(() => {
          estado.statusApps[chave] = { estado: 'no-ar', ms: Math.round(performance.now() - ini) };
          registrar(`${APPS[chave].replace('https://', '')} respondeu em ${estado.statusApps[chave].ms} ms`);
        })
        .catch(() => {
          estado.statusApps[chave] = { estado: 'sem-resposta' };
          registrar(`${APPS[chave].replace('https://', '')} não respondeu`);
        })
        .finally(() => {
          clearTimeout(limite);
          [el.editor, el.editorLado].forEach((p) => p.dataset.modo === 'visual' && aplicarStatus(p));
          if (estado.painel && estado.painelAba === 'portas') aplicarStatus(el.painelOutro);
        });
    });
  }

  async function copiarEmail(bt) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch {
      const ta = d.createElement('textarea');
      ta.value = EMAIL;
      ta.setAttribute('readonly', '');
      ta.className = 'sr';
      d.body.appendChild(ta);
      ta.select();
      try { ok = d.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    if (!ok) {
      notificar({ texto: `Não consegui copiar sozinho. O e-mail é ${EMAIL}` });
      return;
    }
    notificar({ tipo: 'ok', texto: `E-mail copiado: ${EMAIL}` });
    registrar('e-mail copiado');
    const rotulo = bt && bt.querySelector && bt.querySelector('span:not(.marca-check)');
    if (rotulo && bt.closest('.editor')) {
      const antes = rotulo.textContent;
      rotulo.textContent = 'Copiado';
      setTimeout(() => { rotulo.textContent = antes; }, 1800);
    }
  }

  const abrirFora = (url) => window.open(url, '_blank', 'noopener');

  /* ======================================================================
     Painel lateral: vistas
     ====================================================================== */
  function aplicarLateral() {
    const desk = !mq.celular.matches;
    el.app.classList.toggle('sem-lateral', desk && !estado.lateral);
    $('#bt-layout-lateral').setAttribute('aria-pressed', String(estado.lateral));
    const aberta = desk ? estado.lateral : el.app.classList.contains('gaveta');
    $$('.at-bt[data-vista]').forEach((b) => b.setAttribute('aria-pressed', String(aberta && b.dataset.vista === estado.vista)));
    requestAnimationFrame(sincronizarMinimapa);
  }

  function mostrarVista(v, { alternar = true, focar = true } = {}) {
    const celular = mq.celular.matches;
    const visivel = celular ? el.app.classList.contains('gaveta') : estado.lateral;
    if (alternar && visivel && estado.vista === v) {
      if (celular) fecharGaveta();
      else alternarLateral(false);
      return;
    }
    estado.vista = v;
    $$('.vista', el.lateral).forEach((x) => { x.hidden = x.id !== `vista-${v}`; });
    el.latTitulo.textContent = TITULOS_VISTA[v];
    if (v === 'extensoes') renderExtensoes();
    if (v === 'scm') renderRepos();
    if (celular) abrirGaveta();
    else estado.lateral = true;
    aplicarLateral();
    if (focar) {
      const alvo = v === 'busca' ? $('#busca-in') : v === 'extensoes' ? $('#ext-in') : $(`#vista-${v} button, #vista-${v} input, #vista-${v} textarea, #vista-${v} a`);
      if (alvo && (!celular || v !== 'busca')) alvo.focus();
      if (alvo && v === 'busca') alvo.select();
    }
  }

  function alternarLateral(forcar) {
    if (mq.celular.matches) {
      if (el.app.classList.contains('gaveta')) fecharGaveta();
      else abrirGaveta();
      aplicarLateral();
      return;
    }
    estado.lateral = typeof forcar === 'boolean' ? forcar : !estado.lateral;
    aplicarLateral();
  }

  function abrirGaveta() {
    el.app.classList.add('gaveta');
    el.fundo.hidden = false;
    el.area.inert = true;
  }
  function fecharGaveta() {
    if (!el.app.classList.contains('gaveta')) return;
    el.app.classList.remove('gaveta');
    el.fundo.hidden = true;
    el.area.inert = false;
    aplicarLateral();
  }

  $$('.at-bt[data-vista]').forEach((b) => b.addEventListener('click', () => mostrarVista(b.dataset.vista)));
  $('#bt-lat-fechar').addEventListener('click', fecharGaveta);
  el.fundo.addEventListener('click', fecharGaveta);
  $('#bt-layout-lateral').addEventListener('click', () => alternarLateral());
  $('#bt-layout-painel').addEventListener('click', () => alternarPainel());
  $('#bt-at-terminal').addEventListener('click', () => {
    fecharGaveta();
    alternarPainel();
  });

  el.lateral.addEventListener('click', (e) => {
    const cab = e.target.closest('.secao-cab');
    if (cab) {
      const sec = cab.closest('.secao');
      alternarSecao(sec, cab.getAttribute('aria-expanded') !== 'true');
      return;
    }
    const pasta = e.target.closest('[data-pasta]');
    if (pasta) alternarPasta(pasta);
  });

  el.arvore.addEventListener('keydown', (e) => {
    const itens = $$('.arvore-item', el.arvore).filter((b) => b.offsetParent !== null);
    const i = itens.indexOf(d.activeElement);
    if (i < 0) return;
    const atual = itens[i];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      itens[Math.min(itens.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus();
    } else if (e.key === 'ArrowRight' && atual.dataset.pasta) {
      e.preventDefault();
      if (atual.getAttribute('aria-expanded') !== 'true') alternarPasta(atual);
      else if (itens[i + 1]) itens[i + 1].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (atual.dataset.pasta && atual.getAttribute('aria-expanded') === 'true') alternarPasta(atual);
      else {
        const pai = atual.closest('.filhos');
        if (pai) pai.previousElementSibling.focus();
      }
    }
  });

  /* ---------- pesquisar ---------- */
  function trecho(l, p, n) {
    const ini = Math.max(0, p - 24);
    const antes = (ini > 0 ? '…' : '') + l.slice(ini, p).replace(/^\s+/, '');
    return `${esc(antes)}<mark>${esc(l.slice(p, p + n))}</mark>${esc(l.slice(p + n, p + n + 60))}`;
  }
  function buscar(q) {
    const res = $('#busca-res');
    const resumo = $('#busca-resumo');
    const termo = q.trim();
    if (termo.length < 2) {
      res.innerHTML = '';
      resumo.textContent = termo ? 'Digite pelo menos 2 caracteres.' : '';
      return;
    }
    const nq = norm(termo);
    let total = 0;
    let arquivos = 0;
    let h = '';
    ORDEM_BUSCA.forEach((id) => {
      const achados = [];
      fonte(id).split('\n').forEach((l, i) => {
        const nl = normPorChar(l);
        let p = nl.indexOf(nq);
        while (p >= 0 && achados.length < 40) {
          achados.push({ n: i + 1, p, l });
          p = nl.indexOf(nq, p + nq.length);
        }
      });
      if (!achados.length) return;
      arquivos += 1;
      total += achados.length;
      const a = ARQUIVOS[id];
      h += `<div class="res-arq"><button class="res-arq-cab" type="button" aria-expanded="true">${ic('chevron-right', 'seta')}${ic(a.icone)}<span>${esc(a.nome)}</span>${a.pasta ? `<span class="dim">${esc(a.pasta)}</span>` : ''}<span class="res-cont">${achados.length}</span></button><ul class="arvore">`
        + achados.map((x) => `<li><button class="res-linha" type="button" data-ir="${id}" data-ln="${x.n}" data-col="${x.p + 1}">${trecho(x.l, x.p, nq.length)}</button></li>`).join('')
        + '</ul></div>';
    });
    resumo.textContent = total
      ? `${total} resultado${total > 1 ? 's' : ''} em ${arquivos} arquivo${arquivos > 1 ? 's' : ''}`
      : 'Nenhum resultado encontrado.';
    res.innerHTML = h;
  }
  let esperaBusca = 0;
  $('#busca-in').addEventListener('input', (e) => {
    clearTimeout(esperaBusca);
    esperaBusca = setTimeout(() => buscar(e.target.value), 120);
  });
  $('#busca-res').addEventListener('click', (e) => {
    const cab = e.target.closest('.res-arq-cab');
    if (cab) {
      const lista = cab.nextElementSibling;
      const abrir = cab.getAttribute('aria-expanded') !== 'true';
      cab.setAttribute('aria-expanded', String(abrir));
      if (abrir) {
        lista.hidden = false;
        animarAltura(lista, true);
      } else {
        animarAltura(lista, false, () => { lista.hidden = true; });
      }
      return;
    }
    const r = e.target.closest('[data-ir]');
    if (r) abrir(r.dataset.ir, { modo: 'codigo', linha: +r.dataset.ln, coluna: +r.dataset.col });
  });

  /* ---------- controle do código-fonte ---------- */
  function renderRepos() {
    $('#repos').innerHTML = REPOS.map((r) => `<li><a class="arvore-item n0" href="https://github.com/An4D3v/${r.nome}" target="_blank" rel="noopener" title="${esc(r.desc)}"><span class="sem-gira"></span>${ic('repo')}<span class="nome">${esc(r.nome)}</span><span class="dim">${esc(r.ling)}</span></a></li>`).join('');
  }
  function enviarCommit() {
    const campo = $('#commit-msg');
    const msg = campo.value.trim();
    if (!msg) {
      notificar({ tipo: 'aviso', texto: 'Escreva uma mensagem antes do commit: ela vira o corpo do e-mail.' });
      campo.focus();
      return;
    }
    registrar('commit: abrindo o cliente de e-mail');
    notificar({ tipo: 'ok', texto: 'Abrindo o seu cliente de e-mail com a mensagem. É só enviar.' });
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Contato pelo portfólio')}&body=${encodeURIComponent(msg)}`;
  }
  $('#form-commit').addEventListener('submit', (e) => {
    e.preventDefault();
    enviarCommit();
  });
  $('#commit-msg').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      enviarCommit();
    }
  });

  /* ---------- extensões (a stack) ---------- */
  function renderExtensoes() {
    const q = norm($('#ext-in').value.trim());
    const lista = EXTENSOES.filter((x) => !q || norm(`${x.nome} ${x.desc}`).includes(q));
    const dela = !q || norm('Ana Neves Software Developer').includes(q);
    $('#ext-cont').textContent = String(lista.length + (dela ? 1 : 0));
    $('#ext-lista').innerHTML = (dela
      ? `<button class="ext-item dela" type="button" data-abrir="sobre"><span class="ext-ic redondo" aria-hidden="true"><img src="assets/ana-64.webp" alt="" width="42" height="42"></span><span class="ext-nome">Ana Neves</span><span class="ext-desc">Software Developer — backend, dados e IA</span><span class="ext-pub">${ic('verified-filled')}ana@dev</span></button>`
      : '')
      + lista.map((x) => `<button class="ext-item" type="button" data-ext="${esc(x.busca)}"><span class="ext-ic" aria-hidden="true">${esc(x.sigla)}</span><span class="ext-nome">${esc(x.nome)}</span><span class="ext-desc">${esc(x.desc)}</span><span class="ext-pub">${ic('verified-filled')}ana@dev</span></button>`).join('')
      + (lista.length || dela ? '' : '<p class="vazio-msg">Nenhuma extensão encontrada.</p>');
  }
  $('#ext-in').addEventListener('input', renderExtensoes);
  $('#ext-lista').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ext]');
    if (!b) return;
    const linha = fonte('stack').split('\n').findIndex((l) => l.includes(b.dataset.ext));
    abrir('stack', { modo: 'codigo', linha: linha + 1 });
  });

  /* ---------- executar e depurar ---------- */
  let depurando = null;
  const logDepuracao = [];
  function depurar() {
    if (depurando) return;
    const passos = [
      ['learn()', 'C#, .NET 8, Azure, LLMs em produção'],
      ['build()', '3 apps no ar · 7+ cargas incrementais · bots com IA'],
      ['ship()', 'em produção, com usuários reais'],
    ];
    logDepuracao.length = 0;
    logDepuracao.push({ cls: 'term-dim', txt: 'Iniciando: while (true) { learn(); build(); ship(); }' });
    el.app.classList.add('depurando');
    $('#barra-depuracao').hidden = false;
    mostrarPainel('depuracao');
    registrar('depuração iniciada');
    let i = 0;
    const passo = () => {
      if (i < passos.length) {
        logDepuracao.push({ cls: '', txt: `> ${passos[i][0]}`, ok: passos[i][1] });
        i += 1;
        renderPainel();
        depurando = setTimeout(passo, mq.calmo.matches ? 0 : 700);
        return;
      }
      logDepuracao.push({ cls: 'term-dim', txt: 'Iteração concluída. O loop continua: é while (true).' });
      renderPainel();
      depurando = setTimeout(pararDepuracao, mq.calmo.matches ? 0 : 1200);
    };
    depurando = setTimeout(passo, mq.calmo.matches ? 0 : 400);
  }
  function pararDepuracao() {
    clearTimeout(depurando);
    depurando = null;
    el.app.classList.remove('depurando');
    $('#barra-depuracao').hidden = true;
  }

  /* ======================================================================
     Painel inferior: problemas, saída, depuração, terminal
     ====================================================================== */
  const logSaida = [];
  function registrar(msg) {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    logSaida.push({ hora, msg });
    if (logSaida.length > 300) logSaida.shift();
    if (estado.painel && estado.painelAba === 'saida') renderPainel();
  }

  // Portas: cada app roda numa porta no computador da Ana e está "encaminhado"
  // para o endereço público; o ponto mostra se ele respondeu agora há pouco.
  const PORTAS = [
    { porta: 5176, app: 'rumo', nome: 'Rumo' },
    { porta: 5173, app: 'alien', nome: 'AlienFinanças' },
    { porta: 5175, app: 'trevo', nome: 'Vale do Trevo' },
  ];
  function htmlPortas() {
    return '<table class="portas"><thead><tr><th>Porta</th><th>Endereço Encaminhado</th><th>Processo em Execução</th><th>Visibilidade</th><th>Origem</th></tr></thead><tbody>'
      + PORTAS.map((p) => `<tr><td>${p.porta}</td><td>${linkar(esc(APPS[p.app]))}</td>`
        + `<td>${esc(p.nome)} (npm run dev)<span class="vivo" data-status="${p.app}"><span class="vivo-ponto"></span><span class="vivo-txt">verificando…</span></span></td>`
        + '<td>Pública</td><td>Vercel</td></tr>').join('')
      + '</tbody></table>';
  }

  function renderPainel() {
    el.painel.hidden = !estado.painel;
    $('#bt-layout-painel').setAttribute('aria-pressed', String(estado.painel));
    requestAnimationFrame(sincronizarMinimapa);
    if (!estado.painel) return;
    $$('.painel-aba').forEach((b) => {
      const on = b.dataset.painel === estado.painelAba;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    el.painel.dataset.aba = estado.painelAba;
    const term = estado.painelAba === 'terminal';
    el.painelCorpo.hidden = !term;
    el.termChips.hidden = !term;
    el.termLista.hidden = !term;
    el.painelOutro.hidden = term;
    if (term) {
      if (!el.termSaida.childElementCount) boasVindas();
      return;
    }
    el.painelOutro.setAttribute('role', 'tabpanel');
    el.painelOutro.setAttribute('aria-labelledby', `pa-${estado.painelAba}`);
    if (estado.painelAba === 'problemas') {
      el.painelOutro.innerHTML = `<p class="problemas-ok">${ic('pass')}Nenhum problema foi detectado no workspace.</p>`;
    } else if (estado.painelAba === 'saida') {
      el.painelOutro.innerHTML = logSaida.map((l) => `<div class="saida-linha"><span class="hora">[${l.hora}]</span> ${esc(l.msg)}</div>`).join('');
    } else if (estado.painelAba === 'portas') {
      el.painelOutro.innerHTML = htmlPortas();
      checarApps(el.painelOutro);
    } else {
      el.painelOutro.innerHTML = logDepuracao.length
        ? logDepuracao.map((l) => `<div class="term-linha ${l.cls}">${esc(l.txt)}${l.ok ? `  <span class="term-ok">✓ ${esc(l.ok)}</span>` : ''}</div>`).join('')
        : '<p class="problemas-ok">Use Executar e Depurar (F5) para rodar o loop da Ana.</p>';
    }
    el.painelOutro.scrollTop = el.painelOutro.scrollHeight;
  }

  function mostrarPainel(aba) {
    estado.painel = true;
    if (aba) estado.painelAba = aba;
    renderPainel();
    if (estado.painelAba === 'terminal' && !mq.celular.matches) el.termIn.focus();
  }
  function alternarPainel(forcar) {
    const abrir = typeof forcar === 'boolean' ? forcar : !estado.painel;
    if (!abrir && estado.painel) {
      estado.painel = false;
      $('#bt-layout-painel').setAttribute('aria-pressed', 'false');
      sairSuave(el.painel, { transform: 'translateY(8px)' }, () => {
        if (!estado.painel) renderPainel();
        el.painel.getAnimations().forEach((a) => a.cancel());
      });
      return;
    }
    estado.painel = abrir;
    renderPainel();
    if (estado.painel && estado.painelAba === 'terminal' && !mq.celular.matches) el.termIn.focus();
  }

  $$('.painel-aba').forEach((b) => b.addEventListener('click', () => mostrarPainel(b.dataset.painel)));
  $('.painel-abas').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const abas = $$('.painel-aba');
    const i = abas.findIndex((b) => b.dataset.painel === estado.painelAba);
    const prox = abas[(i + (e.key === 'ArrowRight' ? 1 : -1) + abas.length) % abas.length];
    e.preventDefault();
    mostrarPainel(prox.dataset.painel);
    prox.focus();
  });

  /* ---------- terminal ---------- */
  const term = { hist: [], pos: 0, dispensada: false };
  const PROMPT = '<span class="term-ps">PS C:\\portfolio-ana-neves&gt;</span> ';
  const NOMES_ARQ = Object.fromEntries(Object.keys(ARQUIVOS).map((id) => [caminho(id), id]));

  function linhaTerm(conteudo, cls = '') {
    const div = d.createElement('div');
    div.className = `term-linha ${cls}`.trim();
    div.innerHTML = conteudo;
    el.termSaida.appendChild(div);
    el.painelCorpo.scrollTop = el.painelCorpo.scrollHeight;
    return div;
  }
  // No computador a dica fica em itálico depois do cursor, como a do VS Code;
  // no celular ela não cabe ali e vira uma linha de texto.
  function boasVindas() {
    if (mq.celular.matches) linhaTerm('Terminal do portfólio. Digite <span class="term-dest">help</span> ou toque num comando acima.', 'term-dim');
    el.termForm.classList.toggle('com-dica', !term.dispensada);
  }
  function atualizarCampo() {
    const inp = el.termIn;
    if (inp.value && !term.dispensada) {
      term.dispensada = true;
      el.termForm.classList.remove('com-dica');
    }
    const col = inp.selectionDirection === 'backward' ? inp.selectionStart : inp.selectionEnd;
    el.termCursor.style.setProperty('--col', String(col ?? inp.value.length));
    el.termCursor.style.setProperty('--rolagem', `${inp.scrollLeft}px`);
  }
  function limparTerminal() {
    el.termSaida.innerHTML = '';
  }
  function acharArquivo(nome) {
    const n = nome.trim().toLowerCase().replace(/^\.\//, '');
    const id = Object.keys(NOMES_ARQ).find((k) => k.toLowerCase() === n || k.split('/').pop().toLowerCase() === n);
    return id ? NOMES_ARQ[id] : null;
  }
  const estreito = () => mq.celular.matches;
  const linkArq = (id) => `<a href="#${id}" data-abrir="${id}">${esc(caminho(id))}</a>`;

  const CMDS = {
    help: {
      desc: 'lista os comandos',
      fn: () => linhaTerm(Object.entries(CMDS).filter(([, c]) => c.desc).map(([n, c]) => (estreito()
        ? `<span class="term-dest">${n}</span>  ${esc(c.desc)}`
        : `  <span class="term-dest">${n.padEnd(12)}</span>${esc(c.desc)}`)).join('\n')),
    },
    whoami: { desc: 'quem é a Ana', fn: () => linhaTerm('Ana Neves — Software Developer · backend, dados e IA · São Paulo, Brasil') },
    sobre: {
      desc: 'resumo em três linhas',
      fn: () => linhaTerm('Primeira e única dev de um escritório jurídico: pipelines com 4,5M+ registros,\nbots com IA no Teams e classificador LLM em produção.\nFora do expediente: 3 apps próprios no ar, com 70+ pessoas usando.'),
    },
    projetos: {
      desc: 'os produtos, com links',
      fn: () => linhaTerm([
        ['Rumo', 'orientador de rotinas · PWA · 40+ usuários', APPS.rumo],
        ['AlienFinanças', 'finanças com leitura de nota fiscal por IA · 20+ usuários', APPS.alien],
        ['Notas Fiscais', 'microsserviços .NET · 28 testes de integração', 'https://github.com/An4D3v/Korp_Teste_AnaNeves'],
        ['Vale do Trevo', 'jogo 2D em canvas puro', APPS.trevo],
      ].map(([n, dsc, url]) => (estreito()
        ? `<span class="term-dest">${esc(n)}</span>\n  ${esc(dsc)}\n  ${linkar(esc(url))}`
        : `<span class="term-dest">${esc(n.padEnd(15))}</span>${esc(dsc)}\n${' '.repeat(15)}${linkar(esc(url))}`)).join('\n')),
    },
    experiencia: {
      desc: 'trajetória e bastidores',
      fn: () => {
        linhaTerm(estreito()
          ? 'hoje: primeira e única dev · escritório jurídico, São Paulo\nem paralelo: 3 produtos próprios no ar\ninício: dados · Jusbrasil'
          : 'hoje      primeira e única dev · escritório jurídico, São Paulo\nparalelo  3 produtos próprios no ar\ninício    dados · Jusbrasil');
        linhaTerm(`detalhes: ${linkArq('experiencia')}`, 'term-dim');
      },
    },
    stack: {
      desc: 'com o que ela trabalha',
      fn: () => {
        const s = JSON.parse(fonte('stack'));
        linhaTerm(Object.entries(s).map(([k, v]) => (estreito()
          ? `<span class="term-dest">${esc(k)}</span>\n  ${esc(v.join(' · '))}`
          : `<span class="term-dest">${esc(k.padEnd(10))}</span>${esc(v.join(' · '))}`)).join('\n'));
      },
    },
    contato: {
      desc: 'e-mail, GitHub e LinkedIn',
      fn: () => {
        linhaTerm(`e-mail    ${linkar(EMAIL)}\ngithub    ${linkar(GITHUB)}\nlinkedin  ${linkar(LINKEDIN)}`);
        linhaTerm('para falar de backend .NET, dados e IA aplicada.', 'term-dim');
      },
    },
    ls: { desc: 'lista os arquivos', fn: () => linhaTerm(Object.keys(NOMES_ARQ).filter((k) => k !== 'atalhos.md').map((k) => linkArq(NOMES_ARQ[k])).join('  ')) },
    abrir: {
      desc: 'abre um arquivo (abrir projetos.tsx)',
      args: 'arquivo',
      fn: (arg) => {
        const id = acharArquivo(arg);
        if (!arg) linhaTerm('uso: abrir &lt;arquivo&gt;   ex.: abrir projetos.tsx', 'term-dim');
        else if (!id) linhaTerm(`abrir: ${esc(arg)}: arquivo não encontrado`, 'term-erro');
        else {
          abrir(id);
          linhaTerm(`abrindo ${esc(caminho(id))}…`, 'term-dim');
        }
      },
    },
    cat: {
      desc: 'mostra o conteúdo de um arquivo',
      args: 'arquivo',
      fn: (arg) => {
        const id = acharArquivo(arg);
        if (!id) linhaTerm(arg ? `cat: ${esc(arg)}: arquivo não encontrado` : 'uso: cat &lt;arquivo&gt;', 'term-erro');
        else if (ARQUIVOS[id].imagem) linhaTerm(`cat: ${esc(caminho(id))}: é uma imagem; abra com <span class="term-dest">abrir ${esc(caminho(id))}</span>`, 'term-dim');
        else linhaTerm(linkar(esc(fonte(id))));
      },
    },
    tema: {
      desc: 'troca o tema (tema light-modern)',
      args: 'tema',
      fn: (arg) => {
        const t = arg.trim().toLowerCase();
        if (TEMAS[t]) {
          aplicarTema(t);
          linhaTerm(`tema aplicado: ${esc(TEMAS[t].nome)}`, 'term-ok');
        } else {
          linhaTerm(`temas: ${Object.keys(TEMAS).map((k) => `<span class="term-dest">${k}</span>`).join('  ')}`);
        }
      },
    },
    date: { desc: 'data e hora', fn: () => linhaTerm(esc(new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' }))) },
    echo: { desc: 'repete o texto', fn: (arg) => linhaTerm(esc(arg)) },
    history: { desc: 'histórico de comandos', fn: () => linhaTerm(term.hist.map((c, i) => `${String(i + 1).padStart(4)}  ${esc(c)}`).join('\n')) },
    clear: { desc: 'limpa o terminal', fn: limparTerminal },
    exit: { desc: 'fecha o painel', fn: () => alternarPainel(false) },
    sudo: { fn: () => linhaTerm('ana não está no arquivo sudoers. Este incidente será reportado. (brincadeira)', 'term-erro') },
    code: { alias: 'abrir' },
    open: { alias: 'abrir' },
  };

  function executar(bruto) {
    const txt = bruto.trim();
    const eco = linhaTerm(PROMPT + esc(txt));
    if (!txt) return;
    eco.classList.add('cmd');
    rodar(txt);
    // como no VS Code, a bolinha do comando fica azul se deu certo e vermelha se falhou
    for (let n = eco.nextElementSibling; n; n = n.nextElementSibling) {
      if (n.classList.contains('term-erro')) eco.classList.add('falhou');
    }
  }

  function rodar(txt) {
    term.hist.push(txt);
    term.pos = term.hist.length;
    registrar(`terminal: ${txt}`);
    const [nome, ...resto] = txt.split(/\s+/);
    let c = CMDS[nome.toLowerCase()];
    if (c && c.alias) c = CMDS[c.alias];
    if (c) {
      c.fn(resto.join(' '));
      return;
    }
    const id = acharArquivo(txt);
    if (id) {
      abrir(id);
      linhaTerm(`abrindo ${esc(caminho(id))}…`, 'term-dim');
      return;
    }
    linhaTerm(`${esc(nome)}: comando não encontrado. Digite <span class="term-dest">help</span>.`, 'term-erro');
  }

  function completar() {
    const v = el.termIn.value;
    const partes = v.split(/\s+/);
    let opcoes;
    let prefixo;
    let base;
    if (partes.length <= 1) {
      opcoes = Object.keys(CMDS).filter((n) => CMDS[n].desc);
      prefixo = partes[0] || '';
      base = '';
    } else {
      let c = CMDS[partes[0].toLowerCase()];
      if (c && c.alias) c = CMDS[c.alias];
      if (!c || !c.args) return;
      opcoes = c.args === 'tema' ? Object.keys(TEMAS) : Object.keys(NOMES_ARQ);
      prefixo = partes.slice(1).join(' ');
      base = `${partes[0]} `;
    }
    const achados = opcoes.filter((o) => o.toLowerCase().startsWith(prefixo.toLowerCase()));
    if (achados.length === 1) {
      el.termIn.value = base + achados[0] + (base ? '' : ' ');
    } else if (achados.length > 1) {
      linhaTerm(PROMPT + esc(v));
      linhaTerm(achados.map(esc).join('  '), 'term-dim');
      let comum = achados[0];
      achados.forEach((a) => {
        while (!a.toLowerCase().startsWith(comum.toLowerCase())) comum = comum.slice(0, -1);
      });
      if (comum.length > prefixo.length) el.termIn.value = base + comum;
    }
  }

  $('#term-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = el.termIn.value;
    el.termIn.value = '';
    executar(v);
    atualizarCampo();
  });
  ['input', 'focus', 'click', 'select'].forEach((ev) => el.termIn.addEventListener(ev, atualizarCampo));
  el.termIn.addEventListener('keydown', () => requestAnimationFrame(atualizarCampo));
  el.termIn.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      completar();
    } else if (e.key === 'ArrowUp') {
      if (term.pos > 0) {
        term.pos -= 1;
        el.termIn.value = term.hist[term.pos];
        e.preventDefault();
      }
    } else if (e.key === 'ArrowDown') {
      if (term.pos < term.hist.length) {
        term.pos += 1;
        el.termIn.value = term.hist[term.pos] || '';
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      el.editor.focus();
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault();
      limparTerminal();
    }
  });
  el.termIn.addEventListener('focus', () => {
    if (mq.celular.matches) el.app.classList.add('digitando');
  });
  el.termIn.addEventListener('blur', () => el.app.classList.remove('digitando'));
  el.painelCorpo.addEventListener('click', (e) => {
    if (e.target.closest('a, button') || String(getSelection())) return;
    el.termIn.focus();
  });
  el.termChips.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cmd]');
    if (!c) return;
    executar(c.dataset.cmd);
    if (!mq.celular.matches) el.termIn.focus();
  });

  /* ======================================================================
     Notificações
     ====================================================================== */
  function notificar({ tipo = 'info', texto, acoes = [], fixa = false, chave } = {}) {
    if (chave) {
      const existente = $(`.notif[data-chave="${chave}"]`, el.notifs);
      if (existente) return existente;
    }
    const n = d.createElement('div');
    n.className = `notif ${tipo}`;
    if (chave) n.dataset.chave = chave;
    const icone = tipo === 'ok' ? 'pass' : tipo === 'aviso' ? 'warning' : 'info';
    n.innerHTML = `${ic(icone)}<p class="notif-txt">${esc(texto)}</p><button class="icone-bt" type="button" data-sair aria-label="Fechar notificação">${ic('close')}</button>`
      + (acoes.length ? `<div class="notif-acoes">${acoes.map((a, i) => `<button class="botao${a.sec ? ' sec' : ''}" type="button" data-i="${i}">${esc(a.rotulo)}</button>`).join('')}</div>` : '');
    const sair = () => {
      if (n.classList.contains('saindo')) return;
      n.classList.add('saindo');
      sairSuave(n, { transform: 'translateX(16px)' }, () => {
        n.remove();
        atualizarSino();
      });
    };
    n.sair = sair;
    n.addEventListener('click', (e) => {
      if (e.target.closest('[data-sair]')) {
        if (acoes.onFechar) acoes.onFechar();
        sair();
        return;
      }
      const b = e.target.closest('[data-i]');
      if (!b) return;
      const acao = acoes[+b.dataset.i];
      sair();
      if (acao && acao.fn) acao.fn(b);
    });
    el.notifs.appendChild(n);
    if (!fixa) setTimeout(sair, 5200);
    atualizarSino();
    return n;
  }
  function atualizarSino() {
    const tem = Boolean($('.notif[data-chave]', el.notifs));
    $('use', el.stSino).setAttribute('href', `#i-${tem ? 'bell-dot' : 'bell'}`);
    el.stSino.setAttribute('aria-label', tem ? 'Notificações: 1 nova' : 'Notificações');
  }
  function notificarDica() {
    const visto = () => guarda.gravarSessao('ana-notif', '1');
    const acoes = [
      { rotulo: 'Ver atalhos', sec: true, fn: () => { visto(); abrir('atalhos'); } },
      { rotulo: 'Abrir terminal', fn: () => { visto(); mostrarPainel('terminal'); } },
    ];
    acoes.onFechar = visto;
    const texto = mq.celular.matches
      ? 'Dica: deslize o dedo para os lados para trocar de aba. A barra de baixo abre arquivos, pesquisa, terminal e links.'
      : 'Dica: isto é um editor de verdade. Ctrl+Shift+P abre a paleta de comandos e Ctrl+J, o terminal.';
    notificar({ texto, acoes, fixa: true, chave: 'dica' });
  }
  el.stSino.addEventListener('click', () => {
    const notifs = $$('.notif:not(.saindo)', el.notifs);
    if (notifs.length) notifs.forEach((n) => n.sair());
    else notificarDica();
    atualizarSino();
  });

  /* ======================================================================
     Temas
     ====================================================================== */
  let fimTrocaTema = 0;
  function aplicarTema(t, { salvar = true } = {}) {
    if (!TEMAS[t]) return;
    if (!mq.calmo.matches && html.dataset.tema !== t) {
      html.classList.add('trocando-tema');
      clearTimeout(fimTrocaTema);
      fimTrocaTema = setTimeout(() => html.classList.remove('trocando-tema'), 340);
    }
    html.dataset.tema = t;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', TEMAS[t].fundo);
    if (!salvar) return;
    const mudou = estado.tema !== t;
    estado.tema = t;
    guarda.gravar('ana-tema', t);
    if (mudou) registrar(`tema de cores: ${TEMAS[t].nome}`);
    if (estado.ativa === 'config') renderEditor({ forcar: true });
  }
  const itensTema = () => [
    ...Object.entries(TEMAS).map(([k, t]) => ({ rotulo: t.nome, check: estado.tema === k, fn: () => aplicarTema(k) })),
    '-',
    { rotulo: 'Escolher com Visualização…', fn: () => abrirPaleta('', 'tema') },
  ];

  /* ======================================================================
     Menus (barra de menus, contas, gerenciar, "...")
     ====================================================================== */
  const MENUS = [
    { rotulo: 'Arquivo', itens: () => [
      { rotulo: 'Abrir Arquivo…', tecla: 'Ctrl+P', fn: () => abrirPaleta('') },
      { rotulo: 'Reabrir Todas as Abas', fn: reabrirTodas },
      '-',
      { rotulo: 'Fechar Editor', fn: () => estado.ativa && fecharAba(estado.ativa), off: !estado.ativa },
      { rotulo: 'Fechar Todos os Editores', fn: fecharTodas, off: !estado.abertas.length },
      '-',
      { rotulo: 'Preferências: Tema de Cores…', fn: () => abrirPaleta('', 'tema') },
    ] },
    { rotulo: 'Editar', itens: () => [
      { rotulo: 'Localizar nos Arquivos', tecla: 'Ctrl+Shift+F', fn: () => mostrarVista('busca', { alternar: false }) },
      { rotulo: 'Copiar E-mail da Ana', fn: copiarEmail },
    ] },
    { rotulo: 'Seleção', itens: () => [
      { rotulo: 'Selecionar Tudo no Editor', tecla: 'Ctrl+A', fn: selecionarTudo, off: !estado.ativa },
    ] },
    { rotulo: 'Exibir', itens: () => [
      { rotulo: 'Paleta de Comandos…', tecla: 'Ctrl+Shift+P', fn: () => abrirPaleta('>') },
      '-',
      { rotulo: 'Explorador', tecla: 'Ctrl+Shift+E', fn: () => mostrarVista('explorer', { alternar: false }) },
      { rotulo: 'Pesquisar', tecla: 'Ctrl+Shift+F', fn: () => mostrarVista('busca', { alternar: false }) },
      { rotulo: 'Controle do Código-Fonte', tecla: 'Ctrl+Shift+G', fn: () => mostrarVista('scm', { alternar: false }) },
      { rotulo: 'Executar e Depurar', tecla: 'Ctrl+Shift+D', fn: () => mostrarVista('depurar', { alternar: false }) },
      { rotulo: 'Extensões', tecla: 'Ctrl+Shift+X', fn: () => mostrarVista('extensoes', { alternar: false }) },
      '-',
      { rotulo: 'Terminal', tecla: 'Ctrl+J', check: estado.painel, fn: () => alternarPainel() },
      { rotulo: 'Minimapa', check: estado.minimapa, fn: alternarMinimapa },
      { rotulo: 'Quebra de Linha', tecla: 'Alt+Z', check: quebraAtiva(), fn: alternarQuebra },
      { rotulo: 'Modo Zen', check: estado.zen, fn: () => alternarZen() },
    ] },
    { rotulo: 'Ir', itens: () => [
      { rotulo: 'Voltar', fn: () => navegar(-1), off: estado.posHist <= 0 },
      { rotulo: 'Avançar', fn: () => navegar(1), off: estado.posHist >= estado.historico.length - 1 },
      '-',
      ...SECOES.map((id, i) => ({ rotulo: ARQUIVOS[id].nome, tecla: `Alt+${i + 1}`, fn: () => abrir(id) })),
      '-',
      { rotulo: 'Ir para o Arquivo…', tecla: 'Ctrl+P', fn: () => abrirPaleta('') },
    ] },
    { rotulo: 'Executar', itens: () => [
      { rotulo: 'Iniciar Depuração', tecla: 'F5', fn: depurar, off: Boolean(depurando) },
      { rotulo: 'Parar Depuração', fn: pararDepuracao, off: !depurando },
    ] },
    { rotulo: 'Terminal', itens: () => [
      { rotulo: 'Novo Terminal', tecla: 'Ctrl+J', fn: () => mostrarPainel('terminal') },
      { rotulo: 'Limpar Terminal', fn: () => { mostrarPainel('terminal'); limparTerminal(); } },
    ] },
    { rotulo: 'Ajuda', itens: () => [
      { rotulo: 'Atalhos de Teclado', fn: () => abrir('atalhos') },
      { rotulo: 'Sobre Este Portfólio', fn: () => abrir('pacote') },
      '-',
      { rotulo: 'Perfil no GitHub', fn: () => abrirFora(GITHUB) },
      { rotulo: 'Perfil no LinkedIn', fn: () => abrirFora(LINKEDIN) },
    ] },
  ];

  el.menus.innerHTML = MENUS.map((m, i) => `<button class="menu-bt" type="button" data-menu="${i}" aria-haspopup="menu" aria-expanded="false">${esc(m.rotulo)}</button>`).join('');

  let menuAberto = null;
  function abrirMenu(itens, ancora, { lado = 'baixo', barra = false, focar = false } = {}) {
    fecharMenu();
    el.menu.innerHTML = itens.map((it, i) => {
      if (it === '-') return '<div class="menu-sep" role="separator"></div>';
      const papel = it.check === undefined ? 'menuitem' : 'menuitemcheckbox';
      return `<button class="menu-item" type="button" role="${papel}"${it.check === undefined ? '' : ` aria-checked="${Boolean(it.check)}"`} data-i="${i}" tabindex="-1"${it.off ? ' aria-disabled="true"' : ''}>`
        + `<span class="marca-check">${it.check ? ic('check') : ''}</span><span>${esc(it.rotulo)}</span><span class="tecla">${esc(it.tecla || '')}</span></button>`;
    }).join('');
    el.menu.hidden = false;
    const r = ancora.getBoundingClientRect();
    const mr = el.menu.getBoundingClientRect();
    let topo;
    let esq;
    if (lado === 'direita') {
      esq = r.right + 4;
      topo = r.bottom - mr.height;
    } else if (lado === 'cima') {
      esq = r.left;
      topo = r.top - mr.height - 4;
    } else {
      esq = r.left;
      topo = r.bottom + 2;
    }
    esq = Math.min(Math.max(4, esq), innerWidth - mr.width - 4);
    topo = Math.min(Math.max(4, topo), innerHeight - mr.height - 4);
    el.menu.style.left = `${esq}px`;
    el.menu.style.top = `${topo}px`;
    menuAberto = { itens, ancora, barra };
    ancora.setAttribute('aria-expanded', 'true');
    if (focar) {
      const prim = $('.menu-item:not([aria-disabled="true"])', el.menu);
      if (prim) prim.focus();
    }
  }
  function fecharMenu(devolverFoco = false) {
    if (!menuAberto) return;
    menuAberto.ancora.setAttribute('aria-expanded', 'false');
    if (devolverFoco) menuAberto.ancora.focus();
    menuAberto = null;
    el.menu.hidden = true;
  }
  el.menu.addEventListener('click', (e) => {
    const b = e.target.closest('.menu-item');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    const it = menuAberto && menuAberto.itens[+b.dataset.i];
    fecharMenu();
    if (it && it.fn) it.fn(b);
  });
  el.menu.addEventListener('keydown', (e) => {
    const itens = $$('.menu-item:not([aria-disabled="true"])', el.menu);
    const i = itens.indexOf(d.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prox = i < 0 ? 0 : (i + (e.key === 'ArrowDown' ? 1 : -1) + itens.length) % itens.length;
      if (itens[prox]) itens[prox].focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      itens[e.key === 'Home' ? 0 : itens.length - 1].focus();
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && menuAberto && menuAberto.barra) {
      e.preventDefault();
      const bts = $$('.menu-bt', el.menus);
      const j = bts.indexOf(menuAberto.ancora);
      const prox = bts[(j + (e.key === 'ArrowRight' ? 1 : -1) + bts.length) % bts.length];
      abrirMenuBarra(prox, true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      fecharMenu(true);
    } else if (e.key === 'Tab') {
      fecharMenu();
    }
  });
  // Botões de ícone funcionam como interruptor: o segundo clique fecha.
  function alternarMenu(itens, ancora, opcoes) {
    if (menuAberto && menuAberto.ancora === ancora) {
      fecharMenu();
      return;
    }
    abrirMenu(itens, ancora, opcoes);
  }
  function abrirMenuBarra(bt, focar) {
    abrirMenu(MENUS[+bt.dataset.menu].itens(), bt, { barra: true, focar });
  }
  el.menus.addEventListener('click', (e) => {
    const bt = e.target.closest('.menu-bt');
    if (!bt) return;
    if (menuAberto && menuAberto.ancora === bt) fecharMenu();
    else abrirMenuBarra(bt, e.detail === 0);
  });
  el.menus.addEventListener('keydown', (e) => {
    const bt = e.target.closest('.menu-bt');
    if (bt && e.key === 'ArrowDown') {
      e.preventDefault();
      abrirMenuBarra(bt, true);
    }
  });
  el.menus.addEventListener('pointerover', (e) => {
    const bt = e.target.closest('.menu-bt');
    if (bt && menuAberto && menuAberto.barra && menuAberto.ancora !== bt) abrirMenuBarra(bt, false);
  });
  d.addEventListener('pointerdown', (e) => {
    if (!menuAberto) return;
    if (el.menu.contains(e.target) || menuAberto.ancora.contains(e.target)) return;
    fecharMenu();
  });

  function selecionarTudo() {
    const sel = getSelection();
    const r = d.createRange();
    r.selectNodeContents($('.codigo, .md, .ext', el.editor) || el.editor);
    sel.removeAllRanges();
    sel.addRange(r);
  }

  const celular = () => mq.celular.matches;
  $('#bt-conta').addEventListener('click', (e) => alternarMenu([
    { rotulo: 'Ana Neves — GitHub', fn: () => abrirFora(GITHUB) },
    { rotulo: 'Ana Neves — LinkedIn', fn: () => abrirFora(LINKEDIN) },
    '-',
    { rotulo: 'Enviar E-mail', fn: () => { location.href = `mailto:${EMAIL}`; } },
    { rotulo: 'Copiar E-mail', fn: copiarEmail },
  ], e.currentTarget, { lado: celular() ? 'cima' : 'direita', focar: e.detail === 0 }));
  $('#bt-gerenciar').addEventListener('click', (e) => alternarMenu([
    { rotulo: 'Paleta de Comandos…', tecla: 'Ctrl+Shift+P', fn: () => abrirPaleta('>') },
    { rotulo: 'Configurações', fn: () => abrir('config') },
    { rotulo: 'Atalhos de Teclado', fn: () => abrir('atalhos') },
    '-',
    ...itensTema(),
  ], e.currentTarget, { lado: 'direita', focar: e.detail === 0 }));
  $('#bt-layout-mais').addEventListener('click', (e) => alternarMenu([
    { rotulo: 'Painel Lateral', tecla: 'Ctrl+B', check: estado.lateral, fn: () => alternarLateral() },
    { rotulo: 'Painel', tecla: 'Ctrl+J', check: estado.painel, fn: () => alternarPainel() },
    { rotulo: 'Minimapa', check: estado.minimapa, fn: alternarMinimapa },
    '-',
    { rotulo: 'Modo Zen', check: estado.zen, fn: () => alternarZen() },
    { rotulo: 'Tela Inteira', check: Boolean(d.fullscreenElement), fn: telaCheia },
  ], e.currentTarget, { focar: e.detail === 0 }));
  $('#bt-editor-mais').addEventListener('click', (e) => alternarMenu([
    { rotulo: 'Fechar Outros', fn: fecharOutras, off: estado.abertas.length < 2 },
    { rotulo: 'Fechar Todos', fn: fecharTodas, off: !estado.abertas.length },
    { rotulo: 'Reabrir Todas as Abas', fn: reabrirTodas },
    '-',
    { rotulo: 'Quebra de Linha', tecla: 'Alt+Z', check: quebraAtiva(), fn: alternarQuebra },
    { rotulo: 'Minimapa', check: estado.minimapa, fn: alternarMinimapa },
    { rotulo: 'Visualização ao Lado', check: estado.dividido, fn: alternarDivisao, off: !temVisual() },
  ], e.currentTarget, { focar: e.detail === 0 }));
  $('#bt-lat-mais').addEventListener('click', (e) => alternarMenu(
    Object.entries(TITULOS_VISTA).map(([v, t]) => ({ rotulo: t, check: estado.vista === v, fn: () => mostrarVista(v, { alternar: false }) })),
    e.currentTarget, { focar: e.detail === 0 },
  ));

  /* ---------- janela: zen, tela cheia, fechar ---------- */
  function alternarZen(forcar) {
    estado.zen = typeof forcar === 'boolean' ? forcar : !estado.zen;
    el.app.classList.toggle('zen', estado.zen);
    if (estado.zen) notificar({ texto: 'Modo zen: só o editor. Esc para sair.' });
    requestAnimationFrame(sincronizarMinimapa);
  }
  function telaCheia() {
    if (d.fullscreenElement) d.exitFullscreen().catch(() => {});
    else if (html.requestFullscreen) html.requestFullscreen().catch(() => notificar({ texto: 'O navegador não liberou a tela cheia agora.' }));
  }
  $('#bt-minimizar').addEventListener('click', () => alternarZen());
  $('#bt-maximizar').addEventListener('click', telaCheia);
  $('#bt-fechar').addEventListener('click', () => notificar({
    texto: 'Este editor não fecha por aqui. Antes de sair, que tal levar o contato?',
    acoes: [{ rotulo: 'Ficar', sec: true }, { rotulo: 'Copiar e-mail', fn: copiarEmail }],
  }));

  /* ======================================================================
     Paleta de comandos
     ====================================================================== */
  const COMANDOS = () => [
    { rotulo: 'Exibir: Alternar Terminal', tecla: 'Ctrl+J', fn: () => alternarPainel() },
    { rotulo: 'Exibir: Alternar Painel Lateral', tecla: 'Ctrl+B', fn: () => alternarLateral() },
    { rotulo: 'Exibir: Mostrar Explorador', tecla: 'Ctrl+Shift+E', fn: () => mostrarVista('explorer', { alternar: false }) },
    { rotulo: 'Exibir: Mostrar Pesquisa', tecla: 'Ctrl+Shift+F', fn: () => mostrarVista('busca', { alternar: false }) },
    { rotulo: 'Exibir: Mostrar Controle do Código-Fonte', tecla: 'Ctrl+Shift+G', fn: () => mostrarVista('scm', { alternar: false }) },
    { rotulo: 'Exibir: Mostrar Extensões', tecla: 'Ctrl+Shift+X', fn: () => mostrarVista('extensoes', { alternar: false }) },
    { rotulo: 'Exibir: Alternar Minimapa', fn: alternarMinimapa },
    { rotulo: 'Exibir: Alternar Quebra de Linha', tecla: 'Alt+Z', fn: alternarQuebra },
    { rotulo: 'Exibir: Alternar Modo Zen', fn: () => alternarZen() },
    { rotulo: 'Exibir: Alternar Tela Inteira', fn: telaCheia },
    { rotulo: 'Exibir: Mostrar Saída', fn: () => mostrarPainel('saida') },
    { rotulo: 'Exibir: Mostrar Problemas', fn: () => mostrarPainel('problemas') },
    { rotulo: 'Editor: Alternar Código ↔ Visualização', fn: alternarModo, off: !temVisual() || estado.dividido },
    { rotulo: 'Editor: Abrir Visualização ao Lado', fn: alternarDivisao, off: !temVisual() },
    { rotulo: 'Preferências: Tema de Cores', fn: () => setTimeout(() => abrirPaleta('', 'tema'), 0) },
    { rotulo: 'Preferências: Abrir Configurações', fn: () => abrir('config') },
    { rotulo: 'Ajuda: Atalhos de Teclado', fn: () => abrir('atalhos') },
    { rotulo: 'Depurar: Iniciar Depuração', tecla: 'F5', fn: depurar },
    { rotulo: 'Ana: Copiar E-mail', fn: copiarEmail },
    { rotulo: 'Ana: Enviar E-mail', fn: () => { location.href = `mailto:${EMAIL}`; } },
    { rotulo: 'Ana: Abrir GitHub', fn: () => abrirFora(GITHUB) },
    { rotulo: 'Ana: Abrir LinkedIn', fn: () => abrirFora(LINKEDIN) },
    { rotulo: 'Abas: Reabrir Todas', fn: reabrirTodas },
    { rotulo: 'Abas: Fechar Todas', fn: fecharTodas },
  ].filter((c) => !c.off);

  const pal = { modo: 'arquivos', itens: [], ativo: 0, devolver: null, temaAntes: null };

  function casar(texto, q) {
    if (!q) return { pontos: 0, marcas: [] };
    const t = normPorChar(texto);
    const nq = norm(q);
    const i = t.indexOf(nq);
    if (i >= 0) return { pontos: 1000 - i, marcas: Array.from({ length: nq.length }, (_, k) => i + k) };
    const marcas = [];
    let j = 0;
    for (let k = 0; k < t.length && j < nq.length; k += 1) {
      if (t[k] === nq[j]) {
        marcas.push(k);
        j += 1;
      }
    }
    return j === nq.length ? { pontos: 100 - (marcas[marcas.length - 1] - marcas[0]), marcas } : null;
  }
  function realcar(texto, marcas) {
    const s = new Set(marcas);
    return texto.split('').map((c, k) => (s.has(k) ? `<mark>${esc(c)}</mark>` : esc(c))).join('');
  }

  function abrirPaleta(inicial = '', modo = 'arquivos') {
    fecharMenu();
    if (el.paleta.hidden) pal.devolver = d.activeElement;
    pal.modo = modo;
    pal.temaAntes = modo === 'tema' ? estado.tema : null;
    el.paleta.hidden = false;
    el.app.inert = true;
    el.palIn.value = inicial;
    el.palIn.placeholder = modo === 'tema'
      ? 'Selecione o Tema de Cores (Setas Acima/Abaixo para Visualizar)'
      : 'Pesquisar arquivos pelo nome (digite > para comandos)';
    filtrarPaleta();
    el.palIn.focus();
  }
  function fecharPaleta({ reverter = true } = {}) {
    if (el.paleta.hidden) return;
    if (reverter && pal.modo === 'tema' && pal.temaAntes) aplicarTema(pal.temaAntes, { salvar: false });
    el.paleta.hidden = true;
    el.app.inert = false;
    const alvo = pal.devolver;
    pal.devolver = null;
    if (alvo && alvo.isConnected && alvo.focus) alvo.focus();
  }

  function filtrarPaleta() {
    const v = el.palIn.value;
    let itens = [];
    if (pal.modo === 'tema') {
      itens = Object.entries(TEMAS).map(([k, t]) => ({ tipo: 'tema', chave: k, rotulo: t.nome, det: k === pal.temaAntes ? 'atual' : '', fn: () => aplicarTema(k) }));
    } else if (v.startsWith('>')) {
      itens = COMANDOS().map((c) => ({ ...c, tipo: 'cmd' }));
    } else {
      itens = Object.keys(ARQUIVOS).map((id) => ({ tipo: 'arq', id, rotulo: ARQUIVOS[id].nome, det: ARQUIVOS[id].pasta ? `portfolio-ana-neves/${ARQUIVOS[id].pasta}` : 'portfolio-ana-neves', icone: ARQUIVOS[id].icone, fn: () => abrir(id) }));
      if (v.trim()) itens = itens.concat(COMANDOS().map((c) => ({ ...c, tipo: 'cmd' })));
    }
    const q = (v.startsWith('>') ? v.slice(1) : v).trim();
    pal.itens = itens
      .map((it) => ({ ...it, casa: casar(it.rotulo, q) }))
      .filter((it) => it.casa)
      .sort((a, b) => (q ? b.casa.pontos - a.casa.pontos : 0));
    if (pal.modo === 'tema') pal.ativo = Math.max(0, pal.itens.findIndex((it) => it.chave === estado.tema));
    else pal.ativo = 0;
    renderPaleta();
  }

  function renderPaleta() {
    if (!pal.itens.length) {
      el.palLista.innerHTML = '<li class="pal-vazio" role="presentation">Nenhum resultado correspondente</li>';
      el.palIn.removeAttribute('aria-activedescendant');
      return;
    }
    let grupoAnterior = '';
    el.palLista.innerHTML = pal.itens.map((it, i) => {
      let h = '';
      if (pal.modo === 'arquivos' && it.tipo !== grupoAnterior && el.palIn.value.trim() && !el.palIn.value.startsWith('>')) {
        h += `<li class="pal-grupo" role="presentation">${it.tipo === 'arq' ? 'arquivos' : 'comandos'}</li>`;
        grupoAnterior = it.tipo;
      }
      const teclas = it.tecla ? `<span class="lado">${it.tecla.split('+').map((t) => `<kbd>${esc(t)}</kbd>`).join('')}</span>` : '';
      const icone = it.tipo === 'arq' ? ic(it.icone) : it.tipo === 'tema' ? ic('color-mode') : '';
      return `${h}<li class="pal-item${i === pal.ativo ? ' ativo' : ''}" id="pal-op-${i}" role="option" aria-selected="${i === pal.ativo}" data-i="${i}">${icone}<span class="rot">${realcar(it.rotulo, it.casa.marcas)}</span>${it.det ? `<span class="det">${esc(it.det)}</span>` : ''}${teclas}</li>`;
    }).join('');
    el.palIn.setAttribute('aria-activedescendant', `pal-op-${pal.ativo}`);
    const ativo = $(`#pal-op-${pal.ativo}`);
    if (ativo) ativo.scrollIntoView({ block: 'nearest' });
  }

  function moverPaleta(passo) {
    if (!pal.itens.length) return;
    pal.ativo = (pal.ativo + passo + pal.itens.length) % pal.itens.length;
    renderPaleta();
    const it = pal.itens[pal.ativo];
    if (pal.modo === 'tema') aplicarTema(it.chave, { salvar: false });
  }
  function escolherPaleta(i = pal.ativo) {
    const it = pal.itens[i];
    if (!it) return;
    fecharPaleta({ reverter: false });
    it.fn();
  }
  el.palIn.addEventListener('input', () => {
    if (pal.modo === 'tema' && el.palIn.value.startsWith('>')) pal.modo = 'arquivos';
    filtrarPaleta();
  });
  el.palIn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moverPaleta(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moverPaleta(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      escolherPaleta();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      fecharPaleta();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  });
  el.palLista.addEventListener('click', (e) => {
    const li = e.target.closest('[data-i]');
    if (li) escolherPaleta(+li.dataset.i);
  });
  el.palLista.addEventListener('pointermove', (e) => {
    const li = e.target.closest('[data-i]');
    if (!li || +li.dataset.i === pal.ativo) return;
    pal.ativo = +li.dataset.i;
    $$('.pal-item', el.palLista).forEach((x) => {
      const on = x === li;
      x.classList.toggle('ativo', on);
      x.setAttribute('aria-selected', String(on));
    });
    el.palIn.setAttribute('aria-activedescendant', li.id);
    if (pal.modo === 'tema') aplicarTema(pal.itens[pal.ativo].chave, { salvar: false });
  });
  d.addEventListener('pointerdown', (e) => {
    if (!el.paleta.hidden && !el.paleta.contains(e.target)) fecharPaleta();
  });
  $('#bt-central').addEventListener('click', () => abrirPaleta(''));
  $('#st-remoto').addEventListener('click', () => abrirPaleta('>'));
  $('#st-branch').addEventListener('click', () => mostrarVista('scm', { alternar: false }));
  $('#st-problemas').addEventListener('click', () => mostrarPainel('problemas'));

  /* ======================================================================
     Delegação global: data-abrir, data-acao, data-copiar
     ====================================================================== */
  const ACOES = {
    tema: (bt) => alternarMenu(itensTema(), bt, { focar: true }),
    'novo-arquivo': () => notificar({ texto: 'Este workspace é somente leitura, mas o terminal aceita comandos: Ctrl+J e digite help.' }),
    recolher: () => {
      estado.pastas = {};
      renderArvore();
    },
    reabrir: reabrirTodas,
    depurar,
    'depurar-parar': pararDepuracao,
    'term-novo': () => {
      mostrarPainel('terminal');
      limparTerminal();
      term.dispensada = false;
      boasVindas();
    },
    'term-focar': () => el.termIn.focus(),
    'term-perfis': (bt) => alternarMenu([
      { rotulo: 'pwsh', check: true, fn: ACOES['term-novo'] },
      '-',
      { rotulo: 'Configurar Perfil Padrão do Terminal', fn: () => abrir('config') },
    ], bt, { focar: true }),
    'term-mais': (bt) => alternarMenu([
      { rotulo: 'Novo Terminal', fn: ACOES['term-novo'] },
      { rotulo: 'Limpar Terminal', tecla: 'Ctrl+L', fn: () => { limparTerminal(); el.termIn.focus(); } },
      '-',
      { rotulo: 'Histórico de Comandos', fn: () => { executar('history'); el.termIn.focus(); } },
      { rotulo: 'Configurações do Terminal', fn: () => abrir('config') },
    ], bt, { focar: true }),
    'term-limpar': () => {
      if (estado.painelAba === 'terminal') limparTerminal();
      else if (estado.painelAba === 'saida') {
        logSaida.length = 0;
        renderPainel();
      } else if (estado.painelAba === 'depuracao') {
        logDepuracao.length = 0;
        renderPainel();
      }
    },
    'painel-max': (bt) => {
      const max = el.painel.classList.toggle('max');
      $('use', bt).setAttribute('href', `#i-${max ? 'screen-normal' : 'screen-full'}`);
      bt.setAttribute('aria-label', max ? 'Restaurar painel' : 'Maximizar painel');
      requestAnimationFrame(sincronizarMinimapa);
    },
    'painel-fechar': () => alternarPainel(false),
  };

  d.addEventListener('click', (e) => {
    const abre = e.target.closest('[data-abrir]');
    if (abre) {
      e.preventDefault();
      abrir(abre.dataset.abrir);
      return;
    }
    const acao = e.target.closest('[data-acao]');
    if (acao && ACOES[acao.dataset.acao]) {
      e.preventDefault();
      ACOES[acao.dataset.acao](acao);
      return;
    }
    const copia = e.target.closest('[data-copiar]');
    if (copia) {
      e.preventDefault();
      copiarEmail(copia);
    }
  });

  /* ======================================================================
     Atalhos de teclado
     ====================================================================== */
  d.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    const digitando = e.target.matches && e.target.matches('input, textarea');
    if (e.key === 'F1' || (mod && e.shiftKey && k === 'p')) {
      e.preventDefault();
      abrirPaleta('>');
    } else if (mod && !e.shiftKey && k === 'p') {
      e.preventDefault();
      abrirPaleta('');
    } else if (mod && (k === 'j' || e.code === 'Backquote')) {
      e.preventDefault();
      alternarPainel();
    } else if (mod && !e.shiftKey && k === 'b') {
      e.preventDefault();
      alternarLateral();
    } else if (mod && e.shiftKey && ['e', 'f', 'g', 'x', 'd'].includes(k)) {
      e.preventDefault();
      mostrarVista({ e: 'explorer', f: 'busca', g: 'scm', x: 'extensoes', d: 'depurar' }[k], { alternar: false });
    } else if (e.key === 'F5' && !mod && !e.shiftKey) {
      e.preventDefault();
      depurar();
    } else if (e.altKey && !mod && /^Digit[1-5]$/.test(e.code)) {
      e.preventDefault();
      abrir(SECOES[+e.code.slice(-1) - 1]);
    } else if (e.altKey && !mod && e.code === 'KeyZ' && !digitando) {
      e.preventDefault();
      alternarQuebra();
    } else if (mod && k === 'a' && !digitando && el.editor.contains(e.target)) {
      e.preventDefault();
      selecionarTudo();
    } else if (e.key === 'Escape') {
      if (!el.paleta.hidden) fecharPaleta();
      else if (menuAberto) fecharMenu(true);
      else if (el.app.classList.contains('gaveta')) fecharGaveta();
      else if (estado.zen) alternarZen(false);
      esconderDica();
    }
  });

  /* ======================================================================
     Sashes: redimensionar painel lateral e painel inferior
     ====================================================================== */
  function arrastavel(sash, aoMover, aoSoltar) {
    sash.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sash.setPointerCapture(e.pointerId);
      sash.classList.add('ativo');
      el.app.classList.add('redimensionando');
      const soltar = () => {
        sash.classList.remove('ativo');
        el.app.classList.remove('redimensionando');
        sash.removeEventListener('pointermove', aoMover);
        if (aoSoltar) aoSoltar();
      };
      sash.addEventListener('pointermove', aoMover);
      sash.addEventListener('pointerup', soltar, { once: true });
      sash.addEventListener('pointercancel', soltar, { once: true });
    });
  }
  let larguraLateral = 0;
  arrastavel($('#sash-lateral'), (e) => {
    const ini = $('.atividades').getBoundingClientRect().right;
    larguraLateral = Math.round(Math.min(520, Math.max(170, e.clientX - ini)));
    html.style.setProperty('--w-lateral', `${larguraLateral}px`);
    sincronizarMinimapa();
  }, () => larguraLateral && guarda.gravar('ana-lateral', String(larguraLateral)));
  $('#sash-lateral').addEventListener('dblclick', () => {
    html.style.removeProperty('--w-lateral');
    guarda.gravar('ana-lateral', '');
  });
  arrastavel($('#sash-painel'), (e) => {
    const area = el.area.getBoundingClientRect();
    const h = Math.round(Math.min(area.height * 0.85, Math.max(90, area.bottom - e.clientY)));
    el.painel.classList.remove('max');
    html.style.setProperty('--h-painel', `${h}px`);
    sincronizarMinimapa();
  });

  /* ======================================================================
     Início
     ====================================================================== */
  function iniciar() {
    const pedido = decodeURIComponent(location.hash.slice(1));
    if (ARQUIVOS[pedido]) {
      if (!estado.abertas.includes(pedido)) estado.abertas.push(pedido);
      estado.ativa = pedido;
      estado.historico = [pedido];
    }
    const lw = parseInt(guarda.ler('ana-lateral'), 10);
    if (lw >= 170 && lw <= 520) html.style.setProperty('--w-lateral', `${lw}px`);
    if (!mq.calmo.matches) {
      el.app.classList.add('abrindo');
      setTimeout(() => el.app.classList.remove('abrindo'), 1400);
    }
    renderArvore();
    render();
    aplicarLateral();
    registrar(`workbench pronto em ${Math.round(performance.now())} ms`);
    registrar(`tema de cores: ${TEMAS[estado.tema].nome}`);
    if (!guarda.lerSessao('ana-notif')) setTimeout(notificarDica, 4500);
  }

  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (ARQUIVOS[id] && id !== estado.ativa) abrir(id);
  });
  const aoMudarTela = () => {
    if (!mq.celular.matches) fecharGaveta();
    renderAbas();
    atualizarTitulo();
    if (estado.quebra === null && estado.ativa) el.editor.classList.toggle('quebra', el.editor.dataset.modo === 'codigo' && quebraAtiva());
    aplicarLateral();
    atualizarMinimapa();
  };
  [mq.celular, mq.largo].forEach((m) => {
    if (m.addEventListener) m.addEventListener('change', aoMudarTela);
    else if (m.addListener) m.addListener(aoMudarTela);
  });

  iniciar();
})();
