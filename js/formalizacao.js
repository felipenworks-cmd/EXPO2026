// ============================================================
// formalizacao.js — consulta pública do status de uma solicitação MEI
// ============================================================

formatarCpfInput(document.getElementById('campo-cpf'));

// As 6 etapas do fluxo visual (item 6 do briefing) e a qual status
// de banco cada uma corresponde.
const ETAPAS_FLUXO = [
  { titulo: 'Cadastro recebido', statusCorrespondente: ['Recebido'] },
  { titulo: 'Análise inicial', statusCorrespondente: ['Em análise'] },
  { titulo: 'Conferência das informações', statusCorrespondente: ['Aguardando informações'] },
  { titulo: 'Orientação jurídica', statusCorrespondente: ['Em processamento'] },
  { titulo: 'Formalização', statusCorrespondente: ['Em processamento'] },
  { titulo: 'Concluído', statusCorrespondente: ['Concluído'] }
];

const MENSAGENS_STATUS = {
  'Recebido': 'Seu cadastro foi recebido. Nossa equipe está verificando as informações fornecidas.',
  'Em análise': 'Sua solicitação está em análise inicial pela nossa equipe.',
  'Aguardando informações': 'Precisamos confirmar algumas informações com você. Veja os comentários abaixo.',
  'Em processamento': 'Sua solicitação está sendo orientada juridicamente para a formalização.',
  'Concluído': 'Parabéns! Sua formalização foi concluída pelo acompanhamento da plataforma.'
};

function indiceEtapaAtual(status) {
  // Retorna o índice (0 a 5) da etapa em destaque no fluxo visual
  const idx = ETAPAS_FLUXO.findIndex((e) => e.statusCorrespondente.includes(status));
  return idx === -1 ? 0 : idx;
}

function renderizarFluxo(status) {
  const atual = indiceEtapaAtual(status);
  return `
    <div class="fluxo-mei">
      ${ETAPAS_FLUXO.map((etapa, i) => `
        <div class="fluxo-etapa ${i < atual ? 'concluida' : ''} ${i === atual ? 'atual' : ''}">
          <div class="circulo">${i < atual ? '✓' : i + 1}</div>
          ${escaparHtml(etapa.titulo)}
        </div>
      `).join('')}
    </div>
  `;
}

function renderizarResultado(app) {
  const badgeClasse = app.status === 'Concluído' ? 'badge-sucesso'
    : app.status === 'Aguardando informações' ? 'badge-alerta' : 'badge';

  const comentarios = (app.comentarios || []).map((c) => `
    <div class="comentario">
      <div class="meta">${escaparHtml(c.autor)} · ${formatarData(c.created_at)}</div>
      ${escaparHtml(c.comentario)}
    </div>
  `).join('') || '<p class="texto-suave">Nenhum comentário registrado ainda.</p>';

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <h3 class="mt-0">Solicitação #${app.id}</h3>
          <p class="texto-suave">Empreendedor: ${escaparHtml(app.empreendedor)}${app.negocio_nome ? ' · Negócio: ' + escaparHtml(app.negocio_nome) : ''}</p>
        </div>
        <span class="badge ${badgeClasse}">${escaparHtml(app.status)}</span>
      </div>

      ${renderizarFluxo(app.status)}

      <div class="alerta alerta-info">${escaparHtml(MENSAGENS_STATUS[app.status] || '')}</div>

      <h4>Comentários da equipe de assistência</h4>
      ${comentarios}
    </div>
  `;
}

document.getElementById('btn-consultar').addEventListener('click', async () => {
  const protocolo = document.getElementById('campo-protocolo').value.trim();
  const cpf = document.getElementById('campo-cpf').value.trim();
  const areaResultado = document.getElementById('resultado-consulta');

  if (!protocolo && !cpf) {
    areaResultado.innerHTML = '<div class="alerta alerta-erro">Informe o número do protocolo ou o CPF para consultar.</div>';
    return;
  }

  areaResultado.innerHTML = '<p class="texto-suave">Consultando...</p>';

  try {
    const params = protocolo ? { id: protocolo } : { cpf };
    const app = await Api.consultarStatusMei(params);
    areaResultado.innerHTML = renderizarResultado(app);
  } catch (err) {
    areaResultado.innerHTML = `<div class="alerta alerta-erro">${escaparHtml(err.message)}</div>`;
  }
});
