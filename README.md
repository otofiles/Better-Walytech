# Better Walytech

Userscript (Tampermonkey) que melhora o Wadology/Zappro Walytech (https://walyzappro.walytech.com.br).

## Instalação

1. Instale a extensão Tampermonkey no seu navegador.
2. Abra o link de instalação: https://raw.githubusercontent.com/otofiles/Better-Walytech/main/walytech-menu-v2.user.js
3. Confirme a instalação. A partir daí o script se atualiza sozinho (Tampermonkey checa a versão via `@updateURL`).

## Uso

- Lápis no header: painel de configurações (cor, modo claro/escuro, luz, fundo, atalhos, cores avançadas).
- Relógio no header: atualização automática da lista de tickets.
- Atalhos de teclado configuráveis (Aba Atalhos) para finalizar/transferir/soltar/etc.
- Estrelinha com a avaliação média ao lado do usuário no header global.

Debug no console: `__walytDebug()`, `__walytRgbDebug()`, `__walytTeclasDebug()`, `__walytNotaDebug()`, `__walytUpdateDebug()`.