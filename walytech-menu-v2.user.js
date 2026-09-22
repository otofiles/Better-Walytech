// ==UserScript==
// @name         Better walytech
// @namespace    https://walyzappro.walytech.com.br
// @version      2.5
// @description  Melhora funcionalidades no bot.
// @match        https://walyzappro.walytech.com.br/new/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js
// @downloadURL  https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  console.log('[walytech] script carregado');

  function getHeader() {
    return document.querySelector('.flex.h-16.shrink-0.items-center.justify-between.border-b.border-border.bg-card.px-3');
  }

  function getDots() {
    var h = getHeader();
    if (!h) return null;
    var todos = h.querySelectorAll('button[aria-haspopup="menu"]');
    return todos.length ? todos[todos.length - 1] : null;
  }

  function norm(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function listarMenus() {
    var menus = document.querySelectorAll('[role="menu"][data-state="open"]');
    console.log('[walytech] menus abertos:', menus.length);
    menus.forEach(function (m) {
      var itens = [];
      m.querySelectorAll('[role="menuitem"]').forEach(function (i) {
        itens.push('"' + i.textContent.trim() + '"');
      });
      console.log('[walytech]  - itens do menu:', itens.length ? itens.join(', ') : '(nenhum item)');
    });
    return menus;
  }

  function disp(elm, tipo, props) {
    try {
      elm.dispatchEvent(new PointerEvent(tipo, props));
    } catch (e) {
      elm.dispatchEvent(new MouseEvent(tipo, { bubbles: true, cancelable: true, view: window, button: 0 }));
    }
  }

  function abrirTrigger(btn3) {
    btn3.focus();
    disp(btn3, 'pointerdown', {
      bubbles: true, cancelable: true, view: window, button: 0, buttons: 1,
      pointerId: 1, pointerType: 'mouse', isPrimary: true
    });
  }

  function clicarItem(item) {
    disp(item, 'pointerdown', {
      bubbles: true, cancelable: true, view: window, button: 0, buttons: 1,
      pointerId: 1, pointerType: 'mouse', isPrimary: true
    });
    disp(item, 'pointerup', {
      bubbles: true, cancelable: true, view: window, button: 0, buttons: 0,
      pointerId: 1, pointerType: 'mouse', isPrimary: true
    });
    item.click();
  }

  function estaAberto() {
    return document.querySelector('[role="menu"][data-state="open"]');
  }

  function executar(nome) {
    var btn3 = getDots();
    if (!btn3) {
      console.log('[walytech] 3 pontinhos NAO encontrado para', nome);
      return;
    }
    var n = norm(nome);
    console.log('[walytech] abrindo menu para:', nome);

    setTimeout(function () {
      var abriu = false;
      var abertoUmaVez = false;
      var desistiu = false;
      var tentativas = 0;
      var timer = setInterval(function () {
        tentativas++;
        var menus = document.querySelectorAll('[role="menu"][data-state="open"]');
        if (menus.length > 0) abriu = true;

        if (!estaAberto() && !abertoUmaVez && !desistiu) {
          abertoUmaVez = true;
          abrirTrigger(btn3);
        }

        if (!estaAberto() && abertoUmaVez) {
          return;
        }

        var target = null;
        document.querySelectorAll('[role="menu"][data-state="open"]').forEach(function (m) {
          var itens = m.querySelectorAll('[role="menuitem"]');
          for (var i = 0; i < itens.length; i++) {
            if (!target && norm(itens[i].textContent) === n) target = itens[i];
          }
        });

        if (target) {
          clearInterval(timer);
          console.log('[walytech] opcao encontrada, clicando:', nome);
          clicarItem(target);
        } else if (tentativas >= 35) {
          clearInterval(timer);
          if (abriu) {
            console.log('[walytech] menu ABRIU mas nao achei a opcao', nome);
            listarMenus();
          } else {
            console.log('[walytech] menu NUNCA abriu para', nome);
          }
          if (estaAberto()) btn3.click();
        }
      }, 120);
    }, 50);
  }

  function limparHeaderAcoes() {
    var h = getHeader();
    if (!h) return;
    var g = h.querySelector('.flex.shrink-0.items-center.gap-0\\.5');
    if (!g) return;
    var menus = [];
    g.querySelectorAll('button').forEach(function (b) {
      var ehNosso = b.hasAttribute('data-walytech') || b.hasAttribute('data-walytech-rgb') || b.hasAttribute('data-walytech-timer');
      if (ehNosso) { b.style.display = ''; return; }
      var la = norm(b.getAttribute('aria-label') || '');
      var manter = /finali[sz]|finish|terminar|terminar atendimento/.test(la) ||
        /transfer/.test(la) ||
        /fechar conversa|close \w*(conversation|chat)|encerrar|cerrar/.test(la);
      var ehMenu = b.getAttribute('aria-haspopup') === 'menu';
      if (ehMenu) {
        menus.push(b);
        b.style.display = 'none';
        return;
      }
      b.style.display = manter ? '' : 'none';
    });
    if (menus.length) menus[menus.length - 1].style.display = '';
  }

  function acharBotoesNativos() {
    var h = getHeader();
    if (!h) return {};
    var g = h.querySelector('.flex.shrink-0.items-center.gap-0\\.5');
    if (!g) return {};
    var res = { pesquisar: null, tags: null, soltar: null, detalhes: null };
    var buttons = g.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.getAttribute('aria-haspopup') === 'menu') continue;
      var svg = b.querySelector('svg');
      var inner = svg ? svg.innerHTML : '';
      var la = norm(b.getAttribute('aria-label') || '');
      if (!res.pesquisar && inner.indexOf('m21 21-4.34-4.34') !== -1) res.pesquisar = b;
      else if (!res.tags && (la.indexOf('tag') !== -1 || inner.indexOf('M13.172 2a2') !== -1)) res.tags = b;
      else if (!res.soltar && inner.indexOf('M21 9V6a2 2 0 0 0-2-2H4') !== -1) res.soltar = b;
      else if (!res.detalhes && inner.indexOf('M15 3v18') !== -1) res.detalhes = b;
    }
    return res;
  }

  function acharMenuHeader() {
    var menus = document.querySelectorAll('[role="menu"][data-state="open"]');
    for (var i = 0; i < menus.length; i++) {
      var m = menus[i];
      var itens = m.querySelectorAll('[role="menuitem"]');
      for (var j = 0; j < itens.length; j++) {
        var t = norm(itens[j].textContent);
        if (t === 'encaminhar mensagens' || t === 'marcar como nao lido' || t === 'remover retorno') return m;
      }
    }
    return null;
  }

  function executarNativo(tipo) {
    var btn3 = getDots();
    try { if (btn3) btn3.click(); } catch (e) {}
    setTimeout(function () {
      var n = acharBotoesNativos();
      var b = n[tipo];
      if (!b) return;
      try { b.click(); } catch (e) {}
    }, 60);
  }

  function injetarItensMenu() {
    var btn3 = getDots();
    if (!btn3) return;
    var menu = acharMenuHeader();
    if (!menu) return;
    if (menu.querySelector('[data-walytech-menuextra]')) return;
    var nativos = acharBotoesNativos();
    var acres = [
      { t: 'pesquisar', r: 'Pesquisar na conversa', b: nativos.pesquisar },
      { t: 'tags', r: 'Adicionar Tag', b: nativos.tags },
      { t: 'soltar', r: 'Soltar chat', b: nativos.soltar },
      { t: 'detalhes', r: 'Detalhes do contato', b: nativos.detalhes }
    ];
    var presente = 0;
    for (var a = 0; a < acres.length; a++) { if (acres[a].b) presente++; }
    if (!presente) return;
    var modelo = menu.querySelector('[role="menuitem"]');
    var cls = modelo ? modelo.className : '';
    var sep = document.createElement('div');
    sep.setAttribute('role', 'separator');
    sep.className = 'my-1 h-px bg-border -mx-1';
    sep.setAttribute('data-walytech-menuextra', 'sep');
    menu.appendChild(sep);
    for (var k = 0; k < acres.length; k++) {
      var a2 = acres[k];
      if (!a2.b) continue;
      var item = document.createElement('div');
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
      item.className = cls;
      item.setAttribute('data-walytech-menuextra', a2.t);
      item.style.cursor = 'pointer';
      var svg = a2.b.querySelector('svg');
      var svgHtml = svg ? svg.outerHTML : '';
      svgHtml = svgHtml.replace(/class="[^"]*"/, 'class="mr-2 h-4 w-4"');
      item.innerHTML = svgHtml + a2.r;
      (function (tipo) {
        item.addEventListener('click', function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          executarNativo(tipo);
        });
      })(a2.t);
      menu.appendChild(item);
    }
  }

  function loopBotoes() {
    try { limparHeaderAcoes(); } catch (e) { console.log('[walytech] erro:', e.message); }
    try { injetarItensMenu(); } catch (e) { console.log('[walytech] erro:', e.message); }
  }

  var MARCA = 'data-walytech-nav';
  var MARCA_GRUPO = 'data-walytech-navwrap';

  var SVG_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>';
  var SVG_REL = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg>';

  var SVG_DL = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>';

  var SVG_STA = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></svg>';

  var ATALHOS = [
    { rotulo: 'Chat', caminho: '/tickets', svg: SVG_CHAT },
    { rotulo: 'Relatório de Atendimentos', caminho: '/tickets/service-report', svg: SVG_REL },
    { rotulo: 'Baixar atualizações', acao: 'update', svg: SVG_DL }
  ];

  function getBase() {
    var s = document.querySelector('script[src*="/assets/index-"]');
    if (s) {
      try {
        var u = new URL(s.getAttribute('src'), location.origin);
        var m = u.pathname.match(/^(.*\/)assets\//);
        if (m) return m[1];
      } catch (e) {}
    }
    var idx = location.pathname.indexOf('/tickets');
    if (idx > 0) return location.pathname.slice(0, idx + 1);
    return '/new/';
  }

  function getNav() {
    var asides = document.querySelectorAll('aside.bg-sidebar');
    for (var i = 0; i < asides.length; i++) {
      var n = asides[i].querySelector('nav');
      if (n) return n;
    }
    return null;
  }

  function estaRecolhida(nav) {
    return nav.classList.contains('px-2') && !nav.classList.contains('px-3');
  }

  function hrefCompleto(caminho) {
    return getBase().replace(/\/$/, '') + caminho;
  }

  function rotaAtiva(caminho) {
    var p = location.pathname.replace(/\/$/, '');
    if (caminho === '/tickets') {
      return p.endsWith('/tickets') || /\/tickets\/\d+$/.test(p);
    }
    return p.endsWith(caminho);
  }

  function navegar(href) {
    var main = document.querySelector('main') || document.getElementById('root');
    var mudou = false;
    var obs = null;
    if (main) {
      obs = new MutationObserver(function () { mudou = true; });
      obs.observe(main, { childList: true, subtree: true });
    }
    try {
      history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    } catch (e) {}
    setTimeout(function () {
      if (obs) obs.disconnect();
      if (!mudou) window.location.href = href;
    }, 700);
  }

  function montarLink(item, recolhida) {
    var a = document.createElement('a');
    if (item.caminho) {
      a.setAttribute(MARCA, item.caminho);
      a.setAttribute('href', hrefCompleto(item.caminho));
    } else if (item.acao === 'update') {
      a.setAttribute('data-walytech-update', '1');
      a.style.cursor = 'pointer';
    }
    a.setAttribute('title', item.rotulo);
    a.setAttribute('aria-label', item.rotulo);
    a.style.fontSize = '13px';
    a.className = recolhida
      ? 'group relative flex items-center rounded-lg text-sm transition-all duration-200 cursor-pointer h-10 w-10 justify-center'
      : 'group relative flex items-center rounded-lg text-sm transition-all duration-200 cursor-pointer w-full gap-3 px-2 py-2';
    a.innerHTML = item.svg + (recolhida
      ? ''
      : '<span class="flex-1 text-left truncate">' + item.rotulo + '</span>');
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (item.acao === 'update') {
        baixarAtualizacao();
        return;
      }
      if (rotaAtiva(item.caminho)) return;
      navegar(a.getAttribute('href'));
    });
    return a;
  }

  function pintarAtivo(a, item) {
    if (!item.caminho) return;
    var on = rotaAtiva(item.caminho);
    a.classList.toggle('bg-sidebar-accent', on);
    a.classList.toggle('text-sidebar-accent-foreground', on);
    a.classList.toggle('text-sidebar-foreground/80', !on);
    a.classList.toggle('hover:bg-sidebar-accent/40', !on);
    a.classList.toggle('hover:text-sidebar-foreground', !on);
  }

  function montarGrupo(recolhida) {
    var wrap = document.createElement('div');
    wrap.setAttribute(MARCA_GRUPO, '1');
    wrap.className = recolhida ? 'flex flex-col items-center gap-1' : 'space-y-0.5';
    ATALHOS.forEach(function (item) {
      wrap.appendChild(montarLink(item, recolhida));
    });
    return wrap;
  }

  function principlaRodape(recolhida) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-walytech-status', '1');
    btn.title = 'Verificar status do bot (clique para checar)';
    btn.setAttribute('aria-label', 'Verificar status');
    btn.style.cssText = 'display:flex;align-items:center;gap:10px;border-radius:12px;background:rgba(255,255,255,.04);color:inherit;font:inherit;text-align:left;cursor:pointer;margin-top:8px;border:1px solid rgba(128,128,128,.35);' + (recolhida ? 'width:40px;height:40px;justify-content:center;' : 'width:100%;padding:10px 12px;');
    btn.innerHTML = '<span style="display:inline-flex;flex-shrink:0">' + SVG_STA + '</span>' + (recolhida ? '' : '<span style="min-width:0;flex:1">Status do bot<br><span style="font-size:11px;opacity:.7">clique para verificar</span></span>');
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      verificarStatus();
    });
    return btn;
  }

  function loopStatusRodape() {
    try {
      var aside = null;
      var asides = document.querySelectorAll('aside.bg-sidebar');
      for (var i = 0; i < asides.length; i++) {
        if (asides[i].querySelector('nav')) { aside = asides[i]; break; }
      }
      if (!aside) return;
      var nav = aside.querySelector('nav');
      if (!nav) return;
      var recolhida = estaRecolhida(nav);
      var card = null;
      var btns = aside.querySelectorAll('button');
      for (var k = 0; k < btns.length; k++) {
        var b = btns[k];
        var t = (b.getAttribute('aria-label') || '') + ' ' + (b.textContent || '');
        if (/precisa de ajuda|need help|necesitas ayuda|falar com o suporte|contact support/i.test(t)) { card = b; break; }
      }
      if (!card) return;
      var pai = card.parentNode;
      if (!pai) return;
      var btn = pai.querySelector('[data-walytech-status]');
      if (!btn) {
        pai.appendChild(principlaRodape(recolhida));
        console.log('[walytech] botao status no rodape da sidebar');
      } else if (btn.getAttribute('data-recolhida') !== String(recolhida)) {
        var novo = principlaRodape(recolhida);
        novo.setAttribute('data-recolhida', String(recolhida));
        btn.parentNode.replaceChild(novo, btn);
        btn = novo;
      }
      if (btn && !btn.getAttribute('data-recolhida')) btn.setAttribute('data-recolhida', String(recolhida));
      if (STATUS_RESULT) pintarStatus(STATUS_RESULT.online);
    } catch (e) {}
  }

  function loopLink() {
    try {
      var nav = getNav();
      if (!nav) return;
      var recolhida = estaRecolhida(nav);
      var wrap = nav.querySelector('[' + MARCA_GRUPO + ']');
      if (wrap && wrap.getAttribute('data-recolhida') !== String(recolhida)) {
        wrap.remove();
        wrap = null;
      }
      if (!wrap) {
        wrap = montarGrupo(recolhida);
        wrap.setAttribute('data-recolhida', String(recolhida));
        nav.insertBefore(wrap, nav.firstChild);
        console.log('[walytech] atalhos injetados na barra lateral');
      }
      ATALHOS.forEach(function (item) {
        var a = item.caminho
          ? wrap.querySelector('[' + MARCA + '="' + item.caminho + '"]')
          : wrap.querySelector('[data-walytech-update]');
        if (a) pintarAtivo(a, item);
      });
      if (STATUS_RESULT) pintarStatus(STATUS_RESULT.online);
    } catch (e) {
      console.log('[walytech] erro:', e.message);
    }
  }

  var COR_PADRAO = '#811c1c';
  var COR_KEY = 'walytechBrandColor';
  var BRILHO_KEY = 'walytechBrandBrightness';
  var BRILHO_MIN = -40;
  var BRILHO_MAX = 40;
  var BG_KEY = 'walytechBg';
  var BG_ON_KEY = 'walytechBgOn';
  var BGBRILHO_KEY = 'walytechBgBrilho';
  var BGBRILHO_MIN = -60;
  var BGBRILHO_MAX = 60;
  var TIMER_KEY = 'walytechTimerMin';
  var TIMER_ON_KEY = 'walytechTimerOn';
  var TIMER_OPCOES = [1, 2, 3, 5, 10, 15, 20, 30];
  var LUMI_KEY = 'walytechLuminosidade';
  var LUMI_MIN = -40;
  var LUMI_MAX = 40;
  var SEL_PALETA = ':root:root, .light.light, [data-theme="light"][data-theme="light"], [data-state="closed"][data-state="closed"]';

  var CORES = [
    { nome: 'Vermelho (padrão)', cor: '#811c1c' },
    { nome: 'Azul', cor: '#1d4ed8' },
    { nome: 'Verde', cor: '#15803d' },
    { nome: 'Roxo', cor: '#6d28d9' },
    { nome: 'Laranja', cor: '#c2410c' },
    { nome: 'Rosa', cor: '#be185d' }
  ];

  var CSS_BASE =
    'header button,header a,header [role="menuitem"]{color:#FFFFFF!important}' +
    'header button svg,header a svg,header [role="menuitem"] svg{stroke:#FFFFFF!important;color:#FFFFFF!important}' +
    'header button:hover,header a:hover,header [role="menuitem"]:hover{background-color:rgba(255,255,255,.14)!important;color:#FFFFFF!important}' +
    '[data-walytech] svg{pointer-events:none}' +
    'html.waly-bg::before{content:"";position:fixed;inset:0;z-index:-1;background-image:var(--waly-bg-img);background-position:center;background-size:cover;background-repeat:no-repeat;background-attachment:fixed}' +
    'html.waly-bg::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:var(--waly-bg-shade)}' +
    'html.waly-bg,html.waly-bg body{background-color:transparent!important}' +
    'html.waly-bg [class*="bg-background"],html.waly-bg [class*="bg-muted/"]{background-color:transparent!important}' +
    'html.waly-chat [class~="text-primary"],html [id^="msg-"] [class~="text-primary"],html [class*="bg-wa-chat-bg"] [class~="text-primary"],html [class*="bg-wa-bubble"] [class~="text-primary"]{color:#FFFFFF!important;font-weight:700!important}' +
    '.flex.h-16.shrink-0.items-center.justify-between.border-b.border-border.bg-card.px-3 button[aria-label="Finalizar"] svg{stroke:#dc2626!important;color:#dc2626!important}' +
    '.flex.h-16.shrink-0.items-center.justify-between.border-b.border-border.bg-card.px-3 button[aria-label="Finalizar"]:hover svg{stroke:#b91c1c!important;color:#b91c1c!important}' +
    'button[aria-label="Toggle theme"]{display:none!important}';

  var estiloTema = document.createElement('style');
  estiloTema.id = 'walytech-tema';
  (document.head || document.documentElement).appendChild(estiloTema);

  var estiloPainel = document.createElement('style');
  estiloPainel.id = 'walytech-rgb-style';
  estiloPainel.textContent =
    '#walytech-rgb-panel{position:fixed;z-index:2147483600;display:none;width:248px;padding:14px;border-radius:14px;background:#1b1b21;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px}' +
    '#walytech-rgb-panel.waly-aberto{display:block}' +
    '#walytech-rgb-panel .waly-rgb-topo{display:flex;align-items:center;justify-content:space-between;font-weight:600;margin-bottom:10px}' +
    '#walytech-rgb-panel .waly-rgb-x{background:none;border:0;color:#fff;cursor:pointer;font-size:13px;opacity:.7;padding:2px 4px}' +
    '#walytech-rgb-panel .waly-rgb-x:hover{opacity:1}' +
    '#walytech-rgb-panel .waly-rgb-bolas{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:12px}' +
    '#walytech-rgb-panel .waly-rgb-bola{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25);cursor:pointer;padding:0;transition:transform .12s}' +
    '#walytech-rgb-panel .waly-rgb-bola:hover{transform:scale(1.12)}' +
    '#walytech-rgb-panel .waly-rgb-bola.waly-sel{border-color:#fff}' +
    '#walytech-rgb-panel .waly-rgb-linha{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}' +
    '#walytech-rgb-panel .waly-rgb-input{width:54px;height:30px;border:0;background:none;cursor:pointer;padding:0}' +
    '#walytech-rgb-panel .waly-rgb-reset{width:100%;padding:8px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px}' +
    '#walytech-rgb-panel .waly-rgb-reset:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-rgb-panel .waly-rgb-bval{opacity:.75;font-variant-numeric:tabular-nums}' +
    '#walytech-rgb-panel .waly-rgb-range{width:100%;margin:0 0 12px;cursor:pointer;accent-color:#fff}' +
    '#walytech-bg-panel{position:fixed;z-index:2147483600;display:none;width:260px;padding:14px;border-radius:14px;background:#1b1b21;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px}' +
    '#walytech-bg-panel.waly-aberto{display:block}' +
    '#walytech-bg-panel .waly-rgb-topo{display:flex;align-items:center;justify-content:space-between;font-weight:600;margin-bottom:10px}' +
    '#walytech-bg-panel .waly-rgb-x{background:none;border:0;color:#fff;cursor:pointer;font-size:13px;opacity:.7;padding:2px 4px}' +
    '#walytech-bg-panel .waly-rgb-x:hover{opacity:1}' +
    '#walytech-bg-panel .waly-rgb-linha{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}' +
    '#walytech-bg-panel .waly-rgb-range{width:100%;margin:0 0 12px;cursor:pointer;accent-color:#fff}' +
    '#walytech-bg-panel .waly-rgb-bval{opacity:.75;font-variant-numeric:tabular-nums}' +
    '#walytech-bg-panel .waly-bg-prevw{display:none;margin-bottom:10px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.16)}' +
    '#walytech-bg-panel #waly-bg-preview{display:block;width:100%;max-height:110px;object-fit:cover;background:#000}' +
    '#walytech-bg-panel .waly-bg-ligado{display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer}' +
    '#walytech-bg-panel .waly-bg-acoes{display:flex;gap:8px;margin-top:12px}' +
    '#walytech-bg-panel .waly-rgb-reset{padding:8px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px}' +
    '#walytech-bg-panel .waly-rgb-reset:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-bg-panel .waly-bg-acoes .waly-rgb-reset{flex:1}' +
    '#walytech-bg-panel .waly-bg-remover{border-color:rgba(239,68,68,.5)!important;color:#EF4444!important}' +
    '#walytech-bg-panel .waly-bg-remover:hover{background:rgba(239,68,68,.16)!important}' +
    '#waly-bg-file{display:none}' +
    '#walytech-timer-panel{position:fixed;z-index:2147483600;display:none;width:232px;padding:14px;border-radius:14px;background:#1b1b21;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px}' +
    '#walytech-timer-panel.waly-aberto{display:block}' +
    '#walytech-timer-panel .waly-rgb-topo{display:flex;align-items:center;justify-content:space-between;font-weight:600;margin-bottom:10px}' +
    '#walytech-timer-panel .waly-rgb-x{background:none;border:0;color:#fff;cursor:pointer;font-size:13px;opacity:.7;padding:2px 4px}' +
    '#walytech-timer-panel .waly-rgb-x:hover{opacity:1}' +
    '#walytech-timer-panel .waly-timer-desc{opacity:.8;margin-bottom:8px}' +
    '#walytech-timer-panel .waly-timer-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}' +
    '#walytech-timer-panel .waly-timer-chip{padding:6px 0;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:12px;text-align:center}' +
    '#walytech-timer-panel .waly-timer-chip:hover{background:rgba(255,255,255,.14)}' +
    '#walytech-timer-panel .waly-timer-chip.waly-sel{border-color:#fff;background:rgba(255,255,255,.22);font-weight:600}' +
    '#walytech-timer-panel .waly-timer-status{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;font-size:12px;opacity:.85}' +
    '#walytech-timer-panel .waly-timer-st{width:100%;padding:8px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px}' +
    '#walytech-timer-panel .waly-timer-st:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-timer-panel .waly-timer-st.waly-parar{border-color:rgba(239,68,68,.5);color:#EF4444}' +
    '#walytech-timer-panel .waly-timer-st.waly-parar:hover{background:rgba(239,68,68,.14)}' +
    '#walytech-timer-panel .waly-timer-agora{width:100%;margin-top:8px;padding:6px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:none;color:#94a3b8;cursor:pointer;font-size:11px}' +
    '#walytech-timer-panel .waly-timer-agora:hover{color:#fff}' +
    '#walytech-timer-panel .waly-timer-last{font-size:11px;opacity:.7;margin-top:6px;text-align:center}' +
    '#waly-toast{position:fixed;right:16px;bottom:16px;z-index:2147483700;padding:10px 14px;border-radius:10px;background:#1b1b21;color:#4ADE80;border:1px solid rgba(74,222,128,.4);box-shadow:0 12px 32px -8px rgba(0,0,0,.6);font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px;font-weight:600;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none;white-space:pre-line}' +
    '#waly-toast.waly-mostrar{opacity:1;transform:translateY(0)}' +
    '#waly-toast.waly-erro{color:#F87171;border-color:rgba(248,113,113,.5)}' +
    '#walytech-brilho-panel{position:fixed;z-index:2147483600;display:none;width:248px;padding:14px;border-radius:14px;background:#1b1b21;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px}' +
    '#walytech-brilho-panel.waly-aberto{display:block}' +
    '#walytech-brilho-panel .waly-rgb-topo{display:flex;align-items:center;justify-content:space-between;font-weight:600;margin-bottom:10px}' +
    '#walytech-brilho-panel .waly-rgb-x{background:none;border:0;color:#fff;cursor:pointer;font-size:13px;opacity:.7;padding:2px 4px}' +
    '#walytech-brilho-panel .waly-rgb-x:hover{opacity:1}' +
    '#walytech-brilho-panel .waly-rgb-linha{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}' +
    '#walytech-brilho-panel .waly-rgb-range{width:100%;margin:0 0 12px;cursor:pointer;accent-color:#fff}' +
    '#walytech-brilho-panel .waly-rgb-bval{opacity:.75;font-variant-numeric:tabular-nums}' +
    '#walytech-brilho-panel .waly-rgb-reset{width:100%;padding:8px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px}' +
    '#walytech-brilho-panel .waly-rgb-reset:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-brilho-panel .waly-brilho-desc{opacity:.75;margin-bottom:10px;line-height:1.4}' +
    '#walytech-brilho-overlay{position:fixed;inset:0;z-index:2147483500;pointer-events:none;display:none}' +
    '[data-walytech-timer].waly-ativo svg{stroke:#4ADE80!important;color:#4ADE80!important}' +
    '#walytech-teclas-panel{position:fixed;z-index:2147483600;display:none;width:258px;padding:14px;border-radius:14px;background:#1b1b21;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px}' +
    '#walytech-teclas-panel.waly-aberto{display:block}' +
    '#walytech-teclas-panel .waly-rgb-topo{display:flex;align-items:center;justify-content:space-between;font-weight:600;margin-bottom:10px}' +
    '#walytech-teclas-panel .waly-rgb-x{background:none;border:0;color:#fff;cursor:pointer;font-size:13px;opacity:.7;padding:2px 4px}' +
    '#walytech-teclas-panel .waly-rgb-x:hover{opacity:1}' +
    '#walytech-teclas-panel .waly-teclas-desc{opacity:.75;margin-bottom:10px;line-height:1.5}' +
    '#walytech-teclas-panel .waly-teclas-linha{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.07)}' +
    '#walytech-teclas-panel .waly-teclas-linha:first-of-type{border-top:0}' +
    '#walytech-teclas-panel .waly-teclas-rot{opacity:.9}' +
    '#walytech-teclas-panel .waly-teclas-tecla{padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px;text-align:center;white-space:nowrap}' +
    '#walytech-teclas-panel .waly-teclas-tecla:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-teclas-panel .waly-teclas-gravando{border-color:#4ADE80;color:#4ADE80;animation:waly-teclas-pisca .9s infinite alternate}' +
    '@keyframes waly-teclas-pisca{from{opacity:.55}to{opacity:1}}' +
    '#walytech-teclas-panel .waly-rgb-reset{width:100%;padding:8px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px;margin-top:6px}' +
    '#walytech-teclas-panel .waly-rgb-reset:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-rgb-panel{width:300px;max-height:calc(100vh - 90px);overflow-y:auto}' +
    '#walytech-rgb-panel .waly-rgb-abas{display:flex;gap:2px;margin-bottom:12px}' +
    '#walytech-rgb-panel .waly-rgb-aba{flex:1;padding:6px 2px 8px;text-align:center;background:none;border:0;border-bottom:2px solid rgba(255,255,255,.08);color:rgba(255,255,255,.6);cursor:pointer;font-size:12px;line-height:1.2}' +
    '#walytech-rgb-panel .waly-rgb-aba:hover{color:#fff}' +
    '#walytech-rgb-panel .waly-rgb-aba.waly-aba-ativa{color:#fff;border-bottom-color:#fff;font-weight:600}' +
    '#walytech-rgb-panel .waly-aba-section{display:none}' +
    '#walytech-rgb-panel .waly-aba-section.waly-vis{display:block}' +
    '#walytech-rgb-panel .waly-tema-etq{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin:0 0 4px}' +
    '#walytech-rgb-panel .waly-tema-botoes{display:flex;gap:6px;margin-bottom:12px}' +
    '#walytech-rgb-panel .waly-tema-botao{flex:1;padding:7px 0;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:12px}' +
    '#walytech-rgb-panel .waly-tema-botao:hover{background:rgba(255,255,255,.14)}' +
    '#walytech-rgb-panel .waly-tema-botao.waly-sel{border-color:#fff;background:rgba(255,255,255,.22);font-weight:600}' +
    '#walytech-rgb-panel .waly-bg-prevw{display:none;margin-bottom:10px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.16)}' +
    '#walytech-rgb-panel #waly-bg-preview{display:block;width:100%;max-height:110px;object-fit:cover;background:#000}' +
    '#walytech-rgb-panel .waly-bg-ligado{display:flex;align-items:center;gap:8px;margin-bottom:12px;cursor:pointer}' +
    '#walytech-rgb-panel .waly-bg-acoes{display:flex;gap:8px;margin-top:12px}' +
    '#walytech-rgb-panel .waly-bg-acoes .waly-rgb-reset{flex:1}' +
    '#walytech-rgb-panel .waly-bg-remover{border-color:rgba(239,68,68,.5)!important;color:#EF4444!important}' +
    '#walytech-rgb-panel .waly-bg-remover:hover{background:rgba(239,68,68,.16)!important}' +
    '#walytech-rgb-panel .waly-brilho-desc{opacity:.75;margin-bottom:10px;line-height:1.4}' +
    '#walytech-rgb-panel .waly-teclas-desc{opacity:.75;margin-bottom:10px;line-height:1.5}' +
    '#walytech-rgb-panel .waly-teclas-linha{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.07)}' +
    '#walytech-rgb-panel .waly-teclas-linha:first-of-type{border-top:0}' +
    '#walytech-rgb-panel .waly-teclas-rot{opacity:.9;font-size:12px}' +
    '#walytech-rgb-panel .waly-teclas-tecla{padding:3px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:12px;text-align:center;white-space:nowrap}' +
    '#walytech-rgb-panel .waly-teclas-tecla:hover{background:rgba(255,255,255,.16)}' +
    '#walytech-rgb-panel .waly-teclas-gravando{border-color:#4ADE80;color:#4ADE80}' +
    '#walytech-rgb-panel .waly-av-anota{opacity:.75;margin-bottom:10px;line-height:1.4}' +
    '#walytech-rgb-panel .waly-av-grupo{margin-top:10px;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;opacity:.5}' +
    '#walytech-rgb-panel .waly-av-linha{display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.07)}' +
    '#walytech-rgb-panel .waly-av-rot{flex:1;font-size:12px;opacity:.9}' +
    '#walytech-rgb-panel .waly-av-input{width:34px;height:24px;border:0;background:none;cursor:pointer;padding:0}' +
    '#walytech-rgb-panel .waly-av-x{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:13px;padding:0 2px}' +
    '#walytech-rgb-panel .waly-av-x:hover{color:#EF4444}';
  (document.head || document.documentElement).appendChild(estiloPainel);

  function hexToHsl(hex) {
    hex = String(hex || '').replace('#', '');
    if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    var r = parseInt(hex.substr(0, 2), 16) / 255;
    var g = parseInt(hex.substr(2, 2), 16) / 255;
    var b = parseInt(hex.substr(4, 2), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0, s = 0, l = (max + min) / 2;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: s * 100, l: l * 100 };
  }

  function clamp100(v) { return Math.max(0, Math.min(100, v)); }
  function mixUp(l, f) { return l + (100 - l) * f; }
  function mixDn(l, f) { return l * (1 - f); }

  function buildCss(h, s, l0) {
    h = Math.round(h); s = clamp100(s); l0 = clamp100(l0);
    var P = function (l, ss) { return 'hsl(' + h + ' ' + clamp100(ss == null ? s : ss) + '% ' + clamp100(l) + '%)'; };
    var infoH = (h + 9) % 360;
    var ring = P(mixDn(l0, .129), s * 1.14);
    var regras = [
      '--primary:' + P(l0) + '!important',
      '--primary-foreground:#FFFFFF!important',
      '--ring:' + ring + '!important',
      '--secondary:' + P(mixDn(l0, .097), s * 0.97) + '!important',
      '--secondary-foreground:#FFFFFF!important',
      '--primary-glow:' + h + ' ' + clamp100(s * 1.31) + '% ' + clamp100(mixUp(l0, .42)) + '%!important',
      '--gradient-primary:linear-gradient(135deg,' + P(mixUp(l0, .159), s * 1.16) + ',' + P(mixUp(l0, .42), s * 1.31) + ')!important',
      '--shadow-glow:0 0 12px hsla(' + h + ',' + clamp100(s * 1.12) + '%,' + clamp100(mixUp(l0, .29)) + '%,.45)!important',
      '--shadow-elevated:0 10px 30px -10px hsla(' + h + ',' + clamp100(s * 1.12) + '%,' + clamp100(mixUp(l0, .29)) + '%,.35)!important',
      '--shadow-elegant:0 4px 20px -4px hsla(' + h + ',' + clamp100(s * 1.12) + '%,' + clamp100(mixUp(l0, .29)) + '%,.28),0 2px 8px -2px rgba(0,0,0,.06)!important',
      '--info:hsl(' + infoH + ' ' + clamp100(s * 1.14) + '% ' + clamp100(mixUp(l0, .348)) + '%)!important',
      '--info-foreground:#FFFFFF!important',
      '--chart-1:' + P(mixUp(l0, .42), s * 1.31) + '!important',
      '--wa-read:hsl(' + h + ' ' + clamp100(Math.min(s * 1.1, 80)) + '% ' + clamp100(mixUp(l0, .275)) + '%)!important',
      '--wa-bubble-out:hsl(' + ((h + 5) % 360) + ' ' + clamp100(s * 0.59) + '% ' + clamp100(mixDn(l0, .355)) + '%)!important',
      '--wa-bubble-out-foreground:hsl(' + h + ' ' + clamp100(s * 0.23) + '% ' + clamp100(mixUp(l0, .913)) + '%)!important',
      '--fc-button-bg-color:' + P(mixUp(l0, .159), s * 1.16) + '!important',
      '--fc-button-border-color:' + P(mixUp(l0, .159), s * 1.16) + '!important',
      '--fc-button-hover-bg-color:' + P(mixDn(l0, .032), s * 0.98) + '!important',
      '--fc-button-hover-border-color:' + P(mixDn(l0, .032), s * 0.98) + '!important',
      '--fc-button-active-bg-color:' + P(mixDn(l0, .032), s * 0.98) + '!important',
      '--fc-button-active-border-color:' + P(mixDn(l0, .161)) + '!important',
      '--fc-event-bg-color:' + ring + '!important',
      '--fc-event-border-color:' + ring + '!important',
      '--fc-highlight-color:hsla(' + h + ',' + clamp100(s * 1.12) + '%,' + clamp100(mixUp(l0, .29)) + '%,.25)!important',
      '--wa-bubble-in:#26242B!important',
      '--wa-bubble-in-foreground:oklch(93% .005 0)!important',
      '--wa-system:#211B1C!important',
      '--wa-system-foreground:oklch(78% .01 30)!important',
      '--channel-site:hsl(' + infoH + ' ' + clamp100(s * 1.14) + '% ' + clamp100(mixUp(l0, .348)) + '%)!important',
      '--node-info:hsl(' + infoH + ' ' + clamp100(s * 1.14) + '% ' + clamp100(mixUp(l0, .348)) + '%)!important'
    ];
    var switchBg = 'hsla(' + h + ',' + clamp100(s * 1.08) + '%,' + clamp100(mixDn(l0, .677)) + '%,.55)';
    return SEL_PALETA + '{' + regras.join(';') + ';}' +
      '[style*="background-color: rgb(5, 150, 205)"][style*="background-color: rgb(5, 150, 205)"],' +
      '[style*="background-color:rgb(5, 150, 205)"][style*="background-color:rgb(5, 150, 205)"]{background-color:' + ring + '!important}' +
      '[style*="color: rgb(5, 150, 205)"][style*="color: rgb(5, 150, 205)"],' +
      '[style*="color:rgb(5, 150, 205)"][style*="color:rgb(5, 150, 205)"]{color:' + ring + '!important}' +
      ':focus-visible{outline-color:' + ring + '!important}' +
      '[role="switch"][data-state="checked"]{background-color:' + switchBg + '!important}' +
      '[role="switch"][data-state="checked"] span{background-color:#FFFFFF!important}' +
      '[role="switch"] [style*="rgb(5, 150, 205)"]{color:' + ring + '!important}';
  }

  function aplicarCor(hex, salvar) {
    var hsl = hexToHsl(hex);
    var l0 = clamp100(hsl.l + brilhoSalvo());
    estiloTema.textContent = CSS_BASE + buildCss(hsl.h, hsl.s, l0) + avancCss();
    avancAplicar();
    if (salvar !== false) {
      try { localStorage.setItem(COR_KEY, hex); } catch (e) {}
    }
  }

  function corSalva() {
    try { return localStorage.getItem(COR_KEY) || COR_PADRAO; } catch (e) { return COR_PADRAO; }
  }

  function brilhoSalvo() {
    try {
      var v = parseFloat(localStorage.getItem(BRILHO_KEY));
      if (isNaN(v)) return 0;
      return Math.max(BRILHO_MIN, Math.min(BRILHO_MAX, v));
    } catch (e) { return 0; }
  }

  function textoBrilho(v) {
    v = Math.round(v);
    return (v > 0 ? '+' : '') + v;
  }

  function garantirEstilo() {
    var head = document.head;
    if (!head) return;
    if (estiloTema.parentNode !== head || estiloTema.nextElementSibling) {
      head.appendChild(estiloTema);
    }
    if (estiloPainel.parentNode !== head) head.appendChild(estiloPainel);
  }

  var painel = null;

  function getThemeToggle() {
    return document.querySelector('button[aria-label="Toggle theme"]');
  }

  function criarLapis() {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-walytech-rgb', '1');
    b.setAttribute('aria-label', 'Editar cores do tema');
    b.setAttribute('title', 'Editar cores do tema');
    b.className = 'inline-flex h-9 w-9 items-center justify-center rounded-full text-inherit hover:bg-white/15 transition-colors cursor-pointer';
    b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      alternarPainel(b);
    });
    return b;
  }

  function criarBotaoTimer() {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-walytech', '1');
    b.setAttribute('data-walytech-timer', '1');
    b.setAttribute('aria-label', 'Atualização automática');
    b.setAttribute('title', 'Atualização automática');
    b.className = 'inline-flex h-9 w-9 items-center justify-center rounded-full text-inherit hover:bg-white/15 transition-colors cursor-pointer';
    b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      alternarPainelTimer(b);
    });
    return b;
  }

  function injetarLapis() {
    var toggle = getThemeToggle();
    if (!toggle) return;
    var pai = toggle.parentNode;
    var ref = toggle;
    var removidos = pai.querySelectorAll('[data-walytech-brilho],[data-walytech-teclas],[data-walytech-img],[data-walytech-avancado]');
    for (var rm = 0; rm < removidos.length; rm++) if (removidos[rm].parentNode) removidos[rm].parentNode.removeChild(removidos[rm]);
    var lapis = pai.querySelector('[data-walytech-rgb]');
    if (!lapis) {
      lapis = criarLapis();
      pai.insertBefore(lapis, ref.nextSibling);
    }
    ref = lapis;
    var timerBtn = pai.querySelector('[data-walytech-timer]');
    if (!timerBtn) {
      timerBtn = criarBotaoTimer();
      pai.insertBefore(timerBtn, ref.nextSibling);
    }
  }

  var notaCache = null;
  var notaCacheHora = 0;
  var notaBuscando = false;
  var notaUltimaTentativa = 0;

  function lerNgToken() {
    try {
      var raw = localStorage.getItem('ngStorage-token');
      if (!raw) return null;
      var t = raw;
      for (var i = 0; i < 3 && typeof t === 'string'; i++) {
        var s = t.trim();
        if (!s.startsWith('"') && !s.startsWith('{')) { t = s; break; }
        try { t = JSON.parse(s); } catch (e) { t = s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s; break; }
      }
      if (t && typeof t === 'object') t = t.token;
      if (typeof t !== 'string') return null;
      var n = t.replace(/^Bearer\s+/i, '').trim();
      return n && n !== 'undefined' && n !== 'null' ? n : null;
    } catch (e) { return null; }
  }

  function lerTenantId() {
    try {
      var chave = 'ngStorage-gm';
      var raw = localStorage.getItem(chave) || localStorage.getItem('gm');
      if (!raw) return null;
      var t = raw;
      for (var i = 0; i < 3 && typeof t === 'string'; i++) {
        try { t = JSON.parse(t); } catch (e) { break; }
      }
      if (typeof t === 'string') { try { t = JSON.parse(t); } catch (e) {} }
      var arr = Array.isArray(t.clientes) ? t.clientes : (Array.isArray(t.licli) ? t.licli : null);
      if (!arr || !arr.length) return null;
      var sel = t.clienteSelecionado != null ? t.clienteSelecionado : (t.cucli != null ? t.cucli : arr[0]);
      return sel != null && (sel.id != null || sel.clienteId != null) ? String(sel.id != null ? sel.id : sel.clienteId) : null;
    } catch (e) { return null; }
  }

  function buscarNota() {
    if (notaBuscando) return;
    var tok = lerNgToken();
    if (!tok) return;
    notaBuscando = true;
    notaUltimaTentativa = Date.now();
    var h = {
      'Authorization': 'Bearer ' + tok,
      'Domain': location.hostname || '',
      'Accept-Language': localStorage.getItem('lang') || 'pt-BR'
    };
    var tid = lerTenantId();
    if (tid) h['x-tenant-id'] = tid;
    try {
      fetch('/api/usuarios/chat/perfil', { headers: h, credentials: 'include' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          var d = j && (j.data || j);
          var v = d ? d.avaliacaoAtendimento : null;
          notaCache = (v === null || v === undefined || v === '') ? null : Number(v);
          notaCacheHora = Date.now();
          notaBuscando = false;
          console.log('[walytech] nota media carregada:', notaCache === null ? 'null/vazia' : notaCache.toFixed(1));
          console.log('[walytech] payload do /usuarios/chat/perfil:', JSON.stringify(j).slice(0, 800));
          injetarNota();
        })
        .catch(function (s) {
          notaBuscando = false;
          console.log('[walytech] falha ao buscar nota (http ' + s + ')');
        });
    } catch (e) {
      notaBuscando = false;
      console.log('[walytech] erro ao buscar nota:', e.message);
    }
  }

  function injetarNota() {
    var toggle = getThemeToggle();
    if (!toggle || !toggle.parentNode) return;
    var pai = toggle.parentNode;
    var nota = notaCache;
    var existe = pai.querySelector('[data-walytech-nota]');
    if (nota === null || isNaN(nota)) {
      if (existe && existe.parentNode) existe.parentNode.removeChild(existe);
      return;
    }
    var alvo = null;
    var bs = pai.querySelectorAll('button[aria-haspopup="menu"]');
    if (bs.length) alvo = bs[bs.length - 1];
    if (alvo && alvo.parentNode === pai && existe && existe.previousElementSibling !== alvo) {
      existe.parentNode.removeChild(existe);
      existe = null;
    }
    if (!existe) {
      var el = document.createElement('span');
      el.setAttribute('data-walytech-nota', '1');
      el.style.cssText = 'display:inline-flex;align-items:center;gap:4px;margin-left:2px;padding:2px 8px;border-radius:9999px;background:rgba(255,255,255,.14);color:#FFF;font-size:12px;font-weight:600;line-height:1;white-space:nowrap;';
      el.innerHTML = '<span style="color:#FBBF24;line-height:1">★</span><span>' + nota.toFixed(1).replace('.', ',') + '</span>';
      el.title = 'Avaliação média: ' + nota.toFixed(1);
      if (alvo && alvo.parentNode === pai && alvo.nextSibling) pai.insertBefore(el, alvo.nextSibling);
      else pai.appendChild(el);
    }
  }

  function loopNota() {
    try {
      injetarNota();
      if (notaCache === null && notaUltimaTentativa && Date.now() - notaUltimaTentativa < 5 * 60 * 1000) return;
      var velha = Date.now() - notaCacheHora > 5 * 60 * 1000;
      if ((notaCache === null || velha) && !notaBuscando) buscarNota();
    } catch (e) {}
  }

  var AVANC_KEY = 'walytechAvancado';
  var SEL_AVANC = ':root:root, .light.light, .dark.dark, [data-theme="light"][data-theme="light"], [data-theme="dark"][data-theme="dark"]';
  var AVANC_PARTS = [
    { nome: 'Cor principal', var: '--primary' },
    { nome: 'Texto da cor principal', var: '--primary-foreground' },
    { nome: 'Cor secundária', var: '--secondary' },
    { nome: 'Fundo suave', var: '--muted' },
    { nome: 'Texto suave', var: '--muted-foreground' },
    { nome: 'Destaque (hover)', var: '--accent' },
    { nome: 'Texto de destaque', var: '--accent-foreground' },
    { nome: 'Fundo da página', var: '--background' },
    { nome: 'Texto da página', var: '--foreground' },
    { nome: 'Fundo dos cards', var: '--card' },
    { nome: 'Cor de borda', var: '--border' },
    { nome: 'Erro / destrutivo', var: '--destructive' }
  ];
  var abaAtiva = 'cor';

  function avancSalvo() {
    try {
      var o = JSON.parse(localStorage.getItem(AVANC_KEY) || '{}');
      if (!o || typeof o !== 'object') return {};
      var limpo = {};
      for (var i = 0; i < AVANC_PARTS.length; i++) {
        if (o[AVANC_PARTS[i].var]) limpo[AVANC_PARTS[i].var] = o[AVANC_PARTS[i].var];
      }
      return limpo;
    } catch (e) { return {}; }
  }

  function avancAplicar() {
    var r = document.documentElement.style;
    var o = avancSalvo();
    for (var i = 0; i < AVANC_PARTS.length; i++) {
      try { r.removeProperty(AVANC_PARTS[i].var); } catch (e) {}
    }
    for (var k in o) {
      if (o[k]) {
        try { r.setProperty(k, o[k], 'important'); } catch (e) {}
      }
    }
  }

  function avancCss() {
    var o = avancSalvo();
    var r = [];
    for (var k in o) if (o[k]) r.push(k + ':' + o[k] + '!important');
    if (!r.length) return '';
    return SEL_AVANC + '{' + r.join(';') + ';}';
  }

  function avancReassert() {
    var o = avancSalvo();
    var r = document.documentElement.style;
    for (var k in o) {
      if (!o[k]) continue;
      try {
        if (r.getPropertyPriority(k) !== 'important') r.setProperty(k, o[k], 'important');
      } catch (e) {}
    }
  }

  function modoApp() {
    var tb = getThemeToggle();
    if (tb) {
      var st = tb.getAttribute('data-state');
      if (st === 'checked') return 'dark';
      if (st === 'unchecked') return 'light';
    }
    var r = document.documentElement;
    if (r.classList.contains('dark')) return 'dark';
    if (r.classList.contains('light')) return 'light';
    var th = r.getAttribute('data-theme') || '';
    if (th === 'dark') return 'dark';
    return 'light';
  }

  function definirModo(modo, t) {
    t = t || 0;
    if (t >= 5) { atualizarHub(); return; }
    if (modoApp() === modo) { atualizarHub(); return; }
    var tb = getThemeToggle();
    if (!tb) { atualizarHub(); return; }
    try { tb.click(); } catch (e) {}
    setTimeout(function () { definirModo(modo, t + 1); }, 150);
  }

  function criarPainel() {
    painel = document.createElement('div');
    painel.id = 'walytech-rgb-panel';
    var bolas = CORES.map(function (p) {
      return '<button type="button" class="waly-rgb-bola" data-cor="' + p.cor + '" title="' + p.nome + '" style="background:' + p.cor + '"></button>';
    }).join('');
    var avancRows = '';
    var avGroup = null;
    for (var avi = 0; avi < AVANC_PARTS.length; avi++) {
      var ap = AVANC_PARTS[avi];
      if (ap.grupo && ap.grupo !== avGroup) {
        avGroup = ap.grupo;
        avancRows += '<div class="waly-av-grupo">' + ap.grupo + '</div>';
      }
      avancRows += '<div class="waly-av-linha" data-var="' + ap.var + '">' +
        '<span class="waly-av-rot">' + ap.nome + '</span>' +
        '<input type="color" class="waly-av-input" data-avcor="' + ap.var + '" value="' + (avancSalvo()[ap.var] || '#8b8b8b') + '">' +
        '<button type="button" class="waly-av-x" data-avx="' + ap.var + '" title="Restaurar padrão">&#10005;</button></div>';
    }
    painel.innerHTML =
      '<div class="waly-rgb-topo"><span>Personalizar</span><button type="button" class="waly-rgb-x" aria-label="Fechar">&#10005;</button></div>' +
      '<div class="waly-rgb-abas">' +
      '<button type="button" class="waly-rgb-aba waly-aba-ativa" data-walyaba="cor">Cor</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="modo">Modo</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="luz">Luz</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="fundo">Fundo</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="ata">Atalhos</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="avanc">Avançado</button>' +
      '</div>' +
      '<section class="waly-aba-section waly-vis" data-walysec="cor">' +
      '<div class="waly-tema-etq">Cor do tema</div>' +
      '<div class="waly-rgb-bolas">' + bolas + '</div>' +
      '<label class="waly-rgb-linha">Personalizar<input type="color" class="waly-rgb-input" value="' + corSalva() + '"></label>' +
      '<label class="waly-rgb-linha">Saturação <span class="waly-rgb-bval">' + textoBrilho(brilhoSalvo()) + '</span></label>' +
      '<input type="range" class="waly-rgb-range" min="' + BRILHO_MIN + '" max="' + BRILHO_MAX + '" step="1" value="' + brilhoSalvo() + '">' +
      '<button type="button" class="waly-rgb-reset">Restaurar cor padrão</button>' +
      '</section>' +
      '<section class="waly-aba-section" data-walysec="modo">' +
      '<div class="waly-tema-etq">Modo claro / escuro</div>' +
      '<div class="waly-tema-botoes">' +
      '<button type="button" class="waly-tema-botao" data-modo="light">Claro</button>' +
      '<button type="button" class="waly-tema-botao" data-modo="dark">Escuro</button>' +
      '</div>' +
      '<div class="waly-brilho-desc">Alterna o tema do app usando o botão nativo.</div>' +
      '</section>' +
      '<section class="waly-aba-section" data-walysec="luz">' +
      '<div class="waly-tema-etq">Luminosidade da página</div>' +
      '<div class="waly-brilho-desc">Negativo escurece, positivo clareia.</div>' +
      '<label class="waly-rgb-linha">Brilho <span class="waly-rgb-bval" id="waly-hub-luz-val"></span></label>' +
      '<input type="range" class="waly-rgb-range" id="waly-hub-luz-range" min="' + LUMI_MIN + '" max="' + LUMI_MAX + '" step="1">' +
      '<button type="button" class="waly-rgb-reset" id="waly-hub-luz-reset">Restaurar normal</button>' +
      '</section>' +
      '<section class="waly-aba-section" data-walysec="fundo">' +
      '<div class="waly-tema-etq">Plano de fundo</div>' +
      '<div class="waly-bg-prevw"><img id="waly-hub-bg-prev" alt="Prévia"></div>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-hub-bg-on"> Mostrar imagem de fundo</label>' +
      '<label class="waly-rgb-linha">Intensidade <span class="waly-rgb-bval" id="waly-hub-bg-val"></span></label>' +
      '<input type="range" class="waly-rgb-range" id="waly-hub-bg-range" min="' + BGBRILHO_MIN + '" max="' + BGBRILHO_MAX + '" step="1">' +
      '<div class="waly-bg-acoes">' +
      '<button type="button" class="waly-rgb-reset" id="waly-hub-bg-trocar">Importar imagem</button>' +
      '<button type="button" class="waly-rgb-reset waly-bg-remover" id="waly-hub-bg-remover">Remover</button>' +
      '</div>' +
      '</section>' +
      '<section class="waly-aba-section" data-walysec="ata">' +
      '<div class="waly-tema-etq">Atalhos de teclado</div>' +
      '<div class="waly-teclas-desc">Clique em um atalho e pressione a nova combinação.</div>' +
      '<div id="waly-teclas-lista"></div>' +
      '<button type="button" class="waly-rgb-reset" id="waly-teclas-reset">Restaurar padrões</button>' +
      '</section>' +
      '<section class="waly-aba-section" data-walysec="avanc">' +
      '<div class="waly-tema-etq">Configurações avançadas</div>' +
      '<div class="waly-av-anota">Ajuste cada parte do tema separadamente (balões de mensagem, destaques, fundos).</div>' +
      '<div class="waly-av-lista">' + avancRows + '</div>' +
      '<button type="button" class="waly-rgb-reset" id="waly-av-reset">Restaurar padrão (todas)</button>' +
      '</section>';
    document.body.appendChild(painel);

    painel.querySelector('.waly-rgb-x').addEventListener('click', fecharPainel);

    var abasEls = painel.querySelectorAll('.waly-rgb-aba');
    for (var ai = 0; ai < abasEls.length; ai++) {
      abasEls[ai].addEventListener('click', function () {
        mostrarAba(this.getAttribute('data-walyaba'));
      });
    }

    var inp = painel.querySelector('.waly-rgb-input');
    inp.addEventListener('input', function () {
      aplicarCor(this.value, true);
      atualizarSelecao();
    });
    painel.querySelector('.waly-rgb-range').addEventListener('input', function () {
      try { localStorage.setItem(BRILHO_KEY, this.value); } catch (e) {}
      painel.querySelector('.waly-rgb-bval').textContent = textoBrilho(parseFloat(this.value));
      aplicarCor(painel.querySelector('.waly-rgb-input').value, false);
    });
    painel.querySelector('.waly-rgb-reset').addEventListener('click', function () {
      aplicarCor(COR_PADRAO, true);
      try { localStorage.setItem(BRILHO_KEY, '0'); } catch (e) {}
      painel.querySelector('.waly-rgb-input').value = COR_PADRAO;
      painel.querySelector('.waly-rgb-range').value = 0;
      painel.querySelector('.waly-rgb-bval').textContent = textoBrilho(0);
      atualizarSelecao();
    });
    var bolasEls = painel.querySelectorAll('.waly-rgb-bola');
    for (var i = 0; i < bolasEls.length; i++) {
      bolasEls[i].addEventListener('click', function () {
        var cor = this.getAttribute('data-cor');
        aplicarCor(cor, true);
        painel.querySelector('.waly-rgb-input').value = cor;
        atualizarSelecao();
      });
    }

    var modoBtns = painel.querySelectorAll('.waly-tema-botao[data-modo]');
    for (var mi = 0; mi < modoBtns.length; mi++) {
      modoBtns[mi].addEventListener('click', function () {
        definirModo(this.getAttribute('data-modo'));
      });
    }

    var luzR = painel.querySelector('#waly-hub-luz-range');
    luzR.addEventListener('input', function () {
      try { localStorage.setItem(LUMI_KEY, this.value); } catch (e) {}
      atualizarHub();
      brilhoAplicar();
    });
    painel.querySelector('#waly-hub-luz-reset').addEventListener('click', function () {
      try { localStorage.setItem(LUMI_KEY, '0'); } catch (e) {}
      atualizarHub();
      brilhoAplicar();
    });

    painel.querySelector('#waly-hub-bg-on').addEventListener('change', function () {
      try { localStorage.setItem(BG_ON_KEY, this.checked ? '1' : '0'); } catch (e) {}
      bgAtualizar();
    });
    var bgR = painel.querySelector('#waly-hub-bg-range');
    bgR.addEventListener('input', function () {
      try { localStorage.setItem(BGBRILHO_KEY, this.value); } catch (e) {}
      atualizarHub();
      bgAtualizar();
    });
    painel.querySelector('#waly-hub-bg-trocar').addEventListener('click', function () { escolherImagem(); });
    painel.querySelector('#waly-hub-bg-remover').addEventListener('click', function () {
      try { localStorage.removeItem(BG_KEY); } catch (e) {}
      bgAtualizar();
      atualizarHub();
    });

    painel.querySelector('#waly-teclas-reset').addEventListener('click', function () {
      try { localStorage.removeItem(TECLAS_KEY); } catch (e) {}
      atualizarPainelTeclas();
      mostrarToast('Atalhos restaurados');
    });

    var avInps = painel.querySelectorAll('.waly-av-input');
    for (var vi = 0; vi < avInps.length; vi++) {
      avInps[vi].addEventListener('input', function () {
        var vn = this.getAttribute('data-avcor');
        var o = avancSalvo();
        o[vn] = this.value;
        try { localStorage.setItem(AVANC_KEY, JSON.stringify(o)); } catch (e) {}
        aplicarCor(corSalva(), false);
      });
    }
    var avXs = painel.querySelectorAll('.waly-av-x');
    for (var xi2 = 0; xi2 < avXs.length; xi2++) {
      avXs[xi2].addEventListener('click', function () {
        var vn = this.getAttribute('data-avx');
        var o = avancSalvo();
        delete o[vn];
        try { localStorage.setItem(AVANC_KEY, JSON.stringify(o)); } catch (e) {}
        var inp2 = painel.querySelector('.waly-av-input[data-avcor="' + vn + '"]');
        if (inp2) inp2.value = '#8b8b8b';
        aplicarCor(corSalva(), false);
      });
    }
    painel.querySelector('#waly-av-reset').addEventListener('click', function () {
      try { localStorage.removeItem(AVANC_KEY); } catch (e) {}
      var aii = painel.querySelectorAll('.waly-av-input');
      for (var r2 = 0; r2 < aii.length; r2++) aii[r2].value = '#8b8b8b';
      aplicarCor(corSalva(), false);
      mostrarToast('Tema avançado restaurado');
    });

    atualizarPainelTeclas();
  }

  function mostrarAba(nome) {
    abaAtiva = nome;
    if (!painel) return;
    var abas = painel.querySelectorAll('.waly-rgb-aba');
    for (var ai2 = 0; ai2 < abas.length; ai2++) abas[ai2].classList.toggle('waly-aba-ativa', abas[ai2].getAttribute('data-walyaba') === nome);
    var secs = painel.querySelectorAll('.waly-aba-section');
    for (var si = 0; si < secs.length; si++) secs[si].classList.toggle('waly-vis', secs[si].getAttribute('data-walysec') === nome);
    atualizarHub();
  }

  function atualizarHub() {
    if (!painel || !painel.classList.contains('waly-aberto')) return;
    atualizarSelecao();
    var lv = brilhoValor();
    var lr = painel.querySelector('#waly-hub-luz-range');
    if (lr) {
      lr.value = lv;
      painel.querySelector('#waly-hub-luz-val').textContent = (lv > 0 ? '+' : '') + lv;
    }
    var img = bgImg();
    var prev = painel.querySelector('#waly-hub-bg-prev');
    if (prev) {
      prev.parentNode.style.display = img ? 'block' : 'none';
      if (img) prev.src = img;
      var b = bgBrilho();
      painel.querySelector('#waly-hub-bg-range').value = b;
      painel.querySelector('#waly-hub-bg-val').textContent = (b > 0 ? '+' : '') + b;
      painel.querySelector('#waly-hub-bg-on').checked = bgLigado();
      painel.querySelector('#waly-hub-bg-remover').style.display = img ? '' : 'none';
      painel.querySelector('#waly-hub-bg-trocar').textContent = img ? 'Trocar imagem' : 'Importar imagem';
    }
    var modo = modoApp();
    var mbs = painel.querySelectorAll('.waly-tema-botao[data-modo]');
    for (var mi2 = 0; mi2 < mbs.length; mi2++) mbs[mi2].classList.toggle('waly-sel', mbs[mi2].getAttribute('data-modo') === modo);
    atualizarPainelTeclas();
  }

  function atualizarSelecao() {
    if (!painel) return;
    var atual = painel.querySelector('.waly-rgb-input').value.toLowerCase();
    var bolas = painel.querySelectorAll('.waly-rgb-bola');
    for (var i = 0; i < bolas.length; i++) {
      var cor = bolas[i].getAttribute('data-cor').toLowerCase();
      bolas[i].classList.toggle('waly-sel', cor === atual);
    }
  }

  function posicionarPainel(btn) {
    var r = btn.getBoundingClientRect();
    painel.style.top = (r.bottom + 8) + 'px';
    painel.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    painel.style.left = 'auto';
  }

  function alternarPainel(btn) {
    if (!painel) criarPainel();
    if (painel.classList.contains('waly-aberto')) {
      fecharPainel();
    } else {
      if (painelTimer) fecharPainelTimer();
      posicionarPainel(btn);
      painel.classList.add('waly-aberto');
      atualizarSelecao();
    }
  }

  function fecharPainel() {
    if (painel) painel.classList.remove('waly-aberto');
  }

  var bgFile = null;

  function bgImg() {
    try { return localStorage.getItem(BG_KEY) || ''; } catch (e) { return ''; }
  }

  function bgBrilho() {
    try {
      var v = parseFloat(localStorage.getItem(BGBRILHO_KEY));
      if (isNaN(v)) return 0;
      return Math.max(BGBRILHO_MIN, Math.min(BGBRILHO_MAX, v));
    } catch (e) { return 0; }
  }

  function bgLigado() {
    try { return localStorage.getItem(BG_ON_KEY) !== '0'; } catch (e) { return true; }
  }

  function chatAberto() {
    try {
      return !!document.querySelector('[id^="msg-"], [class*="bg-wa-chat-bg"], [class*="bg-wa-bubble"]');
    } catch (e) { return false; }
  }

  function chatAtualizar() {
    var raiz = document.documentElement;
    if (!raiz) return;
    if (chatAberto()) raiz.classList.add('waly-chat');
    else raiz.classList.remove('waly-chat');
  }

  function bgAtualizar() {
    var raiz = document.documentElement;
    if (!raiz) return;
    var img = bgImg();
    if (!img || !bgLigado() || chatAberto()) {
      raiz.classList.remove('waly-bg');
      return;
    }
    raiz.classList.add('waly-bg');
    raiz.style.setProperty('--waly-bg-img', 'url("' + img.replace(/"/g, '\\"') + '")');
    var b = bgBrilho();
    var alfa = Math.abs(b) / 100 * 0.6;
    raiz.style.setProperty('--waly-bg-shade', b >= 0 ? 'rgba(255,255,255,' + alfa.toFixed(3) + ')' : 'rgba(0,0,0,' + alfa.toFixed(3) + ')');
  }

  function processarImagem(file, cb) {
    var fr = new FileReader();
    fr.onerror = function () { cb(null); };
    fr.onload = function () {
      var img = new Image();
      img.onerror = function () { cb(null); };
      img.onload = function () {
        var maxDim = 1600;
        var esc = Math.max(img.width, img.height) > maxDim ? maxDim / Math.max(img.width, img.height) : 1;
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * esc));
        c.height = Math.max(1, Math.round(img.height * esc));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var url = file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85);
        cb(url);
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  function escolherImagem() {
    if (!bgFile) {
      bgFile = document.createElement('input');
      bgFile.id = 'waly-bg-file';
      bgFile.type = 'file';
      bgFile.accept = 'image/*';
      document.body.appendChild(bgFile);
      bgFile.addEventListener('change', function () {
        var f = (bgFile.files && bgFile.files[0]) || null;
        bgFile.value = '';
        if (!f) return;
        processarImagem(f, function (url) {
          if (!url) {
            alert('Não foi possível carregar a imagem.');
            return;
          }
          try {
            localStorage.setItem(BG_KEY, url);
            localStorage.setItem(BG_ON_KEY, '1');
          } catch (e) {
            alert('Imagem muito grande para salvar neste navegador. Escolha uma imagem menor.');
            return;
          }
          bgAtualizar();
          atualizarHub();
        });
      });
    }
    bgFile.click();
  }

  function loopFundo() {
    try {
      chatAtualizar();
      bgAtualizar();
    } catch (e) {}
  }

  var painelTimer = null;
  var timerId = null;
  var timerAtivo = false;
  var toastEl = null;
  var ultimaAtualizacao = '';

  function mostrarToast(msg, erro) {
    if (!toastEl || !toastEl.isConnected) {
      toastEl = document.createElement('div');
      toastEl.id = 'waly-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.className = erro ? 'waly-erro' : '';
    toastEl.textContent = msg;
    toastEl._at = Date.now();
    requestAnimationFrame(function () { toastEl.classList.add('waly-mostrar'); });
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () {
      if (toastEl) toastEl.classList.remove('waly-mostrar');
    }, 2400);
  }

  function fiscalizarToast() {
    if (!toastEl || !toastEl.isConnected) {
      toastEl = null;
      return;
    }
    if (toastEl.classList.contains('waly-mostrar') && toastEl._at && Date.now() - toastEl._at > 2500) {
      toastEl.classList.remove('waly-mostrar');
    }
  }

  var SK_VERSION = '2.5';
  var UPDATE_URL = 'https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js';

  function versaoMaior(a, b) {
    var pa = String(a).split('.').map(function (n) { return parseInt(n, 10) || 0; });
    var pb = String(b).split('.').map(function (n) { return parseInt(n, 10) || 0; });
    var m = Math.max(pa.length, pb.length);
    for (var i = 0; i < m; i++) {
      var x = pa[i] || 0;
      var y = pb[i] || 0;
      if (x > y) return true;
      if (x < y) return false;
    }
    return false;
  }

  function checarAtualizacao(forca) {
    try {
      var ultima = parseInt(localStorage.getItem('walytechUpdateCheck'), 10) || 0;
      if (!forca && Date.now() - ultima < 60 * 60 * 1000) return;
      fetch(UPDATE_URL + '?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function (txt) {
          localStorage.setItem('walytechUpdateCheck', String(Date.now()));
          var m = txt.match(/@version\s+([\d.]+)/);
          if (!m) return;
          if (versaoMaior(m[1], SK_VERSION)) {
            console.log('[walytech] nova versao disponivel:', m[1] + ' (atual ' + SK_VERSION + ')');
            mostrarToast('Nova versão ' + m[1] + ' disponível. Tampermonkey vai atualizar automaticamente.');
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  function baixarAtualizacao() {
    try {
      console.log('[walytech] procurando atualizacao...');
      fetch(UPDATE_URL + '?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function (txt) {
          var m = txt.match(/@version\s+([\d.]+)/);
          if (!m) {
            mostrarToast('Não foi possível ler a versão mais recente.', true);
            return;
          }
          if (!versaoMaior(m[1], SK_VERSION)) {
            mostrarToast('Você já está na versão mais recente (' + SK_VERSION + ').');
            return;
          }
          console.log('[walytech] aplicando atualizacao para', m[1]);
          mostrarToast('Baixando versão ' + m[1] + '...');
          localStorage.setItem('walytechUpdateCheck', String(Date.now()));
          setTimeout(function () {
            window.location.href = UPDATE_URL;
          }, 800);
        })
        .catch(function () {
          mostrarToast('Falha ao verificar atualizações.', true);
        });
    } catch (e) {
      mostrarToast('Erro ao verificar atualizações.', true);
    }
  }

  var STATUS_RESULT = null;
  var STATUS_BUSY = false;

  function tokenPayload() {
    try {
      var t = lerNgToken();
      if (!t) return null;
      var b = t.split('.')[1];
      if (!b) return null;
      var s = b.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      var raw = decodeURIComponent(escape(atob(s)));
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function testarApi() {
    return new Promise(function (resolve) {
      var tok = lerNgToken();
      if (!tok) { resolve({ ok: false, ms: 0, info: 'sem token' }); return; }
      var t0 = Date.now();
      var h = {
        'Authorization': 'Bearer ' + tok,
        'Domain': location.hostname || '',
        'Accept-Language': localStorage.getItem('lang') || 'pt-BR'
      };
      var tid = lerTenantId();
      if (tid) h['x-tenant-id'] = tid;
      fetch('/api/usuarios/chat/perfil', { headers: h, credentials: 'include' })
        .then(function (r) {
          resolve({ ok: r.ok, ms: Date.now() - t0, info: r.status === 401 || r.status === 403 ? 'sessão inválida (' + r.status + ')' : ('HTTP ' + r.status) });
        })
        .catch(function (e) {
          resolve({ ok: false, ms: Date.now() - t0, info: 'sem resposta' });
        });
    });
  }

  function testarSocket() {
    return new Promise(function (resolve) {
      try {
        var payload = tokenPayload();
        if (!payload || !payload.usuarioId) {
          resolve({ ok: false, ms: 0, info: 'token sem usuarioId' });
          return;
        }
        var par = payload.usuarioId % 2 === 0;
        var ehEspecial = payload.usuarioPerfil === 'GESTOR' || payload.usuarioPerfil === 'SUPERVISOR_CHATBOT';
        var host = (par || ehEspecial) ? 'notification-n002.mzworkspace.com' : 'notification-n001.mzworkspace.com';
        var t0 = Date.now();
        var ws = new WebSocket('wss://' + host + '/socket.io/?EIO=4&transport=websocket');
        var resolvido = false;
        var timer = setTimeout(function () {
          if (!resolvido) {
            resolvido = true;
            try { ws.close(); } catch (e) {}
            resolve({ ok: false, ms: Date.now() - t0, info: 'timeout' });
          }
        }, 12000);
        ws.onopen = function () {
          if (!resolvido) {
            resolvido = true;
            clearTimeout(timer);
            try { ws.close(); } catch (e) {}
            resolve({ ok: true, ms: Date.now() - t0, info: 'conectado ao canal de notificações' });
          }
        };
        ws.onerror = function (ev) {
          if (!resolvido) {
            resolvido = true;
            clearTimeout(timer);
            try { ws.close(); } catch (e) {}
            resolve({ ok: false, ms: Date.now() - t0, info: 'erro de conexão' });
          }
        };
      } catch (e) {
        resolve({ ok: false, ms: 0, info: e.message });
      }
    });
  }

  function verificarStatus() {
    if (STATUS_BUSY) return;
    STATUS_BUSY = true;
    mostrarToast('Verificando status...');
    Promise.all([testarApi(), testarSocket()]).then(function (r) {
      STATUS_BUSY = false;
      var api = r[0];
      var sock = r[1];
      var online = api.ok && sock.ok;
      var msgs = [
        'API: ' + (api.ok ? ('OK (' + api.ms + 'ms)') : ('FALHOU - ' + api.info)),
        'Socket: ' + (sock.ok ? ('OK (' + sock.ms + 'ms)') : ('FALHOU - ' + sock.info))
      ];
      STATUS_RESULT = { online: online, api: api, sock: sock, data: new Date() };
      console.log('[walytech] status:', online ? 'ONLINE' : 'PROBLEMA', msgs.join(' | '));
      mostrarToast((online ? 'Bot ONLINE' : 'Bot com problema') + '\n' + msgs.join('\n'), !online);
      pintarStatus(online);
    });
  }

  function pintarStatus(online) {
    try {
      var a = document.querySelector('[data-walytech-status]');
      if (!a) return;
      a.style.color = online === null ? '' : (online ? '#22c55e' : '#ef4444');
      var titulo = STATUS_RESULT ? ('API: ' + (STATUS_RESULT.api.ok ? 'OK ' + STATUS_RESULT.api.ms + 'ms' : STATUS_RESULT.api.info) + ' | Socket: ' + (STATUS_RESULT.sock.ok ? 'OK ' + STATUS_RESULT.sock.ms + 'ms' : STATUS_RESULT.sock.info)) : 'Verificar status';
      a.setAttribute('title', titulo);
    } catch (e) {}
  }

  function timerMin() {
    try {
      var v = parseInt(localStorage.getItem(TIMER_KEY), 10);
      if (isNaN(v)) return 15;
      return Math.max(1, Math.min(60, v));
    } catch (e) { return 15; }
  }

  function timerLigado() {
    try { return localStorage.getItem(TIMER_ON_KEY) === '1'; } catch (e) { return false; }
  }

  function acharBotaoAtualizar() {
    try {
      var botoes = document.querySelectorAll('button');
      for (var i = 0; i < botoes.length; i++) {
        var b = botoes[i];
        if (b.hasAttribute('data-walytech')) continue;
        if (b.disabled) continue;
        var st = getComputedStyle(b);
        if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') continue;
        var rot = (b.getAttribute('aria-label') || b.getAttribute('title') || '');
        if (/atualiz/i.test(rot)) return b;
        var txt = (b.textContent || '').trim();
        if (/atualiz/i.test(txt) && txt.length < 40) return b;
      }
    } catch (e) {}
    return null;
  }

  function clicarAtualizar(avisar) {
    var b = acharBotaoAtualizar();
    if (!b) {
      if (avisar) mostrarToast('Botão "Atualizar" não encontrado nesta tela.', true);
      return false;
    }
    try {
      b.click();
      var agora = new Date();
      var hh = ('0' + agora.getHours()).slice(-2);
      var mm = ('0' + agora.getMinutes()).slice(-2);
      var ss = ('0' + agora.getSeconds()).slice(-2);
      ultimaAtualizacao = hh + ':' + mm + ':' + ss;
      if (avisar) mostrarToast('Atualizado às ' + ultimaAtualizacao);
      return true;
    } catch (e) {
      if (avisar) mostrarToast('Falha ao clicar em "Atualizar".', true);
      return false;
    }
  }

  function agendarTimer(min) {
    if (timerId) clearInterval(timerId);
    min = Math.max(1, min);
    timerAtivo = true;
    timerId = setInterval(function () {
      clicarAtualizar(true);
      if (painelTimer) atualizarPainelTimer();
    }, min * 60000);
    atualizarIndicadorTimer();
    if (painelTimer) atualizarPainelTimer();
  }

  function iniciarTimer(min) {
    try {
      localStorage.setItem(TIMER_KEY, String(min));
      localStorage.setItem(TIMER_ON_KEY, '1');
    } catch (e) {}
    agendarTimer(min);
    clicarAtualizar(true);
  }

  function pararTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
    timerAtivo = false;
    try { localStorage.setItem(TIMER_ON_KEY, '0'); } catch (e) {}
    atualizarIndicadorTimer();
    if (painelTimer) atualizarPainelTimer();
  }

  function atualizarIndicadorTimer() {
    var b = document.querySelector('[data-walytech-timer]');
    if (!b) return;
    b.classList.toggle('waly-ativo', timerAtivo);
    b.setAttribute('title', timerAtivo ? ('Atualização automática ligada (a cada ' + timerMin() + ' min)') : 'Atualização automática');
  }

  function criarPainelTimer() {
    painelTimer = document.createElement('div');
    painelTimer.id = 'walytech-timer-panel';
    var chips = TIMER_OPCOES.map(function (m) {
      return '<button type="button" class="waly-timer-chip" data-min="' + m + '">' + m + ' min</button>';
    }).join('');
    painelTimer.innerHTML =
      '<div class="waly-rgb-topo"><span>Atualização automática</span><button type="button" class="waly-rgb-x" aria-label="Fechar">&#10005;</button></div>' +
      '<div class="waly-timer-desc">Clicar em "Atualizar" a cada:</div>' +
      '<div class="waly-timer-grid">' + chips + '</div>' +
      '<div class="waly-timer-status"><span id="waly-timer-status">Desligado</span></div>' +
      '<button type="button" class="waly-timer-st" id="waly-timer-toggle">Ativar</button>' +
      '<button type="button" class="waly-timer-agora" id="waly-timer-agora">Clicar agora em "Atualizar"</button>' +
      '<div class="waly-timer-last" id="waly-timer-last"></div>';
    document.body.appendChild(painelTimer);

    painelTimer.querySelector('.waly-rgb-x').addEventListener('click', fecharPainelTimer);
    var chipsEls = painelTimer.querySelectorAll('.waly-timer-chip');
    for (var i = 0; i < chipsEls.length; i++) {
      chipsEls[i].addEventListener('click', function () {
        var min = parseInt(this.getAttribute('data-min'), 10);
        if (timerAtivo) iniciarTimer(min);
        else {
          try { localStorage.setItem(TIMER_KEY, String(min)); } catch (e) {}
          atualizarPainelTimer();
        }
      });
    }
    painelTimer.querySelector('#waly-timer-toggle').addEventListener('click', function () {
      if (timerAtivo) pararTimer();
      else iniciarTimer(timerMin());
    });
    painelTimer.querySelector('#waly-timer-agora').addEventListener('click', function () {
      clicarAtualizar(true);
      atualizarPainelTimer();
    });
  }

  function atualizarPainelTimer() {
    if (!painelTimer) return;
    var min = timerMin();
    var chips = painelTimer.querySelectorAll('.waly-timer-chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('waly-sel', parseInt(chips[i].getAttribute('data-min'), 10) === min);
    }
    var st = painelTimer.querySelector('#waly-timer-status');
    st.textContent = timerAtivo ? 'Ligado (a cada ' + min + ' min)' : 'Desligado';
    var tog = painelTimer.querySelector('#waly-timer-toggle');
    tog.textContent = timerAtivo ? 'Parar' : 'Ativar';
    tog.classList.toggle('waly-parar', timerAtivo);
    painelTimer.querySelector('#waly-timer-last').textContent = ultimaAtualizacao ? ('Última atualização às ' + ultimaAtualizacao) : 'Nenhuma atualização ainda';
  }

  function posicionarPainelTimer(btn) {
    var r = btn.getBoundingClientRect();
    painelTimer.style.top = (r.bottom + 8) + 'px';
    painelTimer.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
    painelTimer.style.left = 'auto';
  }

  function abrirPainelTimer() {
    if (!painelTimer) criarPainelTimer();
    if (painel) fecharPainel();
    posicionarPainelTimer(document.querySelector('[data-walytech-timer]'));
    painelTimer.classList.add('waly-aberto');
    atualizarPainelTimer();
  }

  function fecharPainelTimer() {
    if (painelTimer) painelTimer.classList.remove('waly-aberto');
  }

  function alternarPainelTimer(btn) {
    if (painelTimer && painelTimer.classList.contains('waly-aberto')) {
      fecharPainelTimer();
      return;
    }
    abrirPainelTimer();
  }

  function loopTimer() {
    try {
      injectarTimerBtnTitulo();
      if (timerLigado() && !timerAtivo) agendarTimer(timerMin());
      atualizarIndicadorTimer();
    } catch (e) {}
  }

  function injectarTimerBtnTitulo() {
    var b = document.querySelector('[data-walytech-timer]');
    if (b && timerAtivo) {
      b.setAttribute('title', 'Atualização automática ligada (a cada ' + timerMin() + ' min)');
    }
  }

  var overlayBrilho = null;

  function brilhoValor() {
    try {
      var v = parseInt(localStorage.getItem(LUMI_KEY), 10);
      if (isNaN(v)) return 0;
      return Math.max(LUMI_MIN, Math.min(LUMI_MAX, v));
    } catch (e) { return 0; }
  }

  function brilhoAplicar() {
    if (!overlayBrilho) {
      overlayBrilho = document.createElement('div');
      overlayBrilho.id = 'walytech-brilho-overlay';
      document.body.appendChild(overlayBrilho);
    }
    var v = brilhoValor();
    if (v === 0) {
      overlayBrilho.style.display = 'none';
      return;
    }
    overlayBrilho.style.display = 'block';
    var f = Math.abs(v) / 100 * 0.5;
    if (v < 0) {
      overlayBrilho.style.mixBlendMode = 'multiply';
      overlayBrilho.style.background = '#000';
    } else {
      overlayBrilho.style.mixBlendMode = 'screen';
      overlayBrilho.style.background = '#fff';
    }
    overlayBrilho.style.opacity = f.toFixed(3);
  }

  function loopBrilho() {
    try {
      injetarLapis();
      brilhoAplicar();
    } catch (e) {}
  }

  var TECLAS_KEY = 'walytechAtalhos';
  var ATALHOS_DISPONIVEIS = [
    { id: 'finalizar', rot: 'Finalizar atendimento', padrao: 'ctrl+shift+f', tipo: 'nativo', alvo: 'Finalizar' },
    { id: 'transferir', rot: 'Transferir', padrao: 'ctrl+shift+t', tipo: 'nativo', alvo: 'Transferir' },
    { id: 'fechar', rot: 'Fechar conversa', padrao: 'ctrl+shift+x', tipo: 'nativo', alvo: 'Fechar conversa' },
    { id: 'naolidi', rot: 'Marcar como Não Lido', padrao: 'ctrl+shift+u', tipo: 'menu', alvo: 'Marcar como Não Lido' },
    { id: 'pesquisar', rot: 'Pesquisar na conversa', padrao: 'ctrl+shift+p', tipo: 'nativo2', alvo: 'pesquisar' },
    { id: 'tags', rot: 'Adicionar Tag', padrao: 'ctrl+shift+g', tipo: 'nativo2', alvo: 'tags' },
    { id: 'soltar', rot: 'Soltar chat', padrao: 'ctrl+shift+o', tipo: 'nativo2', alvo: 'soltar' },
    { id: 'detalhes', rot: 'Detalhes do contato', padrao: 'ctrl+shift+i', tipo: 'nativo2', alvo: 'detalhes' },
    { id: 'atualizar', rot: 'Atualizar tickets', padrao: 'ctrl+alt+a', tipo: 'atualizar' }
  ];

  function atalhosSalvos() {
    try {
      var o = JSON.parse(localStorage.getItem(TECLAS_KEY) || '{}');
      return o && typeof o === 'object' ? o : {};
    } catch (e) { return {}; }
  }

  function atalhoDe(id) {
    var s = atalhosSalvos();
    if (s[id]) return s[id];
    for (var ai = 0; ai < ATALHOS_DISPONIVEIS.length; ai++) if (ATALHOS_DISPONIVEIS[ai].id === id) return ATALHOS_DISPONIVEIS[ai].padrao;
    return null;
  }

  function salvarAtalho(id, combo) {
    try {
      var s = atalhosSalvos();
      s[id] = combo;
      localStorage.setItem(TECLAS_KEY, JSON.stringify(s));
    } catch (e) {}
  }

  function rotuloAtalho(id) {
    for (var ri = 0; ri < ATALHOS_DISPONIVEIS.length; ri++) if (ATALHOS_DISPONIVEIS[ri].id === id) return ATALHOS_DISPONIVEIS[ri].rot;
    return id;
  }

  function comboDoEvento(ev) {
    var k = (ev.key || '').toLowerCase();
    if (k === 'control' || k === 'shift' || k === 'alt' || k === 'meta' || k === 'dead' || k === 'process') return null;
    if (ev.key === ' ') k = 'space';
    var mods = [];
    if (ev.ctrlKey) mods.push('ctrl');
    if (ev.altKey) mods.push('alt');
    if (ev.shiftKey) mods.push('shift');
    if (ev.metaKey) mods.push('meta');
    if (mods.length === 0) {
      if (!/^f\d{1,2}$/.test(k) || k === 'f0') return null;
    }
    return mods.join('+') + (mods.length ? '+' : '') + k;
  }

  function formatarCombo(c) {
    if (!c) return '';
    var labels = { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Meta', space: 'Espaço', up: '↑', down: '↓', left: '←', right: '→', enter: 'Enter', esc: 'Esc', tab: 'Tab', backspace: 'Backspace', delete: 'Delete', home: 'Home', end: 'End', pageup: 'PgUp', pagedown: 'PgDn', insert: 'Insert' };
    var parts = c.split('+');
    var out = [];
    for (var fi = 0; fi < parts.length; fi++) {
      var p = parts[fi];
      out.push(labels[p] || p.toUpperCase());
    }
    return out.join('+');
  }

  var gravandoTecla = null;

  function atualizarPainelTeclas() {
    var lista = painel ? painel.querySelector('#waly-teclas-lista') : null;
    if (!lista) return;
    var html = '';
    ATALHOS_DISPONIVEIS.forEach(function (item) {
      var tecla = atalhoDe(item.id);
      var estaGravando = gravandoTecla === item.id;
      html += '<div class="waly-teclas-linha"><span class="waly-teclas-rot">' + item.rot + '</span>' +
        '<button type="button" class="waly-teclas-tecla ' + (estaGravando ? 'waly-teclas-gravando' : '') + '" data-tecla="' + item.id + '">' +
        (estaGravando ? 'Pressione...' : formatarCombo(tecla)) + '</button></div>';
    });
    if (lista.innerHTML === html) return;
    lista.innerHTML = html;
    lista.querySelectorAll('.waly-teclas-tecla').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var id = b.getAttribute('data-tecla');
        gravandoTecla = (gravandoTecla === id) ? null : id;
        atualizarPainelTeclas();
      });
    });
  }

  function executarAtalho(id) {
    var item = null;
    for (var xi = 0; xi < ATALHOS_DISPONIVEIS.length; xi++) if (ATALHOS_DISPONIVEIS[xi].id === id) item = ATALHOS_DISPONIVEIS[xi];
    if (!item) return;
    if (item.tipo === 'nativo') {
      var h = getHeader();
      if (!h) return;
      var bt = h.querySelector('[aria-label="' + item.alvo + '"]');
      if (bt) { try { bt.click(); } catch (e) {} }
      return;
    }
    if (item.tipo === 'menu') { executar(item.alvo); return; }
    if (item.tipo === 'nativo2') { executarNativo(item.alvo); return; }
    if (item.tipo === 'atualizar') { clicarAtualizar(true); return; }
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.repeat) return;
    if (gravandoTecla) {
      if (ev.key === 'Escape') {
        gravandoTecla = null;
        atualizarPainelTeclas();
        return;
      }
      var cb = comboDoEvento(ev);
      if (!cb) return;
      ev.preventDefault();
      ev.stopPropagation();
      var id = gravandoTecla;
      salvarAtalho(id, cb);
      gravandoTecla = null;
      atualizarPainelTeclas();
      mostrarToast('Atalho de ' + rotuloAtalho(id) + ': ' + formatarCombo(cb));
      return;
    }
    var comb = comboDoEvento(ev);
    if (!comb) return;
    for (var ki = 0; ki < ATALHOS_DISPONIVEIS.length; ki++) {
      if (atalhoDe(ATALHOS_DISPONIVEIS[ki].id) === comb) {
        ev.preventDefault();
        ev.stopPropagation();
        executarAtalho(ATALHOS_DISPONIVEIS[ki].id);
        return;
      }
    }
  });

  document.addEventListener('click', function (ev) {
    var alvo = ev.target;
    if (painel && painel.classList.contains('waly-aberto') && !painel.contains(alvo)) {
      var c = alvo.closest;
      if (!c || !c.call(alvo, '[data-walytech-rgb]')) fecharPainel();
    }
    if (painelTimer && painelTimer.classList.contains('waly-aberto') && !painelTimer.contains(alvo)) {
      var c3 = alvo.closest;
      if (!c3 || !c3.call(alvo, '[data-walytech-timer]')) fecharPainelTimer();
    }
  }, true);

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      fecharPainel();
      fecharPainelTimer();
    }
  });

  function loopRgb() {
    try {
      injetarLapis();
      garantirEstilo();
    } catch (e) {
      console.log('[walytech] erro:', e.message);
    }
  }

  function ehNossoDOM(el) {
    if (!el || el.nodeType !== 1) return false;
    var e = el;
    while (e && e !== document.body) {
      if (e.id && (e.id.indexOf('walytech') === 0 || e.id === 'waly-toast' || e.id === 'waly-bg-file')) return true;
      if (e.hasAttribute && e.hasAttribute('data-walytech')) return true;
      e = e.parentNode;
    }
    return false;
  }

  function tick() {
    avancReassert();
    atualizarHub();
    loopBotoes();
    loopLink();
    loopStatusRodape();
    loopRgb();
    loopFundo();
    loopTimer();
    loopBrilho();
    loopNota();
    checarAtualizacao();
    fiscalizarToast();
  }

  aplicarCor(corSalva(), false);
  brilhoAplicar();

  setInterval(tick, 1000);
  new MutationObserver(function (muts) {
    for (var m = 0; m < muts.length; m++) {
      var alvo = muts[m].target;
      if (alvo && alvo.nodeType === 1 && ehNossoDOM(alvo)) continue;
      if (!alvo && muts[m].addedNodes.length && muts[m].addedNodes[0].nodeType === 1 && ehNossoDOM(muts[m].addedNodes[0])) continue;
      tick();
      return;
    }
  }).observe(document.body, { childList: true, subtree: true });
  tick();

  window.__walytDebug = function () {
    var h = getHeader();
    var btn3 = getDots();
    console.log('[walytech] header:', h ? 'sim' : 'nao');
    console.log('[walytech] 3 pontinhos no header:', btn3 ? 'sim' : 'nao');
    if (h) {
      var g = h.querySelector('.flex.shrink-0.items-center.gap-0\\.5');
      var botoes = g ? g.querySelectorAll('button') : [];
      var lista = [];
      botoes.forEach(function (b) {
        lista.push((b.style.display === 'none' ? '[oculto] ' : '') + (b.getAttribute('aria-label') || '(sem rotulo)'));
      });
      console.log('[walytech] botoes do grupo de acoes:', lista.length ? lista.join(' | ') : '(nenhum)');
      var nat = acharBotoesNativos();
      console.log('[walytech] nativos reconhecidos: pesquisar=' + (nat.pesquisar ? 'sim' : 'nao') +
        ' tags=' + (nat.tags ? 'sim' : 'nao') +
        ' soltar=' + (nat.soltar ? 'sim' : 'nao') +
        ' detalhes=' + (nat.detalhes ? 'sim' : 'nao'));
    }
  };

  window.__walytTest = function (nome) {
    executar(nome);
  };

  window.__walytTeclasDebug = function () {
    console.log('[walytech] lapis (painel) no header:', !!document.querySelector('[data-walytech-rgb]'));
    console.log('[walytech] atalhos configurados:');
    ATALHOS_DISPONIVEIS.forEach(function (item) {
      console.log('[walytech]  -', item.rot + ':', formatarCombo(atalhoDe(item.id)));
    });
  };

  window.__walytNotaDebug = function () {
    var toggle = getThemeToggle();
    var el = toggle && toggle.parentNode ? toggle.parentNode.querySelector('[data-walytech-nota]') : null;
    console.log('[walytech] token ngStorage-token:', lerNgToken() ? 'ok' : 'ausente');
    console.log('[walytech] tenant x-tenant-id:', lerTenantId() || 'ausente');
    console.log('[walytech] nota media cacheada:', notaCache === null ? 'nao carregada' : notaCache.toFixed(1));
    console.log('[walytech] estrelinha injetada:', !!el ? (el.textContent || 'ok') : 'nao');
    if (notaCache === null && !notaBuscando) buscarNota();
  };

  window.__walytUpdateDebug = function () {
    console.log('[walytech] versao atual:', SK_VERSION);
    console.log('[walytech] updateURL:', UPDATE_URL);
    console.log('[walytech] ultima checagem:', localStorage.getItem('walytechUpdateCheck') ? new Date(parseInt(localStorage.getItem('walytechUpdateCheck'), 10)).toLocaleTimeString('pt-BR') : 'nunca');
    checarAtualizacao(true);
  };

  window.__walytStatusDebug = function () {
    console.log('[walytech] ultimo status:', STATUS_RESULT || 'ainda nao verificado');
    console.log('[walytech] token payload:', tokenPayload() || 'nao decodificado');
    if (!STATUS_BUSY) verificarStatus();
  };

  window.__walytDump = function () {
    var btn3 = getDots();
    if (!btn3) {
      console.log('[walytech] 3 pontinhos do header NAO encontrado');
      return;
    }
    console.log('[walytech] abrindo menu do header para inspecao...');
    btn3.click();
    var tentativas = 0;
    var timer = setInterval(function () {
      tentativas++;
      var menus = document.querySelectorAll('[role="menu"][data-state="open"]');
      if (menus.length > 0 || tentativas >= 30) {
        clearInterval(timer);
        listarMenus();
        btn3.click();
        console.log('[walytech] menu inspecionado e fechado.');
      }
    }, 100);
  };

  window.__walytNavDebug = function () {
    var nav = getNav();
    console.log('[walytech] sidebar nav:', nav ? 'sim' : 'nao');
    console.log('[walytech] recolhida:', nav ? estaRecolhida(nav) : '-');
    console.log('[walytech] base:', getBase());
    ATALHOS.forEach(function (item) {
      var a = nav ? nav.querySelector('[' + MARCA + '="' + item.caminho + '"]') : null;
      console.log('[walytech] atalho', item.rotulo, '=>', hrefCompleto(item.caminho), a ? '(ok)' : '(faltando)');
    });
  };

  window.__walytRgbDebug = function () {
    var toggle = getThemeToggle();
    console.log('[walytech] toggle de tema:', toggle ? 'sim' : 'nao');
    console.log('[walytech] lapis injetado:', toggle && toggle.parentNode ? !!toggle.parentNode.querySelector('[data-walytech-rgb]') : false);
    console.log('[walytech] cor salva:', corSalva());
    console.log('[walytech] brilho salvo:', textoBrilho(brilhoSalvo()));
    console.log('[walytech] imagem de fundo:', bgImg() ? 'sim' : 'nao');
    console.log('[walytech] fundo habilitado:', bgLigado());
    console.log('[walytech] fundo ativo agora:', document.documentElement.classList.contains('waly-bg'));
    console.log('[walytech] chat aberto (detectado):', chatAberto());
    console.log('[walytech] atualizacao automatica:', timerAtivo ? ('ligada (a cada ' + timerMin() + ' min)') : 'desligada');
    console.log('[walytech] botao Atualizar da pagina encontrado:', !!acharBotaoAtualizar());
    console.log('[walytech] luminosidade da pagina:', brilhoValor());
    console.log('[walytech] modo do app (claro/escuro):', modoApp());
    console.log('[walytech] cores avancadas salvas:', Object.keys(avancSalvo()).length);
    console.log('[walytech] estilo do tema:', document.getElementById('walytech-tema') ? 'ok' : 'faltando');
    var st = document.getElementById('walytech-tema');
    console.log('[walytech] estilo e o ultimo do head:', st && document.head ? (st.nextElementSibling === null) : false);
  };
})();
