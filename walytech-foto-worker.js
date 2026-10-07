/*
  Servidor de sincronizacao das fotos do Better walytech.
  Contrato usado pelo script (hub do lapis > Avancado > Sincronizacao das fotos):
    GET  {base}/avatares.json   -> { "nome": "https://link-da-foto.jpg", ... }
    PUT  {base}/avatares.json   -> body: o objeto inteiro; header X-Waly-Key: <chave>
    PUT  {base}/avatares.json?substituir=1 -> substitui o registro inteiro (usado no Remover)
    GET  {base}/diagnostico     -> { temChave, temOrigens, origemAceita, temKv } (sem valores)
  Seguranca: com ORIGENS configurado, so quem vem de um dominio autorizado le e escreve.
  Sem CHAVE configurada nenhuma escrita e aceita (porta fechada por padrao).

  Este worker JA ESTA NO AR em https://better-walytech-fotos.otoni-luizg.workers.dev
  Publicar mudancas (deploy manda codigo + variaveis juntos, sem "esqueci de deploy"):
    npx wrangler login
    npx wrangler deploy
  Mudar a chave de escrita:
    "NOVA_CHAVE" | npx wrangler secret put CHAVE
    (lembre de atualizar FOTO_SRV_CHAVE no script e republicar)

  Antes (painel, nao recomendado) era: Create Worker -> colar o codigo -> Settings/Bindings
  (KV namespace "fotos" na variavel FOTOS) -> Variables and Secrets (CHAVE = Secret,
  ORIGENS = https://walyzappro.walytech.com.br) -> Deploy.
  O ID do namespace (60b7c43a68854455967d934e318f2498) e o nome do Worker ficam no wrangler.jsonc.
*/

const LIMITE_BYTES = 20000;

function origemLiberada(req, env) {
  const origem = req.headers.get('Origin') || '';
  const lista = String((env && env.ORIGENS) || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (lista.indexOf('*') >= 0 || lista.length === 0) return origem || '*';
  return lista.indexOf(origem) >= 0 ? origem : null;
}

function origemPermitida(req, env) {
  const origem = req.headers.get('Origin') || '';
  const lista = String((env && env.ORIGENS) || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!lista.length) return false;
  return lista.indexOf('*') >= 0 || lista.indexOf(origem) >= 0;
}

function chaveCerta(req, env) {
  const esperada = String((env && env.CHAVE) || '').trim();
  if (!esperada) return false;
  return (req.headers.get('X-Waly-Key') || '').trim() === esperada;
}

function json(req, env, data, status) {
  const origem = origemLiberada(req, env);
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
  if (origem) headers['Access-Control-Allow-Origin'] = origem;
  headers['Vary'] = 'Origin';
  return new Response(JSON.stringify(data), { status: status || 200, headers });
}

function erro(req, env, status, mensagem) {
  return json(req, env, { message: mensagem }, status);
}

function limpar(obj) {
  const saida = {};
  const chaves = Object.keys(obj || {});
  for (let i = 0; i < chaves.length; i++) {
    const nome = String(chaves[i]).slice(0, 80).trim();
    const valor = obj[chaves[i]];
    if (!nome || typeof valor !== 'string') continue;
    const u = valor.trim();
    if (!/^https?:\/\/\S+$/i.test(u)) continue;
    saida[nome] = u;
  }
  return saida;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origem = origemLiberada(req, env);
    if (!origem) return erro(req, env, 403, 'origem nao autorizada');
    if (!env || !env.FOTOS) return erro(req, env, 500, 'binding FOTOS (namespace KV) nao configurado');

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origem,
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Waly-Key',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin'
        }
      });
    }

    if (url.pathname === '/diagnostico') {
      return json(req, env, {
        temChave: !!String((env && env.CHAVE) || '').trim(),
        temOrigens: !!String((env && env.ORIGENS) || '').trim(),
        origemAceita: origemPermitida(req, env),
        temKv: !!(env && env.FOTOS)
      }, 200);
    }

    if (url.pathname === '/' || url.pathname === '/avatares.json') {
      if (req.method === 'GET') {
        const atual = (await env.FOTOS.get('avatares', 'json')) || {};
        return json(req, env, limpar(atual), 200);
      }
      if (req.method === 'PUT') {
        if (!chaveCerta(req, env)) return erro(req, env, 401, 'chave invalida ou CHAVE nao configurada');
        if (!origemPermitida(req, env)) return erro(req, env, 403, 'origem nao autorizada');
        const texto = await req.text();
        if (texto.length > LIMITE_BYTES) return erro(req, env, 413, 'registro grande demais');
        let novo;
        try {
          novo = JSON.parse(texto);
        } catch (e) {
          return erro(req, env, 400, 'json invalido');
        }
        if (!novo || typeof novo !== 'object' || Array.isArray(novo)) return erro(req, env, 400, 'json invalido');
        const atual = (await env.FOTOS.get('avatares', 'json')) || {};
        const substituir = url.searchParams.get('substituir') === '1';
        const merged = limpar(substituir ? novo : Object.assign({}, atual, novo));
        await env.FOTOS.put('avatares', JSON.stringify(merged));
        return json(req, env, merged, 200);
      }
      return erro(req, env, 405, 'metodo nao permitido');
    }

    return erro(req, env, 404, 'nao encontrado');
  }
};