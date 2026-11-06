// ==UserScript==
// @name         Better walytech
// @namespace    https://walyzappro.walytech.com.br
// @version      2.8.11
// @description  Melhora funcionalidades no bot.
// @match        https://walyzappro.walytech.com.br/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js?v=2.8.11
// @downloadURL  https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js?v=2.8.11
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  console.log('[walytech] script carregado');

  function getHeader() {
    var h = document.querySelector('.flex.h-16.shrink-0.items-center.justify-between.border-b.border-border.bg-card.px-3');
    if (h) return h;
    return document.querySelector('.flex.shrink-0.items-center.justify-between.gap-2.border-b.border-border.bg-card');
  }

  function botaoInvisivel(b) {
    if (b.closest && b.closest('[aria-hidden="true"]')) return true;
    var p = b.parentNode;
    var n = 0;
    while (p && p.nodeType === 1 && n < 6) {
      if (p.classList && p.classList.contains('invisible')) return true;
      p = p.parentNode;
      n++;
    }
    return false;
  }

  function norm(s) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  var MARCA = 'data-walytech-nav';
  var MARCA_GRUPO = 'data-walytech-navwrap';

  var SVG_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>';
  var SVG_REL = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg>';

  var SVG_DL = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>';

  var SVG_CLI = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>';

  var SVG_STA = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" aria-hidden="true"><line x1="18" x2="18" y1="20" y2="10"></line><line x1="12" x2="12" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="14"></line></svg>';

  var ATALHOS = [
    { rotulo: 'Chat', caminho: '/tickets', svg: SVG_CHAT },
    { rotulo: 'Relatório de Atendimentos', caminho: '/tickets/service-report', svg: SVG_REL },
    { rotulo: 'Cadastro de Clientes', caminho: '/registrations/customers', svg: SVG_CLI },
    { rotulo: 'Baixar atualizações', acao: 'update', svg: SVG_DL }
  ];

  function getBase() {
    var s = document.querySelector('script[src*="/assets/main-"]') ||
      document.querySelector('script[src*="/assets/index-"]') ||
      document.querySelector('script[src*="/assets/"]');
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

  function temDotNaoLidas(b) {
    var sps = b.querySelectorAll('span');
    for (var i = 0; i < sps.length; i++) {
      var c = sps[i].classList;
      if (c.contains('bg-emerald-500') && c.contains('rounded-full') && c.contains('h-1.5')) return true;
    }
    return false;
  }

  function loopNaoLidas() {
    try {
      var chips = document.querySelectorAll('button.rounded-full');
      for (var i = 0; i < chips.length; i++) {
        var b = chips[i];
        if (!b.parentNode) continue;
        if (temDotNaoLidas(b)) b.setAttribute('data-walytech-nl', '1');
        else if (b.hasAttribute('data-walytech-nl')) b.removeAttribute('data-walytech-nl');
      }
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
  var TOPO_LOGO_KEY = 'walytechTopoLogo';
  var BRILHO_KEY = 'walytechBrandBrightness';
  var BRILHO_MIN = -40;
  var BRILHO_MAX = 40;
  var BG_KEY = 'walytechBg';
  var BG_ON_KEY = 'walytechBgOn';
  var BGBRILHO_KEY = 'walytechBgBrilho';
  var BGBRILHO_MIN = -60;
  var BGBRILHO_MAX = 60;
  var BGOP_KEY = 'walytechBgOpacidade';
  var BGOP_MIN = 0;
  var BGOP_MAX = 100;
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
    'html.waly-bg::before{content:"";position:fixed;inset:0;z-index:-1;background-image:var(--waly-bg-img);background-position:center;background-size:cover;background-repeat:no-repeat;background-attachment:fixed;opacity:var(--waly-bg-opacidade,1)}' +
    'html.waly-bg::after{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:var(--waly-bg-shade)}' +
    'html.waly-bg,html.waly-bg body{background-color:transparent!important}' +
    'html.waly-bg [class*="bg-background"],html.waly-bg [class*="bg-muted/"]{background-color:transparent!important}' +
    'html.waly-chat [class~="text-primary"],html [id^="msg-"] [class~="text-primary"],html [class*="bg-wa-chat-bg"] [class~="text-primary"],html [class*="bg-wa-bubble"] [class~="text-primary"]{color:#FFFFFF!important;font-weight:700!important}' +
    ':where(div.flex.shrink-0.items-center.justify-between.border-b.border-border.bg-card button[aria-label="Finalizar"]) svg{stroke:#dc2626!important;color:#dc2626!important}' +
    ':where(div.flex.shrink-0.items-center.justify-between.border-b.border-border.bg-card button[aria-label="Finalizar"]:hover) svg{stroke:#b91c1c!important;color:#b91c1c!important}' +
    ':where(div.flex.shrink-0.items-center.justify-between.border-b.border-border.bg-card button[aria-label="Finalizar"]:hover){background-color:color-mix(in srgb,#b91c1c 26%,transparent)!important}' +
    'button[aria-label="Toggle theme"]{display:none!important}' +
    'button[data-walytech-nl]{background-color:#10B981!important;border-color:#10B981!important;color:#FFFFFF!important;box-shadow:0 0 0 1px rgba(16,185,129,.35),0 4px 14px -4px rgba(16,185,129,.7)}' +
    'button[data-walytech-nl]:hover{background-color:#059669!important;border-color:#059669!important;color:#FFFFFF!important}' +
    'button[data-walytech-nl] svg{stroke:#FFFFFF!important;color:#FFFFFF!important}' +
    'button[data-walytech-nl] span.bg-emerald-500{background-color:#FFFFFF!important;box-shadow:0 0 0 2px #10B981!important}' +
    'header.z-40.h-16{background-color:var(--primary)!important;color:#FFFFFF!important}' +
    'html.waly-topo-nologo header.z-40.h-16 div.flex.flex-1:not([class*="justify-end"]) > img{display:none!important}' +
    'html.waly-topo-nologo header.z-40.h-16 div.flex.flex-1:not([class*="justify-end"]) > p{display:none!important}' +
    'html.waly-topo-nologo img[class*="h-26"]{display:none!important}' +
    'html.waly-topo-nologo img[class*="object-contain"][class*="opacity-30"]{display:none!important}';

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
    '#walytech-brilho-overlay{position:fixed;inset:0;z-index:2147483500;pointer-events:none;display:none}' +
    '[data-walytech-timer].waly-ativo svg{stroke:#4ADE80!important;color:#4ADE80!important}' +
    '@keyframes waly-teclas-pisca{from{opacity:.55}to{opacity:1}}' +
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
    '#walytech-rgb-panel .waly-teclas-gravando{border-color:#4ADE80;color:#4ADE80;animation:waly-teclas-pisca .9s infinite alternate}' +
    '#walytech-rgb-panel .waly-av-anota{opacity:.75;margin-bottom:10px;line-height:1.4}' +
    '#walytech-rgb-panel .waly-av-grupo{margin-top:12px;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;opacity:.5}' +
    '#walytech-rgb-panel .waly-av-desc{opacity:.55;font-size:11px;line-height:1.45;margin:3px 0 7px}' +
    '#walytech-rgb-panel .waly-av-lista{max-height:calc(100vh - 260px);overflow-y:auto;padding-right:3px}' +
    '#walytech-rgb-panel .waly-av-linha{display:flex;align-items:center;gap:8px;padding:5px 0;border-top:1px solid rgba(255,255,255,.07)}' +
    '#walytech-rgb-panel .waly-av-rot{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;opacity:.9}' +
    '#walytech-rgb-panel .waly-av-hex{font-style:normal;font-size:10px;opacity:.5;letter-spacing:.3px;font-family:ui-monospace,SFMono-Regular,monospace}' +
    '#walytech-rgb-panel .waly-av-input{width:34px;height:24px;border:0;background:none;cursor:pointer;padding:0}' +
    '#walytech-rgb-panel .waly-av-x{background:none;border:0;color:#94a3b8;cursor:pointer;font-size:13px;padding:0 2px}' +
    '#walytech-rgb-panel .waly-av-x:hover{color:#EF4444}' +
    '#walytech-rgb-panel .waly-foto-prevw{display:none;margin-bottom:10px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.16)}' +
    '#walytech-rgb-panel .waly-foto-prevw img{display:block;width:100%;max-height:150px;object-fit:contain;background:#000}' +
    '#walytech-rgb-panel .waly-foto-input{width:100%;padding:8px;margin-bottom:10px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;font-size:12px}' +
    '#walytech-rgb-panel .waly-foto-input::placeholder{color:rgba(255,255,255,.35)}' +
    'img[data-walytech-foto-inj]{border-radius:inherit}' +
    '#walytech-pop-wrap{position:fixed;top:70px;right:16px;z-index:2147483600;display:flex;flex-direction:column;gap:10px;width:296px;pointer-events:none;font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px}' +
    '#walytech-pop-wrap .walytech-pop{pointer-events:auto;position:relative;padding:12px 34px 12px 14px;border-radius:14px;background:#1b1b21;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 24px 60px -16px rgba(0,0,0,.65);border-left:3px solid #10b981;animation:waly-pop-entra .28s ease-out}' +
    '#walytech-pop-wrap .walytech-pop[data-tipo="pend"]{border-left-color:#f59e0b}' +
    '#walytech-pop-wrap .walytech-pop-titulo{font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;opacity:.65}' +
    '#walytech-pop-wrap .walytech-pop-nome{font-size:17px;font-weight:700;margin-top:4px;line-height:1.25;word-break:break-word}' +
    '#walytech-pop-wrap .walytech-pop-sub{opacity:.7;font-size:11px;margin-top:3px;line-height:1.35}' +
    '#walytech-pop-wrap .walytech-pop-x{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;padding:0;font-size:11px;line-height:20px}' +
    '#walytech-pop-wrap .walytech-pop-x:hover{background:rgba(255,255,255,.2)}' +
    '#walytech-pop-wrap .walytech-pop-sair{animation:waly-pop-sai .18s ease-in forwards}' +
    '@keyframes waly-pop-entra{from{transform:translateX(34px);opacity:0}to{transform:none;opacity:1}}' +
    '@keyframes waly-pop-sai{to{transform:translateX(34px);opacity:0}}' +
    '#walytech-rgb-panel .waly-notif-test{width:100%;padding:6px 0;margin:10px 0 2px;border-radius:9px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font-size:12px}' +
    '#walytech-rgb-panel .waly-notif-test:hover{background:rgba(255,255,255,.14)}';
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
    estiloTema.textContent = CSS_BASE + buildCss(hsl.h, hsl.s, l0) + avancCss() + avancExtraCss();
    avancAplicar();
    if (salvar !== false) {
      try { localStorage.setItem(COR_KEY, hex); } catch (e) {}
    }
  }

  function corSalva() {
    try { return localStorage.getItem(COR_KEY) || COR_PADRAO; } catch (e) { return COR_PADRAO; }
  }

  function topoLogoEsconde() {
    try { return localStorage.getItem(TOPO_LOGO_KEY) !== '0'; } catch (e) { return true; }
  }

  function topoLogoAplicar() {
    document.documentElement.classList.toggle('waly-topo-nologo', topoLogoEsconde());
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
          if (d && typeof d === 'object') {
            var nomeApi = d.nome || d.usuarioNome || d.name || (d.usuario && d.usuario.nome);
            if (nomeApi && !localStorage.getItem(FOTO_NOME_KEY)) {
              try { localStorage.setItem(FOTO_NOME_KEY, String(nomeApi)); } catch (e) {}
            }
          }
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
    var alvo = btnUsuario();
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
      if (!lerNgToken()) return;
      if (notaCache === null && notaUltimaTentativa && Date.now() - notaUltimaTentativa < 5 * 60 * 1000) return;
      var velha = Date.now() - notaCacheHora > 5 * 60 * 1000;
      if ((notaCache === null || velha) && !notaBuscando) buscarNota();
    } catch (e) {}
  }

  var FOTO_KEY = 'walytechMinhaFoto';
  var FOTO_ON_KEY = 'walytechMinhaFotoOn';
  var FOTO_COLEGA_KEY = 'walytechFotoColegas';
  var FOTO_NOME_KEY = 'walytechMeuNomeFoto';
  var FOTO_MAP_KEY = 'walytechFotoMap';
  var FOTO_MAP_HORA_KEY = 'walytechFotoMapHora';
  var FOTO_TOKEN_KEY = 'walytechGhToken';
  var FOTO_SRV_KEY = 'walytechFotoServidor';
  var FOTO_SRV_CHAVE_KEY = 'walytechFotoChave';
  var FOTO_SRV_OFF_KEY = 'walytechFotoServidorOff';
  var FOTO_CACHE_MS = 10 * 60 * 1000;
  var FOTO_MAP_FORCE_MS = 60 * 1000;
  var FOTO_RETRY_MS = 10 * 60 * 1000;
  var FOTO_CHAT_CACHE_MS = 10 * 60 * 1000;
  var FOTO_CHAT_CACHE_KEY = 'chat_photo_urls_v1';
  var FOTO_CHAT_NOSSO_KEY = 'walytechChatFotos';
  var FOTO_BLOQ_KEY = 'walytechFotoBloqueados';
  var FOTO_MASTER_KEY = 'walytechFotosCustomOn';
  var FOTO_REPO = 'otofiles/Better-Walytech';
  var FOTO_RAW = 'https://raw.githubusercontent.com/' + FOTO_REPO + '/main/avatares.json';
  var FOTO_GH_TOKEN = '';
  var FOTO_SRV_URL = 'https://better-walytech-fotos.otoni-luizg.workers.dev';
  var FOTO_SRV_CHAVE = 'b613632f4ac04a40adea6ce24ef7caab';
  var fotoMap = {};
  var fotoMapCarregado = false;
  var fotoLoopUltimo = 0;
  var chatLista = [];
  var chatListaHora = 0;
  var chatBuscando = false;
  var FOTO_QUEBRADAS_KEY = 'walytechFotosQuebradas';
  var FOTO_QUEBRADAS_MS = 6 * 60 * 60 * 1000;
  var fotosQuebradas = {};
  try {
    var fqc = JSON.parse(localStorage.getItem(FOTO_QUEBRADAS_KEY) || '{}');
    if (fqc && typeof fqc === 'object' && !Array.isArray(fqc)) fotosQuebradas = fqc;
  } catch (e) {}
  (function () {
    var agora = Date.now();
    for (var k in fotosQuebradas) {
      if (!fotosQuebradas[k] || agora - fotosQuebradas[k] > FOTO_QUEBRADAS_MS) delete fotosQuebradas[k];
    }
  })();

  function marcarFotoQuebrada(url) {
    if (!url) return;
    var mudou = !fotosQuebradas[url];
    fotosQuebradas[url] = Date.now();
    if (mudou) { try { localStorage.setItem(FOTO_QUEBRADAS_KEY, JSON.stringify(fotosQuebradas)); } catch (e) {} }
  }
  var fotoMapForceUltimo = 0;

  function linkValido(u) {
    return typeof u === 'string' && /^https?:\/\/\S+$/i.test(u.trim());
  }

  function minhaFoto() {
    try { return localStorage.getItem(FOTO_KEY) || ''; } catch (e) { return ''; }
  }

  function fotoLigada() {
    try { return localStorage.getItem(FOTO_ON_KEY) !== '0'; } catch (e) { return true; }
  }

  function colegasLigados() {
    if (!fotosMestrasLigadas()) return false;
    try { return localStorage.getItem(FOTO_COLEGA_KEY) !== '0'; } catch (e) { return true; }
  }

  function temRastroFoto() {
    var ks = [FOTO_KEY, FOTO_MAP_KEY, FOTO_MAP_HORA_KEY, FOTO_CHAT_NOSSO_KEY, FOTO_BLOQ_KEY];
    for (var i = 0; i < ks.length; i++) {
      try { if (localStorage.getItem(ks[i]) !== null) return true; } catch (e) {}
    }
    return false;
  }

  function fotosMestrasLigadas() {
    try {
      var v = localStorage.getItem(FOTO_MASTER_KEY);
      if (v === '0') return false;
      if (v === '1') return true;
    } catch (e) {}
    return temRastroFoto();
  }

  function fotoToken() {
    var emb = String(FOTO_GH_TOKEN || '').trim();
    if (emb && emb !== 'COLE_AQUI_O_TOKEN_DO_GITHUB') return emb;
    try { return (localStorage.getItem(FOTO_TOKEN_KEY) || '').trim(); } catch (e) { return ''; }
  }

  function tokenEmbedido() {
    var emb = String(FOTO_GH_TOKEN || '').trim();
    return !!emb && emb !== 'COLE_AQUI_O_TOKEN_DO_GITHUB';
  }

  function fotoServidor() {
    if (fotoServidorDesligado()) return '';
    var v = '';
    try { v = (localStorage.getItem(FOTO_SRV_KEY) || '').trim(); } catch (e) { v = ''; }
    if (!v) v = valorPadrao(FOTO_SRV_URL);
    return v.replace(/\/+$/, '');
  }

  function fotoServidorDesligado() {
    try { return localStorage.getItem(FOTO_SRV_OFF_KEY) === '1'; } catch (e) { return false; }
  }

  function valorPadrao(v) {
    var s = String(v || '').trim();
    if (!s || s.indexOf('COLE_AQUI') === 0) return '';
    return s;
  }

  function fotoChave() {
    var v = '';
    try { v = (localStorage.getItem(FOTO_SRV_CHAVE_KEY) || '').trim(); } catch (e) { v = ''; }
    if (!v) v = valorPadrao(FOTO_SRV_CHAVE);
    return v;
  }

  function fotoSync() {
    if (fotoServidor()) return 'servidor';
    if (fotoToken()) return 'github';
    return 'local';
  }

  function fotoSyncTexto() {
    var f = fotoSync();
    if (f === 'servidor') return 'servidor proprio' + (fotoServidorPadrao() ? ' (predefinido)' : '');
    if (f === 'github') return 'GitHub (token local)';
    return fotoServidorDesligado() ? 'desligada nesta maquina' : 'somente neste navegador';
  }

  function fotoServidorPadrao() {
    if (fotoServidorDesligado()) return false;
    var v = '';
    try { v = (localStorage.getItem(FOTO_SRV_KEY) || '').trim(); } catch (e) { v = ''; }
    return !v && !!valorPadrao(FOTO_SRV_URL);
  }

  function srvUrl() {
    return fotoServidor() + '/avatares.json';
  }

  function srvHeaders() {
    var h = { 'Content-Type': 'application/json' };
    var k = fotoChave();
    if (k) h['X-Waly-Key'] = k;
    return h;
  }

  function erroServidorTexto(status, txt) {
    var m = '';
    try {
      var j = JSON.parse(txt || '');
      m = (j && (j.message || j.error || j.erro)) || '';
    } catch (e) { m = ''; }
    var s = String(status);
    if (s === '401') return 'chave de escrita invalida ou negada pelo servidor';
    if (s === '403') return m ? m : 'servidor recusou a origem ou a chave';
    if (s === '404') return 'registro ainda nao existe no servidor';
    if (s === '429') return 'servidor limitando requisicoes, tente de novo';
    if (!s || s === '0') return 'servidor nao respondeu';
    return (m ? m : 'erro do servidor') + ' (HTTP ' + s + ')';
  }

  function testarServidorFoto() {
    if (!painel) return;
    var st = painel.querySelector('#waly-hub-foto-srv-st');
    if (!fotoServidor()) {
      if (st) st.textContent = 'Nenhum servidor configurado.';
      return;
    }
    if (st) st.textContent = 'Testando...';
    fetch(srvUrl() + '?t=' + Date.now(), { headers: srvHeaders(), cache: 'no-store' })
      .then(function (r) {
        return r.text().then(function (t) { return { ok: r.ok, status: r.status, txt: t }; });
      })
      .then(function (r) {
        if (!r.ok) {
          if (st) st.textContent = 'Erro: ' + erroServidorTexto(r.status, r.txt);
          return;
        }
        var n = 0;
        try {
          var j = JSON.parse(r.txt || '{}');
          n = Object.keys(j || {}).length;
        } catch (e) { n = 0; }
        if (st) st.textContent = 'Servidor ok. ' + n + ' registro(s) no time.';
        mostrarToast('Servidor de sincronizacao ok');
        carregarFotoMap(true);
      })
      .catch(function (e) {
        if (st) st.textContent = 'Falha: ' + (e && e.message ? e.message : 'nao deu para falar com o servidor');
      });
  }

  function btnUsuario() {
    var t = getThemeToggle();
    var pai = t && t.parentNode ? t.parentNode : null;
    if (pai) {
var bs = pai.querySelectorAll('button[aria-haspopup]');
    var ultimo = null;
    for (var i = 0; i < bs.length; i++) {
      if (bs[i].hasAttribute('data-walytech') || bs[i].hasAttribute('data-walytech-rgb')) continue;
      ultimo = bs[i];
    }
    if (ultimo) return ultimo;
    }
    var salvo = '';
    try { salvo = localStorage.getItem(FOTO_NOME_KEY) || ''; } catch (e) {}
    if (salvo) {
      try {
        var b2 = document.querySelector('button[aria-label="' + salvo.replace(/"/g, '\\"') + '"]');
        if (b2) return b2;
      } catch (e) {}
    }
    return null;
  }

  function meuNome() {
    var b = btnUsuario();
    if (b) {
      var l = (b.getAttribute('aria-label') || '').trim();
      if (l) {
        try { localStorage.setItem(FOTO_NOME_KEY, l); } catch (e) {}
        return l;
      }
    }
    try { return localStorage.getItem(FOTO_NOME_KEY) || ''; } catch (e) { return ''; }
  }

  function nomeAoLado(w) {
    var p = w.parentNode;
    if (!p) return '';
    var ps = p.querySelectorAll('p');
    if (!ps.length) return '';
    return (ps[0].textContent || '').trim();
  }

  function fotoBloqueados() {
    try {
      var b = JSON.parse(localStorage.getItem(FOTO_BLOQ_KEY) || '{}');
      return b && typeof b === 'object' && !Array.isArray(b) ? b : {};
    } catch (e) { return {}; }
  }

  function marcarFotoBloqueada(n, on) {
    if (!n) return;
    var b = fotoBloqueados();
    if (on) b[n] = 1;
    else delete b[n];
    try { localStorage.setItem(FOTO_BLOQ_KEY, JSON.stringify(b)); } catch (e) {}
  }

  function mapaFotos() {
    var m = {};
    var bloq = fotoBloqueados();
    if (colegasLigados()) {
      for (var k in fotoMap) {
        if (Object.prototype.hasOwnProperty.call(fotoMap, k) && linkValido(fotoMap[k])) m[k] = fotoMap[k];
      }
    }
    for (var b in bloq) {
      if (Object.prototype.hasOwnProperty.call(bloq, b) && bloq[b]) delete m[b];
    }
    var u = minhaFoto();
    var n = norm(meuNome());
    if (fotoLigada() && linkValido(u) && n) m[n] = u.trim();
    return m;
  }

  function marcarFotoHora(t) {
    try { localStorage.setItem(FOTO_MAP_HORA_KEY, String(t)); } catch (e) {}
  }

  function salvarFotoMap(o) {
    fotoMap = o || {};
    fotoMapCarregado = true;
    marcarFotoHora(Date.now());
    try { localStorage.setItem(FOTO_MAP_KEY, JSON.stringify(fotoMap)); } catch (e) {}
  }

  function mapaigual(a, b) {
    var ka = Object.keys(a || {});
    var kb = Object.keys(b || {});
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i++) {
      if (a[ka[i]] !== b[ka[i]]) return false;
    }
    return true;
  }

  function atualizarMapaTime(manual) {
    var agora = Date.now();
    if (!manual && agora - fotoMapForceUltimo < FOTO_MAP_FORCE_MS) return;
    fotoMapForceUltimo = agora;
    carregarFotoMap(true);
  }

  function carregarFotoMap(forca) {
    if (!fotoMapCarregado) {
      try {
        var cru = localStorage.getItem(FOTO_MAP_KEY);
        if (cru) {
          var j = JSON.parse(cru);
          if (j && typeof j === 'object') { fotoMap = j; fotoMapCarregado = true; }
        }
      } catch (e) {}
    }
    var t = 0;
    try { t = parseInt(localStorage.getItem(FOTO_MAP_HORA_KEY) || '0', 10) || 0; } catch (e) {}
    var agora = Date.now();
    if (!forca && agora - t < FOTO_CACHE_MS) return;
    marcarFotoHora(agora);
    var url = fotoServidor() ? (srvUrl() + '?t=' + agora) : (FOTO_RAW + '?t=' + agora);
    var opts = { cache: 'no-store' };
    if (fotoServidor()) opts.headers = srvHeaders();
    fetch(url, opts)
      .then(function (r) {
        return r.text().then(function (txt) {
          if (!r.ok) throw new Error('http ' + r.status);
          var j = JSON.parse(txt);
          if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error('formato invalido');
          return j;
        });
      })
      .then(function (j) {
        var o = {};
        for (var k in j) {
          if (!Object.prototype.hasOwnProperty.call(j, k)) continue;
          if (linkValido(j[k])) o[norm(k)] = j[k].trim();
        }
        var mudou = !mapaigual(fotoMap, o);
        salvarFotoMap(o);
        aplicarFotos();
        if (mudou && forca) mostrarToast('Fotos do time atualizadas. Da um F5 para ver.');
      })
      .catch(function () {
        marcarFotoHora(Date.now() - FOTO_CACHE_MS + FOTO_RETRY_MS);
      });
  }

  function iniciaisDe(nome) {
    var p = String(nome || '').trim().split(/\s+/);
    var s = '';
    for (var i = 0; i < p.length && s.length < 2; i++) {
      if (p[i]) s += p[i].charAt(0);
    }
    return s.toUpperCase();
  }

  function prefixoChat(tab) {
    return tab === 'CONTACTS' ? 'USER' : String(tab || '').toUpperCase();
  }

  function lerCacheChat() {
    try {
      var c = JSON.parse(localStorage.getItem(FOTO_CHAT_CACHE_KEY) || '{}');
      return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
    } catch (e) { return {}; }
  }

  function carregarChats(forca) {
    var m = mapaFotos();
    if (!Object.keys(m).length) return;
    if (!colegasLigados()) return;
    var agora = Date.now();
    if (!forca && chatLista.length && agora - chatListaHora < FOTO_CHAT_CACHE_MS) return;
    if (chatBuscando) return;
    var tok = lerNgToken();
    if (!tok) return;
    chatBuscando = true;
    var h = {
      'Authorization': 'Bearer ' + tok,
      'Domain': location.hostname || '',
      'Accept-Language': localStorage.getItem('lang') || 'pt-BR'
    };
    var tid = lerTenantId();
    if (tid) h['x-tenant-id'] = tid;
    try {
      fetch('/api/chat-interno/all-minimizado', { headers: h, credentials: 'include' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (j) {
          var arr = (j && (j.data || j)) || [];
          if (!Array.isArray(arr)) arr = [];
          chatLista = arr;
          chatListaHora = Date.now();
          chatBuscando = false;
          sincronizarCacheChat();
        })
        .catch(function () { chatBuscando = false; });
    } catch (e) {
      chatBuscando = false;
    }
  }

  function sincronizarCacheChat() {
    var m = mapaFotos();
    var novos = {};
    if (colegasLigados()) {
      for (var i = 0; i < chatLista.length; i++) {
        var it = chatLista[i];
        if (!it || !it.nome || it.id == null) continue;
        var url = m[norm(it.nome)];
        if (!url || fotosQuebradas[url]) continue;
        novos[prefixoChat(it.tab) + ':' + it.id] = url;
      }
    }
    var nossos = {};
    try {
      var cru = JSON.parse(localStorage.getItem(FOTO_CHAT_NOSSO_KEY) || '{}');
      if (cru && typeof cru === 'object' && !Array.isArray(cru)) nossos = cru;
    } catch (e) {}
    var cache = lerCacheChat();
    var mudou = false;
    var k;
    for (k in nossos) {
      if (Object.prototype.hasOwnProperty.call(nossos, k) && !novos[k] && cache[k]) {
        delete cache[k];
        mudou = true;
      }
    }
    for (k in novos) {
      if (Object.prototype.hasOwnProperty.call(novos, k) && cache[k] !== novos[k]) {
        cache[k] = novos[k];
        mudou = true;
      }
    }
    if (!mudou) return;
    try { localStorage.setItem(FOTO_CHAT_CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
    try { localStorage.setItem(FOTO_CHAT_NOSSO_KEY, JSON.stringify(novos)); } catch (e) {}
  }

  function iniciaisNoAvatar(w) {
    var fb = w.querySelector('span.flex.h-full.w-full');
    if (!fb) return '';
    var t = (fb.textContent || '').trim();
    return t && t.length <= 3 ? t.toUpperCase() : '';
  }

  function nomePorIniciais(inic) {
    if (!inic) return '';
    var m = mapaFotos();
    var cands = [];
    var semFoto = [];
    var noMapa = [];
    for (var i = 0; i < chatLista.length; i++) {
      var it = chatLista[i];
      if (!it || !it.nome || iniciaisDe(it.nome) !== inic) continue;
      cands.push(it);
      if (!it.url) semFoto.push(it);
      if (m[norm(it.nome)]) noMapa.push(it);
    }
    if (cands.length === 1) return cands[0].nome;
    if (semFoto.length === 1) return semFoto[0].nome;
    if (noMapa.length === 1) return noMapa[0].nome;
    return '';
  }

  function nomeDoAvatar(w) {
    var im = w.querySelector('img[alt]');
    if (im) {
      var a = (im.getAttribute('alt') || '').trim();
      if (a) return a;
    }
    var nome = nomeAoLado(w);
    if (nome) return nome;
    return nomePorIniciais(iniciaisNoAvatar(w));
  }

  function ehMeuAvatar(w, meu) {
    var a = meu || avatarUsuario();
    if (!a) return false;
    return w === a || w.contains(a) || a.contains(w);
  }

  function ehAvatarGrande(el) {
    var w = el;
    while (w && w !== document.body && w.nodeType === 1) {
      var c = w.getAttribute ? w.getAttribute('class') : null;
      if (typeof c === 'string' && (c.indexOf('h-30') >= 0 || c.indexOf('w-30') >= 0)) return true;
      w = w.parentNode;
    }
    return false;
  }

  function aplicarFotoImg(im, url) {
    if (fotosQuebradas[url]) return;
    if (im.getAttribute('data-walytech-foto') === url && im.getAttribute('src') === url) return;
    if (!im.getAttribute('data-walytech-foto')) im.setAttribute('data-walytech-foto-orig', im.getAttribute('src') || '');
    if (!im.getAttribute('data-walytech-erro')) {
      im.setAttribute('data-walytech-erro', '1');
      im.addEventListener('error', function () {
        var u = im.getAttribute('data-walytech-foto');
        if (u) marcarFotoQuebrada(u);
        var o = im.getAttribute('data-walytech-foto-orig');
        im.removeAttribute('data-walytech-foto');
        im.removeAttribute('data-walytech-foto-orig');
        if (o) im.setAttribute('src', o);
        else im.removeAttribute('src');
      });
    }
    im.setAttribute('data-walytech-foto', url);
    im.setAttribute('src', url);
  }

  function injetarFoto(w, url, nome) {
    var injetado = w.querySelector('img[data-walytech-foto-inj]');
    var nativo = w.querySelector('img:not([data-walytech-foto-inj])');
    if (nativo) {
      if (injetado && injetado.parentNode) injetado.parentNode.removeChild(injetado);
      aplicarFotoImg(nativo, url);
      return;
    }
    if (fotosQuebradas[url]) return;
    if (injetado) {
      if (injetado.getAttribute('data-walytech-foto') !== url) {
        injetado.setAttribute('data-walytech-foto', url);
        injetado.setAttribute('src', url);
      }
      return;
    }
    var im = document.createElement('img');
    im.setAttribute('data-walytech-foto-inj', '1');
    im.setAttribute('data-walytech-foto', url);
    im.setAttribute('alt', nome || '');
    im.setAttribute('decoding', 'async');
    im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;pointer-events:none';
    im.onerror = function () {
      marcarFotoQuebrada(url);
      if (im.parentNode) im.parentNode.removeChild(im);
    };
    im.src = url;
    w.appendChild(im);
  }

  function avatarUsuario() {
    var b = btnUsuario();
    if (b) {
      var im = b.querySelector('img');
      if (im) return im;
      var w = b.querySelector('span.rounded-full');
      if (w) return w;
    }
    var t = getThemeToggle();
    var pai = t && t.parentNode ? t.parentNode : null;
    if (pai) {
      var ims = pai.querySelectorAll('img[alt]');
      if (ims.length) return ims[ims.length - 1];
    }
    return null;
  }

  function aplicarFotoUsuario(url) {
    var el = avatarUsuario();
    if (!el) return;
    if (el.tagName === 'IMG') aplicarFotoImg(el, url);
    else injetarFoto(el, url, '');
  }

  function aplicarFotos() {
    if (!fotosMestrasLigadas()) return;
    var m = mapaFotos();
    var u = minhaFoto();
    if (fotoLigada() && linkValido(u)) aplicarFotoUsuario(u.trim());
    if (!Object.keys(m).length) return;
    try {
      var meu = avatarUsuario();
      var imgs = document.querySelectorAll('img[alt]');
      for (var i = 0; i < imgs.length; i++) {
        var im = imgs[i];
        var alt = (im.getAttribute('alt') || '').trim();
        if (!alt || ehAvatarGrande(im)) continue;
        var alvo = m[norm(alt)];
        if (alvo && !fotosQuebradas[alvo]) aplicarFotoImg(im, alvo);
      }
      var caixas = document.querySelectorAll('span.rounded-full.overflow-hidden');
      for (var j = 0; j < caixas.length; j++) {
        var w = caixas[j];
        if (ehAvatarGrande(w)) continue;
        if (ehMeuAvatar(w, meu)) continue;
        var nome = nomeDoAvatar(w);
        if (!nome) continue;
        var alvo2 = m[norm(nome)];
        if (alvo2) injetarFoto(w, alvo2, nome);
      }
    } catch (e) {}
  }

  function restaurarAvatares() {
    try {
      var injetados = document.querySelectorAll('img[data-walytech-foto-inj]');
      for (var i = 0; i < injetados.length; i++) {
        var im = injetados[i];
        if (im.parentNode) im.parentNode.removeChild(im);
      }
      var marcados = document.querySelectorAll('img[data-walytech-foto]');
      for (var j = 0; j < marcados.length; j++) {
        var m = marcados[j];
        var o = m.getAttribute('data-walytech-foto-orig');
        if (o !== null) {
          if (o) m.setAttribute('src', o);
          else m.removeAttribute('src');
        }
        m.removeAttribute('data-walytech-foto');
        m.removeAttribute('data-walytech-foto-orig');
      }
    } catch (e) {}
    try { sincronizarCacheChat(); } catch (e) {}
  }

  function loopFoto() {
    try {
      if (!fotosMestrasLigadas()) return;
      carregarFotoMap(false);
      var agora = Date.now();
      if (agora - fotoLoopUltimo < 1500) return;
      fotoLoopUltimo = agora;
      carregarChats(false);
      sincronizarCacheChat();
      aplicarFotos();
    } catch (e) {}
  }

  function linhaFoto() {
    var n = norm(meuNome());
    var u = minhaFoto();
    if (!n || !linkValido(u)) return null;
    return '"' + n + '": "' + u.trim() + '"';
  }

  function aplicarLinkFoto() {
    if (!painel) return;
    var inp = painel.querySelector('#waly-hub-foto-url');
    var v = ((inp && inp.value) || '').trim();
    if (!v) {
      mostrarToast('Cole o link da foto.', true);
      return;
    }
    if (!linkValido(v)) {
      mostrarToast('Link invalido. Use o link direto da imagem.', true);
      return;
    }
    try {
      localStorage.setItem(FOTO_KEY, v);
      localStorage.setItem(FOTO_ON_KEY, '1');
    } catch (e) {}
    marcarFotoBloqueada(norm(meuNome()), false);
    delete fotosQuebradas[v];
    var teste = new Image();
    teste.onerror = function () {
      mostrarToast('Aviso: essa URL nao carregou como imagem.', true);
    };
    teste.src = v;
    atualizarHub();
    aplicarFotos();
    publicarFoto(true);
  }

  function ghHeaders() {
    return {
      'Authorization': 'Bearer ' + fotoToken(),
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function ghUrl() {
    return 'https://api.github.com/repos/' + FOTO_REPO + '/contents/avatares.json';
  }

  function lerRegistroFoto() {
    if (fotoServidor()) {
      return fetch(srvUrl() + '?t=' + Date.now(), { headers: srvHeaders(), cache: 'no-store' })
        .then(function (r) {
          return r.text().then(function (t) {
            if (r.status === 404) return {};
            if (!r.ok) throw new Error(erroServidorTexto(r.status, t));
            if (!t) return {};
            var j = JSON.parse(t);
            return (j && typeof j === 'object' && !Array.isArray(j)) ? j : {};
          });
        })
        .then(function (obj) { return { obj: obj, sha: null }; });
    }
    var tok = fotoToken();
    if (!tok) return Promise.reject(new Error('sem servidor configurado e sem token do GitHub'));
    return fetch(ghUrl() + '?ref=main', { headers: ghHeaders() })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error((j && j.message) || ('HTTP ' + r.status));
          return j;
        });
      })
      .then(function (arq) {
        var obj = {};
        if (arq && arq.content) {
          try {
            obj = JSON.parse(decodeURIComponent(escape(atob(String(arq.content).replace(/\s/g, ''))))) || {};
          } catch (e) { obj = {}; }
        }
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) obj = {};
        return { obj: obj, sha: (arq && arq.sha) || null };
      });
  }

  function gravarRegistroFoto(st, msg, substituir) {
    if (fotoServidor()) {
      var url = srvUrl() + (substituir ? '?substituir=1' : '');
      return fetch(url, { method: 'PUT', headers: srvHeaders(), body: JSON.stringify(st.obj) })
        .then(function (r) {
          return r.text().then(function (t) {
            if (r.status === 404) throw new Error('endereco do servidor invalido (confira a URL)');
            if (!r.ok) throw new Error(erroServidorTexto(r.status, t));
            return t;
          });
        });
    }
    var tok = fotoToken();
    if (!tok) return Promise.reject(new Error('sem servidor configurado e sem token do GitHub'));
    var corpo = {
      message: msg,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(st.obj, null, 2) + '\n'))),
      branch: 'main'
    };
    if (st.sha) corpo.sha = st.sha;
    return fetch(ghUrl(), { method: 'PUT', headers: ghHeaders(), body: JSON.stringify(corpo) })
      .then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok) throw new Error((j && j.message) || ('HTTP ' + r.status));
          return j;
        });
      });
  }

  function erroFoto(e) {
    var msg = e && e.message ? e.message : 'erro';
    if (/bad credentials/i.test(msg)) msg = 'token do GitHub invalido (revogado) ou servidor recusou a chave';
    if (/not accessible|403/i.test(msg)) msg = 'token sem permissao de escrita (Contents: read and write) em ' + FOTO_REPO;
    return msg;
  }

  function publicarFoto(auto) {
    var n = norm(meuNome());
    var u = minhaFoto();
    if (!n || !linkValido(u)) {
      if (!auto) mostrarToast('Defina o link da foto primeiro.', true);
      return;
    }
    if (!fotoServidor() && !fotoToken()) {
      if (auto) mostrarToast('Foto aplicada so neste navegador (sem sincronizacao).', true);
      else mostrarToast('Sem servidor de sincronizacao e sem token do GitHub.', true);
      return;
    }
    lerRegistroFoto()
      .then(function (st) {
        if (st.obj[n] === u.trim()) return null;
        st.obj[n] = u.trim();
        return gravarRegistroFoto(st, 'foto de ' + n);
      })
      .then(function () {
        if (auto) mostrarToast('Foto aplicada e publicada para o time');
        else mostrarToast('Foto publicada.');
        carregarFotoMap(true);
      })
      .catch(function (e) {
        var msg = erroFoto(e);
        if (auto) mostrarToast('Foto aplicada, mas falhou ao publicar: ' + msg, true);
        else mostrarToast('Falha ao publicar: ' + msg, true);
      });
  }

  function removerFoto() {
    var n = norm(meuNome());
    try { localStorage.removeItem(FOTO_KEY); } catch (e) {}
    marcarFotoBloqueada(n, true);
    if (fotoMap && n) {
      try { delete fotoMap[n]; } catch (e) {}
      try { localStorage.setItem(FOTO_MAP_KEY, JSON.stringify(fotoMap)); } catch (e) {}
    }
    restaurarAvatares();
    atualizarHub();
    aplicarFotos();
    mostrarToast('Foto removida');
    if (!n || (!fotoServidor() && !fotoToken())) return;
    lerRegistroFoto()
      .then(function (st) {
        if (!Object.prototype.hasOwnProperty.call(st.obj, n)) return null;
        delete st.obj[n];
        return gravarRegistroFoto(st, 'remove foto de ' + n, true);
      })
      .then(function () {
        carregarFotoMap(true);
        mostrarToast('Foto removida aqui e no time');
      })
      .catch(function (e) {
        mostrarToast('Removida aqui, mas o time ainda ve: ' + erroFoto(e), true);
      });
  }

  var AVANC_KEY = 'walytechAvancado';
  var SEL_AVANC = ':root:root, .light.light, .dark.dark, [data-theme="light"][data-theme="light"], [data-theme="dark"][data-theme="dark"]';
  var AVANC_PARTS = [
    { grupo: 'Tema geral', desc: 'Cores base usadas por todo o app: botões, cards e textos.', nome: 'Cor principal', var: '--primary' },
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

  function avancExtraCss() {
    return '';
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
    var avSaved = avancSalvo();
    for (var avi = 0; avi < AVANC_PARTS.length; avi++) {
      var ap = AVANC_PARTS[avi];
      if (ap.grupo && ap.grupo !== avGroup) {
        avGroup = ap.grupo;
        avancRows += '<div class="waly-av-grupo">' + ap.grupo + '</div>';
        if (ap.desc) avancRows += '<div class="waly-av-desc">' + ap.desc + '</div>';
      }
      var avVal = avSaved[ap.var] || ap.pad || '#8b8b8b';
      avancRows += '<div class="waly-av-linha" data-var="' + ap.var + '">' +
        '<span class="waly-av-rot">' + ap.nome + '<i class="waly-av-hex">' + avVal.toUpperCase() + '</i></span>' +
        '<input type="color" class="waly-av-input" data-avcor="' + ap.var + '" value="' + avVal + '">' +
        '<button type="button" class="waly-av-x" data-avx="' + ap.var + '" title="Restaurar padrão">&#10005;</button></div>';
    }
    var notifC = notifLer();
    var notifFxBotoes = function (tp, sel) {
      var s = '';
      for (var fi = 1; fi <= 3; fi++) {
        s += '<button type="button" class="waly-tema-botao' + (String(sel) === String(fi) ? ' waly-sel' : '') + '" data-nfx="' + tp + '" data-fxv="' + fi + '">Efeito ' + fi + '</button>';
      }
      return s;
    };
    var notifIntBotoes = function (sel) {
      var s = '';
      var opc = [10, 15, 30, 60];
      for (var oi = 0; oi < opc.length; oi++) {
        s += '<button type="button" class="waly-tema-botao' + (sel === opc[oi] ? ' waly-sel' : '') + '" data-nint="' + opc[oi] + '">' + opc[oi] + 's</button>';
      }
      return s;
    };
    var notifMarkup =
      '<section class="waly-aba-section" data-walysec="notif">' +
      '<div class="waly-tema-etq">Pop de nova mensagem</div>' +
      '<div class="waly-av-anota">Sobe quando um cliente mandar mensagem nova pra você. Só fecha no X.</div>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-notif-msg"' + (notifC.msg ? ' checked' : '') + '> Pop ativo</label>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-notif-msg-som"' + (notifC.msgSom ? ' checked' : '') + '> Efeito sonoro</label>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-notif-msg-loop"' + (notifC.msgLoop ? ' checked' : '') + '> Loop do som</label>' +
      '<div class="waly-tema-botoes">' + notifFxBotoes('msg', notifC.msgFx) + '</div>' +
      '<label class="waly-rgb-linha">Volume <span class="waly-rgb-bval" id="waly-notif-msg-vol-val">' + notifC.msgVol + '%</span></label>' +
      '<input type="range" class="waly-rgb-range" id="waly-notif-msg-vol" min="0" max="100" step="5" value="' + notifC.msgVol + '">' +
      '<button type="button" class="waly-notif-test" data-ntest="msg">Testar pop e som</button>' +
      '<div class="waly-tema-etq">Pop de atendimentos pendentes</div>' +
      '<div class="waly-av-anota">Sobe quando a fila de pendentes aumenta, mostrando o total. Só fecha no X.</div>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-notif-pend"' + (notifC.pend ? ' checked' : '') + '> Pop ativo</label>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-notif-pend-som"' + (notifC.pendSom ? ' checked' : '') + '> Efeito sonoro</label>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-notif-pend-loop"' + (notifC.pendLoop ? ' checked' : '') + '> Loop do som</label>' +
      '<div class="waly-tema-botoes">' + notifFxBotoes('pend', notifC.pendFx) + '</div>' +
      '<label class="waly-rgb-linha">Volume <span class="waly-rgb-bval" id="waly-notif-pend-vol-val">' + notifC.pendVol + '%</span></label>' +
      '<input type="range" class="waly-rgb-range" id="waly-notif-pend-vol" min="0" max="100" step="5" value="' + notifC.pendVol + '">' +
      '<button type="button" class="waly-notif-test" data-ntest="pend">Testar pop e som</button>' +
      '<div class="waly-tema-etq">Verificar a cada</div>' +
      '<div class="waly-tema-botoes">' + notifIntBotoes(notifC.int) + '</div>' +
      '</section>';
    painel.innerHTML =
      '<div class="waly-rgb-topo"><span>Personalizar</span><button type="button" class="waly-rgb-x" aria-label="Fechar">&#10005;</button></div>' +
      '<div class="waly-rgb-abas">' +
      '<button type="button" class="waly-rgb-aba waly-aba-ativa" data-walyaba="cor">Cor</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="modo">Modo</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="luz">Luz</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="fundo">Fundo</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="foto">Foto</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="ata">Atalhos</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="avanc">Avançado</button>' +
      '<button type="button" class="waly-rgb-aba" data-walyaba="notif" title="Notificações">🔔</button>' +
      '</div>' +
      '<section class="waly-aba-section waly-vis" data-walysec="cor">' +
      '<div class="waly-tema-etq">Cor do tema</div>' +
      '<div class="waly-rgb-bolas">' + bolas + '</div>' +
      '<label class="waly-rgb-linha">Personalizar<input type="color" class="waly-rgb-input" value="' + corSalva() + '"></label>' +
      '<label class="waly-rgb-linha">Saturação <span class="waly-rgb-bval">' + textoBrilho(brilhoSalvo()) + '</span></label>' +
      '<input type="range" class="waly-rgb-range" min="' + BRILHO_MIN + '" max="' + BRILHO_MAX + '" step="1" value="' + brilhoSalvo() + '">' +
      '<button type="button" class="waly-rgb-reset">Restaurar cor padrão</button>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-topo-logo"' + (topoLogoEsconde() ? ' checked' : '') + '> Esconder logo e nome do whitelabel</label>' +
      '<div class="waly-brilho-desc">Barra do topo, tela inicial e tela de login.</div>' +
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
      '<label class="waly-rgb-linha">Opacidade <span class="waly-rgb-bval" id="waly-hub-bg-op-val"></span></label>' +
      '<input type="range" class="waly-rgb-range" id="waly-hub-bg-op-range" min="' + BGOP_MIN + '" max="' + BGOP_MAX + '" step="1">' +
      '<div class="waly-bg-acoes">' +
      '<button type="button" class="waly-rgb-reset" id="waly-hub-bg-trocar">Importar imagem</button>' +
      '<button type="button" class="waly-rgb-reset waly-bg-remover" id="waly-hub-bg-remover">Remover</button>' +
      '</div>' +
      '</section>' +
      '<section class="waly-aba-section" data-walysec="foto">' +
      '<div class="waly-tema-etq">Minha foto <span class="waly-bval" id="waly-hub-foto-quem"></span></div>' +
      '<div class="waly-foto-prevw"><img id="waly-hub-foto-prev" alt="Previa"></div>' +
      '<input type="text" class="waly-foto-input" id="waly-hub-foto-url" placeholder="Cole aqui o link da foto">' +
      '<div class="waly-bg-acoes">' +
      '<button type="button" class="waly-rgb-reset" id="waly-hub-foto-usar">Salvar foto</button>' +
      '<button type="button" class="waly-rgb-reset waly-bg-remover" id="waly-hub-foto-limpar">Remover</button>' +
      '</div>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-hub-foto-on"> Mostrar minha foto no app</label>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-hub-foto-colega"> Mostrar fotos dos colegas</label>' +
      '<div class="waly-av-anota" id="waly-hub-foto-sync"></div>' +
      '<div class="waly-bg-acoes">' +
      '<button type="button" class="waly-rgb-reset" id="waly-hub-foto-atualizar">Atualizar fotos do time</button>' +
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
      '<div class="waly-tema-etq">Sincronização das fotos</div>' +
      '<label class="waly-bg-ligado"><input type="checkbox" id="waly-hub-foto-mestra"> Aplicar fotos customizadas</label>' +
      '<div class="waly-av-anota">Interruptor único: desligar volta ao visual original do app, religar restaura as fotos do jeito que estavam, sem reconfigurar nada.</div>' +
      '<div class="waly-av-anota">Opcional: se o script já vier com um servidor, é só usar. Para trocar (ou desligar nesta máquina), use os campos abaixo.</div>' +
      '<input type="text" class="waly-foto-input" id="waly-hub-foto-srv" placeholder="URL do servidor (https://...)">' +
      '<input type="password" class="waly-foto-input" id="waly-hub-foto-chave" placeholder="Chave de escrita (se o servidor pedir)">' +
      '<div class="waly-bg-acoes">' +
      '<button type="button" class="waly-rgb-reset" id="waly-hub-foto-srv-ok">Salvar e testar</button>' +
      '<button type="button" class="waly-rgb-reset waly-bg-remover" id="waly-hub-foto-srv-off">Desligar</button>' +
      '</div>' +
      '<div class="waly-av-anota" id="waly-hub-foto-srv-st"></div>' +
      '</section>' +
      notifMarkup;
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
    painel.querySelector('#waly-topo-logo').addEventListener('change', function () {
      try { localStorage.setItem(TOPO_LOGO_KEY, this.checked ? '1' : '0'); } catch (e) {}
      topoLogoAplicar();
    });
    var nq = function (s) { return painel.querySelector(s); };
    function notifReflect() {
      var c2 = notifLer();
      nq('#waly-notif-msg').checked = c2.msg === 1;
      nq('#waly-notif-msg-som').checked = c2.msgSom === 1;
      nq('#waly-notif-msg-loop').checked = c2.msgLoop === 1;
      nq('#waly-notif-pend').checked = c2.pend === 1;
      nq('#waly-notif-pend-som').checked = c2.pendSom === 1;
      nq('#waly-notif-pend-loop').checked = c2.pendLoop === 1;
      nq('#waly-notif-msg-vol').value = c2.msgVol;
      nq('#waly-notif-pend-vol').value = c2.pendVol;
      nq('#waly-notif-msg-vol-val').textContent = c2.msgVol + '%';
      nq('#waly-notif-pend-vol-val').textContent = c2.pendVol + '%';
      painel.querySelectorAll('.waly-tema-botao[data-nfx]').forEach(function (b) {
        var alvo = b.getAttribute('data-nfx');
        var v = String(alvo === 'msg' ? c2.msgFx : c2.pendFx);
        b.classList.toggle('waly-sel', String(b.getAttribute('data-fxv')) === v);
      });
      painel.querySelectorAll('.waly-tema-botao[data-nint]').forEach(function (b) {
        b.classList.toggle('waly-sel', Number(b.getAttribute('data-nint')) === c2.int);
      });
    }
    nq('#waly-notif-msg').addEventListener('change', function () { var c2 = notifLer(); c2.msg = this.checked ? 1 : 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-msg-som').addEventListener('change', function () { var c2 = notifLer(); c2.msgSom = this.checked ? 1 : 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-msg-loop').addEventListener('change', function () { var c2 = notifLer(); c2.msgLoop = this.checked ? 1 : 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-msg-vol').addEventListener('input', function () { var c2 = notifLer(); c2.msgVol = parseInt(this.value, 10) || 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-pend').addEventListener('change', function () { var c2 = notifLer(); c2.pend = this.checked ? 1 : 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-pend-som').addEventListener('change', function () { var c2 = notifLer(); c2.pendSom = this.checked ? 1 : 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-pend-loop').addEventListener('change', function () { var c2 = notifLer(); c2.pendLoop = this.checked ? 1 : 0; notifGravar(c2); notifReflect(); });
    nq('#waly-notif-pend-vol').addEventListener('input', function () { var c2 = notifLer(); c2.pendVol = parseInt(this.value, 10) || 0; notifGravar(c2); notifReflect(); });
    painel.querySelectorAll('.waly-tema-botao[data-nfx]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c2 = notifLer();
        if (this.getAttribute('data-nfx') === 'msg') c2.msgFx = parseInt(this.getAttribute('data-fxv'), 10) || 1;
        else c2.pendFx = parseInt(this.getAttribute('data-fxv'), 10) || 1;
        notifGravar(c2);
        notifReflect();
      });
    });
    painel.querySelectorAll('.waly-tema-botao[data-nint]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c2 = notifLer();
        c2.int = parseInt(this.getAttribute('data-nint'), 10) || 15;
        notifGravar(c2);
        notifReflect();
      });
    });
    painel.querySelectorAll('.waly-notif-test').forEach(function (b) {
      b.addEventListener('click', function () {
        if (this.getAttribute('data-ntest') === 'pend') notifPop('pend', '3', 'atendimentos aguardando na fila', true);
        else notifPop('msg', 'TESTE MENSAGEM', 'mandou uma mensagem nova', true);
      });
    });
    notifReflect();
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
    var bgOpR = painel.querySelector('#waly-hub-bg-op-range');
    bgOpR.addEventListener('input', function () {
      try { localStorage.setItem(BGOP_KEY, this.value); } catch (e) {}
      atualizarHub();
      bgAtualizar();
    });
    painel.querySelector('#waly-hub-bg-trocar').addEventListener('click', function () { escolherImagem(); });
    painel.querySelector('#waly-hub-bg-remover').addEventListener('click', function () {
      try { localStorage.removeItem(BG_KEY); } catch (e) {}
      bgAtualizar();
      atualizarHub();
    });

    painel.querySelector('#waly-hub-foto-atualizar').addEventListener('click', function () {
      atualizarMapaTime(true);
      mostrarToast('Buscando fotos do time...');
    });
    painel.querySelector('#waly-hub-foto-usar').addEventListener('click', aplicarLinkFoto);
    painel.querySelector('#waly-hub-foto-url').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        aplicarLinkFoto();
      }
    });
    painel.querySelector('#waly-hub-foto-limpar').addEventListener('click', removerFoto);
    painel.querySelector('#waly-hub-foto-on').addEventListener('change', function () {
      try { localStorage.setItem(FOTO_ON_KEY, this.checked ? '1' : '0'); } catch (e) {}
      restaurarAvatares();
      aplicarFotos();
    });
    painel.querySelector('#waly-hub-foto-colega').addEventListener('change', function () {
      try { localStorage.setItem(FOTO_COLEGA_KEY, this.checked ? '1' : '0'); } catch (e) {}
      restaurarAvatares();
      aplicarFotos();
    });
    painel.querySelector('#waly-hub-foto-mestra').addEventListener('change', function () {
      try { localStorage.setItem(FOTO_MASTER_KEY, this.checked ? '1' : '0'); } catch (e) {}
      restaurarAvatares();
      aplicarFotos();
    });
    painel.querySelector('#waly-hub-foto-srv-ok').addEventListener('click', function () {
      var i1 = painel.querySelector('#waly-hub-foto-srv');
      var i2 = painel.querySelector('#waly-hub-foto-chave');
      var v = ((i1 && i1.value) || '').trim().replace(/\/+$/, '');
      var c = ((i2 && i2.value) || '').trim();
      if (v && !/^https:\/\/[^\s]+$/i.test(v)) {
        mostrarToast('URL invalida. Comece com https://', true);
        return;
      }
      try {
        if (v) localStorage.setItem(FOTO_SRV_KEY, v); else localStorage.removeItem(FOTO_SRV_KEY);
        if (c) localStorage.setItem(FOTO_SRV_CHAVE_KEY, c); else localStorage.removeItem(FOTO_SRV_CHAVE_KEY);
        localStorage.removeItem(FOTO_SRV_OFF_KEY);
      } catch (e) {}
      var st = painel.querySelector('#waly-hub-foto-srv-st');
      if (st) st.textContent = '';
      if (!fotoServidor()) {
        mostrarToast(fotoServidorDesligado() ? 'Sincronizacao desligada' : 'Nenhum servidor configurado');
        atualizarHub();
        return;
      }
      testarServidorFoto();
    });
    painel.querySelector('#waly-hub-foto-srv-off').addEventListener('click', function () {
      try {
        localStorage.removeItem(FOTO_SRV_KEY);
        localStorage.removeItem(FOTO_SRV_CHAVE_KEY);
        localStorage.setItem(FOTO_SRV_OFF_KEY, '1');
      } catch (e) {}
      var st = painel.querySelector('#waly-hub-foto-srv-st');
      if (st) st.textContent = '';
      mostrarToast('Sincronizacao desligada nesta maquina');
      atualizarHub();
    });

    painel.querySelector('#waly-teclas-reset').addEventListener('click', function () {
      try { localStorage.removeItem(TECLAS_KEY); } catch (e) {}
      atualizarPainelTeclas();
      mostrarToast('Atalhos restaurados');
    });

    function avPadDe(vn) {
      for (var i2 = 0; i2 < AVANC_PARTS.length; i2++) {
        if (AVANC_PARTS[i2].var === vn) return AVANC_PARTS[i2].pad || '#8b8b8b';
      }
      return '#8b8b8b';
    }
    function avPintarHex(vn, val) {
      var lin = painel.querySelector('.waly-av-linha[data-var="' + vn + '"]');
      if (!lin) return;
      var hx = lin.querySelector('.waly-av-hex');
      if (hx) hx.textContent = String(val || '').toUpperCase();
    }

    var avInps = painel.querySelectorAll('.waly-av-input');
    for (var vi = 0; vi < avInps.length; vi++) {
      avInps[vi].addEventListener('input', function () {
        var vn = this.getAttribute('data-avcor');
        var o = avancSalvo();
        o[vn] = this.value;
        try { localStorage.setItem(AVANC_KEY, JSON.stringify(o)); } catch (e) {}
        avPintarHex(vn, this.value);
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
        var pad = avPadDe(vn);
        var inp2 = painel.querySelector('.waly-av-input[data-avcor="' + vn + '"]');
        if (inp2) inp2.value = pad;
        avPintarHex(vn, pad);
        aplicarCor(corSalva(), false);
      });
    }
    painel.querySelector('#waly-av-reset').addEventListener('click', function () {
      try { localStorage.removeItem(AVANC_KEY); } catch (e) {}
      var aii = painel.querySelectorAll('.waly-av-input');
      for (var r2 = 0; r2 < aii.length; r2++) {
        var pad2 = avPadDe(aii[r2].getAttribute('data-avcor'));
        aii[r2].value = pad2;
        avPintarHex(aii[r2].getAttribute('data-avcor'), pad2);
      }
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
    if (nome === 'foto') atualizarMapaTime(false);
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
      var op = bgOpacidade();
      painel.querySelector('#waly-hub-bg-op-range').value = op;
      painel.querySelector('#waly-hub-bg-op-val').textContent = op + '%';
      painel.querySelector('#waly-hub-bg-on').checked = bgLigado();
      painel.querySelector('#waly-hub-bg-remover').style.display = img ? '' : 'none';
      painel.querySelector('#waly-hub-bg-trocar').textContent = img ? 'Trocar imagem' : 'Importar imagem';
    }
    var modo = modoApp();
    var mbs = painel.querySelectorAll('.waly-tema-botao[data-modo]');
    for (var mi2 = 0; mi2 < mbs.length; mi2++) mbs[mi2].classList.toggle('waly-sel', mbs[mi2].getAttribute('data-modo') === modo);
    var urlFoto = minhaFoto();
    var pv = painel.querySelector('#waly-hub-foto-prev');
    if (pv) {
      pv.parentNode.style.display = urlFoto ? 'block' : 'none';
      if (urlFoto) pv.src = urlFoto;
      painel.querySelector('#waly-hub-foto-quem').textContent = meuNome() ? norm(meuNome()) : '(sem usuario)';
      var inpF = painel.querySelector('#waly-hub-foto-url');
      if (document.activeElement !== inpF) inpF.value = urlFoto;
      painel.querySelector('#waly-hub-foto-on').checked = fotoLigada();
      painel.querySelector('#waly-hub-foto-colega').checked = colegasLigados();
      var mestra = painel.querySelector('#waly-hub-foto-mestra');
      if (mestra) mestra.checked = fotosMestrasLigadas();
      var temMinha = !!urlFoto || !!mapaFotos()[norm(meuNome())];
      painel.querySelector('#waly-hub-foto-limpar').style.display = temMinha ? '' : 'none';
      var sy = painel.querySelector('#waly-hub-foto-sync');
      if (sy) sy.textContent = 'Publica para o time: ' + fotoSyncTexto();
    }
    var srvI = painel.querySelector('#waly-hub-foto-srv');
    if (srvI) {
      if (document.activeElement !== srvI) srvI.value = fotoServidor();
      var chI = painel.querySelector('#waly-hub-foto-chave');
      if (chI && document.activeElement !== chI) chI.value = fotoChave();
      var stI = painel.querySelector('#waly-hub-foto-srv-st');
      if (stI && !stI.textContent) stI.textContent = 'Estado: ' + fotoSyncTexto() + '.';
    }
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
      mostrarAba(abaAtiva);
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

  function bgOpacidade() {
    try {
      var v = parseFloat(localStorage.getItem(BGOP_KEY));
      if (isNaN(v)) return BGOP_MAX;
      return Math.max(BGOP_MIN, Math.min(BGOP_MAX, v));
    } catch (e) { return BGOP_MAX; }
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
    raiz.style.setProperty('--waly-bg-opacidade', (bgOpacidade() / 100).toFixed(3));
    var b = bgBrilho();
    var alfa = Math.abs(b) / 100 * 0.6;
    raiz.style.setProperty('--waly-bg-shade', b >= 0 ? 'rgba(255,255,255,' + alfa.toFixed(3) + ')' : 'rgba(0,0,0,' + alfa.toFixed(3) + ')');
  }

  function processarImagem(file, cb, qualidade, maxDim) {
    qualidade = qualidade || 0.9;
    maxDim = maxDim || 1920;
    var fr = new FileReader();
    fr.onerror = function () { cb(null); };
    fr.onload = function () {
      var img = new Image();
      img.onerror = function () { cb(null); };
      img.onload = function () {
        var esc = Math.max(img.width, img.height) > maxDim ? maxDim / Math.max(img.width, img.height) : 1;
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * esc));
        c.height = Math.max(1, Math.round(img.height * esc));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/jpeg', qualidade);
        console.log('[walytech] imagem processada:', c.width + 'x' + c.height, 'q=' + qualidade, 'tamanho:', Math.round(url.length / 1024) + 'KB');
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
        function tentar(qualidade, maxDim) {
          processarImagem(f, function (url) {
            if (!url) {
              alert('Não foi possível carregar a imagem.');
              return;
            }
            try { localStorage.removeItem(BG_KEY); } catch (e) {}
            try {
              localStorage.setItem(BG_KEY, url);
              localStorage.setItem(BG_ON_KEY, '1');
            } catch (e) {
              // Tentar com qualidade mais baixa ou resolução menor
              if (qualidade > 0.5) {
                tentar(qualidade - 0.2, maxDim);
              } else if (maxDim > 640) {
                tentar(0.9, Math.round(maxDim * 0.7));
              } else {
                alert('Imagem muito grande para salvar neste navegador (' + Math.round(url.length / 1024) + 'KB). Escolha uma imagem menor.');
              }
              return;
            }
            bgAtualizar();
            atualizarHub();
            mostrarToast('Fundo atualizado: ' + Math.round(url.length / 1024) + 'KB (q=' + qualidade + ')');
          }, qualidade, maxDim);
        }
        tentar(0.9, 1920);
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

  var SK_VERSION = '2.8.11';
  var UPDATE_URL = 'https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js?v=2.8.11';

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
      fetch(UPDATE_URL + '&t=' + Date.now(), { cache: 'no-store' })
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
      fetch(UPDATE_URL + '&t=' + Date.now(), { cache: 'no-store' })
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
            window.location.href = UPDATE_URL + '&t=' + Date.now();
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

  var NOTIF_KEY = 'walytechNotif';
  var NOTIF_DEF = { msg: 1, msgSom: 0, msgLoop: 1, msgFx: 1, msgVol: 80, pend: 1, pendSom: 0, pendLoop: 1, pendFx: 1, pendVol: 80, int: 15 };
  var NOTIF_FX = {
    '1': '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5mbDyCUi5y1eLIW9COQg+y3psqWNzBbanxV4uTj0dPrl1iEIGpMW6ksGkmc8vmJstAqBY9ViXfu6C4AYOGB8BLOB0ySIuTx/GNTX+qq1SLGN/6/ocsWSz7/RyCNdSEgADDet15qWN3U1FF5PxGhD4We77yFruLXVppxUiFxOJrUb/OJIm6ayCx5EWgDFBwk1V/URy6F7SeoTWWzvdJ70r9pga03iUDzImrmHxLa4c2kaSea+fpvbXJHnOh6i/NNrqZr20opNHvOs3GrWt3cpMPUpcx3V2mtexrXOo80CJu0zW1Ue0YHota3o2Md7aGxCPRAg5pnoCzIoKiiTef7KLtu71qsv83QtAvHW0CyjAL4nN3p3S4KqVuFu+329Go3/+5JkYIAENWFCFWlgAjCAGHGgAAAcAZlHucqAEkazLHc1AIIEYDAn+0JvACmT0/9o1H0w0RzpJLFhd+ZAAnNOdw0ycSsYIssDZ6lAwWVrpEcLEG2AaIGABpcAz4WkXUsi46RP5AAMiBADZh8AxADwMiiVNM80WYNguityJBf0DDorAsIwMcisAoLfmBMGiaZYAYBgFgkBhQMAHCADEwYC7f5oTiJuV1ICCYdgBIBDYwAgOJkMh/0G9luLGISDIB8g7C+LALPGn///4lMd5oLGOQOAUAOBYpQdf////4nMNXiP1BdWK4JwEBBBA8F1AtYpcUGIJ////+XIBABBcaDUejUWiQCAQC/7W3ebmuv/lnHneT/t4HDrnJK4vhPgNnxtcXOLLHcHqCZhZzxHglAmRxiDAbaC2jj+RdM8eYYAgOLGGJyF/TL6SBomTg0xCQaAfIPH91/TKhNlcg5uh//+VyYKhFDRMnDM3///8i5vK5gaFw0k4Z/////k+Rcn3HGUCcJgnGHAUyfJsn0DTSSSQBOA/PA3gy6krFcDVT8JQALw//uSRAsAAxVWVS5FQABYBmpFzagAAAABpBwAACAAADSDgAAEngLC2vwKJCCyKn+FyNAukC6/8fiCLiqeKv/48FUsKzCsT//4rFxVchJCElIv//zSIuRExCcQliEl///8iNIi5ETEJymkJKUCX//BoKgDSAAAGnzByrtDM5/mhhANAK+P+jkvnn/4FIB1eGoEoUv4Sh6IIb/4rEwqnEP/liElIjSL/9yImITjW//yE0iBYDAz/wqAQkEgMe/9YVGhIJDgqFf/+NCSTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==',
    '2': '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xPN6M8IsoZzwAPmASA+YD4BAYDsYDQCyCUOA0EYD4kBWYFIBZgQANBwCosDCYC4AatYAALLyrMBIACaS4gQASXlUQAoAyNy3/////////BQBY0CcYAABAYBYTAoAEA8wEwCzAnAFMAgBwwGgEAgHQwHQL2xgoHYeBMMBYB0GABporhBoAiRyrgQASX1SZAIBwXACSjAAA6E1fhcL//////////wcByHABGA2BWYE4A5gMATCAAUwCgGjAfANMBEBIaBCMAABRjA0BgYBYAYFAEAIA4gAaSoBwEAFANRjZE1IGACl5VaAaAAmkx8KAAqqtAL3LSb9L1kLeoClpNSQxUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zwsQAAAADSAHAAABMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/88LEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//PCxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zwsQAAAADSAAAAABMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVJRDMDAAAAAAE8VElUMgAAADMAAABNdWRhIHZveiBjb20gZWZlaXRvcyAtIGh0dHBzOi8vdGhldm9pY2VjaGFuZ2VyLmNvbVRQRTEAAAAzAAAATXVkYSB2b3ogY29tIGVmZWl0b3MgLSBodHRwczovL3RoZXZvaWNlY2hhbmdlci5jb21UU1NFAAAADgAAAExhdmY1OC40Mi4xMDBDT01NAAAAIAAAAAAAAABodHRwczovL3RoZXZvaWNlY2hhbmdlci5jb21UQUdNdWRhIHZveiBjb20gZWZlaXRvcyAtIGh0dHBzOi9NdWRhIHZveiBjb20gZWZlaXRvcyAtIGh0dHBzOi8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaHR0cHM6Ly90aGV2b2ljZWNoYW5nZXIuY29tAAAAAA==',
    '3': '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'
  };

  function notifLer() {
    var c = null;
    try { c = JSON.parse(localStorage.getItem(NOTIF_KEY) || 'null'); } catch (e) { c = null; }
    var r = {};
    for (var k in NOTIF_DEF) {
      var v = c ? c[k] : undefined;
      r[k] = (typeof v === 'number' && v === v) ? v : NOTIF_DEF[k];
    }
    return r;
  }

  function notifGravar(c) {
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(c)); } catch (e) {}
  }

  var notifSomAtual = null;
  var notifSomDono = null;

  function notifSom(tipo, forcar, dono) {
    try {
      var c = notifLer();
      var ligado = tipo === 'msg' ? c.msgSom : c.pendSom;
      if (!ligado && !forcar) return;
      var b64 = NOTIF_FX[String(tipo === 'msg' ? c.msgFx : c.pendFx)];
      if (!b64) return;
      var a = new Audio('data:audio/mpeg;base64,' + b64);
      a.loop = (tipo === 'msg' ? c.msgLoop : c.pendLoop) === 1;
      a.volume = Math.max(0, Math.min(1, (tipo === 'msg' ? c.msgVol : c.pendVol) / 100));
      try { if (notifSomAtual) { notifSomAtual.pause(); notifSomAtual.currentTime = 0; } } catch (e2) {}
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      notifSomAtual = a;
      notifSomDono = dono || null;
      return a;
    } catch (e) {
      return null;
    }
  }

  function notifPop(tipo, nome, sub, forcar) {
    try {
      var c = notifLer();
      var ativo = tipo === 'msg' ? c.msg : c.pend;
      if (!ativo && !forcar) return;
      var wrap = document.getElementById('walytech-pop-wrap');
      if (!wrap || !wrap.isConnected) {
        wrap = document.createElement('div');
        wrap.id = 'walytech-pop-wrap';
        document.body.appendChild(wrap);
      }
      var p = document.createElement('div');
      p.className = 'walytech-pop';
      p.setAttribute('data-tipo', tipo);
      p.innerHTML =
        '<div class="walytech-pop-titulo">' + (tipo === 'msg' ? '💬 Nova mensagem de cliente' : '📋 Atendimento pendente') + '</div>' +
        '<div class="walytech-pop-nome"></div>' +
        '<div class="walytech-pop-sub"></div>' +
        '<button type="button" class="walytech-pop-x" aria-label="Fechar pop">&#10005;</button>';
      p.querySelector('.walytech-pop-nome').textContent = nome;
      p.querySelector('.walytech-pop-sub').textContent = sub || '';
      var somA = notifSom(tipo, forcar, p);
      p._som = somA;
      p.querySelector('.walytech-pop-x').addEventListener('click', function () {
        try { if (p._som && notifSomDono === p) { p._som.pause(); p._som.currentTime = 0; } } catch (e) {}
        p.classList.add('walytech-pop-sair');
        setTimeout(function () {
          try { p.remove(); } catch (e) {}
          try {
            if (notifSomDono === p) {
              notifSomAtual = null;
              notifSomDono = null;
              var rest = document.querySelectorAll('#walytech-pop-wrap .walytech-pop');
              var alvo = null;
              for (var rr = 0; rr < rest.length; rr++) {
                if (rest[rr]._som) { alvo = rest[rr]; break; }
              }
              if (alvo) {
                try { alvo._som.currentTime = 0; } catch (e2) {}
                var pr = alvo._som.play();
                if (pr && pr.catch) pr.catch(function () {});
                notifSomAtual = alvo._som;
                notifSomDono = alvo;
              }
            }
          } catch (e) {}
        }, 190);
      });
      wrap.appendChild(p);
    } catch (e) {}
  }

  function notifJaPop(tipo, nome) {
    var w = document.getElementById('walytech-pop-wrap');
    if (!w || !w.isConnected) return false;
    var ps = w.querySelectorAll('.walytech-pop');
    for (var i = 0; i < ps.length; i++) {
      var el = ps[i];
      var tx = el.querySelector('.walytech-pop-nome');
      if (el.getAttribute('data-tipo') === tipo && tx && tx.textContent === nome) return true;
    }
    return false;
  }

  function notifChamada(caminho) {
    try {
      var tok = lerNgToken();
      if (!tok) return Promise.resolve(null);
      var h = {
        'Authorization': 'Bearer ' + tok,
        'Domain': location.hostname || '',
        'Accept-Language': localStorage.getItem('lang') || 'pt-BR'
      };
      var tid = lerTenantId();
      if (tid) h['x-tenant-id'] = tid;
      return fetch(caminho, { headers: h, credentials: 'include', cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .catch(function () { return null; });
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  var notifVistos = null;
  var notifPendUlt = -1;
  var notifUltTic = 0;
  var notifBusy = false;

  function notifCiclo(forcar) {
    try {
      if (notifBusy) return;
      var c = notifLer();
      if (!c.msg && !c.pend) {
        notifVistos = null;
        notifPendUlt = -1;
        return;
      }
      var passo = Math.max(5, c.int) * 1000;
      var agora = Date.now();
      if (!forcar && notifUltTic && agora - notifUltTic < passo) return;
      notifUltTic = agora;
      notifBusy = true;
      var ped1 = c.msg ? notifChamada('/api/atendimentos/chat/ativos?limit=100&orderByAsc=true&apenasTotal=false&apenasNovasMensagens=true&offset=0') : Promise.resolve(null);
      var ped2 = c.pend ? notifChamada('/api/atendimentos/chat/pendentes?limit=1&orderByAsc=true&apenasTotal=true&offset=0') : Promise.resolve(null);
      Promise.all([ped1, ped2]).then(function (rs) {
        notifBusy = false;
        if (rs[0] && c.msg) {
          var f = rs[0];
          var linhas = Array.isArray(f) ? f : (f && Array.isArray(f.registros) ? f.registros : []);
          var prox = {};
          var fogo = [];
          for (var i = 0; i < linhas.length; i++) {
            var l = linhas[i] || {};
            var id = String(l.id != null ? l.id : (l.uuid || ''));
            if (!id) continue;
            var nv = parseInt(l.mensagensNaoVisualizadas, 10) || 0;
            prox[id] = nv;
            if (notifVistos !== null) {
              var ant = notifVistos[id];
              if (ant == null || nv > ant) fogo.push(l);
            }
          }
          notifVistos = prox;
          for (var g = 0; g < Math.min(fogo.length, 3); g++) {
            var nCliente = String(fogo[g].nome || fogo[g].usuario || fogo[g].apelido || fogo[g].contatoNome || 'Cliente');
            if (!notifJaPop('msg', nCliente)) notifPop('msg', nCliente, 'mandou uma mensagem nova', false);
          }
        }
        if (rs[1] && c.pend) {
          var j = rs[1];
          var tt = -1;
          if (j && typeof j.total === 'number') tt = j.total;
          else if (Array.isArray(j)) tt = j.length;
          else if (j && j.registros && typeof j.registros.total === 'number') tt = j.registros.total;
          else if (j && Array.isArray(j.registros)) tt = j.registros.length;
          if (tt >= 0) {
            if (notifPendUlt >= 0 && tt > notifPendUlt) {
              notifPop('pend', String(tt), tt === 1 ? 'atendimento aguardando na fila' : 'atendimentos aguardando na fila', false);
            }
            notifPendUlt = tt;
          }
        }
      }).catch(function () { notifBusy = false; });
    } catch (e) {
      notifBusy = false;
    }
  }

  window.__walytNotifTest = function (tipo) {
    if (tipo === 'rodar') {
      notifCiclo(true);
      return;
    }
    if (tipo === 'pend') {
      notifPop('pend', '3', 'atendimentos aguardando na fila', true);
      return;
    }
    notifPop('msg', 'TESTE MENSAGEM', 'mandou uma mensagem nova', true);
  };

  window.__walytNotifDebug = function () {
    console.log('[walytech] notif cfg:', JSON.stringify(notifLer()));
    console.log('[walytech] notif vistos:', notifVistos ? Object.keys(notifVistos).length : 0, '| pendentes conhecidos:', notifPendUlt);
    console.log('[walytech] notif consulta a cada', Math.max(5, notifLer().int), 's (tick de 1s)');
  };

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
    { id: 'transferir', rot: 'Transferir', padrao: 'ctrl+alt+t', tipo: 'nativo', alvo: 'Transferir' },
    { id: 'fechar', rot: 'Fechar conversa', padrao: 'ctrl+shift+x', tipo: 'nativo', alvo: 'Fechar conversa' },
    { id: 'naolidi', rot: 'Marcar como Não Lido', padrao: 'ctrl+shift+u', tipo: 'menu', alvo: 'Marcar como Não Lido' },
    { id: 'pesquisar', rot: 'Pesquisar na conversa', padrao: 'ctrl+shift+p', tipo: 'nativo2', alvo: 'pesquisar' },
    { id: 'tags', rot: 'Adicionar Tag', padrao: 'ctrl+shift+g', tipo: 'nativo2', alvo: 'tags' },
    { id: 'soltar', rot: 'Soltar chat', padrao: 'ctrl+alt+s', tipo: 'nativo2', alvo: 'soltar' },
    { id: 'detalhes', rot: 'Detalhes do contato', padrao: 'ctrl+alt+i', tipo: 'nativo2', alvo: 'detalhes' },
    { id: 'atualizar', rot: 'Atualizar tickets', padrao: 'ctrl+alt+a', tipo: 'atualizar' }
  ];

  var ATALHOS_RESERVADOS = ['ctrl+t', 'ctrl+w', 'ctrl+n', 'ctrl+shift+t', 'ctrl+shift+w', 'ctrl+shift+n', 'ctrl+shift+i', 'ctrl+shift+o', 'ctrl+shift+s', 'ctrl+tab', 'ctrl+shift+tab'];

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
      var listaB = Array.prototype.slice.call(document.querySelectorAll('[aria-label="' + item.alvo + '"]'));
      var h = getHeader();
      if (h) {
        var noH = [];
        var fora = [];
        for (var iG = 0; iG < listaB.length; iG++) (h.contains(listaB[iG]) ? noH : fora).push(listaB[iG]);
        listaB = noH.concat(fora);
      }
      for (var iH = 0; iH < listaB.length; iH++) {
        if (ehNossoDOM(listaB[iH]) || botaoInvisivel(listaB[iH])) continue;
        try { listaB[iH].click(); } catch (e) {}
        return;
      }
      for (var iJ = 0; iJ < listaB.length; iJ++) {
        if (ehNossoDOM(listaB[iJ])) continue;
        try { listaB[iJ].click(); } catch (e) {}
        break;
      }
      if (listaB.length === 0) mostrarToast('Ação indisponível neste momento.', true);
      return;
    }
    if (item.tipo === 'menu') {
      var h2 = getHeader();
      if (!h2) return;
      var trs2 = h2.querySelectorAll('button[aria-haspopup="menu"]');
      var btn3 = trs2.length ? trs2[trs2.length - 1] : null;
      if (btn3) { try { btn3.click(); } catch (e) {} }
      setTimeout(function () {
        var menus = document.querySelectorAll('[role="menu"][data-state="open"] [role="menuitem"]');
        var achou = false;
        for (var i = 0; i < menus.length; i++) {
          if (norm(menus[i].textContent) === norm(item.alvo)) {
            try { menus[i].click(); } catch (e) {}
            achou = true;
            return;
          }
        }
        if (!achou) mostrarToast('Ação indisponível neste momento.', true);
      }, 120);
      return;
    }
    if (item.tipo === 'nativo2') {
      var scopes2 = [];
      var h3 = getHeader();
      if (h3) scopes2.push(h3);
      scopes2.push(document);
      var achou2 = false;
      for (var si = 0; si < scopes2.length && !achou2; si++) {
        var btns = scopes2[si].querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var b = btns[i];
          if (ehNossoDOM(b)) continue;
          if (botaoInvisivel(b)) continue;
          if (b.getAttribute('aria-haspopup') === 'menu') continue;
          var la = norm(b.getAttribute('aria-label') || '');
          var match = (item.alvo === 'pesquisar' && /pesquis|search|buscar/.test(la)) ||
                      (item.alvo === 'tags' && /tag|etiqueta/.test(la)) ||
                      (item.alvo === 'soltar' && /soltar/.test(la)) ||
                      (item.alvo === 'detalhes' && /detalhe/.test(la));
          if (match) { try { b.click(); } catch (e) {} achou2 = true; return; }
        }
      }
      if (!achou2) mostrarToast('Ação indisponível neste momento.', true);
      return;
    }
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
      if (ATALHOS_RESERVADOS.indexOf(cb) !== -1) {
        gravandoTecla = null;
        atualizarPainelTeclas();
        mostrarToast('Esse atalho é reservado do navegador. Grave outro.', true);
        return;
      }
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
    loopLink();
    loopNaoLidas();
    loopStatusRodape();
    loopRgb();
    loopFundo();
    loopTimer();
    loopBrilho();
    loopNota();
    loopFoto();
    checarAtualizacao();
    fiscalizarToast();
    notifCiclo();
  }

  aplicarCor(corSalva(), false);
  brilhoAplicar();
  topoLogoAplicar();

  setInterval(tick, 1000);
  var tickAgendado = false;
  function agendarTick() {
    if (tickAgendado) return;
    tickAgendado = true;
    setTimeout(function () {
      tickAgendado = false;
      tick();
    }, 250);
  }
  new MutationObserver(function (muts) {
    for (var m = 0; m < muts.length; m++) {
      var alvo = muts[m].target;
      if (alvo && alvo.nodeType === 1 && ehNossoDOM(alvo)) continue;
      if (!alvo && muts[m].addedNodes.length && muts[m].addedNodes[0].nodeType === 1 && ehNossoDOM(muts[m].addedNodes[0])) continue;
      agendarTick();
      return;
    }
  }).observe(document.body, { childList: true, subtree: true });
  tick();

  window.__walytFotoDebug = function () {
    console.log('[walytech] meu nome (aria-label do botao de usuario):', meuNome() || '(nao detectado)');
    console.log('[walytech] minha foto:', minhaFoto() || '(nenhuma)');
    console.log('[walytech] aplicar minha foto:', fotoLigada());
    console.log('[walytech] aplicar fotos dos colegas:', colegasLigados());
    console.log('[walytech] token do GitHub:', tokenEmbedido() ? 'embutido no script' : (fotoToken() ? 'salvo no localStorage' : 'ausente'));
    console.log('[walytech] sincronizacao:', fotoSync(), '-', fotoSyncTexto());
    console.log('[walytech] servidor:', fotoServidor() || '(nenhum)', fotoServidorPadrao() ? '(predefinido no script)' : (fotoServidorDesligado() ? '(desligado nesta maquina)' : '(so nesta maquina)'));
    console.log('[walytech] chave de escrita:', fotoChave() ? 'definida' : 'vazia (so leitura)');
    console.log('[walytech] sincronizacao desligada nesta maquina:', fotoServidorDesligado());
    console.log('[walytech] fotos removidas (bloqueadas):', JSON.stringify(fotoBloqueados()));
    console.log('[walytech] links de foto que nao carregaram:', JSON.stringify(fotosQuebradas));
    console.log('[walytech] registro lido de:', fotoServidor() ? srvUrl() : FOTO_RAW);
    var m = mapaFotos();
    console.log('[walytech] mapa em uso (' + Object.keys(m).length + '):', JSON.stringify(m).slice(0, 700));
    console.log('[walytech] chats lidos da API:', chatLista.length, chatLista.slice(0, 30).map(function (c) { return c.nome + (c.url ? ' [foto]' : ' [sem foto]'); }).join(' | '));
    var nosso = {};
    try { nosso = JSON.parse(localStorage.getItem(FOTO_CHAT_NOSSO_KEY) || '{}') || {}; } catch (e) {}
    console.log('[walytech] gravado no cache do app (' + FOTO_CHAT_CACHE_KEY + '):', JSON.stringify(nosso).slice(0, 700));
    console.log('[walytech] avatares marcados no DOM:', document.querySelectorAll('[data-walytech-foto]').length);
    console.log('[walytech] fotos injetadas no DOM:', document.querySelectorAll('img[data-walytech-foto-inj]').length);
    console.log('[walytech] linha para publicar:', linhaFoto() || '(defina o link)');
    carregarFotoMap(true);
    carregarChats(true);
  };

  window.__walytDebug = function () {
    var h = getHeader();
    console.log('[walytech] header:', h ? 'sim' : 'nao');
    if (h) {
      var botoes = h.querySelectorAll('button');
      var lista = [];
      botoes.forEach(function (b) {
        var marca = botaoInvisivel(b) ? '[medicao] ' : (b.style.display === 'none' ? '[oculto] ' : '');
        lista.push(marca + (b.getAttribute('aria-label') || '(sem rotulo)'));
      });
      console.log('[walytech] botoes do header:', lista.length ? lista.join(' | ') : '(nenhum)');
    }
    var chips = document.querySelectorAll('button.rounded-full');
    var ver = [];
    chips.forEach(function (c) {
      ver.push((c.getAttribute('data-walytech-nl') ? '[VERDE] ' : '') + (c.textContent || '').trim().slice(0, 20));
    });
    console.log('[walytech] chips arredondados:', ver.length ? ver.join(' | ') : '(nenhum)');
  };

  window.__walytTest = function (nome) {
    console.log('[walytech] teste:', nome);
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
    var h = getHeader();
    if (!h) {
      console.log('[walytech] header NAO encontrado');
      return;
    }
    var btn3 = h.querySelector('button[aria-haspopup="menu"]');
    if (!btn3) {
      console.log('[walytech] botao de menu do header NAO encontrado');
      return;
    }
    console.log('[walytech] abrindo menu do header para inspecao...');
    try { btn3.click(); } catch (e) {}
    var tentativas = 0;
    var timer = setInterval(function () {
      tentativas++;
      var menus = document.querySelectorAll('[role="menu"][data-state="open"]');
      if (menus.length > 0 || tentativas >= 30) {
        clearInterval(timer);
        var itens = [];
        menus.forEach(function (m) {
          m.querySelectorAll('[role="menuitem"]').forEach(function (i) {
            itens.push('"' + i.textContent.trim() + '"');
          });
        });
        console.log('[walytech] itens do menu:', itens.length ? itens.join(', ') : '(nenhum)');
        try { btn3.click(); } catch (e) {}
        console.log('[walytech] menu inspecionado e fechado.');
      }
    }, 100);
  };

  window.__walytDebug = function () {
    console.log('[walytech] debug helper disponivel.');
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
