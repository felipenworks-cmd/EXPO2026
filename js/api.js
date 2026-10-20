// ============================================================
// api.js — funções auxiliares para conversar com o backend
// ============================================================
// Todas as páginas usam este arquivo para não repetir código
// de fetch() em todo lugar.
// ============================================================

const API_BASE = '/api';

/**
 * Faz uma requisição à API e já trata erros de forma padronizada.
 * @param {string} caminho - ex: '/businesses'
 * @param {object} opcoes - opções do fetch (method, body, etc.)
 */
async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(API_BASE + caminho, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes
  });

  let dados = null;
  try { dados = await resposta.json(); } catch (e) { /* resposta sem corpo JSON */ }

  if (!resposta.ok) {
    const mensagem = (dados && (dados.erro || (dados.detalhes && dados.detalhes.join(' ')))) || 'Ocorreu um erro inesperado.';
    throw new Error(mensagem);
  }
  return dados;
}

const Api = {
  listarNegocios: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return chamarApi(`/businesses${query ? '?' + query : ''}`);
  },
  buscarNegocio: (id) => chamarApi(`/businesses/${id}`),
  cadastrarNegocio: (dados) => chamarApi('/businesses', { method: 'POST', body: JSON.stringify(dados) }),

  listarSolicitacoesMei: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return chamarApi(`/mei${query ? '?' + query : ''}`);
  },
  buscarSolicitacaoMei: (id) => chamarApi(`/mei/${id}`),
  consultarStatusMei: (params) => {
    const query = new URLSearchParams(params).toString();
    return chamarApi(`/mei/consulta/status?${query}`);
  },
  atualizarStatusMei: (id, status) => chamarApi(`/mei/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  comentarMei: (id, comentario, autor) => chamarApi(`/mei/${id}/comments`, { method: 'POST', body: JSON.stringify({ comentario, autor }) }),

  enviarSugestao: (dados) => chamarApi('/suggestions', { method: 'POST', body: JSON.stringify(dados) }),
  listarSugestoes: () => chamarApi('/suggestions'),
  atualizarStatusSugestao: (id, status) => chamarApi(`/suggestions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
};
