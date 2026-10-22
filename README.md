# portfolio-ana-neves

Meu portfólio é um editor de código: a interface do VS Code, com o tema Dracula, recriada à mão em HTML, CSS e JavaScript puros. Cada aba é uma seção (sobre mim, projetos, experiência, stack e contato), e o "README" é uma página de extensão com a minha foto.

## O que dá para fazer nele

- **Abas de verdade:** abrir, fechar, arrastar para reordenar e alternar entre visualização e código-fonte (o código de cada aba tem realce de sintaxe próprio, por linha).
- **Paleta de comandos** (`Ctrl+Shift+P`) com busca aproximada, e troca de tema com visualização ao vivo: Dracula, Dark Modern, Light Modern e Alto Contraste.
- **Terminal** (`Ctrl+J`) com `help`, `ls`, `cat`, `abrir`, `tema`, histórico e autocompletar com `Tab`.
- **Pesquisa em todos os arquivos**, minimapa clicável, dicas de hover no código, estrutura de tópicos e painéis redimensionáveis.
- **Status dos apps medido ao vivo:** a aba de projetos verifica do navegador de quem visita se cada app está no ar e quanto tempo levou para responder.
- **Controle do código-fonte que vira contato:** a mensagem do "commit" abre o cliente de e-mail já preenchida.

## Como é feito

- Zero dependências e zero etapa de build: `index.html`, `styles.css`, `app.js` e a página de extensão (`extensao.css` e `extensao.js`).
- As cores seguem as chaves de tema do VS Code (`titleBar`, `activityBar`, `tab`, `statusBar`...). Onde o tema original fica abaixo de 4,5:1 de contraste, o valor foi clareado só o suficiente para passar.
- Acessível por teclado do começo ao fim, com foco visível, rótulos para leitor de tela e `prefers-reduced-motion` respeitado (o avatar animado vira imagem parada).
- Content Security Policy estrita, sem script nem estilo inline.

## Rodar localmente

Qualquer servidor estático serve. Por exemplo:

```
python -m http.server 5198
```

e abrir `http://localhost:5198`.

## Créditos

Avatar em pixel art da Ana. Paleta do tema baseada no [Dracula](https://draculatheme.com) (MIT). Ícones desenhados à mão no estilo dos Codicons e do Material Icon Theme.
