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
  // Idioma da página (o tema.js decide antes de pintar): cada texto visível vem em par.
  const EN = html.dataset.idioma === 'en';
  const L = (pt, en) => (EN ? en : pt);

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
    notas: 'https://notas-fiscais-ana.vercel.app',
  };

  const TEMAS = {
    dracula: { nome: 'Dracula', fundo: '#282a36' },
    'dark-modern': { nome: 'Dark Modern', fundo: '#1f1f1f' },
    'light-modern': { nome: 'Light Modern', fundo: '#ffffff' },
    hc: { nome: 'Dark High Contrast', fundo: '#000000' },
  };

  const ARQUIVOS = {
    // a extensão "Ana Neves" instalada (este workspace é o projeto dela): é página, não arquivo
    sobre: { nome: 'Ana Neves', titulo: 'Ana Neves', icone: 'f-extension', ling: 'md', rotulo: 'Markdown', tpl: 'tpl-extensao', inicial: 'visual', extensao: true, soPagina: true },
    readme: { nome: 'README.md', icone: 'f-markdown', ling: 'md', rotulo: 'Markdown', inicial: 'visual' },
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
  const ORDEM_BUSCA = ['readme', 'projetos', 'experiencia', 'stack', 'contato', 'pacote', 'config', 'atalhos'];
  const ARVORE = [
    { pasta: '.vscode', fechada: 'folder-vscode', aberta: 'folder-vscode-open', filhos: ['config'] },
    { pasta: 'assets', fechada: 'folder', aberta: 'folder-open', filhos: ['img-mini', 'img-acenando', 'img-programando'] },
    'contato', 'experiencia', 'pacote', 'projetos', 'readme', 'stack',
  ];

  const FONTES = {
    readme: () => `# Ana Neves

> **Backend, dados e IA em produção.**
> Software Developer com produtos próprios no ar · São Paulo, Brasil · [ana@dev](https://github.com/An4D3v)

Construo pipelines que movem milhões de registros, bots com IA que
respondem no Teams e apps que pessoas de verdade usam todo dia.
Gosto de sistema que se explica: idempotente, medido e com teste
que sabe falhar.

## Números

- **4,5M+** registros processados pelos pipelines que mantenho
- **70+** pessoas usando os apps que criei e opero
- **28** testes de integração contra SQL Server real, em microsserviços .NET
- **−91%** de erros de cota de API com orquestração inteligente de cargas

## Produtos no ar

- **Rumo** — orientador de rotinas (PWA, 40+ usuários): https://rumo-amber.vercel.app
- **AlienFinanças** — finanças com leitura de nota fiscal por IA (20+ usuários): https://financas-app-ruby.vercel.app
- **Notas Fiscais** — microsserviços .NET no Azure, 28 testes: https://notas-fiscais-ana.vercel.app
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
    status: 'em produção',
    resumo: 'Dois serviços .NET: UPDATE atômico, idempotência e recuperação de falha.',
    testes: 28,
    stack: ['C# / .NET 8', 'Angular', 'EF Core', 'SQL Server'],
    links: { app: 'https://notas-fiscais-ana.vercel.app', codigo: 'https://github.com/An4D3v/notas-fiscais-microsservicos' },
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
  "name": "software-developer",
  "displayName": "Ana Neves",
  "description": "Software Developer com produtos próprios no ar.",
  "version": "2026.10.0",
  "publisher": "ana-neves",
  "author": "Ana Neves <ana-neves98@outlook.com>",
  "homepage": "https://github.com/An4D3v",
  "icon": "assets/ana-programando.webp",
  "engines": { "vscode": "^1.100.0" },
  "categories": ["Backend", ".NET", "Azure", "Dados", "IA", "Automação"],
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
  "workbench.displayLanguage": "pt-br",
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
    pacote: {
      displayName: 'O nome da aba Extensão: Ana Neves. Este workspace é o projeto dessa extensão, e o README.md é o texto dela.',
      dependencies: 'Zero dependências: este portfólio é HTML, CSS e JavaScript puros, sem framework.',
    },
    config: {
      'workbench.colorTheme': 'Dá para trocar pela paleta: Ctrl+Shift+P → Preferências: Tema de Cores.',
      'workbench.displayLanguage': 'Troque entre português e inglês pela barra de status (canto inferior direito) ou pela paleta.',
      'editor.minimap.enabled': 'O minimapa aparece no código em telas largas: clique ou arraste nele para rolar.',
      'terminal.integrated.defaultProfile.windows': 'O terminal deste portfólio imita um PowerShell: abra com Ctrl+J e digite help.',
    },
  };

  // Versão em inglês do código-fonte de cada arquivo (o FONTES acima é o português).
  const FONTES_EN = {
    readme: () => `# Ana Neves

> **Backend, data and AI in production.**
> Software Developer with her own products live · São Paulo, Brazil · [ana@dev](https://github.com/An4D3v)

I build pipelines that move millions of records, AI bots that
answer in Teams and apps that real people use every day.
I like systems that explain themselves: idempotent, measured and
with tests that know how to fail.

## Numbers

- **4.5M+** records processed by the pipelines I maintain
- **70+** people using the apps I built and run
- **28** integration tests against a real SQL Server, in .NET microservices
- **−91%** API quota errors with smart load orchestration

## Live products

- **Rumo** — routine companion (PWA, 40+ users): https://rumo-amber.vercel.app
- **AlienFinanças** — personal finance with AI receipt reading (20+ users): https://financas-app-ruby.vercel.app
- **Notas Fiscais** — .NET microservices on Azure, 28 tests: https://notas-fiscais-ana.vercel.app
- **Vale do Trevo** — 2D game in plain canvas: https://vale-do-trevo.vercel.app

## Tabs in this editor

1. \`projects.tsx\` — the products, with links
2. \`experience.cs\` — career path and behind the scenes
3. \`stack.json\` — what I work with
4. \`contact.ts\` — let's talk?

[GitHub](https://github.com/An4D3v) · [LinkedIn](https://www.linkedin.com/in/anad3v/) · [Email](mailto:ana-neves98@outlook.com)

<!-- while (true) { learn(); build(); ship(); } -->`,

    projetos: () => `// projects.tsx — built, shipped and run by me, from database to deploy.

type Project = {
  name: string;
  status: 'in production' | 'open source' | 'playable';
  summary: string;
  users?: string;
  tests?: number;
  stack: string[];
  links: Record<string, string>;
};

export const projects: Project[] = [
  {
    name: 'Rumo',
    status: 'in production',
    summary: 'Routine companion: Web Push, MFA (TOTP) and its own admin panel.',
    users: '40+',
    stack: ['React', 'TypeScript', 'Supabase', 'Vercel'],
    links: { app: 'https://rumo-amber.vercel.app' },
  },
  {
    name: 'AlienFinanças',
    status: 'in production',
    summary: 'Personal finance: a photo of the receipt becomes AI-categorized items.',
    users: '20+',
    stack: ['React', 'TypeScript', 'Supabase', 'AI (LLM)'],
    links: { app: 'https://financas-app-ruby.vercel.app' },
  },
  {
    name: 'Notas Fiscais — microservices',
    status: 'in production',
    summary: 'Two .NET services: atomic UPDATE, idempotency and failure recovery.',
    tests: 28,
    stack: ['C# / .NET 8', 'Angular', 'EF Core', 'SQL Server'],
    links: { app: 'https://notas-fiscais-ana.vercel.app', code: 'https://github.com/An4D3v/notas-fiscais-microsservicos' },
  },
  {
    name: 'Vale do Trevo',
    status: 'playable',
    summary: 'Top-down 2D game in plain canvas, no engine. Art by my friend, code by me.',
    stack: ['TypeScript', 'Vite', 'Canvas'],
    links: {
      play: 'https://vale-do-trevo.vercel.app',
      code: 'https://github.com/An4D3v/vale-do-trevo',
    },
  },
];

export function Projects() {
  return (
    <Grid>
      {projects.map((p) => (
        <Card key={p.name} {...p} />
      ))}
    </Grid>
  );
}`,

    experiencia: () => `// experience.cs — from data collection to owning the platform.

namespace AnaNeves.Portfolio;

public record Stage(string Where, string Role, string Summary);
public record Delivery(string Name, string Result);

public static class Experience
{
    public static readonly Stage[] Path =
    {
        new("Law firm, São Paulo", "first and only developer",
            "Platform built from scratch: legal ERP integration, data-collection robots and AI bots."),
        new("Own products", "in parallel",
            "Three apps live: PWA, Web Push, MFA, RLS, AI document reading."),
        new("Jusbrasil", "data",
            "Large-scale data collection with crawlers."),
    };

    // private code, public results
    public static readonly Delivery[] BehindTheScenes =
    {
        new("Integration pipelines", "7+ incremental loads · 4.5M+ records · idempotent MERGE"),
        new("Load orchestration", "−66% API calls · −91% quota errors"),
        new("AI bots in Teams", "SSO with Entra ID · Adaptive Cards · real users"),
        new("AI classification", "LLM in production · accuracy measured against a human answer key"),
        new("Migration to Azure SQL", "~292k records · zero mismatches"),
        new("Automation & RPA", "Python + Selenium · −65% manual effort"),
    };

    public static string Mentoring => "I mentor an intern on the technical side";
}`,

    stack: () => `{
  "backend": ["C#", ".NET 8", "Python", "REST APIs", "OAuth2", "EF Core"],
  "cloud": [
    "Azure App Service", "Azure SQL", "Azure Automation",
    "Key Vault", "Application Insights", "Entra ID", "Microsoft Graph"
  ],
  "data": ["SQL Server", "T-SQL", "PostgreSQL", "Supabase", "incremental ETL", "reconciliation"],
  "front": ["Angular", "React", "TypeScript", "Vite", "PWA"],
  "ai": ["LLMs in production", "Bot Framework", "prompt engineering", "accuracy measurement"],
  "automation": ["Python", "Selenium", "runbooks"],
  "devops": ["GitHub Actions", "OIDC", "CI/CD with test gates", "Vercel", "observability"]
}`,

    contato: () => `// contact.ts — to talk about .NET backend, data and applied AI.

export const contact = {
  email: 'ana-neves98@outlook.com',
  github: 'https://github.com/An4D3v',
  linkedin: 'https://www.linkedin.com/in/anad3v/',
  base: 'São Paulo, Brazil',
} as const;

export function talk(): void {
  window.location.href = \`mailto:\${contact.email}\`;
}

// while (true) { learn(); build(); ship(); }`,

    pacote: () => `{
  "name": "software-developer",
  "displayName": "Ana Neves",
  "description": "Software Developer with her own products live.",
  "version": "2026.10.0",
  "publisher": "ana-neves",
  "author": "Ana Neves <ana-neves98@outlook.com>",
  "homepage": "https://github.com/An4D3v",
  "icon": "assets/ana-programando.webp",
  "engines": { "vscode": "^1.100.0" },
  "categories": ["Backend", ".NET", "Azure", "Data", "AI", "Automation"],
  "scripts": {
    "dev": "learn",
    "build": "build",
    "deploy": "ship"
  },
  "dependencies": {},
  "devDependencies": {}
}`,

    config: () => `// .vscode/settings.json — this editor's preferences
{
  "workbench.colorTheme": "${TEMAS[estado.tema].nome}",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.displayLanguage": "en",
  "editor.fontFamily": "Cascadia Code, Consolas, monospace",
  "editor.minimap.enabled": ${estado.minimapa},
  "editor.wordWrap": "${quebraAtiva() ? 'on' : 'off'}",
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "ana.focus": [".NET backend", "data", "applied AI"]
}`,

    atalhos: () => `# Keyboard shortcuts

They work like in VS Code. On a Mac, swap \`Ctrl\` for \`Cmd\`.

- \`Ctrl+Shift+P\` or \`F1\` — command palette
- \`Ctrl+P\` — open a file by name
- \`Ctrl+J\` — show or hide the terminal
- \`Ctrl+B\` — show or hide the side bar
- \`Ctrl+Shift+E\` — file explorer
- \`Ctrl+Shift+F\` — search across all files
- \`Ctrl+Shift+G\` — source control (repositories and a message)
- \`Ctrl+Shift+X\` — extensions (the stack)
- \`Alt+1\` to \`Alt+5\` — jump straight to each tab
- \`Alt+Z\` — word wrap in code
- \`F5\` — run and debug
- \`Esc\` — closes the palette, menus and drawer

## In the terminal

- \`help\` lists the commands
- \`Tab\` completes, \`↑\` and \`↓\` walk the history, \`Esc\` leaves the terminal`,
  };

  const DICAS_EN = {
    projetos: {
      users: 'Real accounts registered in the app.',
      tests: 'Integration tests that run against a real SQL Server.',
    },
    experiencia: {
      BehindTheScenes: 'Work projects: the code is private, so only the results show up.',
      Mentoring: 'Day-to-day technical mentoring of an intern.',
    },
    contato: { talk: "Opens your email client with Ana's address already filled in." },
    pacote: {
      displayName: "The name on the Extension: Ana Neves tab. This workspace is that extension's project, and README.md is its text.",
      dependencies: 'Zero dependencies: this portfolio is plain HTML, CSS and JavaScript, no framework.',
    },
    config: {
      'workbench.colorTheme': 'You can switch it from the palette: Ctrl+Shift+P → Preferences: Color Theme.',
      'workbench.displayLanguage': 'Switch between English and Portuguese from the status bar (bottom right) or the palette.',
      'editor.minimap.enabled': 'The minimap shows up in code on wide screens: click or drag it to scroll.',
      'terminal.integrated.defaultProfile.windows': "This portfolio's terminal mimics PowerShell: open it with Ctrl+J and type help.",
    },
  };

  const REPOS = [
    { nome: 'notas-fiscais-microsservicos', ling: 'C#', desc: 'Notas fiscais: microsserviços .NET + Angular' },
    { nome: 'vale-do-trevo', ling: 'TypeScript', desc: 'Jogo 2D em canvas puro' },
    { nome: 'image-collector', ling: 'Python', desc: 'Integração com Unsplash e Google Drive via OAuth 2.0' },
    { nome: 'An4D3v', ling: 'Markdown', desc: 'README do perfil no GitHub' },
  ];
  const REPOS_EN = ['Brazilian invoices: .NET microservices + Angular', '2D game in plain canvas', 'Unsplash and Google Drive integration via OAuth 2.0', 'GitHub profile README'];

  const EXTENSOES = [
    { ic: 'cs', nome: 'C# / .NET 8', desc: 'Pipelines de integração, APIs e microsserviços.' },
    { ic: 'az', nome: 'Azure', desc: 'App Service, Azure SQL, Automation, Key Vault, Application Insights.' },
    { ic: 'sql', nome: 'SQL Server · T-SQL', desc: 'MERGE idempotente, watermark e reconciliação.' },
    { ic: 'py', nome: 'Python', desc: 'Robôs com Selenium e scripts de dados.' },
    { ic: 'ia', nome: 'LLMs em produção', desc: 'Classificador de publicações e leitura de nota fiscal.' },
    { ic: 'id', nome: 'Entra ID · Microsoft Graph', desc: 'SSO nos bots e autenticação sem senha.' },
    { ic: 'ng', nome: 'Angular', desc: 'Front do sistema de notas fiscais.' },
    { ic: 're', nome: 'React + TypeScript', desc: 'Rumo e AlienFinanças.' },
    { ic: 'sb', nome: 'Supabase · PostgreSQL', desc: 'Auth com MFA e Row Level Security nos apps próprios.' },
    { ic: 'gh', nome: 'GitHub Actions', desc: 'CI/CD com OIDC e gate de testes.' },
  ];

  // Página de extensão de cada tecnologia da Stack. Só fatos que já estão no
  // portfólio (projetos.tsx, experiencia.cs, README) ou nos repositórios abertos.
  const REPO_NOTAS = 'https://github.com/An4D3v/notas-fiscais-microsservicos';
  const DETALHES_TEC = {
    cs: {
      slug: 'csharp',
      categorias: ['Backend', '.NET'],
      uso: [
        ['database', 'Pipelines de integração', '7+ cargas incrementais de um ERP jurídico para Azure SQL, com MERGE idempotente e watermark.', 'experiencia|Pipelines de integração'],
        ['server', 'Notas Fiscais — microsserviços', 'Estoque e Faturamento em .NET 8: UPDATE atômico contra concorrência, idempotência e recuperação de falha. No ar no Azure App Service.', 'projetos#pj-notas'],
      ],
      numeros: [
        { alvo: 4.5, casas: 1, depois: 'M+', final: '4,5M+', texto: 'registros nos pipelines de integração', ir: 'experiencia|4,5M+ registros' },
        { alvo: 28, final: '28', texto: 'testes de integração contra SQL Server real', ir: 'projetos#pj-notas' },
      ],
      recursos: ['.NET 8', 'ASP.NET Core Minimal APIs', 'Entity Framework Core', 'Polly (resiliência HTTP)', 'FluentValidation', 'Serilog', 'xUnit', 'Swagger / OpenAPI', 'APIs REST', 'OAuth2'],
      links: [['Abrir Notas Fiscais', 'https://notas-fiscais-ana.vercel.app'], ['Código no GitHub', REPO_NOTAS]],
      privado: true,
    },
    az: {
      slug: 'azure',
      categorias: ['Cloud'],
      uso: [
        ['server', 'Notas Fiscais no ar', 'Os dois serviços rodam no App Service e falam com o Azure SQL por identidade gerenciada, sem senha.', 'projetos#pj-notas'],
        ['database', 'Pipelines de integração', '7+ cargas incrementais de um ERP jurídico para Azure SQL.', 'experiencia|Pipelines de integração'],
        ['sync', 'Migração para Azure SQL', '~292 mil registros migrados com reconciliação origem = destino.', 'experiencia|Migração para Azure SQL'],
      ],
      numeros: [
        { alvo: 292, antes: '~', depois: ' mil', final: '~292 mil', texto: 'registros migrados para o Azure SQL', ir: 'experiencia|Migração para Azure SQL' },
        { alvo: 0, final: '0', texto: 'divergências na reconciliação da migração', ir: 'experiencia|zero divergência' },
      ],
      recursos: ['App Service', 'Azure SQL', 'Azure Automation', 'Key Vault', 'Application Insights', 'Entra ID', 'Microsoft Graph', 'identidade gerenciada'],
      links: [['Abrir Notas Fiscais', 'https://notas-fiscais-ana.vercel.app']],
      privado: true,
    },
    sql: {
      slug: 'sql-server',
      categorias: ['Dados'],
      uso: [
        ['database', 'Pipelines de integração', 'MERGE idempotente com watermark: reprocessar uma carga não duplica registro.', 'experiencia|Pipelines de integração'],
        ['sync', 'Migração para Azure SQL', '~292 mil registros com reconciliação origem = destino: zero divergência.', 'experiencia|Migração para Azure SQL'],
        ['server', 'Notas Fiscais — microsserviços', 'Saldo conferido e baixado no mesmo UPDATE: com 8 pedidos simultâneos em saldo 1, só um passa.', 'projetos#pj-notas'],
      ],
      numeros: [
        { alvo: 4.5, casas: 1, depois: 'M+', final: '4,5M+', texto: 'registros nas cargas incrementais', ir: 'experiencia|4,5M+ registros' },
        { alvo: 292, antes: '~', depois: ' mil', final: '~292 mil', texto: 'registros migrados sem divergência', ir: 'experiencia|Migração para Azure SQL' },
      ],
      recursos: ['SQL Server', 'T-SQL', 'Azure SQL', 'MERGE', 'ETL incremental', 'watermark', 'reconciliação', 'PostgreSQL'],
      links: [['Código dos microsserviços', REPO_NOTAS]],
      privado: true,
    },
    py: {
      slug: 'python',
      categorias: ['Automação'],
      uso: [
        ['sync', 'Automação e RPA', 'Robôs Python + Selenium coletando relatórios regulatórios para múltiplos clientes.', 'experiencia|Automação'],
      ],
      numeros: [
        { alvo: 65, antes: '−', depois: '%', final: '−65%', texto: 'de esforço manual com os robôs', ir: 'experiencia|−65%' },
      ],
      recursos: ['Python', 'Selenium', 'runbooks'],
      links: [],
      privado: true,
    },
    ia: {
      slug: 'llms',
      categorias: ['IA'],
      uso: [
        ['sparkle', 'Classificação de publicações', 'Classificador LLM em produção, com acurácia medida contra gabarito humano e execução sombra antes de promover modelo novo.', 'experiencia|Classificação de publicações'],
        ['comment-discussion', 'Bots com IA no Teams', 'Central de IA corporativa com SSO (Entra ID) e consulta processual com Adaptive Cards, com usuários reais.', 'experiencia|Bots com IA no Teams'],
        ['rocket', 'AlienFinanças', 'A foto do cupom fiscal vira itens categorizados por IA.', 'projetos#pj-alien'],
        ['server', 'Notas Fiscais', 'Montar nota por texto: a IA sugere itens do catálogo, o servidor confere cada código e a pessoa decide. Sem chave de API, entra um modo offline.', 'projetos#pj-notas'],
      ],
      numeros: [],
      recursos: ['LLMs em produção', 'Bot Framework', 'Adaptive Cards', 'prompt engineering', 'saída estruturada (JSON)', 'medição de acurácia', 'execução sombra', 'Gemini'],
      links: [['Abrir AlienFinanças', 'https://financas-app-ruby.vercel.app'], ['Abrir Notas Fiscais', 'https://notas-fiscais-ana.vercel.app']],
      privado: true,
    },
    id: {
      slug: 'entra-id',
      categorias: ['Identidade', 'Cloud'],
      uso: [
        ['comment-discussion', 'Bots com IA no Teams', 'SSO com Entra ID: quem já está no Teams entra no bot sem outro login.', 'experiencia|Bots com IA no Teams'],
        ['sync', 'Migração para Azure SQL', 'Autenticação sem senha via Entra ID.', 'experiencia|Migração para Azure SQL'],
        ['server', 'Notas Fiscais no ar', 'Cada serviço entra no banco com a própria identidade gerenciada, sem senha em configuração.', 'projetos#pj-notas'],
      ],
      numeros: [
        { alvo: 0, final: '0', texto: 'senhas de banco na configuração do Notas Fiscais', ir: 'projetos#pj-notas' },
      ],
      recursos: ['Entra ID', 'SSO', 'identidade gerenciada', 'Microsoft Graph', 'OAuth2', 'OIDC'],
      links: [['Código dos microsserviços', REPO_NOTAS]],
      privado: true,
    },
    ng: {
      slug: 'angular',
      categorias: ['Front-end'],
      uso: [
        ['server', 'Notas Fiscais — front', 'Angular 22 sem zone.js: o estado da tela vive em signals.', 'projetos#pj-notas'],
        ['search', 'Busca de produtos', 'RxJS com debounceTime, distinctUntilChanged e switchMap: digitar rápido não dispara uma busca por letra.', 'projetos#pj-notas'],
        ['pass', 'Saúde dos serviços ao vivo', 'Um timer com RxJS consulta os dois serviços e acende o indicador do topo quando um deles cai.', 'projetos#pj-notas'],
      ],
      numeros: [],
      recursos: ['Angular 22', 'signals', 'RxJS', 'Angular Material', 'interceptores HTTP', 'TypeScript'],
      links: [['Abrir Notas Fiscais', 'https://notas-fiscais-ana.vercel.app'], ['Código no GitHub', REPO_NOTAS]],
      privado: false,
    },
    re: {
      slug: 'react',
      categorias: ['Front-end'],
      uso: [
        ['rocket', 'Rumo', 'Orientador de rotinas: PWA com Web Push, MFA (TOTP) e painel admin próprio. 40+ usuários.', 'projetos#pj-rumo'],
        ['rocket', 'AlienFinanças', 'Finanças pessoais com leitura de cupom fiscal por IA. 20+ usuários.', 'projetos#pj-alien'],
        ['play', 'Vale do Trevo', 'Jogo 2D em TypeScript e canvas puro, sem engine.', 'projetos#pj-trevo'],
      ],
      numeros: [
        { alvo: 70, depois: '+', final: '70+', texto: 'pessoas usando o Rumo e o AlienFinanças', ir: 'projetos#pj-rumo, #pj-alien' },
        { alvo: 3, final: '3', texto: 'apps em TypeScript no ar', ir: 'projetos#pj-rumo, #pj-alien, #pj-trevo' },
      ],
      recursos: ['React', 'TypeScript', 'Vite', 'PWA', 'Web Push', 'Canvas'],
      links: [['Abrir o Rumo', 'https://rumo-amber.vercel.app'], ['Abrir AlienFinanças', 'https://financas-app-ruby.vercel.app'], ['Jogar o Vale do Trevo', 'https://vale-do-trevo.vercel.app']],
      privado: false,
    },
    sb: {
      slug: 'supabase',
      categorias: ['Dados', 'Auth'],
      uso: [
        ['rocket', 'Rumo', 'Login com MFA (TOTP) pelo Supabase Auth.', 'projetos#pj-rumo'],
        ['rocket', 'AlienFinanças', 'Row Level Security: cada pessoa só enxerga os próprios dados.', 'projetos#pj-alien'],
      ],
      numeros: [
        { alvo: 70, depois: '+', final: '70+', texto: 'pessoas com conta nos dois apps', ir: 'projetos#pj-rumo, #pj-alien' },
      ],
      recursos: ['Supabase Auth', 'MFA (TOTP)', 'Row Level Security', 'PostgreSQL'],
      links: [['Abrir o Rumo', 'https://rumo-amber.vercel.app'], ['Abrir AlienFinanças', 'https://financas-app-ruby.vercel.app']],
      privado: false,
    },
    gh: {
      slug: 'github-actions',
      categorias: ['DevOps'],
      uso: [
        ['database', 'Pipelines de integração', 'CI/CD com OIDC: o deploy na nuvem não depende de segredo guardado no repositório.', 'experiencia|Pipelines de integração'],
        ['pass', 'Gate de testes', 'O deploy só segue com os testes verdes.', 'experiencia|Pipelines de integração'],
      ],
      numeros: [],
      recursos: ['GitHub Actions', 'OIDC', 'CI/CD com gate de testes', 'Vercel', 'observabilidade'],
      links: [['Repositórios no GitHub', 'https://github.com/An4D3v']],
      privado: true,
    },
  };
  // Inglês das extensões: o que muda de idioma em EXTENSOES e DETALHES_TEC.
  const TEC_EN = {
    cs: {
      desc: 'Integration pipelines, APIs and microservices.',
      uso: [
        ['database', 'Integration pipelines', '7+ incremental loads from a legal ERP into Azure SQL, with idempotent MERGE and watermark.', 'experiencia|Integration pipelines'],
        ['server', 'Notas Fiscais — microservices', 'Stock and Billing in .NET 8: atomic UPDATE against concurrency, idempotency and failure recovery. Live on Azure App Service.', 'projetos#pj-notas'],
      ],
      numeros: [
        { alvo: 4.5, casas: 1, depois: 'M+', final: '4.5M+', texto: 'records in the integration pipelines', ir: 'experiencia|4.5M+ records' },
        { alvo: 28, final: '28', texto: 'integration tests against a real SQL Server', ir: 'projetos#pj-notas' },
      ],
      recursos: ['.NET 8', 'ASP.NET Core Minimal APIs', 'Entity Framework Core', 'Polly (HTTP resilience)', 'FluentValidation', 'Serilog', 'xUnit', 'Swagger / OpenAPI', 'REST APIs', 'OAuth2'],
      links: [['Open Notas Fiscais', APPS.notas], ['Code on GitHub', REPO_NOTAS]],
    },
    az: {
      desc: 'App Service, Azure SQL, Automation, Key Vault, Application Insights.',
      uso: [
        ['server', 'Notas Fiscais live', 'Both services run on App Service and talk to Azure SQL through a managed identity, with no password.', 'projetos#pj-notas'],
        ['database', 'Integration pipelines', '7+ incremental loads from a legal ERP into Azure SQL.', 'experiencia|Integration pipelines'],
        ['sync', 'Migration to Azure SQL', '~292k records migrated with source = target reconciliation.', 'experiencia|Migration to Azure SQL'],
      ],
      numeros: [
        { alvo: 292, antes: '~', depois: 'k', final: '~292k', texto: 'records migrated to Azure SQL', ir: 'experiencia|Migration to Azure SQL' },
        { alvo: 0, final: '0', texto: 'mismatches in the migration reconciliation', ir: 'experiencia|zero mismatches' },
      ],
      recursos: ['App Service', 'Azure SQL', 'Azure Automation', 'Key Vault', 'Application Insights', 'Entra ID', 'Microsoft Graph', 'managed identity'],
      links: [['Open Notas Fiscais', APPS.notas]],
    },
    sql: {
      desc: 'Idempotent MERGE, watermark and reconciliation.',
      categorias: ['Data'],
      uso: [
        ['database', 'Integration pipelines', 'Idempotent MERGE with watermark: reprocessing a load never duplicates a record.', 'experiencia|Integration pipelines'],
        ['sync', 'Migration to Azure SQL', '~292k records with source = target reconciliation: zero mismatches.', 'experiencia|Migration to Azure SQL'],
        ['server', 'Notas Fiscais — microservices', 'Stock checked and deducted in the same UPDATE: with 8 simultaneous orders on a stock of 1, only one goes through.', 'projetos#pj-notas'],
      ],
      numeros: [
        { alvo: 4.5, casas: 1, depois: 'M+', final: '4.5M+', texto: 'records in the incremental loads', ir: 'experiencia|4.5M+ records' },
        { alvo: 292, antes: '~', depois: 'k', final: '~292k', texto: 'records migrated with no mismatches', ir: 'experiencia|Migration to Azure SQL' },
      ],
      recursos: ['SQL Server', 'T-SQL', 'Azure SQL', 'MERGE', 'incremental ETL', 'watermark', 'reconciliation', 'PostgreSQL'],
      links: [['Microservices code', REPO_NOTAS]],
    },
    py: {
      desc: 'Selenium robots and data scripts.',
      categorias: ['Automation'],
      uso: [
        ['sync', 'Automation & RPA', 'Python + Selenium robots collecting regulatory reports for multiple clients.', 'experiencia|Automation'],
      ],
      numeros: [
        { alvo: 65, antes: '−', depois: '%', final: '−65%', texto: 'manual effort with the robots', ir: 'experiencia|−65%' },
      ],
    },
    ia: {
      nome: 'LLMs in production',
      desc: 'Legal notice classifier and receipt reading.',
      categorias: ['AI'],
      uso: [
        ['sparkle', 'Legal notice classification', 'LLM classifier in production, with accuracy measured against a human answer key and shadow runs before promoting a new model.', 'experiencia|AI classification'],
        ['comment-discussion', 'AI bots in Teams', 'Company-wide AI hub with SSO (Entra ID) and legal case lookup with Adaptive Cards, with real users.', 'experiencia|AI bots in Teams'],
        ['rocket', 'AlienFinanças', 'A photo of the receipt becomes AI-categorized items.', 'projetos#pj-alien'],
        ['server', 'Notas Fiscais', 'Build an invoice from text: the AI suggests catalog items, the server checks every code and the person decides. Without an API key, an offline mode kicks in.', 'projetos#pj-notas'],
      ],
      recursos: ['LLMs in production', 'Bot Framework', 'Adaptive Cards', 'prompt engineering', 'structured output (JSON)', 'accuracy measurement', 'shadow runs', 'Gemini'],
      links: [['Open AlienFinanças', APPS.alien], ['Open Notas Fiscais', APPS.notas]],
    },
    id: {
      desc: 'SSO in the bots and passwordless authentication.',
      categorias: ['Identity', 'Cloud'],
      uso: [
        ['comment-discussion', 'AI bots in Teams', 'SSO with Entra ID: anyone already in Teams gets into the bot with no extra sign-in.', 'experiencia|AI bots in Teams'],
        ['sync', 'Migration to Azure SQL', 'Passwordless authentication via Entra ID.', 'experiencia|Migration to Azure SQL'],
        ['server', 'Notas Fiscais live', 'Each service signs in to the database with its own managed identity, with no password in configuration.', 'projetos#pj-notas'],
      ],
      numeros: [
        { alvo: 0, final: '0', texto: 'database passwords in the Notas Fiscais configuration', ir: 'projetos#pj-notas' },
      ],
      recursos: ['Entra ID', 'SSO', 'managed identity', 'Microsoft Graph', 'OAuth2', 'OIDC'],
      links: [['Microservices code', REPO_NOTAS]],
    },
    ng: {
      desc: 'Front end of the invoicing system.',
      categorias: ['Front end'],
      uso: [
        ['server', 'Notas Fiscais — front end', 'Angular 22 without zone.js: screen state lives in signals.', 'projetos#pj-notas'],
        ['search', 'Product search', 'RxJS with debounceTime, distinctUntilChanged and switchMap: typing fast does not fire one search per letter.', 'projetos#pj-notas'],
        ['pass', 'Live service health', 'An RxJS timer polls both services and lights up the indicator at the top when one of them goes down.', 'projetos#pj-notas'],
      ],
      recursos: ['Angular 22', 'signals', 'RxJS', 'Angular Material', 'HTTP interceptors', 'TypeScript'],
      links: [['Open Notas Fiscais', APPS.notas], ['Code on GitHub', REPO_NOTAS]],
    },
    re: {
      desc: 'Rumo and AlienFinanças.',
      categorias: ['Front end'],
      uso: [
        ['rocket', 'Rumo', 'Routine companion: PWA with Web Push, MFA (TOTP) and its own admin panel. 40+ users.', 'projetos#pj-rumo'],
        ['rocket', 'AlienFinanças', 'Personal finance with AI receipt reading. 20+ users.', 'projetos#pj-alien'],
        ['play', 'Vale do Trevo', '2D game in TypeScript and plain canvas, no engine.', 'projetos#pj-trevo'],
      ],
      numeros: [
        { alvo: 70, depois: '+', final: '70+', texto: 'people using Rumo and AlienFinanças', ir: 'projetos#pj-rumo, #pj-alien' },
        { alvo: 3, final: '3', texto: 'TypeScript apps live', ir: 'projetos#pj-rumo, #pj-alien, #pj-trevo' },
      ],
      links: [['Open Rumo', APPS.rumo], ['Open AlienFinanças', APPS.alien], ['Play Vale do Trevo', APPS.trevo]],
    },
    sb: {
      desc: 'Auth with MFA and Row Level Security in my own apps.',
      categorias: ['Data', 'Auth'],
      uso: [
        ['rocket', 'Rumo', 'Sign-in with MFA (TOTP) through Supabase Auth.', 'projetos#pj-rumo'],
        ['rocket', 'AlienFinanças', 'Row Level Security: each person only sees their own data.', 'projetos#pj-alien'],
      ],
      numeros: [
        { alvo: 70, depois: '+', final: '70+', texto: 'people with accounts in the two apps', ir: 'projetos#pj-rumo, #pj-alien' },
      ],
      links: [['Open Rumo', APPS.rumo], ['Open AlienFinanças', APPS.alien]],
    },
    gh: {
      desc: 'CI/CD with OIDC and a test gate.',
      uso: [
        ['database', 'Integration pipelines', 'CI/CD with OIDC: deploying to the cloud does not depend on a secret stored in the repository.', 'experiencia|Integration pipelines'],
        ['pass', 'Test gate', 'Deploys only go ahead with green tests.', 'experiencia|Integration pipelines'],
      ],
      recursos: ['GitHub Actions', 'OIDC', 'CI/CD with test gates', 'Vercel', 'observability'],
      links: [['Repositories on GitHub', GITHUB]],
    },
  };

  // Versão em inglês: nomes de arquivo, textos e fontes trocados antes de montar a tela.
  if (EN) {
    ARQUIVOS.projetos.nome = 'projects.tsx';
    ARQUIVOS.experiencia.nome = 'experience.cs';
    ARQUIVOS.contato.nome = 'contact.ts';
    ARQUIVOS.atalhos.nome = 'shortcuts.md';
    ARQUIVOS.config.rotulo = 'JSON with Comments';
    ARQUIVOS['img-programando'].rotulo = 'Animated WebP · 256 × 256';
    ARQUIVOS['img-mini'].alt = "Ana's small pixel art avatar";
    ARQUIVOS['img-acenando'].alt = 'Pixel art illustration of Ana waving';
    ARQUIVOS['img-programando'].alt = 'Pixel art illustration of Ana coding and waving';
    Object.assign(FONTES, FONTES_EN);
    Object.assign(DICAS, DICAS_EN);
    REPOS.forEach((r, i) => { r.desc = REPOS_EN[i]; });
    EXTENSOES.forEach((x) => {
      const { nome = x.nome, desc, ...detalhes } = TEC_EN[x.ic];
      Object.assign(x, { nome, desc });
      Object.assign(DETALHES_TEC[x.ic], detalhes);
    });
    // textos fixos do index.html: o inglês vem em data-en (conteúdo) e em data-en-<atributo>
    $$('[data-en]').forEach((n) => { n.innerHTML = n.dataset.en; });
    ['aria-label', 'title', 'placeholder', 'content', 'data-cmd'].forEach((attr) => {
      $$(`[data-en-${attr}]`).forEach((n) => n.setAttribute(attr, n.getAttribute(`data-en-${attr}`)));
    });
  }

  // cada tecnologia vira um "arquivo" com visualização (a página) e código (o README.md dela)
  const PASTA_EXT = L('extensoes', 'extensions');
  EXTENSOES.forEach((x) => {
    const id = `ext-${x.ic}`;
    ARQUIVOS[id] = { nome: 'README.md', pasta: `${PASTA_EXT}/${DETALHES_TEC[x.ic].slug}`, icone: 'f-markdown', ling: 'md', rotulo: 'Markdown', inicial: 'visual', extensao: true, tecnologia: x.ic, titulo: x.nome };
    FONTES[id] = () => mdTecnologia(x.ic);
  });

  const TITULOS_VISTA = {
    explorer: L('Explorador', 'Explorer'),
    busca: L('Pesquisar', 'Search'),
    scm: L('Controle do Código-Fonte', 'Source Control'),
    depurar: L('Executar e Depurar', 'Run and Debug'),
    extensoes: L('Extensões', 'Extensions'),
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
    extMarcada: null,
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
  const temVisual = (id = estado.ativa) => Boolean(id && (ARQUIVOS[id].tpl || ARQUIVOS[id].tecnologia || ARQUIVOS[id].ling === 'md'));
  const modoDe = (id) => {
    if (ARQUIVOS[id].imagem) return 'imagem';
    if (ARQUIVOS[id].soPagina) return 'visual';
    if (!temVisual(id)) return 'codigo';
    if (estado.dividido) return 'codigo';
    return estado.modos[id] || ARQUIVOS[id].inicial;
  };
  // As seções em código (projetos.tsx, experiencia.cs...) não têm "visualização" no VS Code:
  // a página delas é o site rodando no navegador embutido, em localhost.
  const ENDERECO = 'localhost:5198';
  const rotaDe = (id) => ARQUIVOS[id].nome.replace(/\.\w+$/, '');
  function rotuloAba(id, modo = modoDe(id)) {
    const a = ARQUIVOS[id];
    const curto = mq.celular.matches;
    if (modo === 'visual' && a.extensao) {
      const titulo = a.titulo || 'Ana Neves';
      return { icone: 'f-extension', texto: curto ? titulo : `${L('Extensão', 'Extension')}: ${titulo}`, it: true };
    }
    if (modo === 'visual' && a.ling === 'md') return { icone: 'open-preview', texto: curto ? a.nome : `${L('Visualizar', 'Preview')} ${a.nome}` };
    if (modo === 'visual') return { icone: 'globe', texto: curto ? rotaDe(id) : `${ENDERECO}/${rotaDe(id)}` };
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

  // Visualização de Markdown, gerada do próprio arquivo (o subconjunto que os .md daqui usam):
  // títulos, citação, listas, parágrafos, **negrito**, `código` (nome de arquivo vira link),
  // [links](...) e endereços soltos.
  const linkMd = (url, texto) => (url.startsWith('mailto:')
    ? `<a href="${url}">${texto}</a>`
    : `<a href="${url}" target="_blank" rel="noopener">${texto}</a>`);
  function inlineHtml(t) {
    return esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, (m, c) => {
        const id = Object.keys(ARQUIVOS).find((k) => ARQUIVOS[k].nome === c && !ARQUIVOS[k].tecnologia);
        return id ? `<a href="#${id}" data-abrir="${id}"><code>${c}</code></a>` : `<code>${c}</code>`;
      })
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, texto, url) => linkMd(url, texto))
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (m, antes, url) => antes + linkMd(url, url));
  }
  function htmlMarkdown(md) {
    const blocos = [];
    let paragrafo = [];
    let citacao = null;
    let lista = null;
    const fecharParagrafo = () => {
      if (paragrafo.length) blocos.push(`<p>${inlineHtml(paragrafo.join(' '))}</p>`);
      paragrafo = [];
    };
    const fecharCitacao = () => {
      if (citacao) blocos.push(`<blockquote><p>${inlineHtml(citacao.join(' '))}</p></blockquote>`);
      citacao = null;
    };
    const fecharLista = () => {
      if (lista) blocos.push(`<${lista.tag}>${lista.itens.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</${lista.tag}>`);
      lista = null;
    };
    md.split('\n').forEach((linha) => {
      let m;
      if (!linha.trim() || /^\s*<!--.*-->\s*$/.test(linha)) {
        fecharParagrafo();
        fecharCitacao();
        fecharLista();
      } else if ((m = linha.match(/^(#{1,6})\s+(.*)$/))) {
        fecharParagrafo();
        fecharCitacao();
        fecharLista();
        blocos.push(`<h${m[1].length}>${inlineHtml(m[2])}</h${m[1].length}>`);
      } else if ((m = linha.match(/^>\s?(.*)$/))) {
        fecharParagrafo();
        fecharLista();
        (citacao = citacao || []).push(m[1]);
      } else if ((m = linha.match(/^\s*(?:[-*]|(\d+)\.)\s+(.*)$/))) {
        fecharParagrafo();
        fecharCitacao();
        const tag = m[1] ? 'ol' : 'ul';
        if (lista && lista.tag !== tag) fecharLista();
        (lista = lista || { tag, itens: [] }).itens.push(m[2]);
      } else {
        fecharCitacao();
        fecharLista();
        paragrafo.push(linha.trim());
      }
    });
    fecharParagrafo();
    fecharCitacao();
    fecharLista();
    return blocos.join('');
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
    marcarExtensao();
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
          + `<button class="aba-x" type="button" data-fechar="${id}" aria-label="${L('Fechar', 'Close')} ${esc(r.texto)}" title="${L('Fechar', 'Close')}"><span>${ic('close')}</span></button></div>`;
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

  // Barra do navegador embutido (como o Simple Browser do VS Code) por cima da página.
  function barraNavegador(id) {
    const url = `http://${ENDERECO}/${rotaDe(id)}`;
    const bt = (acao, icone, rotulo, cls = '') => `<button class="navegador-bt${cls}" type="button" data-nav="${acao}" aria-label="${rotulo}" title="${rotulo}">${ic(icone)}</button>`;
    return `<div class="navegador" role="toolbar" aria-label="${L('Navegador embutido', 'Built-in browser')}">`
      + bt('voltar', 'arrow-left', L('Voltar', 'Back'), ' so-largo')
      + bt('avancar', 'arrow-right', L('Avançar', 'Forward'), ' so-largo')
      + bt('recarregar', 'refresh', L('Recarregar', 'Reload'))
      + `<span class="navegador-url" title="${url}">${url}</span>`
      + bt('fora', 'link-external', L('Abrir no navegador padrão', 'Open in default browser'))
      + '</div>';
  }

  function preencher(painel, id, modo) {
    const a = ARQUIVOS[id];
    if (modo === 'visual' && a.tecnologia) {
      painel.innerHTML = htmlTecnologia(a.tecnologia);
      painel.classList.remove('quebra');
    } else if (modo === 'visual' && !a.tpl) {
      painel.innerHTML = `<article class="md">${htmlMarkdown(fonte(id))}</article>`;
      painel.classList.remove('quebra');
    } else if (modo === 'visual') {
      const tpl = d.getElementById(EN ? `${a.tpl}-en` : a.tpl);
      painel.innerHTML = a.extensao ? '' : barraNavegador(id);
      painel.appendChild(tpl.content.cloneNode(true));
      painel.classList.remove('quebra');
    } else if (modo === 'imagem') {
      const src = mq.calmo.matches && a.parada ? a.parada : a.imagem;
      painel.innerHTML = `<div class="visor"><img src="${src}" alt="${esc(a.alt)}" title="${L('Clique para ampliar', 'Click to zoom in')}"></div>`;
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

    const lado = estado.dividido && temVisual(id) && !a.soPagina;
    el.grupoLado.hidden = !lado;
    if (lado) preencher(el.editorLado, id, 'visual');

    el.btModo.hidden = !temVisual(id) || Boolean(a.extensao);
    el.btModo.setAttribute('aria-disabled', String(estado.dividido));
    const vendoCodigo = modo === 'codigo';
    // Markdown tem visualização; os outros arquivos abrem no navegador embutido
    const [icAbrir, rotAbrir, titAbrir] = a.ling === 'md'
      ? ['open-preview', L('Abrir visualização', 'Open preview'), L('Abrir Visualização', 'Open Preview')]
      : ['globe', L('Abrir no navegador', 'Open in browser'), L('Abrir no Navegador', 'Open in Browser')];
    el.btModo.innerHTML = ic(vendoCodigo ? icAbrir : 'go-to-file');
    el.btModo.setAttribute('aria-label', vendoCodigo ? rotAbrir : L('Mostrar código-fonte', 'Show source'));
    el.btModo.title = vendoCodigo ? titAbrir : L('Mostrar Código-Fonte', 'Show Source');
    el.btDividir.hidden = false;
    el.btDividir.setAttribute('aria-disabled', String(!temVisual(id) || Boolean(a.soPagina)));
    el.btDividir.setAttribute('aria-pressed', String(lado));
    el.btDividir.title = !temVisual(id) ? L('Este arquivo não tem visualização', 'This file has no preview')
      : a.ling === 'md' ? L('Abrir Visualização ao Lado', 'Open Preview to the Side') : L('Abrir no Navegador ao Lado', 'Open in Browser to the Side');
    marcarLinha(1, 1);
    if (modo === 'imagem') el.stPos.textContent = '';
    atualizarMinimapa();
    renderEstrutura();
  }

  function renderVazio() {
    el.editor.dataset.modo = 'vazio';
    el.editor.setAttribute('aria-label', L('Editor vazio', 'Empty editor'));
    el.grupoLado.hidden = true;
    el.minimapa.hidden = true;
    el.btModo.hidden = true;
    el.btDividir.hidden = true;
    el.editor.innerHTML = `<div class="vazio">
      <svg class="vazio-logo" viewBox="-70 -70 140 140" aria-hidden="true"><path d="M0 -10L0 -62M-12 -26L0 -38L12 -26M-7 -49L0 -56L7 -49M8.66 -5L53.69 -31M16.52 -23.39L32.91 -19L28.52 -2.61M38.94 -30.56L48.5 -28L45.94 -18.44M8.66 5L53.69 31M28.52 2.61L32.91 19L16.52 23.39M45.94 18.44L48.5 28L38.94 30.56M0 10L0 62M12 26L0 38L-12 26M7 49L0 56L-7 49M-8.66 5L-53.69 31M-16.52 23.39L-32.91 19L-28.52 2.61M-38.94 30.56L-48.5 28L-45.94 18.44M-8.66 -5L-53.69 -31M-28.52 -2.61L-32.91 -19L-16.52 -23.39M-45.94 -18.44L-48.5 -28L-38.94 -30.56" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle r="6" fill="currentColor"/></svg>
      <dl>
        <dt>${L('Mostrar Todos os Comandos', 'Show All Commands')}</dt><dd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></dd>
        <dt>${L('Ir para o Arquivo', 'Go to File')}</dt><dd><kbd>Ctrl</kbd>+<kbd>P</kbd></dd>
        <dt>${L('Alternar Terminal', 'Toggle Terminal')}</dt><dd><kbd>Ctrl</kbd>+<kbd>J</kbd></dd>
      </dl>
      <button class="botao" type="button" data-acao="reabrir">${L('Reabrir as abas', 'Reopen the tabs')}</button>
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
    // no navegador embutido não há caminho de arquivo: a barra de endereço ocupa o lugar
    el.migalha.hidden = Boolean(id) && ((modoDe(id) === 'visual' && !ARQUIVOS[id].extensao) || Boolean(ARQUIVOS[id].soPagina));
    if (!id || el.migalha.hidden) {
      el.migalha.innerHTML = '';
      return;
    }
    const a = ARQUIVOS[id];
    const partes = [{ rotulo: 'portfolio-ana-neves', tipo: 'raiz', pasta: '' }];
    if (a.pasta) a.pasta.split('/').forEach((p, i, ps) => partes.push({ rotulo: p, tipo: 'pasta', pasta: ps.slice(0, i + 1).join('/') }));
    const bt = (tipo, pasta, conteudo, cls = '') => `<button class="mg-bt${cls}" type="button" data-mg="${tipo}" data-pasta="${esc(pasta)}" aria-haspopup="menu" aria-expanded="false">${conteudo}</button>`;
    el.migalha.innerHTML = partes.map((p) => bt(p.tipo, p.pasta, esc(p.rotulo)) + ic('chevron-right', 'sep')).join('')
      + bt('arquivo', a.pasta || '', `${ic(a.icone)}${esc(a.nome)}`, ' atual');
  }
  // Caminho no topo do editor: cada parte lista o que existe naquele nível,
  // como no VS Code. Escolher um item abre o arquivo (ou a extensão).
  function itensMigalha(tipo, pasta) {
    let ids;
    if (tipo === 'raiz') ids = ARVORE.flatMap((n) => (typeof n === 'string' ? [n] : n.filhos));
    else if (pasta.startsWith(PASTA_EXT)) ids = Object.keys(ARQUIVOS).filter((k) => ARQUIVOS[k].tecnologia);
    else if (pasta) ids = (ARVORE.find((n) => n.pasta === pasta) || { filhos: [] }).filhos;
    else ids = ARVORE.filter((n) => typeof n === 'string');
    return ids.map((k) => ({
      rotulo: tipo === 'raiz' ? caminho(k) : (ARQUIVOS[k].titulo || ARQUIVOS[k].nome),
      check: k === estado.ativa,
      fn: () => abrir(k),
    }));
  }
  el.migalha.addEventListener('click', (e) => {
    const b = e.target.closest('.mg-bt');
    if (b) alternarMenu(itensMigalha(b.dataset.mg, b.dataset.pasta), b, { focar: e.detail === 0 });
  });

  // Cartões e itens que levam a outra parte do portfólio: abre a aba e destaca
  // de onde vem aquele número ou fato. Para voltar: ← na barra de título ou Alt+←.
  // Destino: "id", "id#seletor" (um ou mais elementos) ou "id|texto" (primeiro trecho com o texto).
  function irPara(destino) {
    const corte = destino.search(/[|#]/);
    const id = corte < 0 ? destino : destino.slice(0, corte);
    abrir(id, { modo: 'visual' });
    if (corte < 0) return;
    // abrir() já montou a aba de destino, então o trecho pode ser procurado na hora
    const resto = destino.slice(corte);
    let alvos = [];
    if (resto[0] === '#') alvos = $$(resto, el.editor);
    else {
      const andarilho = d.createTreeWalker(el.editor, NodeFilter.SHOW_TEXT);
      while (andarilho.nextNode()) {
        if (!andarilho.currentNode.nodeValue.includes(resto.slice(1))) continue;
        const pai = andarilho.currentNode.parentElement;
        alvos = [pai.closest('li, .cartao') || pai];
        break;
      }
    }
    if (!alvos.length) return;
    alvos[0].scrollIntoView({ block: 'center', behavior: mq.calmo.matches ? 'auto' : 'smooth' });
    alvos.forEach((alvo) => {
      alvo.classList.remove('piscando');
      void alvo.offsetWidth;
      alvo.classList.add('piscando');
      setTimeout(() => alvo.classList.remove('piscando'), 1700);
    });
  }
  d.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (!b) return;
    e.preventDefault();
    irPara(b.dataset.ir);
  });

  function renderStatus() {
    const id = estado.ativa;
    el.stLing.textContent = id ? ARQUIVOS[id].rotulo : '';
    el.stEsp.textContent = `${L('Espaços', 'Spaces')}: ${id && ARQUIVOS[id].ling === 'cs' ? 4 : 2}`;
    el.app.classList.toggle('vendo-imagem', Boolean(id && ARQUIVOS[id].imagem));
    // página (navegador ou extensão) não é texto: some linha, coluna, espaços e linguagem, como no VS Code
    el.app.classList.toggle('vendo-pagina', Boolean(id) && modoDe(id) === 'visual');
  }

  function atualizarTitulo() {
    const id = estado.ativa;
    // na aba do navegador embutido, o título da janela usa o nome do arquivo (e não localhost)
    const r = id && rotuloAba(id);
    d.title = id ? `${r.icone === 'globe' ? ARQUIVOS[id].nome : r.texto} — Ana Neves · Software Developer` : 'Ana Neves · Software Developer';
    if (id && location.hash.slice(1) !== id) {
      try { history.replaceState(null, '', '#' + id); } catch { /* file:// em alguns navegadores */ }
    }
    contarVisita(id);
  }

  // Cada aba aberta conta como uma página na análise da Vercel (/sobre, /projetos,
  // /ext-cs...): o site troca de aba pelo #, que a Vercel não acompanha sozinha.
  // Desde 23/10/2026, também no contador do Mirante (o painel da Ana).
  let ultimaContada = '';
  function contarVisita(id) {
    if (!id || id === ultimaContada) return;
    ultimaContada = id;
    if (typeof window.va === 'function') window.va('pageview', { route: `/${id}`, path: `/${id}` });
    avisarMirante(id);
  }

  // O contador do Mirante recebe só a aba, a origem da visita (LinkedIn, GitHub, Google...), o idioma e
  // se é a 1ª visita do navegador no dia. Sem cookie e sem identificador: o navegador guarda só a data
  // da última visita (ana-visitou). Vale só no endereço publicado (servidor local e prévias não contam)
  // e não conta o aparelho que abriu uma vez com ?nao-contar (?contar desfaz).
  const CONTADOR = 'https://cqmyktazswdwimuivgyp.supabase.co/functions/v1/portfolio-visita';
  const ORIGENS = [
    [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'linkedin'],
    [/(^|\.)github\.com$/, 'github'],
    [/(^|\.)google\.[a-z.]+$/, 'google'],
    [/(^|\.)(bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org|search\.brave\.com)$/, 'busca'],
    [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp'],
  ];
  let primeiraDaPagina = true;

  function origemDaVisita() {
    const pedido = new URLSearchParams(location.search);
    const marcada = (pedido.get('ref') || pedido.get('utm_source') || '').toLowerCase();
    if (ORIGENS.some(([, nome]) => nome === marcada)) return marcada;
    let host = '';
    try { host = d.referrer ? new URL(d.referrer).hostname : ''; } catch { host = ''; }
    if (!host || host === location.hostname) return 'direto';
    const achou = ORIGENS.find(([re]) => re.test(host));
    return achou ? achou[1] : 'outros';
  }

  function avisarMirante(id) {
    const pedido = new URLSearchParams(location.search);
    if (pedido.has('nao-contar')) guarda.gravar('ana-nao-contar', '1');
    if (pedido.has('contar')) guarda.gravar('ana-nao-contar', '0');
    if (location.hostname !== 'ana-neves.vercel.app' || guarda.ler('ana-nao-contar') === '1') return;
    if (typeof navigator.sendBeacon !== 'function') return;
    const entrada = primeiraDaPagina;
    primeiraDaPagina = false;
    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
    const nova = entrada && guarda.ler('ana-visitou') !== hoje;
    if (nova) guarda.gravar('ana-visitou', hoje);
    const corpo = { aba: id, entrada, nova, idioma: EN ? 'en' : 'pt' };
    if (entrada) corpo.origem = origemDaVisita();
    try { navigator.sendBeacon(CONTADOR, JSON.stringify(corpo)); } catch { /* sem o contador, o site segue igual */ }
  }

  function atualizarNavegacao() {
    const semVolta = String(estado.posHist <= 0);
    const semIda = String(estado.posHist >= estado.historico.length - 1);
    $('#bt-voltar').setAttribute('aria-disabled', semVolta);
    $('#bt-avancar').setAttribute('aria-disabled', semIda);
    $$('[data-nav="voltar"]').forEach((b) => b.setAttribute('aria-disabled', semVolta));
    $$('[data-nav="avancar"]').forEach((b) => b.setAttribute('aria-disabled', semIda));
  }

  d.addEventListener('click', (e) => {
    const b = e.target.closest('[data-nav]');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    const acao = b.dataset.nav;
    if (acao === 'voltar') navegar(-1);
    else if (acao === 'avancar') navegar(1);
    else if (acao === 'fora') abrirFora(`${location.origin}${location.pathname}#${estado.ativa}`);
    else recarregarPagina();
  });
  // Recarregar refaz a página (e, em projetos, mede de novo se cada app está no ar).
  function recarregarPagina() {
    if (estado.ativa === 'projetos') estado.statusApps = {};
    renderEditor({ forcar: true });
    atualizarNavegacao();
    registrar(`${L('recarregado', 'reloaded')}: http://${ENDERECO}/${rotaDe(estado.ativa)}`);
    if (semMovimento()) return;
    [el.editor, el.editorLado].forEach((p) => {
      const pagina = p.dataset.modo === 'visual' && $(':scope > :not(.navegador)', p);
      if (pagina) pagina.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: CURVA });
    });
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
      : `<li><p class="vazio-msg">${L('Nenhum símbolo neste arquivo.', 'No symbols found in this file.')}</p></li>`;
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
  el.linhaTempo.innerHTML = `<li><p class="vazio-msg">${L('A linha do tempo da Ana está em', "Ana's timeline is in")} <button class="link-bt" type="button" data-abrir="experiencia">${ARQUIVOS.experiencia.nome}</button>.</p></li>`;

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
    if (mudou) registrar(`${L('aba aberta', 'tab opened')}: ${caminho(id)}`);
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
    if (!temVisual(id) || estado.dividido || ARQUIVOS[id].soPagina) return;
    estado.modos[id] = modoDe(id) === 'visual' ? 'codigo' : 'visual';
    render();
  }

  function alternarDivisao() {
    if (!temVisual() || ARQUIVOS[estado.ativa].soPagina) return;
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
    const alvo = $(':scope > :not(.navegador)', el.editor);
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

  // no celular o cabeçalho faz parte da gaveta: arrastar nele para a esquerda também fecha
  const toqueGaveta = { x: 0, y: 0 };
  [el.lateral, $('.titulo')].forEach((alvo) => alvo.addEventListener('touchstart', (e) => {
    toqueGaveta.x = e.touches[0].clientX;
    toqueGaveta.y = e.touches[0].clientY;
  }, { passive: true }));
  [el.lateral, $('.titulo')].forEach((alvo) => alvo.addEventListener('touchend', (e) => {
    if (!el.app.classList.contains('gaveta')) return;
    const dx = e.changedTouches[0].clientX - toqueGaveta.x;
    const dy = e.changedTouches[0].clientY - toqueGaveta.y;
    if (dx < -60 && Math.abs(dy) < Math.abs(dx) * 0.6) fecharGaveta();
  }, { passive: true }));

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
      foto.title = ampliada ? L('Clique para reduzir', 'Click to zoom out') : L('Clique para ampliar', 'Click to zoom in');
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
    if (!mq.largo.matches) notificar({ texto: L('O minimapa aparece no código em telas a partir de 1100 px de largura.', 'The minimap shows up in code on screens at least 1100 px wide.') });
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
    if ((id === 'sobre' || ARQUIVOS[id].tecnologia) && typeof window.iniciarExtensao === 'function') {
      try { window.iniciarExtensao($('.ext', raiz) || raiz); } catch (erro) { registrar(`${L('extensão', 'extension')}: ${erro.message}`); }
    }
    if (id === 'projetos') {
      checarApps(raiz);
      ligarPrevias(raiz);
    }
  }

  // Prévia dos projetos: ao passar o mouse (ou segurar o dedo, no celular), a descrição
  // desce e some, o app aparece rodando no fundo e ficam só o nome e o status embaixo.
  function ligarPrevias(raiz) {
    $$('.cartao', raiz).forEach((c) => {
      const video = $('.cartao-previa', c);
      if (!video) return;
      const topo = $('.cartao-topo', c);
      const ligar = () => {
        c.style.setProperty('--desce', `${c.clientHeight - topo.offsetTop - topo.offsetHeight - 14}px`);
        c.classList.add('vendo');
        if (!mq.calmo.matches) video.play().catch(() => {});
      };
      const desligar = () => {
        c.classList.remove('vendo');
        video.pause();
      };
      // só o mouse: no celular o toque também gera eventos de ponteiro
      c.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && ligar());
      c.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && desligar());
      // no celular: segurar o dedo liga; arrastar (rolar a página) antes disso cancela
      let espera = 0;
      let origem = null;
      let porToque = false;
      c.addEventListener('touchstart', (e) => {
        origem = e.touches[0];
        porToque = false;
        espera = setTimeout(() => {
          porToque = true;
          ligar();
        }, 180);
      }, { passive: true });
      c.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        if (!porToque && Math.hypot(t.clientX - origem.clientX, t.clientY - origem.clientY) > 10) clearTimeout(espera);
      }, { passive: true });
      const soltar = (e) => {
        clearTimeout(espera);
        if (!porToque) return;
        // soltar o dedo depois da prévia não pode virar clique em link
        if (e.cancelable) e.preventDefault();
        porToque = false;
        desligar();
      };
      c.addEventListener('touchend', soltar);
      c.addEventListener('touchcancel', soltar);
      c.addEventListener('contextmenu', (e) => porToque && e.preventDefault());
      // na prévia os links somem: clicar no cartão abre o app
      c.addEventListener('click', (e) => {
        if (!c.classList.contains('vendo') || e.target.closest('a')) return;
        const link = $('.cartao-links a', c);
        if (link) window.open(link.href, '_blank', 'noopener');
      });
    });
  }

  /* ---------- página de extensão de cada tecnologia ---------- */
  const botaoIr = (destino, rotulo) => `<button type="button" class="ext-ir" data-ir="${esc(destino)}" aria-label="${esc(rotulo)}: ${L('ver de onde vem', 'see where it comes from')}" title="${L('Ver de onde vem', 'See where it comes from')}">${ic('go-to-file')}</button>`;
  const linkFora = (rotulo, url, cls, icone = '') => `<a class="${cls}" href="${url}" target="_blank" rel="noopener">${icone}${esc(rotulo)}<span class="ext-sr"> ${L('(abre em nova aba)', '(opens in a new tab)')}</span></a>`;

  function htmlTecnologia(k) {
    const x = EXTENSOES.find((e) => e.ic === k);
    const t = DETALHES_TEC[k];
    const usos = `${t.uso.length} ${t.uso.length === 1 ? L('uso', 'use') : L('usos', 'uses')}`;
    const [principal, ...outros] = t.links;
    const acaoPrincipal = principal
      ? linkFora(principal[0], principal[1], 'ext-btn ext-btn-primario')
      : `<button type="button" class="ext-btn ext-btn-primario" data-abrir="experiencia">${L('Ver em', 'See in')} ${ARQUIVOS.experiencia.nome}</button>`;
    const numeros = t.numeros.length
      ? `<h3 class="ext-md-h2">${L('Números', 'Numbers')}</h3><ul class="ext-numeros" role="list">${t.numeros.map((n) => `<li class="ext-num">`
        + `<span class="ext-num-valor" aria-hidden="true" data-ext-contar data-ext-alvo="${n.alvo}"${n.casas ? ` data-ext-casas="${n.casas}"` : ''}${n.antes ? ` data-ext-antes="${esc(n.antes)}"` : ''}${n.depois ? ` data-ext-depois="${esc(n.depois)}"` : ''}>${esc(n.final)}</span>`
        + `<span class="ext-sr">${esc(n.final)}</span><span class="ext-num-rotulo">${esc(n.texto)}</span>${n.ir ? botaoIr(n.ir, `${n.final} ${n.texto}`) : ''}</li>`).join('')}</ul>`
      : '';
    const nota = t.privado
      ? `<p class="ext-nota">${ic('info')}<span>${L('Parte disso é código privado do trabalho: aparecem só os resultados, como em', 'Part of this is private work code: only the results show up, as in')} <button type="button" class="ext-arquivo" data-abrir="experiencia">${ARQUIVOS.experiencia.nome}</button>.</span></p>`
      : '';
    return `<div class="ext">
  <header class="ext-cabecalho">
    <div class="ext-avatar ext-avatar-px" aria-hidden="true"><svg class="ext-px-ic"><use href="#i-px-${k}"/></svg></div>
    <div class="ext-info">
      <h1 class="ext-titulo">${esc(x.nome)}</h1>
      <div class="ext-subtitulo">
        <span class="ext-sub-item ext-publisher"><span class="ext-publisher-nome">ana@dev</span><svg class="ic ext-verificado" role="img" aria-label="${L('verificado', 'verified')}"><use href="#i-verified-filled"/></svg></span>
        <span class="ext-sub-item">${ic('rocket')}<span>${usos}</span></span>
      </div>
      <p class="ext-descricao">${esc(x.desc)}</p>
      <div class="ext-acoes">
        ${acaoPrincipal}
        <button type="button" class="ext-btn ext-btn-secundario" data-abrir="stack"><span class="ext-btn-rotulo">${ic('f-json')}stack.json</span><span class="ext-btn-extra" aria-hidden="true">${ic('go-to-file')}</span></button>
      </div>
    </div>
  </header>
  <div class="ext-navbar">
    <div class="ext-abas" role="tablist" aria-label="${L('Seções', 'Sections')}">
      <button type="button" class="ext-aba" role="tab" id="ext-aba-detalhes" aria-selected="true" aria-controls="ext-painel-detalhes">${L('Detalhes', 'Details')}</button>
      <button type="button" class="ext-aba" role="tab" id="ext-aba-recursos" aria-selected="false" aria-controls="ext-painel-recursos" tabindex="-1">${L('Recursos', 'Features')}</button>
    </div>
  </div>
  <div class="ext-painel" role="tabpanel" id="ext-painel-detalhes" aria-labelledby="ext-aba-detalhes" tabindex="0">
    <div class="ext-detalhes">
      <article class="ext-md">
        <h2 class="ext-md-h1">${L('Onde eu uso', 'Where I use it')}</h2>
        <ul class="ext-recursos" role="list">${t.uso.map(([icone, titulo, texto, destino]) => `<li class="ext-recurso"><span class="ext-recurso-icone" aria-hidden="true">${ic(icone)}</span><div class="ext-recurso-texto"><h3 class="ext-recurso-titulo">${esc(titulo)}</h3><p class="ext-recurso-prova">${esc(texto)}</p></div>${destino ? botaoIr(destino, titulo) : ''}</li>`).join('')}</ul>
        ${numeros}
        ${nota}
      </article>
      <aside class="ext-lateral" aria-label="${L('Mais informações', 'More information')}">
        <section class="ext-lat-secao">
          <h2 class="ext-lat-titulo">${L('Instalação', 'Installation')}</h2>
          <table class="ext-tabela"><tbody>
            <tr><th scope="row">${L('Identificador', 'Identifier')}</th><td>ana-neves.${t.slug}</td></tr>
            <tr><th scope="row">${L('Publicado por', 'Published by')}</th><td>ana@dev</td></tr>
          </tbody></table>
        </section>
        <section class="ext-lat-secao">
          <h2 class="ext-lat-titulo">${L('Categorias', 'Categories')}</h2>
          <ul class="ext-chips" role="list">${t.categorias.map((c) => `<li class="ext-chip">${esc(c)}</li>`).join('')}</ul>
        </section>
        <section class="ext-lat-secao">
          <h2 class="ext-lat-titulo">Links</h2>
          <ul class="ext-lat-links" role="list">
            ${outros.map(([rotulo, url]) => `<li>${linkFora(rotulo, url, 'ext-lat-link', ic('link-external'))}</li>`).join('')}
            <li><button type="button" class="ext-lat-link" data-abrir="projetos">${ic('rocket')}${L('Projetos', 'Projects')}</button></li>
            <li><button type="button" class="ext-lat-link" data-abrir="experiencia">${ic('history')}${L('Experiência', 'Experience')}</button></li>
          </ul>
        </section>
      </aside>
    </div>
  </div>
  <div class="ext-painel" role="tabpanel" id="ext-painel-recursos" aria-labelledby="ext-aba-recursos" tabindex="0" hidden>
    <div class="ext-md ext-md-largo">
      <h2 class="ext-md-h1">${L('Ferramentas e bibliotecas', 'Tools and libraries')}</h2>
      <ul class="ext-chips ext-chips-grandes" role="list">${t.recursos.map((r) => `<li class="ext-chip">${esc(r)}</li>`).join('')}</ul>
    </div>
  </div>
</div>`;
  }

  function mdTecnologia(k) {
    const x = EXTENSOES.find((e) => e.ic === k);
    const t = DETALHES_TEC[k];
    return [
      `# ${x.nome}`,
      '',
      `> ${x.desc}`,
      `> ${L('Publicado por', 'Published by')} [ana@dev](https://github.com/An4D3v)`,
      '',
      `## ${L('Onde eu uso', 'Where I use it')}`,
      '',
      ...t.uso.map(([, titulo, texto]) => `- **${titulo}** — ${texto}`),
      ...(t.numeros.length ? ['', `## ${L('Números', 'Numbers')}`, '', ...t.numeros.map((n) => `- **${n.final}** ${n.texto}`)] : []),
      '',
      `## ${L('Recursos', 'Tools and libraries')}`,
      '',
      t.recursos.map((r) => `\`${r}\``).join(' · '),
      ...(t.links.length ? ['', '## Links', '', ...t.links.map(([rotulo, url]) => `- [${rotulo}](${url})`)] : []),
    ].join('\n');
  }

  function aplicarStatus(raiz) {
    $$('[data-status]', raiz).forEach((s) => {
      const st = estado.statusApps[s.dataset.status];
      const txt = $('.vivo-txt', s);
      s.classList.remove('no-ar', 'sem-resposta');
      if (!st || st.estado === 'checando') txt.textContent = L('verificando…', 'checking…');
      else if (st.estado === 'no-ar') {
        s.classList.add('no-ar');
        txt.textContent = `${L('no ar', 'live')} · ${st.ms} ms`;
        s.title = L(`Respondeu em ${st.ms} ms agora há pouco, medido do seu navegador.`, `Responded in ${st.ms} ms just now, measured from your browser.`);
      } else {
        s.classList.add('sem-resposta');
        txt.textContent = L('sem resposta agora', 'not responding right now');
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
          registrar(`${APPS[chave].replace('https://', '')} ${L('respondeu em', 'responded in')} ${estado.statusApps[chave].ms} ms`);
        })
        .catch(() => {
          estado.statusApps[chave] = { estado: 'sem-resposta' };
          registrar(`${APPS[chave].replace('https://', '')} ${L('não respondeu', 'did not respond')}`);
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
      notificar({ texto: `${L('Não consegui copiar sozinho. O e-mail é', "Couldn't copy it automatically. The email is")} ${EMAIL}` });
      return;
    }
    notificar({ tipo: 'ok', texto: `${L('E-mail copiado', 'Email copied')}: ${EMAIL}` });
    registrar(L('e-mail copiado', 'email copied'));
    const rotulo = bt && bt.querySelector && bt.querySelector('span:not(.marca-check)');
    if (rotulo && bt.closest('.editor')) {
      const antes = rotulo.textContent;
      rotulo.textContent = L('Copiado', 'Copied');
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
      resumo.textContent = termo ? L('Digite pelo menos 2 caracteres.', 'Type at least 2 characters.') : '';
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
    const pl = (n) => (n > 1 ? 's' : '');
    resumo.textContent = total
      ? L(`${total} resultado${pl(total)} em ${arquivos} arquivo${pl(arquivos)}`, `${total} result${pl(total)} in ${arquivos} file${pl(arquivos)}`)
      : L('Nenhum resultado encontrado.', 'No results found.');
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
      notificar({ tipo: 'aviso', texto: L('Escreva uma mensagem antes do commit: ela vira o corpo do e-mail.', 'Write a message before committing: it becomes the body of the email.') });
      campo.focus();
      return;
    }
    registrar(L('commit: abrindo o cliente de e-mail', 'commit: opening the email client'));
    notificar({ tipo: 'ok', texto: L('Abrindo o seu cliente de e-mail com a mensagem. É só enviar.', 'Opening your email client with the message. Just hit send.') });
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(L('Contato pelo portfólio', 'Contact from the portfolio'))}&body=${encodeURIComponent(msg)}`;
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
  // A extensão da Ana vem primeiro (é a extensão deste workspace), com o avatar como ícone.
  const EXT_ANA = { id: 'sobre', nome: 'Ana Neves', desc: L('Software Developer com produtos próprios no ar.', 'Software Developer with her own products live.') };
  function renderExtensoes() {
    const q = norm($('#ext-in').value.trim());
    const itens = [
      { ...EXT_ANA, icone: '<span class="ext-ic ext-ic-foto" aria-hidden="true"><img src="assets/ana-64.webp" alt="" width="42" height="42"></span>' },
      ...EXTENSOES.map((x) => ({ id: `ext-${x.ic}`, nome: x.nome, desc: x.desc, icone: `<span class="ext-ic px" aria-hidden="true"><svg class="px-ic"><use href="#i-px-${x.ic}"/></svg></span>` })),
    ];
    const lista = itens.filter((x) => !q || norm(`${x.nome} ${x.desc}`).includes(q));
    $('#ext-cont').textContent = String(lista.length);
    $('#ext-lista').innerHTML = lista.map((x) => `<button class="ext-item" type="button" data-abrir="${x.id}">${x.icone}<span class="ext-nome">${esc(x.nome)}</span><span class="ext-desc">${esc(x.desc)}</span><span class="ext-pub">${ic('verified-filled')}ana@dev</span></button>`).join('')
      + (lista.length ? '' : `<p class="vazio-msg">${L('Nenhuma extensão encontrada.', 'No extensions found.')}</p>`);
    marcarExtensao();
  }
  // A extensão aberta fica marcada na lista, como no VS Code. Abrir um arquivo
  // comum não desmarca: a lista guarda a última extensão escolhida.
  function marcarExtensao() {
    if (estado.ativa && ARQUIVOS[estado.ativa].extensao) estado.extMarcada = estado.ativa;
    $$('.ext-item', $('#ext-lista')).forEach((b) => {
      const on = b.dataset.abrir === estado.extMarcada;
      b.classList.toggle('selecionada', on);
      if (on) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }
  $('#ext-in').addEventListener('input', renderExtensoes);

  /* ---------- executar e depurar ---------- */
  let depurando = null;
  const logDepuracao = [];
  function depurar() {
    if (depurando) return;
    const passos = [
      ['learn()', L('C#, .NET 8, Azure, LLMs em produção', 'C#, .NET 8, Azure, LLMs in production')],
      ['build()', L('3 apps no ar · 7+ cargas incrementais · bots com IA', '3 apps live · 7+ incremental loads · AI bots')],
      ['ship()', L('em produção, com usuários reais', 'in production, with real users')],
    ];
    logDepuracao.length = 0;
    logDepuracao.push({ cls: 'term-dim', txt: `${L('Iniciando', 'Starting')}: while (true) { learn(); build(); ship(); }` });
    el.app.classList.add('depurando');
    $('#barra-depuracao').hidden = false;
    mostrarPainel('depuracao');
    registrar(L('depuração iniciada', 'debugging started'));
    let i = 0;
    const passo = () => {
      if (i < passos.length) {
        logDepuracao.push({ cls: '', txt: `> ${passos[i][0]}`, ok: passos[i][1] });
        i += 1;
        renderPainel();
        depurando = setTimeout(passo, mq.calmo.matches ? 0 : 700);
        return;
      }
      logDepuracao.push({ cls: 'term-dim', txt: L('Iteração concluída. O loop continua: é while (true).', "Iteration finished. The loop goes on: it's while (true).") });
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
    const hora = new Date().toLocaleTimeString(L('pt-BR', 'en-US'), { hour12: false });
    logSaida.push({ hora, msg });
    if (logSaida.length > 300) logSaida.shift();
    if (estado.painel && estado.painelAba === 'saida') renderPainel();
  }

  // Portas: cada app roda numa porta no computador da Ana e está "encaminhado"
  // para o endereço público; o ponto mostra se ele respondeu agora há pouco.
  const PORTAS = [
    { porta: 5176, app: 'rumo', nome: 'Rumo', cmd: 'npm run dev' },
    { porta: 5173, app: 'alien', nome: 'AlienFinanças', cmd: 'npm run dev' },
    { porta: 5175, app: 'trevo', nome: 'Vale do Trevo', cmd: 'npm run dev' },
    { porta: 4200, app: 'notas', nome: 'Notas Fiscais', cmd: 'npm start' },
  ];
  function htmlPortas() {
    return `<table class="portas"><thead><tr><th>${L('Porta', 'Port')}</th><th>${L('Endereço Encaminhado', 'Forwarded Address')}</th><th>${L('Processo em Execução', 'Running Process')}</th><th>${L('Visibilidade', 'Visibility')}</th><th>${L('Origem', 'Origin')}</th></tr></thead><tbody>`
      + PORTAS.map((p) => `<tr><td>${p.porta}</td><td>${linkar(esc(APPS[p.app]))}</td>`
        + `<td>${esc(p.nome)} (${p.cmd})<span class="vivo" data-status="${p.app}"><span class="vivo-ponto"></span><span class="vivo-txt">${L('verificando…', 'checking…')}</span></span></td>`
        + `<td>${L('Pública', 'Public')}</td><td>Vercel</td></tr>`).join('')
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
      el.painelOutro.innerHTML = `<p class="problemas-ok">${ic('pass')}${L('Nenhum problema foi detectado no workspace.', 'No problems have been detected in the workspace.')}</p>`;
    } else if (estado.painelAba === 'saida') {
      el.painelOutro.innerHTML = logSaida.map((l) => `<div class="saida-linha"><span class="hora">[${l.hora}]</span> ${esc(l.msg)}</div>`).join('');
    } else if (estado.painelAba === 'portas') {
      el.painelOutro.innerHTML = htmlPortas();
      checarApps(el.painelOutro);
    } else {
      el.painelOutro.innerHTML = logDepuracao.length
        ? logDepuracao.map((l) => `<div class="term-linha ${l.cls}">${esc(l.txt)}${l.ok ? `  <span class="term-ok">✓ ${esc(l.ok)}</span>` : ''}</div>`).join('')
        : `<p class="problemas-ok">${L('Use Executar e Depurar (F5) para rodar o loop da Ana.', "Use Run and Debug (F5) to run Ana's loop.")}</p>`;
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
  const NOMES_ARQ = Object.fromEntries(Object.keys(ARQUIVOS).filter((id) => !ARQUIVOS[id].tecnologia && !ARQUIVOS[id].soPagina).map((id) => [caminho(id), id]));

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
    if (mq.celular.matches) linhaTerm(L('Terminal do portfólio. Digite <span class="term-dest">help</span> ou toque num comando acima.', 'Portfolio terminal. Type <span class="term-dest">help</span> or tap a command above.'), 'term-dim');
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

  // Os comandos têm nome no idioma da página (projetos/projects, abrir/open...).
  const CMD = {
    sobre: L('sobre', 'about'),
    projetos: L('projetos', 'projects'),
    experiencia: L('experiencia', 'experience'),
    contato: L('contato', 'contact'),
    abrir: L('abrir', 'open'),
    tema: L('tema', 'theme'),
    idioma: L('idioma', 'lang'),
  };
  const CMDS = {
    help: {
      desc: L('lista os comandos', 'lists the commands'),
      fn: () => linhaTerm(Object.entries(CMDS).filter(([, c]) => c.desc).map(([n, c]) => (estreito()
        ? `<span class="term-dest">${n}</span>  ${esc(c.desc)}`
        : `  <span class="term-dest">${n.padEnd(12)}</span>${esc(c.desc)}`)).join('\n')),
    },
    whoami: { desc: L('quem é a Ana', 'who Ana is'), fn: () => linhaTerm(L('Ana Neves — Software Developer · backend, dados e IA · São Paulo, Brasil', 'Ana Neves — Software Developer · backend, data and AI · São Paulo, Brazil')) },
    [CMD.sobre]: {
      desc: L('resumo em três linhas', 'summary in three lines'),
      fn: () => linhaTerm(L(
        'Primeira e única dev de um escritório jurídico: pipelines com 4,5M+ registros,\nbots com IA no Teams e classificador LLM em produção.\nFora do expediente: 3 apps próprios no ar, com 70+ pessoas usando.',
        'First and only developer at a law firm: pipelines with 4.5M+ records,\nAI bots in Teams and an LLM classifier in production.\nAfter hours: 3 apps of my own live, with 70+ people using them.',
      )),
    },
    [CMD.projetos]: {
      desc: L('os produtos, com links', 'the products, with links'),
      fn: () => linhaTerm([
        ['Rumo', L('orientador de rotinas · PWA · 40+ usuários', 'routine companion · PWA · 40+ users'), APPS.rumo],
        ['AlienFinanças', L('finanças com leitura de nota fiscal por IA · 20+ usuários', 'personal finance with AI receipt reading · 20+ users'), APPS.alien],
        ['Notas Fiscais', L('microsserviços .NET no Azure · 28 testes de integração', '.NET microservices on Azure · 28 integration tests'), APPS.notas],
        ['Vale do Trevo', L('jogo 2D em canvas puro', '2D game in plain canvas'), APPS.trevo],
      ].map(([n, dsc, url]) => (estreito()
        ? `<span class="term-dest">${esc(n)}</span>\n  ${esc(dsc)}\n  ${linkar(esc(url))}`
        : `<span class="term-dest">${esc(n.padEnd(15))}</span>${esc(dsc)}\n${' '.repeat(15)}${linkar(esc(url))}`)).join('\n')),
    },
    [CMD.experiencia]: {
      desc: L('trajetória e bastidores', 'career path and behind the scenes'),
      fn: () => {
        linhaTerm(estreito()
          ? L('hoje: primeira e única dev · escritório jurídico, São Paulo\nem paralelo: 3 produtos próprios no ar\ninício: dados · Jusbrasil',
            'today: first and only developer · law firm, São Paulo\nin parallel: 3 products of my own live\nstart: data · Jusbrasil')
          : L('hoje      primeira e única dev · escritório jurídico, São Paulo\nparalelo  3 produtos próprios no ar\ninício    dados · Jusbrasil',
            'today     first and only developer · law firm, São Paulo\nparallel  3 products of my own live\nstart     data · Jusbrasil'));
        linhaTerm(`${L('detalhes', 'details')}: ${linkArq('experiencia')}`, 'term-dim');
      },
    },
    stack: {
      desc: L('com o que ela trabalha', 'what she works with'),
      fn: () => {
        const s = JSON.parse(fonte('stack'));
        linhaTerm(Object.entries(s).map(([k, v]) => (estreito()
          ? `<span class="term-dest">${esc(k)}</span>\n  ${esc(v.join(' · '))}`
          : `<span class="term-dest">${esc(k.padEnd(10))}</span>${esc(v.join(' · '))}`)).join('\n'));
      },
    },
    [CMD.contato]: {
      desc: L('e-mail, GitHub e LinkedIn', 'email, GitHub and LinkedIn'),
      fn: () => {
        linhaTerm(`${L('e-mail    ', 'email     ')}${linkar(EMAIL)}\ngithub    ${linkar(GITHUB)}\nlinkedin  ${linkar(LINKEDIN)}`);
        linhaTerm(L('para falar de backend .NET, dados e IA aplicada.', 'to talk about .NET backend, data and applied AI.'), 'term-dim');
      },
    },
    ls: { desc: L('lista os arquivos', 'lists the files'), fn: () => linhaTerm(Object.keys(NOMES_ARQ).filter((k) => NOMES_ARQ[k] !== 'atalhos').map((k) => linkArq(NOMES_ARQ[k])).join('  ')) },
    [CMD.abrir]: {
      desc: L('abre um arquivo (abrir projetos.tsx)', 'opens a file (open projects.tsx)'),
      args: 'arquivo',
      fn: (arg) => {
        const id = acharArquivo(arg);
        if (!arg) linhaTerm(L('uso: abrir &lt;arquivo&gt;   ex.: abrir projetos.tsx', 'usage: open &lt;file&gt;   e.g. open projects.tsx'), 'term-dim');
        else if (!id) linhaTerm(`${CMD.abrir}: ${esc(arg)}: ${L('arquivo não encontrado', 'file not found')}`, 'term-erro');
        else {
          abrir(id);
          linhaTerm(`${L('abrindo', 'opening')} ${esc(caminho(id))}…`, 'term-dim');
        }
      },
    },
    cat: {
      desc: L('mostra o conteúdo de um arquivo', 'prints the contents of a file'),
      args: 'arquivo',
      fn: (arg) => {
        const id = acharArquivo(arg);
        if (!id) linhaTerm(arg ? `cat: ${esc(arg)}: ${L('arquivo não encontrado', 'file not found')}` : L('uso: cat &lt;arquivo&gt;', 'usage: cat &lt;file&gt;'), 'term-erro');
        else if (ARQUIVOS[id].imagem) linhaTerm(`cat: ${esc(caminho(id))}: ${L('é uma imagem; abra com', "it's an image; open it with")} <span class="term-dest">${CMD.abrir} ${esc(caminho(id))}</span>`, 'term-dim');
        else linhaTerm(linkar(esc(fonte(id))));
      },
    },
    [CMD.tema]: {
      desc: L('troca o tema (tema light-modern)', 'changes the theme (theme light-modern)'),
      args: 'tema',
      fn: (arg) => {
        const t = arg.trim().toLowerCase();
        if (TEMAS[t]) {
          aplicarTema(t);
          linhaTerm(`${L('tema aplicado', 'theme applied')}: ${esc(TEMAS[t].nome)}`, 'term-ok');
        } else {
          linhaTerm(`${L('temas', 'themes')}: ${Object.keys(TEMAS).map((k) => `<span class="term-dest">${k}</span>`).join('  ')}`);
        }
      },
    },
    [CMD.idioma]: {
      desc: L('troca o idioma (idioma en)', 'switches the language (lang pt)'),
      args: 'idioma',
      fn: (arg) => {
        const lingua = arg.trim().toLowerCase().slice(0, 2);
        if (IDIOMAS[lingua] && lingua !== html.dataset.idioma) {
          linhaTerm(`${L('trocando para', 'switching to')} ${IDIOMAS[lingua]}…`, 'term-ok');
          trocarIdioma(lingua);
        } else {
          linhaTerm(`${L('idiomas', 'languages')}: ${Object.keys(IDIOMAS).map((k) => `<span class="term-dest">${k}</span>`).join('  ')}   ${L('atual', 'current')}: ${html.dataset.idioma}`);
        }
      },
    },
    date: { desc: L('data e hora', 'date and time'), fn: () => linhaTerm(esc(new Date().toLocaleString(L('pt-BR', 'en-US'), { dateStyle: 'full', timeStyle: 'short' }))) },
    echo: { desc: L('repete o texto', 'prints the text back'), fn: (arg) => linhaTerm(esc(arg)) },
    history: { desc: L('histórico de comandos', 'command history'), fn: () => linhaTerm(term.hist.map((c, i) => `${String(i + 1).padStart(4)}  ${esc(c)}`).join('\n')) },
    clear: { desc: L('limpa o terminal', 'clears the terminal'), fn: limparTerminal },
    exit: { desc: L('fecha o painel', 'closes the panel'), fn: () => alternarPainel(false) },
    sudo: { fn: () => linhaTerm(L('ana não está no arquivo sudoers. Este incidente será reportado. (brincadeira)', 'ana is not in the sudoers file. This incident will be reported. (just kidding)'), 'term-erro') },
    code: { alias: CMD.abrir },
    [L('open', 'abrir')]: { alias: CMD.abrir },
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
      linhaTerm(`${L('abrindo', 'opening')} ${esc(caminho(id))}…`, 'term-dim');
      return;
    }
    linhaTerm(`${esc(nome)}: ${L('comando não encontrado. Digite', 'command not found. Type')} <span class="term-dest">help</span>.`, 'term-erro');
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
      opcoes = c.args === 'tema' ? Object.keys(TEMAS) : c.args === 'idioma' ? Object.keys(IDIOMAS) : Object.keys(NOMES_ARQ);
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
    n.innerHTML = `${ic(icone)}<p class="notif-txt">${esc(texto)}</p><button class="icone-bt" type="button" data-sair aria-label="${L('Fechar notificação', 'Close notification')}">${ic('close')}</button>`
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
    el.stSino.setAttribute('aria-label', tem ? L('Notificações: 1 nova', 'Notifications: 1 new') : L('Notificações', 'Notifications'));
  }
  function notificarDica() {
    const visto = () => guarda.gravarSessao('ana-notif', '1');
    const acoes = [
      { rotulo: L('Ver atalhos', 'See shortcuts'), sec: true, fn: () => { visto(); abrir('atalhos'); } },
      { rotulo: L('Abrir terminal', 'Open terminal'), fn: () => { visto(); mostrarPainel('terminal'); } },
    ];
    acoes.onFechar = visto;
    const texto = mq.celular.matches
      ? L('Dica: deslize o dedo para os lados para trocar de aba. A barra de baixo abre arquivos, pesquisa, terminal e links.', 'Tip: swipe sideways to switch tabs. The bottom bar opens files, search, terminal and links.')
      : L('Dica: isto é um editor de verdade. Ctrl+Shift+P abre a paleta de comandos e Ctrl+J, o terminal.', 'Tip: this is a real editor. Ctrl+Shift+P opens the command palette and Ctrl+J, the terminal.');
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
    if (mudou) registrar(`${L('tema de cores', 'color theme')}: ${TEMAS[t].nome}`);
    if (estado.ativa === 'config') renderEditor({ forcar: true });
  }
  const itensTema = () => [
    ...Object.entries(TEMAS).map(([k, t]) => ({ rotulo: t.nome, check: estado.tema === k, fn: () => aplicarTema(k) })),
    '-',
    { rotulo: L('Escolher com Visualização…', 'Browse with Preview…'), fn: () => abrirPaleta('', 'tema') },
  ];

  /* ======================================================================
     Idioma: português ou inglês. A troca recarrega a janela, como no VS Code.
     ====================================================================== */
  const IDIOMAS = { pt: 'Português (Brasil)', en: 'English' };
  function trocarIdioma(lingua) {
    if (!IDIOMAS[lingua] || lingua === html.dataset.idioma) return;
    guarda.gravar('ana-idioma', lingua);
    // a escolha fica salva e o ?lang= sai do endereço; sem armazenamento, ela segue no ?lang=
    const busca = new URLSearchParams(location.search);
    busca.delete('lang');
    if (guarda.ler('ana-idioma') !== lingua) busca.set('lang', lingua);
    const q = busca.toString() ? `?${busca}` : '';
    if (q === location.search) location.reload();
    else location.replace(`${location.pathname}${q}${location.hash}`);
  }
  // na barra de status (computador) e no topo (celular, onde a barra de status some)
  ['#st-idioma', '#bt-idioma'].forEach((s) => $(s).addEventListener('click', () => trocarIdioma(EN ? 'pt' : 'en')));

  /* ======================================================================
     Menus (barra de menus, contas, gerenciar, "...")
     ====================================================================== */
  const MENUS = [
    { rotulo: L('Arquivo', 'File'), itens: () => [
      { rotulo: L('Abrir Arquivo…', 'Open File…'), tecla: 'Ctrl+P', fn: () => abrirPaleta('') },
      { rotulo: L('Reabrir Todas as Abas', 'Reopen All Tabs'), fn: reabrirTodas },
      '-',
      { rotulo: L('Fechar Editor', 'Close Editor'), fn: () => estado.ativa && fecharAba(estado.ativa), off: !estado.ativa },
      { rotulo: L('Fechar Todos os Editores', 'Close All Editors'), fn: fecharTodas, off: !estado.abertas.length },
      '-',
      { rotulo: L('Preferências: Tema de Cores…', 'Preferences: Color Theme…'), fn: () => abrirPaleta('', 'tema') },
      { rotulo: L('Preferências: Idioma de Exibição…', 'Preferences: Display Language…'), fn: () => abrirPaleta('', 'idioma') },
    ] },
    { rotulo: L('Editar', 'Edit'), itens: () => [
      { rotulo: L('Localizar nos Arquivos', 'Find in Files'), tecla: 'Ctrl+Shift+F', fn: () => mostrarVista('busca', { alternar: false }) },
      { rotulo: L('Copiar E-mail da Ana', "Copy Ana's Email"), fn: copiarEmail },
    ] },
    { rotulo: L('Seleção', 'Selection'), itens: () => [
      { rotulo: L('Selecionar Tudo no Editor', 'Select All in Editor'), tecla: 'Ctrl+A', fn: selecionarTudo, off: !estado.ativa },
    ] },
    { rotulo: L('Exibir', 'View'), itens: () => [
      { rotulo: L('Paleta de Comandos…', 'Command Palette…'), tecla: 'Ctrl+Shift+P', fn: () => abrirPaleta('>') },
      '-',
      { rotulo: L('Explorador', 'Explorer'), tecla: 'Ctrl+Shift+E', fn: () => mostrarVista('explorer', { alternar: false }) },
      { rotulo: L('Pesquisar', 'Search'), tecla: 'Ctrl+Shift+F', fn: () => mostrarVista('busca', { alternar: false }) },
      { rotulo: L('Controle do Código-Fonte', 'Source Control'), tecla: 'Ctrl+Shift+G', fn: () => mostrarVista('scm', { alternar: false }) },
      { rotulo: L('Executar e Depurar', 'Run and Debug'), tecla: 'Ctrl+Shift+D', fn: () => mostrarVista('depurar', { alternar: false }) },
      { rotulo: L('Extensões', 'Extensions'), tecla: 'Ctrl+Shift+X', fn: () => mostrarVista('extensoes', { alternar: false }) },
      '-',
      { rotulo: 'Terminal', tecla: 'Ctrl+J', check: estado.painel, fn: () => alternarPainel() },
      { rotulo: L('Minimapa', 'Minimap'), check: estado.minimapa, fn: alternarMinimapa },
      { rotulo: L('Quebra de Linha', 'Word Wrap'), tecla: 'Alt+Z', check: quebraAtiva(), fn: alternarQuebra },
      { rotulo: L('Modo Zen', 'Zen Mode'), check: estado.zen, fn: () => alternarZen() },
    ] },
    { rotulo: L('Ir', 'Go'), itens: () => [
      { rotulo: L('Voltar', 'Back'), fn: () => navegar(-1), off: estado.posHist <= 0 },
      { rotulo: L('Avançar', 'Forward'), fn: () => navegar(1), off: estado.posHist >= estado.historico.length - 1 },
      '-',
      ...SECOES.map((id, i) => ({ rotulo: ARQUIVOS[id].soPagina ? `${L('Extensão', 'Extension')}: Ana Neves` : ARQUIVOS[id].nome, tecla: `Alt+${i + 1}`, fn: () => abrir(id) })),
      '-',
      { rotulo: L('Ir para o Arquivo…', 'Go to File…'), tecla: 'Ctrl+P', fn: () => abrirPaleta('') },
    ] },
    { rotulo: L('Executar', 'Run'), itens: () => [
      { rotulo: L('Iniciar Depuração', 'Start Debugging'), tecla: 'F5', fn: depurar, off: Boolean(depurando) },
      { rotulo: L('Parar Depuração', 'Stop Debugging'), fn: pararDepuracao, off: !depurando },
    ] },
    { rotulo: 'Terminal', itens: () => [
      { rotulo: L('Novo Terminal', 'New Terminal'), tecla: 'Ctrl+J', fn: () => mostrarPainel('terminal') },
      { rotulo: L('Limpar Terminal', 'Clear Terminal'), fn: () => { mostrarPainel('terminal'); limparTerminal(); } },
    ] },
    { rotulo: L('Ajuda', 'Help'), itens: () => [
      { rotulo: L('Atalhos de Teclado', 'Keyboard Shortcuts'), fn: () => abrir('atalhos') },
      { rotulo: L('Sobre Este Portfólio', 'About This Portfolio'), fn: () => abrir('pacote') },
      '-',
      { rotulo: L('Perfil no GitHub', 'GitHub Profile'), fn: () => abrirFora(GITHUB) },
      { rotulo: L('Perfil no LinkedIn', 'LinkedIn Profile'), fn: () => abrirFora(LINKEDIN) },
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
    { rotulo: L('Enviar E-mail', 'Send Email'), fn: () => { location.href = `mailto:${EMAIL}`; } },
    { rotulo: L('Copiar E-mail', 'Copy Email'), fn: copiarEmail },
    ...(convite ? ['-', { rotulo: L('Instalar como App', 'Install as App'), fn: instalarApp }] : []),
  ], e.currentTarget, { lado: celular() ? 'cima' : 'direita', focar: e.detail === 0 }));
  $('#bt-gerenciar').addEventListener('click', (e) => alternarMenu([
    { rotulo: L('Paleta de Comandos…', 'Command Palette…'), tecla: 'Ctrl+Shift+P', fn: () => abrirPaleta('>') },
    { rotulo: L('Configurações', 'Settings'), fn: () => abrir('config') },
    { rotulo: L('Atalhos de Teclado', 'Keyboard Shortcuts'), fn: () => abrir('atalhos') },
    { rotulo: L('Idioma de Exibição…', 'Display Language…'), fn: () => abrirPaleta('', 'idioma') },
    '-',
    ...itensTema(),
  ], e.currentTarget, { lado: 'direita', focar: e.detail === 0 }));
  $('#bt-layout-mais').addEventListener('click', (e) => alternarMenu([
    { rotulo: L('Painel Lateral', 'Side Bar'), tecla: 'Ctrl+B', check: estado.lateral, fn: () => alternarLateral() },
    { rotulo: L('Painel', 'Panel'), tecla: 'Ctrl+J', check: estado.painel, fn: () => alternarPainel() },
    { rotulo: L('Minimapa', 'Minimap'), check: estado.minimapa, fn: alternarMinimapa },
    '-',
    { rotulo: L('Modo Zen', 'Zen Mode'), check: estado.zen, fn: () => alternarZen() },
    { rotulo: L('Tela Inteira', 'Full Screen'), check: Boolean(d.fullscreenElement), fn: telaCheia },
  ], e.currentTarget, { focar: e.detail === 0 }));
  $('#bt-editor-mais').addEventListener('click', (e) => alternarMenu([
    { rotulo: L('Fechar Outros', 'Close Others'), fn: fecharOutras, off: estado.abertas.length < 2 },
    { rotulo: L('Fechar Todos', 'Close All'), fn: fecharTodas, off: !estado.abertas.length },
    { rotulo: L('Reabrir Todas as Abas', 'Reopen All Tabs'), fn: reabrirTodas },
    '-',
    { rotulo: L('Quebra de Linha', 'Word Wrap'), tecla: 'Alt+Z', check: quebraAtiva(), fn: alternarQuebra },
    { rotulo: L('Minimapa', 'Minimap'), check: estado.minimapa, fn: alternarMinimapa },
    { rotulo: L('Visualização ao Lado', 'Preview to the Side'), check: estado.dividido, fn: alternarDivisao, off: !temVisual() },
  ], e.currentTarget, { focar: e.detail === 0 }));
  $('#bt-lat-mais').addEventListener('click', (e) => alternarMenu(
    Object.entries(TITULOS_VISTA).map(([v, t]) => ({ rotulo: t, check: estado.vista === v, fn: () => mostrarVista(v, { alternar: false }) })),
    e.currentTarget, { focar: e.detail === 0 },
  ));

  /* ---------- janela: zen, tela cheia, fechar ---------- */
  function alternarZen(forcar) {
    estado.zen = typeof forcar === 'boolean' ? forcar : !estado.zen;
    el.app.classList.toggle('zen', estado.zen);
    if (estado.zen) notificar({ texto: L('Modo zen: só o editor. Esc para sair.', 'Zen mode: just the editor. Esc to leave.') });
    requestAnimationFrame(sincronizarMinimapa);
  }
  function telaCheia() {
    if (d.fullscreenElement) d.exitFullscreen().catch(() => {});
    else if (html.requestFullscreen) html.requestFullscreen().catch(() => notificar({ texto: L('O navegador não liberou a tela cheia agora.', "The browser didn't allow full screen right now.") }));
  }
  $('#bt-minimizar').addEventListener('click', () => alternarZen());
  $('#bt-maximizar').addEventListener('click', telaCheia);
  $('#bt-fechar').addEventListener('click', () => notificar({
    texto: L('Este editor não fecha por aqui. Antes de sair, que tal levar o contato?', "This editor doesn't close from here. Before you go, how about taking the contact?"),
    acoes: [{ rotulo: L('Ficar', 'Stay'), sec: true }, { rotulo: L('Copiar e-mail', 'Copy email'), fn: copiarEmail }],
  }));

  /* ======================================================================
     Paleta de comandos
     ====================================================================== */
  const COMANDOS = () => [
    { rotulo: L('Exibir: Alternar Terminal', 'View: Toggle Terminal'), tecla: 'Ctrl+J', fn: () => alternarPainel() },
    { rotulo: L('Exibir: Alternar Painel Lateral', 'View: Toggle Side Bar'), tecla: 'Ctrl+B', fn: () => alternarLateral() },
    { rotulo: L('Exibir: Mostrar Explorador', 'View: Show Explorer'), tecla: 'Ctrl+Shift+E', fn: () => mostrarVista('explorer', { alternar: false }) },
    { rotulo: L('Exibir: Mostrar Pesquisa', 'View: Show Search'), tecla: 'Ctrl+Shift+F', fn: () => mostrarVista('busca', { alternar: false }) },
    { rotulo: L('Exibir: Mostrar Controle do Código-Fonte', 'View: Show Source Control'), tecla: 'Ctrl+Shift+G', fn: () => mostrarVista('scm', { alternar: false }) },
    { rotulo: L('Exibir: Mostrar Extensões', 'View: Show Extensions'), tecla: 'Ctrl+Shift+X', fn: () => mostrarVista('extensoes', { alternar: false }) },
    { rotulo: L('Exibir: Alternar Minimapa', 'View: Toggle Minimap'), fn: alternarMinimapa },
    { rotulo: L('Exibir: Alternar Quebra de Linha', 'View: Toggle Word Wrap'), tecla: 'Alt+Z', fn: alternarQuebra },
    { rotulo: L('Exibir: Alternar Modo Zen', 'View: Toggle Zen Mode'), fn: () => alternarZen() },
    { rotulo: L('Exibir: Alternar Tela Inteira', 'View: Toggle Full Screen'), fn: telaCheia },
    { rotulo: L('Exibir: Mostrar Saída', 'View: Show Output'), fn: () => mostrarPainel('saida') },
    { rotulo: L('Exibir: Mostrar Problemas', 'View: Show Problems'), fn: () => mostrarPainel('problemas') },
    { rotulo: L('Editor: Alternar Código ↔ Visualização', 'Editor: Toggle Code ↔ Preview'), fn: alternarModo, off: !temVisual() || estado.dividido },
    { rotulo: L('Editor: Abrir Visualização ao Lado', 'Editor: Open Preview to the Side'), fn: alternarDivisao, off: !temVisual() },
    { rotulo: L('Preferências: Tema de Cores', 'Preferences: Color Theme'), fn: () => setTimeout(() => abrirPaleta('', 'tema'), 0) },
    { rotulo: L('Configurar Idioma de Exibição', 'Configure Display Language'), fn: () => setTimeout(() => abrirPaleta('', 'idioma'), 0) },
    { rotulo: L('Preferências: Abrir Configurações', 'Preferences: Open Settings'), fn: () => abrir('config') },
    { rotulo: L('Ajuda: Atalhos de Teclado', 'Help: Keyboard Shortcuts'), fn: () => abrir('atalhos') },
    { rotulo: L('Depurar: Iniciar Depuração', 'Debug: Start Debugging'), tecla: 'F5', fn: depurar },
    { rotulo: L('Ana: Abrir a Extensão', 'Ana: Open the Extension'), fn: () => abrir('sobre') },
    { rotulo: L('Ana: Instalar como App', 'Ana: Install as App'), fn: instalarApp, off: !convite },
    { rotulo: L('Ana: Copiar E-mail', 'Ana: Copy Email'), fn: copiarEmail },
    { rotulo: L('Ana: Enviar E-mail', 'Ana: Send Email'), fn: () => { location.href = `mailto:${EMAIL}`; } },
    { rotulo: L('Ana: Abrir GitHub', 'Ana: Open GitHub'), fn: () => abrirFora(GITHUB) },
    { rotulo: L('Ana: Abrir LinkedIn', 'Ana: Open LinkedIn'), fn: () => abrirFora(LINKEDIN) },
    { rotulo: L('Abas: Reabrir Todas', 'Tabs: Reopen All'), fn: reabrirTodas },
    { rotulo: L('Abas: Fechar Todas', 'Tabs: Close All'), fn: fecharTodas },
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
    el.palIn.placeholder = {
      tema: L('Selecione o Tema de Cores (Setas Acima/Abaixo para Visualizar)', 'Select Color Theme (Up/Down Keys to Preview)'),
      idioma: L('Selecione o Idioma de Exibição', 'Select Display Language'),
    }[modo] || L('Pesquisar arquivos pelo nome (digite > para comandos)', 'Search files by name (type > for commands)');
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
      itens = Object.entries(TEMAS).map(([k, t]) => ({ tipo: 'tema', chave: k, rotulo: t.nome, det: k === pal.temaAntes ? L('atual', 'current') : '', fn: () => aplicarTema(k) }));
    } else if (pal.modo === 'idioma') {
      itens = Object.entries(IDIOMAS).map(([k, nome]) => ({ tipo: 'idioma', chave: k, rotulo: nome, det: k === html.dataset.idioma ? L('atual', 'current') : '', fn: () => trocarIdioma(k) }));
    } else if (v.startsWith('>')) {
      itens = COMANDOS().map((c) => ({ ...c, tipo: 'cmd' }));
    } else {
      itens = Object.keys(ARQUIVOS).filter((id) => !ARQUIVOS[id].tecnologia && !ARQUIVOS[id].soPagina).map((id) => ({ tipo: 'arq', id, rotulo: ARQUIVOS[id].nome, det: ARQUIVOS[id].pasta ? `portfolio-ana-neves/${ARQUIVOS[id].pasta}` : 'portfolio-ana-neves', icone: ARQUIVOS[id].icone, fn: () => abrir(id) }));
      if (v.trim()) itens = itens.concat(COMANDOS().map((c) => ({ ...c, tipo: 'cmd' })));
    }
    const q = (v.startsWith('>') ? v.slice(1) : v).trim();
    pal.itens = itens
      .map((it) => ({ ...it, casa: casar(it.rotulo, q) }))
      .filter((it) => it.casa)
      .sort((a, b) => (q ? b.casa.pontos - a.casa.pontos : 0));
    const atual = { tema: estado.tema, idioma: html.dataset.idioma }[pal.modo];
    pal.ativo = atual ? Math.max(0, pal.itens.findIndex((it) => it.chave === atual)) : 0;
    renderPaleta();
  }

  function renderPaleta() {
    if (!pal.itens.length) {
      el.palLista.innerHTML = `<li class="pal-vazio" role="presentation">${L('Nenhum resultado correspondente', 'No matching results')}</li>`;
      el.palIn.removeAttribute('aria-activedescendant');
      return;
    }
    let grupoAnterior = '';
    el.palLista.innerHTML = pal.itens.map((it, i) => {
      let h = '';
      if (pal.modo === 'arquivos' && it.tipo !== grupoAnterior && el.palIn.value.trim() && !el.palIn.value.startsWith('>')) {
        h += `<li class="pal-grupo" role="presentation">${it.tipo === 'arq' ? L('arquivos', 'files') : L('comandos', 'commands')}</li>`;
        grupoAnterior = it.tipo;
      }
      const teclas = it.tecla ? `<span class="lado">${it.tecla.split('+').map((t) => `<kbd>${esc(t)}</kbd>`).join('')}</span>` : '';
      const icone = it.tipo === 'arq' ? ic(it.icone) : it.tipo === 'tema' ? ic('color-mode') : it.tipo === 'idioma' ? ic('globe') : '';
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
    if (pal.modo !== 'arquivos' && el.palIn.value.startsWith('>')) pal.modo = 'arquivos';
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
    'novo-arquivo': () => notificar({ texto: L('Este workspace é somente leitura, mas o terminal aceita comandos: Ctrl+J e digite help.', 'This workspace is read-only, but the terminal takes commands: Ctrl+J and type help.') }),
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
      { rotulo: L('Configurar Perfil Padrão do Terminal', 'Select Default Profile'), fn: () => abrir('config') },
    ], bt, { focar: true }),
    'term-mais': (bt) => alternarMenu([
      { rotulo: L('Novo Terminal', 'New Terminal'), fn: ACOES['term-novo'] },
      { rotulo: L('Limpar Terminal', 'Clear Terminal'), tecla: 'Ctrl+L', fn: () => { limparTerminal(); el.termIn.focus(); } },
      '-',
      { rotulo: L('Histórico de Comandos', 'Command History'), fn: () => { executar('history'); el.termIn.focus(); } },
      { rotulo: L('Configurações do Terminal', 'Terminal Settings'), fn: () => abrir('config') },
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
      bt.setAttribute('aria-label', max ? L('Restaurar painel', 'Restore panel') : L('Maximizar painel', 'Maximize panel'));
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
     App instalável (PWA)
     ====================================================================== */
  // O service worker guarda o essencial para abrir sem internet. O convite de instalação
  // do navegador fica guardado e vira "Instalar como App" (paleta e menu de links).
  let convite = null;
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    convite = e;
  });
  addEventListener('appinstalled', () => {
    convite = null;
    registrar(L('app instalado', 'app installed'));
  });
  async function instalarApp() {
    if (!convite) return;
    convite.prompt();
    const { outcome } = await convite.userChoice;
    convite = null;
    registrar(`${L('instalação', 'install')}: ${outcome}`);
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }

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
    registrar(`${L('workbench pronto em', 'workbench ready in')} ${Math.round(performance.now())} ms`);
    registrar(`${L('tema de cores', 'color theme')}: ${TEMAS[estado.tema].nome}`);
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
